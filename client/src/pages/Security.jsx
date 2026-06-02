import { AlertTriangle, Lock, ShieldAlert, ShieldCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { SkeletonStats, SkeletonTable } from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export default function Security() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api("/security"), api("/security/logs")])
      .then(([s, l]) => { setSummary(s); setLogs(l); })
      .catch(() => toast.error("Failed to load security data"))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "date",
      header: "Timestamp",
      accessor: (row) => row.createdAt,
      render: (row) => (
        <div>
          <p className="text-sm text-surface-700">{new Date(row.createdAt).toLocaleDateString()}</p>
          <p className="text-2xs text-surface-400">{new Date(row.createdAt).toLocaleTimeString()}</p>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      accessor: (row) => row.user?.name || "Guest",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-2xs font-bold shrink-0 ${row.outcome === "failed" ? "bg-danger-50 text-danger-600" : "bg-surface-100 text-surface-600"}`}>
            {(row.user?.name || "G")[0].toUpperCase()}
          </div>
          <span className="text-sm font-medium text-surface-900">{row.user?.name || "Guest"}</span>
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
      render: (row) => (
        <div className="flex items-center gap-2">
          {(row.outcome === "failed" || row.action?.toLowerCase().includes("unauthorized")) && (
            <AlertTriangle size={13} className="text-danger-500 shrink-0" />
          )}
          <span className="text-sm text-surface-700">{row.action}</span>
        </div>
      ),
    },
    {
      key: "outcome",
      header: "Outcome",
      accessor: "outcome",
      render: (row) => <StatusBadge value={row.outcome} />,
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} className="text-surface-400" />
          <h1>Security</h1>
        </div>
        <p>Monitor security events and potential threats</p>
      </div>

      {loading ? <SkeletonStats count={4} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Failed Logins" value={summary?.failedLogins ?? 0} icon={Lock} color="red" />
          <StatCard label="Unauthorized" value={summary?.unauthorizedAttempts ?? 0} icon={ShieldAlert} color="amber" />
          <StatCard label="Inactive Users" value={summary?.inactiveUsers ?? 0} icon={UserX} color="default" />
          <StatCard label="Role Changes" value={summary?.roleChanges ?? 0} icon={ShieldCheck} color="blue" />
        </div>
      )}

      {(summary?.failedLogins > 0 || summary?.unauthorizedAttempts > 0) && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-warning-50 border border-warning-200">
          <AlertTriangle size={18} className="text-warning-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-warning-800">Security Alert</p>
            <p className="text-sm text-warning-700 mt-0.5">
              {summary.failedLogins > 0 && `${summary.failedLogins} failed login attempt(s) detected. `}
              {summary.unauthorizedAttempts > 0 && `${summary.unauthorizedAttempts} unauthorized access attempt(s) detected.`}
            </p>
          </div>
        </div>
      )}

      {loading ? <SkeletonTable rows={8} cols={5} /> : (
        <DataTable
          data={logs}
          columns={columns}
          searchPlaceholder="Search security events..."
          emptyTitle="No security events"
          emptyDescription="Security events will be logged here automatically."
          exportFilename="security-logs"
          pageSize={25}
        />
      )}
    </section>
  );
}
