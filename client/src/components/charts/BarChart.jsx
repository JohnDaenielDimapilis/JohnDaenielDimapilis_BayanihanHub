export default function BarChart({ data, height = 200, className = "" }) {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={className}>
      <div className="flex items-end gap-2 justify-between" style={{ height }}>
        {data.map((d, i) => {
          const barH = Math.max(4, (d.value / maxVal) * height * 0.85);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${d.label}: ${d.value}`}>
              <span className="text-2xs font-semibold text-surface-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.value}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-500 ease-out group-hover:opacity-80"
                style={{ height: barH, background: d.color || "#1d8b67", minWidth: 8, maxWidth: 48 }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 justify-between mt-2 border-t border-surface-100 pt-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-2xs text-surface-500 truncate">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
