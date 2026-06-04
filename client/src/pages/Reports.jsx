import { BarChart3, FileText, HandCoins, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import BarChart from "../components/charts/BarChart.jsx";
import DonutChart from "../components/charts/DonutChart.jsx";
import StatCard from "../components/StatCard.jsx";
import { SkeletonStats } from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/Toast.jsx";

const eventColors = {
  draft: "#94a3b8",
  "pending review": "#f59e0b",
  approved: "#22c55e",
  "open for registration": "#14b8a6",
  full: "#8b5cf6",
  closed: "#64748b",
  rejected: "#ef4444",
  completed: "#3b82f6",
  archived: "#475569",
  cancelled: "#ef4444",
};

export default function Reports() {
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/reports")
      .then(setReport)
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const donationTotal = report?.totalDonationAmount ?? report?.donations?.reduce((sum, item) => sum + item.total, 0) ?? 0;

  const eventStatusData = (report?.events || []).map((e) => ({
    label: e._id || e.status || "Unknown",
    value: e.count || 0,
    color: eventColors[e._id?.toLowerCase()] || eventColors[e.status?.toLowerCase()] || "#94a3b8",
  }));

  const donationChartData = (report?.donations || []).map((d) => ({
    label: d._id || "Other",
    value: d.total || 0,
    color: "#1d8b67",
  }));

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Analytics and insights across the platform</p>
      </div>

      {loading ? <SkeletonStats count={4} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={report?.users ?? 0} icon={Users} color="blue" />
          <StatCard label="Participants" value={report?.participants ?? 0} icon={Users} color="green" />
          <StatCard label="Feedback" value={report?.feedback?.count ?? 0} icon={MessageSquare} color="purple" subtitle={report?.feedback?.avgRating ? `Avg: ${report.feedback.avgRating.toFixed(1)}/5` : null} />
          <StatCard label="Total Donations" value={`PHP ${donationTotal.toLocaleString()}`} icon={HandCoins} color="green" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-padded">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-surface-400" />
            <h3 className="text-base font-semibold text-surface-900">Event Status Breakdown</h3>
          </div>
          {eventStatusData.length > 0 ? (
            <div className="flex justify-center">
              <DonutChart data={eventStatusData} size={180} strokeWidth={20} />
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-12">No event data available</p>
          )}
        </div>

        <div className="card-padded">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-surface-400" />
            <h3 className="text-base font-semibold text-surface-900">Donations by Type</h3>
          </div>
          {donationChartData.length > 0 ? (
            <BarChart data={donationChartData} height={200} />
          ) : (
            <p className="text-sm text-surface-400 text-center py-12">No donation data available</p>
          )}
        </div>
      </div>

      {!loading && report?.qualityMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Attendance Rate" value={`${report.qualityMetrics.attendanceRate}%`} icon={Users} color="green" />
          <StatCard label="No-show Rate" value={`${report.qualityMetrics.noShowRate}%`} icon={Users} color="red" />
          <StatCard label="Pending Donations" value={report.qualityMetrics.pendingDonationCount ?? 0} icon={HandCoins} color="amber" />
          <StatCard label="Beneficiaries Served" value={report.qualityMetrics.beneficiariesServed ?? 0} icon={Users} color="blue" />
        </div>
      )}

      {report?.events && report.events.length > 0 && (
        <div className="card-padded">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={18} className="text-surface-400" />
            <h3 className="text-base font-semibold text-surface-900">Detailed Event Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Count</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {report.events.map((e, i) => {
                  const statusName = e._id || e.status || "Unknown";
                  const totalEvents = report.events.reduce((s, ev) => s + (ev.count || 0), 0);
                  const pct = totalEvents ? Math.round(((e.count || 0) / totalEvents) * 100) : 0;
                  return (
                    <tr key={i} className="border-b border-surface-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: eventColors[statusName.toLowerCase()] || "#94a3b8" }} />
                          <span className="font-medium text-surface-700 capitalize">{statusName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-surface-900">{e.count || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden max-w-[200px]">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: eventColors[statusName.toLowerCase()] || "#94a3b8" }} />
                          </div>
                          <span className="text-xs text-surface-500 w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
