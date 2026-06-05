import express from "express";
import {
  approveFundraiser,
  closeFundraiser,
  createFundraiser,
  deleteFundraiser,
  getFundraiserById,
  getFundraisers,
  rejectFundraiser,
  requestRevisionFundraiser,
  updateFundraiser
} from "../controllers/fundraiserController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getFundraisers);
router.get("/:id", getFundraiserById);
router.post("/", authorize("Admin", "Staff", "User"), createFundraiser);
router.put("/:id", authorize("Admin", "Staff", "User"), updateFundraiser);
router.delete("/:id", authorize("Admin", "Staff", "User"), deleteFundraiser);
router.patch("/:id/approve", authorize("Admin", "Staff"), approveFundraiser);
router.patch("/:id/request-revision", authorize("Admin", "Staff"), requestRevisionFundraiser);
router.patch("/:id/reject", authorize("Admin", "Staff"), rejectFundraiser);
router.patch("/:id/close", authorize("Admin", "Staff"), closeFundraiser);

export default router;
