import { Navigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate replace to="/admin/dashboard" />;
  }

  if (user?.role === "staff") {
    return <Navigate replace to="/staff/dashboard" />;
  }

  return <Navigate replace to="/user/dashboard" />;
}
