import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-50">
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-transparent" />
        <div className="relative z-10 max-w-md">
          <div className="w-14 h-14 rounded-xl bg-accent-400 flex items-center justify-center text-navy-900 font-black text-xl mb-8">
            BH
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Empowering communities through collaboration.
          </h1>
          <p className="text-lg text-surface-400 leading-relaxed">
            BayanihanHub is a centralized platform for managing foundation events, fundraisers, donations, and community engagement.
          </p>
          <div className="flex gap-6 mt-10">
            {[
              { value: "500+", label: "Events managed" },
              { value: "PHP 2M+", label: "Raised" },
              { value: "10K+", label: "Participants" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-accent-400 flex items-center justify-center text-navy-900 font-black text-sm">
              BH
            </div>
            <span className="text-lg font-bold text-surface-900">BayanihanHub</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Welcome back</h2>
          <p className="text-sm text-surface-500 mt-1 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-50 border border-danger-200 mb-6 animate-slide-up">
              <p className="text-sm text-danger-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div className="form-field">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="form-field">
              <div className="flex items-center justify-between">
                <label className="form-label">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full h-11" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn size={16} />
                  Sign in
                </span>
              )}
            </button>
          </form>

          <p className="text-sm text-surface-500 text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-500 font-semibold hover:text-brand-600 no-underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
