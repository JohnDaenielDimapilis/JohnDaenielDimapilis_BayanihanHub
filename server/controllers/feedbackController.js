const Feedback = require("../models/Feedback");
const { recordActivity } = require("../services/logService");
const asyncHandler = require("../utils/asyncHandler");

const createFeedback = asyncHandler(async (request, response) => {
  const feedback = await Feedback.create({
    userId: request.user._id,
    eventId: request.body.eventId,
    rating: request.body.rating,
    comment: request.body.comment
  });

  await recordActivity({
    userId: request.user._id,
    activityType: "feedback_submitted",
    description: `${request.user.fullName} submitted event feedback.`,
    ipAddress: request.ip
  });

  response.status(201).json(feedback);
});

const getFeedback = asyncHandler(async (_request, response) => {
  const feedback = await Feedback.find()
    .populate("userId", "fullName email")
    .populate("eventId", "eventTitle")
    .sort({ createdAt: -1 });

  response.json(feedback);
});

const getFeedbackByEvent = asyncHandler(async (request, response) => {
  const feedback = await Feedback.find({ eventId: request.params.eventId })
    .populate("userId", "fullName email")
    .sort({ createdAt: -1 });

  response.json(feedback);
});

module.exports = { createFeedback, getFeedback, getFeedbackByEvent };
