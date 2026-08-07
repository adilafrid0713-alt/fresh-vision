import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Scan, History, FileText, Settings, BarChart3, ChevronRight, X } from 'lucide-react';
import { useInspectionStore } from '../../store/inspectionStore';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { recentInspections, activeBatchNo } = useInspectionStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search
          const event = new CustomEvent('open-global-search');
          window.dispatchEvent(event);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pageNav = [
    { title: 'Launch AI Optical Inspector', path: '/upload', icon: Scan, desc: 'Single & 500+ batch upload' },
    { title: 'Market & Line Dashboard', path: '/dashboard', icon: BarChart3, desc: 'Real-time telemetry analytics' },
    { title: 'Audit History Logs', path: '/history', icon: History, desc: 'Searchable inspection records' },
    { title: 'PDF Certificates', path: '/reports', icon: FileText, desc: 'Printable export certificates' },
    { title: 'System Settings', path: '/settings', icon: Settings, desc: 'Language, theme & security' },
  ];

  const filteredPages = pageNav.filter(
    (p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRecords = recentInspections.filter(
    (r) =>
      r.food_type.toLowerCase().includes(query.toLowerCase()) ||
      r.batch_id.toLowerCase().includes(query.toLowerCase()) ||
      r.metrics.quality_grade.toLowerCase().includes(query.toLowerCase()) ||
      r.metrics.risk_level.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectPage = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col"
        >
          {/* Header Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-slate-950/50">
            <Search className="h-5 w-5 text-cyan-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods, batch IDs, defect logs, reports, or commands (Ctrl+K)..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-400 font-sans text-sm focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
             aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results Container */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 font-sans text-sm">
            {/* Direct Navigation */}
            {filteredPages.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                  System Views & Shortcuts
                </h4>
                <div className="space-y-1">
                  {filteredPages.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.path}
                        onClick={() => handleSelectPage(p.path)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 group-hover:text-cyan-300">
                              {p.title}
                            </div>
                            <div className="text-xs text-slate-400">{p.desc}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Inspection Logs */}
            <div>
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex justify-between">
                <span>Recent Audit Logs</span>
                <span className="text-slate-500 font-mono">Current Batch: {activeBatchNo}</span>
              </h4>
              {filteredRecords.length > 0 ? (
                <div className="space-y-1">
                  {filteredRecords.slice(0, 5).map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => handleSelectPage('/history')}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 border border-transparent transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={rec.raw_image_url}
                          alt={rec.food_type}
                          className="h-10 w-10 rounded-lg object-cover border border-white/10"
                        />
                        <div>
                          <div className="font-bold text-slate-200 group-hover:text-cyan-300">
                            {rec.food_type} ({rec.id})
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Freshness: {rec.metrics.freshness_score}% • Grade {rec.metrics.quality_grade}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {rec.batch_id}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic px-2 py-2">
                  No inspection logs matching &quot;{query}&quot;
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-4 py-2.5 bg-slate-950/60 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Command className="h-3.5 w-3.5 text-cyan-400" /> Use <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-white/10">ESC</kbd> to close
            </span>
            <span>FreshVision Global Index</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
