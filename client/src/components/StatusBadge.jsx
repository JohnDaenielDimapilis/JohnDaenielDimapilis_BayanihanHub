const statusConfig = {
  approved: { label: "Approved", class: "badge-success" },
  verified: { label: "Verified", class: "badge-success" },
  active: { label: "Active", class: "badge-success" },
  present: { label: "Present", class: "badge-success" },
  success: { label: "Success", class: "badge-success" },
  registered: { label: "Registered", class: "badge-success" },
  completed: { label: "Completed", class: "badge-info" },
  recorded: { label: "Recorded", class: "badge-info" },
  pending: { label: "Pending", class: "badge-warning" },
  rejected: { label: "Rejected", class: "badge-danger" },
  failed: { label: "Failed", class: "badge-danger" },
  absent: { label: "Absent", class: "badge-danger" },
  inactive: { label: "Inactive", class: "badge-neutral" },
};

export default function StatusBadge({ value }) {
  const status = String(value || "pending").toLowerCase();
  const config = Object.entries(statusConfig).find(([key]) => status.includes(key));
  const { label, class: cls } = config ? config[1] : { label: value, class: "badge-neutral" };

  return <span className={`badge ${cls}`}>{value || label}</span>;
}
