import Achievement from "../models/Achievement.js";
import Donation from "../models/Donation.js";
import Feedback from "../models/Feedback.js";
import Participant from "../models/Participant.js";

export async function updateUserAchievement(userId) {
  const [totalEventsJoined, totalDonations, totalFeedbackSubmitted] = await Promise.all([
    Participant.countDocuments({ userId, participationStatus: { $ne: "Cancelled" } }),
    Donation.countDocuments({ donor: userId }),
    Feedback.countDocuments({ userId })
  ]);

  const badges = [];
  if (totalEventsJoined >= 1) badges.push("Event Participant");
  if (totalDonations >= 1) badges.push("Donor");
  if (totalFeedbackSubmitted >= 1) badges.push("Feedback Contributor");

  const points =
    totalEventsJoined * 10 +
    totalDonations * 10 +
    totalFeedbackSubmitted * 5;

  return Achievement.findOneAndUpdate(
    { userId },
    {
      userId,
      points,
      badges,
      totalEventsJoined,
      totalDonations,
      totalFeedbackSubmitted
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
      .sort({ points: -1 });

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
