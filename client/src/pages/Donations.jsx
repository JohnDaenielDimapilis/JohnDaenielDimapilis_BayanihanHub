import { CheckCircle, HandCoins, Plus, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import FormField from "../components/ui/FormField.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Donations() {
  const { user } = useAuth();
  const toast = useToast();
  const [donations, setDonations] = useState([]);
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });
  const [form, setForm] = useState({
    fundraiser: "",
    amount: "",
    donationType: "Cash",
    purpose: "",
    paymentReference: "",
    proofOfPayment: "",
    message: "",
    donorAnonymous: false
  });

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
          proofOfPayment: form.proofOfPayment,
          message: form.message,
          donorAnonymous: form.donorAnonymous,
        }),
      });
      toast.success("Donation submitted for verification");
      setForm({ fundraiser: "", amount: "", donationType: "Cash", purpose: "", paymentReference: "", proofOfPayment: "", message: "", donorAnonymous: false });
      setModalOpen(false);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  }

  async function verifyDonation(id) {
    const verificationNotes = window.prompt("Verification notes or receipt remarks:", "Payment reference matched official records.") || "";
    try {
      await api(`/donations/${id}/verify`, { method: "PATCH", body: JSON.stringify({ verificationNotes }) });
      toast.success("Donation verified and receipt recorded");
      setSelectedDonation(null);
      load();
    } catch (err) { toast.error(err.message); }
  }

  async function rejectDonation(id) {
    const rejectionReason = window.prompt("Reason for rejecting this donation:");
    if (!rejectionReason) return;
    try {
      await api(`/donations/${id}/reject`, { method: "PATCH", body: JSON.stringify({ rejectionReason }) });
      toast.success("Donation rejected");
      setSelectedDonation(null);
      load();
    } catch (err) { toast.error(err.message); }
  }

  async function refundDonation(id) {
    const refundReason = window.prompt("Reason for refund/correction:");
    if (!refundReason) return;
    try {
      await api(`/donations/${id}/refund`, { method: "PATCH", body: JSON.stringify({ refundReason }) });
      toast.success("Donation marked as refunded");
      setSelectedDonation(null);
      load();
    } catch (err) { toast.error(err.message); }
  }

  const verifiedDonations = donations.filter((d) => d.donationStatus === "Verified");
  const pendingDonations = donations.filter((d) => ["Pending", "Submitted", "Under Review"].includes(d.donationStatus));
  const totalAmount = verifiedDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const filteredDonations = donations.filter((donation) => {
    const donationDate = new Date(donation.donationDate || donation.createdAt);
    if (filters.startDate && donationDate < new Date(filters.startDate)) return false;
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      if (donationDate > end) return false;
    }
    return true;
  });

  const columns = [
    {
      key: "donor",
      header: "Donor",
      sortable: false,
      accessor: (row) => row.donorAnonymous ? "Anonymous" : row.donor?.name || "Anonymous",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-50 text-accent-600 flex items-center justify-center text-xs font-bold shrink-0">
            {(row.donorAnonymous ? "A" : row.donor?.name || "A")[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-surface-900">
            {row.donorAnonymous ? "Anonymous Donor" : row.donor?.name || "Anonymous"}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      sortable: false,
      accessor: (row) => Number(row.amount),
      render: (row) => <span className="text-sm font-semibold text-surface-900">PHP {Number(row.amount).toLocaleString()}</span>,
    },
    {
      key: "type",
      header: "Type",
      sortable: false,
      accessor: "donationType",
      render: (row) => <span className="badge badge-neutral">{row.donationType}</span>,
    },
    {
      key: "reference",
      header: "Reference",
      sortable: false,
      accessor: "paymentReference",
      render: (row) => <code className="text-xs bg-surface-100 px-2 py-1 rounded font-mono text-surface-600">{row.paymentReference}</code>,
    },
    {
      key: "info",
      header: "Info",
      sortable: false,
      render: (row) => (
        <button className="btn-ghost btn-xs" onClick={() => setSelectedDonation(row)}>
          More Info
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      accessor: "donationStatus",
      render: (row) => <StatusBadge value={row.donationStatus} />,
    },
    {
      key: "actions",
      header: "Action",
      sortable: false,
      render: (row) => user.role !== "User" ? (
        <div className="flex items-center gap-2 justify-end">
          {!["Verified", "Rejected", "Refunded", "Cancelled"].includes(row.donationStatus) && (
            <>
              <button className="btn-primary btn-xs" onClick={() => verifyDonation(row._id)}>
                <CheckCircle size={13} /> Approve
              </button>
              <button className="btn-danger btn-xs" onClick={() => rejectDonation(row._id)}>
                <XCircle size={13} /> Reject
              </button>
            </>
          )}
          {row.donationStatus === "Verified" && (
            <button className="btn-outline btn-xs" onClick={() => refundDonation(row._id)}>
              <RotateCcw size={13} /> Edit
            </button>
          )}
        </div>
      ) : null,
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1>Donations</h1>
          <p>Track all donation records and contributions</p>
        </div>
        {user.role === "User" && (
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Submit Donation
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Verified Amount</span>
          <strong className="text-2xl font-bold text-surface-900">PHP {totalAmount.toLocaleString()}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Pending Review</span>
          <strong className="text-2xl font-bold text-warning-600">{pendingDonations.length}</strong>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Records</span>
          <strong className="text-2xl font-bold text-surface-900">{donations.length}</strong>
        </div>
      </div>

      <div className="card-padded grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField label="Start Date">
          <input type="date" className="input h-10" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        </FormField>
        <FormField label="End Date">
          <input type="date" className="input h-10" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        </FormField>
        <div className="flex items-end">
          <button className="btn-outline w-full" onClick={() => setFilters({ startDate: "", endDate: "" })}>Reset Date</button>
        </div>
      </div>

      <DataTable
        data={filteredDonations}
        columns={columns}
        loading={loading}
        searchable={false}
        emptyTitle="No donations yet"
        emptyDescription="Start recording donations by clicking the button above."
      />

      <Modal
        open={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
        title="Donation Information"
        description={selectedDonation ? `${selectedDonation.donorAnonymous ? "Anonymous donor" : selectedDonation.donor?.name || "Anonymous"} - PHP ${Number(selectedDonation.amount || 0).toLocaleString()}` : ""}
      >
        {selectedDonation && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Fundraiser</p>
                <p className="font-medium text-surface-800">{selectedDonation.fundraiserId?.title || "General donation"}</p>
              </div>
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Donation Date</p>
                <p className="font-medium text-surface-800">{selectedDonation.donationDate ? new Date(selectedDonation.donationDate).toLocaleString() : "Not recorded"}</p>
              </div>
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Payment Reference</p>
                <p className="font-medium text-surface-800 break-all">{selectedDonation.paymentReference || "None"}</p>
              </div>
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Receipt</p>
                <p className="font-medium text-surface-800">{selectedDonation.receiptNumber || "Pending"}</p>
              </div>
            </div>
            <div className="rounded-lg border border-surface-200 p-4 space-y-3 text-sm text-surface-700">
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Purpose</p>
                <p>{selectedDonation.donationPurpose || selectedDonation.fundraiserId?.purpose || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Proof / Attachment</p>
                <p className="break-words">{selectedDonation.proofOfPayment || "No proof details provided."}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Donor Message</p>
                <p>{selectedDonation.message || "No donor message."}</p>
              </div>
              {(selectedDonation.verificationNotes || selectedDonation.rejectionReason || selectedDonation.refundReason) && (
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Review Notes</p>
                  <p>{selectedDonation.verificationNotes || selectedDonation.rejectionReason || selectedDonation.refundReason}</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-200 p-3">
              <StatusBadge value={selectedDonation.donationStatus} />
              {user.role !== "User" && (
                <div className="flex flex-wrap gap-2">
                  {!["Verified", "Rejected", "Refunded", "Cancelled"].includes(selectedDonation.donationStatus) && (
                    <>
                      <button className="btn-primary btn-sm" onClick={() => verifyDonation(selectedDonation._id)}>
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => rejectDonation(selectedDonation._id)}>
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  )}
                  {selectedDonation.donationStatus === "Verified" && (
                    <button className="btn-outline btn-sm" onClick={() => refundDonation(selectedDonation._id)}>
                      <RotateCcw size={14} /> Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit Donation" description="Submit proof for admin verification.">
        <form onSubmit={create} className="space-y-4">
          <div className="form-grid">
            <FormField label="Fundraiser" required>
              <select className="input" value={form.fundraiser} onChange={(e) => setForm({ ...form, fundraiser: e.target.value, purpose: fundraisers.find((f) => f._id === e.target.value)?.purpose || form.purpose })} required>
                <option value="">Select fundraiser</option>
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
          <FormField label="Proof Details">
            <textarea className="input" placeholder="Paste receipt link, transaction note, or upload reference" value={form.proofOfPayment} onChange={(e) => setForm({ ...form, proofOfPayment: e.target.value })} />
          </FormField>
          <FormField label="Message">
            <textarea className="input" placeholder="Optional message for the beneficiary or fundraiser team" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </FormField>
          <label className="flex items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 text-sm text-surface-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.donorAnonymous}
              onChange={(e) => setForm({ ...form, donorAnonymous: e.target.checked })}
            />
            <span>Hide my name from public fundraising pages.</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
