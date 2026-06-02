import express from "express";
import { securityLogs, securitySummary } from "../controllers/securityController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("Admin"));
router.get("/", securitySummary);
router.get("/logs", securityLogs);

export default router;
