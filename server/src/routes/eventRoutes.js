import express from "express";
import {
  archiveEvent,
  approveEvent,
  cancelEvent,
  closeRegistrationEvent,
  completeEvent,
  createEvent,
  deleteEvent,
  generateEventQr,
  getEventHistory,
  getEventById,
  getEventQr,
  getEvents,
  getUserVisibleEvents,
  openRegistrationEvent,
  publicEvents,
  rejectEvent,
  requestRevisionEvent,
  scanEventQr,
  submitEvent,
  updateEvent,
  updateEventProgress
} from "../controllers/eventController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public", publicEvents);

router.use(protect);
router.get("/", getEvents);
router.get("/user-visible", getUserVisibleEvents);
router.get("/history", getEventHistory);
router.get("/:id", getEventById);
router.post("/", authorize("Admin", "Staff", "User"), createEvent);
router.put("/:id", authorize("Admin", "Staff", "User"), updateEvent);
router.delete("/:id", authorize("Admin", "Staff", "User"), deleteEvent);
router.patch("/:id/submit", authorize("Admin", "Staff", "User"), submitEvent);
router.patch("/:id/progress", authorize("Admin", "Staff", "User"), updateEventProgress);
router.patch("/:id/approve", authorize("Admin"), approveEvent);
router.patch("/:id/request-revision", authorize("Admin"), requestRevisionEvent);
router.patch("/:id/reject", authorize("Admin"), rejectEvent);
router.patch("/:id/open-registration", authorize("Admin", "Staff"), openRegistrationEvent);
router.patch("/:id/close-registration", authorize("Admin", "Staff"), closeRegistrationEvent);
router.patch("/:id/cancel", authorize("Admin", "Staff"), cancelEvent);
router.patch("/:id/complete", authorize("Admin", "Staff"), completeEvent);
router.patch("/:id/finish", authorize("Admin", "Staff"), completeEvent);
router.patch("/:id/archive", authorize("Admin", "Staff"), archiveEvent);
router.post("/:id/generate-qr", authorize("Admin", "Staff"), generateEventQr);
router.get("/:id/qr", authorize("Admin", "Staff"), getEventQr);
router.post("/:id/scan-qr", authorize("User"), scanEventQr);

export default router;
