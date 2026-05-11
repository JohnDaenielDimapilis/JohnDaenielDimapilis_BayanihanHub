import { Link, Outlet, NavLink } from "react-router-dom";

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
        <Link className="flex items-center gap-3" to="/">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-bayani-blue to-bayani-green font-display text-lg font-extrabold text-white shadow-soft">
            BH
          </span>
          <span className="font-display text-xl font-extrabold text-bayani-ink">BayanihanHub</span>
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
