import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fundraiserId: { type: mongoose.Schema.Types.ObjectId, ref: "Fundraiser", required: true },
    amount: { type: Number, required: true, min: 1 },
    donationType: { type: String, required: true, trim: true },
    donationPurpose: { type: String, required: true, trim: true },
    paymentReference: { type: String, required: true, trim: true },
    donorAnonymous: { type: Boolean, default: false },
    donationStatus: {
      type: String,
      enum: ["Pending", "Submitted", "Under Review", "Verified", "Rejected", "Refunded", "Cancelled"],
      default: "Submitted"
    },
    receiptNumber: { type: String, trim: true },
    verificationNotes: { type: String, trim: true },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    refundedAt: { type: Date },
    refundReason: { type: String, trim: true },
    donationDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

donationSchema.index({ paymentReference: 1 }, { unique: true });

export default mongoose.model("Donation", donationSchema);
