const Fundraiser = require("../models/Fundraiser");
const { recordActivity } = require("../services/logService");
const asyncHandler = require("../utils/asyncHandler");

const createFundraiser = asyncHandler(async (request, response) => {
  const fundraiser = await Fundraiser.create({
    ...request.body,
    createdBy: request.user._id,
    currentAmount: 0,
    status: "pending"
  });

  await recordActivity({
    userId: request.user._id,
    activityType: "fundraiser_created",
    description: `${request.user.fullName} submitted fundraiser "${fundraiser.campaignTitle}" for approval.`,
    ipAddress: request.ip
  });

  response.status(201).json(fundraiser);
});

const getFundraisers = asyncHandler(async (request, response) => {
  const filter =
    request.user.role === "admin" ? {} : { $or: [{ status: "approved" }, { createdBy: request.user._id }] };
  const fundraisers = await Fundraiser.find(filter)
    .populate("createdBy", "fullName email")
    .populate("approvedBy", "fullName email")
    .sort({ createdAt: -1 });

  response.json(fundraisers);
});

const getApprovedFundraisers = asyncHandler(async (_request, response) => {
  const fundraisers = await Fundraiser.find({ status: { $in: ["approved", "active"] } })
    .populate("createdBy", "fullName email")
    .sort({ endDate: 1 });

  response.json(fundraisers);
});

const getFundraiserById = asyncHandler(async (request, response) => {
  const fundraiser = await Fundraiser.findById(request.params.id)
    .populate("createdBy", "fullName email")
    .populate("approvedBy", "fullName email");

  if (!fundraiser) {
    response.status(404);
    throw new Error("Fundraiser not found.");
  }

  response.json(fundraiser);
});

const updateFundraiser = asyncHandler(async (request, response) => {
  const fundraiser = await Fundraiser.findById(request.params.id);

  if (!fundraiser) {
    response.status(404);
    throw new Error("Fundraiser not found.");
  }

  if (request.user.role !== "admin" && fundraiser.createdBy.toString() !== request.user._id.toString()) {
    response.status(403);
    throw new Error("You can only update fundraisers you created.");
  }

  Object.assign(fundraiser, {
    campaignTitle: request.body.campaignTitle ?? fundraiser.campaignTitle,
    description: request.body.description ?? fundraiser.description,
    targetAmount: request.body.targetAmount ?? fundraiser.targetAmount,
    startDate: request.body.startDate ?? fundraiser.startDate,
    endDate: request.body.endDate ?? fundraiser.endDate,
    status: request.user.role === "admin" && request.body.status ? request.body.status : "pending"
  });

  await fundraiser.save();
  await recordActivity({
    userId: request.user._id,
    activityType: "fundraiser_updated",
    description: `${request.user.fullName} updated fundraiser "${fundraiser.campaignTitle}".`,
    ipAddress: request.ip
  });

  response.json(fundraiser);
});

const deleteFundraiser = asyncHandler(async (request, response) => {
  const fundraiser = await Fundraiser.findById(request.params.id);

  if (!fundraiser) {
    response.status(404);
    throw new Error("Fundraiser not found.");
  }

  if (request.user.role !== "admin" && fundraiser.createdBy.toString() !== request.user._id.toString()) {
    response.status(403);
    throw new Error("You can only delete fundraisers you created.");
  }

  await fundraiser.deleteOne();
  await recordActivity({
    userId: request.user._id,
    activityType: "fundraiser_deleted",
    description: `${request.user.fullName} deleted fundraiser "${fundraiser.campaignTitle}".`,
    ipAddress: request.ip
  });

  response.json({ message: "Fundraiser deleted successfully." });
});

const approveFundraiser = asyncHandler(async (request, response) => {
  const fundraiser = await Fundraiser.findByIdAndUpdate(
    request.params.id,
    { status: "approved", approvedBy: request.user._id },
    { new: true }
  );

  if (!fundraiser) {
    response.status(404);
    throw new Error("Fundraiser not found.");
  }

  await recordActivity({
    userId: request.user._id,
    activityType: "approval_fundraiser_approved",
    description: `${request.user.fullName} approved fundraiser "${fundraiser.campaignTitle}".`,
    ipAddress: request.ip
  });

  response.json(fundraiser);
});

const rejectFundraiser = asyncHandler(async (request, response) => {
  const fundraiser = await Fundraiser.findByIdAndUpdate(
    request.params.id,
    { status: "rejected", approvedBy: request.user._id },
    { new: true }
  );

  if (!fundraiser) {
    response.status(404);
    throw new Error("Fundraiser not found.");
  }

  await recordActivity({
    userId: request.user._id,
    activityType: "approval_fundraiser_rejected",
    description: `${request.user.fullName} rejected fundraiser "${fundraiser.campaignTitle}".`,
    ipAddress: request.ip
  });

  response.json(fundraiser);
});

module.exports = {
  approveFundraiser,
  createFundraiser,
  deleteFundraiser,
  getApprovedFundraisers,
  getFundraiserById,
  getFundraisers,
  rejectFundraiser,
  updateFundraiser
};
