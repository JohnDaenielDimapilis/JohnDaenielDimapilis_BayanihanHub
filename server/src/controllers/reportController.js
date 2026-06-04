import Achievement from "../models/Achievement.js";
import Donation from "../models/Donation.js";
import Event from "../models/Event.js";
import Feedback from "../models/Feedback.js";
import Fundraiser from "../models/Fundraiser.js";
import Participant from "../models/Participant.js";
import User from "../models/User.js";

function countByStatus(records, status) {
  return records.filter((record) => record.status === status).length;
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
  const present = participants.filter((item) => item.attendanceStatus === "Present" || item.attendanceStatus === "Verified").length;
  const absent = participants.filter((item) => item.attendanceStatus === "Absent" || item.attendanceStatus === "No-show").length;
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
        totalUsers,
        events,
        participants,
        fundraisers,
        donations,
        feedbackRecords,
        totalAchievements
      ] = await Promise.all([
        User.countDocuments(),
      Event.find({}).select("status actualBeneficiariesServed postEventReport"),
        Participant.find({}).select("attendanceStatus participationStatus"),
        Fundraiser.find({}).select("status"),
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
        users: totalUsers,
        participants: participants.length,
        feedback: { count: feedbackRecords.length, avgRating },
        events: toChartRows(groupBy(events, "status")),
        donations: toAmountRows(groupAmountsBy(donations.filter((item) => item.donationStatus === "Verified"), "donationType")),
        donationStatus: toChartRows(groupBy(donations, "donationStatus")),
        fundraisers: toChartRows(groupBy(fundraisers, "status")),
        totalUsers,
        totalEvents: events.length,
        pendingEvents: countByStatus(events, "Pending Review"),
        approvedEvents: countByStatus(events, "Approved"),
        rejectedEvents: countByStatus(events, "Rejected"),
        completedEvents: countByStatus(events, "Completed"),
        cancelledEvents: countByStatus(events, "Cancelled"),
        totalParticipants: participants.length,
        totalFundraisers: fundraisers.length,
        pendingFundraisers: countByStatus(fundraisers, "Pending"),
        approvedFundraisers: countByStatus(fundraisers, "Approved"),
        rejectedFundraisers: countByStatus(fundraisers, "Rejected"),
        closedFundraisers: countByStatus(fundraisers, "Closed"),
        totalDonations: donations.length,
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
      Participant.find({ eventId: { $in: eventIds } }).select("attendanceStatus participationStatus"),
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
      completedEvents: countByStatus(staffEvents, "Completed"),
      cancelledEvents: countByStatus(staffEvents, "Cancelled"),
      totalParticipants: participants.length,
      totalFundraisers: staffFundraisers.length,
      pendingFundraisers: countByStatus(staffFundraisers, "Pending"),
      approvedFundraisers: countByStatus(staffFundraisers, "Approved"),
      rejectedFundraisers: countByStatus(staffFundraisers, "Rejected"),
      closedFundraisers: countByStatus(staffFundraisers, "Closed"),
      totalDonations: donations.length,
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
