const requireJwtSecret = (_request, response, next) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured. Add JWT_SECRET in Vercel or server/.env before using accounts.");
    error.statusCode = 503;
    error.code = "JWT_SECRET_NOT_CONFIGURED";
    response.status(error.statusCode);
    return next(error);
  }

  return next();
};

module.exports = { requireJwtSecret };
