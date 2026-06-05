import mongoose from "mongoose";
import { EVENT_STATUSES, getEventProgress } from "../utils/eventWorkflow.js";

const eventImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, trim: true },
    imageType: {
      type: String,
      enum: ["Banner", "Information", "Documentation", "Post Event"],
      default: "Documentation"
    },
    caption: { type: String, trim: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const progressUpdateSchema = new mongoose.Schema(
  {
    percentage: { type: Number, min: 0, max: 100, required: true },
    note: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    objectives: { type: String, trim: true },
    date: { type: Date },
    time: { type: String, trim: true },
    startDateTime: { type: Date },
    endDateTime: { type: Date },
    durationType: {
      type: String,
      enum: ["One Day", "Multiple Days", "Weekly"],
      default: "One Day"
    },
    location: { type: String, trim: true },
    eventType: { type: String, trim: true },
    participantLimit: { type: Number, min: 1 },
    targetBeneficiaries: { type: String, trim: true },
    requiredResources: { type: String, trim: true },
    registrationStartDate: { type: Date },
    registrationEndDate: { type: Date },
    status: {
      type: String,
      enum: EVENT_STATUSES,
      default: "Draft"
    },
    progressPercentage: { type: Number, min: 0, max: 100, default: 10 },
    progressUpdates: [progressUpdateSchema],
    eventImages: [eventImageSchema],
    waitlistEnabled: { type: Boolean, default: true },
    capacityRule: {
      type: String,
      enum: ["Block Registration", "Allow Waitlist"],
      default: "Allow Waitlist"
    },
    cancellationReason: { type: String, trim: true },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    qrCodeToken: { type: String, trim: true },
    qrGeneratedAt: { type: Date },
    qrExpiresAt: { type: Date },
    completedAt: { type: Date },
    approvalCriteria: {
      goalAligned: { type: Boolean, default: false },
      dateValid: { type: Boolean, default: false },
      resourcesAvailable: { type: Boolean, default: false },
      capacityReasonable: { type: Boolean, default: false }
    },
    approvalRemarks: { type: String, trim: true },
    revisionRemarks: { type: String, trim: true },
    revisionRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    revisionRequestedAt: { type: Date },
    postEventReport: {
      attendanceCount: { type: Number, min: 0, default: 0 },
      noShowCount: { type: Number, min: 0, default: 0 },
      actualBeneficiariesServed: { type: Number, min: 0, default: 0 },
      outcomeSummary: { type: String, trim: true },
      issuesEncountered: { type: String, trim: true },
      recommendations: { type: String, trim: true },
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      submittedAt: { type: Date }
    },
    actualBeneficiariesServed: { type: Number, min: 0, default: 0 },
    outcomeSummary: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true }
  },
  { timestamps: true }
);

eventSchema.pre("save", function (next) {
  if (this.isNew && (this.progressPercentage === undefined || this.progressPercentage === 10)) {
    this.progressPercentage = getEventProgress(this.status);
  } else if (this.isModified("status") && !this.isModified("progressPercentage")) {
    this.progressPercentage = getEventProgress(this.status);
  }
  next();
});

export default mongoose.model("Event", eventSchema);
