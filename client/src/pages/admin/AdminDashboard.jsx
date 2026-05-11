import { CalendarCheck, HeartHandshake, MessageSquare, ShieldCheck, Users } from "lucide-react";

import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { useResource } from "../../hooks/useResource";
import { formatCurrency, formatDate } from "../../utils/formatDate";
import { sampleSummary } from "../../utils/mockData";

export default function AdminDashboard() {
  const { data: summary, error } = useResource("/reports/summary", sampleSummary);

  return (
    <>
      <PageHeader
        eyebrow="Admin Control"
        subtitle="Monitor approvals, users, donations, security activity, and operational reports."
        title="Admin Dashboard"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Total Events" value={summary.totalEvents || 0} />
        <StatCard accent="warm" icon={CalendarCheck} label="Pending Events" value={summary.pendingEvents || 0} />
        <StatCard accent="green" icon={HeartHandshake} label="Total Donations" value={formatCurrency(summary.totalDonations || 0)} />
        <StatCard accent="ink" icon={Users} label="Registered Users" value={summary.registeredUsers || 0} />
        <StatCard accent="green" icon={ShieldCheck} label="Approved Fundraisers" value={summary.approvedFundraisers || 0} />
        <StatCard icon={Users} label="Active Participants" value={summary.activeParticipants || 0} />
        <StatCard accent="warm" icon={MessageSquare} label="Recent Feedback" value={summary.recentFeedback?.length || 0} />
        <StatCard accent="ink" icon={ShieldCheck} label="Recent Logs" value={summary.recentLogs?.length || 0} />
      </section>
      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-2xl font-extrabold text-bayani-ink">Recent Feedback</h2>
          <DataTable
            columns={[
              { key: "event", label: "Event", render: (row) => row.eventId?.eventTitle || "Event" },
              { key: "rating", label: "Rating", render: (row) => `${row.rating}/5` },
              { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) }
            ]}
            rows={summary.recentFeedback || []}
          />
        </div>
        <div>
          <h2 className="mb-4 font-display text-2xl font-extrabold text-bayani-ink">Recent Logs</h2>
          <DataTable
            columns={[
              { key: "activityType", label: "Type" },
              { key: "description", label: "Description" },
              { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) }
            ]}
            rows={summary.recentLogs || []}
          />
        </div>
      </section>
    </>
  );
}
