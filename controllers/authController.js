import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { createLog } from "./logController.js";

function generateToken(userId, role) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const user = await User.create({ name, email, password, role: "User" });

    res.status(201).json({
      message: "Account registered successfully.",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      await createLog({
        role: "Guest",
        action: "Login Failed",
        module: "Authentication",
        status: "Failed",
        details: { email }
      });
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await createLog({
      userId: user._id,
      role: user.role,
      action: "Login Success",
      module: "Authentication",
      status: "Success",
      details: { email: user.email }
    });

    res.json({
      message: "Login successful.",
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
}
