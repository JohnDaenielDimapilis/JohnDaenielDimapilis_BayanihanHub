import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../utils/formatDate";
import { sampleEvents } from "../../utils/mockData";

export default function ManageEventsPage() {
  const { data: events, error } = useResource("/events", sampleEvents);

  return (
    <>
      <PageHeader
        eyebrow="Event Operations"
        subtitle="Review event status, schedules, and participant counts."
        title="Manage Events"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "eventTitle", label: "Event" },
          { key: "location", label: "Location" },
          { key: "eventDate", label: "Date", render: (row) => formatDate(row.eventDate) },
          { key: "participants", label: "Participants", render: (row) => `${row.participants?.length || 0}/${row.capacity}` },
          { key: "status", label: "Status" }
        ]}
        rows={events}
      />
    </>
  );
}
