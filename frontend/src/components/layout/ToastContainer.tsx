import React from 'react';
import { useToastStore, ToastItem } from '@/store/useToastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getToastIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />;
      case 'error':
        return <AlertCircle className="text-rose-600 shrink-0" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-amber-600 shrink-0" size={18} />;
      default:
        return <Info className="text-brand-600 shrink-0" size={18} />;
    }
  };

  const getToastStyle = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50/95 border-emerald-200 text-emerald-950 shadow-md';
      case 'error':
        return 'bg-rose-50/95 border-rose-200 text-rose-950 shadow-md';
      case 'warning':
        return 'bg-amber-50/95 border-amber-200 text-amber-950 shadow-md';
      default:
        return 'bg-brand-50/95 border-brand-200 text-brand-950 shadow-md';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto p-3.5 rounded-xl border backdrop-blur-md flex items-start gap-3 relative overflow-hidden ${getToastStyle(
              toast.type
            )}`}
          >
            {getToastIcon(toast.type)}
            <div className="flex-1 text-xs">
              {toast.title && (
                <div className="font-bold text-sm mb-0.5 font-sans">
                  {toast.title}
                </div>
              )}
              <div className="font-sans leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
