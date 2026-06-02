import express from "express";
import {
  getParticipants,
  joinEvent,
  updateParticipantStatus
} from "../controllers/participantController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/events/:eventId/join", authorize("User"), joinEvent);
router.get("/", authorize("Admin", "Staff"), getParticipants);
router.patch("/:id/status", authorize("Admin", "Staff"), updateParticipantStatus);

export default router;
