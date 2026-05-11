const express = require("express");

const { getActivityLogs, getSecurityLogs } = require("../controllers/logController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/activity", getActivityLogs);
router.get("/security", getSecurityLogs);

module.exports = router;
