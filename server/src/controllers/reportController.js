import Achievement from "../models/Achievement.js";
import Donation from "../models/Donation.js";
import Event from "../models/Event.js";
import Feedback from "../models/Feedback.js";
import Fundraiser from "../models/Fundraiser.js";
import Participant from "../models/Participant.js";
import User from "../models/User.js";

function countByStatus(records, status) {
  return records.filter((record) => record.status === status).length;
}

export async function getReports(req, res) {
  try {
    if (req.user.role === "Admin") {
      const [
        totalUsers,
        events,
        totalParticipants,
        fundraisers,
        donations,
        totalFeedback,
        totalAchievements
      ] = await Promise.all([
        User.countDocuments(),
        Event.find({}).select("status"),
        Participant.countDocuments(),
        Fundraiser.find({}).select("status"),
        Donation.find({}).select("amount"),
        Feedback.countDocuments(),
        Achievement.countDocuments()
      ]);

      const totalDonationAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);

      return res.status(200).json({
        totalUsers,
        totalEvents: events.length,
        pendingEvents: countByStatus(events, "Pending"),
        approvedEvents: countByStatus(events, "Approved"),
        rejectedEvents: countByStatus(events, "Rejected"),
        totalParticipants,
        totalFundraisers: fundraisers.length,
        pendingFundraisers: countByStatus(fundraisers, "Pending"),
        approvedFundraisers: countByStatus(fundraisers, "Approved"),
        rejectedFundraisers: countByStatus(fundraisers, "Rejected"),
        totalDonations: donations.length,
        totalDonationAmount,
        totalFeedback,
        totalAchievements
      });
    }

    const staffEvents = await Event.find({ createdBy: req.user._id }).select("_id status");
    const staffFundraisers = await Fundraiser.find({ createdBy: req.user._id }).select("_id status");
    const eventIds = staffEvents.map((event) => event._id);
    const fundraiserIds = staffFundraisers.map((fundraiser) => fundraiser._id);

    const [totalParticipants, donations, totalFeedback] = await Promise.all([
      Participant.countDocuments({ eventId: { $in: eventIds } }),
      Donation.find({ fundraiserId: { $in: fundraiserIds } }).select("amount"),
      Feedback.countDocuments({ eventId: { $in: eventIds } })
    ]);

    const totalDonationAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);

    res.status(200).json({
      totalEvents: staffEvents.length,
      pendingEvents: countByStatus(staffEvents, "Pending"),
      approvedEvents: countByStatus(staffEvents, "Approved"),
      rejectedEvents: countByStatus(staffEvents, "Rejected"),
      totalParticipants,
      totalFundraisers: staffFundraisers.length,
      pendingFundraisers: countByStatus(staffFundraisers, "Pending"),
      approvedFundraisers: countByStatus(staffFundraisers, "Approved"),
      rejectedFundraisers: countByStatus(staffFundraisers, "Rejected"),
      totalDonations: donations.length,
      totalDonationAmount,
      totalFeedback
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate reports.", error: error.message });
  }
}
