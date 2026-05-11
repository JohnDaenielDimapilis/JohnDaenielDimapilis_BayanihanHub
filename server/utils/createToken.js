const jwt = require("jsonwebtoken");

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured. Add JWT_SECRET before issuing account tokens.");
    error.statusCode = 503;
    error.code = "JWT_SECRET_NOT_CONFIGURED";
    throw error;
  }

  return jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = createToken;
