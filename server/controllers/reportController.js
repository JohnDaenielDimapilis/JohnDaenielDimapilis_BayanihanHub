const Report = require("../models/Report");
const { recordActivity } = require("../services/logService");
const {
  getEventReport,
  getFundraisingReport,
  getParticipationReport,
  getSummaryReport
} = require("../services/reportService");
const asyncHandler = require("../utils/asyncHandler");

const persistReport = async ({ request, reportTitle, reportType, reportData }) => {
  const report = await Report.create({
    reportTitle,
    reportType,
    generatedBy: request.user._id,
    reportData
  });

  await recordActivity({
    userId: request.user._id,
    activityType: "report_generated",
    description: `${request.user.fullName} generated ${reportTitle}.`,
    ipAddress: request.ip
  });

  return report;
};

const getSummary = asyncHandler(async (request, response) => {
  const reportData = await getSummaryReport();
  const report = await persistReport({
    request,
    reportTitle: "BayanihanHub Summary Report",
    reportType: "summary",
    reportData
  });

  response.json(report);
});

const getEventsReport = asyncHandler(async (request, response) => {
  const reportData = await getEventReport();
  const report = await persistReport({
    request,
    reportTitle: "Event Management Report",
    reportType: "events",
    reportData
  });

  response.json(report);
});

const getFundraisingReportController = asyncHandler(async (request, response) => {
  const reportData = await getFundraisingReport();
  const report = await persistReport({
    request,
    reportTitle: "Fundraising Report",
    reportType: "fundraising",
    reportData
  });

  response.json(report);
});

const getParticipationReportController = asyncHandler(async (request, response) => {
  const reportData = await getParticipationReport();
  const report = await persistReport({
    request,
    reportTitle: "Participation and Achievement Report",
    reportType: "participation",
    reportData
  });

  response.json(report);
});

const createCustomReport = asyncHandler(async (request, response) => {
  const report = await persistReport({
    request,
    reportTitle: request.body.reportTitle,
    reportType: request.body.reportType || "custom",
    reportData: request.body.reportData || {
      summary: request.body.summary,
      recommendations: request.body.recommendations
    }
  });

  response.status(201).json(report);
});

module.exports = {
  createCustomReport,
  getEventsReport,
  getFundraisingReportController,
  getParticipationReportController,
  getSummary
};
