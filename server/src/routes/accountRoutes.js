import express from "express";
import { createAccount, deleteAccount, listAccounts, updateAccount } from "../controllers/accountController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { requireFields, validateObjectIdParam } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect, authorize("Admin"));
router.get("/", listAccounts);
router.post("/", requireFields(["name", "email", "password", "role"]), createAccount);
router.put("/:id", validateObjectIdParam(), updateAccount);
router.delete("/:id", validateObjectIdParam(), deleteAccount);

export default router;
