import mongoose from "mongoose";

const fundraiserSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 1 },
    deadline: { type: Date, required: true },
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    description: { type: String, required: true, trim: true },
    raisedAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Closed", "Archived", "Rejected"],
      default: "Pending"
    },
    utilizationReport: { type: String, trim: true },
    reconciliationStatus: {
      type: String,
      enum: ["Not Started", "In Progress", "Reconciled", "Issue Found"],
      default: "Not Started"
    },
    closureReason: { type: String, trim: true },
    approvalCriteria: {
      purposeValid: { type: Boolean, default: false },
      targetJustified: { type: Boolean, default: false },
      deadlineRealistic: { type: Boolean, default: false },
      beneficiaryClear: { type: Boolean, default: false }
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

export default mongoose.model("Fundraiser", fundraiserSchema);
