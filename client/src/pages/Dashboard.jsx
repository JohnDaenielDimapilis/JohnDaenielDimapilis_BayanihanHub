import { ArrowRight, CalendarDays, Gift, HandCoins, Hourglass, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import BarChart from "../components/charts/BarChart.jsx";
import DonutChart from "../components/charts/DonutChart.jsx";
import StatCard from "../components/StatCard.jsx";
import { SkeletonStats } from "../components/ui/Skeleton.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/dashboard"),
      api("/events").catch(() => []),
      api("/fundraisers").catch(() => []),
    ])
      .then(([s, e, f]) => { setStats(s); setEvents(e); setFundraisers(f); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const eventStatusData = events.length ? [
    { label: "Approved", value: events.filter((e) => e.status === "approved").length, color: "#22c55e" },
    { label: "Pending", value: events.filter((e) => e.status === "pending").length, color: "#f59e0b" },
    { label: "Rejected", value: events.filter((e) => e.status === "rejected").length, color: "#ef4444" },
  ].filter((d) => d.value > 0) : [];

  const topFundraisers = fundraisers
    .filter((f) => f.status === "approved")
    .sort((a, b) => b.raisedAmount - a.raisedAmount)
    .slice(0, 5);

  const fundraiserChartData = topFundraisers.map((f) => ({
    label: f.title?.slice(0, 12) || "Untitled",
    value: f.raisedAmount || 0,
    color: "#1d8b67",
  }));

  const recentEvents = events.slice(0, 5);

  const quickActions = [
    { label: "Create Event", to: "/events", icon: CalendarDays, color: "bg-info-50 text-info-600" },
    { label: "New Fundraiser", to: "/fundraisers", icon: Gift, color: "bg-success-50 text-success-600" },
    { label: "Record Donation", to: "/donations", icon: HandCoins, color: "bg-accent-50 text-accent-600" },
    { label: "View Participants", to: "/participants", icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
          {greeting}, {user.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Here's what's happening across your foundation today.
        </p>
      </div>

      {loading ? <SkeletonStats count={4} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Events" value={stats?.events ?? 0} icon={CalendarDays} color="blue" trendLabel="all time" />
          <StatCard label="Fundraisers" value={stats?.fundraisers ?? 0} icon={Gift} color="green" trendLabel="active campaigns" />
          <StatCard label="Pending Approvals" value={stats?.pendingApprovals ?? 0} icon={Hourglass} color="amber" trendLabel="needs attention" />
          <StatCard
            label="Total Donations"
            value={`PHP ${Number(stats?.donationTotal || 0).toLocaleString()}`}
            icon={HandCoins}
            color="green"
            trendLabel="all contributions"
          />
        </div>
      )}

      {user.role !== "User" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="card-padded flex items-center gap-3 group hover:shadow-soft transition-all no-underline"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                <action.icon size={18} />
              </div>
              <span className="text-sm font-medium text-surface-700 group-hover:text-surface-900">{action.label}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card-padded lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-surface-900">Recent Events</h3>
            <Link to="/events" className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1 no-underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-8">No events yet</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${event.status === "approved" ? "bg-success-50 text-success-600" : event.status === "pending" ? "bg-warning-50 text-warning-600" : "bg-danger-50 text-danger-600"}`}>
                    <CalendarDays size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">{event.title}</p>
                    <p className="text-xs text-surface-500">{event.location} · {new Date(event.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge ${event.status === "approved" ? "badge-success" : event.status === "pending" ? "badge-warning" : "badge-danger"}`}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-padded">
          <h3 className="text-base font-semibold text-surface-900 mb-5">Event Status</h3>
          {eventStatusData.length > 0 ? (
            <div className="flex justify-center">
              <DonutChart data={eventStatusData} size={160} strokeWidth={18} />
            </div>
          ) : (
            <p className="text-sm text-surface-400 text-center py-8">No event data</p>
          )}
        </div>
      </div>

      {topFundraisers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-padded">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-surface-900">Top Fundraisers</h3>
              <Link to="/fundraisers" className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1 no-underline">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <BarChart data={fundraiserChartData} height={180} />
          </div>

          <div className="card-padded">
            <h3 className="text-base font-semibold text-surface-900 mb-5">Fundraiser Progress</h3>
            <div className="space-y-4">
              {topFundraisers.map((f) => {
                const pct = Math.min(100, Math.round((f.raisedAmount / f.targetAmount) * 100));
                return (
                  <div key={f._id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-surface-700 truncate">{f.title}</span>
                      <span className="text-xs font-semibold text-surface-500">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-success-500" : pct >= 50 ? "bg-brand-500" : "bg-warning-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-2xs text-surface-400">PHP {Number(f.raisedAmount).toLocaleString()}</span>
                      <span className="text-2xs text-surface-400">PHP {Number(f.targetAmount).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="card-padded">
        <h3 className="text-base font-semibold text-surface-900 mb-4">Workflow Pipeline</h3>
        <div className="flex flex-wrap items-center gap-3">
          {[
            { step: "1", label: "Staff submits", color: "bg-info-50 text-info-600 border-info-200" },
            { step: "2", label: "Admin approves", color: "bg-warning-50 text-warning-600 border-warning-200" },
            { step: "3", label: "Users join & donate", color: "bg-success-50 text-success-600 border-success-200" },
            { step: "4", label: "Feedback collected", color: "bg-purple-50 text-purple-600 border-purple-200" },
            { step: "5", label: "Achievements update", color: "bg-accent-50 text-accent-600 border-accent-200" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <ArrowRight size={14} className="text-surface-300 hidden sm:block" />}
              <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${item.color}`}>
                <span className="w-6 h-6 rounded-full bg-current/10 flex items-center justify-center text-xs font-bold">{item.step}</span>
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
