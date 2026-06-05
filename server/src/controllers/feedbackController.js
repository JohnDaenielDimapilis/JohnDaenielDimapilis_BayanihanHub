import Event from "../models/Event.js";
import Feedback from "../models/Feedback.js";
import Participant from "../models/Participant.js";
import { createLog } from "./logController.js";

export async function createFeedback(req, res) {
  try {
    const { eventId, rating, comment, suggestions, reviewImages = [] } = req.body;

    if (!eventId || !rating || !comment) {
      return res.status(400).json({ message: "Event, rating, and comment are required." });
    }

    const participant = await Participant.findOne({
      userId: req.user._id,
      eventId,
      participationStatus: { $ne: "Cancelled" },
      attendanceStatus: "Present"
    });

    if (!participant) {
      return res.status(403).json({ message: "Feedback is available only after your attendance is present or verified." });
    }

    const event = await Event.findById(eventId).select("createdBy status");
    if (!event || event.status !== "Finished") {
      return res.status(403).json({ message: "Feedback can be submitted only after the event is finished." });
    }

    const existingFeedback = await Feedback.findOne({
      userId: req.user._id,
      eventId
    });

    if (existingFeedback) {
      return res.status(409).json({ message: "You already submitted feedback for this event." });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      eventId,
      rating,
      comment,
      suggestions,
      reviewImages: Array.isArray(reviewImages)
        ? reviewImages.filter((image) => image?.imageUrl).map((image) => ({
            imageUrl: String(image.imageUrl).trim(),
            caption: image.caption || "",
            uploadedAt: image.uploadedAt || new Date()
          }))
        : []
    });

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Feedback Submitted",
      module: "Feedback",
      status: "Success",
      details: { recordId: feedback._id, eventId, recordOwner: event?.createdBy }
    });

    res.status(201).json({
      message: "Feedback submitted successfully.",
      feedback
    });
  } catch (error) {
    res.status(500).json({ message: "Feedback submission failed.", error: error.message });
  }
}

export async function getFeedback(req, res) {
  try {
    let filter = {};

    if (req.user.role === "Staff") {
      const staffEvents = await Event.find({ createdBy: req.user._id }).select("_id");
      filter.eventId = { $in: staffEvents.map((event) => event._id) };
    }

    const feedback = await Feedback.find(filter)
      .populate("userId", "name email role")
      .populate({
        path: "eventId",
        select: "title date startDateTime endDateTime durationType location status createdBy eventImages",
        populate: { path: "createdBy", select: "name email role" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feedback.", error: error.message });
  }
}

export async function getMyFeedback(req, res) {
  try {
    const feedback = await Feedback.find({ userId: req.user._id })
      .populate("eventId", "title date startDateTime endDateTime durationType location status eventImages")
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your feedback.", error: error.message });
  }
}
