import ActivityLog from "../models/ActivityLog.js";

export async function logActivity(req, { action, module, affectedRecord, outcome = "success", remarks = "" }) {
  await ActivityLog.create({
    user: req.user?._id,
    role: req.user?.role || "Guest",
    action,
    module,
    affectedRecord,
    outcome,
    ipAddress: req.ip,
    userAgent: req.get?.("user-agent"),
    remarks
  });
}
