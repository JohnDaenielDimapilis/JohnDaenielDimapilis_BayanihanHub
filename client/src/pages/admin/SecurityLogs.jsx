import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../utils/formatDate";
import { sampleLogs } from "../../utils/mockData";

export default function SecurityLogs() {
  const { data: logs, error } = useResource(
    "/logs/security",
    sampleLogs.filter((log) => /security|approval|login/i.test(log.activityType))
  );

  return (
    <>
      <PageHeader
        eyebrow="Security Monitoring"
        subtitle="Login attempts, account changes, and approval actions are filtered into security logs."
        title="Security Logs"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "activityType", label: "Security Event" },
          { key: "description", label: "Description" },
          { key: "ipAddress", label: "IP Address" },
          { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) }
        ]}
        rows={logs}
      />
    </>
  );
}
