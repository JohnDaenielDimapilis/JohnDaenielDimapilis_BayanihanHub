import { randomBytes } from "crypto";
import Event from "../models/Event.js";
import Feedback from "../models/Feedback.js";
import Participant from "../models/Participant.js";
import User from "../models/User.js";
import {
  getMissingEventFields,
  USER_VISIBLE_EVENT_STATUSES,
  validateEventSchedule
} from "../utils/eventWorkflow.js";
import { createLog } from "./logController.js";
import { createNotification, createNotifications } from "./notificationController.js";
import { updateUserAchievement } from "./achievementController.js";

const EVENT_FIELDS = [
  "title",
  "eventType",
  "type",
  "description",
  "objectives",
  "date",
  "time",
  "startDateTime",
  "endDateTime",
  "durationType",
  "location",
  "participantLimit",
  "targetBeneficiaries",
  "requiredResources",
  "registrationStartDate",
  "registrationEndDate",
  "waitlistEnabled",
  "capacityRule",
  "eventImages"
];

function eventTitle(event) {
  return event.title || "Untitled event";
}

function isPastEventDate(event) {
  const dateSource = event.endDateTime || event.date;
  if (!dateSource) return false;
  const eventDate = new Date(dateSource);
  if (Number.isNaN(eventDate.getTime())) return false;
  eventDate.setHours(23, 59, 59, 999);
  return eventDate < new Date();
}

async function refreshEventStatus(event) {
  if (event.status === "Completed") {
    event.status = "Finished";
    await event.save();
  }

  if (isPastEventDate(event) && ["Open for Registration", "Full", "Closed"].includes(event.status)) {
    event.status = "Finished";
    event.completedAt = event.completedAt || new Date();
    await event.save();
  }

  return event;
}

async function enrichEvents(events) {
  const enriched = [];
  for (const event of events) {
    await refreshEventStatus(event);
    const [joinedCount, waitlistCount, feedback] = await Promise.all([
      Participant.countDocuments({ eventId: event._id, participationStatus: "Joined" }),
      Participant.countDocuments({ eventId: event._id, participationStatus: "Waitlisted" }),
      Feedback.find({ eventId: event._id })
        .populate("userId", "name showAchievementBadge")
        .sort({ createdAt: -1 })
    ]);
    const feedbackReviews = feedback.map((item) => item.toObject());
    enriched.push({
      ...event.toObject(),
      joinedCount,
      waitlistCount,
      feedbackReviews,
      reviewImages: feedbackReviews.flatMap((item) => item.reviewImages || []),
      capacityDisplay: `${joinedCount}/${event.participantLimit || 0}`,
      userDisplayStatus: event.status === "Finished" ? "Finished" : event.status
    });
  }
  return enriched;
}

function applyEventFields(event, body) {
  EVENT_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      if (field === "eventImages") {
        event.eventImages = normalizeEventImages(body.eventImages, body.uploadedBy);
      } else {
        event[field === "type" ? "eventType" : field] = body[field];
      }
    }
  });
  if (event.startDateTime) {
    const start = new Date(event.startDateTime);
    if (!Number.isNaN(start.getTime())) {
      event.date = start;
      event.time = event.time || start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
  }
}

function normalizeEventImages(images = [], uploadedBy) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((image) => image?.imageUrl)
    .map((image) => ({
      imageUrl: String(image.imageUrl).trim(),
      imageType: image.imageType || "Documentation",
      caption: image.caption || "",
      uploadedBy: image.uploadedBy || uploadedBy,
      uploadedAt: image.uploadedAt || new Date()
    }));
}

function getSubmissionError(event) {
  const missing = getMissingEventFields(event);
  if (missing.length) {
    return `Missing required fields before submission: ${missing.join(", ")}.`;
  }

  const scheduleError = validateEventSchedule(event);
  if (scheduleError) return scheduleError;

  return null;
}

function isOwnStaffEvent(req, event) {
  if (req.user.role === "Admin") return true;
  return event.createdBy?.toString() === req.user._id.toString();
}

function ensureStaffOwnsEvent(req, event, res) {
  if (!isOwnStaffEvent(req, event)) {
    res.status(403).json({ message: "Staff can only manage their own events." });
    return false;
  }
  return true;
}

function canViewEventQr(req, event) {
  if (req.user.role === "Admin" || req.user.role === "Staff") return true;
  return event.createdBy?.toString() === req.user._id.toString();
}

async function logEventChange(req, event, action, oldStatus, extra = {}) {
  await createLog({
    userId: req.user._id,
    role: req.user.role,
    action,
    module: "Event",
    status: "Success",
    details: {
      recordId: event._id,
      recordOwner: event.createdBy,
      oldValue: oldStatus ? { status: oldStatus } : undefined,
      newValue: { status: event.status, progressPercentage: event.progressPercentage, title: event.title },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      ...extra
    }
  });
}

async function notifyEventReviewers(event, title, message) {
  const creator = await User.findById(event.createdBy).select("role");
  const roles = creator?.role === "User" ? ["Admin", "Staff"] : ["Admin"];
  const reviewers = await User.find({ role: { $in: roles }, isActive: { $ne: false } }).select("_id");
  return createNotifications(reviewers.map((reviewer) => ({
    userId: reviewer._id,
    title,
    message,
    type: "Event",
    relatedRecordId: event._id
  })));
}

async function notifyVisibleUsers(title, message, eventId) {
  const users = await User.find({ role: "User", isActive: { $ne: false } }).select("_id");
  return createNotifications(users.map((user) => ({
    userId: user._id,
    title,
    message,
    type: "Event",
    relatedRecordId: eventId
  })));
}

async function notifyCreator(event, title, message) {
  return createNotification({
    userId: event.createdBy,
    title,
    message,
    type: "Event",
    relatedRecordId: event._id
  });
}

async function ensureCanReviewEvent(req, event, res) {
  if (req.user.role === "Admin") return true;
  const creatorId = event.createdBy?._id || event.createdBy;
  const creator = await User.findById(creatorId).select("role");
  if (creator?.role !== "User") {
    res.status(403).json({ message: "Staff can review only user-created event proposals." });
    return false;
  }
  return true;
}

async function ensureCanCorrectEvent(req, event, res) {
  if (isOwnStaffEvent(req, event)) return true;
  if (req.user.role === "Staff") {
    const creatorId = event.createdBy?._id || event.createdBy;
    const creator = await User.findById(creatorId).select("role");
    if (creator?.role === "User") return true;
  }
  res.status(403).json({ message: "Staff can only correct their own events or user-created proposals." });
  return false;
}

export async function createEvent(req, res) {
  try {
    const event = new Event({
      createdBy: req.user._id,
      status: req.body.submitForReview ? "Pending Review" : "Draft"
    });
    req.body.uploadedBy = req.user._id;
    applyEventFields(event, req.body);

    if (req.body.submitForReview) {
      const error = getSubmissionError(event);
      if (error) return res.status(400).json({ message: error });
    }

    await event.save();

    await logEventChange(
      req,
      event,
      req.body.submitForReview ? "Event Submitted for Review" : "Event Draft Saved",
      null
    );

    if (event.status === "Pending Review") {
      await notifyEventReviewers(
        event,
        "Event pending review",
        `${req.user.name} submitted "${eventTitle(event)}" for review.`
      );
    }

    res.status(201).json({
      message: event.status === "Pending Review" ? "Event submitted for review." : "Event saved as draft.",
      event
    });
  } catch (error) {
    res.status(500).json({ message: "Event creation failed.", error: error.message });
  }
}

export async function publicEvents(req, res) {
  try {
    const events = await Event.find({ status: { $in: USER_VISIBLE_EVENT_STATUSES } })
      .populate("createdBy", "name email role")
      .sort({ date: 1 });

    res.status(200).json(await enrichEvents(events));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch public events.", error: error.message });
  }
}

export async function getEvents(req, res) {
  try {
    const filter = req.user.role === "User"
      ? {
          $or: [
            { status: { $in: USER_VISIBLE_EVENT_STATUSES } },
            { createdBy: req.user._id }
          ]
        }
      : {};

    const events = await Event.find(filter)
      .populate("createdBy", "name email role")
      .populate("approvedBy", "name email role")
      .populate("revisionRequestedBy", "name email role")
      .sort({ date: 1, createdAt: -1 });

    res.status(200).json(await enrichEvents(events));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events.", error: error.message });
  }
}

export async function getEventById(req, res) {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === "User") {
      filter.$or = [
        { status: { $in: USER_VISIBLE_EVENT_STATUSES } },
        { createdBy: req.user._id }
      ];
    }

    const event = await Event.findOne(filter)
      .populate("createdBy", "name email role")
      .populate("approvedBy", "name email role")
      .populate("revisionRequestedBy", "name email role");

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const [enriched] = await enrichEvents([event]);
    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event.", error: error.message });
  }
}

export async function updateEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!(await ensureCanCorrectEvent(req, event, res))) return;

    const editableStatuses = ["Draft", "Pending Review", "Rejected", "Approved"];
    if (!editableStatuses.includes(event.status)) {
      return res.status(400).json({ message: `Events in ${event.status} status cannot be edited.` });
    }

    const oldStatus = event.status;
    req.body.uploadedBy = req.user._id;
    applyEventFields(event, req.body);

    if (req.body.submitForReview) {
      const error = getSubmissionError(event);
      if (error) return res.status(400).json({ message: error });
      event.status = "Pending Review";
      event.revisionRemarks = undefined;
      event.revisionRequestedBy = undefined;
      event.revisionRequestedAt = undefined;
    } else if (oldStatus === "Rejected") {
      event.status = "Draft";
    }

    await event.save();
    await logEventChange(req, event, "Event Updated", oldStatus);

    if (event.status === "Pending Review" && oldStatus !== "Pending Review") {
      await notifyEventReviewers(
        event,
        "Event pending review",
        `${req.user.name} submitted updates to "${eventTitle(event)}".`
      );
    }

    res.status(200).json({
      message: event.status === "Pending Review" ? "Event updated and submitted for review." : "Event updated.",
      event
    });
  } catch (error) {
    res.status(500).json({ message: "Event update failed.", error: error.message });
  }
}

export async function updateEventProgress(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!ensureStaffOwnsEvent(req, event, res)) return;

    const percentage = Math.max(0, Math.min(100, Number(req.body.percentage)));
    if (Number.isNaN(percentage)) {
      return res.status(400).json({ message: "A valid progress percentage is required." });
    }

    const oldStatus = event.status;
    event.progressPercentage = percentage;
    event.progressUpdates.push({
      percentage,
      note: req.body.note || "",
      updatedBy: req.user._id,
      updatedAt: new Date()
    });
    await event.save();

    await logEventChange(req, event, "Event Progress Updated", oldStatus, {
      note: req.body.note || "",
      newValue: { progressPercentage: event.progressPercentage }
    });

    await notifyCreator(
      event,
      "Event progress updated",
      `"${eventTitle(event)}" is now ${event.progressPercentage}% complete.`
    );

    res.status(200).json({ message: "Event progress updated.", event });
  } catch (error) {
    res.status(500).json({ message: "Event progress update failed.", error: error.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!ensureStaffOwnsEvent(req, event, res)) return;

    if (!["Draft", "Rejected", "Archived"].includes(event.status)) {
      return res.status(400).json({ message: "Only draft, rejected, or archived events can be deleted." });
    }

    await event.deleteOne();
    await logEventChange(req, event, "Event Deleted", event.status);
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Event deletion failed.", error: error.message });
  }
}

export async function submitEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (!ensureStaffOwnsEvent(req, event, res)) return;

    if (!["Draft", "Rejected", "Pending Review"].includes(event.status)) {
      return res.status(400).json({ message: `Cannot submit an event from ${event.status} status.` });
    }

    req.body.uploadedBy = req.user._id;
    applyEventFields(event, req.body);
    const error = getSubmissionError(event);
    if (error) return res.status(400).json({ message: error });

    const oldStatus = event.status;
    event.status = "Pending Review";
    event.revisionRemarks = undefined;
    event.revisionRequestedBy = undefined;
    event.revisionRequestedAt = undefined;
    await event.save();

    await logEventChange(req, event, "Event Submitted for Review", oldStatus);
    await notifyEventReviewers(
      event,
      "Event pending review",
      `${req.user.name} submitted "${eventTitle(event)}" for review.`
    );

    res.status(200).json({ message: "Event submitted for review.", event });
  } catch (error) {
    res.status(500).json({ message: "Event submission failed.", error: error.message });
  }
}

export async function approveEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (event.status !== "Pending Review") {
      return res.status(400).json({ message: "Only events pending review can be approved." });
    }
    if (!(await ensureCanReviewEvent(req, event, res))) return;

    const criteria = req.body.approvalCriteria || {};
    const approvalCriteria = {
      goalAligned: Boolean(criteria.goalAligned ?? criteria.purposeAligned),
      dateValid: Boolean(criteria.dateValid ?? criteria.scheduleValid),
      resourcesAvailable: Boolean(criteria.resourcesAvailable ?? true),
      capacityReasonable: Boolean(criteria.capacityReasonable ?? criteria.capacityValid)
    };

    if (!approvalCriteria.goalAligned || !approvalCriteria.dateValid || !approvalCriteria.capacityReasonable) {
      return res.status(400).json({
        message: "Approval requires complete information, aligned purpose, and valid schedule/capacity."
      });
    }

    const oldStatus = event.status;
    event.status = "Approved";
    event.approvedBy = req.user._id;
    event.approvedAt = new Date();
    event.approvalCriteria = approvalCriteria;
    event.approvalRemarks = req.body.approvalRemarks || "";
    await event.save();

    await logEventChange(req, event, "Event Approved", oldStatus, {
      approvalCriteria,
      remarks: event.approvalRemarks
    });
    await notifyCreator(
      event,
      "Event approved",
      `"${eventTitle(event)}" was approved. Open registration when you are ready.`
    );

    res.status(200).json({
      message: "Event approved successfully.",
      event
    });
  } catch (error) {
    res.status(500).json({ message: "Event approval failed.", error: error.message });
  }
}

export async function requestRevisionEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) return res.status(404).json({ message: "Event not found." });
    if (event.status !== "Pending Review") {
      return res.status(400).json({ message: "Only pending review events can receive revision requests." });
    }
    if (!(await ensureCanReviewEvent(req, event, res))) return;
    if (!req.body.revisionRemarks) {
      return res.status(400).json({ message: "Revision remarks are required." });
    }

    const oldStatus = event.status;
    event.status = "Draft";
    event.revisionRemarks = req.body.revisionRemarks;
    event.revisionRequestedBy = req.user._id;
    event.revisionRequestedAt = new Date();
    await event.save();

    await logEventChange(req, event, "Event Revision Requested", oldStatus, {
      reason: event.revisionRemarks
    });
    await notifyCreator(
      event,
      "Event needs revision",
      `"${eventTitle(event)}" was returned for revision: ${event.revisionRemarks}`
    );

    res.status(200).json({ message: "Revision request sent.", event });
  } catch (error) {
    res.status(500).json({ message: "Revision request failed.", error: error.message });
  }
}

export async function rejectEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!["Pending Review", "Approved"].includes(event.status)) {
      return res.status(400).json({ message: "Only pending or approved events can be rejected." });
    }
    if (!(await ensureCanReviewEvent(req, event, res))) return;

    if (!req.body.rejectionReason) {
      return res.status(400).json({ message: "A rejection reason is required for the approval trail." });
    }

    const oldStatus = event.status;
    event.status = "Rejected";
    event.rejectedBy = req.user._id;
    event.rejectedAt = new Date();
    event.rejectionReason = req.body.rejectionReason;
    await event.save();

    await logEventChange(req, event, "Event Rejected", oldStatus, {
      rejectionReason: event.rejectionReason
    });
    await notifyCreator(
      event,
      "Event rejected",
      `"${eventTitle(event)}" was rejected: ${event.rejectionReason}`
    );

    res.status(200).json({
      message: "Event rejected successfully.",
      event
    });
  } catch (error) {
    res.status(500).json({ message: "Event rejection failed.", error: error.message });
  }
}

export async function openRegistrationEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (!ensureStaffOwnsEvent(req, event, res)) return;
    if (event.status !== "Approved") {
      return res.status(400).json({ message: "Only approved events can be opened for registration." });
    }

    const oldStatus = event.status;
    event.status = "Open for Registration";
    await event.save();

    await logEventChange(req, event, "Event Registration Opened", oldStatus);
    await notifyVisibleUsers(
      "Registration opened",
      `"${eventTitle(event)}" is now open for registration.`,
      event._id
    );

    res.status(200).json({ message: "Registration opened.", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to open registration.", error: error.message });
  }
}

export async function closeRegistrationEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (!ensureStaffOwnsEvent(req, event, res)) return;
    if (!["Open for Registration", "Full"].includes(event.status)) {
      return res.status(400).json({ message: "Only open or full events can be closed." });
    }

    const oldStatus = event.status;
    event.status = "Closed";
    await event.save();

    await logEventChange(req, event, "Event Registration Closed", oldStatus);
    res.status(200).json({ message: "Registration closed.", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to close registration.", error: error.message });
  }
}

export async function cancelEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!ensureStaffOwnsEvent(req, event, res)) return;

    if (!req.body.cancellationReason) {
      return res.status(400).json({ message: "Cancellation reason is required." });
    }

    const oldStatus = event.status;
    event.status = "Cancelled";
    event.cancellationReason = req.body.cancellationReason;
    event.cancelledAt = new Date();
    event.cancelledBy = req.user._id;
    await event.save();

    await Participant.updateMany(
      { eventId: event._id, participationStatus: { $in: ["Joined", "Waitlisted"] } },
      { participationStatus: "Cancelled", cancelledAt: new Date(), cancellationReason: event.cancellationReason }
    );

    await logEventChange(req, event, "Event Cancelled", oldStatus, {
      reason: event.cancellationReason
    });

    res.status(200).json({ message: "Event cancelled successfully.", event });
  } catch (error) {
    res.status(500).json({ message: "Event cancellation failed.", error: error.message });
  }
}

export async function completeEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!ensureStaffOwnsEvent(req, event, res)) return;
    if (!["Closed", "Open for Registration", "Full"].includes(event.status)) {
      return res.status(400).json({ message: "Only closed or registration-stage events can be finished." });
    }

    const report = req.body.postEventReport || req.body;
    const required = ["attendanceCount", "actualBeneficiariesServed", "outcomeSummary"];
    const missing = required.filter((field) => report[field] === undefined || report[field] === "");
    if (missing.length) {
      return res.status(400).json({ message: `Post-event report is missing: ${missing.join(", ")}.` });
    }

    const oldStatus = event.status;
    event.status = "Finished";
    event.completedAt = new Date();
    event.postEventReport = {
      attendanceCount: Number(report.attendanceCount || 0),
      noShowCount: Number(report.noShowCount || 0),
      actualBeneficiariesServed: Number(report.actualBeneficiariesServed || 0),
      outcomeSummary: report.outcomeSummary,
      issuesEncountered: report.issuesEncountered,
      recommendations: report.recommendations,
      submittedBy: req.user._id,
      submittedAt: new Date()
    };
    event.actualBeneficiariesServed = event.postEventReport.actualBeneficiariesServed;
    event.outcomeSummary = event.postEventReport.outcomeSummary;
    await event.save();

    await Participant.updateMany(
      { eventId: event._id, participationStatus: "Joined", attendanceStatus: { $in: ["Pending", "Present"] } },
      { participationStatus: "Completed" }
    );

    await logEventChange(req, event, "Event Finished", oldStatus, {
      newValue: {
        status: event.status,
        progressPercentage: event.progressPercentage,
        postEventReport: event.postEventReport
      }
    });

    const attendedParticipants = await Participant.find({
      eventId: event._id,
      attendanceStatus: "Present"
    }).select("userId");
    await createNotifications(attendedParticipants.map((participant) => ({
      userId: participant.userId,
      title: "Feedback requested",
      message: `Please share feedback for "${eventTitle(event)}".`,
      type: "Feedback",
      relatedRecordId: event._id
    })));

    res.status(200).json({ message: "Event finished successfully.", event });
  } catch (error) {
    res.status(500).json({ message: "Event completion failed.", error: error.message });
  }
}

export async function archiveEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (!ensureStaffOwnsEvent(req, event, res)) return;
    if (event.status !== "Finished") {
      return res.status(400).json({ message: "Only finished events can be archived." });
    }

    const oldStatus = event.status;
    event.status = "Archived";
    await event.save();

    await logEventChange(req, event, "Event Archived", oldStatus);
    res.status(200).json({ message: "Event archived successfully.", event });
  } catch (error) {
    res.status(500).json({ message: "Event archive failed.", error: error.message });
  }
}

export async function getUserVisibleEvents(req, res) {
  try {
    const events = await Event.find({ status: { $in: USER_VISIBLE_EVENT_STATUSES } })
      .populate("createdBy", "name email role")
      .sort({ date: 1 });
    res.status(200).json(await enrichEvents(events));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user-visible events.", error: error.message });
  }
}

export async function getEventHistory(req, res) {
  try {
    if (req.user.role === "User") {
      const participants = await Participant.find({ userId: req.user._id })
        .populate({
          path: "eventId",
          select: "title date startDateTime endDateTime durationType location status createdBy eventImages postEventReport",
          populate: { path: "createdBy", select: "name email role" }
        })
        .sort({ joinedAt: -1 });
      return res.status(200).json(participants);
    }

    const filter = req.user.role === "Staff" ? { createdBy: req.user._id } : {};
    const events = await Event.find({ ...filter, status: { $in: ["Finished", "Cancelled", "Archived"] } })
      .populate("createdBy", "name email role")
      .sort({ date: -1 });
    res.status(200).json(await enrichEvents(events));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event history.", error: error.message });
  }
}

export async function generateEventQr(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (!ensureStaffOwnsEvent(req, event, res)) return;
    if (event.status === "Cancelled") {
      return res.status(400).json({ message: "Cancelled events cannot generate QR attendance codes." });
    }
    const eventStart = new Date(event.date);
    const today = new Date();
    eventStart.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(eventStart.getTime()) || eventStart > today) {
      return res.status(400).json({ message: "Attendance QR can be generated only once the event starts." });
    }

    const expiresAt = new Date(event.date || Date.now());
    expiresAt.setDate(expiresAt.getDate() + 1);
    expiresAt.setHours(23, 59, 59, 999);

    event.qrCodeToken = randomBytes(16).toString("hex");
    event.qrGeneratedAt = new Date();
    event.qrExpiresAt = expiresAt;
    await event.save();

    await logEventChange(req, event, "Generated Event QR", event.status, {
      newValue: { qrGeneratedAt: event.qrGeneratedAt, qrExpiresAt: event.qrExpiresAt }
    });

    res.status(200).json({
      message: "Event QR code generated.",
      qrCodeToken: event.qrCodeToken,
      qrGeneratedAt: event.qrGeneratedAt,
      qrExpiresAt: event.qrExpiresAt,
      qrData: `${event._id}:${event.qrCodeToken}`
    });
  } catch (error) {
    res.status(500).json({ message: "QR generation failed.", error: error.message });
  }
}

export async function getEventQr(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (!canViewEventQr(req, event)) return res.status(403).json({ message: "You cannot view this event QR code." });
    if (!event.qrCodeToken) return res.status(404).json({ message: "QR code has not been generated yet." });

    res.status(200).json({
      qrCodeToken: event.qrCodeToken,
      qrGeneratedAt: event.qrGeneratedAt,
      qrExpiresAt: event.qrExpiresAt,
      qrData: `${event._id}:${event.qrCodeToken}`
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch QR code.", error: error.message });
  }
}

export async function scanEventQr(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    await refreshEventStatus(event);

    const token = String(req.body.qrCodeToken || req.body.token || "").trim();
    if (!token || token !== event.qrCodeToken) {
      return res.status(400).json({ message: "Invalid QR code for this event." });
    }
    if (event.status === "Cancelled") {
      return res.status(400).json({ message: "Cancelled events cannot accept attendance." });
    }
    if (!event.qrCodeToken || (event.qrExpiresAt && new Date(event.qrExpiresAt) < new Date())) {
      return res.status(400).json({ message: "This QR code is expired or not active." });
    }
    const eventDate = new Date(event.date);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (eventDate > today) {
      return res.status(400).json({ message: "Attendance QR can be scanned only once the event starts." });
    }

    const participant = await Participant.findOne({
      userId: req.user._id,
      eventId: event._id,
      participationStatus: { $in: ["Joined", "Completed"] }
    });

    if (!participant) {
      return res.status(403).json({ message: "You must join this event before scanning its QR code." });
    }
    if (participant.attendanceStatus === "Present") {
      return res.status(409).json({ message: "Attendance was already marked as present." });
    }

    participant.attendanceStatus = "Present";
    participant.checkedInAt = new Date();
    participant.checkInCode = token;
    participant.checkInMethod = "QR";
    await participant.save();
    await updateUserAchievement(req.user._id);

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Scanned Attendance QR",
      module: "Participant",
      status: "Success",
      details: {
        recordId: participant._id,
        eventId: event._id,
        recordOwner: event.createdBy,
        newValue: { attendanceStatus: participant.attendanceStatus, checkInMethod: participant.checkInMethod },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(200).json({ message: "Attendance marked as Present.", participant });
  } catch (error) {
    res.status(500).json({ message: "QR scan failed.", error: error.message });
  }
}
