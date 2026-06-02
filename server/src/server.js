import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import fundraiserRoutes from "./routes/fundraiserRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BayanihanHub backend is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/fundraisers", fundraiserRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ BayanihanHub server running on port ${PORT} (${NODE_ENV})`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  });

export default app;
