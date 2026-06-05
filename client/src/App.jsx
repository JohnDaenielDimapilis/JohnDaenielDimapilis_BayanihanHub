import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Accounts from "./pages/Accounts.jsx";
import Achievements from "./pages/Achievements.jsx";
import ApprovalRequests from "./pages/ApprovalRequests.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Donations from "./pages/Donations.jsx";
import Events from "./pages/Events.jsx";
import Feedback from "./pages/Feedback.jsx";
import Fundraisers from "./pages/Fundraisers.jsx";
import FundraiserDetail from "./pages/FundraiserDetail.jsx";
import History from "./pages/History.jsx";
import MyDonations from "./pages/MyDonations.jsx";
import Login from "./pages/Login.jsx";
import Logs from "./pages/Logs.jsx";
import Participants from "./pages/Participants.jsx";
import Profile from "./pages/Profile.jsx";
import PublicEvents from "./pages/PublicEvents.jsx";
import Register from "./pages/Register.jsx";
import Reports from "./pages/Reports.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/public-events" element={<PublicEvents />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="accounts" element={<ProtectedRoute roles={["Admin", "Staff"]}><Accounts /></ProtectedRoute>} />
        <Route path="approval-requests" element={<ProtectedRoute roles={["Admin", "Staff"]}><ApprovalRequests /></ProtectedRoute>} />
        <Route path="events" element={<Events />} />
        <Route path="history" element={<History />} />
        <Route path="fundraisers" element={<Fundraisers />} />
        <Route path="fundraisers/:id" element={<FundraiserDetail />} />
        <Route path="donations" element={<Donations />} />
        <Route path="my-donations" element={<MyDonations />} />
        <Route path="achievements" element={<ProtectedRoute roles={["Admin", "User"]}><Achievements /></ProtectedRoute>} />
        <Route path="participants" element={<ProtectedRoute roles={["Admin", "Staff"]}><Participants /></ProtectedRoute>} />
        <Route path="feedback" element={<ProtectedRoute roles={["Admin", "Staff"]}><Feedback /></ProtectedRoute>} />
        <Route path="profile" element={<Profile />} />
        <Route path="reports" element={<ProtectedRoute roles={["Admin", "Staff"]}><Reports /></ProtectedRoute>} />
        <Route path="logs" element={<ProtectedRoute roles={["Admin"]}><Logs /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
