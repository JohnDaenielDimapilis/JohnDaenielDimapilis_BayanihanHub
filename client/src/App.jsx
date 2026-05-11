import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApproveEvents from "./pages/admin/ApproveEvents";
import ApproveFundraisers from "./pages/admin/ApproveFundraisers";
import ManageUsers from "./pages/admin/ManageUsers";
import ReportsPage from "./pages/admin/ReportsPage";
import ActivityLogs from "./pages/admin/ActivityLogs";
import SecurityLogs from "./pages/admin/SecurityLogs";
import AboutPage from "./pages/public/AboutPage";
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import AchievementsPage from "./pages/shared/AchievementsPage";
import DashboardPage from "./pages/shared/DashboardPage";
import EventsPage from "./pages/shared/EventsPage";
import FeedbackPage from "./pages/shared/FeedbackPage";
import FundraisingPage from "./pages/shared/FundraisingPage";
import ProfilePage from "./pages/shared/ProfilePage";
import CreateEventPage from "./pages/staff/CreateEventPage";
import CreateFundraiserPage from "./pages/staff/CreateFundraiserPage";
import FeedbackRecordsPage from "./pages/staff/FeedbackRecordsPage";
import ManageEventsPage from "./pages/staff/ManageEventsPage";
import ManageFundraisersPage from "./pages/staff/ManageFundraisersPage";
import ParticipantRecordsPage from "./pages/staff/ParticipantRecordsPage";
import StaffDashboard from "./pages/staff/StaffDashboard";
import SubmitReportPage from "./pages/staff/SubmitReportPage";
import BrowseEventsPage from "./pages/user/BrowseEventsPage";
import DonatePage from "./pages/user/DonatePage";
import MyAchievementsPage from "./pages/user/MyAchievementsPage";
import MyDonationsPage from "./pages/user/MyDonationsPage";
import MyJoinedEventsPage from "./pages/user/MyJoinedEventsPage";
import SubmitFeedbackPage from "./pages/user/SubmitFeedbackPage";
import UserDashboard from "./pages/user/UserDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<LandingPage />} path="/" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<DashboardPage />} path="/dashboard" />
          <Route element={<ProfilePage />} path="/profile" />
          <Route element={<EventsPage />} path="/events" />
          <Route element={<FundraisingPage />} path="/fundraising" />
          <Route element={<FeedbackPage />} path="/feedback" />
          <Route element={<AchievementsPage />} path="/achievements" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route element={<AdminDashboard />} path="/admin/dashboard" />
          <Route element={<ManageUsers />} path="/admin/users" />
          <Route element={<ApproveEvents />} path="/admin/approve-events" />
          <Route element={<ApproveFundraisers />} path="/admin/approve-fundraisers" />
          <Route element={<ReportsPage />} path="/admin/reports" />
          <Route element={<ActivityLogs />} path="/admin/activity-logs" />
          <Route element={<SecurityLogs />} path="/admin/security-logs" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
        <Route element={<DashboardLayout />}>
          <Route element={<StaffDashboard />} path="/staff/dashboard" />
          <Route element={<CreateEventPage />} path="/staff/create-event" />
          <Route element={<ManageEventsPage />} path="/staff/manage-events" />
          <Route element={<CreateFundraiserPage />} path="/staff/create-fundraiser" />
          <Route element={<ManageFundraisersPage />} path="/staff/manage-fundraisers" />
          <Route element={<ParticipantRecordsPage />} path="/staff/participants" />
          <Route element={<FeedbackRecordsPage />} path="/staff/feedback-records" />
          <Route element={<SubmitReportPage />} path="/staff/submit-report" />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route element={<DashboardLayout />}>
          <Route element={<UserDashboard />} path="/user/dashboard" />
          <Route element={<BrowseEventsPage />} path="/user/browse-events" />
          <Route element={<MyJoinedEventsPage />} path="/user/my-events" />
          <Route element={<DonatePage />} path="/user/donate" />
          <Route element={<MyDonationsPage />} path="/user/my-donations" />
          <Route element={<MyAchievementsPage />} path="/user/my-achievements" />
          <Route element={<SubmitFeedbackPage />} path="/user/submit-feedback" />
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
