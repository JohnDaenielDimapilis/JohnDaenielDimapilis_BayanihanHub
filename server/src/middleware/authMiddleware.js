import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createLog } from "../controllers/logController.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized. Token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized. User not found." });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized. Invalid token." });
  }
}

export function authorize(...roles) {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      await createLog({
        userId: req.user._id,
        role: req.user.role,
        action: "Unauthorized Access",
        module: "Security",
        status: "Failed",
        details: { method: req.method, path: req.originalUrl }
      });
      return res.status(403).json({ message: "Access denied. Role not authorized." });
    }

    next();
  };
}
