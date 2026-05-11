const express = require("express");
const { body, param } = require("express-validator");

const { getUserById, getUsers, updateUserRole, updateUserStatus } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getUsers);
router.get("/:id", [param("id").isMongoId().withMessage("Valid user id is required.")], validateRequest, getUserById);
router.patch(
  "/:id/status",
  [
    param("id").isMongoId().withMessage("Valid user id is required."),
    body("status").isIn(["active", "inactive", "suspended"]).withMessage("Invalid status value.")
  ],
  validateRequest,
  updateUserStatus
);
router.patch(
  "/:id/role",
  [
    param("id").isMongoId().withMessage("Valid user id is required."),
    body("role").isIn(["admin", "staff", "user"]).withMessage("Invalid role value.")
  ],
  validateRequest,
  updateUserRole
);

module.exports = router;
