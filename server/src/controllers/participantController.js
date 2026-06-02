import Event from "../models/Event.js";
import Participant from "../models/Participant.js";
import { createLog } from "./logController.js";

export async function joinEvent(req, res) {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (event.status !== "Approved") {
      return res.status(400).json({ message: "Users can only join approved events." });
    }

    const existingParticipant = await Participant.findOne({
      userId: req.user._id,
      eventId: event._id
    });

    if (existingParticipant) {
      return res.status(409).json({ message: "You already joined this event." });
    }

    const participantCount = await Participant.countDocuments({
      eventId: event._id,
      participationStatus: { $ne: "Cancelled" }
    });

    if (participantCount >= event.participantLimit) {
      return res.status(400).json({ message: "Event participant limit has been reached." });
    }

    const participant = await Participant.create({
      userId: req.user._id,
      eventId: event._id,
      attendanceStatus: "Pending",
      participationStatus: "Joined",
      joinedAt: new Date()
    });

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Joined Event",
      module: "Participant",
      status: "Success",
      details: { recordId: participant._id, eventId: event._id, recordOwner: event.createdBy }
    });

    res.status(201).json({
      message: "Event joined successfully.",
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
      .sort({ joinedAt: -1 });

    if (req.user.role === "Staff") {
      const ownParticipants = participants.filter((participant) => (
        participant.eventId?.createdBy?.toString() === req.user._id.toString()
      ));
      return res.status(200).json(ownParticipants);
    }

    res.status(200).json(participants);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch participants.", error: error.message });
  }
}

export async function updateParticipantStatus(req, res) {
  try {
    const { attendanceStatus, participationStatus } = req.body;
    const participant = await Participant.findById(req.params.id).populate("eventId", "createdBy");

    if (!participant) {
      return res.status(404).json({ message: "Participant record not found." });
    }

    if (
      req.user.role === "Staff" &&
      participant.eventId.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Staff can only update participants of their own events." });
    }

    if (attendanceStatus) participant.attendanceStatus = attendanceStatus;
    if (participationStatus) participant.participationStatus = participationStatus;

    await participant.save();

    res.status(200).json({
      message: "Participant status updated successfully.",
      participant
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update participant status.", error: error.message });
  }
}
