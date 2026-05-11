import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../utils/formatDate";
import { sampleFeedback } from "../../utils/mockData";

export default function FeedbackPage() {
  const { data: feedback, error } = useResource("/feedback", sampleFeedback);

  return (
    <>
      <PageHeader
        eyebrow="Feedback Tracking"
        subtitle="Feedback supports service quality improvement after foundation events."
        title="Feedback"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "event", label: "Event", render: (row) => row.eventId?.eventTitle || "Event" },
          { key: "user", label: "Submitted By", render: (row) => row.userId?.fullName || "User" },
          { key: "rating", label: "Rating", render: (row) => `${row.rating}/5` },
          { key: "comment", label: "Comment" },
          { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) }
        ]}
        rows={feedback}
      />
    </>
  );
}
