import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { createLog } from "./logController.js";

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

function isStrongPassword(password) {
  return typeof password === "string" &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);
}

function getLoginAttempt(email) {
  const key = String(email || "").toLowerCase();
  const attempt = loginAttempts.get(key);
  if (attempt?.lockedUntil && attempt.lockedUntil > Date.now()) return attempt;
  if (attempt?.lockedUntil && attempt.lockedUntil <= Date.now()) loginAttempts.delete(key);
  return loginAttempts.get(key) || { count: 0, lockedUntil: null };
}

function recordFailedLogin(email) {
  const key = String(email || "").toLowerCase();
  const attempt = getLoginAttempt(key);
  const count = attempt.count + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
  loginAttempts.set(key, { count, lockedUntil });
  return { count, lockedUntil };
}

async function normalizeAccountStatus(user) {
  if (user.accountStatus === "Temporarily Banned" && user.banUntil && new Date(user.banUntil) <= new Date()) {
    user.accountStatus = "Active";
    user.banUntil = undefined;
    user.banReason = undefined;
    user.bannedBy = undefined;
    user.isActive = true;
    await user.save();
  }
  return user;
}

function generateToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, privacyConsent } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (!privacyConsent) {
      return res.status(400).json({ message: "Privacy consent is required to register." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, and a number." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "User",
      privacyConsentAt: new Date()
    });

    await createLog({
      userId: user._id,
      role: user.role,
      action: "Account Registered",
      module: "Authentication",
      status: "Success",
      details: {
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.status(201).json({
      message: "Account registered successfully.",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        showAchievementBadge: user.showAchievementBadge
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const attempt = getLoginAttempt(email);
    if (attempt.lockedUntil) {
      return res.status(429).json({ message: "Too many failed login attempts. Please try again in a few minutes." });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      const failedAttempt = recordFailedLogin(email);
      await createLog({
        role: "Guest",
        action: "Login Failed",
        module: "Authentication",
        status: "Failed",
        details: {
          email,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          reason: failedAttempt.lockedUntil ? "Account temporarily locked after failed attempts." : "Invalid email or password."
        }
      });
      return res.status(failedAttempt.lockedUntil ? 429 : 401).json({
        message: failedAttempt.lockedUntil ? "Too many failed login attempts. Please try again in a few minutes." : "Invalid email or password."
      });
    }

    await normalizeAccountStatus(user);

    if (user.isActive === false || user.accountStatus === "Disabled" || user.accountStatus === "Temporarily Banned") {
      await createLog({
        userId: user._id,
        role: user.role,
        action: "Login Blocked",
        module: "Authentication",
        status: "Failed",
        details: {
          email: user.email,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          reason: user.accountStatus === "Temporarily Banned"
            ? `Account is temporarily banned until ${new Date(user.banUntil).toLocaleString()}.`
            : "Account is inactive."
        }
      });
      return res.status(403).json({
        message: user.accountStatus === "Temporarily Banned"
          ? `This account is temporarily banned until ${new Date(user.banUntil).toLocaleString()}.`
          : "This account is inactive. Please contact an administrator."
      });
    }

    await createLog({
      userId: user._id,
      role: user.role,
      action: "Login Success",
      module: "Authentication",
      status: "Success",
      details: {
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });

    res.json({
      message: "Login successful.",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        showAchievementBadge: user.showAchievementBadge
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
}

export async function googleDemoLogin(req, res) {
  try {
    const email = (req.body.email || "google.user@bayanihanhub.test").toLowerCase();
    const name = req.body.name || "Google Demo User";
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: `GoogleDemo${Date.now()}`,
        role: "User",
        privacyConsentAt: new Date()
      });
    }

    await normalizeAccountStatus(user);

    if (user.isActive === false || user.accountStatus === "Disabled" || user.accountStatus === "Temporarily Banned") {
      return res.status(403).json({ message: "This account is inactive. Please contact an administrator." });
    }

    await createLog({
      userId: user._id,
      role: user.role,
      action: "Google Demo Login Success",
      module: "Authentication",
      status: "Success",
      details: {
        email: user.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")
      }
    });
    loginAttempts.delete(email.toLowerCase());

    res.json({
      message: "Google demo login successful.",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        showAchievementBadge: user.showAchievementBadge
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Google demo login failed.", error: error.message });
  }
}
