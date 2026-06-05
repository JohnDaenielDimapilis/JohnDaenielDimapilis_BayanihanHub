import { Gift, Plus, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import FormField from "../components/ui/FormField.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonCard } from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const blank = { title: "", purpose: "", beneficiary: "", place: "", description: "", targetAmount: 10000, deadline: "" };

export default function Fundraisers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter] = useState("all");
  const [userView, setUserView] = useState("donate");

  async function load() {
    try { setItems(await api("/fundraisers")); }
    catch { toast.error("Failed to load fundraisers"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/fundraisers", { method: "POST", body: JSON.stringify(form) });
      toast.success("Fundraiser submitted for approval");
      setForm(blank);
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  }

  async function doApproval(id, status) {
    try {
      const endpoint = status === "Approved" ? `/fundraisers/${id}/approve` : `/fundraisers/${id}/reject`;
      const body = status === "Rejected"
        ? { rejectionReason: window.prompt("Reason for rejecting this fundraiser:") }
        : {};
      if (status === "Rejected" && !body.rejectionReason) return;
      await api(endpoint, { method: "PATCH", body: JSON.stringify(body) });
      toast.success(`Fundraiser ${status}`);
      load();
    } catch (err) { toast.error(err.message); }
  }

  async function requestRevision(item) {
    const revisionRemarks = window.prompt("Revision notes for this fundraiser:");
    if (!revisionRemarks) return;
    try {
      await api(`/fundraisers/${item._id}/request-revision`, { method: "PATCH", body: JSON.stringify({ revisionRemarks }) });
      toast.success("Fundraiser returned for revision");
      load();
    } catch (err) { toast.error(err.message); }
  }

  const statusMap = { pending: "Pending", revision: "Needs Revision", approved: "Approved", closed: "Closed", rejected: "Rejected" };
  const capitalizedFilter = filter === "all" ? "all" : statusMap[filter];
  const userOwned = (item) => (item.createdBy?._id || item.createdBy) === user.id;
  const canReview = (item) => user.role === "Admin" || (user.role === "Staff" && item.createdBy?.role === "User");
  const viewItems = user.role === "User"
    ? items.filter((item) => userView === "donate" ? ["Approved", "Closed"].includes(item.status) : userOwned(item))
    : items;
  const filtered = filter === "all" ? viewItems : viewItems.filter((i) => i.status === capitalizedFilter);

  const statusCounts = {
    all: viewItems.length,
    pending: viewItems.filter((i) => i.status === "Pending").length,
    revision: viewItems.filter((i) => i.status === "Needs Revision").length,
    approved: viewItems.filter((i) => i.status === "Approved").length,
    closed: viewItems.filter((i) => i.status === "Closed").length,
    rejected: viewItems.filter((i) => i.status === "Rejected").length,
  };

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1>Fundraisers</h1>
          <p>Manage fundraising campaigns and track progress</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          New Fundraiser
        </button>
      </div>

      {user.role === "User" && (
        <div className="flex gap-2 flex-wrap">
          <button className={`btn-sm ${userView === "donate" ? "btn-primary" : "btn-ghost"}`} onClick={() => setUserView("donate")}>
            Donate to Fundraisers
          </button>
          <button className={`btn-sm ${userView === "create" ? "btn-primary" : "btn-ghost"}`} onClick={() => setUserView("create")}>
            Create / Track Fundraisers
          </button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn-sm ${filter === key ? "btn-primary" : "btn-ghost"}`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-2xs ${filter === key ? "bg-white/20" : "bg-surface-200"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No fundraisers found"
          description={filter !== "all" ? `No ${filter} fundraisers.` : "Create your first fundraiser to get started."}
          action={user.role !== "User" && filter === "all" ? (
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Create Fundraiser
            </button>
          ) : null}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const pct = item.progressPercentage ?? Math.min(100, Math.round((item.raisedAmount / item.targetAmount) * 100));
            return (
              <div
                key={item._id}
                onClick={() => ["Approved", "Closed"].includes(item.status) && user.role === "User" ? navigate(`/fundraisers/${item._id}`) : null}
                className={["Approved", "Closed"].includes(item.status) && user.role === "User" ? "cursor-pointer" : ""}
              >
                <article className="card-padded flex flex-col gap-4 hover:shadow-soft transition-shadow h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success-50 text-success-600 flex items-center justify-center shrink-0">
                        <Gift size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-surface-900 truncate">{item.title}</h3>
                        <p className="text-xs text-surface-500 truncate">{item.purpose}</p>
                        <p className="text-2xs text-surface-400 truncate">{item.beneficiary || "Community beneficiaries"} - {item.place || "Service area"}</p>
                      </div>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-lg font-bold text-surface-900">PHP {Number(item.raisedAmount).toLocaleString()}</span>
                      <span className="text-xs text-surface-500 flex items-center gap-1">
                        <Target size={12} /> PHP {Number(item.targetAmount).toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar value={item.raisedAmount} max={item.targetAmount} color={pct >= 100 ? "success" : pct >= 50 ? "brand" : "warning"} />
                    <p className="text-xs text-surface-400 mt-1.5">{pct}% of goal reached</p>
                  </div>

                  {item.deadline && (
                    <p className="text-xs text-surface-500">
                      Deadline: {new Date(item.deadline).toLocaleDateString()}
                    </p>
                  )}

                  {["Admin", "Staff"].includes(user.role) && item.status === "Pending" && canReview(item) && (
                    <div className="flex gap-2 pt-1 border-t border-surface-100">
                      <button className="btn-primary btn-sm flex-1" onClick={() => setConfirm({ id: item._id, action: "Approved", title: item.title })}>Approve</button>
                      <button className="btn-outline btn-sm flex-1" onClick={() => requestRevision(item)}>Revision</button>
                      <button className="btn-danger btn-sm flex-1" onClick={() => setConfirm({ id: item._id, action: "Rejected", title: item.title })}>Reject</button>
                    </div>
                  )}

                  {["Approved", "Closed"].includes(item.status) && user.role === "User" && userView === "donate" && (
                    <button className="btn-primary btn-sm w-full mt-2" onClick={() => navigate(`/fundraisers/${item._id}`)}>
                      {item.status === "Closed" ? "View Report" : "View & Donate"}
                    </button>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Fundraiser" description="Submit a new fundraising campaign.">
        <form onSubmit={create} className="space-y-4">
          <div className="form-grid">
            <FormField label="Campaign Title" required>
              <input className="input" placeholder="Campaign title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </FormField>
            <FormField label="Purpose" required>
              <input className="input" placeholder="What is this for?" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} required />
            </FormField>
            <FormField label="Beneficiary" required>
              <input className="input" placeholder="Who will receive support?" value={form.beneficiary} onChange={(e) => setForm({ ...form, beneficiary: e.target.value })} required />
            </FormField>
            <FormField label="Place" required>
              <input className="input" placeholder="Barangay, city, or service area" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} required />
            </FormField>
            <FormField label="Target Amount (PHP)" required>
              <input type="number" min="1" className="input" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
            </FormField>
            <FormField label="Deadline" required>
              <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
            </FormField>
          </div>
          <FormField label="Description" required>
            <textarea className="input" placeholder="Describe the campaign..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Fundraiser"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={`${confirm?.action === "Approved" ? "Approve" : "Reject"} Fundraiser?`}
        message={`Are you sure you want to ${confirm?.action === "Approved" ? "approve" : "reject"} "${confirm?.title}"?`}
        confirmLabel={confirm?.action === "Approved" ? "Approve" : "Reject"}
        variant={confirm?.action === "Approved" ? "primary" : "danger"}
        onConfirm={() => { doApproval(confirm.id, confirm.action); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
