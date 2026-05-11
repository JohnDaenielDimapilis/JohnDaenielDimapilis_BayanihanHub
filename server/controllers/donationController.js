const Donation = require("../models/Donation");
const Fundraiser = require("../models/Fundraiser");
const { recordActivity } = require("../services/logService");
const asyncHandler = require("../utils/asyncHandler");

const createDonation = asyncHandler(async (request, response) => {
  const fundraiser = await Fundraiser.findById(request.body.fundraiserId);

  if (!fundraiser || !["approved", "active"].includes(fundraiser.status)) {
    response.status(404);
    throw new Error("Approved fundraiser not found.");
  }

  const donation = await Donation.create({
    donorId: request.user._id,
    fundraiserId: fundraiser._id,
    donationAmount: request.body.donationAmount,
    paymentMethod: request.body.paymentMethod,
    donationStatus: "completed"
  });

  fundraiser.currentAmount += donation.donationAmount;
  if (fundraiser.currentAmount >= fundraiser.targetAmount) {
    fundraiser.status = "completed";
  }
  await fundraiser.save();

  await recordActivity({
    userId: request.user._id,
    activityType: "donation_recorded",
    description: `${request.user.fullName} donated ${donation.donationAmount} to "${fundraiser.campaignTitle}".`,
    ipAddress: request.ip
  });

  response.status(201).json(donation);
});

const getDonations = asyncHandler(async (_request, response) => {
  const donations = await Donation.find()
    .populate("donorId", "fullName email")
    .populate("fundraiserId", "campaignTitle")
    .sort({ createdAt: -1 });

  response.json(donations);
});

const getMyDonations = asyncHandler(async (request, response) => {
  const donations = await Donation.find({ donorId: request.user._id })
    .populate("fundraiserId", "campaignTitle targetAmount currentAmount")
    .sort({ createdAt: -1 });

  response.json(donations);
});

module.exports = { createDonation, getDonations, getMyDonations };
