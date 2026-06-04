import ActivityLog from "../models/ActivityLog.js";
import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";

function getSeverity(log) {
  const action = String(log.action || "").toLowerCase();
  if (log.outcome === "failure" && action.includes("unauthorized")) return "High";
  if (log.outcome === "failure" && action.includes("login")) return "Medium";
  if (action.includes("password") || action.includes("role")) return "Medium";
  if (action.includes("inactive")) return "High";
  return "Low";
}

export async function securitySummary(req, res, next) {
  try {
    const [failedLogins, unauthorizedAttempts, inactiveUsers, roleChanges] = await Promise.all([
      ActivityLog.countDocuments({ action: /login failed|failed login/i }),
      ActivityLog.countDocuments({ action: /Unauthorized/i }),
      User.countDocuments({ isActive: false }),
      ActivityLog.countDocuments({ action: /Updated user account|role/i })
    ]);

    await logActivity(req, { action: "Reviewed security dashboard", module: "Security" });
    res.json({
      failedLogins,
      unauthorizedAttempts,
      inactiveUsers,
      roleChanges,
      activeAlerts: failedLogins + unauthorizedAttempts,
      retentionDays: 90
    });
  } catch (error) {
    next(error);
  }
}

export async function securityLogs(req, res, next) {
  try {
    const logs = await ActivityLog.find({
      $or: [
        { module: "Security" },
        { action: /login/i },
        { action: /password/i },
        { action: /role/i }
      ]
    }).populate("user", "name email").sort({ createdAt: -1 }).limit(200).lean();

    res.json(logs.map((log) => ({ ...log, severity: getSeverity(log) })));
  } catch (error) {
    next(error);
  }
}
