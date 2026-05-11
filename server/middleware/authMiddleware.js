const jwt = require("jsonwebtoken");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (request, response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    response.status(401);
    throw new Error("Authentication token is required.");
  }

  const token = authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-password");

  if (!user || user.status !== "active") {
    response.status(401);
    throw new Error("User is not authorized or account is inactive.");
  }

  request.user = user;
  return next();
});

module.exports = { protect };
