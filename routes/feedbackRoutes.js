import express from "express";
import { createFeedback, getFeedback } from "../controllers/feedbackController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", authorize("User"), createFeedback);
router.get("/", authorize("Admin", "Staff"), getFeedback);

export default router;
