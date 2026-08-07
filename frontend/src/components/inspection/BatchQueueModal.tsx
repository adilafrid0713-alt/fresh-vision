import React, { useState, useEffect } from 'react';
import { Layers, Play, Pause, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';
import { analyzeFoodImageWithGemini } from '../../services/geminiService';
import { useInspectionStore } from '../../store/inspectionStore';
import { useToastStore } from '../../store/toastStore';
import type { InspectionRecord } from '../../types';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  sizeMb: string;
  previewUrl: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  record?: InspectionRecord;
  error?: string;
}

interface BatchQueueModalProps {
  isOpen: boolean;
  files: File[];
  onClose: () => void;
}

export const BatchQueueModal: React.FC<BatchQueueModalProps> = ({ isOpen, files, onClose }) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const { activeBatchNo, selectedFoodTypeHint, addRecentInspection } = useInspectionStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (isOpen && files.length > 0) {
      const initialItems: BatchItem[] = files.map((file, idx) => ({
        id: `batch-item-${idx}-${Date.now()}`,
        file,
        name: file.name,
        sizeMb: (file.size / (1024 * 1024)).toFixed(2),
        previewUrl: URL.createObjectURL(file),
        status: 'queued',
      }));
      setItems(initialItems);
      setIsPaused(false);
      setIsFinished(false);
    }
  }, [isOpen, files]);

  useEffect(() => {
    if (!isOpen || isPaused || isFinished || items.length === 0) return;

    const queuedItems = items.filter((i) => i.status === 'queued');
    const processingItems = items.filter((i) => i.status === 'processing');

    if (queuedItems.length === 0 && processingItems.length === 0) {
      setIsFinished(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addToast({
        type: 'success',
        title: 'Batch Processing Complete',
        message: `Successfully analyzed batch of ${items.length} images!`,
      });
      return;
    }

    const CONCURRENCY_LIMIT = 2;
    if (processingItems.length < CONCURRENCY_LIMIT && queuedItems.length > 0) {
      const nextItem = queuedItems[0];
      processNextItem(nextItem);
    }
  }, [items, isPaused, isFinished, isOpen]);

  const processNextItem = async (item: BatchItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'processing' } : i))
    );

    try {
      const record = await analyzeFoodImageWithGemini(item.file, activeBatchNo, selectedFoodTypeHint);
      addRecentInspection(record);

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'completed', record } : i))
      );
    } catch (err: any) {
      console.error(`Batch item failed: ${item.name}`, err);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'failed', error: err.message } : i))
      );
    }
  };

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const failedCount = items.filter((i) => i.status === 'failed').length;
  const progressPercent = items.length > 0 ? Math.round(((completedCount + failedCount) / items.length) * 100) : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-card border shadow-xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Layers className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground font-mono">
                  HIGH-SPEED BATCH QUEUE PROCESSOR
                </h3>
                <p className="text-xs text-muted-foreground font-mono">
                  BATCH ID: {activeBatchNo} • {items.length} TOTAL IMAGES IN QUEUE
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
             aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar & Telemetry */}
          <div className="p-6 bg-background border-b border-border space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> BATCH PARALLEL AI ENGINE
              </span>
              <span className="text-primary font-bold text-sm">{progressPercent}% COMPLETE</span>
            </div>

            <div className="h-3 w-full bg-accent rounded-full overflow-hidden p-0.5 border border-border">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Completed: <strong className="text-primary">{completedCount}</strong></span>
              <span>Failed: <strong className="text-rose-400">{failedCount}</strong></span>
              <span>Remaining: <strong className="text-foreground">{items.length - (completedCount + failedCount)}</strong></span>
            </div>
          </div>

          {/* Queue List View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[45vh] bg-card/50">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-border transition-all font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={item.previewUrl} alt={item.name} className="h-9 w-9 rounded-lg object-cover border border-border" />
                  <div>
                    <div className="font-bold text-foreground truncate max-w-[250px]">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.sizeMb} MB</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.status === 'queued' && (
                    <span className="px-2.5 py-1 rounded bg-accent text-muted-foreground text-[10px] font-bold">
                      QUEUED
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold animate-pulse flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" /> ANALYZING AI
                    </span>
                  )}
                  {item.status === 'completed' && item.record && (
                    <span className="px-2.5 py-1 rounded bg-primary/10 text-primary border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-primary" /> GRADE {item.record.metrics.quality_grade} ({item.record.metrics.freshness_score}%)
                    </span>
                  )}
                  {item.status === 'failed' && (
                    <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> FAILED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="p-4 bg-background border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs">
              {!isFinished ? (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold transition-colors"
                >
                  {isPaused ? <Play className="h-4 w-4 text-primary" /> : <Pause className="h-4 w-4 text-amber-400" />}
                  {isPaused ? 'Resume Processing' : 'Pause Queue'}
                </button>
              ) : (
                <span className="text-primary font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> BATCH FINISHED
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono font-extrabold text-xs hover:bg-primary/90 transition-colors"
               aria-label="Close">
                {isFinished ? 'View Audit Analytics' : 'Close Window'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
