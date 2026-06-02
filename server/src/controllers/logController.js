import Log from "../models/Log.js";
import ActivityLog from "../models/ActivityLog.js";

export async function createLog({ userId, role, action, module, status = "Success", details = {} }) {
  const outcome = status.toLowerCase() === "failed" ? "failure" : "success";
  const relatedRecordId = details.recordId || details.relatedRecordId;

  const log = await Log.create({
    userId,
    role: role || "Guest",
    action,
    module,
    status,
    outcome,
    relatedRecordId,
    oldValue: details.oldValue,
    newValue: details.newValue,
    ipAddress: details.ipAddress,
    userAgent: details.userAgent,
    reason: details.reason || details.rejectionReason || details.refundReason,
    details,
    createdAt: new Date()
  });

  await ActivityLog.create({
    user: userId,
    role: role || "Guest",
    action,
    module,
    affectedRecord: relatedRecordId,
    outcome,
    ipAddress: details.ipAddress,
    remarks: details.reason || details.rejectionReason || details.refundReason || details.remarks || ""
  });

  return log;
}

export async function getLogs(req, res) {
  try {
    let filter = {};

    if (req.user.role === "Staff") {
      filter = {
        $or: [
          { userId: req.user._id },
          { "details.recordOwner": req.user._id }
        ]
      };
    }

    const logs = await Log.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs.", error: error.message });
  }
}
