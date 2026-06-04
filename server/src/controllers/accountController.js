import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Feedback from "../models/Feedback.js";
import Participant from "../models/Participant.js";
import { logActivity } from "../utils/logActivity.js";

function isStrongPassword(password) {
  return typeof password === "string" &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);
}

export async function listAccounts(req, res, next) {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function createAccount(req, res, next) {
  try {
    const user = await User.create(req.body);
    await logActivity(req, { action: "Created user account", module: "Account Management", affectedRecord: user._id });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409);
      return next(new Error("Email is already registered."));
    }
    next(error);
  }
}

export async function updateAccount(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error("Account not found."));
    }

    const allowed = ["name", "email", "role", "phone", "address", "isActive"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.body.password) user.password = req.body.password;
    await user.save();
    await logActivity(req, { action: "Updated user account", module: "Account Management", affectedRecord: user._id });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error("Account not found."));
    }

    await logActivity(req, { action: "Deleted user account", module: "Account Management", affectedRecord: user._id });
    res.json({ message: "Account deleted." });
  } catch (error) {
    next(error);
  }
}

export async function getMyAccount(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateMyAccount(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error("Account not found."));
    }

    ["name", "phone", "address"].forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    await logActivity(req, { action: "Updated own profile", module: "Account Self-Service", affectedRecord: user._id });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address });
  } catch (error) {
    next(error);
  }
}

export async function changeMyPassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !isStrongPassword(newPassword)) {
      res.status(400);
      return next(new Error("New password must be at least 8 characters and include uppercase, lowercase, and a number."));
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user || !(await user.matchPassword(currentPassword))) {
      res.status(401);
      return next(new Error("Current password is incorrect."));
    }

    user.password = newPassword;
    await user.save();
    await logActivity(req, { action: "Changed own password", module: "Account Self-Service", affectedRecord: user._id });
    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
}

export async function exportMyData(req, res, next) {
  try {
    const [profile, participants, donations, feedback] = await Promise.all([
      User.findById(req.user._id).select("-password"),
      Participant.find({ userId: req.user._id }).populate("eventId", "title date location status"),
      Donation.find({ donor: req.user._id }).populate("fundraiserId", "title purpose utilizationReport reconciliationStatus"),
      Feedback.find({ userId: req.user._id }).populate("eventId", "title date status")
    ]);

    res.json({
      exportedAt: new Date().toISOString(),
      profile,
      participants,
      donations,
      feedback
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateMyAccount(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      return next(new Error("Account not found."));
    }

    user.isActive = false;
    await user.save();
    await logActivity(req, { action: "Deactivated own account", module: "Account Self-Service", affectedRecord: user._id });
    res.json({ message: "Account deactivated." });
  } catch (error) {
    next(error);
  }
}
