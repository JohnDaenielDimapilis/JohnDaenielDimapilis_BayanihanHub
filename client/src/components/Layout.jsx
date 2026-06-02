import {
  Bell, CalendarDays, ChartNoAxesCombined, ChevronLeft, ClipboardList,
  Gift, HandCoins, LayoutDashboard, LogOut, Menu, MessageSquare, Search,
  ShieldCheck, UserCog, Users, X
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
      { to: "/fundraisers", label: "Fundraisers", icon: Gift },
      { to: "/donations", label: "Donations", icon: HandCoins, roles: ["Admin", "Staff"] },
      { to: "/my-donations", label: "My Donations", icon: HandCoins, roles: ["User"] },
      { to: "/participants", label: "Participants", icon: Users, roles: ["Admin", "Staff"] },
      { to: "/feedback", label: "Feedback", icon: MessageSquare },
    ],
  },
  {
    label: "Administration",
    links: [
      { to: "/accounts", label: "Accounts", icon: UserCog, roles: ["Admin"] },
      { to: "/reports", label: "Reports", icon: ChartNoAxesCombined, roles: ["Admin", "Staff"] },
      { to: "/logs", label: "Activity Logs", icon: ClipboardList, roles: ["Admin"] },
      { to: "/security", label: "Security", icon: ShieldCheck, roles: ["Admin"] },
    ],
  },
];

const pageTitles = {
  "/": "Dashboard",
  "/events": "Events",
  "/fundraisers": "Fundraisers",
  "/donations": "Donations",
  "/my-donations": "My Donations",
  "/participants": "Participants",
  "/feedback": "Feedback",
  "/accounts": "Accounts",
  "/reports": "Reports",
  "/logs": "Activity Logs",
  "/security": "Security",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentTitle = pageTitles[location.pathname] || "Dashboard";

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
          <div className="w-9 h-9 rounded-lg bg-accent-400 flex items-center justify-center text-navy-900 font-black text-sm shrink-0">
            BH
          </div>
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

          <button
            className="relative p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

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
