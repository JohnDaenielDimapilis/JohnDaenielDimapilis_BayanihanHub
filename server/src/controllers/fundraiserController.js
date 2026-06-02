import Fundraiser from "../models/Fundraiser.js";
import { createLog } from "./logController.js";

export async function createFundraiser(req, res) {
  try {
    const {
      title,
      purpose,
      targetAmount,
      deadline,
      relatedEvent,
      description,
      utilizationReport,
      reconciliationStatus
    } = req.body;

    if (!title || !purpose || !targetAmount || !deadline || !description) {
      return res.status(400).json({ message: "All required fundraiser fields must be provided." });
    }

    const fundraiser = await Fundraiser.create({
      title,
      purpose,
      targetAmount,
      deadline,
      relatedEvent: relatedEvent || undefined,
      description,
      utilizationReport,
      reconciliationStatus,
      status: req.user.role === "Admin" ? "Approved" : "Pending",
      createdBy: req.user._id,
      approvedBy: req.user.role === "Admin" ? req.user._id : undefined,
      approvedAt: req.user.role === "Admin" ? new Date() : undefined
    });

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Fundraiser Created",
      module: "Fundraiser",
      status: "Success",
      details: {
        recordId: fundraiser._id,
        recordOwner: fundraiser.createdBy,
        newValue: { status: fundraiser.status, title: fundraiser.title, targetAmount: fundraiser.targetAmount },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(201).json({
      message: req.user.role === "Admin" ? "Fundraiser created and approved." : "Fundraiser created and submitted for admin approval.",
      fundraiser
    });
  } catch (error) {
    res.status(500).json({ message: "Fundraiser creation failed.", error: error.message });
  }
}

export async function getFundraisers(req, res) {
  try {
    const filter = req.user.role === "User" ? { status: { $in: ["Approved", "Closed"] } } : {};

    const fundraisers = await Fundraiser.find(filter)
      .populate("createdBy", "name email role")
      .populate("relatedEvent", "title date location status")
      .sort({ deadline: 1 });

    res.status(200).json(fundraisers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch fundraisers.", error: error.message });
  }
}

export async function getFundraiserById(req, res) {
  try {
    const filter = { _id: req.params.id };

    if (req.user.role === "User") {
      filter.status = { $in: ["Approved", "Closed"] };
    }

    const fundraiser = await Fundraiser.findOne(filter)
      .populate("createdBy", "name email role")
      .populate("relatedEvent", "title date location status");

    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found." });
    }

    res.status(200).json(fundraiser);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch fundraiser.", error: error.message });
  }
}

export async function updateFundraiser(req, res) {
  try {
    const fundraiser = await Fundraiser.findById(req.params.id);

    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found." });
    }

    if (req.user.role === "Staff" && fundraiser.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Staff can only update their own fundraisers." });
    }

    const allowedFields = [
      "title",
      "purpose",
      "targetAmount",
      "deadline",
      "relatedEvent",
      "description",
      "utilizationReport",
      "reconciliationStatus",
      "closureReason"
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) fundraiser[field] = req.body[field];
    });

    fundraiser.status = "Pending";
    await fundraiser.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Fundraiser Updated",
      module: "Fundraiser",
      status: "Success",
      details: {
        recordId: fundraiser._id,
        recordOwner: fundraiser.createdBy,
        newValue: { status: fundraiser.status, title: fundraiser.title },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(200).json({
      message: "Fundraiser updated and returned to pending status.",
      fundraiser
    });
  } catch (error) {
    res.status(500).json({ message: "Fundraiser update failed.", error: error.message });
  }
}

export async function deleteFundraiser(req, res) {
  try {
    const fundraiser = await Fundraiser.findById(req.params.id);

    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found." });
    }

    if (req.user.role === "Staff" && fundraiser.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Staff can only delete their own fundraisers." });
    }

    await fundraiser.deleteOne();
    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Fundraiser Deleted",
      module: "Fundraiser",
      status: "Success",
      details: {
        recordId: fundraiser._id,
        recordOwner: fundraiser.createdBy,
        oldValue: { status: fundraiser.status, title: fundraiser.title },
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });
    res.status(200).json({ message: "Fundraiser deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Fundraiser deletion failed.", error: error.message });
  }
}

export async function approveFundraiser(req, res) {
  try {
    const fundraiser = await Fundraiser.findById(req.params.id);

    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found." });
    }

    const { approvalCriteria, approvalRemarks } = req.body;

    fundraiser.status = "Approved";
    fundraiser.approvedBy = req.user._id;
    fundraiser.approvedAt = new Date();
    if (approvalCriteria) fundraiser.approvalCriteria = approvalCriteria;
    if (approvalRemarks) fundraiser.approvalRemarks = approvalRemarks;
    await fundraiser.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Fundraiser Approved",
      module: "Fundraiser",
      status: "Success",
      details: {
        recordId: fundraiser._id,
        recordOwner: fundraiser.createdBy,
        newValue: { status: fundraiser.status, approvalCriteria: fundraiser.approvalCriteria },
        remarks: approvalRemarks,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(200).json({
      message: "Fundraiser approved successfully.",
      fundraiser
    });
  } catch (error) {
    res.status(500).json({ message: "Fundraiser approval failed.", error: error.message });
  }
}

export async function rejectFundraiser(req, res) {
  try {
    const fundraiser = await Fundraiser.findById(req.params.id);

    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found." });
    }

    fundraiser.status = "Rejected";
    fundraiser.rejectedBy = req.user._id;
    fundraiser.rejectedAt = new Date();
    if (!req.body.rejectionReason) {
      return res.status(400).json({ message: "A rejection reason is required for the approval trail." });
    }

    fundraiser.rejectionReason = req.body.rejectionReason;
    await fundraiser.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Fundraiser Rejected",
      module: "Fundraiser",
      status: "Success",
      details: {
        recordId: fundraiser._id,
        recordOwner: fundraiser.createdBy,
        newValue: { status: fundraiser.status },
        rejectionReason: fundraiser.rejectionReason,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(200).json({
      message: "Fundraiser rejected successfully.",
      fundraiser
    });
  } catch (error) {
    res.status(500).json({ message: "Fundraiser rejection failed.", error: error.message });
  }
}

export async function closeFundraiser(req, res) {
  try {
    const fundraiser = await Fundraiser.findById(req.params.id);

    if (!fundraiser) {
      return res.status(404).json({ message: "Fundraiser not found." });
    }

    if (req.user.role === "Staff" && fundraiser.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Staff can only close their own fundraisers." });
    }

    fundraiser.status = "Closed";
    fundraiser.closureReason = req.body.closureReason || "Campaign deadline or target review completed.";
    fundraiser.reconciliationStatus = req.body.reconciliationStatus || fundraiser.reconciliationStatus || "In Progress";
    if (req.body.utilizationReport) fundraiser.utilizationReport = req.body.utilizationReport;
    await fundraiser.save();

    await createLog({
      userId: req.user._id,
      role: req.user.role,
      action: "Fundraiser Closed",
      module: "Fundraiser",
      status: "Success",
      details: {
        recordId: fundraiser._id,
        recordOwner: fundraiser.createdBy,
        newValue: {
          status: fundraiser.status,
          reconciliationStatus: fundraiser.reconciliationStatus
        },
        reason: fundraiser.closureReason,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(200).json({ message: "Fundraiser closed successfully.", fundraiser });
  } catch (error) {
    res.status(500).json({ message: "Fundraiser closure failed.", error: error.message });
  }
}
