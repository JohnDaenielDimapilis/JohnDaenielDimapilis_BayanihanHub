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

    if (req.user.accountStatus === "Temporarily Banned" && req.user.banUntil && new Date(req.user.banUntil) <= new Date()) {
      req.user.accountStatus = "Active";
      req.user.banUntil = undefined;
      req.user.banReason = undefined;
      req.user.bannedBy = undefined;
      req.user.isActive = true;
      await req.user.save();
    }

    if (req.user.isActive === false || req.user.accountStatus === "Disabled" || req.user.accountStatus === "Temporarily Banned") {
      await createLog({
        userId: req.user._id,
        role: req.user.role,
        action: "Inactive Account Access Blocked",
        module: "Security",
        status: "Failed",
        details: {
          method: req.method,
          path: req.originalUrl,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          reason: req.user.accountStatus === "Temporarily Banned"
            ? `Account is temporarily banned until ${new Date(req.user.banUntil).toLocaleString()}.`
            : "Account is inactive."
        }
      });
      return res.status(403).json({
        message: req.user.accountStatus === "Temporarily Banned"
          ? `Account is temporarily banned until ${new Date(req.user.banUntil).toLocaleString()}.`
          : "Account is inactive."
      });
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
        details: {
          method: req.method,
          path: req.originalUrl,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          reason: `Role ${req.user.role} is not allowed for this route.`
        }
      });
      return res.status(403).json({ message: "Access denied. Role not authorized." });
    }

    next();
  };
}
