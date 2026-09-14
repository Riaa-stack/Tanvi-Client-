import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, AlertCircle, RefreshCw, X, ArrowRight } from 'lucide-react';
import { PencilLoader } from '@/components/notebook/PencilLoader';
import { StickyNote } from '@/components/notebook/StickyNote';
import { papersApi } from '@/services/api/papers';
import { notesApi } from '@/services/api/notes';

interface ProcessingModalProps {
  isOpen: boolean;
  type: 'paper' | 'note';
  itemId: string;
  itemTitle?: string;
  onComplete: () => void;
  onClose: () => void;
}

const STAGES = [
  { key: 'VALIDATING', label: 'Validate document & permissions' },
  { key: 'EXTRACTING', label: 'Extract text & measure page density' },
  { key: 'OCR_PROCESSING', label: 'Scan & recognize handwritten pages' },
  { key: 'STRUCTURING', label: 'Organize questions, sections & marks' },
  { key: 'EMBEDDING', label: 'Build semantic vector embeddings' },
  { key: 'ANALYZING', label: 'Analyze exam trends & topic weights' },
  { key: 'HISTORICAL_UPDATE', label: 'Update historical scope intelligence' },
];

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  type,
  itemId,
  itemTitle = 'Academic Document',
  onComplete,
  onClose,
}) => {
  const [status, setStatus] = useState<string>('VALIDATING');
  const [stage, setStage] = useState<string>('VALIDATING');
  const [progress, setProgress] = useState<number>(10);
  const [message, setMessage] = useState<string>('Reading your document...');
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !itemId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        if (type === 'paper') {
          const res = await papersApi.getPaperStatus(itemId);
          if (res.success && res.data && isMounted) {
            setStatus(res.data.status);
            setStage(res.data.stage || res.data.status);
            setProgress(res.data.progress || 15);
            setMessage(res.data.message || 'Processing document...');
            if (res.data.is_ready || res.data.status === 'READY') {
              setIsReady(true);
              clearInterval(interval);
              setTimeout(() => {
                onComplete();
              }, 1200);
            }
            if (res.data.is_failed || res.data.status === 'FAILED') {
              setIsFailed(true);
              setFailureReason(res.data.failure_reason || 'Processing encountered an error');
              clearInterval(interval);
            }
          }
        } else {
          const res = await notesApi.getNoteStatus(itemId);
          if (res.success && res.data && isMounted) {
            setStatus(res.data.status);
            setStage(res.data.stage || res.data.status);
            setProgress(res.data.progress || 15);
            setMessage(res.data.message || 'Processing note...');
            if (res.data.is_ready || res.data.status === 'READY') {
              setIsReady(true);
              clearInterval(interval);
              setTimeout(() => {
                onComplete();
              }, 1200);
            }
            if (res.data.is_failed || res.data.status === 'FAILED') {
              setIsFailed(true);
              setFailureReason(res.data.failure_reason || 'Processing encountered an error');
              clearInterval(interval);
            }
          }
        }
      } catch (err) {
        // Continue polling unless explicitly failed
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, itemId, type, onComplete]);

  const handleRetry = async () => {
    setIsFailed(false);
    setFailureReason(null);
    setStatus('VALIDATING');
    setProgress(10);
    try {
      if (type === 'paper') {
        await papersApi.retryPaperProcessing(itemId);
      } else {
        await notesApi.retryNoteProcessing(itemId);
      }
    } catch {
      // Polling will handle updates
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-[#fdfbf7] rounded-3xl shadow-2xl border border-stone-300/80 p-8 notebook-ruled-bg overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-stone-200/50 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 font-bold uppercase tracking-wider">
            EduArchive AI 2.0
          </span>
          <h2 className="font-handwriting font-bold text-2xl md:text-3xl text-ink mt-2">
            {isReady
              ? 'Your Academic Intelligence is Ready!'
              : isFailed
              ? 'Processing Needs Attention'
              : 'Turning Document into Study Notes'}
          </h2>
          <p className="text-xs text-slate-500 truncate max-w-xs mx-auto mt-1 font-sans">
            {itemTitle}
          </p>
        </div>

        {/* Center Animated Loader */}
        <div className="my-6 flex justify-center">
          {isReady ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-400 flex items-center justify-center text-emerald-600 shadow-md"
            >
              <Check size={48} strokeWidth={3} />
            </motion.div>
          ) : isFailed ? (
            <div className="w-24 h-24 rounded-full bg-rose-100 border-4 border-rose-400 flex items-center justify-center text-rose-600 shadow-md">
              <AlertCircle size={44} strokeWidth={2.5} />
            </div>
          ) : (
            <PencilLoader size="lg" message={message} />
          )}
        </div>

        {/* Real Stage Timeline */}
        <div className="bg-white/80 rounded-2xl border border-stone-200/80 p-4 shadow-inner space-y-2 text-xs">
          {STAGES.map((s, idx) => {
            const currentIdx = STAGES.findIndex((st) => st.key === stage);
            const isCompleted = isReady || currentIdx > idx;
            const isCurrent = !isReady && !isFailed && (currentIdx === idx || (currentIdx === -1 && idx === 0));

            return (
              <div
                key={s.key}
                className={`flex items-center gap-2.5 transition-colors ${
                  isCompleted
                    ? 'text-emerald-700 font-medium'
                    : isCurrent
                    ? 'text-brand-700 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </div>
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-brand-500 bg-brand-100 animate-pulse flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                  </div>
                ) : (
                  <Circle size={14} className="text-slate-300 shrink-0" />
                )}
                <span className={isCurrent ? 'highlight-yellow' : ''}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Failure Box & Action */}
        {isFailed && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold">Failed to complete processing</div>
              <div className="text-[11px] text-rose-700 mt-0.5">
                {failureReason || 'An error occurred during text extraction or AI analysis.'}
              </div>
              <button
                onClick={handleRetry}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
              >
                <RefreshCw size={12} />
                <span>Retry Processing</span>
              </button>
            </div>
          </div>
        )}

        {/* Ready Action Button */}
        {isReady && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-brand-200 transition-all font-sans"
            >
              <span>Open Study Workspace</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
