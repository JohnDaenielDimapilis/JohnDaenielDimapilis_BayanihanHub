import {
  Award, Bell, CalendarDays, ChartNoAxesCombined, ChevronLeft, ClipboardList,
  Gift, HandCoins, History, Inbox, LayoutDashboard, LogOut, Menu, Search,
  UserCog, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { notificationsApi } from "../api/client.js";
import bayanihanLogo from "../assets/bayanihanhub-logo.png";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./ui/Avatar.jsx";
import CommandPalette from "./CommandPalette.jsx";

const navSections = [
  {
    label: "Overview",
    links: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    links: [
      { to: "/events", label: "Events", icon: CalendarDays },
      { to: "/fundraisers", label: "Fundraisers", icon: Gift, roles: ["Admin", "Staff", "User"] },
      { to: "/donations", label: "Donations", icon: HandCoins, roles: ["Admin", "Staff", "User"] },
      { to: "/history", label: "History", icon: History, roles: ["User"] },
      { to: "/achievements", label: "Achievements", icon: Award, roles: ["Admin", "User"] },
    ],
  },
  {
    label: "Administration",
    links: [
      { to: "/accounts", label: "Accounts", icon: UserCog, roles: ["Admin", "Staff"] },
      { to: "/approval-requests", label: "Approval Requests", icon: Inbox, roles: ["Admin", "Staff"] },
      { to: "/reports", label: "Reports", icon: ChartNoAxesCombined, roles: ["Admin", "Staff"] },
      { to: "/logs", label: "Activity Logs", icon: ClipboardList, roles: ["Admin"] },
      { to: "/profile", label: "Profile", icon: UserCog },
    ],
  },
];

const pageTitles = {
  "/": "Dashboard",
  "/events": "Events",
  "/history": "History",
  "/fundraisers": "Fundraisers",
  "/donations": "Donations",
  "/my-donations": "My Donations",
  "/achievements": "Achievements",
  "/participants": "Participants",
  "/feedback": "Feedback",
  "/approval-requests": "Approval Requests",
  "/profile": "Profile",
  "/accounts": "Accounts",
  "/reports": "Reports",
  "/logs": "Activity Logs",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const currentTitle = pageTitles[location.pathname] || "Dashboard";
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  useEffect(() => {
    notificationsApi.getAll()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [location.pathname]);

  async function markNotificationsRead() {
    try {
      await notificationsApi.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    } catch {
      setNotificationsOpen(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-navy-900 transition-all duration-300 ease-in-out
          lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "lg:w-[72px]" : "lg:w-[264px]"}
          w-[264px]
        `}
      >
        <div className={`flex items-center gap-3 px-5 h-16 border-b border-white/[0.08] shrink-0 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}>
          <img src={bayanihanLogo} alt="BayanihanHub Logo" className="w-10 h-10 rounded-lg bg-white object-contain shrink-0" />
          <div className={`overflow-hidden transition-all ${collapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"}`}>
            <h1 className="text-white font-bold text-base leading-tight whitespace-nowrap">BayanihanHub</h1>
            <p className="text-surface-400 text-2xs leading-tight whitespace-nowrap">Foundation Management</p>
          </div>
          <button
            className="lg:hidden ml-auto p-1.5 rounded-md text-surface-400 hover:text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Main navigation">
          {navSections.map((section) => {
            const visibleLinks = section.links.filter((l) => !l.roles || l.roles.includes(user.role));
            if (!visibleLinks.length) return null;
            return (
              <div key={section.label}>
                <div className={`text-2xs font-semibold text-surface-500 uppercase tracking-widest mb-2 ${collapsed ? "lg:hidden" : "px-3"}`}>
                  {section.label}
                </div>
                <div className="space-y-0.5">
                  {visibleLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/"}
                      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""} ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                      title={collapsed ? label : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className={`transition-all ${collapsed ? "lg:hidden" : ""}`}>{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className={`shrink-0 border-t border-white/[0.08] p-3 ${collapsed ? "lg:px-2" : ""}`}>
          <div className={`flex items-center gap-3 rounded-lg p-2.5 mb-2 bg-white/[0.05] ${collapsed ? "lg:justify-center lg:p-2" : ""}`}>
            <Avatar name={user.name} size="sm" className="bg-brand-500/20 text-brand-300 shrink-0" />
            <div className={`overflow-hidden min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-2xs text-surface-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className={`sidebar-link text-surface-400 hover:text-danger-400 w-full ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-surface-200 shadow-soft items-center justify-center text-surface-500 hover:text-surface-700 z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={14} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 shrink-0 bg-white border-b border-surface-200 flex items-center gap-4 px-4 lg:px-6">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:block">
            <h2 className="text-lg font-semibold text-surface-900">{currentTitle}</h2>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-surface-200 text-sm text-surface-400 hover:text-surface-600 hover:border-surface-300 transition-colors"
          >
            <Search size={15} />
            <span>Search...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-100 text-2xs font-medium text-surface-500 border border-surface-200">
              Ctrl K
            </kbd>
          </button>

          <div className="relative">
            <button
              className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />}
            </button>
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-surface-200 shadow-elevated z-50 overflow-hidden animate-scale-in">
                  <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-surface-900">Notifications</p>
                      <p className="text-xs text-surface-500">{unreadCount} unread</p>
                    </div>
                    {notifications.length > 0 && (
                      <button className="btn-ghost btn-xs" onClick={markNotificationsRead}>
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-surface-500 text-center py-8">No notifications yet</p>
                    ) : notifications.map((item) => (
                      <div key={item._id} className={`px-4 py-3 border-b border-surface-100 last:border-0 ${item.readAt ? "bg-white" : "bg-brand-50/50"}`}>
                        <p className="text-sm font-semibold text-surface-900">{item.title}</p>
                        <p className="text-xs text-surface-600 mt-1">{item.message}</p>
                        <p className="text-2xs text-surface-400 mt-2">{new Date(item.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
            >
              <Avatar name={user.name} size="sm" />
              <span className="hidden md:block text-sm font-medium text-surface-700">{user.name}</span>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-surface-200 shadow-elevated z-50 py-1 animate-scale-in">
                  <div className="px-4 py-3 border-b border-surface-100">
                    <p className="text-sm font-semibold text-surface-900">{user.name}</p>
                    <p className="text-xs text-surface-500">{user.email || user.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-100 transition-colors no-underline"
                  >
                    <UserCog size={15} />
                    Profile settings
                  </Link>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
