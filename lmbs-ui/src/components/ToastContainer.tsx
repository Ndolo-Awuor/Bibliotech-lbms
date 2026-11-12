import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLibrary();

  if (toasts.length === 0) return null;

  return (
    <aside
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full px-4 sm:px-0"
      id="toast-notifications"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => {
        const borderAccent =
          toast.type === 'success'
            ? 'border-l-4 border-l-emerald-500'
            : toast.type === 'error'
            ? 'border-l-4 border-l-rose-500'
            : toast.type === 'warning'
            ? 'border-l-4 border-l-amber-500'
            : 'border-l-4 border-l-indigo-500';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200 dark:border-slate-800 transition-all duration-200 ${borderAccent}`}
            id={`toast-${toast.id}`}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle size={18} className="text-rose-500" />}
              {toast.type === 'warning' && <AlertTriangle size={18} className="text-amber-500" />}
              {toast.type === 'info' && <Info size={18} className="text-indigo-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{toast.title}</div>
              {toast.message && (
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{toast.message}</div>
              )}
            </div>
            <button
              className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss toast"
              id={`dismiss-toast-${toast.id}`}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
