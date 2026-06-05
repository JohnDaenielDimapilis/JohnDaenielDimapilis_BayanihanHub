import {
  Award, CalendarDays, ChartNoAxesCombined, ClipboardList, Gift, HandCoins,
  History, Inbox, LayoutDashboard, Search, UserCog
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const allPages = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, keywords: "home overview" },
  { to: "/events", label: "Events", icon: CalendarDays, keywords: "event calendar" },
  { to: "/history", label: "History", icon: History, keywords: "joined event attendance feedback", roles: ["User"] },
  { to: "/fundraisers", label: "Fundraisers", icon: Gift, keywords: "campaign fundraising" },
  { to: "/donations", label: "Donations", icon: HandCoins, keywords: "donate money" },
  { to: "/achievements", label: "Achievements", icon: Award, keywords: "badges milestones", roles: ["Admin", "User"] },
  { to: "/accounts", label: "Accounts", icon: UserCog, keywords: "users accounts admin staff", roles: ["Admin", "Staff"] },
  { to: "/approval-requests", label: "Approval Requests", icon: Inbox, keywords: "review approve reject pending", roles: ["Admin", "Staff"] },
  { to: "/reports", label: "Reports", icon: ChartNoAxesCombined, keywords: "analytics data", roles: ["Admin", "Staff"] },
  { to: "/logs", label: "Activity Logs", icon: ClipboardList, keywords: "audit trail", roles: ["Admin"] },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const pages = useMemo(() => allPages.filter((p) => !p.roles || p.roles.includes(user.role)), [user.role]);

  const results = useMemo(() => {
    if (!query.trim()) return pages;
    const q = query.toLowerCase();
    return pages.filter((p) => p.label.toLowerCase().includes(q) || p.keywords.includes(q));
  }, [query, pages]);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          setQuery("");
          onClose();
          setTimeout(() => onClose(), 0);
        }
      }
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  function go(to) {
    navigate(to);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-overlay border border-surface-200 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-surface-100">
          <Search size={18} className="text-surface-400 shrink-0" />
          <input
            autoFocus
            className="flex-1 h-12 bg-transparent text-sm text-surface-900 placeholder:text-surface-400 outline-none border-0"
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="px-1.5 py-0.5 rounded bg-surface-100 text-2xs font-medium text-surface-500 border border-surface-200">
            ESC
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No pages found for "{query}"</p>
          ) : (
            <div className="space-y-0.5">
              {results.map(({ to, label, icon: Icon }) => (
                <button
                  key={to}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-surface-700 hover:bg-surface-100 transition-colors text-left"
                  onClick={() => go(to)}
                >
                  <Icon size={16} className="text-surface-400 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
