import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../utils/formatDate";
import { sampleLogs } from "../../utils/mockData";

export default function ActivityLogs() {
  const { data: logs, error } = useResource("/logs/activity", sampleLogs);

  return (
    <>
      <PageHeader
        eyebrow="Traceability"
        subtitle="Important system actions are recorded for accountability."
        title="Activity Logs"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "activityType", label: "Activity" },
          { key: "description", label: "Description" },
          { key: "ipAddress", label: "IP Address" },
          { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) }
        ]}
        rows={logs}
      />
    </>
  );
}
