import mongoose from "mongoose";

const fundraiserProgressSchema = new mongoose.Schema(
  {
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation" },
    amount: { type: Number, min: 0 },
    previousRaised: { type: Number, min: 0 },
    newRaised: { type: Number, min: 0 },
    percentage: { type: Number, min: 0, max: 100 },
    note: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const fundraiserSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    beneficiary: { type: String, trim: true },
    place: { type: String, trim: true },
    targetAmount: { type: Number, required: true, min: 1 },
    deadline: { type: Date, required: true },
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    description: { type: String, required: true, trim: true },
    raisedAmount: { type: Number, default: 0, min: 0 },
    progressPercentage: { type: Number, min: 0, max: 100, default: 0 },
    progressUpdates: [fundraiserProgressSchema],
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

fundraiserSchema.pre("save", function (next) {
  const target = Number(this.targetAmount || 0);
  const raised = Number(this.raisedAmount || 0);
  this.progressPercentage = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  next();
});

export default mongoose.model("Fundraiser", fundraiserSchema);
