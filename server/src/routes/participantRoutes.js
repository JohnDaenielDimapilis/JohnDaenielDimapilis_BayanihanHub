import express from "express";
import {
  cancelOwnRegistration,
  checkInEvent,
  exportParticipants,
  getEventParticipants,
  getMyParticipants,
  getParticipants,
  joinEvent,
  updateParticipantStatus,
  verifyAttendance
} from "../controllers/participantController.js";
import { scanEventQr } from "../controllers/eventController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/events/:eventId/join", authorize("User"), joinEvent);
router.patch("/events/:eventId/cancel", authorize("User"), cancelOwnRegistration);
router.post("/events/:eventId/check-in", authorize("User"), checkInEvent);
router.post("/events/:eventId/scan-qr", authorize("User"), (req, res, next) => {
  req.params.id = req.params.eventId;
  return scanEventQr(req, res, next);
});
router.get("/events/:eventId", authorize("Admin", "Staff"), getEventParticipants);
router.get("/events/:eventId/export", authorize("Admin", "Staff"), exportParticipants);
router.get("/my", authorize("User"), getMyParticipants);
router.get("/", authorize("Admin", "Staff"), getParticipants);
router.patch("/:id/status", authorize("Admin", "Staff"), updateParticipantStatus);
router.patch("/:id/manual-attendance", authorize("Admin", "Staff"), updateParticipantStatus);
router.patch("/:id/verify-attendance", authorize("Admin", "Staff"), verifyAttendance);

export default router;
