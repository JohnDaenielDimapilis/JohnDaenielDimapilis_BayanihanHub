import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { navigationByRole } from "../routes/navigation";

export default function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const navigation = navigationByRole[user?.role] || navigationByRole.user;

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
      isActive ? "bg-bayani-blue text-white shadow-soft" : "text-slate-600 hover:bg-slate-100 hover:text-bayani-blue"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside
        aria-label="Dashboard navigation"
        className={`fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-100 bg-white p-5 transition lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-bayani-blue to-bayani-green font-display text-lg font-extrabold text-white">
              BH
            </span>
            <div>
              <p className="font-display text-lg font-extrabold text-bayani-ink">BayanihanHub</p>
              <p className="text-xs font-bold uppercase tracking-wider text-bayani-green">{user?.role || "user"}</p>
            </div>
          </div>
          <button aria-label="Close navigation menu" className="rounded-xl p-2 text-slate-500 lg:hidden" onClick={() => setIsOpen(false)} type="button">
            <X size={22} />
          </button>
        </div>
        <nav className="grid gap-2">
          {navigation.map((item) => (
            <NavLink className={navClass} key={item.path} onClick={() => setIsOpen(false)} to={item.path}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="mt-8 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50" onClick={handleLogout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="lg:pl-80">
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <button aria-label="Open navigation menu" className="rounded-2xl border border-slate-200 p-3 lg:hidden" onClick={() => setIsOpen(true)} type="button">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-bold text-slate-500">Welcome back</p>
              <p className="font-display text-xl font-extrabold text-bayani-ink">{user?.fullName || "BayanihanHub User"}</p>
            </div>
            <span className="rounded-full bg-bayani-mist px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-bayani-green">
              {user?.status || "active"}
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-8" id="main-content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
