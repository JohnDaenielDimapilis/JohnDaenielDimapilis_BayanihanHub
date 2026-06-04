import express from "express";
import {
  changeMyPassword,
  createAccount,
  deactivateMyAccount,
  deleteAccount,
  exportMyData,
  getMyAccount,
  listAccounts,
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

router.use(protect, authorize("Admin"));
router.get("/", listAccounts);
router.post("/", requireFields(["name", "email", "password", "role"]), createAccount);
router.put("/:id", validateObjectIdParam(), updateAccount);
router.delete("/:id", validateObjectIdParam(), deleteAccount);

export default router;
