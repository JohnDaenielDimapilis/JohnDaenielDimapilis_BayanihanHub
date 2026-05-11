const express = require("express");
const { body } = require("express-validator");

const { createAchievement, getAchievements, getMyAchievements } = require("../controllers/achievementController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("admin", "staff"),
  [
    body("userId").isMongoId().withMessage("Valid user id is required."),
    body("achievementTitle").trim().notEmpty().withMessage("Achievement title is required."),
    body("description").trim().notEmpty().withMessage("Description is required."),
    body("achievementType")
      .isIn(["volunteer", "donor", "participant", "feedback", "milestone"])
      .withMessage("Invalid achievement type.")
  ],
  validateRequest,
  createAchievement
);
router.get("/", authorize("admin", "staff"), getAchievements);
router.get("/my-achievements", authorize("user"), getMyAchievements);

module.exports = router;
