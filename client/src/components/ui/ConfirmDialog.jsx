import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "danger", onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const btnClass = variant === "danger" ? "btn-danger" : "btn-primary";

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal-panel max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 p-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${variant === "danger" ? "bg-danger-100 text-danger-600" : "bg-brand-100 text-brand-600"}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-title" className="text-lg font-semibold text-surface-900">{title}</h3>
            <p className="mt-1.5 text-sm text-surface-500">{message}</p>
          </div>
          <button onClick={onCancel} className="btn-icon-sm hover:bg-surface-100 -mt-1 -mr-1" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-surface-50 border-t border-surface-100">
          <button className="btn-outline btn-sm" onClick={onCancel}>{cancelLabel}</button>
          <button ref={confirmRef} className={`${btnClass} btn-sm`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
