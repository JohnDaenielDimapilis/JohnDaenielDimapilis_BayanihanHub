import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordField({ error, label = "Password", name = "password", ...props }) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${name}-error`;
  const inputType = isVisible ? "text" : "password";

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className="relative block">
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={props.autoComplete}
          className="input-field pr-14"
          id={name}
          name={name}
          type={inputType}
          {...props}
        />
        <button
          aria-controls={name}
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-bayani-blue focus:outline-none focus:ring-4 focus:ring-blue-100"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </span>
      <span className="mt-2 block text-xs font-semibold text-slate-500">
        Password must be at least 8 characters.
      </span>
      {error ? (
        <span className="mt-2 block text-xs font-bold text-red-600" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
