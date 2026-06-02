import express from "express";
import {
  approveEvent,
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

export default router;
