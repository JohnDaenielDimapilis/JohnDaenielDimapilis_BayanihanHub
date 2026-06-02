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
    actualBeneficiariesServed: { type: Number, min: 0, default: 0 },
    requiredResources: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Approved",
        "Published",
        "Open",
        "Full",
        "Closed",
        "Cancelled",
        "Completed",
        "Archived",
        "Rejected"
      ],
      default: "Pending"
    },
    waitlistEnabled: { type: Boolean, default: true },
    capacityRule: {
      type: String,
      enum: ["Block Registration", "Allow Waitlist"],
      default: "Allow Waitlist"
    },
    cancellationReason: { type: String, trim: true },
    completedAt: { type: Date },
    outcomeSummary: { type: String, trim: true },
    approvalCriteria: {
      goalAligned: { type: Boolean, default: false },
      dateValid: { type: Boolean, default: false },
      resourcesAvailable: { type: Boolean, default: false },
      capacityReasonable: { type: Boolean, default: false }
    },
    approvalRemarks: { type: String, trim: true },
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
