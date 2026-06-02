import { CheckCircle, UserX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export default function Participants() {
  const toast = useToast();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  async function load() {
    try { setParticipants(await api("/participants")); }
    catch { toast.error("Failed to load participants"); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function doAttendance(id, attendanceStatus) {
    try {
      await api(`/participants/${id}/status`, { method: "PATCH", body: JSON.stringify({ attendanceStatus }) });
      toast.success(`Marked as ${attendanceStatus.toLowerCase()}`);
      load();
    } catch (err) { toast.error(err.message); }
  }

  const presentCount = participants.filter((p) => p.attendanceStatus === "Present").length;
  const absentCount = participants.filter((p) => p.attendanceStatus === "Absent").length;

  const columns = [
    {
      key: "user",
      header: "Participant",
      accessor: (row) => row.userId?.name || "Unknown",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
            {(row.userId?.name || "U")[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-surface-900">{row.userId?.name || "Unknown"}</span>
        </div>
      ),
    },
    {
      key: "event",
      header: "Event",
      accessor: (row) => row.eventId?.title || "N/A",
      render: (row) => <span className="text-sm text-surface-700">{row.eventId?.title || "N/A"}</span>,
    },
    {
      key: "registration",
      header: "Registration",
      accessor: "participationStatus",
      render: (row) => <StatusBadge value={row.participationStatus} />,
    },
    {
      key: "attendance",
      header: "Attendance",
      accessor: "attendanceStatus",
      render: (row) => <StatusBadge value={row.attendanceStatus} />,
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            className="btn-primary btn-xs"
            onClick={() => setConfirm({ id: row._id, status: "Present", name: row.userId?.name })}
          >
            <CheckCircle size={13} />
            Present
          </button>
          <button
            className="btn-outline btn-xs"
            onClick={() => setConfirm({ id: row._id, status: "Absent", name: row.userId?.name })}
          >
            <UserX size={13} />
            Absent
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Participants</h1>
        <p>Track event registrations and manage attendance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total</span>
          <div className="flex items-center gap-2">
            <Users size={18} className="text-brand-500" />
            <strong className="text-2xl font-bold text-surface-900">{participants.length}</strong>
          </div>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Present</span>
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-success-500" />
            <strong className="text-2xl font-bold text-success-600">{presentCount}</strong>
          </div>
        </div>
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Absent</span>
          <div className="flex items-center gap-2">
            <UserX size={18} className="text-danger-500" />
            <strong className="text-2xl font-bold text-danger-600">{absentCount}</strong>
          </div>
        </div>
      </div>

      <DataTable
        data={participants}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search participants..."
        emptyTitle="No participants yet"
        emptyDescription="Participants will appear here when users join approved events."
        exportFilename="participants"
      />

      <ConfirmDialog
        open={!!confirm}
        title={`Mark as ${confirm?.status}?`}
        message={`Mark ${confirm?.name || "this participant"} as ${confirm?.status?.toLowerCase()}?`}
        confirmLabel={confirm?.status}
        variant={confirm?.status === "Absent" ? "danger" : "primary"}
        onConfirm={() => { doAttendance(confirm.id, confirm.status); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
