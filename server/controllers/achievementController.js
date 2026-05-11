const Achievement = require("../models/Achievement");
const { recordActivity } = require("../services/logService");
const asyncHandler = require("../utils/asyncHandler");

const createAchievement = asyncHandler(async (request, response) => {
  const achievement = await Achievement.create(request.body);

  await recordActivity({
    userId: request.user._id,
    activityType: "achievement_awarded",
    description: `${request.user.fullName} awarded achievement "${achievement.achievementTitle}".`,
    ipAddress: request.ip
  });

  response.status(201).json(achievement);
});

const getAchievements = asyncHandler(async (_request, response) => {
  const achievements = await Achievement.find()
    .populate("userId", "fullName email")
    .sort({ earnedDate: -1 });

  response.json(achievements);
});

const getMyAchievements = asyncHandler(async (request, response) => {
  const achievements = await Achievement.find({ userId: request.user._id }).sort({ earnedDate: -1 });
  response.json(achievements);
});

module.exports = { createAchievement, getAchievements, getMyAchievements };
