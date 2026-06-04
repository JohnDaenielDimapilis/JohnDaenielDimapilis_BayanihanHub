import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Event", "Participant", "Feedback", "Donation", "Security", "System"],
      default: "System"
    },
    relatedRecordId: { type: mongoose.Schema.Types.ObjectId },
    readAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
