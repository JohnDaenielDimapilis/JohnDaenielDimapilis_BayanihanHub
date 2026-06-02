export default function ProgressBar({ value, max = 100, size = "md", color = "brand", className = "" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const colors = {
    brand: "bg-brand-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    info: "bg-info-500",
  };

  return (
    <div className={`w-full ${heights[size]} rounded-full bg-surface-100 overflow-hidden ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={`h-full rounded-full ${colors[color]} transition-all duration-500 ease-out`} style={{ width: `${pct}%` }} />
    </div>
  );
}
