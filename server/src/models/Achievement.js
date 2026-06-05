import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    points: { type: Number, default: 0 },
    badges: [{ type: String, trim: true }],
    totalEventsJoined: { type: Number, default: 0 },
    totalCompletedAttendedEvents: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    totalDonationAmount: { type: Number, default: 0 },
    totalFeedbackSubmitted: { type: Number, default: 0 },
    donationBadge: { type: String, trim: true },
    eventBadge: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Achievement", achievementSchema);
