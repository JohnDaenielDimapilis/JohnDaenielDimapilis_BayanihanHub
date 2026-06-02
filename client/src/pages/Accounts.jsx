import { Plus, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import FormField from "../components/ui/FormField.jsx";
import { useToast } from "../components/ui/Toast.jsx";

const blank = { name: "", email: "", password: "", role: "User" };

export default function Accounts() {
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(blank);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    try { setAccounts(await api("/accounts")); }
    catch { toast.error("Failed to load accounts"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/accounts", { method: "POST", body: JSON.stringify(form) });
      toast.success("Account created successfully");
      setForm(blank);
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  }

  async function toggleActive(account) {
    try {
      await api(`/accounts/${account._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !account.isActive }),
      });
      toast.success(`Account ${account.isActive ? "deactivated" : "activated"}`);
      load();
    } catch (err) { toast.error(err.message); }
  }

  const roleColors = {
    Admin: "badge-danger",
    Staff: "badge-info",
    User: "badge-neutral",
  };

  const activeCount = accounts.filter((a) => a.isActive).length;

  const columns = [
    {
      key: "name",
      header: "User",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${row.isActive ? "bg-brand-50 text-brand-600" : "bg-surface-100 text-surface-400"}`}>
            {row.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${row.isActive ? "text-surface-900" : "text-surface-400"}`}>{row.name}</p>
            <p className="text-xs text-surface-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      accessor: "role",
      render: (row) => <span className={`badge ${roleColors[row.role] || "badge-neutral"}`}>{row.role}</span>,
    },
    {
      key: "status",
      header: "Status",
      accessor: (row) => (row.isActive ? "active" : "inactive"),
      render: (row) => <StatusBadge value={row.isActive ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      width: "120px",
      render: (row) => (
        <div className="flex justify-end">
          <button
            className={`btn-sm ${row.isActive ? "btn-outline" : "btn-primary"}`}
            onClick={() => setConfirm(row)}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <div className="flex items-center gap-2">
            <UserCog size={22} className="text-surface-400" />
            <h1>Accounts</h1>
          </div>
          <p>Manage user accounts and roles</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Accounts</span>
          <strong className="text-2xl font-bold text-surface-900">{accounts.length}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Active</span>
          <strong className="text-2xl font-bold text-success-600">{activeCount}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Inactive</span>
          <strong className="text-2xl font-bold text-surface-400">{accounts.length - activeCount}</strong>
        </div>
      </div>

      <DataTable
        data={accounts}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search by name or email..."
        emptyTitle="No accounts"
        emptyDescription="Create the first account to get started."
        exportFilename="accounts"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Account" description="Add a new user account to the system.">
        <form onSubmit={create} className="space-y-4">
          <FormField label="Full Name" required>
            <input className="input" placeholder="Juan Dela Cruz" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FormField>
          <FormField label="Email Address" required>
            <input type="email" className="input" placeholder="user@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </FormField>
          <FormField label="Temporary Password" required hint="User should change this after first login">
            <input type="password" minLength="8" className="input" placeholder="Minimum 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </FormField>
          <FormField label="Role" required>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="User">User</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={`${confirm?.isActive ? "Deactivate" : "Activate"} Account?`}
        message={`Are you sure you want to ${confirm?.isActive ? "deactivate" : "activate"} the account for "${confirm?.name}"?${confirm?.isActive ? " They will no longer be able to sign in." : ""}`}
        confirmLabel={confirm?.isActive ? "Deactivate" : "Activate"}
        variant={confirm?.isActive ? "danger" : "primary"}
        onConfirm={() => { toggleActive(confirm); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
