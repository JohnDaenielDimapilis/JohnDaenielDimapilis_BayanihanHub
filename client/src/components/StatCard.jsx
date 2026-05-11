export default function StatCard({ accent = "blue", icon: Icon, label, value }) {
  const accentClasses = {
    blue: "from-blue-500 to-cyan-400",
    green: "from-emerald-500 to-teal-400",
    warm: "from-amber-500 to-orange-400",
    ink: "from-slate-800 to-slate-600"
  };

  return (
    <article className="card overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-3 font-display text-3xl font-extrabold text-bayani-ink">{value}</p>
        </div>
        {Icon ? (
          <div className={`rounded-2xl bg-gradient-to-br ${accentClasses[accent]} p-3 text-white shadow-soft`}>
            <Icon size={22} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
