import { CheckCircle, Inbox, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { donationsApi, eventsApi, fundraisersApi } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ApprovalRequests() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [fundraisers, setFundraisers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [eventData, fundraiserData, donationData] = await Promise.all([
        eventsApi.getAll(),
        fundraisersApi.getAll(),
        donationsApi.getAll()
      ]);
      setEvents(eventData);
      setFundraisers(fundraiserData);
      setDonations(donationData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const requests = useMemo(() => {
    const rows = [
      ...events
        .filter((event) => event.status === "Pending Review")
        .map((event) => ({
          id: event._id,
          type: "Event",
          requestedBy: event.createdBy?.name || "Staff",
          requestedAt: event.createdAt,
          status: event.status,
          details: event.title,
          source: event
        })),
      ...fundraisers
        .filter((fundraiser) => fundraiser.status === "Pending")
        .map((fundraiser) => ({
          id: fundraiser._id,
          type: "Fundraiser",
          requestedBy: fundraiser.createdBy?.name || "Staff",
          requestedAt: fundraiser.createdAt,
          status: fundraiser.status,
          details: fundraiser.title,
          source: fundraiser
        })),
      ...donations
        .filter((donation) => ["Submitted", "Under Review", "Pending"].includes(donation.donationStatus))
        .map((donation) => ({
          id: donation._id,
          type: "Donation",
          requestedBy: donation.donor?.name || "Donor",
          requestedAt: donation.createdAt || donation.donationDate,
          status: donation.donationStatus,
          details: `${donation.fundraiserId?.title || "Fundraiser"} - PHP ${Number(donation.amount || 0).toLocaleString()}`,
          source: donation
        }))
    ];
    return rows.sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));
  }, [events, fundraisers, donations]);

  async function approve(row) {
    try {
      if (row.type === "Event") {
        await eventsApi.approve(row.id, {
          approvalCriteria: { goalAligned: true, dateValid: true, resourcesAvailable: true, capacityReasonable: true },
          approvalRemarks: "Approved from approval queue."
        });
      }
      if (row.type === "Fundraiser") await fundraisersApi.approve(row.id);
      if (row.type === "Donation") await donationsApi.verify(row.id, { verificationNotes: "Verified from approval queue." });
      toast.success(`${row.type} approved`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function reject(row) {
    const reason = window.prompt(`Reason for rejecting this ${row.type.toLowerCase()}:`);
    if (!reason) return;
    try {
      if (row.type === "Event") await eventsApi.reject(row.id, { rejectionReason: reason });
      if (row.type === "Fundraiser") await fundraisersApi.reject(row.id, { rejectionReason: reason });
      if (row.type === "Donation") await donationsApi.reject(row.id, { rejectionReason: reason });
      toast.success(`${row.type} rejected`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const columns = [
    { key: "type", header: "Request Type", accessor: "type", render: (row) => <span className="badge badge-neutral">{row.type}</span> },
    { key: "requestedBy", header: "Requested By", accessor: "requestedBy" },
    { key: "requestedAt", header: "Date Requested", accessor: "requestedAt", render: (row) => <span className="text-sm text-surface-600">{row.requestedAt ? new Date(row.requestedAt).toLocaleString() : "N/A"}</span> },
    { key: "status", header: "Status", accessor: "status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "details", header: "Details", accessor: "details" },
    {
      key: "actions",
      header: "",
      sortable: false,
      render: (row) => user.role === "Admin" ? (
        <div className="flex items-center justify-end gap-2">
          <button className="btn-primary btn-xs" onClick={() => approve(row)}>
            <CheckCircle size={13} />
            Approve
          </button>
          <button className="btn-danger btn-xs" onClick={() => reject(row)}>
            <XCircle size={13} />
            Reject
          </button>
        </div>
      ) : <span className="text-xs text-surface-400">Waiting for Admin</span>
    }
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <Inbox size={22} className="text-surface-400" />
          <h1>Approval Requests</h1>
        </div>
        <p>Track event, fundraiser, and donation requests that need Admin action</p>
      </div>

      <DataTable
        data={requests}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search approval requests..."
        emptyTitle="No approval requests"
        emptyDescription="Submitted requests will appear here."
        exportFilename="approval-requests"
      />
    </section>
  );
}
