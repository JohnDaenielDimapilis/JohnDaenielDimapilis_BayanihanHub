import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../utils/formatDate";
import { sampleEvents } from "../../utils/mockData";

export default function MyJoinedEventsPage() {
  const { user } = useAuth();
  const { data: events, error } = useResource("/events", sampleEvents);
  const joinedEvents = events.filter((event) =>
    (event.participants || []).some((participant) => participant._id === user?._id || participant === user?._id)
  );

  return (
    <>
      <PageHeader
        eyebrow="Participation History"
        subtitle="Your joined events help build participation records and achievements."
        title="My Joined Events"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "eventTitle", label: "Event" },
          { key: "location", label: "Location" },
          { key: "eventDate", label: "Date", render: (row) => formatDate(row.eventDate) },
          { key: "status", label: "Status" }
        ]}
        rows={joinedEvents}
      />
    </>
  );
}
