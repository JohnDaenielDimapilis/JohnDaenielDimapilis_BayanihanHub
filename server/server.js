const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const { connectDB, getDatabaseHealth } = require("./config/db");
const requireDatabase = require("./middleware/databaseMiddleware");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const achievementRoutes = require("./routes/achievementRoutes");
const authRoutes = require("./routes/authRoutes");
const donationRoutes = require("./routes/donationRoutes");
const eventRoutes = require("./routes/eventRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const fundraiserRoutes = require("./routes/fundraiserRoutes");
const logRoutes = require("./routes/logRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://johndaenieldimapilisbayanihanhub.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
].filter(Boolean);
const allowedOriginPatterns = [
  /^https:\/\/johndaenieldimapilisbayanihanhub(?:-[a-z0-9]+)?\.vercel\.app$/
];

if (process.env.MONGO_URI) {
  connectDB().catch((error) => {
    console.error(`Initial database connection failed: ${error.message}`);
  });
} else {
  console.warn("MONGO_URI is not configured. Account creation and database routes require it.");
}

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin(origin, callback) {
      const isAllowedOrigin =
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOriginPatterns.some((pattern) => pattern.test(origin));

      if (isAllowedOrigin) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy blocked this origin."));
    },
    credentials: true
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (_request, response) => {
  response.json({
    appName: "BayanihanHub",
    message: "Centralized Foundation Event and Fundraising Management API",
    status: "online"
  });
});

app.get("/api/health", (_request, response) => {
  const database = getDatabaseHealth();
  response.json({
    api: "BayanihanHub",
    database: database.configured ? "configured" : "missing MONGO_URI",
    databaseReadyState: database.readyState,
    timestamp: new Date().toISOString()
  });
});

app.use("/api", requireDatabase);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/fundraisers", fundraiserRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/logs", logRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`BayanihanHub API running on port ${port}`);
  });
}

module.exports = app;
