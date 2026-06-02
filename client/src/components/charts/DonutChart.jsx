export default function DonutChart({ data, size = 120, strokeWidth = 14, className = "" }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!total) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  let accumulated = 0;

  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-surface-100" />
        {data.map((d, i) => {
          const pct = d.value / total;
          const dashLength = circumference * pct;
          const offset = circumference * accumulated;
          accumulated += pct;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
        })}
        <text x={center} y={center} textAnchor="middle" dominantBaseline="central" className="rotate-90 origin-center fill-surface-900 text-xl font-bold" style={{ fontSize: size * 0.18 }}>
          {total}
        </text>
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-surface-600">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            {d.label}: {d.value}
          </div>
        ))}
      </div>
    </div>
  );
}
