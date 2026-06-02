import { Heart, Calendar, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export default function MyDonations() {
  const toast = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await api("/donations");
      setDonations(data);
    } catch {
      toast.error("Failed to load donations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const columns = [
    {
      key: "fundraiser",
      header: "Fundraiser",
      accessor: (row) => row.fundraiserId?.title || "General Donation",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Gift size={16} className="text-accent-600" />
          <div>
            <p className="text-sm font-semibold text-surface-900">
              {row.fundraiserId?.title || "General Donation"}
            </p>
            <p className="text-xs text-surface-500">{row.fundraiserId?.purpose || row.donationPurpose}</p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      accessor: (row) => Number(row.amount),
      render: (row) => <span className="text-sm font-semibold text-success-600">PHP {Number(row.amount).toLocaleString()}</span>,
    },
    {
      key: "type",
      header: "Method",
      accessor: "donationType",
      render: (row) => <span className="badge badge-neutral text-xs">{row.donationType}</span>,
    },
    {
      key: "date",
      header: "Date",
      accessor: (row) => new Date(row.donationDate),
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-surface-600">
          <Calendar size={14} />
          {new Date(row.donationDate).toLocaleDateString()}
        </div>
      ),
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
      accessor: "donationStatus",
      render: (row) => <span className="badge badge-success text-xs">{row.donationStatus}</span>,
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div>
        <div className="page-header">
          <h1>My Donations</h1>
          <p>Track all your contributions to foundation fundraisers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card-component">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-danger-600" />
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Donated</span>
          </div>
          <strong className="text-2xl font-bold text-surface-900">PHP {totalAmount.toLocaleString()}</strong>
          <p className="text-xs text-surface-500 mt-2">across all fundraisers</p>
        </div>

        <div className="stat-card-component">
          <div className="flex items-center gap-2 mb-2">
            <Gift size={16} className="text-accent-600" />
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Contributions</span>
          </div>
          <strong className="text-2xl font-bold text-surface-900">{donations.length}</strong>
          <p className="text-xs text-surface-500 mt-2">total donations made</p>
        </div>

        <div className="stat-card-component">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-brand-600" />
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Average</span>
          </div>
          <strong className="text-2xl font-bold text-surface-900">
            PHP {donations.length ? Math.round(totalAmount / donations.length).toLocaleString() : 0}
          </strong>
          <p className="text-xs text-surface-500 mt-2">per donation</p>
        </div>
      </div>

      <DataTable
        data={donations}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search your donations..."
        emptyTitle="No donations yet"
        emptyDescription="Start supporting foundation fundraisers and your contributions will appear here."
        exportFilename="my-donations"
      />
    </section>
  );
}
