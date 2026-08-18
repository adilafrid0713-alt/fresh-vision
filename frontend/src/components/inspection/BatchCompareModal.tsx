import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X, Award, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { InspectionRecord } from '../../types';

interface BatchCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecord: InspectionRecord;
  historyRecords: InspectionRecord[];
}

export const BatchCompareModal: React.FC<BatchCompareModalProps> = ({
  isOpen,
  onClose,
  currentRecord,
  historyRecords,
}) => {
  // Available other records to compare against (filter out the current one)
  const candidateRecords = historyRecords.filter((r) => r.id !== currentRecord.id);
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    candidateRecords.length > 0 ? candidateRecords[0].id : ''
  );

  if (!isOpen) return null;

  const compareRecord = candidateRecords.find((r) => r.id === selectedRecordId) || candidateRecords[0] || null;

  // Comparison metrics calculations
  const f1 = currentRecord.metrics.freshness_score;
  const f2 = compareRecord ? compareRecord.metrics.freshness_score : f1;
  const freshnessDiff = Number((f1 - f2).toFixed(1));

  const d1 = currentRecord.metrics.damage_percentage;
  const d2 = compareRecord ? compareRecord.metrics.damage_percentage : d1;
  const damageDiff = Number((d1 - d2).toFixed(1));

  const s1 = currentRecord.metrics.shelf_life_days;
  const s2 = compareRecord ? compareRecord.metrics.shelf_life_days : s1;
  const shelfLifeDiff = Number((s1 - s2).toFixed(1));

  const isCurrentSuperior = f1 >= f2;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <GitCompare className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight font-sans">
                  Batch Quality Comparison
                </h2>
                <p className="text-xs text-muted-foreground">
                  Side-by-side variance analysis comparing quality metrics across production runs.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Comparison Selector */}
          {candidateRecords.length === 0 ? (
            <div className="p-6 text-center bg-muted/20 border border-dashed border-border rounded-2xl space-y-2">
              <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
              <p className="text-sm font-semibold text-foreground">No Previous Batches Available</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Inspect another produce batch or sample to unlock side-by-side comparison.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Batch Select Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-2xl border border-border/80">
                <span className="text-xs font-semibold text-muted-foreground">Compare Current Run With:</span>
                <select
                  value={selectedRecordId}
                  onChange={(e) => setSelectedRecordId(e.target.value)}
                  className="bg-background border border-border rounded-xl px-4 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {candidateRecords.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.batch_id} • {r.food_type} ({r.timestamp}) — Grade {r.metrics.quality_grade} ({r.metrics.freshness_score}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Side-by-Side Comparison Cards */}
              {compareRecord && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Batch 1: Current Record */}
                  <Card className={`p-5 rounded-2xl border ${isCurrentSuperior ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-border bg-card'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Current Inspection</span>
                      {isCurrentSuperior && (
                        <Badge variant="success" className="flex items-center gap-1 text-[10px]">
                          <Award className="w-3 h-3" /> Superior Batch
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={currentRecord.raw_image_url}
                        alt="Batch 1"
                        className="w-14 h-14 object-cover rounded-xl border border-border/60"
                      />
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{currentRecord.food_type}</h4>
                        <p className="text-xs font-mono text-muted-foreground">{currentRecord.batch_id} • {currentRecord.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-background/60 p-2.5 rounded-xl border border-border/50">
                        <span className="text-muted-foreground text-[10px]">Freshness Score</span>
                        <div className="font-mono font-bold text-emerald-400 text-base">{f1}%</div>
                      </div>
                      <div className="bg-background/60 p-2.5 rounded-xl border border-border/50">
                        <span className="text-muted-foreground text-[10px]">Quality Grade</span>
                        <div className="font-mono font-bold text-foreground text-base">Grade {currentRecord.metrics.quality_grade}</div>
                      </div>
                      <div className="bg-background/60 p-2.5 rounded-xl border border-border/50">
                        <span className="text-muted-foreground text-[10px]">Damage Area</span>
                        <div className="font-mono font-bold text-foreground text-base">{d1}%</div>
                      </div>
                      <div className="bg-background/60 p-2.5 rounded-xl border border-border/50">
                        <span className="text-muted-foreground text-[10px]">Shelf Life</span>
                        <div className="font-mono font-bold text-foreground text-base">{s1} Days</div>
                      </div>
                    </div>
                  </Card>

                  {/* Batch 2: Target Comparison Record */}
                  <Card className={`p-5 rounded-2xl border ${!isCurrentSuperior ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-border bg-card'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Comparison Target</span>
                      {!isCurrentSuperior && (
                        <Badge variant="success" className="flex items-center gap-1 text-[10px]">
                          <Award className="w-3 h-3" /> Superior Batch
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={compareRecord.raw_image_url}
                        alt="Batch 2"
                        className="w-14 h-14 object-cover rounded-xl border border-border/60"
                      />
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{compareRecord.food_type}</h4>
                        <p className="text-xs font-mono text-muted-foreground">{compareRecord.batch_id} • {compareRecord.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-background/60 p-2.5 rounded-xl border border-border/50">
                        <span className="text-muted-foreground text-[10px]">Freshness Score</span>
                        <div className="font-mono font-bold text-cyan-400 text-base">{f2}%</div>
                      </div>
                      <div className="bg-background/60 p-2.5 rounded-xl border border-border/50">
                        <span className="text-muted-foreground text-[10px]">Quality Grade</span>
                        <div className="font-mono font-bold text-foreground text-base">Grade {compareRecord.metrics.quality_grade}</div>
                      </div>
                      <div className="bg-background/60 p-2.5 rounded-xl border border-border/50">
                        <span className="text-muted-foreground text-[10px]">Damage Area</span>
                        <div className="font-mono font-bold text-foreground text-base">{d2}%</div>
                      </div>
                      <div className="bg-background/60 p-2.5 rounded-xl border border-border/50">
                        <span className="text-muted-foreground text-[10px]">Shelf Life</span>
                        <div className="font-mono font-bold text-foreground text-base">{s2} Days</div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Variance Analysis Summary */}
              {compareRecord && (
                <div className="bg-muted/30 border border-border p-4 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Quality Variance Delta</span>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-background/80 p-3 rounded-xl border border-border/40">
                      <span className="text-[10px] text-muted-foreground block mb-1">Freshness Variance</span>
                      <span className={`text-sm font-bold font-mono flex items-center justify-center gap-1 ${freshnessDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {freshnessDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {freshnessDiff > 0 ? `+${freshnessDiff}%` : `${freshnessDiff}%`}
                      </span>
                    </div>

                    <div className="bg-background/80 p-3 rounded-xl border border-border/40">
                      <span className="text-[10px] text-muted-foreground block mb-1">Damage Differential</span>
                      <span className={`text-sm font-bold font-mono flex items-center justify-center gap-1 ${damageDiff <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {damageDiff <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        {damageDiff > 0 ? `+${damageDiff}%` : `${damageDiff}%`}
                      </span>
                    </div>

                    <div className="bg-background/80 p-3 rounded-xl border border-border/40">
                      <span className="text-[10px] text-muted-foreground block mb-1">Shelf Life Differential</span>
                      <span className={`text-sm font-bold font-mono flex items-center justify-center gap-1 ${shelfLifeDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {shelfLifeDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {shelfLifeDiff > 0 ? `+${shelfLifeDiff}d` : `${shelfLifeDiff}d`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl px-6 text-xs">
              Close Comparison
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
