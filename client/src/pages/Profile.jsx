import { Award, Save, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { accountsApi, achievementsApi } from "../api/client.js";
import FormField from "../components/ui/FormField.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export default function Profile() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "", showAchievementBadge: true });
  const [achievement, setAchievement] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    Promise.all([
      accountsApi.me(),
      achievementsApi.getAll().catch(() => null)
    ])
      .then(([data, achievementData]) => {
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          showAchievementBadge: data.showAchievementBadge !== false
        });
        setAchievement(Array.isArray(achievementData) ? achievementData[0] : achievementData);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await accountsApi.updateMe(profile);
      const savedUser = JSON.parse(localStorage.getItem("bayanihan_user") || "{}");
      localStorage.setItem("bayanihan_user", JSON.stringify({
        ...savedUser,
        name: data.name,
        email: data.email,
        showAchievementBadge: data.showAchievementBadge
      }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await accountsApi.changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account details, password, and achievement visibility</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <form onSubmit={saveProfile} className="card-padded space-y-4">
          <div className="flex items-center gap-2">
            <User size={18} className="text-surface-400" />
            <h2 className="text-base font-semibold text-surface-900">Account Details</h2>
          </div>
          <FormField label="Full Name" required>
            <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} disabled={loading} required />
          </FormField>
          <FormField label="Email">
            <input className="input" value={profile.email} disabled />
          </FormField>
          <FormField label="Phone">
            <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={loading} />
          </FormField>
          <FormField label="Address">
            <textarea className="input" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} disabled={loading} />
          </FormField>
          <label className="flex items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm text-surface-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={profile.showAchievementBadge}
              onChange={(e) => setProfile({ ...profile, showAchievementBadge: e.target.checked })}
              disabled={loading}
            />
            <span>Show my achievement badges on participant and fundraiser views.</span>
          </label>
          <button className="btn-primary" disabled={saving || loading}>
            <Save size={16} />
            Save Profile
          </button>
        </form>

        <div className="space-y-4">
          <form onSubmit={changePassword} className="card-padded space-y-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-surface-400" />
              <h2 className="text-base font-semibold text-surface-900">Password</h2>
            </div>
            <FormField label="Current Password" required>
              <input type="password" className="input" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
            </FormField>
            <FormField label="New Password" required>
              <input type="password" minLength="8" className="input" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
              <p className="form-hint">Use at least 8 characters with uppercase, lowercase, and a number.</p>
            </FormField>
            <button className="btn-primary" disabled={saving}>
              <Shield size={16} />
              Change Password
            </button>
          </form>

          <div className="card-padded space-y-4">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-surface-400" />
              <h2 className="text-base font-semibold text-surface-900">Achievement Badge</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(achievement?.badges?.length ? achievement.badges : ["No badges yet"]).map((badge) => (
                <span key={badge} className="badge badge-info">{badge}</span>
              ))}
            </div>
            <p className="text-sm text-surface-500">
              {achievement?.points ? `${achievement.points} points earned from events, donations, and feedback.` : "Join events and support fundraisers to unlock badges."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
