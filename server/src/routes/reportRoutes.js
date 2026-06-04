import express from "express";
import {
  exportReport,
  getDonationReport,
  getEventReport,
  getFeedbackReport,
  getFundraiserReport,
  getParticipantReport,
  getReports
} from "../controllers/reportController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", authorize("Admin", "Staff"), getReports);
router.get("/events", authorize("Admin", "Staff"), getEventReport);
router.get("/participants", authorize("Admin", "Staff"), getParticipantReport);
router.get("/donations", authorize("Admin", "Staff"), getDonationReport);
router.get("/fundraisers", authorize("Admin", "Staff"), getFundraiserReport);
router.get("/feedback", authorize("Admin", "Staff"), getFeedbackReport);
router.get("/export", authorize("Admin", "Staff"), exportReport);

export default router;
