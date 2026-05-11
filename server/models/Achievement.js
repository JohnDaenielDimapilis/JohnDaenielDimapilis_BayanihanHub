const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  achievementTitle: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  achievementType: {
    type: String,
    enum: ["volunteer", "donor", "participant", "feedback", "milestone"],
    required: true
  },
  earnedDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Achievement", achievementSchema);
