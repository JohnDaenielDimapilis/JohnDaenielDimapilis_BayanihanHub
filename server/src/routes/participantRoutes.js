import express from "express";
import {
  cancelOwnRegistration,
  checkInEvent,
  exportParticipants,
  getMyParticipants,
  getParticipants,
  joinEvent,
  updateParticipantStatus,
  verifyAttendance
} from "../controllers/participantController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/events/:eventId/join", authorize("User"), joinEvent);
router.patch("/events/:eventId/cancel", authorize("User"), cancelOwnRegistration);
router.post("/events/:eventId/check-in", authorize("User"), checkInEvent);
router.get("/events/:eventId/export", authorize("Admin", "Staff"), exportParticipants);
router.get("/my", authorize("User"), getMyParticipants);
router.get("/", authorize("Admin", "Staff"), getParticipants);
router.patch("/:id/status", authorize("Admin", "Staff"), updateParticipantStatus);
router.patch("/:id/verify-attendance", authorize("Admin", "Staff"), verifyAttendance);

export default router;
