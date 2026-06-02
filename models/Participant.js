import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    attendanceStatus: {
      type: String,
      enum: ["Pending", "Present", "Absent"],
      default: "Pending"
    },
    participationStatus: {
      type: String,
      enum: ["Joined", "Completed", "Cancelled"],
      default: "Joined"
    },
    joinedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

participantSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model("Participant", participantSchema);
