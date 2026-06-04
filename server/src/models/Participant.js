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
      enum: ["Joined", "Waitlisted", "Completed", "Cancelled"],
      default: "Joined"
    },
    joinedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
    cancellationReason: { type: String, trim: true },
    waitlistPosition: { type: Number, min: 1 },
    checkInCode: { type: String, trim: true },
    checkInMethod: {
      type: String,
      enum: ["QR", "Manual"],
      default: "QR"
    },
    checkedInAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attendanceRemarks: { type: String, trim: true }
  },
  { timestamps: true }
);

participantSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model("Participant", participantSchema);
