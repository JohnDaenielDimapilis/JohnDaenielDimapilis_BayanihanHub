import express from "express";
import {
  changeMyPassword,
  createAccount,
  deactivateMyAccount,
  deleteAccount,
  exportMyData,
  getMyAccount,
  listAccounts,
  banAccount,
  resetAccountPassword,
  unbanAccount,
  updateAccount,
  updateMyAccount
} from "../controllers/accountController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { requireFields, validateObjectIdParam } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyAccount);
router.put("/me", protect, updateMyAccount);
router.patch("/me/password", protect, changeMyPassword);
router.get("/me/export", protect, exportMyData);
router.delete("/me", protect, deactivateMyAccount);

router.use(protect);
router.get("/", authorize("Admin", "Staff"), listAccounts);
router.post("/", authorize("Admin"), requireFields(["name", "email", "password", "role"]), createAccount);
router.patch("/:id", authorize("Admin", "Staff"), validateObjectIdParam(), updateAccount);
router.patch("/:id/password", authorize("Admin"), validateObjectIdParam(), resetAccountPassword);
router.patch("/:id/ban", authorize("Admin", "Staff"), validateObjectIdParam(), banAccount);
router.patch("/:id/unban", authorize("Admin", "Staff"), validateObjectIdParam(), unbanAccount);
router.put("/:id", authorize("Admin", "Staff"), validateObjectIdParam(), updateAccount);
router.delete("/:id", authorize("Admin"), validateObjectIdParam(), deleteAccount);

export default router;
