import Donation from "../models/Donation.js";
import Fundraiser from "../models/Fundraiser.js";
import { updateUserAchievement } from "./achievementController.js";
import { createLog } from "./logController.js";
import { createNotification } from "./notificationController.js";

function makeReceiptNumber(donation) {
  const year = new Date().getFullYear();
  const suffix = donation._id.toString().slice(-6).toUpperCase();
  return `BH-${year}-${suffix}`;
}

export async function createDonation(req, res) {
  try {
    const {
      fundraiserId,
      amount,
      donationType,
      donationPurpose,
      paymentReference,
      proofOfPayment,
      message,
      donorAnonymous = false
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

    const existingReference = await Donation.findOne({ paymentReference });
    if (existingReference) {
      return res.status(409).json({ message: "This payment reference has already been submitted." });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      fundraiserId,
      amount: Number(amount),
      donationType,
      donationPurpose,
      paymentReference,
      proofOfPayment,
      message,
      donorAnonymous,
      donationStatus: "Submitted",
      donationDate: new Date()
    });

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Donation Submitted",
      module: "Donation",
      status: "Success",
      details: {
        recordId: donation._id,
        fundraiserId: fundraiser._id,
        recordOwner: fundraiser.createdBy,
        newValue: { donationStatus: donation.donationStatus, amount: donation.amount },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    await createNotification({
      userId: fundraiser.createdBy,
      title: "Donation submitted",
      message: `${req.user.name} submitted PHP ${Number(donation.amount).toLocaleString()} for "${fundraiser.title}".`,
      type: "Donation",
      relatedRecordId: donation._id
    });
    await createNotification({
      userId: req.user._id,
      title: "Donation submitted",
      message: `Your donation to "${fundraiser.title}" is waiting for verification.`,
      type: "Donation",
      relatedRecordId: donation._id
    });

    res.status(201).json({
      message: "Donation submitted for verification.",
      donation
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This payment reference has already been submitted." });
    }
    res.status(500).json({ message: "Donation submission failed.", error: error.message });
  }
}

export async function getDonations(req, res) {
  try {
    let filter = {};

    if (req.query.fundraiserId) {
      const fundraiser = await Fundraiser.findById(req.query.fundraiserId).select("status createdBy");
      if (!fundraiser) return res.status(404).json({ message: "Fundraiser not found." });
      if (
        req.user.role === "User" &&
        !["Approved", "Closed"].includes(fundraiser.status) &&
        fundraiser.createdBy.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "You cannot view this fundraiser donation history." });
      }
      filter.fundraiserId = req.query.fundraiserId;
    } else if (req.user.role === "User") {
      filter.donor = req.user._id;
    }

    if (req.user.role === "Staff" && !req.query.fundraiserId) {
      const staffFundraisers = await Fundraiser.find({ createdBy: req.user._id }).select("_id");
      filter.fundraiserId = { $in: staffFundraisers.map((fundraiser) => fundraiser._id) };
    }

    const donations = await Donation.find(filter)
      .populate("donor", "name email role showAchievementBadge")
      .populate("fundraiserId", "title purpose beneficiary place targetAmount raisedAmount progressPercentage status createdBy utilizationReport reconciliationStatus")
      .sort({ donationDate: -1 });

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch donations.", error: error.message });
  }
}

export async function verifyDonation(req, res) {
  try {
    const donation = await Donation.findById(req.params.id).populate("fundraiserId");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    if (donation.donationStatus === "Verified") {
      return res.status(400).json({ message: "Donation is already verified." });
    }

    if (["Rejected", "Refunded", "Cancelled"].includes(donation.donationStatus)) {
      return res.status(400).json({ message: `Cannot verify a ${donation.donationStatus.toLowerCase()} donation.` });
    }

    donation.donationStatus = "Verified";
    donation.verifiedBy = req.user._id;
    donation.verifiedAt = new Date();
    donation.verificationNotes = req.body.verificationNotes || donation.verificationNotes;
    donation.receiptNumber = req.body.receiptNumber || donation.receiptNumber || makeReceiptNumber(donation);
    await donation.save();

    const fundraiser = donation.fundraiserId;
    const previousRaised = Number(fundraiser.raisedAmount || 0);
    fundraiser.raisedAmount = Number(fundraiser.raisedAmount || 0) + Number(donation.amount || 0);
    fundraiser.progressUpdates.push({
      donationId: donation._id,
      amount: donation.amount,
      previousRaised,
      newRaised: fundraiser.raisedAmount,
      percentage: fundraiser.targetAmount > 0 ? Math.min(100, Math.round((fundraiser.raisedAmount / fundraiser.targetAmount) * 100)) : 0,
      note: donation.message || donation.verificationNotes || "Donation verified.",
      updatedBy: req.user._id,
      updatedAt: new Date()
    });
    if (fundraiser.raisedAmount >= fundraiser.targetAmount && fundraiser.status === "Approved") {
      fundraiser.reconciliationStatus = fundraiser.reconciliationStatus || "In Progress";
    }
    await fundraiser.save();
    await updateUserAchievement(donation.donor);

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Donation Verified",
      module: "Donation",
      status: "Success",
      details: {
        recordId: donation._id,
        fundraiserId: fundraiser._id,
        recordOwner: fundraiser.createdBy,
        newValue: {
          donationStatus: donation.donationStatus,
          receiptNumber: donation.receiptNumber,
          amount: donation.amount
        },
        remarks: donation.verificationNotes,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    await createNotification({
      userId: donation.donor,
      title: "Donation verified",
      message: `Your PHP ${Number(donation.amount).toLocaleString()} donation to "${fundraiser.title}" was verified.`,
      type: "Donation",
      relatedRecordId: donation._id
    });
    await createNotification({
      userId: fundraiser.createdBy,
      title: "Fundraiser progress updated",
      message: `"${fundraiser.title}" is now PHP ${Number(fundraiser.raisedAmount).toLocaleString()} of PHP ${Number(fundraiser.targetAmount).toLocaleString()}.`,
      type: "Donation",
      relatedRecordId: fundraiser._id
    });

    res.status(200).json({ message: "Donation verified and receipt recorded.", donation });
  } catch (error) {
    res.status(500).json({ message: "Donation verification failed.", error: error.message });
  }
}

export async function rejectDonation(req, res) {
  try {
    const donation = await Donation.findById(req.params.id).populate("fundraiserId");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    if (!req.body.rejectionReason) {
      return res.status(400).json({ message: "A rejection reason is required." });
    }

    if (donation.donationStatus === "Verified") {
      const fundraiser = donation.fundraiserId;
      fundraiser.raisedAmount = Math.max(0, Number(fundraiser.raisedAmount || 0) - Number(donation.amount || 0));
      await fundraiser.save();
    }

    donation.donationStatus = "Rejected";
    donation.rejectedBy = req.user._id;
    donation.rejectedAt = new Date();
    donation.rejectionReason = req.body.rejectionReason;
    await donation.save();
    await updateUserAchievement(donation.donor);

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Donation Rejected",
      module: "Donation",
      status: "Success",
      details: {
        recordId: donation._id,
        fundraiserId: donation.fundraiserId._id,
        recordOwner: donation.fundraiserId.createdBy,
        newValue: { donationStatus: donation.donationStatus },
        rejectionReason: donation.rejectionReason,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    await createNotification({
      userId: donation.donor,
      title: "Donation rejected",
      message: `Your donation was rejected: ${donation.rejectionReason}`,
      type: "Donation",
      relatedRecordId: donation._id
    });

    res.status(200).json({ message: "Donation rejected.", donation });
  } catch (error) {
    res.status(500).json({ message: "Donation rejection failed.", error: error.message });
  }
}

export async function refundDonation(req, res) {
  try {
    const donation = await Donation.findById(req.params.id).populate("fundraiserId");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    if (!req.body.refundReason) {
      return res.status(400).json({ message: "A refund reason is required." });
    }

    if (donation.donationStatus === "Verified") {
      const fundraiser = donation.fundraiserId;
      fundraiser.raisedAmount = Math.max(0, Number(fundraiser.raisedAmount || 0) - Number(donation.amount || 0));
      await fundraiser.save();
    }

    donation.donationStatus = "Refunded";
    donation.refundedBy = req.user._id;
    donation.refundedAt = new Date();
    donation.refundReason = req.body.refundReason;
    await donation.save();
    await updateUserAchievement(donation.donor);

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Donation Refunded",
      module: "Donation",
      status: "Success",
      details: {
        recordId: donation._id,
        fundraiserId: donation.fundraiserId._id,
        recordOwner: donation.fundraiserId.createdBy,
        newValue: { donationStatus: donation.donationStatus },
        refundReason: donation.refundReason,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    await createNotification({
      userId: donation.donor,
      title: "Donation refunded",
      message: `Your donation was marked as refunded: ${donation.refundReason}`,
      type: "Donation",
      relatedRecordId: donation._id
    });

    res.status(200).json({ message: "Donation marked as refunded.", donation });
  } catch (error) {
    res.status(500).json({ message: "Donation refund failed.", error: error.message });
  }
}
