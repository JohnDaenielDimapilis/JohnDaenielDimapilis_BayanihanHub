import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormField from "../../components/FormField";
import Notice from "../../components/Notice";
import PasswordField from "../../components/PasswordField";
import { useAuth } from "../../hooks/useAuth";
import { demoAccounts } from "../../utils/demoAccounts";
import { getAuthValidationErrors } from "../../utils/validateForm";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Keeps form state synchronized with the user's typed input.
  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  // Fills the login form with a selected demo account credential set.
  const handleDemoFill = (account) => {
    setForm({ email: account.email, password: account.password });
    setErrors({});
    setMessage(`${account.label} credentials loaded. Click Login to continue.`);
  };

  // Validates the form and redirects authenticated users to the correct role dashboard.
  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = getAuthValidationErrors(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(form);
      navigate(user.role === "admin" ? "/admin/dashboard" : user.role === "staff" ? "/staff/dashboard" : "/user/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed. Check your credentials and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-6xl items-center gap-10 px-5 pb-16 lg:grid-cols-2">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-bayani-green">Secure Access</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold text-bayani-ink">Welcome back to BayanihanHub.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Sign in to manage events, approvals, reports, donations, and volunteer activity based on your assigned role.
        </p>
        <div className="mt-8 rounded-3xl border border-blue-100 bg-white/80 p-5 shadow-soft backdrop-blur">
          <h2 className="font-display text-xl font-extrabold text-bayani-ink">Demo login credentials</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Use these dummy accounts to inspect each role dashboard while MongoDB is not configured.
          </p>
          <div className="mt-5 grid gap-3">
            {demoAccounts.map((account) => (
              <button
                aria-label={`Use ${account.label} credentials`}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                key={account.email}
                onClick={() => handleDemoFill(account)}
                type="button"
              >
                <span className="block text-sm font-extrabold text-bayani-blue">{account.label}</span>
                <span className="mt-1 block text-sm font-semibold text-slate-700">Email: {account.email}</span>
                <span className="mt-1 block text-sm font-semibold text-slate-700">Password: {account.password}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <form aria-label="Login form" className="card grid gap-5" onSubmit={handleSubmit}>
        <FormField autoComplete="email" error={errors.email} label="Email address" name="email" onChange={handleChange} type="email" value={form.email} />
        <PasswordField autoComplete="current-password" error={errors.password} onChange={handleChange} value={form.password} />
        {message ? <Notice tone="error">{message}</Notice> : null}
        <button className="btn-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
        <p className="text-center text-sm font-semibold text-slate-600">
          New to BayanihanHub?{" "}
          <Link className="font-extrabold text-bayani-blue" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
}
