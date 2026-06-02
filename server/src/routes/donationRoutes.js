import express from "express";
import { createDonation, getDonations } from "../controllers/donationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", authorize("User"), createDonation);
router.get("/", authorize("Admin", "Staff", "User"), getDonations);

export default router;
