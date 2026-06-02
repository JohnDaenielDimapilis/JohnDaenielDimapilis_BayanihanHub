import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    module: { type: String, required: true, trim: true },
    affectedRecord: { type: mongoose.Schema.Types.ObjectId },
    outcome: { type: String, enum: ["success", "failure"], default: "success" },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    remarks: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", activityLogSchema);
