import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);
let toastId = 0;

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};
const colors = {
  success: "text-success-500 border-success-200 bg-success-50/50",
  error: "text-danger-500 border-danger-200 bg-danger-50/50",
  warning: "text-warning-500 border-warning-200 bg-warning-50/50",
  info: "text-info-500 border-info-200 bg-info-50/50",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration);
    }
  }, []);

  function dismissToast(id) {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 200);
  }

  const toast = useCallback((msg) => addToast(msg, "success"), [addToast]);
  toast.success = (msg) => addToast(msg, "success");
  toast.error = (msg) => addToast(msg, "error", 6000);
  toast.warning = (msg) => addToast(msg, "warning", 5000);
  toast.info = (msg) => addToast(msg, "info");

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`toast ${colors[t.type]} ${t.exiting ? "animate-toast-out" : ""}`} role="alert">
              <Icon size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm text-surface-700 font-medium flex-1">{t.message}</p>
              <button onClick={() => dismissToast(t.id)} className="btn-icon-sm hover:bg-surface-100" aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
