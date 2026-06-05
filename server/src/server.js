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
import notificationRoutes from "./routes/notificationRoutes.js";
import Achievement from "./models/Achievement.js";
import Donation from "./models/Donation.js";
import Event from "./models/Event.js";
import Feedback from "./models/Feedback.js";
import Fundraiser from "./models/Fundraiser.js";
import Log from "./models/Log.js";
import Notification from "./models/Notification.js";
import Participant from "./models/Participant.js";
import User from "./models/User.js";

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
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

async function seedMemoryDemoAccounts() {
  if (process.env.BAYANIHAN_MEMORY_DB !== "true") return;

  const users = [
    { name: "Maria Santos", email: "admin@bayanihanhub.test", password: "Password123", role: "Admin" },
    { name: "Leo Dela Cruz", email: "staff@bayanihanhub.test", password: "Password123", role: "Staff" },
    { name: "Ana Reyes", email: "user@bayanihanhub.test", password: "Password123", role: "User" },
    { name: "Miguel Ramos", email: "miguel@bayanihanhub.test", password: "Password123", role: "User" },
    { name: "Sofia Cruz", email: "sofia@bayanihanhub.test", password: "Password123", role: "User" },
    { name: "Temp Banned Demo", email: "banned@bayanihanhub.test", password: "Password123", role: "User", accountStatus: "Temporarily Banned", isActive: false }
  ];

  for (const user of users) {
    const existing = await User.findOne({ email: user.email });
    if (!existing) {
      await User.create({
        ...user,
        isActive: user.isActive ?? true,
        privacyConsentAt: new Date(),
        banUntil: user.accountStatus === "Temporarily Banned" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
        banReason: user.accountStatus === "Temporarily Banned" ? "Dummy account for temporary-ban testing" : undefined
      });
    }
  }

  console.log("Seeded in-memory demo accounts:");
  users.slice(0, 3).forEach((user) => console.log(`${user.role}: ${user.email} / Password123`));
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date;
}

function daysFromNowAt(days, hour, minute = 0) {
  const date = daysFromNow(days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function seedMemoryDemoData() {
  if (process.env.BAYANIHAN_MEMORY_DB !== "true") return;
  if (await Event.countDocuments()) return;

  const admin = await User.findOne({ email: "admin@bayanihanhub.test" });
  const staff = await User.findOne({ email: "staff@bayanihanhub.test" });
  const user = await User.findOne({ email: "user@bayanihanhub.test" });
  const miguel = await User.findOne({ email: "miguel@bayanihanhub.test" });
  const sofia = await User.findOne({ email: "sofia@bayanihanhub.test" });
  if (!admin || !staff || !user) return;

  const today = daysFromNow(0);
  const tomorrow = daysFromNow(1);
  const nextWeek = daysFromNow(7);
  const lastWeek = daysFromNow(-7);

  const commonEventFields = {
    createdBy: staff._id,
    approvedBy: admin._id,
    approvedAt: new Date(),
    participantLimit: 3,
    registrationStartDate: daysFromNow(-3),
    registrationEndDate: tomorrow,
    durationType: "One Day",
    waitlistEnabled: true,
    capacityRule: "Allow Waitlist",
    targetBeneficiaries: "Families, youth volunteers, and barangay residents",
    requiredResources: "Volunteer leads, printed forms, drinking water, tables, first-aid kit",
    eventImages: [
      {
        imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80",
        imageType: "Banner",
        caption: "BayanihanHub community volunteers"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
        imageType: "Information",
        caption: "Health outreach information reference"
      }
    ]
  };

  const [
    openEvent,
    fullEvent,
    closedEvent,
    finishedEvent,
    cancelledEvent,
    pendingEvent,
    userProposalEvent
  ] = await Event.create([
    {
      ...commonEventFields,
      title: "Barangay Health & Wellness Day",
      eventType: "Health outreach",
      description: "Free wellness checks, blood pressure monitoring, and nutrition guidance for local residents.",
      objectives: "Support preventive care and connect residents with volunteer health workers.",
      date: nextWeek,
      startDateTime: daysFromNowAt(7, 9),
      endDateTime: daysFromNowAt(8, 16),
      durationType: "Multiple Days",
      time: "9:00 AM",
      location: "Barangay San Isidro Covered Court",
      status: "Open for Registration"
    },
    {
      ...commonEventFields,
      title: "School Supplies Packing Drive",
      eventType: "Volunteer drive",
      description: "A small-group packing session for school kits to be distributed before classes resume.",
      objectives: "Prepare complete kits and track donated inventory before release.",
      date: daysFromNow(5),
      startDateTime: daysFromNowAt(5, 14),
      endDateTime: daysFromNowAt(5, 17),
      time: "2:00 PM",
      location: "BayanihanHub Office",
      status: "Full"
    },
    {
      ...commonEventFields,
      title: "Today Relief Packing QR Test",
      eventType: "Relief operations",
      description: "Demo event for QR attendance scanning and staff attendance monitoring.",
      objectives: "Verify QR scanning, duplicate prevention, and manual attendance override.",
      date: today,
      startDateTime: daysFromNowAt(0, 10),
      endDateTime: daysFromNowAt(0, 17),
      time: "10:00 AM",
      location: "BayanihanHub Warehouse",
      status: "Closed",
      qrCodeToken: "DEMO-TODAY-QR",
      qrGeneratedAt: new Date(),
      qrExpiresAt: daysFromNow(1)
    },
    {
      ...commonEventFields,
      title: "Coastal Cleanup Finished Batch",
      eventType: "Environmental outreach",
      description: "Finished coastal cleanup used for history, feedback, attendance, and report analytics testing.",
      objectives: "Clean shoreline waste and document volunteer attendance.",
      date: lastWeek,
      startDateTime: daysFromNowAt(-7, 7),
      endDateTime: daysFromNowAt(-7, 12),
      time: "7:00 AM",
      location: "Tanza Coastal Road",
      status: "Finished",
      completedAt: new Date(),
      postEventReport: {
        attendanceCount: 2,
        noShowCount: 1,
        actualBeneficiariesServed: 75,
        outcomeSummary: "Collected trash bags, documented attendance, and coordinated barangay disposal.",
        issuesEncountered: "Rain delayed the starting time.",
        recommendations: "Prepare covered waiting area and extra gloves.",
        submittedBy: staff._id,
        submittedAt: new Date()
      },
      actualBeneficiariesServed: 75,
      outcomeSummary: "Collected trash bags and coordinated barangay disposal.",
      eventImages: [
        ...commonEventFields.eventImages,
        {
          imageUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=900&q=80",
          imageType: "Post Event",
          caption: "Cleanup documentation reference"
        }
      ],
      progressUpdates: [
        {
          percentage: 100,
          note: "Post-event report completed and attendance reconciled.",
          updatedBy: staff._id,
          updatedAt: new Date()
        }
      ]
    },
    {
      ...commonEventFields,
      title: "Cancelled Senior Wellness Visit",
      eventType: "Home visit",
      description: "Cancelled demo event showing cancellation status and disabled user actions.",
      objectives: "Show cancelled events in user filters and history.",
      date: daysFromNow(3),
      startDateTime: daysFromNowAt(3, 13),
      endDateTime: daysFromNowAt(3, 16),
      time: "1:00 PM",
      location: "Barangay Maligaya",
      status: "Cancelled",
      cancellationReason: "Partner clinic schedule conflict.",
      cancelledAt: new Date(),
      cancelledBy: staff._id
    },
    {
      ...commonEventFields,
      title: "Pending Youth Mentorship Forum",
      eventType: "Education",
      description: "Pending admin approval demo record for the approval queue.",
      objectives: "Show admin approval and rejection workflow.",
      date: daysFromNow(12),
      startDateTime: daysFromNowAt(12, 15),
      endDateTime: daysFromNowAt(12, 17),
      time: "3:00 PM",
      location: "City Library Hall",
      status: "Pending Review"
    },
    {
      ...commonEventFields,
      createdBy: user._id,
      title: "User Proposal: Weekend Reading Circle",
      eventType: "Education",
      description: "A user-submitted literacy activity for children and parents.",
      objectives: "Collect volunteer readers and prepare donated books for a weekend learning session.",
      date: daysFromNow(14),
      startDateTime: daysFromNowAt(14, 9),
      endDateTime: daysFromNowAt(14, 12),
      time: "9:00 AM",
      location: "Barangay San Isidro Daycare Center",
      status: "Pending Review",
      approvalRemarks: "Dummy user-created event proposal for approval testing."
    }
  ]);

  await Participant.create([
    { userId: user._id, eventId: closedEvent._id, participationStatus: "Joined", attendanceStatus: "Pending", joinedAt: daysFromNow(-1) },
    { userId: user._id, eventId: finishedEvent._id, participationStatus: "Completed", attendanceStatus: "Present", checkedInAt: lastWeek, checkInMethod: "QR", checkInCode: "DEMO-FINISHED-QR", verifiedBy: staff._id },
    { userId: miguel._id, eventId: finishedEvent._id, participationStatus: "Completed", attendanceStatus: "Present", checkedInAt: lastWeek, checkInMethod: "Manual", verifiedBy: staff._id },
    { userId: sofia._id, eventId: finishedEvent._id, participationStatus: "Completed", attendanceStatus: "Absent" },
    { userId: user._id, eventId: cancelledEvent._id, participationStatus: "Cancelled", attendanceStatus: "Pending", cancelledAt: new Date(), cancellationReason: "Event cancelled by organizer." },
    { userId: user._id, eventId: fullEvent._id, participationStatus: "Joined", attendanceStatus: "Pending" },
    { userId: miguel._id, eventId: fullEvent._id, participationStatus: "Joined", attendanceStatus: "Pending" },
    { userId: sofia._id, eventId: fullEvent._id, participationStatus: "Joined", attendanceStatus: "Pending" }
  ]);

  const [approvedFundraiser, pendingFundraiser, userFundraiserProposal] = await Fundraiser.create([
    {
      title: "Back-to-School Kit Fund",
      purpose: "Buy notebooks, pencils, and hygiene kits for public school learners.",
      beneficiary: "Public school learners from Barangay San Isidro",
      place: "Barangay San Isidro Elementary School",
      targetAmount: 25000,
      raisedAmount: 4500,
      deadline: daysFromNow(21),
      relatedEvent: openEvent._id,
      description: "Fundraiser for the school supplies packing drive.",
      status: "Approved",
      createdBy: staff._id,
      approvedBy: admin._id,
      approvedAt: new Date(),
      reconciliationStatus: "In Progress",
      progressUpdates: [
        {
          amount: 4500,
          previousRaised: 0,
          newRaised: 4500,
          percentage: 18,
          note: "Two verified dummy donations added to the campaign history.",
          updatedBy: admin._id,
          updatedAt: new Date()
        }
      ]
    },
    {
      title: "Community Pantry Restock",
      purpose: "Restock rice, canned goods, and basic hygiene supplies.",
      beneficiary: "Families visiting the BayanihanHub community pantry",
      place: "BayanihanHub Community Pantry",
      targetAmount: 18000,
      raisedAmount: 0,
      deadline: daysFromNow(30),
      description: "Pending demo fundraiser for the admin approval queue.",
      status: "Pending",
      createdBy: staff._id
    },
    {
      title: "User Proposal: Reading Nook Materials",
      purpose: "Collect funds for mats, bookshelves, and starter books for the reading circle.",
      beneficiary: "Children joining the Weekend Reading Circle",
      place: "Barangay San Isidro Daycare Center",
      targetAmount: 12000,
      raisedAmount: 0,
      deadline: daysFromNow(35),
      description: "User-created fundraiser proposal connected to the reading circle event.",
      relatedEvent: userProposalEvent._id,
      status: "Pending",
      createdBy: user._id
    }
  ]);

  await Donation.create([
    {
      donor: user._id,
      fundraiserId: approvedFundraiser._id,
      amount: 2500,
      donationType: "Bank Transfer",
      donationPurpose: "School supplies",
      paymentReference: "BH-DEMO-VERIFIED-001",
      proofOfPayment: "Demo receipt reference for verified donation.",
      message: "Happy to help learners start the school year ready.",
      donorAnonymous: false,
      donationStatus: "Verified",
      receiptNumber: "BH-RCPT-0001",
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      verificationNotes: "Seeded verified donation for local testing.",
      donationDate: daysFromNow(-2)
    },
    {
      donor: sofia._id,
      fundraiserId: approvedFundraiser._id,
      amount: 2000,
      donationType: "Cash",
      donationPurpose: "School supplies",
      paymentReference: "BH-DEMO-VERIFIED-002",
      proofOfPayment: "Cash receipt logged by admin.",
      message: "For the kids and their first week of classes.",
      donorAnonymous: false,
      donationStatus: "Verified",
      receiptNumber: "BH-RCPT-0002",
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      verificationNotes: "Seeded verified donation for fundraiser history.",
      donationDate: daysFromNow(-1)
    },
    {
      donor: miguel._id,
      fundraiserId: pendingFundraiser._id,
      amount: 1000,
      donationType: "Cash",
      donationPurpose: "Pantry restock",
      paymentReference: "BH-DEMO-SUBMITTED-001",
      proofOfPayment: "Pending cash receipt note.",
      message: "Please use this for pantry staples.",
      donorAnonymous: true,
      donationStatus: "Submitted",
      donationDate: daysFromNow(-1)
    }
  ]);

  await Feedback.create([
    {
      userId: user._id,
      eventId: finishedEvent._id,
      rating: 5,
      comment: "Well organized and easy to check in.",
      suggestions: "Add more gloves for cleanup volunteers.",
      reviewImages: [
        {
          imageUrl: "https://images.unsplash.com/photo-1618477462146-050d2767eac4?auto=format&fit=crop&w=900&q=80",
          caption: "Volunteer cleanup review photo"
        }
      ]
    },
    {
      userId: miguel._id,
      eventId: finishedEvent._id,
      rating: 4,
      comment: "The team coordinated clearly.",
      suggestions: "Start earlier next time.",
      reviewImages: [
        {
          imageUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=900&q=80",
          caption: "Team coordination review photo"
        }
      ]
    }
  ]);

  await Achievement.create({
    userId: user._id,
    points: 120,
    badges: ["First Event", "Community Helper"],
    totalEventsJoined: 3,
    totalDonations: 1,
    totalFeedbackSubmitted: 1
  });

  await Notification.create([
    {
      userId: user._id,
      title: "Event reminder",
      message: `"${closedEvent.title}" starts today. Use the dashboard QR scanner when you arrive.`,
      type: "Event",
      relatedRecordId: closedEvent._id
    },
    {
      userId: staff._id,
      title: "Approval queue has pending items",
      message: "A pending event, fundraiser, and donation are available for admin review.",
      type: "System",
      relatedRecordId: pendingEvent._id
    }
  ]);

  await Log.create([
    { userId: staff._id, role: "Staff", action: "Seeded Event Data", module: "Event", status: "Success", details: { reason: "Dummy data for local testing" } },
    { userId: admin._id, role: "Admin", action: "Seeded Approval Queue", module: "Approval Requests", status: "Success", details: { reason: "Dummy data for local testing" } }
  ]);

  console.log("Seeded in-memory dummy events, registrations, fundraisers, donations, feedback, notifications, and logs.");
}

connectDB()
  .then(async () => {
    await seedMemoryDemoAccounts();
    await seedMemoryDemoData();
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
