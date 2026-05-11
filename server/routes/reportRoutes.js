const express = require("express");
const { body } = require("express-validator");

const {
  createCustomReport,
  getEventsReport,
  getFundraisingReportController,
  getParticipationReportController,
  getSummary
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("admin", "staff"),
  [
    body("reportTitle").trim().notEmpty().withMessage("Report title is required."),
    body("reportType").optional().isIn(["summary", "events", "fundraising", "participation", "custom"]),
    body("summary").optional().trim(),
    body("recommendations").optional().trim()
  ],
  validateRequest,
  createCustomReport
);
router.get("/summary", authorize("admin"), getSummary);
router.get("/events", authorize("admin"), getEventsReport);
router.get("/fundraising", authorize("admin"), getFundraisingReportController);
router.get("/participation", authorize("admin"), getParticipationReportController);

module.exports = router;
