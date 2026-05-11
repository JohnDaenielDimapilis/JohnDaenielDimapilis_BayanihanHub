import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { sampleEvents } from "../../utils/mockData";

export default function ParticipantRecordsPage() {
  const { data: events, error } = useResource("/events", sampleEvents);
  const rows = events.flatMap((event) =>
    (event.participants || []).map((participant) => ({
      _id: `${event._id}-${participant._id}`,
      email: participant.email,
      eventTitle: event.eventTitle,
      fullName: participant.fullName,
      status: event.status
    }))
  );

  return (
    <>
      <PageHeader
        eyebrow="Participant Records"
        subtitle="Monitor registered volunteers, donors, and members across approved foundation events."
        title="Participant Records"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "fullName", label: "Participant" },
          { key: "email", label: "Email" },
          { key: "eventTitle", label: "Event" },
          { key: "status", label: "Event Status" }
        ]}
        rows={rows}
      />
    </>
  );
}
