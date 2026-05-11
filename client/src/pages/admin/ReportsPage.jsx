import { useState } from "react";

import api from "../../services/api";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";

const reportEndpoints = [
  { label: "Summary Report", endpoint: "/reports/summary" },
  { label: "Events Report", endpoint: "/reports/events" },
  { label: "Fundraising Report", endpoint: "/reports/fundraising" },
  { label: "Participation Report", endpoint: "/reports/participation" }
];

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState("");

  const generateReport = async (endpoint) => {
    try {
      const { data } = await api.get(endpoint);
      setReport(data);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to generate report.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        subtitle="Reports are generated from live system records and logged for traceability."
        title="Report Generation"
      />
      {message ? <div className="mb-5"><Notice tone="error">{message}</Notice></div> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportEndpoints.map((item) => (
          <button className="card text-left transition hover:-translate-y-1 hover:border-blue-200" key={item.endpoint} onClick={() => generateReport(item.endpoint)} type="button">
            <p className="font-display text-xl font-extrabold text-bayani-ink">{item.label}</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">Generate and save this report to the audit trail.</p>
          </button>
        ))}
      </section>
      {report ? (
        <pre className="mt-6 max-h-[520px] overflow-auto rounded-3xl bg-bayani-ink p-6 text-sm leading-6 text-green-100">
          {JSON.stringify(report, null, 2)}
        </pre>
      ) : null}
    </>
  );
}
