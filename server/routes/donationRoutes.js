const express = require("express");
const { body } = require("express-validator");

const { createDonation, getDonations, getMyDonations } = require("../controllers/donationController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("user"),
  [
    body("fundraiserId").isMongoId().withMessage("Valid fundraiser id is required."),
    body("donationAmount").isFloat({ min: 1 }).withMessage("Donation amount must be greater than zero."),
    body("paymentMethod")
      .isIn(["cash", "bank_transfer", "gcash", "maya", "card", "other"])
      .withMessage("Invalid payment method.")
  ],
  validateRequest,
  createDonation
);
router.get("/", authorize("admin", "staff"), getDonations);
router.get("/my-donations", authorize("user"), getMyDonations);

module.exports = router;
