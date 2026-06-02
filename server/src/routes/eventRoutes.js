import express from "express";
import {
  approveEvent,
  cancelEvent,
  completeEvent,
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  rejectEvent,
  updateEvent
} from "../controllers/eventController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", authorize("Admin", "Staff"), createEvent);
router.put("/:id", authorize("Admin", "Staff"), updateEvent);
router.delete("/:id", authorize("Admin", "Staff"), deleteEvent);
router.patch("/:id/approve", authorize("Admin"), approveEvent);
router.patch("/:id/reject", authorize("Admin"), rejectEvent);
router.patch("/:id/cancel", authorize("Admin", "Staff"), cancelEvent);
router.patch("/:id/complete", authorize("Admin", "Staff"), completeEvent);

export default router;
