import express from "express";
import { createFeedback, getFeedback, getMyFeedback } from "../controllers/feedbackController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", authorize("User"), createFeedback);
router.get("/my", authorize("User"), getMyFeedback);
router.get("/", authorize("Admin", "Staff"), getFeedback);

export default router;
