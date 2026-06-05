import { Download, FileSpreadsheet, FileText, HandCoins, MessageSquare, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { reportsApi } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import FormField from "../components/ui/FormField.jsx";
import { SkeletonStats } from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/Toast.jsx";

const tabs = [
  { id: "events", label: "Events" },
  { id: "participants", label: "Participants" },
  { id: "donations", label: "Donations" },
  { id: "fundraisers", label: "Fundraisers" },
  { id: "feedback", label: "Feedback" },
  { id: "users", label: "Users" }
];

function text(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

function dateText(value) {
  return value ? new Date(value).toLocaleDateString() : "";
}

function csvEscape(value) {
  return `"${text(value).replace(/"/g, '""')}"`;
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function makePdf(lines) {
  const escapedLines = lines.map((line) => text(line).replace(/[()\\]/g, "\\$&"));
  const content = escapedLines.map((line, index) => `BT /F1 10 Tf 40 ${760 - index * 16} Td (${line.slice(0, 95)}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export default function Reports() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("events");
  const [records, setRecords] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", status: "", creator: "", search: "", role: "" });

  useEffect(() => {
    reportsApi.getAll()
      .then(setSummary)
      .catch(() => toast.error("Failed to load report summary"))
      .finally(() => setLoadingSummary(false));
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.status) {
      if (activeTab === "participants") params.set("attendanceStatus", filters.status);
      else if (activeTab === "feedback") params.set("rating", filters.status);
      else params.set("status", filters.status);
    }
    if (filters.creator && activeTab !== "users") params.set("creator", filters.creator);
    if (filters.role && activeTab === "users") params.set("role", filters.role);
    if (filters.search) {
      if (activeTab === "participants" || activeTab === "feedback") params.set("eventName", filters.search);
      else if (activeTab === "donations") params.set("donorName", filters.search);
      else params.set("search", filters.search);
    }
    return params.toString();
  }, [activeTab, filters]);

  useEffect(() => {
    setLoadingRecords(true);
    reportsApi.getTab(activeTab, query)
      .then(setRecords)
      .catch(() => toast.error(`Failed to load ${activeTab} report`))
      .finally(() => setLoadingRecords(false));
  }, [activeTab, query]);

  const donationTotal = summary?.totalDonationAmount ?? summary?.donations?.reduce((sum, item) => sum + item.total, 0) ?? 0;

  const columnsByTab = {
    events: [
      { key: "title", header: "Event", accessor: "title" },
      { key: "date", header: "Date", accessor: "date", render: (row) => dateText(row.date) },
      { key: "location", header: "Location", accessor: "location" },
      { key: "creator", header: "Creator", accessor: (row) => row.createdBy?.name || "" },
      { key: "status", header: "Status", accessor: "status", render: (row) => <StatusBadge value={row.status} /> },
      { key: "beneficiaries", header: "Beneficiaries", accessor: (row) => row.postEventReport?.actualBeneficiariesServed || row.actualBeneficiariesServed || 0 },
    ],
    participants: [
      { key: "participant", header: "Participant", accessor: (row) => row.userId?.name || "" },
      { key: "event", header: "Event", accessor: (row) => row.eventId?.title || "" },
      { key: "joined", header: "Joined", accessor: "joinedAt", render: (row) => dateText(row.joinedAt) },
      { key: "registration", header: "Registration", accessor: "participationStatus", render: (row) => <StatusBadge value={row.participationStatus} /> },
      { key: "attendance", header: "Attendance", accessor: "attendanceStatus", render: (row) => <StatusBadge value={row.attendanceStatus} /> },
      { key: "method", header: "Method", accessor: "checkInMethod" },
    ],
    donations: [
      { key: "donor", header: "Donor", accessor: (row) => row.donorAnonymous ? "Anonymous" : row.donor?.name || "" },
      { key: "fundraiser", header: "Fundraiser", accessor: (row) => row.fundraiserId?.title || "" },
      { key: "amount", header: "Amount", accessor: "amount", render: (row) => `PHP ${Number(row.amount || 0).toLocaleString()}` },
      { key: "type", header: "Type", accessor: "donationType" },
      { key: "date", header: "Date", accessor: "donationDate", render: (row) => dateText(row.donationDate) },
      { key: "status", header: "Status", accessor: "donationStatus", render: (row) => <StatusBadge value={row.donationStatus} /> },
    ],
    fundraisers: [
      { key: "title", header: "Fundraiser", accessor: "title" },
      { key: "purpose", header: "Purpose", accessor: "purpose" },
      { key: "target", header: "Target", accessor: "targetAmount", render: (row) => `PHP ${Number(row.targetAmount || 0).toLocaleString()}` },
      { key: "raised", header: "Raised", accessor: "raisedAmount", render: (row) => `PHP ${Number(row.raisedAmount || 0).toLocaleString()}` },
      { key: "deadline", header: "Deadline", accessor: "deadline", render: (row) => dateText(row.deadline) },
      { key: "status", header: "Status", accessor: "status", render: (row) => <StatusBadge value={row.status} /> },
    ],
    feedback: [
      { key: "user", header: "User", accessor: (row) => row.userId?.name || "" },
      { key: "event", header: "Event", accessor: (row) => row.eventId?.title || "" },
      { key: "creator", header: "Creator", accessor: (row) => row.eventId?.createdBy?.name || "" },
      { key: "rating", header: "Rating", accessor: "rating", render: (row) => `${row.rating}/5` },
      { key: "comment", header: "Comment", accessor: "comment" },
      { key: "date", header: "Date", accessor: "createdAt", render: (row) => dateText(row.createdAt) },
    ],
    users: [
      { key: "name", header: "Name", accessor: "name" },
      { key: "email", header: "Email", accessor: "email" },
      { key: "role", header: "Role", accessor: "role" },
      { key: "status", header: "Status", accessor: (row) => row.accountStatus || (row.isActive === false ? "Disabled" : "Active"), render: (row) => <StatusBadge value={row.accountStatus || (row.isActive === false ? "Disabled" : "Active")} /> },
      { key: "phone", header: "Phone", accessor: "phone" },
      { key: "createdAt", header: "Created", accessor: "createdAt", render: (row) => dateText(row.createdAt) },
    ]
  };

  const columns = columnsByTab[activeTab];

  function rowValues(row) {
    return columns.map((column) => {
      const value = typeof column.accessor === "function" ? column.accessor(row) : row[column.accessor];
      return text(value);
    });
  }

  function exportRows(format) {
    const headers = columns.map((column) => column.header);
    const name = `${activeTab}-report`;
    if (format === "csv") {
      const csv = [headers.map(csvEscape).join(","), ...records.map((row) => rowValues(row).map(csvEscape).join(","))].join("\n");
      downloadBlob(`${name}.csv`, csv, "text/csv");
      return;
    }
    if (format === "excel") {
      const rows = [headers, ...records.map(rowValues)];
      const html = `<table>${rows.map((row) => `<tr>${row.map((cell) => `<td>${text(cell)}</td>`).join("")}</tr>`).join("")}</table>`;
      downloadBlob(`${name}.xls`, html, "application/vnd.ms-excel");
      return;
    }
    const lines = [
      `${activeTab.toUpperCase()} REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      `Records: ${records.length}`,
      "",
      headers.join(" | "),
      ...records.map((row) => rowValues(row).join(" | "))
    ];
    downloadBlob(`${name}.pdf`, makePdf(lines.slice(0, 42)), "application/pdf");
  }

  const statusOptions = {
    events: ["Draft", "Pending Review", "Approved", "Open for Registration", "Full", "Closed", "Finished", "Cancelled", "Rejected", "Archived"],
    participants: ["Pending", "Present", "Absent"],
    donations: ["Pending", "Submitted", "Under Review", "Verified", "Rejected", "Refunded", "Cancelled"],
    fundraisers: ["Pending", "Needs Revision", "Approved", "Closed", "Archived", "Rejected"],
    feedback: ["5", "4", "3", "2", "1"],
    users: ["Active", "Temporarily Banned", "Disabled"]
  }[activeTab];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Filtered analytics and exports for events, participants, donations, fundraisers, feedback, and users</p>
      </div>

      {loadingSummary ? <SkeletonStats count={4} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={summary?.users ?? 0} icon={Users} color="blue" />
          <StatCard label="Participants" value={summary?.participants ?? 0} icon={Users} color="green" />
          <StatCard label="Feedback" value={summary?.feedback?.count ?? 0} icon={MessageSquare} color="purple" subtitle={summary?.feedback?.avgRating ? `Avg: ${summary.feedback.avgRating.toFixed(1)}/5` : null} />
          <StatCard label="Total Donations" value={`PHP ${Number(donationTotal || 0).toLocaleString()}`} icon={HandCoins} color="green" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`btn-sm ${activeTab === tab.id ? "btn-primary" : "btn-outline"}`}
            onClick={() => {
              setActiveTab(tab.id);
              setFilters({ startDate: "", endDate: "", status: "", creator: "", search: "", role: "" });
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card-padded grid grid-cols-1 md:grid-cols-6 gap-3">
        <FormField label="Start Date">
          <input type="date" className="input h-10" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        </FormField>
        <FormField label="End Date">
          <input type="date" className="input h-10" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        </FormField>
        <FormField label={activeTab === "feedback" ? "Rating" : activeTab === "participants" ? "Attendance" : "Status"}>
          <select className="input h-10" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            {statusOptions.map((option) => <option key={option} value={option}>{activeTab === "feedback" ? `${option} stars` : option}</option>)}
          </select>
        </FormField>
        {activeTab === "users" ? (
          <FormField label="Role">
            <select className="input h-10" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
              <option value="">All roles</option>
              <option value="User">Users</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admins</option>
            </select>
          </FormField>
        ) : (
          <FormField label="Creator">
            <input className="input h-10" placeholder="Creator name, email, or ID" value={filters.creator} onChange={(e) => setFilters({ ...filters, creator: e.target.value })} />
          </FormField>
        )}
        <FormField label={activeTab === "donations" ? "Donor" : activeTab === "fundraisers" ? "Fundraiser" : activeTab === "users" ? "Name or Email" : "Search"}>
          <input className="input h-10" placeholder="Filter text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </FormField>
        <div className="flex items-end">
          <button className="btn-outline w-full" onClick={() => setFilters({ startDate: "", endDate: "", status: "", creator: "", search: "", role: "" })}>Reset</button>
        </div>
      </div>

      <DataTable
        data={records}
        columns={columns}
        loading={loadingRecords}
        searchPlaceholder={`Search ${activeTab} report...`}
        emptyTitle={`No ${activeTab} records`}
        emptyDescription="Try adjusting the filters above."
        exportFilename={`${activeTab}-report`}
        actions={(
          <div className="flex items-center gap-2">
            <button className="btn-outline btn-sm" onClick={() => exportRows("csv")}>
              <Download size={14} />
              CSV
            </button>
            <button className="btn-outline btn-sm" onClick={() => exportRows("excel")}>
              <FileSpreadsheet size={14} />
              Excel
            </button>
            <button className="btn-outline btn-sm" onClick={() => exportRows("pdf")}>
              <FileText size={14} />
              PDF
            </button>
          </div>
        )}
      />
    </section>
  );
}
