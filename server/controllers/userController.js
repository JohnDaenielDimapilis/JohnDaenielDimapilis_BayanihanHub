const User = require("../models/User");
const { recordActivity } = require("../services/logService");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (_request, response) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  response.json(users);
});

const getUserById = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.id).select("-password");

  if (!user) {
    response.status(404);
    throw new Error("User not found.");
  }

  response.json(user);
});

const updateUserStatus = asyncHandler(async (request, response) => {
  const { status } = request.body;
  const user = await User.findByIdAndUpdate(request.params.id, { status }, { new: true }).select("-password");

  if (!user) {
    response.status(404);
    throw new Error("User not found.");
  }

  await recordActivity({
    userId: request.user._id,
    activityType: "security_user_status_updated",
    description: `${request.user.fullName} changed ${user.fullName}'s status to ${status}.`,
    ipAddress: request.ip
  });

  response.json(user);
});

const updateUserRole = asyncHandler(async (request, response) => {
  const { role } = request.body;
  const user = await User.findByIdAndUpdate(request.params.id, { role }, { new: true }).select("-password");

  if (!user) {
    response.status(404);
    throw new Error("User not found.");
  }

  await recordActivity({
    userId: request.user._id,
    activityType: "security_user_role_updated",
    description: `${request.user.fullName} changed ${user.fullName}'s role to ${role}.`,
    ipAddress: request.ip
  });

  response.json(user);
});

module.exports = {
  getUserById,
  getUsers,
  updateUserRole,
  updateUserStatus
};
