export default function FormField({ error, label, name, options, rows, type = "text", ...props }) {
  const errorId = `${name}-error`;
  const commonProps = {
    "aria-describedby": error ? errorId : undefined,
    "aria-invalid": Boolean(error),
    className: "input-field",
    id: name,
    name,
    ...props
  };

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      {type === "textarea" ? (
        <textarea rows={rows || 4} {...commonProps} />
      ) : type === "select" ? (
        <select {...commonProps}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={type} {...commonProps} />
      )}
      {error ? (
        <span className="mt-2 block text-xs font-bold text-red-600" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
