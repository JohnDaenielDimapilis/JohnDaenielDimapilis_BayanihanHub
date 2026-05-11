const Achievement = require("../models/Achievement");
const Donation = require("../models/Donation");
const Event = require("../models/Event");
const Feedback = require("../models/Feedback");
const Fundraiser = require("../models/Fundraiser");
const User = require("../models/User");

const getSummaryReport = async () => {
  const [
    totalEvents,
    pendingEvents,
    approvedFundraisers,
    totalDonations,
    registeredUsers,
    activeParticipants,
    recentFeedback
  ] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ status: "pending" }),
    Fundraiser.countDocuments({ status: "approved" }),
    Donation.aggregate([{ $group: { _id: null, total: { $sum: "$donationAmount" } } }]),
    User.countDocuments(),
    Event.aggregate([{ $unwind: "$participants" }, { $count: "count" }]),
    Feedback.find().sort({ createdAt: -1 }).limit(5).populate("userId", "fullName").populate("eventId", "eventTitle")
  ]);

  return {
    totalEvents,
    pendingEvents,
    approvedFundraisers,
    totalDonations: totalDonations[0]?.total || 0,
    registeredUsers,
    activeParticipants: activeParticipants[0]?.count || 0,
    recentFeedback
  };
};

const getEventReport = async () => {
  return Event.find()
    .populate("createdBy", "fullName email")
    .populate("approvedBy", "fullName email")
    .sort({ createdAt: -1 });
};

const getFundraisingReport = async () => {
  return Fundraiser.find()
    .populate("createdBy", "fullName email")
    .populate("approvedBy", "fullName email")
    .sort({ createdAt: -1 });
};

const getParticipationReport = async () => {
  const events = await Event.find().populate("participants", "fullName email").sort({ eventDate: 1 });
  const achievements = await Achievement.find().populate("userId", "fullName email").sort({ earnedDate: -1 });
  return { events, achievements };
};

module.exports = {
  getEventReport,
  getFundraisingReport,
  getParticipationReport,
  getSummaryReport
};
