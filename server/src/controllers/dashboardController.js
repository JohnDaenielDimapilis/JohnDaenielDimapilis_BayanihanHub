import Achievement from "../models/Achievement.js";
import Donation from "../models/Donation.js";
import Event from "../models/Event.js";
import Fundraiser from "../models/Fundraiser.js";
import Participant from "../models/Participant.js";

export async function dashboard(req, res, next) {
  try {
    const eventFilterForUsers = req.user.role === "User" ? { status: { $in: ["Approved", "Published", "Open", "Full"] } } : {};
    const fundraiserFilterForUsers = req.user.role === "User" ? { status: { $in: ["Approved", "Closed"] } } : {};
    const [
      events,
      pendingEvents,
      pendingFundraisers,
      fundraisers,
      donations,
      participants,
      achievements
    ] = await Promise.all([
      Event.countDocuments(eventFilterForUsers),
      Event.countDocuments({ status: "Pending" }),
      Fundraiser.countDocuments({ status: "Pending" }),
      Fundraiser.countDocuments(fundraiserFilterForUsers),
      Donation.aggregate([
        { $match: { donationStatus: "Verified" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
      ]),
      Participant.countDocuments(req.user.role === "User" ? { userId: req.user._id } : {}),
      Achievement.countDocuments(req.user.role === "User" ? { userId: req.user._id } : {})
    ]);

    res.json({
      events,
      fundraisers,
      pendingApprovals: pendingEvents + pendingFundraisers,
      donationTotal: donations[0]?.total || 0,
      donationCount: donations[0]?.count || 0,
      participants,
      achievements
    });
  } catch (error) {
    next(error);
  }
}
