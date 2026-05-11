import { Award, CalendarCheck, HeartHandshake, MessageSquare } from "lucide-react";

import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { useResource } from "../../hooks/useResource";
import { formatCurrency, formatDate } from "../../utils/formatDate";
import { sampleAchievements, sampleDonations, sampleEvents } from "../../utils/mockData";

export default function UserDashboard() {
  const { data: events, error } = useResource("/events/approved", sampleEvents.filter((event) => event.status === "approved"));
  const { data: donations } = useResource("/donations/my-donations", sampleDonations);
  const { data: achievements } = useResource("/achievements/my-achievements", sampleAchievements);
  const totalDonated = donations.reduce((total, donation) => total + (donation.donationAmount || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Volunteer and Donor Portal"
        subtitle="Join events, contribute to approved fundraisers, submit feedback, and track achievements."
        title="User Dashboard"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Approved Events" value={events.length} />
        <StatCard accent="green" icon={HeartHandshake} label="My Donations" value={formatCurrency(totalDonated)} />
        <StatCard accent="warm" icon={Award} label="Achievements" value={achievements.length} />
        <StatCard accent="ink" icon={MessageSquare} label="Feedback Access" value="Open" />
      </section>
      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl font-extrabold text-bayani-ink">Upcoming Approved Events</h2>
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
