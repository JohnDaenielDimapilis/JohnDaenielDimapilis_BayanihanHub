import {
  Award,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  FileText,
  HeartHandshake,
  Home,
  LayoutDashboard,
  Lock,
  Megaphone,
  MessageSquare,
  Receipt,
  ShieldCheck,
  Users
} from "lucide-react";

export const sharedNavigation = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Profile", path: "/profile", icon: Home },
  { label: "Events", path: "/events", icon: CalendarCheck },
  { label: "Fundraising", path: "/fundraising", icon: HeartHandshake },
  { label: "Feedback", path: "/feedback", icon: MessageSquare },
  { label: "Achievements", path: "/achievements", icon: Award }
];

export const adminNavigation = [
  { label: "Admin Dashboard", path: "/admin/dashboard", icon: ShieldCheck },
  { label: "Manage Users", path: "/admin/users", icon: Users },
  { label: "Approve Events", path: "/admin/approve-events", icon: ClipboardCheck },
  { label: "Approve Fundraisers", path: "/admin/approve-fundraisers", icon: Megaphone },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Activity Logs", path: "/admin/activity-logs", icon: ClipboardList },
  { label: "Security Logs", path: "/admin/security-logs", icon: Lock }
];

export const staffNavigation = [
  { label: "Staff Dashboard", path: "/staff/dashboard", icon: LayoutDashboard },
  { label: "Create Event", path: "/staff/create-event", icon: CalendarCheck },
  { label: "Manage Events", path: "/staff/manage-events", icon: ClipboardList },
  { label: "Create Fundraiser", path: "/staff/create-fundraiser", icon: HeartHandshake },
  { label: "Manage Fundraisers", path: "/staff/manage-fundraisers", icon: Megaphone },
  { label: "Participants", path: "/staff/participants", icon: Users },
  { label: "Feedback Records", path: "/staff/feedback-records", icon: MessageSquare },
  { label: "Submit Report", path: "/staff/submit-report", icon: FileText }
];

export const userNavigation = [
  { label: "User Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
  { label: "Browse Events", path: "/user/browse-events", icon: CalendarCheck },
  { label: "My Joined Events", path: "/user/my-events", icon: ClipboardCheck },
  { label: "Donate", path: "/user/donate", icon: HeartHandshake },
  { label: "My Donations", path: "/user/my-donations", icon: Receipt },
  { label: "My Achievements", path: "/user/my-achievements", icon: Award },
  { label: "Submit Feedback", path: "/user/submit-feedback", icon: MessageSquare }
];

export const navigationByRole = {
  admin: [...sharedNavigation, ...adminNavigation],
  staff: [...sharedNavigation, ...staffNavigation],
  user: [...sharedNavigation, ...userNavigation]
};
