import express from "express";
import { getReports } from "../controllers/reportController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", authorize("Admin", "Staff"), getReports);

export default router;
