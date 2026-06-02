import { FileX, Inbox, Search } from "lucide-react";

const icons = {
  empty: Inbox,
  search: Search,
  error: FileX,
};

export default function EmptyState({ icon = "empty", title = "No data yet", description = "There's nothing here yet.", action, className = "" }) {
  const Icon = icons[icon] || icons.empty;

  return (
    <div className={`empty-state ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
