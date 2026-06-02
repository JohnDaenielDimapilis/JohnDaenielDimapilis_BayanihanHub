export function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || String(value).trim() === "";
    });

    if (missing.length) {
      res.status(400);
      return next(new Error(`Missing required field(s): ${missing.join(", ")}`));
    }

    next();
  };
}

export function validateObjectIdParam(param = "id") {
  return (req, res, next) => {
    if (!/^[a-f\d]{24}$/i.test(req.params[param])) {
      res.status(400);
      return next(new Error("Invalid record id."));
    }
    next();
  };
}
