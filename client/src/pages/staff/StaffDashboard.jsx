import { CalendarCheck, ClipboardList, HeartHandshake, MessageSquare } from "lucide-react";

import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { useResource } from "../../hooks/useResource";
import { formatCurrency, formatDate } from "../../utils/formatDate";
import { sampleEvents, sampleFeedback, sampleFundraisers } from "../../utils/mockData";

export default function StaffDashboard() {
  const { data: events, error: eventError } = useResource("/events", sampleEvents);
  const { data: fundraisers } = useResource("/fundraisers", sampleFundraisers);
  const { data: feedback } = useResource("/feedback", sampleFeedback);

  const totalRaised = fundraisers.reduce((total, fundraiser) => total + (fundraiser.currentAmount || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Operations"
        subtitle="Create event and fundraiser records, monitor participation, and submit reports for admin review."
        title="Staff Dashboard"
      />
      {eventError ? <div className="mb-5"><Notice tone="warning">{eventError}</Notice></div> : null}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Managed Events" value={events.length} />
        <StatCard accent="warm" icon={ClipboardList} label="Pending Events" value={events.filter((event) => event.status === "pending").length} />
        <StatCard accent="green" icon={HeartHandshake} label="Raised Amount" value={formatCurrency(totalRaised)} />
        <StatCard accent="ink" icon={MessageSquare} label="Feedback Records" value={feedback.length} />
      </section>
      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-bayani-ink">Upcoming Events</h2>
        <DataTable
          columns={[
            { key: "eventTitle", label: "Event" },
            { key: "location", label: "Location" },
            { key: "eventDate", label: "Date", render: (row) => formatDate(row.eventDate) },
            { key: "status", label: "Status" }
          ]}
          rows={events}
        />
      </section>
    </>
  );
}
