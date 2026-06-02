import express from "express";
import { getAchievements, recalculateAchievement } from "../controllers/achievementController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", authorize("Admin", "User"), getAchievements);
router.patch("/me/recalculate", authorize("User"), recalculateAchievement);
router.patch("/:userId/recalculate", authorize("Admin"), recalculateAchievement);

export default router;
