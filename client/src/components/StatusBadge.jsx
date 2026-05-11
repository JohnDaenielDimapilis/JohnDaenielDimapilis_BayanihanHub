const statusStyles = {
  active: "bg-green-100 text-green-700 ring-green-200",
  approved: "bg-blue-100 text-blue-700 ring-blue-200",
  cancelled: "bg-slate-100 text-slate-700 ring-slate-200",
  completed: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  failed: "bg-red-100 text-red-700 ring-red-200",
  inactive: "bg-slate-100 text-slate-700 ring-slate-200",
  pending: "bg-amber-100 text-amber-700 ring-amber-200",
  rejected: "bg-red-100 text-red-700 ring-red-200",
  suspended: "bg-red-100 text-red-700 ring-red-200"
};

export default function StatusBadge({ status = "pending" }) {
  const normalizedStatus = String(status).toLowerCase();

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
        statusStyles[normalizedStatus] || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {normalizedStatus.replace("_", " ")}
    </span>
  );
}
