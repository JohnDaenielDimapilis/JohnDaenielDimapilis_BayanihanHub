import Event from "../models/Event.js";
import Participant from "../models/Participant.js";
import { createLog } from "./logController.js";
import { createNotification } from "./notificationController.js";

function canManageParticipant(req, event) {
  return req.user.role === "Admin" || event.createdBy?.toString() === req.user._id.toString();
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

async function getJoinedCount(eventId) {
  return Participant.countDocuments({ eventId, participationStatus: "Joined" });
}

async function getWaitlistPosition(eventId) {
  const waitlisted = await Participant.countDocuments({ eventId, participationStatus: "Waitlisted" });
  return waitlisted + 1;
}

async function recalculateWaitlistPositions(eventId) {
  const waitlisted = await Participant.find({ eventId, participationStatus: "Waitlisted" }).sort({ joinedAt: 1 });
  for (let index = 0; index < waitlisted.length; index += 1) {
    waitlisted[index].waitlistPosition = index + 1;
    await waitlisted[index].save();
  }
}

async function promoteFromWaitlist(event) {
  const joinedCount = await getJoinedCount(event._id);
  if (joinedCount >= Number(event.participantLimit || 0)) return null;

  const nextParticipant = await Participant.findOne({
    eventId: event._id,
    participationStatus: "Waitlisted"
  }).sort({ waitlistPosition: 1, joinedAt: 1 });

  if (!nextParticipant) return null;

  nextParticipant.participationStatus = "Joined";
  nextParticipant.waitlistPosition = undefined;
  await nextParticipant.save();
  await recalculateWaitlistPositions(event._id);

  await createNotification({
    userId: nextParticipant.userId,
    title: "Waitlist spot confirmed",
    message: `You have been moved into "${event.title || "the event"}".`,
    type: "Participant",
    relatedRecordId: event._id
  });

  return nextParticipant;
}

export async function joinEvent(req, res) {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!["Open for Registration", "Full"].includes(event.status)) {
      return res.status(400).json({ message: "Users can only join events that are open for registration." });
    }

    const existingParticipant = await Participant.findOne({
      userId: req.user._id,
      eventId: event._id
    });

    if (existingParticipant && existingParticipant.participationStatus !== "Cancelled") {
      return res.status(409).json({ message: "You already have a registration for this event." });
    }

    const joinedCount = await getJoinedCount(event._id);
    const isFull = event.status === "Full" || joinedCount >= Number(event.participantLimit || 0);

    if (isFull && (!event.waitlistEnabled || event.capacityRule === "Block Registration")) {
      return res.status(400).json({ message: "Event participant limit has been reached." });
    }

    const participationStatus = isFull ? "Waitlisted" : "Joined";
    const participantData = {
      userId: req.user._id,
      eventId: event._id,
      attendanceStatus: "Pending",
      participationStatus,
      joinedAt: new Date(),
      cancelledAt: undefined,
      cancellationReason: undefined,
      waitlistPosition: participationStatus === "Waitlisted" ? await getWaitlistPosition(event._id) : undefined
    };

    let participant;
    if (existingParticipant?.participationStatus === "Cancelled") {
      Object.assign(existingParticipant, participantData);
      participant = await existingParticipant.save();
    } else {
      participant = await Participant.create(participantData);
    }

    const newJoinedCount = await getJoinedCount(event._id);
    if (newJoinedCount >= Number(event.participantLimit || 0) && event.status !== "Full") {
      event.status = "Full";
      await event.save();
    }

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: participationStatus === "Waitlisted" ? "Joined Event Waitlist" : "Joined Event",
      module: "Participant",
      status: "Success",
      details: {
        recordId: participant._id,
        eventId: event._id,
        recordOwner: event.createdBy,
        newValue: {
          participationStatus: participant.participationStatus,
          waitlistPosition: participant.waitlistPosition
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    await createNotification({
      userId: req.user._id,
      title: participationStatus === "Waitlisted" ? "Added to waitlist" : "Event registration confirmed",
      message: participationStatus === "Waitlisted"
        ? `You are waitlist #${participant.waitlistPosition} for "${event.title || "this event"}".`
        : `You are registered for "${event.title || "this event"}".`,
      type: "Participant",
      relatedRecordId: event._id
    });

    res.status(201).json({
      message: participationStatus === "Waitlisted" ? "Event is full. You have been added to the waitlist." : "Event joined successfully.",
      participant
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to join event.", error: error.message });
  }
}

export async function getParticipants(req, res) {
  try {
    let filter = {};

    if (req.user.role === "Staff") {
      const staffEvents = await Event.find({ createdBy: req.user._id }).select("_id");
      filter.eventId = { $in: staffEvents.map((event) => event._id) };
    }

    if (req.query.eventId) {
      filter.eventId = req.query.eventId;
    }

    const participants = await Participant.find(filter)
      .populate("userId", "name email role")
      .populate("eventId", "title date location status createdBy")
      .populate("verifiedBy", "name email role")
      .sort({ joinedAt: -1 });

    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch participants.", error: error.message });
  }
}

export async function getMyParticipants(req, res) {
  try {
    const participants = await Participant.find({ userId: req.user._id })
      .populate("eventId", "title date location status createdBy")
      .sort({ joinedAt: -1 });

    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your registrations.", error: error.message });
  }
}

export async function updateParticipantStatus(req, res) {
  try {
    const { attendanceStatus, participationStatus, attendanceRemarks } = req.body;
    const participant = await Participant.findById(req.params.id).populate("eventId", "createdBy title");

    if (!participant) {
      return res.status(404).json({ message: "Participant record not found." });
    }

    if (!canManageParticipant(req, participant.eventId)) {
      return res.status(403).json({ message: "Staff can only update participants of their own events." });
    }

    if (attendanceStatus) participant.attendanceStatus = attendanceStatus;
    if (participationStatus) participant.participationStatus = participationStatus;
    if (attendanceRemarks !== undefined) participant.attendanceRemarks = attendanceRemarks;

    await participant.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Participant Status Updated",
      module: "Participant",
      status: "Success",
      details: {
        recordId: participant._id,
        eventId: participant.eventId._id,
        recordOwner: participant.eventId.createdBy,
        newValue: {
          attendanceStatus: participant.attendanceStatus,
          participationStatus: participant.participationStatus,
          attendanceRemarks: participant.attendanceRemarks
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(200).json({
      message: "Participant status updated successfully.",
      participant
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update participant status.", error: error.message });
  }
}

export async function cancelOwnRegistration(req, res) {
  try {
    const participant = await Participant.findOne({
      userId: req.user._id,
      eventId: req.params.eventId,
      participationStatus: { $in: ["Joined", "Waitlisted"] }
    }).populate("eventId", "title status participantLimit createdBy");

    if (!participant) {
      return res.status(404).json({ message: "Active registration not found." });
    }

    const event = participant.eventId;
    const wasJoined = participant.participationStatus === "Joined";
    participant.participationStatus = "Cancelled";
    participant.cancelledAt = new Date();
    participant.cancellationReason = req.body.cancellationReason || "Cancelled by participant";
    participant.waitlistPosition = undefined;
    await participant.save();

    let promoted = null;
    if (wasJoined && ["Full", "Open for Registration"].includes(event.status)) {
      promoted = await promoteFromWaitlist(event);
      const joinedCount = await getJoinedCount(event._id);
      if (event.status === "Full" && joinedCount < Number(event.participantLimit || 0)) {
        event.status = "Open for Registration";
        await event.save();
      }
    } else {
      await recalculateWaitlistPositions(event._id);
    }

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Registration Cancelled",
      module: "Participant",
      status: "Success",
      details: {
        recordId: participant._id,
        eventId: event._id,
        recordOwner: event.createdBy,
        reason: participant.cancellationReason,
        newValue: { participationStatus: participant.participationStatus },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    await createNotification({
      userId: req.user._id,
      title: "Registration cancelled",
      message: `Your registration for "${event.title || "this event"}" was cancelled.`,
      type: "Participant",
      relatedRecordId: event._id
    });

    res.status(200).json({ message: "Registration cancelled.", participant, promoted });
  } catch (error) {
    res.status(500).json({ message: "Registration cancellation failed.", error: error.message });
  }
}

export async function checkInEvent(req, res) {
  try {
    const participant = await Participant.findOne({
      userId: req.user._id,
      eventId: req.params.eventId,
      participationStatus: { $in: ["Joined", "Completed"] }
    }).populate("eventId", "title status createdBy");

    if (!participant) {
      return res.status(404).json({ message: "Joined registration not found." });
    }

    if (!["Open for Registration", "Full", "Closed", "Completed"].includes(participant.eventId.status)) {
      return res.status(400).json({ message: "Check-in is available only for active, closed, or completed events." });
    }

    participant.attendanceStatus = "Present";
    participant.checkedInAt = new Date();
    participant.checkInCode = req.body.checkInCode || `BH-${String(participant._id).slice(-6).toUpperCase()}`;
    await participant.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Participant Checked In",
      module: "Participant",
      status: "Success",
      details: {
        recordId: participant._id,
        eventId: participant.eventId._id,
        recordOwner: participant.eventId.createdBy,
        newValue: {
          attendanceStatus: participant.attendanceStatus,
          checkedInAt: participant.checkedInAt,
          checkInCode: participant.checkInCode
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(200).json({ message: "Check-in recorded.", participant });
  } catch (error) {
    res.status(500).json({ message: "Check-in failed.", error: error.message });
  }
}

export async function verifyAttendance(req, res) {
  try {
    const participant = await Participant.findById(req.params.id)
      .populate("eventId", "createdBy title")
      .populate("userId", "name email role");

    if (!participant) {
      return res.status(404).json({ message: "Participant record not found." });
    }

    if (!canManageParticipant(req, participant.eventId)) {
      return res.status(403).json({ message: "Staff can only verify participants of their own events." });
    }

    participant.attendanceStatus = "Verified";
    participant.verifiedBy = req.user._id;
    participant.attendanceRemarks = req.body.attendanceRemarks || participant.attendanceRemarks;
    if (!participant.checkedInAt) participant.checkedInAt = new Date();
    await participant.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Attendance Verified",
      module: "Participant",
      status: "Success",
      details: {
        recordId: participant._id,
        eventId: participant.eventId._id,
        recordOwner: participant.eventId.createdBy,
        newValue: {
          attendanceStatus: participant.attendanceStatus,
          attendanceRemarks: participant.attendanceRemarks
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    await createNotification({
      userId: participant.userId._id,
      title: "Attendance verified",
      message: `Your attendance for "${participant.eventId.title || "the event"}" was verified.`,
      type: "Participant",
      relatedRecordId: participant.eventId._id
    });

    res.status(200).json({ message: "Attendance verified.", participant });
  } catch (error) {
    res.status(500).json({ message: "Attendance verification failed.", error: error.message });
  }
}

export async function exportParticipants(req, res) {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (!canManageParticipant(req, event)) {
      return res.status(403).json({ message: "Staff can only export participants of their own events." });
    }

    const participants = await Participant.find({ eventId: event._id })
      .populate("userId", "name email role")
      .populate("verifiedBy", "name email role")
      .sort({ participationStatus: 1, joinedAt: 1 });

    const headers = [
      "Name",
      "Email",
      "Registration Status",
      "Attendance Status",
      "Waitlist Position",
      "Joined At",
      "Checked In At",
      "Verified By",
      "Remarks"
    ];

    const rows = participants.map((participant) => [
      participant.userId?.name,
      participant.userId?.email,
      participant.participationStatus,
      participant.attendanceStatus,
      participant.waitlistPosition,
      participant.joinedAt?.toISOString(),
      participant.checkedInAt?.toISOString(),
      participant.verifiedBy?.name,
      participant.attendanceRemarks
    ].map(csvEscape).join(","));

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="event-${event._id}-participants.csv"`);
    res.status(200).send([headers.map(csvEscape).join(","), ...rows].join("\n"));
  } catch (error) {
    res.status(500).json({ message: "Participant export failed.", error: error.message });
  }
}
