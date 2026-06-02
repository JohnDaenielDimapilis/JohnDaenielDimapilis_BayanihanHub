import express from "express";
import {
  approveFundraiser,
  createFundraiser,
  deleteFundraiser,
  getFundraiserById,
  getFundraisers,
  rejectFundraiser,
  updateFundraiser
} from "../controllers/fundraiserController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getFundraisers);
router.get("/:id", getFundraiserById);
router.post("/", authorize("Admin", "Staff"), createFundraiser);
router.put("/:id", authorize("Admin", "Staff"), updateFundraiser);
router.delete("/:id", authorize("Admin", "Staff"), deleteFundraiser);
router.patch("/:id/approve", authorize("Admin"), approveFundraiser);
router.patch("/:id/reject", authorize("Admin"), rejectFundraiser);

export default router;
