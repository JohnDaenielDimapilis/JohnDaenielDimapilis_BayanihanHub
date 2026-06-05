import { Chrome, Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bayanihanLogo from "../assets/bayanihanhub-logo.png";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { googleLogin, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", privacyConsent: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!form.privacyConsent) {
        setError("Please agree to the privacy notice before creating an account.");
        setLoading(false);
        return;
      }
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError("");
    setLoading(true);
    try {
      await googleLogin();
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
          <img src={bayanihanLogo} alt="BayanihanHub Logo" className="w-52 max-w-full rounded-xl bg-white object-contain mb-8" />
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Join the Bayanihan community.
          </h1>
          <p className="text-lg text-surface-400 leading-relaxed">
            Create your account to start managing events, participating in fundraisers, and making a difference in your community.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={bayanihanLogo} alt="BayanihanHub Logo" className="w-36 rounded-lg bg-white object-contain" />
            <span className="text-lg font-bold text-surface-900">BayanihanHub</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900 tracking-tight">Create your account</h2>
          <p className="text-sm text-surface-500 mt-1 mb-8">Get started with BayanihanHub</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-danger-50 border border-danger-200 mb-6 animate-slide-up">
              <p className="text-sm text-danger-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div className="form-field">
              <label className="form-label">Full name</label>
              <input
                className="input"
                placeholder="Juan Dela Cruz"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
                autoComplete="name"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Minimum 8 characters"
                  minLength="8"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
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
              <p className="form-hint">Use at least 8 characters with uppercase, lowercase, and a number.</p>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm text-surface-700">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.privacyConsent}
                onChange={(e) => setForm({ ...form, privacyConsent: e.target.checked })}
                required
              />
              <span>
                I agree that BayanihanHub may store my account, event participation, donation, feedback, and achievement records for foundation operations, reporting, and audit purposes.
              </span>
            </label>

            <button type="submit" className="btn-primary w-full h-11" disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <UserPlus size={16} />
                  Create account
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-surface-200 flex-1" />
            <span className="text-xs font-medium text-surface-400">or</span>
            <div className="h-px bg-surface-200 flex-1" />
          </div>

          <button type="button" className="btn-outline w-full h-11 justify-center" onClick={signInWithGoogle} disabled={loading}>
            <Chrome size={16} />
            Continue with Google
          </button>

          <p className="text-sm text-surface-500 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-600 no-underline">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-surface-500 text-center mt-3">
            Browse before signing up?{" "}
            <Link to="/public-events" className="text-brand-500 font-semibold hover:text-brand-600 no-underline">
              View public events
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
