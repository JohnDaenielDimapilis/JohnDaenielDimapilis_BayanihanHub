import { CheckCircle, Download, QrCode, UserX, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api, getToken, participantsApi } from "../api/client.js";
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
      await participantsApi.manualAttendance(id, { attendanceStatus, attendanceRemarks: `Marked ${attendanceStatus} manually.` });
      toast.success(`Marked as ${attendanceStatus.toLowerCase()}`);
      load();
    } catch (err) { toast.error(err.message); }
  }

  async function exportEvent(eventId, title) {
    try {
      const response = await fetch(participantsApi.exportUrl(eventId), {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(title || "event").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-participants.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Participant export downloaded");
    } catch (err) { toast.error(err.message); }
  }

  const presentCount = participants.filter((p) => p.attendanceStatus === "Present").length;
  const absentCount = participants.filter((p) => p.attendanceStatus === "Absent").length;
  const pendingCount = participants.filter((p) => p.attendanceStatus === "Pending").length;

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
      key: "waitlist",
      header: "Waitlist",
      accessor: (row) => row.waitlistPosition || "",
      render: (row) => row.waitlistPosition ? <span className="text-sm font-semibold text-surface-700">#{row.waitlistPosition}</span> : <span className="text-xs text-surface-400">-</span>,
    },
    {
      key: "checkedInAt",
      header: "Check-in",
      accessor: (row) => row.checkedInAt || "",
      render: (row) => (
        <span className="text-xs text-surface-500">
          {row.checkedInAt ? new Date(row.checkedInAt).toLocaleString() : "Not checked in"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2 justify-end min-w-[260px]">
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
          {row.eventId?._id && (
            <button className="btn-outline btn-xs" onClick={() => exportEvent(row.eventId._id, row.eventId?.title)}>
              <Download size={13} />
              Export
            </button>
          )}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="stat-card-component">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Pending</span>
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-warning-500" />
            <strong className="text-2xl font-bold text-warning-600">{pendingCount}</strong>
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
