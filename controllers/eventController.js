import Event from "../models/Event.js";
import { createLog } from "./logController.js";

export async function createEvent(req, res) {
  try {
    const { title, description, date, location, participantLimit } = req.body;

    if (!title || !description || !date || !location || !participantLimit) {
      return res.status(400).json({ message: "All event fields are required." });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      participantLimit,
      status: req.user.role === "Admin" ? "Approved" : "Pending",
      createdBy: req.user._id,
      approvedBy: req.user.role === "Admin" ? req.user._id : undefined,
      approvedAt: req.user.role === "Admin" ? new Date() : undefined
    });

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Event Created",
      module: "Event",
      status: "Success",
      details: { recordId: event._id, recordOwner: event.createdBy }
    });

    res.status(201).json({
      message: req.user.role === "Admin" ? "Event created and approved." : "Event created and submitted for admin approval.",
      event
    });
  } catch (error) {
    res.status(500).json({ message: "Event creation failed.", error: error.message });
  }
}

export async function getEvents(req, res) {
  try {
    const filter = req.user.role === "User" ? { status: "Approved" } : {};

    const events = await Event.find(filter)
      .populate("createdBy", "name email role")
      .sort({ date: 1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events.", error: error.message });
  }
}

export async function getEventById(req, res) {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === "User") {
      filter.status = "Approved";
    }

    const event = await Event.findOne(filter).populate("createdBy", "name email role");

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json(event);
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

    if (req.user.role === "Staff" && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Staff can only update their own events." });
    }

    const allowedFields = ["title", "description", "date", "location", "participantLimit"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    event.status = "Pending";
    await event.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Event Updated",
      module: "Event",
      status: "Success",
      details: { recordId: event._id, recordOwner: event.createdBy }
    });

    res.status(200).json({
      message: "Event updated and returned to pending status.",
      event
    });
  } catch (error) {
    res.status(500).json({ message: "Event update failed.", error: error.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (req.user.role === "Staff" && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Staff can only delete their own events." });
    }

    await event.deleteOne();
    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Event Deleted",
      module: "Event",
      status: "Success",
      details: { recordId: event._id, recordOwner: event.createdBy }
    });
    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Event deletion failed.", error: error.message });
  }
}

export async function approveEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    event.status = "Approved";
    event.approvedBy = req.user._id;
    event.approvedAt = new Date();
    await event.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Event Approved",
      module: "Event",
      status: "Success",
      details: { recordId: event._id, recordOwner: event.createdBy }
    });

    res.status(200).json({
      message: "Event approved successfully.",
      event
    });
  } catch (error) {
    res.status(500).json({ message: "Event approval failed.", error: error.message });
  }
}

export async function rejectEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    event.status = "Rejected";
    event.rejectedBy = req.user._id;
    event.rejectedAt = new Date();
    if (req.body.rejectionReason) {
      event.rejectionReason = req.body.rejectionReason;
    }
    await event.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Event Rejected",
      module: "Event",
      status: "Success",
      details: { recordId: event._id, recordOwner: event.createdBy }
    });

    res.status(200).json({
      message: "Event rejected successfully.",
      event
    });
  } catch (error) {
    res.status(500).json({ message: "Event rejection failed.", error: error.message });
  }
}
