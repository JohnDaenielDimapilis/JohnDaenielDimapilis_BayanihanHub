import { HandCoins, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import FormField from "../components/ui/FormField.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export default function Donations() {
  const toast = useToast();
  const [donations, setDonations] = useState([]);
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fundraiser: "", amount: "", donationType: "Cash", purpose: "", paymentReference: "" });

  async function load() {
    try {
      const [d, f] = await Promise.all([api("/donations"), api("/fundraisers")]);
      setDonations(d);
      setFundraisers(f);
    } catch { toast.error("Failed to load donations"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/donations", {
        method: "POST",
        body: JSON.stringify({
          fundraiserId: form.fundraiser,
          amount: Number(form.amount),
          donationType: form.donationType,
          donationPurpose: form.purpose,
          paymentReference: form.paymentReference,
        }),
      });
      toast.success("Donation recorded successfully");
      setForm({ fundraiser: "", amount: "", donationType: "Cash", purpose: "", paymentReference: "" });
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  }

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const columns = [
    {
      key: "donor",
      header: "Donor",
      accessor: (row) => row.donor?.name || "Anonymous",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center text-xs font-bold shrink-0">
            {(row.donor?.name || "A")[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-surface-900">{row.donor?.name || "Anonymous"}</span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      accessor: (row) => Number(row.amount),
      render: (row) => <span className="text-sm font-semibold text-surface-900">PHP {Number(row.amount).toLocaleString()}</span>,
    },
    {
      key: "type",
      header: "Type",
      accessor: "donationType",
      render: (row) => <span className="badge badge-neutral">{row.donationType}</span>,
    },
    {
      key: "purpose",
      header: "Purpose",
      accessor: "purpose",
      render: (row) => <span className="text-sm text-surface-600 truncate max-w-[200px] block">{row.purpose}</span>,
    },
    {
      key: "reference",
      header: "Reference",
      accessor: "paymentReference",
      render: (row) => <code className="text-xs bg-surface-100 px-2 py-1 rounded font-mono text-surface-600">{row.paymentReference}</code>,
    },
    {
      key: "status",
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge value={row.status} />,
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1>Donations</h1>
          <p>Track all donation records and contributions</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Record Donation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Donations</span>
          <strong className="text-2xl font-bold text-surface-900">PHP {totalAmount.toLocaleString()}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Records</span>
          <strong className="text-2xl font-bold text-surface-900">{donations.length}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Average</span>
          <strong className="text-2xl font-bold text-surface-900">
            PHP {donations.length ? Math.round(totalAmount / donations.length).toLocaleString() : 0}
          </strong>
        </div>
      </div>

      <DataTable
        data={donations}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search donations..."
        emptyTitle="No donations yet"
        emptyDescription="Start recording donations by clicking the button above."
        exportFilename="donations"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Donation" description="Add a new donation record.">
        <form onSubmit={create} className="space-y-4">
          <div className="form-grid">
            <FormField label="Fundraiser">
              <select className="input" value={form.fundraiser} onChange={(e) => setForm({ ...form, fundraiser: e.target.value, purpose: fundraisers.find((f) => f._id === e.target.value)?.title || form.purpose })}>
                <option value="">General donation</option>
                {fundraisers.map((f) => <option key={f._id} value={f._id}>{f.title}</option>)}
              </select>
            </FormField>
            <FormField label="Amount (PHP)" required>
              <input type="number" min="1" className="input" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </FormField>
            <FormField label="Donation Type" required>
              <select className="input" value={form.donationType} onChange={(e) => setForm({ ...form, donationType: e.target.value })}>
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>In-kind</option>
                <option>Other</option>
              </select>
            </FormField>
            <FormField label="Purpose" required>
              <input className="input" placeholder="What is this for?" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} required />
            </FormField>
          </div>
          <FormField label="Payment Reference" required>
            <input className="input" placeholder="Reference number or receipt" value={form.paymentReference} onChange={(e) => setForm({ ...form, paymentReference: e.target.value })} required />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Donation"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
