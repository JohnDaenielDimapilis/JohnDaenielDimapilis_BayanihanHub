import Log from "../models/Log.js";

export async function createLog({ userId, role, action, module, status = "Success", details = {} }) {
  return Log.create({
    userId,
    role: role || "Guest",
    action,
    module,
    status,
    details,
    createdAt: new Date()
  });
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
