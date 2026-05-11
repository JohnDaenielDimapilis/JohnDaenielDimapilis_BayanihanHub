const express = require("express");
const { body, param } = require("express-validator");

const { createFeedback, getFeedback, getFeedbackByEvent } = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("user"),
  [
    body("eventId").isMongoId().withMessage("Valid event id is required."),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Feedback rating must be between 1 and 5."),
    body("comment").trim().notEmpty().withMessage("Comment is required.")
  ],
  validateRequest,
  createFeedback
);
router.get("/", authorize("admin", "staff"), getFeedback);
router.get(
  "/event/:eventId",
  authorize("admin", "staff"),
  [param("eventId").isMongoId().withMessage("Valid event id is required.")],
  validateRequest,
  getFeedbackByEvent
);

module.exports = router;
