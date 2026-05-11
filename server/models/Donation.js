const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fundraiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fundraiser",
    required: true
  },
  donationAmount: {
    type: Number,
    required: true,
    min: 1
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "bank_transfer", "gcash", "maya", "card", "other"],
    required: true
  },
  donationStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "completed"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);
