import Achievement from "../models/Achievement.js";
import Donation from "../models/Donation.js";
import Event from "../models/Event.js";
import Feedback from "../models/Feedback.js";
import Fundraiser from "../models/Fundraiser.js";
import Participant from "../models/Participant.js";
import User from "../models/User.js";
import mongoose from "mongoose";

function dateFilterFromQuery(query, field = "createdAt") {
  const filter = {};
  const now = new Date();
  let start;
  let end;

  if (query.startDate) start = new Date(query.startDate);
  if (query.endDate) {
    end = new Date(query.endDate);
    end.setHours(23, 59, 59, 999);
  }
  if (!start && query.day) {
    start = new Date(query.day);
    end = new Date(query.day);
    end.setHours(23, 59, 59, 999);
  }
  if (!start && query.week) {
    start = new Date(query.week);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }
  if (!start && query.month) {
    const [year, month] = String(query.month).split("-").map(Number);
    if (year && month) {
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59, 999);
    }
  }
  if (!start && query.year) {
    start = new Date(Number(query.year), 0, 1);
    end = new Date(Number(query.year), 11, 31, 23, 59, 59, 999);
  }
  if (!start && query.period === "today") {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  }

  if (start || end) {
    filter[field] = {};
    if (start && !Number.isNaN(start.getTime())) filter[field].$gte = start;
    if (end && !Number.isNaN(end.getTime())) filter[field].$lte = end;
  }

  return filter;
}

function creatorFilter(req) {
  return req.user.role === "Staff" ? { createdBy: req.user._id } : {};
}

function textMatch(value) {
  return value ? new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
}

async function applyCreatorQuery(filter, query, req) {
  if (!query.creator || req.user.role !== "Admin") return;
  if (mongoose.Types.ObjectId.isValid(String(query.creator))) {
    filter.createdBy = query.creator;
    return;
  }
  const search = textMatch(query.creator);
  const creators = await User.find({ $or: [{ name: search }, { email: search }] }).select("_id");
  filter.createdBy = { $in: creators.map((creator) => creator._id) };
}

function countByStatus(records, status) {
  return records.filter((record) => record.status === status).length;
}

function activeUserFilter() {
  return { isActive: { $ne: false }, accountStatus: "Active" };
}

function groupBy(records, key) {
  return records.reduce((groups, record) => {
    const value = record[key] || "Unspecified";
    groups[value] = (groups[value] || 0) + 1;
    return groups;
  }, {});
}

function groupAmountsBy(records, key) {
  return records.reduce((groups, record) => {
    const value = record[key] || "Unspecified";
    groups[value] = (groups[value] || 0) + Number(record.amount || 0);
    return groups;
  }, {});
}

function toChartRows(groups) {
  return Object.entries(groups).map(([_id, count]) => ({ _id, count }));
}

function toAmountRows(groups) {
  return Object.entries(groups).map(([_id, total]) => ({ _id, total }));
}

function buildQualityMetrics({ participants, donations, feedbackCount, beneficiariesServed }) {
  const present = participants.filter((item) => item.attendanceStatus === "Present").length;
  const absent = participants.filter((item) => item.attendanceStatus === "Absent").length;
  const verifiedDonations = donations.filter((item) => item.donationStatus === "Verified");
  const pendingDonations = donations.filter((item) => ["Pending", "Submitted", "Under Review"].includes(item.donationStatus));

  return {
    attendanceRate: participants.length ? Math.round((present / participants.length) * 100) : 0,
    noShowRate: participants.length ? Math.round((absent / participants.length) * 100) : 0,
    verifiedDonationAmount: verifiedDonations.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    verifiedDonationCount: verifiedDonations.length,
    pendingDonationCount: pendingDonations.length,
    feedbackCount,
    beneficiariesServed,
    targets: {
      dashboardLoadTime: "3 seconds under normal load",
      protectedRouteRejection: "100% of protected routes reject unauthenticated access",
      accessibility: "Keyboard-accessible forms, visible labels, and screen-reader-readable errors",
      usability: "80% of test users complete login, join, donate, and feedback tasks without assistance",
      availability: "99% target during foundation operating hours"
    }
  };
}

export async function getReports(req, res) {
  try {
    if (req.user.role === "Admin") {
      const [
        activeUsers,
        events,
        participants,
        fundraisers,
        donations,
        feedbackRecords,
        totalAchievements
      ] = await Promise.all([
        User.countDocuments(activeUserFilter()),
        Event.find({}).select("status actualBeneficiariesServed postEventReport"),
        Participant.find({ participationStatus: { $ne: "Cancelled" } }).select("attendanceStatus participationStatus"),
        Fundraiser.find({ status: { $ne: "Rejected" } }).select("status"),
        Donation.find({}).select("amount donationType donationStatus"),
        Feedback.find({}).select("rating"),
        Achievement.countDocuments()
      ]);

      const totalDonationAmount = donations
        .filter((donation) => donation.donationStatus === "Verified")
        .reduce((sum, donation) => sum + donation.amount, 0);
      const beneficiariesServed = events.reduce((sum, event) => (
        sum + Number(event.postEventReport?.actualBeneficiariesServed ?? event.actualBeneficiariesServed ?? 0)
      ), 0);
      const avgRating = feedbackRecords.length
        ? feedbackRecords.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedbackRecords.length
        : 0;

      return res.status(200).json({
        users: activeUsers,
        participants: participants.length,
        feedback: { count: feedbackRecords.length, avgRating },
        events: toChartRows(groupBy(events, "status")),
        donations: toAmountRows(groupAmountsBy(donations.filter((item) => item.donationStatus === "Verified"), "donationType")),
        donationStatus: toChartRows(groupBy(donations, "donationStatus")),
        fundraisers: toChartRows(groupBy(fundraisers, "status")),
        totalUsers: activeUsers,
        totalEvents: events.length,
        pendingEvents: countByStatus(events, "Pending Review"),
        approvedEvents: countByStatus(events, "Approved"),
        rejectedEvents: countByStatus(events, "Rejected"),
        finishedEvents: countByStatus(events, "Finished"),
        cancelledEvents: countByStatus(events, "Cancelled"),
        totalParticipants: participants.length,
        totalFundraisers: fundraisers.length,
        pendingFundraisers: countByStatus(fundraisers, "Pending"),
        approvedFundraisers: countByStatus(fundraisers, "Approved"),
        rejectedFundraisers: countByStatus(fundraisers, "Rejected"),
        closedFundraisers: countByStatus(fundraisers, "Closed"),
        totalDonations: donations.filter((item) => item.donationStatus === "Verified").length,
        totalDonationAmount,
        verifiedDonations: donations.filter((item) => item.donationStatus === "Verified").length,
        pendingDonations: donations.filter((item) => ["Pending", "Submitted", "Under Review"].includes(item.donationStatus)).length,
        rejectedDonations: donations.filter((item) => item.donationStatus === "Rejected").length,
        totalFeedback: feedbackRecords.length,
        totalAchievements,
        beneficiariesServed,
        qualityMetrics: buildQualityMetrics({
          participants,
          donations,
          feedbackCount: feedbackRecords.length,
          beneficiariesServed
        })
      });
    }

    const staffEvents = await Event.find({ createdBy: req.user._id }).select("_id status actualBeneficiariesServed postEventReport");
    const staffFundraisers = await Fundraiser.find({ createdBy: req.user._id }).select("_id status");
    const eventIds = staffEvents.map((event) => event._id);
    const fundraiserIds = staffFundraisers.map((fundraiser) => fundraiser._id);

    const [participants, donations, feedbackRecords] = await Promise.all([
      Participant.find({ eventId: { $in: eventIds }, participationStatus: { $ne: "Cancelled" } }).select("attendanceStatus participationStatus"),
      Donation.find({ fundraiserId: { $in: fundraiserIds } }).select("amount donationType donationStatus"),
      Feedback.find({ eventId: { $in: eventIds } }).select("rating")
    ]);

    const totalDonationAmount = donations
      .filter((donation) => donation.donationStatus === "Verified")
      .reduce((sum, donation) => sum + donation.amount, 0);
    const avgRating = feedbackRecords.length
      ? feedbackRecords.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedbackRecords.length
      : 0;

    res.status(200).json({
      users: 0,
      participants: participants.length,
      feedback: { count: feedbackRecords.length, avgRating },
      events: toChartRows(groupBy(staffEvents, "status")),
      donations: toAmountRows(groupAmountsBy(donations.filter((item) => item.donationStatus === "Verified"), "donationType")),
      donationStatus: toChartRows(groupBy(donations, "donationStatus")),
      fundraisers: toChartRows(groupBy(staffFundraisers, "status")),
      totalEvents: staffEvents.length,
      pendingEvents: countByStatus(staffEvents, "Pending Review"),
      approvedEvents: countByStatus(staffEvents, "Approved"),
      rejectedEvents: countByStatus(staffEvents, "Rejected"),
      finishedEvents: countByStatus(staffEvents, "Finished"),
      cancelledEvents: countByStatus(staffEvents, "Cancelled"),
      totalParticipants: participants.length,
      totalFundraisers: staffFundraisers.length,
      pendingFundraisers: countByStatus(staffFundraisers, "Pending"),
      approvedFundraisers: countByStatus(staffFundraisers, "Approved"),
      rejectedFundraisers: countByStatus(staffFundraisers, "Rejected"),
      closedFundraisers: countByStatus(staffFundraisers, "Closed"),
      totalDonations: donations.filter((item) => item.donationStatus === "Verified").length,
      totalDonationAmount,
      verifiedDonations: donations.filter((item) => item.donationStatus === "Verified").length,
      pendingDonations: donations.filter((item) => ["Pending", "Submitted", "Under Review"].includes(item.donationStatus)).length,
      rejectedDonations: donations.filter((item) => item.donationStatus === "Rejected").length,
      totalFeedback: feedbackRecords.length,
      qualityMetrics: buildQualityMetrics({
        participants,
        donations,
        feedbackCount: feedbackRecords.length,
        beneficiariesServed: staffEvents.reduce((sum, event) => (
          sum + Number(event.postEventReport?.actualBeneficiariesServed ?? event.actualBeneficiariesServed ?? 0)
        ), 0)
      })
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate reports.", error: error.message });
  }
}

export async function getEventReport(req, res) {
  try {
    const filter = { ...creatorFilter(req), ...dateFilterFromQuery(req.query, "date") };
    if (req.query.status) filter.status = req.query.status;
    else filter.status = { $ne: "Cancelled" };
    await applyCreatorQuery(filter, req.query, req);
    if (req.query.search) filter.title = textMatch(req.query.search);
    const records = await Event.find(filter).populate("createdBy", "name email role").sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to load event report.", error: error.message });
  }
}

export async function getParticipantReport(req, res) {
  try {
    const eventFilter = creatorFilter(req);
    await applyCreatorQuery(eventFilter, req.query, req);
    if (req.query.eventName) eventFilter.title = textMatch(req.query.eventName);
    const eventIds = Object.keys(eventFilter).length
      ? (await Event.find(eventFilter).select("_id")).map((event) => event._id)
      : null;

    const filter = { ...dateFilterFromQuery(req.query, "joinedAt") };
    if (eventIds) filter.eventId = { $in: eventIds };
    if (req.query.attendanceStatus) filter.attendanceStatus = req.query.attendanceStatus;
    if (req.query.participationStatus) filter.participationStatus = req.query.participationStatus;
    else filter.participationStatus = { $ne: "Cancelled" };

    const records = await Participant.find(filter)
      .populate("userId", "name email role")
      .populate("eventId", "title date location status createdBy")
      .sort({ joinedAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to load participant report.", error: error.message });
  }
}

export async function getDonationReport(req, res) {
  try {
    const fundraiserFilter = creatorFilter(req);
    await applyCreatorQuery(fundraiserFilter, req.query, req);
    if (req.query.fundraiserName || req.query.search) fundraiserFilter.title = textMatch(req.query.fundraiserName || req.query.search);
    const fundraiserIds = Object.keys(fundraiserFilter).length
      ? (await Fundraiser.find(fundraiserFilter).select("_id")).map((fundraiser) => fundraiser._id)
      : null;

    const filter = { ...dateFilterFromQuery(req.query, "donationDate") };
    if (fundraiserIds) filter.fundraiserId = { $in: fundraiserIds };
    if (req.query.status) filter.donationStatus = req.query.status;
    else filter.donationStatus = "Verified";

    let records = await Donation.find(filter)
      .populate("donor", "name email role")
      .populate("fundraiserId", "title purpose status createdBy")
      .sort({ donationDate: -1 });
    if (req.query.donorName) {
      const search = String(req.query.donorName).toLowerCase();
      records = records.filter((donation) => donation.donor?.name?.toLowerCase().includes(search));
    }
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to load donation report.", error: error.message });
  }
}

export async function getFundraiserReport(req, res) {
  try {
    const filter = { ...creatorFilter(req), ...dateFilterFromQuery(req.query, "createdAt") };
    if (req.query.status) filter.status = req.query.status;
    else filter.status = { $ne: "Rejected" };
    await applyCreatorQuery(filter, req.query, req);
    if (req.query.search) filter.title = textMatch(req.query.search);
    if (req.query.minTarget || req.query.maxTarget) {
      filter.targetAmount = {};
      if (req.query.minTarget) filter.targetAmount.$gte = Number(req.query.minTarget);
      if (req.query.maxTarget) filter.targetAmount.$lte = Number(req.query.maxTarget);
    }
    const records = await Fundraiser.find(filter).populate("createdBy", "name email role").sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to load fundraiser report.", error: error.message });
  }
}

export async function getFeedbackReport(req, res) {
  try {
    const eventFilter = creatorFilter(req);
    await applyCreatorQuery(eventFilter, req.query, req);
    if (req.query.eventName) eventFilter.title = textMatch(req.query.eventName);
    eventFilter.status = { $ne: "Cancelled" };
    const eventIds = Object.keys(eventFilter).length
      ? (await Event.find(eventFilter).select("_id")).map((event) => event._id)
      : null;

    const filter = { ...dateFilterFromQuery(req.query, "createdAt") };
    if (eventIds) filter.eventId = { $in: eventIds };
    if (req.query.rating) filter.rating = Number(req.query.rating);
    const records = await Feedback.find(filter)
      .populate("userId", "name email role")
      .populate({
        path: "eventId",
        select: "title date status createdBy",
        populate: { path: "createdBy", select: "name email role" }
      })
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to load feedback report.", error: error.message });
  }
}

export async function getUserReport(req, res) {
  try {
    const filter = { ...dateFilterFromQuery(req.query, "createdAt") };

    if (req.user.role === "Staff") {
      filter.role = "User";
    } else if (["User", "Staff", "Admin"].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    if (req.query.status === "Active") {
      Object.assign(filter, activeUserFilter());
    } else if (req.query.status === "Temporarily Banned") {
      filter.accountStatus = "Temporarily Banned";
    } else if (req.query.status === "Disabled") {
      filter.$or = [{ accountStatus: "Disabled" }, { isActive: false }];
    } else {
      Object.assign(filter, activeUserFilter());
    }

    if (req.query.search) {
      const search = textMatch(req.query.search);
      filter.$and = [
        ...(filter.$and || []),
        { $or: [{ name: search }, { email: search }] }
      ];
    }

    const records = await User.find(filter)
      .select("-password")
      .populate("bannedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Failed to load user report.", error: error.message });
  }
}

export async function exportReport(req, res) {
  try {
    const type = req.query.type || "events";
    const response = {
      events: getEventReport,
      participants: getParticipantReport,
      donations: getDonationReport,
      fundraisers: getFundraiserReport,
      feedback: getFeedbackReport,
      users: getUserReport
    }[type];
    if (!response) return res.status(400).json({ message: "Unknown report type." });
    return response(req, res);
  } catch (error) {
    res.status(500).json({ message: "Report export failed.", error: error.message });
  }
}
