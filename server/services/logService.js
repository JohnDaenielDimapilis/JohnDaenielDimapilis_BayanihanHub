const ActivityLog = require("../models/ActivityLog");

const recordActivity = async ({ userId = null, activityType, description, ipAddress }) => {
  try {
    await ActivityLog.create({
      userId,
      activityType,
      description,
      ipAddress
    });
  } catch (error) {
    console.error(`Activity log failed: ${error.message}`);
  }
};

module.exports = { recordActivity };
