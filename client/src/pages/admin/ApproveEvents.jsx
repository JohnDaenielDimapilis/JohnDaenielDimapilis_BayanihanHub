import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../utils/formatDate";
import { sampleEvents } from "../../utils/mockData";

export default function ApproveEvents() {
  const { data: events, error, setData } = useResource("/events", sampleEvents);

  const updateStatus = async (event, action) => {
    const { data } = await api.patch(`/events/${event._id}/${action}`);
    setData((currentEvents) => currentEvents.map((currentEvent) => (currentEvent._id === event._id ? data : currentEvent)));
  };

  return (
    <>
      <PageHeader
        eyebrow="Approval Workflow"
        subtitle="Events stay private until Admin approval makes them visible to users."
        title="Approve Events"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "eventTitle", label: "Event" },
          { key: "location", label: "Location" },
          { key: "eventDate", label: "Date", render: (row) => formatDate(row.eventDate) },
          { key: "status", label: "Status" },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <button className="btn-secondary px-3 py-2" onClick={() => updateStatus(row, "approve")} type="button">
                  Approve
                </button>
                <button className="btn-secondary px-3 py-2" onClick={() => updateStatus(row, "reject")} type="button">
                  Reject
                </button>
              </div>
            )
          }
        ]}
        rows={events}
      />
    </>
  );
}
