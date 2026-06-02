import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fundraiserId: { type: mongoose.Schema.Types.ObjectId, ref: "Fundraiser", required: true },
    amount: { type: Number, required: true, min: 1 },
    donationType: { type: String, required: true, trim: true },
    donationPurpose: { type: String, required: true, trim: true },
    paymentReference: { type: String, required: true, trim: true },
    donationStatus: { type: String, enum: ["Pending", "Recorded"], default: "Pending" },
    donationDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
