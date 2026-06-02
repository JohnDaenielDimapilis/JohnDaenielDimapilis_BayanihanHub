import { TrendingDown, TrendingUp } from "lucide-react";

const colorMap = {
  green: { bg: "bg-success-50", icon: "text-success-500", text: "text-success-600" },
  blue: { bg: "bg-info-50", icon: "text-info-500", text: "text-info-600" },
  amber: { bg: "bg-warning-50", icon: "text-warning-500", text: "text-warning-600" },
  red: { bg: "bg-danger-50", icon: "text-danger-500", text: "text-danger-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", text: "text-purple-600" },
  default: { bg: "bg-surface-100", icon: "text-surface-500", text: "text-surface-600" },
};

export default function StatCard({ label, value, icon: Icon, color = "default", trend, trendLabel, subtitle }) {
  const c = colorMap[color] || colorMap.default;

  return (
    <article className="stat-card-component group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
            <Icon size={18} className={c.icon} />
          </div>
        )}
      </div>
      <div>
        <strong className="text-2xl font-bold text-surface-900 tracking-tight">{value}</strong>
        {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="flex items-center gap-1.5">
          {trend !== undefined && (
            <>
              {trend >= 0 ? <TrendingUp size={14} className="text-success-500" /> : <TrendingDown size={14} className="text-danger-500" />}
              <span className={`text-xs font-semibold ${trend >= 0 ? "text-success-600" : "text-danger-600"}`}>
                {trend >= 0 ? "+" : ""}{trend}%
              </span>
            </>
          )}
          {trendLabel && <span className="text-xs text-surface-400">{trendLabel}</span>}
        </div>
      )}
    </article>
  );
}
