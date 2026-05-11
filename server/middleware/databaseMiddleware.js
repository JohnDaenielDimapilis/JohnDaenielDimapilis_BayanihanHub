const { connectDB } = require("../config/db");

const requireDatabase = async (_request, response, next) => {
  try {
    await connectDB();
    return next();
  } catch (error) {
    response.status(error.statusCode || 503);
    return next(error);
  }
};

module.exports = requireDatabase;
