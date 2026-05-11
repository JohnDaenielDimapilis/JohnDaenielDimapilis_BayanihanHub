const authorize = (...allowedRoles) => (request, response, next) => {
  if (!request.user || !allowedRoles.includes(request.user.role)) {
    response.status(403);
    return next(new Error("You do not have permission to perform this action."));
  }

  return next();
};

module.exports = { authorize };
