import express from "express";
import { getLogs } from "../controllers/logController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", authorize("Admin", "Staff"), getLogs);

export default router;
