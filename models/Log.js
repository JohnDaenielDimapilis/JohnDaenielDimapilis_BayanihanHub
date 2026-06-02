import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    module: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    details: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
  }
);

export default mongoose.model("Log", logSchema);
