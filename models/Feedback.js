import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    suggestions: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
  }
);

feedbackSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model("Feedback", feedbackSchema);
