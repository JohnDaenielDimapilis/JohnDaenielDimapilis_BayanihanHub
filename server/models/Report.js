const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reportTitle: {
    type: String,
    required: true,
    trim: true
  },
  reportType: {
    type: String,
    enum: ["summary", "events", "fundraising", "participation", "custom"],
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reportData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Report", reportSchema);
