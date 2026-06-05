import express from "express";
import {
  createDonation,
  getDonations,
  refundDonation,
  rejectDonation,
  verifyDonation
} from "../controllers/donationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", authorize("User"), createDonation);
router.get("/", authorize("Admin", "Staff", "User"), getDonations);
router.patch("/:id/verify", authorize("Admin", "Staff"), verifyDonation);
router.patch("/:id/reject", authorize("Admin", "Staff"), rejectDonation);
router.patch("/:id/refund", authorize("Admin", "Staff"), refundDonation);

export default router;
