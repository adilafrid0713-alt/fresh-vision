import React from 'react';
import { useToastStore } from '../../store/toastStore';
import type { ToastItem } from '../../store/toastStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20';
      case 'warning':
        return 'border-yellow-500/20';
      case 'error':
        return 'border-red-500/20';
      case 'info':
      default:
        return 'border-blue-500/20';
    }
  };

  return (
    <div
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.slice(0, 4).map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-card shadow-lg backdrop-blur-xl ${getBorderColor(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {toast.title}
                </h4>
                <span className="text-[10px] text-muted-foreground">{toast.timestamp}</span>
              </div>
              {toast.message && (
                <p className="text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
