import { ArrowLeft, Gift, Target, Calendar, User, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import Modal from "../components/ui/Modal.jsx";
import FormField from "../components/ui/FormField.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function FundraiserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [fundraiser, setFundraiser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", donationType: "Cash", paymentReference: "" });

  async function loadData() {
    try {
      const fundraiserData = await api(`/fundraisers/${id}`);
      setFundraiser(fundraiserData);

      const allDonations = await api("/donations");
      const fundraiserDonations = allDonations.filter((d) => d.fundraiserId?._id === id);
      setDonations(fundraiserDonations);
    } catch (err) {
      toast.error(err.message || "Failed to load fundraiser details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleDonate(e) {
    e.preventDefault();
    setDonating(true);

    try {
      if (!form.amount || Number(form.amount) <= 0) {
        toast.error("Please enter a valid amount");
        setDonating(false);
        return;
      }

      await api("/donations", {
        method: "POST",
        body: JSON.stringify({
          fundraiserId: id,
          amount: Number(form.amount),
          donationType: form.donationType,
          donationPurpose: fundraiser.purpose,
          paymentReference: form.paymentReference,
        }),
      });

      toast.success("Thank you for your donation!");
      setForm({ amount: "", donationType: "Cash", paymentReference: "" });
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDonating(false);
    }
  }

  if (loading) {
    return (
      <section className="space-y-6 animate-fade-in">
        <button onClick={() => navigate("/fundraisers")} className="btn-outline btn-sm gap-2">
          <ArrowLeft size={16} /> Back to Fundraisers
        </button>
        <div className="bg-surface-100 animate-pulse h-96 rounded-lg"></div>
      </section>
    );
  }

  if (!fundraiser) {
    return (
      <section className="space-y-6 animate-fade-in">
        <button onClick={() => navigate("/fundraisers")} className="btn-outline btn-sm gap-2">
          <ArrowLeft size={16} /> Back to Fundraisers
        </button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-surface-900">Fundraiser not found</h2>
          <p className="text-surface-600 mt-2">This fundraiser might have been deleted or moved.</p>
        </div>
      </section>
    );
  }

  const pct = Math.min(100, Math.round((fundraiser.raisedAmount / fundraiser.targetAmount) * 100));
  const daysLeft = Math.ceil((new Date(fundraiser.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isActive = fundraiser.status === "Approved" && daysLeft > 0;

  return (
    <section className="space-y-6 animate-fade-in">
      <button onClick={() => navigate("/fundraisers")} className="btn-outline btn-sm gap-2">
        <ArrowLeft size={16} /> Back to Fundraisers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="card-padded">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-surface-900">{fundraiser.title}</h1>
                <p className="text-surface-600 mt-2">{fundraiser.purpose}</p>
              </div>
              <div className={`badge ${isActive ? "badge-success" : "badge-warning"}`}>
                {fundraiser.status}
              </div>
            </div>

            {fundraiser.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-surface-700 leading-relaxed">{fundraiser.description}</p>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="card-padded space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-surface-600 font-medium mb-2">Fundraising Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-success-600">
                    PHP {Number(fundraiser.raisedAmount || 0).toLocaleString()}
                  </span>
                  <span className="text-surface-600">
                    of PHP {Number(fundraiser.targetAmount).toLocaleString()}
                  </span>
                </div>
              </div>
              <span className="text-2xl font-bold text-surface-900">{pct}%</span>
            </div>

            <ProgressBar
              value={fundraiser.raisedAmount || 0}
              max={fundraiser.targetAmount}
              color={pct >= 100 ? "success" : pct >= 50 ? "brand" : "warning"}
            />

            {isActive && (
              <button className="btn-primary btn-lg w-full" onClick={() => setModalOpen(true)}>
                <DollarSign size={18} /> Donate Now
              </button>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-padded">
              <div className="flex items-center gap-3 text-surface-600 mb-2">
                <Calendar size={16} className="text-brand-600" />
                <span className="text-xs font-semibold uppercase">Deadline</span>
              </div>
              <p className="text-lg font-semibold text-surface-900">
                {new Date(fundraiser.deadline).toLocaleDateString()}
              </p>
              {daysLeft > 0 ? (
                <p className="text-xs text-success-600 mt-1">{daysLeft} days remaining</p>
              ) : (
                <p className="text-xs text-danger-600 mt-1">Campaign ended</p>
              )}
            </div>

            <div className="card-padded">
              <div className="flex items-center gap-3 text-surface-600 mb-2">
                <User size={16} className="text-brand-600" />
                <span className="text-xs font-semibold uppercase">Created By</span>
              </div>
              <p className="text-lg font-semibold text-surface-900">
                {fundraiser.createdBy?.name || "Staff Member"}
              </p>
              <p className="text-xs text-surface-500 mt-1">{fundraiser.createdBy?.role}</p>
            </div>
          </div>
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="space-y-4">
          <div className="card-padded">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift size={20} className="text-accent-600" />
              </div>
              <p className="text-sm text-surface-600 font-medium">Total Donors</p>
              <p className="text-3xl font-bold text-surface-900">{donations.length}</p>
            </div>
          </div>

          <div className="card-padded">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target size={20} className="text-success-600" />
              </div>
              <p className="text-sm text-surface-600 font-medium">Goal</p>
              <p className="text-2xl font-bold text-surface-900">
                PHP {Number(fundraiser.targetAmount).toLocaleString()}
              </p>
            </div>
          </div>

          {fundraiser.relatedEvent && (
            <div className="card-padded">
              <p className="text-xs font-semibold text-surface-600 uppercase mb-2">Related Event</p>
              <p className="text-sm font-medium text-surface-900">{fundraiser.relatedEvent?.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* Donations Section */}
      <div className="card-padded">
        <h2 className="text-xl font-bold text-surface-900 mb-6">Recent Donations ({donations.length})</h2>

        {donations.length === 0 ? (
          <div className="text-center py-8 text-surface-500">
            <p>No donations yet. Be the first to donate!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.slice().reverse().map((donation) => (
              <div key={donation._id} className="flex items-center justify-between p-4 bg-surface-50 rounded-lg border border-surface-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                      {(donation.donor?.name || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-900">
                        {donation.donor?.name || "Anonymous Donor"}
                      </p>
                      <p className="text-xs text-surface-500">
                        {new Date(donation.donationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success-600">
                    PHP {Number(donation.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-surface-500 badge badge-neutral">
                    {donation.donationType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Make a Donation"
        description={`Support this important cause: ${fundraiser.title}`}
      >
        <form onSubmit={handleDonate} className="space-y-4">
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
            <p className="text-sm text-brand-900">
              <strong>Fundraiser:</strong> {fundraiser.title}
            </p>
            <p className="text-xs text-brand-700 mt-1">
              Help us reach PHP {Number(fundraiser.targetAmount).toLocaleString()}
            </p>
          </div>

          <FormField label="Donation Amount (PHP)" required>
            <input
              type="number"
              min="1"
              step="0.01"
              className="input"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Donation Method" required>
            <select
              className="input"
              value={form.donationType}
              onChange={(e) => setForm({ ...form, donationType: e.target.value })}
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Card Payment</option>
              <option>Mobile Payment</option>
              <option>In-kind</option>
              <option>Other</option>
            </select>
          </FormField>

          <FormField label="Payment Reference" required>
            <input
              type="text"
              className="input"
              placeholder="Receipt number, transaction ID, or reference"
              value={form.paymentReference}
              onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
              required
            />
          </FormField>

          <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
            <p className="text-sm text-surface-600">
              <strong>Your donation:</strong> PHP {form.amount ? Number(form.amount).toLocaleString() : "0.00"}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)} disabled={donating}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={donating || !form.amount}>
              {donating ? "Processing..." : "Confirm Donation"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
