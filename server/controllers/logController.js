const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");

const getActivityLogs = asyncHandler(async (_request, response) => {
  const logs = await ActivityLog.find()
    .populate("userId", "fullName email role")
    .sort({ createdAt: -1 })
    .limit(200);

  response.json(logs);
});

const getSecurityLogs = asyncHandler(async (_request, response) => {
  const logs = await ActivityLog.find({
    activityType: { $regex: /security|approval|login/i }
  })
    .populate("userId", "fullName email role")
    .sort({ createdAt: -1 })
    .limit(200);

  response.json(logs);
});

module.exports = { getActivityLogs, getSecurityLogs };
