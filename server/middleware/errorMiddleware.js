const notFound = (request, response, next) => {
  const error = new Error(`Route not found: ${request.originalUrl}`);
  response.status(404);
  next(error);
};

const errorHandler = (error, _request, response, _next) => {
  const statusCode = response.statusCode === 200 ? 500 : response.statusCode;
  response.status(statusCode).json({
    message: error.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};

module.exports = { errorHandler, notFound };
