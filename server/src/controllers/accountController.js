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

function canStaffManageAccount(req, user) {
  return req.user.role !== "Staff" || user.role === "User";
}

export async function listAccounts(req, res, next) {
  try {
    const filter = req.user.role === "Staff" ? { role: "User" } : {};
    if (["User", "Staff", "Admin"].includes(req.query.role)) {
      if (req.user.role === "Staff" && req.query.role !== "User") return res.json([]);
      filter.role = req.query.role;
    }
    const users = await User.find(filter).select("-password").populate("bannedBy", "name email role").sort({ createdAt: -1 });
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

    if (!canStaffManageAccount(req, user)) {
      res.status(403);
      return next(new Error("Staff can only manage regular user accounts."));
    }

    const allowed = req.user.role === "Staff"
      ? ["name", "email", "phone", "address"]
      : ["name", "email", "role", "phone", "address", "isActive", "accountStatus"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.user.role === "Admin" && req.body.password) user.password = req.body.password;
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

export async function resetAccountPassword(req, res, next) {
  try {
    const { password } = req.body;
    if (!isStrongPassword(password)) {
      res.status(400);
      return next(new Error("New password must be at least 8 characters and include uppercase, lowercase, and a number."));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error("Account not found."));
    }

    user.password = password;
    await user.save();
    await logActivity(req, { action: "Reset account password", module: "Accounts", affectedRecord: user._id, remarks: `Reset password for ${user.email}` });
    res.json({ message: "Password reset successfully." });
  } catch (error) {
    next(error);
  }
}

export async function banAccount(req, res, next) {
  try {
    const { amount = 7, unit = "days", banReason = "Administrative temporary ban" } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error("Account not found."));
    }

    if (!canStaffManageAccount(req, user)) {
      res.status(403);
      return next(new Error("Staff can only temporarily restrict regular user accounts."));
    }

    const numericAmount = Math.max(1, Number(amount || 1));
    const banUntil = new Date();
    if (unit === "months") banUntil.setMonth(banUntil.getMonth() + numericAmount);
    else if (unit === "years") banUntil.setFullYear(banUntil.getFullYear() + numericAmount);
    else banUntil.setDate(banUntil.getDate() + numericAmount);

    user.accountStatus = "Temporarily Banned";
    user.isActive = false;
    user.banUntil = banUntil;
    user.banReason = banReason;
    user.bannedBy = req.user._id;
    await user.save();

    await logActivity(req, {
      action: "Temporarily Banned Account",
      module: "Accounts",
      affectedRecord: user._id,
      remarks: `Banned ${user.email} until ${banUntil.toLocaleDateString()}`
    });

    res.json({ message: "Account temporarily banned.", user: { id: user._id, accountStatus: user.accountStatus, banUntil: user.banUntil } });
  } catch (error) {
    next(error);
  }
}

export async function unbanAccount(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error("Account not found."));
    }

    if (!canStaffManageAccount(req, user)) {
      res.status(403);
      return next(new Error("Staff can only restore regular user accounts."));
    }

    user.accountStatus = "Active";
    user.isActive = true;
    user.banUntil = undefined;
    user.banReason = undefined;
    user.bannedBy = undefined;
    await user.save();

    await logActivity(req, {
      action: "Unbanned Account",
      module: "Accounts",
      affectedRecord: user._id,
      remarks: `Restored ${user.email}`
    });

    res.json({ message: "Account unbanned.", user: { id: user._id, accountStatus: user.accountStatus } });
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

    ["name", "phone", "address", "showAchievementBadge"].forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    await logActivity(req, { action: "Updated own profile", module: "Account Self-Service", affectedRecord: user._id });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      showAchievementBadge: user.showAchievementBadge
    });
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
