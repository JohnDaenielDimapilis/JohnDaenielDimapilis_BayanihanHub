export default function Notice({ children, tone = "info" }) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    success: "border-green-200 bg-green-50 text-green-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700"
  };

  return <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${tones[tone]}`}>{children}</div>;
}
