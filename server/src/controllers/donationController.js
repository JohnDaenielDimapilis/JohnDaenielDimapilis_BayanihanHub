import Donation from "../models/Donation.js";
import Fundraiser from "../models/Fundraiser.js";
import { createLog } from "./logController.js";

export async function createDonation(req, res) {
  try {
    const {
      fundraiserId,
      amount,
      donationType,
      donationPurpose,
      paymentReference
    } = req.body;

    if (!fundraiserId || !amount || !donationType || !donationPurpose || !paymentReference) {
      return res.status(400).json({ message: "All donation fields are required." });
    }

    const fundraiser = await Fundraiser.findById(fundraiserId);

    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found." });
    }

    if (fundraiser.status !== "Approved") {
      return res.status(400).json({ message: "Donations can only be submitted to approved fundraisers." });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      fundraiserId,
      amount,
      donationType,
      donationPurpose,
      paymentReference,
      donationStatus: "Recorded",
      donationDate: new Date()
    });

    // Update fundraiser's raisedAmount
    fundraiser.raisedAmount = (fundraiser.raisedAmount || 0) + amount;
    await fundraiser.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Donation Submitted",
      module: "Donation",
      status: "Success",
      details: { recordId: donation._id, fundraiserId: fundraiser._id, recordOwner: fundraiser.createdBy }
    });

    res.status(201).json({
      message: "Donation recorded successfully.",
      donation
    });
  } catch (error) {
    res.status(500).json({ message: "Donation submission failed.", error: error.message });
  }
}

export async function getDonations(req, res) {
  try {
    let filter = {};

    if (req.user.role === "User") {
      filter.donor = req.user._id;
    }

    if (req.user.role === "Staff") {
      const staffFundraisers = await Fundraiser.find({ createdBy: req.user._id }).select("_id");
      filter.fundraiserId = { $in: staffFundraisers.map((fundraiser) => fundraiser._id) };
    }

    const donations = await Donation.find(filter)
      .populate("donor", "name email role")
      .populate("fundraiserId", "title purpose targetAmount status createdBy")
      .sort({ donationDate: -1 });

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch donations.", error: error.message });
  }
}
