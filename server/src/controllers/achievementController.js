import Achievement from "../models/Achievement.js";
import Donation from "../models/Donation.js";
import Feedback from "../models/Feedback.js";
import Participant from "../models/Participant.js";
import mongoose from "mongoose";

const DONATION_MILESTONES = [
  { threshold: 500, label: "Level 1 Donator" },
  { threshold: 2000, label: "Level 2 Donator" },
  { threshold: 5000, label: "Level 3 Donator" },
  { threshold: 7500, label: "Level 4 Donator" },
  { threshold: 10000, label: "Level 5 Donator" }
];

const EVENT_MILESTONES = [
  { threshold: 1, label: "Level 1 Helper" },
  { threshold: 3, label: "Level 2 Helper" },
  { threshold: 5, label: "Level 3 Helper" },
  { threshold: 7, label: "Level 4 Helper" },
  { threshold: 10, label: "Level 5 Helper" }
];

function pickMilestone(value, milestones) {
  return milestones.reduce((best, milestone) => (
    Number(value || 0) >= milestone.threshold ? milestone : best
  ), null);
}

export async function updateUserAchievement(userId) {
  const objectUserId = mongoose.Types.ObjectId.isValid(String(userId))
    ? new mongoose.Types.ObjectId(String(userId))
    : userId;

  const [totalEventsJoined, totalCompletedAttendedEvents, donationSummary, totalFeedbackSubmitted] = await Promise.all([
    Participant.countDocuments({ userId, participationStatus: { $ne: "Cancelled" } }),
    Participant.countDocuments({ userId, participationStatus: "Completed", attendanceStatus: "Present" }),
    Donation.aggregate([
      { $match: { donor: objectUserId, donationStatus: "Verified" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]),
    Feedback.countDocuments({ userId })
  ]);

  const totalDonations = donationSummary[0]?.count || 0;
  const totalDonationAmount = donationSummary[0]?.totalAmount || 0;
  const donationBadge = pickMilestone(totalDonationAmount, DONATION_MILESTONES)?.label || "";
  const eventBadge = pickMilestone(totalEventsJoined, EVENT_MILESTONES)?.label || "";
  const badges = [donationBadge, eventBadge].filter(Boolean);

  return Achievement.findOneAndUpdate(
    { userId },
    {
      userId,
      points: 0,
      badges,
      totalEventsJoined,
      totalCompletedAttendedEvents,
      totalDonations,
      totalDonationAmount,
      totalFeedbackSubmitted,
      donationBadge,
      eventBadge
    },
    { new: true, upsert: true }
  );
}

export async function getAchievements(req, res) {
  try {
    if (req.user.role === "User") {
      const achievement = await updateUserAchievement(req.user._id);
      return res.status(200).json(achievement);
    }

    const achievements = await Achievement.find({})
      .populate("userId", "name email role")
      .sort({ totalDonationAmount: -1, totalEventsJoined: -1, totalCompletedAttendedEvents: -1 });

    res.status(200).json(achievements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch achievements.", error: error.message });
  }
}

export async function recalculateAchievement(req, res) {
  try {
    const targetUserId = req.params.userId || req.user._id;

    if (req.user.role === "User" && targetUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Users can only recalculate their own achievement." });
    }

    const achievement = await updateUserAchievement(targetUserId);

    res.status(200).json({
      message: "Achievement updated successfully.",
      achievement
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update achievement.", error: error.message });
  }
}
