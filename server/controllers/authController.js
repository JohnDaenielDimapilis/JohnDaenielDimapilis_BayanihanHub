const User = require("../models/User");
const { recordActivity } = require("../services/logService");
const asyncHandler = require("../utils/asyncHandler");
const createToken = require("../utils/createToken");
const sanitizeUser = require("../utils/sanitizeUser");

const register = asyncHandler(async (request, response) => {
  const { fullName, email, password } = request.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    response.status(409);
    throw new Error("Email is already registered.");
  }

  const userCount = await User.countDocuments();
  const role = userCount === 0 ? "admin" : "user";
  const user = await User.create({ fullName, email, password, role });

  await recordActivity({
    userId: user._id,
    activityType: "register",
    description: `${user.fullName} created a ${role} account.`,
    ipAddress: request.ip
  });

  response.status(201).json({
    user: sanitizeUser(user),
    token: createToken(user)
  });
});

const login = asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    await recordActivity({
      activityType: "security_login_failed",
      description: `Failed login attempt for ${email}.`,
      ipAddress: request.ip
    });

    response.status(401);
    throw new Error("Invalid email or password.");
  }

  if (user.status !== "active") {
    await recordActivity({
      userId: user._id,
      activityType: "security_login_blocked",
      description: `${user.fullName} attempted to log in with ${user.status} status.`,
      ipAddress: request.ip
    });

    response.status(403);
    throw new Error("Account is not active.");
  }

  await recordActivity({
    userId: user._id,
    activityType: "login",
    description: `${user.fullName} logged in successfully.`,
    ipAddress: request.ip
  });

  response.json({
    user: sanitizeUser(user),
    token: createToken(user)
  });
});

const getProfile = asyncHandler(async (request, response) => {
  response.json({ user: request.user });
});

module.exports = { getProfile, login, register };
