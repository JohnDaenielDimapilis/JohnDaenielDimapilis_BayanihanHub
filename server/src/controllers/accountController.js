import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";

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
