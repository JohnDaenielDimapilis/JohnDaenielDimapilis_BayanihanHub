const express = require("express");
const { body, param } = require("express-validator");

const {
  approveEvent,
  createEvent,
  deleteEvent,
  getApprovedEvents,
  getEventById,
  getEvents,
  joinEvent,
  rejectEvent,
  updateEvent
} = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();
const eventValidation = [
  body("eventTitle").trim().notEmpty().withMessage("Event title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("location").trim().notEmpty().withMessage("Location is required."),
  body("eventDate")
    .isISO8601()
    .withMessage("A valid event date is required.")
    .custom((value) => {
      const scheduledDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (scheduledDate < today) {
        throw new Error("Event date must be today or a future date.");
      }
      return true;
    }),
  body("capacity").isInt({ min: 1 }).withMessage("Capacity must be greater than zero.")
];

router.get("/approved", getApprovedEvents);

router.use(protect);

router.post("/", authorize("admin", "staff"), eventValidation, validateRequest, createEvent);
router.get("/", getEvents);
router.get("/:id", [param("id").isMongoId().withMessage("Valid event id is required.")], validateRequest, getEventById);
router.put(
  "/:id",
  authorize("admin", "staff"),
  [param("id").isMongoId().withMessage("Valid event id is required."), ...eventValidation],
  validateRequest,
  updateEvent
);
router.delete(
  "/:id",
  authorize("admin", "staff"),
  [param("id").isMongoId().withMessage("Valid event id is required.")],
  validateRequest,
  deleteEvent
);
router.patch(
  "/:id/approve",
  authorize("admin"),
  [param("id").isMongoId().withMessage("Valid event id is required.")],
  validateRequest,
  approveEvent
);
router.patch(
  "/:id/reject",
  authorize("admin"),
  [param("id").isMongoId().withMessage("Valid event id is required.")],
  validateRequest,
  rejectEvent
);
router.post(
  "/:id/join",
  authorize("user"),
  [param("id").isMongoId().withMessage("Valid event id is required.")],
  validateRequest,
  joinEvent
);

module.exports = router;
