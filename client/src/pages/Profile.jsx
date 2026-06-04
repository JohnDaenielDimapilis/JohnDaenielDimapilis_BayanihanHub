import { Download, Save, Shield, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { accountsApi } from "../api/client.js";
import FormField from "../components/ui/FormField.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { logout } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    accountsApi.me()
      .then((data) => setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || ""
      }))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await accountsApi.updateMe(profile);
      const savedUser = JSON.parse(localStorage.getItem("bayanihan_user") || "{}");
      localStorage.setItem("bayanihan_user", JSON.stringify({ ...savedUser, name: data.name, email: data.email }));
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

  async function exportData() {
    try {
      const data = await accountsApi.exportMe();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bayanihanhub-my-data.json";
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Data export downloaded");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deactivate() {
    if (!window.confirm("Deactivate your account? You will be signed out immediately.")) return;
    try {
      await accountsApi.deactivateMe();
      logout();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account details, password, data export, and account status</p>
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
            <h2 className="text-base font-semibold text-surface-900">Data and Account</h2>
            <div className="flex flex-wrap gap-3">
              <button className="btn-outline" onClick={exportData}>
                <Download size={16} />
                Export My Data
              </button>
              <button className="btn-danger" onClick={deactivate}>
                <Trash2 size={16} />
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
