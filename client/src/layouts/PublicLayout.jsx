import { Link, Outlet, NavLink } from "react-router-dom";

import BrandLogo from "../components/BrandLogo";

export default function PublicLayout() {
  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-bold transition ${
      isActive ? "bg-bayani-blue text-white" : "text-slate-600 hover:bg-white hover:text-bayani-blue"
    }`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e2f3ed,transparent_36%),linear-gradient(135deg,#fff8ec_0%,#f7faf8_48%,#eef7f3_100%)]">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link aria-label="BayanihanHub home" className="flex items-center" to="/">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink className={navLinkClass} to="/">
            Home
          </NavLink>
          <NavLink className={navLinkClass} to="/about">
            About
          </NavLink>
          <NavLink className={navLinkClass} to="/login">
            Login
          </NavLink>
          <Link className="btn-primary ml-2" to="/register">
            Register
          </Link>
        </nav>
      </header>
      <main id="main-content" tabIndex="-1">
        <Outlet />
      </main>
    </div>
  );
}
