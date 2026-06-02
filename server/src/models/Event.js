import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    objectives: { type: String, trim: true },
    date: { type: Date, required: true },
    time: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    eventType: { type: String, trim: true },
    participantLimit: { type: Number, required: true, min: 1 },
    targetBeneficiaries: { type: String, trim: true },
    requiredResources: { type: String, trim: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
