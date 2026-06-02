import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Accounts from "./pages/Accounts.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Donations from "./pages/Donations.jsx";
import Events from "./pages/Events.jsx";
import Feedback from "./pages/Feedback.jsx";
import Fundraisers from "./pages/Fundraisers.jsx";
import FundraiserDetail from "./pages/FundraiserDetail.jsx";
import MyDonations from "./pages/MyDonations.jsx";
import Login from "./pages/Login.jsx";
import Logs from "./pages/Logs.jsx";
import Participants from "./pages/Participants.jsx";
import Register from "./pages/Register.jsx";
import Reports from "./pages/Reports.jsx";
import Security from "./pages/Security.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="accounts" element={<ProtectedRoute roles={["Admin"]}><Accounts /></ProtectedRoute>} />
        <Route path="events" element={<Events />} />
        <Route path="fundraisers" element={<Fundraisers />} />
        <Route path="fundraisers/:id" element={<FundraiserDetail />} />
        <Route path="donations" element={<Donations />} />
        <Route path="my-donations" element={<MyDonations />} />
        <Route path="participants" element={<ProtectedRoute roles={["Admin", "Staff"]}><Participants /></ProtectedRoute>} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="reports" element={<ProtectedRoute roles={["Admin", "Staff"]}><Reports /></ProtectedRoute>} />
        <Route path="logs" element={<ProtectedRoute roles={["Admin"]}><Logs /></ProtectedRoute>} />
        <Route path="security" element={<ProtectedRoute roles={["Admin"]}><Security /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
