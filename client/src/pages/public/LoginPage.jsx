import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import FormField from "../../components/FormField";
import Notice from "../../components/Notice";
import { useAuth } from "../../hooks/useAuth";
import { getAuthValidationErrors } from "../../utils/validateForm";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

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
      </div>
      <form className="card grid gap-5" onSubmit={handleSubmit}>
        <FormField error={errors.email} label="Email address" name="email" onChange={handleChange} type="email" value={form.email} />
        <FormField error={errors.password} label="Password" name="password" onChange={handleChange} type="password" value={form.password} />
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
