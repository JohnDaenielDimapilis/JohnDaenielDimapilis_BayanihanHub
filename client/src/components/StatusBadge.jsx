const statusConfig = {
  approved: { label: "Approved", class: "badge-success" },
  verified: { label: "Verified", class: "badge-success" },
  active: { label: "Active", class: "badge-success" },
  present: { label: "Present", class: "badge-success" },
  success: { label: "Success", class: "badge-success" },
  registered: { label: "Registered", class: "badge-success" },
  joined: { label: "Joined", class: "badge-success" },
  "open for registration": { label: "Open for Registration", class: "badge-success" },
  finished: { label: "Finished", class: "badge-info" },
  completed: { label: "Completed", class: "badge-info" },
  recorded: { label: "Recorded", class: "badge-info" },
  closed: { label: "Closed", class: "badge-neutral" },
  full: { label: "Full", class: "badge-warning" },
  available: { label: "Available", class: "badge-success" },
  waitlisted: { label: "Waitlisted", class: "badge-warning" },
  "pending review": { label: "Pending Review", class: "badge-warning" },
  pending: { label: "Pending", class: "badge-warning" },
  submitted: { label: "Submitted", class: "badge-warning" },
  "under review": { label: "Under Review", class: "badge-warning" },
  medium: { label: "Medium", class: "badge-warning" },
  rejected: { label: "Rejected", class: "badge-danger" },
  cancelled: { label: "Cancelled", class: "badge-danger" },
  failed: { label: "Failed", class: "badge-danger" },
  absent: { label: "Absent", class: "badge-danger" },
  "no-show": { label: "No-show", class: "badge-danger" },
  high: { label: "High", class: "badge-danger" },
  draft: { label: "Draft", class: "badge-neutral" },
  archived: { label: "Archived", class: "badge-neutral" },
  low: { label: "Low", class: "badge-neutral" },
  inactive: { label: "Inactive", class: "badge-neutral" },
  disabled: { label: "Disabled", class: "badge-danger" },
  "temporarily banned": { label: "Temporarily Banned", class: "badge-danger" },
};

export default function StatusBadge({ value }) {
  const status = String(value || "pending").toLowerCase();
  const config = Object.entries(statusConfig).find(([key]) => status.includes(key));
  const { label, class: cls } = config ? config[1] : { label: value, class: "badge-neutral" };

  return <span className={`badge ${cls}`}>{value || label}</span>;
}
