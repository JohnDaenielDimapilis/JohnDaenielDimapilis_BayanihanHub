import { Ban, Edit3, KeyRound, Plus, RotateCcw, UserCog } from "lucide-react";
import { useEffect, useState } from "react";
import { accountsApi } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import FormField from "../components/ui/FormField.jsx";
import Modal from "../components/ui/Modal.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const blankCreate = { name: "", email: "", password: "", role: "User" };
const blankEdit = { name: "", email: "", role: "User", accountStatus: "Active" };

export default function Accounts() {
  const { user } = useAuth();
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [resetAccount, setResetAccount] = useState(null);
  const [banAccount, setBanAccount] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(blankCreate);
  const [editForm, setEditForm] = useState(blankEdit);
  const [newPassword, setNewPassword] = useState("Password123");
  const [banForm, setBanForm] = useState({ amount: 7, unit: "days", banReason: "Temporary administrative restriction" });

  async function load() {
    try {
      setLoading(true);
      setAccounts(await accountsApi.getAll(roleFilter));
    } catch {
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [roleFilter]);

  function openEdit(account) {
    setEditAccount(account);
    setEditForm({
      name: account.name || "",
      email: account.email || "",
      role: account.role || "User",
      accountStatus: account.accountStatus || (account.isActive === false ? "Disabled" : "Active")
    });
  }

  async function create(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await accountsApi.create(createForm);
      toast.success("Account created successfully");
      setCreateForm(blankCreate);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = user.role === "Admin"
        ? { ...editForm, isActive: editForm.accountStatus === "Active" }
        : { name: editForm.name, email: editForm.email };
      await accountsApi.patch(editAccount._id, payload);
      toast.success("Account updated");
      setEditAccount(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await accountsApi.resetPassword(resetAccount._id, { password: newPassword });
      toast.success("Password reset");
      setResetAccount(null);
      setNewPassword("Password123");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function applyBan(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await accountsApi.ban(banAccount._id, banForm);
      toast.success("Account temporarily banned");
      setBanAccount(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function unban(account) {
    try {
      await accountsApi.unban(account._id);
      toast.success("Account restored");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const roleColors = { Admin: "badge-danger", Staff: "badge-info", User: "badge-neutral" };
  const isAdmin = user.role === "Admin";
  const canOperateOn = (account) => isAdmin || account.role === "User";
  const activeCount = accounts.filter((account) => (account.accountStatus || "Active") === "Active" && account.isActive !== false).length;
  const bannedCount = accounts.filter((account) => account.accountStatus === "Temporarily Banned").length;
  const disabledCount = accounts.filter((account) => account.accountStatus === "Disabled" || account.isActive === false).length - bannedCount;

  const columns = [
    {
      key: "name",
      header: "User",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-brand-50 text-brand-600">
            {row.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900">{row.name}</p>
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
      header: "Account Status",
      accessor: (row) => row.accountStatus || (row.isActive === false ? "Disabled" : "Active"),
      render: (row) => (
        <div className="space-y-1">
          <StatusBadge value={row.accountStatus || (row.isActive === false ? "Disabled" : "Active")} />
          {row.banUntil && <p className="text-2xs text-surface-500">Until {new Date(row.banUntil).toLocaleDateString()}</p>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      render: (row) => canOperateOn(row) ? (
        <div className="flex flex-wrap justify-end gap-2 min-w-[300px]">
          <button className="btn-outline btn-xs" onClick={() => openEdit(row)}>
            <Edit3 size={13} />
            Edit
          </button>
          {isAdmin && (
            <button className="btn-outline btn-xs" onClick={() => setResetAccount(row)}>
              <KeyRound size={13} />
              Reset
            </button>
          )}
          {row.accountStatus === "Temporarily Banned" ? (
            <button className="btn-primary btn-xs" onClick={() => unban(row)}>
              <RotateCcw size={13} />
              Unban
            </button>
          ) : (
            <button className="btn-danger btn-xs" onClick={() => setBanAccount(row)}>
              <Ban size={13} />
              Ban
            </button>
          )}
        </div>
      ) : <span className="text-xs text-surface-400">Protected account</span>,
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="page-header mb-0">
          <div className="flex items-center gap-2">
            <UserCog size={22} className="text-surface-400" />
            <h1>Accounts</h1>
          </div>
          <p>Manage roles, profile details, password resets, temporary bans, unbans, and disabled accounts</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Account
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Accounts</span>
          <strong className="text-2xl font-bold text-surface-900">{accounts.length}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Active</span>
          <strong className="text-2xl font-bold text-success-600">{activeCount}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Temp Banned</span>
          <strong className="text-2xl font-bold text-danger-600">{bannedCount}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Disabled</span>
          <strong className="text-2xl font-bold text-surface-500">{Math.max(0, disabledCount)}</strong>
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
        actions={(
          <select className="input h-9 w-auto text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">{isAdmin ? "All roles" : "Users"}</option>
            <option value="User">Users</option>
            {isAdmin && <option value="Staff">Staff</option>}
            {isAdmin && <option value="Admin">Admins</option>}
          </select>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Account" description="Add a new user account to the system.">
        <form onSubmit={create} className="space-y-4">
          <FormField label="Full Name" required>
            <input className="input" placeholder="Juan Dela Cruz" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
          </FormField>
          <FormField label="Email Address" required>
            <input type="email" className="input" placeholder="user@example.com" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
          </FormField>
          <FormField label="Temporary Password" required hint="Must include uppercase, lowercase, and a number">
            <input type="password" minLength="8" className="input" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
          </FormField>
          <FormField label="Role" required>
            <select className="input" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
              <option value="User">User</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Creating..." : "Create Account"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editAccount} onClose={() => setEditAccount(null)} title="Edit Account" description={editAccount?.email || ""}>
        <form onSubmit={saveEdit} className="space-y-4">
          <FormField label="Full Name" required>
            <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
          </FormField>
          <FormField label="Email Address" required>
            <input type="email" className="input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
          </FormField>
          {isAdmin && (
            <div className="form-grid">
              <FormField label="Role" required>
                <select className="input" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="User">User</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </FormField>
              <FormField label="Account Status" required>
                <select className="input" value={editForm.accountStatus} onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </FormField>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setEditAccount(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetAccount} onClose={() => setResetAccount(null)} title="Reset Password" description={resetAccount?.email || ""}>
        <form onSubmit={resetPassword} className="space-y-4">
          <FormField label="New Password" required hint="Must include uppercase, lowercase, and a number">
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setResetAccount(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>Reset Password</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!banAccount} onClose={() => setBanAccount(null)} title="Temporary Ban" description={banAccount?.email || ""}>
        <form onSubmit={applyBan} className="space-y-4">
          <div className="form-grid">
            <FormField label="Duration" required>
              <input type="number" min="1" className="input" value={banForm.amount} onChange={(e) => setBanForm({ ...banForm, amount: e.target.value })} required />
            </FormField>
            <FormField label="Unit" required>
              <select className="input" value={banForm.unit} onChange={(e) => setBanForm({ ...banForm, unit: e.target.value })}>
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </FormField>
          </div>
          <FormField label="Ban Reason" required>
            <textarea className="input" value={banForm.banReason} onChange={(e) => setBanForm({ ...banForm, banReason: e.target.value })} required />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setBanAccount(null)}>Cancel</button>
            <button type="submit" className="btn-danger" disabled={submitting}>Apply Ban</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
