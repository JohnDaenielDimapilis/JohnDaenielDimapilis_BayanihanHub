import { ClipboardList, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export default function Logs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    api("/logs")
      .then(setLogs)
      .catch(() => toast.error("Failed to load activity logs"))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (period === "all") return true;
    const created = new Date(log.createdAt);
    const now = new Date();
    if (period === "day") return created.toDateString() === now.toDateString();
    if (period === "month") return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    if (period === "year") return created.getFullYear() === now.getFullYear();
    return true;
  });

  const columns = [
    {
      key: "date",
      header: "Timestamp",
      accessor: (row) => row.createdAt,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-surface-400 shrink-0" />
          <div>
            <p className="text-sm text-surface-700">{new Date(row.createdAt).toLocaleDateString()}</p>
            <p className="text-2xs text-surface-400">{new Date(row.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      accessor: (row) => row.userId?.name || "Guest",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-surface-100 text-surface-600 flex items-center justify-center text-2xs font-bold shrink-0">
            {(row.userId?.name || "G")[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-surface-900">{row.userId?.name || "Guest"}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      accessor: "role",
      render: (row) => <span className="badge badge-neutral">{row.role}</span>,
    },
    {
      key: "action",
      header: "Action",
      accessor: "action",
      render: (row) => <span className="text-sm text-surface-700 font-medium">{row.action}</span>,
    },
    {
      key: "module",
      header: "Module",
      accessor: "module",
      render: (row) => (
        <code className="text-xs bg-surface-100 px-2 py-0.5 rounded font-mono text-surface-600">{row.module}</code>
      ),
    },
    {
      key: "outcome",
      header: "Outcome",
      accessor: (row) => row.outcome || row.status,
      render: (row) => <StatusBadge value={row.outcome || row.status} />,
    },
    {
      key: "reason",
      header: "Reason / Record",
      accessor: (row) => row.reason || row.details?.reason || row.details?.rejectionReason || row.relatedRecordId || "",
      render: (row) => (
        <div className="max-w-[260px]">
          <p className="text-xs text-surface-600 truncate">
            {row.reason || row.details?.reason || row.details?.rejectionReason || row.details?.refundReason || "No remarks"}
          </p>
          {row.relatedRecordId && (
            <code className="text-2xs text-surface-400">{String(row.relatedRecordId).slice(-8)}</code>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <ClipboardList size={22} className="text-surface-400" />
          <h1>Activity Logs</h1>
        </div>
        <p>Complete audit trail of all system activities</p>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search logs by user, action, module..."
        emptyTitle="No activity logs"
        emptyDescription="Activity logs will appear here as users interact with the system."
        exportFilename="activity-logs"
        pageSize={25}
        actions={(
          <select className="input h-9 w-auto text-sm" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="all">All time</option>
            <option value="day">Today</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>
        )}
      />
    </section>
  );
}
