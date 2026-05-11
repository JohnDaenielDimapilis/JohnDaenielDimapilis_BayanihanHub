const express = require("express");
const { body, param } = require("express-validator");

const {
  approveFundraiser,
  createFundraiser,
  deleteFundraiser,
  getApprovedFundraisers,
  getFundraiserById,
  getFundraisers,
  rejectFundraiser,
  updateFundraiser
} = require("../controllers/fundraiserController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();
const fundraiserValidation = [
  body("campaignTitle").trim().notEmpty().withMessage("Campaign title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("targetAmount").isFloat({ min: 1 }).withMessage("Target amount must be greater than zero."),
  body("startDate").isISO8601().withMessage("A valid start date is required."),
  body("endDate")
    .isISO8601()
    .withMessage("A valid end date is required.")
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error("End date must be after the start date.");
      }
      return true;
    })
];

router.get("/approved", getApprovedFundraisers);

router.use(protect);

router.post("/", authorize("admin", "staff"), fundraiserValidation, validateRequest, createFundraiser);
router.get("/", getFundraisers);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Valid fundraiser id is required.")],
  validateRequest,
  getFundraiserById
);
router.put(
  "/:id",
  authorize("admin", "staff"),
  [param("id").isMongoId().withMessage("Valid fundraiser id is required."), ...fundraiserValidation],
  validateRequest,
  updateFundraiser
);
router.delete(
  "/:id",
  authorize("admin", "staff"),
  [param("id").isMongoId().withMessage("Valid fundraiser id is required.")],
  validateRequest,
  deleteFundraiser
);
router.patch(
  "/:id/approve",
  authorize("admin"),
  [param("id").isMongoId().withMessage("Valid fundraiser id is required.")],
  validateRequest,
  approveFundraiser
);
router.patch(
  "/:id/reject",
  authorize("admin"),
  [param("id").isMongoId().withMessage("Valid fundraiser id is required.")],
  validateRequest,
  rejectFundraiser
);

module.exports = router;
