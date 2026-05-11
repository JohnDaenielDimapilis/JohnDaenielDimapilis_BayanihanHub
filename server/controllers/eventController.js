const Event = require("../models/Event");
const { recordActivity } = require("../services/logService");
const asyncHandler = require("../utils/asyncHandler");

const createEvent = asyncHandler(async (request, response) => {
  const event = await Event.create({
    ...request.body,
    createdBy: request.user._id,
    status: "pending"
  });

  await recordActivity({
    userId: request.user._id,
    activityType: "event_created",
    description: `${request.user.fullName} submitted event "${event.eventTitle}" for approval.`,
    ipAddress: request.ip
  });

  response.status(201).json(event);
});

const getEvents = asyncHandler(async (request, response) => {
  const filter = request.user.role === "admin" ? {} : { $or: [{ status: "approved" }, { createdBy: request.user._id }] };
  const events = await Event.find(filter)
    .populate("createdBy", "fullName email")
    .populate("approvedBy", "fullName email")
    .populate("participants", "fullName email")
    .sort({ eventDate: 1 });

  response.json(events);
});

const getApprovedEvents = asyncHandler(async (_request, response) => {
  const events = await Event.find({ status: { $in: ["approved", "active"] } })
    .populate("createdBy", "fullName email")
    .sort({ eventDate: 1 });

  response.json(events);
});

const getEventById = asyncHandler(async (request, response) => {
  const event = await Event.findById(request.params.id)
    .populate("createdBy", "fullName email")
    .populate("approvedBy", "fullName email")
    .populate("participants", "fullName email");

  if (!event) {
    response.status(404);
    throw new Error("Event not found.");
  }

  response.json(event);
});

const updateEvent = asyncHandler(async (request, response) => {
  const event = await Event.findById(request.params.id);

  if (!event) {
    response.status(404);
    throw new Error("Event not found.");
  }

  if (request.user.role !== "admin" && event.createdBy.toString() !== request.user._id.toString()) {
    response.status(403);
    throw new Error("You can only update events you created.");
  }

  Object.assign(event, {
    eventTitle: request.body.eventTitle ?? event.eventTitle,
    description: request.body.description ?? event.description,
    location: request.body.location ?? event.location,
    eventDate: request.body.eventDate ?? event.eventDate,
    capacity: request.body.capacity ?? event.capacity,
    status: request.user.role === "admin" && request.body.status ? request.body.status : "pending"
  });

  await event.save();
  await recordActivity({
    userId: request.user._id,
    activityType: "event_updated",
    description: `${request.user.fullName} updated event "${event.eventTitle}".`,
    ipAddress: request.ip
  });

  response.json(event);
});

const deleteEvent = asyncHandler(async (request, response) => {
  const event = await Event.findById(request.params.id);

  if (!event) {
    response.status(404);
    throw new Error("Event not found.");
  }

  if (request.user.role !== "admin" && event.createdBy.toString() !== request.user._id.toString()) {
    response.status(403);
    throw new Error("You can only delete events you created.");
  }

  await event.deleteOne();
  await recordActivity({
    userId: request.user._id,
    activityType: "event_deleted",
    description: `${request.user.fullName} deleted event "${event.eventTitle}".`,
    ipAddress: request.ip
  });

  response.json({ message: "Event deleted successfully." });
});

const approveEvent = asyncHandler(async (request, response) => {
  const event = await Event.findByIdAndUpdate(
    request.params.id,
    { status: "approved", approvedBy: request.user._id },
    { new: true }
  );

  if (!event) {
    response.status(404);
    throw new Error("Event not found.");
  }

  await recordActivity({
    userId: request.user._id,
    activityType: "approval_event_approved",
    description: `${request.user.fullName} approved event "${event.eventTitle}".`,
    ipAddress: request.ip
  });

  response.json(event);
});

const rejectEvent = asyncHandler(async (request, response) => {
  const event = await Event.findByIdAndUpdate(
    request.params.id,
    { status: "rejected", approvedBy: request.user._id },
    { new: true }
  );

  if (!event) {
    response.status(404);
    throw new Error("Event not found.");
  }

  await recordActivity({
    userId: request.user._id,
    activityType: "approval_event_rejected",
    description: `${request.user.fullName} rejected event "${event.eventTitle}".`,
    ipAddress: request.ip
  });

  response.json(event);
});

const joinEvent = asyncHandler(async (request, response) => {
  const event = await Event.findById(request.params.id);

  if (!event || !["approved", "active"].includes(event.status)) {
    response.status(404);
    throw new Error("Approved event not found.");
  }

  if (event.participants.some((participantId) => participantId.toString() === request.user._id.toString())) {
    response.status(409);
    throw new Error("You already joined this event.");
  }

  if (event.participants.length >= event.capacity) {
    response.status(400);
    throw new Error("Event capacity has been reached.");
  }

  event.participants.push(request.user._id);
  await event.save();
  await recordActivity({
    userId: request.user._id,
    activityType: "event_joined",
    description: `${request.user.fullName} joined event "${event.eventTitle}".`,
    ipAddress: request.ip
  });

  response.json(event);
});

module.exports = {
  approveEvent,
  createEvent,
  deleteEvent,
  getApprovedEvents,
  getEventById,
  getEvents,
  joinEvent,
  rejectEvent,
  updateEvent
};
