import mongoose from "mongoose";

const fundraiserSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 1 },
    deadline: { type: Date, required: true },
    relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Fundraiser", fundraiserSchema);
