import { ArrowRight, Award, CalendarDays, Download, Gift, HandCoins, Hourglass, QrCode, ScanLine, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, eventsApi, participantsApi } from "../api/client.js";
import bayanihanLogo from "../assets/bayanihanhub-logo.png";
import BarChart from "../components/charts/BarChart.jsx";
import DonutChart from "../components/charts/DonutChart.jsx";
import StatCard from "../components/StatCard.jsx";
import { SkeletonStats } from "../components/ui/Skeleton.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [fundraisers, setFundraisers] = useState([]);
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrPayload, setQrPayload] = useState("");
  const [qrMessage, setQrMessage] = useState("");
  const [exportDates, setExportDates] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    Promise.all([
      api("/dashboard"),
      api("/events").catch(() => []),
      api("/fundraisers").catch(() => []),
      user.role === "User" ? api("/achievements").catch(() => null) : Promise.resolve(null),
      user.role === "User" ? participantsApi.getMy().catch(() => []) : Promise.resolve([])
    ])
      .then(([summary, eventRows, fundraiserRows, achievementRow, registrationRows]) => {
        setStats(summary);
        setEvents(eventRows);
        setFundraisers(fundraiserRows);
        setAchievement(achievementRow);
        setRegistrations(registrationRows);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.role]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const normalizeStatus = (status) => String(status || "").toLowerCase();

  const eventStatusData = events.length ? [
    { label: "Draft", value: events.filter((event) => normalizeStatus(event.status) === "draft").length, color: "#94a3b8" },
    { label: "Pending Review", value: events.filter((event) => normalizeStatus(event.status) === "pending review").length, color: "#f59e0b" },
    { label: "Approved", value: events.filter((event) => normalizeStatus(event.status) === "approved").length, color: "#22c55e" },
    { label: "Open", value: events.filter((event) => normalizeStatus(event.status) === "open for registration").length, color: "#14b8a6" },
    { label: "Full", value: events.filter((event) => normalizeStatus(event.status) === "full").length, color: "#8b5cf6" },
    { label: "Closed", value: events.filter((event) => normalizeStatus(event.status) === "closed").length, color: "#64748b" },
    { label: "Finished", value: events.filter((event) => normalizeStatus(event.status) === "finished").length, color: "#3b82f6" },
    { label: "Cancelled", value: events.filter((event) => normalizeStatus(event.status) === "cancelled").length, color: "#ef4444" },
    { label: "Rejected", value: events.filter((event) => normalizeStatus(event.status) === "rejected").length, color: "#dc2626" },
    { label: "Archived", value: events.filter((event) => normalizeStatus(event.status) === "archived").length, color: "#475569" },
  ].filter((item) => item.value > 0) : [];

  const topFundraisers = fundraisers
    .filter((fundraiser) => ["approved", "closed"].includes(normalizeStatus(fundraiser.status)))
    .sort((a, b) => b.raisedAmount - a.raisedAmount)
    .slice(0, 5);

  const fundraiserChartData = topFundraisers.map((fundraiser) => ({
    label: fundraiser.title?.slice(0, 12) || "Untitled",
    value: fundraiser.raisedAmount || 0,
    color: "#1d8b67",
  }));

  const recentEvents = events.slice(0, 5);
  const joinedRegistrations = registrations.filter((item) => ["Joined", "Completed"].includes(item.participationStatus));

  const quickActions = [
    { label: "Create Event", to: "/events", icon: CalendarDays, color: "bg-info-50 text-info-600" },
    { label: "New Fundraiser", to: "/fundraisers", icon: Gift, color: "bg-success-50 text-success-600" },
    { label: "Record Donation", to: "/donations", icon: HandCoins, color: "bg-accent-50 text-accent-600" },
    { label: "View Participants", to: "/participants", icon: Users, color: "bg-purple-50 text-purple-600" },
  ];

  async function scanQr() {
    setQrMessage("");
    const raw = qrPayload.trim();
    if (!raw) {
      setQrMessage("Enter the event QR payload or token.");
      return;
    }

    const [eventIdFromPayload, tokenFromPayload] = raw.includes(":") ? raw.split(":") : ["", raw];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bestRegistration = joinedRegistrations.find((item) => {
      const event = item.eventId || {};
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return !Number.isNaN(eventDate.getTime()) && eventDate <= today && !["Finished", "Cancelled"].includes(event.status);
    }) || joinedRegistrations[0];
    const eventId = eventIdFromPayload || bestRegistration?.eventId?._id || bestRegistration?.eventId;
    if (!eventId) {
      setQrMessage("Join an event first before scanning attendance.");
      return;
    }

    try {
      const result = await eventsApi.scanQr(eventId, { qrCodeToken: tokenFromPayload });
      setQrMessage(result.message || "Attendance marked as Present.");
      setQrPayload("");
    } catch (err) {
      setQrMessage(err.message);
    }
  }

  function exportDashboardSummary() {
    const lines = [
      "BayanihanHub Dashboard Export",
      `Generated,${new Date().toLocaleString()}`,
      `Start Date,${exportDates.startDate || "All"}`,
      `End Date,${exportDates.endDate || "All"}`,
      "",
      "Metric,Value",
      `Total Events,${stats?.events ?? 0}`,
      `Fundraisers,${stats?.fundraisers ?? 0}`,
      `Pending Approvals,${stats?.pendingApprovals ?? 0}`,
      `Total Donations,${Number(stats?.donationTotal || 0)}`
    ].join("\n");
    const blob = new Blob([lines], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-summary.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={bayanihanLogo} alt="BayanihanHub Logo" className="w-14 h-14 rounded-lg bg-white object-contain shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              {greeting}, {user.name?.split(" ")[0]}
            </h1>
            <p className="text-sm text-surface-500 mt-1">
              Here's what's happening across your foundation today.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
          <label className="text-xs font-semibold text-surface-500">
            Start
            <input type="date" className="input h-9 mt-1" value={exportDates.startDate} onChange={(e) => setExportDates({ ...exportDates, startDate: e.target.value })} />
          </label>
          <label className="text-xs font-semibold text-surface-500">
            End
            <input type="date" className="input h-9 mt-1" value={exportDates.endDate} onChange={(e) => setExportDates({ ...exportDates, endDate: e.target.value })} />
          </label>
          <button className="btn-outline h-9" onClick={exportDashboardSummary}>
            <Download size={14} />
            Export
          </button>
        </div>
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

      {user.role === "User" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card-padded lg:col-span-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-info-50 text-info-600 flex items-center justify-center shrink-0">
                <QrCode size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-surface-900">QR Attendance Scanner</h3>
                <p className="text-sm text-surface-500">Paste the event QR payload from staff. Demo token: DEMO-TODAY-QR.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <input
                className="input h-10 lg:w-80"
                placeholder="eventId:token or token"
                value={qrPayload}
                onChange={(e) => setQrPayload(e.target.value)}
              />
              <button className="btn-primary h-10" onClick={scanQr}>
                <ScanLine size={15} />
                Scan
              </button>
            </div>
          </div>
          {qrMessage && <p className="mt-3 text-sm font-medium text-surface-700">{qrMessage}</p>}
          </div>
          <div className="card-padded">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center shrink-0">
                <Award size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-surface-900">Achievement Badge</h3>
                <p className="text-xs text-surface-500">
                  PHP {Number(achievement?.totalDonationAmount || 0).toLocaleString()} donated - {achievement?.totalEventsJoined || 0} events joined
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(achievement?.badges?.length ? achievement.badges : ["Start by joining an event or donating"]).map((badge) => (
                <span key={badge} className="badge badge-info">{badge}</span>
              ))}
            </div>
          </div>
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
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${normalizeStatus(event.status) === "approved" ? "bg-success-50 text-success-600" : normalizeStatus(event.status) === "pending review" ? "bg-warning-50 text-warning-600" : "bg-info-50 text-info-600"}`}>
                    <CalendarDays size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">{event.title}</p>
                    <p className="text-xs text-surface-500">{event.location} - {event.date ? new Date(event.date).toLocaleDateString() : "No date"}</p>
                  </div>
                  <span className={`badge ${normalizeStatus(event.status) === "approved" ? "badge-success" : normalizeStatus(event.status) === "pending review" ? "badge-warning" : "badge-info"}`}>
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
              {topFundraisers.map((fundraiser) => {
                const pct = Math.min(100, Math.round((fundraiser.raisedAmount / fundraiser.targetAmount) * 100));
                return (
                  <Link key={fundraiser._id} to={`/fundraisers/${fundraiser._id}`} className="block no-underline rounded-lg p-2 -m-2 hover:bg-surface-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-surface-700 truncate">{fundraiser.title}</span>
                      <span className="text-xs font-semibold text-surface-500">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-success-500" : pct >= 50 ? "bg-brand-500" : "bg-warning-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-2xs text-surface-400">PHP {Number(fundraiser.raisedAmount).toLocaleString()}</span>
                      <span className="text-2xs text-surface-400">PHP {Number(fundraiser.targetAmount).toLocaleString()}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
