const express = require("express");
const { body } = require("express-validator");

const { getProfile, login, register } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { requireJwtSecret } = require("../middleware/configMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
  ],
  validateRequest,
  requireJwtSecret,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  validateRequest,
  requireJwtSecret,
  login
);

router.get("/profile", protect, getProfile);

module.exports = router;
