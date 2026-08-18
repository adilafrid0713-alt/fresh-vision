import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Clock, ShieldAlert, Sparkles, TrendingDown, CheckCircle2, Snowflake, Sun } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { SpoilageData, QualityGrade } from '../../types';

interface SpoilageSimulatorProps {
  foodType: string;
  qualityGrade: QualityGrade;
  initialFreshness: number;
  shelfLifeDays: number;
  spoilageData?: SpoilageData;
}

export const SpoilageSimulator: React.FC<SpoilageSimulatorProps> = ({
  foodType,
  qualityGrade,
  initialFreshness,
  shelfLifeDays,
  spoilageData,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [storageCondition, setStorageCondition] = useState<'cold' | 'room'>('cold');

  // Fallback curve points if not precalculated
  const decayRate = qualityGrade === 'A' ? 0.045 : qualityGrade === 'B' ? 0.075 : qualityGrade === 'C' ? 0.14 : 0.28;
  const curvePoints = spoilageData?.curve || Array.from({ length: 15 }, (_, day) => {
    const coldScore = Math.max(0, Math.min(100, initialFreshness * Math.exp(-decayRate * 0.45 * day)));
    const roomScore = Math.max(0, Math.min(100, initialFreshness * Math.exp(-decayRate * 1.35 * day)));
    return {
      day,
      coldStorageScore: Number(coldScore.toFixed(1)),
      roomTempScore: Number(roomScore.toFixed(1)),
      status: coldScore >= 85 ? 'Peak Freshness' : coldScore >= 70 ? 'Supermarket Grade' : coldScore >= 50 ? 'Commercial Processing Only' : 'Hazard / Discard',
    };
  });

  const currentPoint = curvePoints[selectedDay] || curvePoints[0];
  const currentFreshness = storageCondition === 'cold' ? currentPoint.coldStorageScore : currentPoint.roomTempScore;

  const getStatusBadge = (score: number) => {
    if (score >= 85) {
      return <Badge variant="success" className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Grade A • Prime Fresh</Badge>;
    }
    if (score >= 70) {
      return <Badge variant="warning" className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Grade B • Standard Retail</Badge>;
    }
    if (score >= 50) {
      return <Badge variant="outline" className="border-amber-500/40 text-amber-400 flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5" /> Grade C • Process/Juice Only</Badge>;
    }
    return <Badge variant="destructive" className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Reject • Hazard/Discard</Badge>;
  };

  const getActionAdvisory = (score: number) => {
    if (score >= 85) return 'Optimal state for export, long-distance transport, and premium organic packaging.';
    if (score >= 70) return 'Immediate domestic retail distribution recommended. Maintain steady 4°C cold chain.';
    if (score >= 50) return 'Immediate extraction or commercial flash pasteurization required to avoid complete write-off.';
    return 'Active biological breakdown imminent or in progress. Unfit for human consumption.';
  };

  // SVG Chart Dimensions
  const chartHeight = 160;
  const chartWidth = 520;
  const padding = 25;

  const getX = (day: number) => padding + (day / 14) * (chartWidth - padding * 2);
  const getY = (score: number) => chartHeight - padding - (score / 100) * (chartHeight - padding * 2);

  const coldPath = curvePoints.reduce((acc, pt, idx) => {
    const x = getX(pt.day);
    const y = getY(pt.coldStorageScore);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const roomPath = curvePoints.reduce((acc, pt, idx) => {
    const x = getX(pt.day);
    const y = getY(pt.roomTempScore);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <Card className="bg-card/70 border-emerald-500/20 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 font-sans">
              14-Day Biological Spoilage Simulator
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded font-semibold">
                Arrhenius Model
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Predictive decay simulation for <span className="text-emerald-400 font-semibold">{foodType}</span> (~{shelfLifeDays}d baseline) based on cellular turgor and enzymatic markers.
            </p>
          </div>
        </div>

        {/* Temperature Environment Toggle */}
        <div className="flex items-center bg-background/60 p-1 rounded-xl border border-border">
          <button
            onClick={() => setStorageCondition('cold')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              storageCondition === 'cold'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
            Cold Storage (4°C)
          </button>
          <button
            onClick={() => setStorageCondition('room')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              storageCondition === 'room'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            Ambient (22°C)
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Interactive SVG Decay Curve */}
        <div className="relative bg-background/40 rounded-2xl p-4 border border-border/50 overflow-x-auto">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono mb-2">
            <span>Biological Freshness % (0 - 100)</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full inline-block"></span> 4°C Controlled
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-400 rounded-full inline-block"></span> 22°C Ambient
              </span>
            </div>
          </div>

          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-40 overflow-visible">
            {/* Grid & Thresholds */}
            <line x1={padding} y1={getY(85)} x2={chartWidth - padding} y2={getY(85)} stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
            <line x1={padding} y1={getY(70)} x2={chartWidth - padding} y2={getY(70)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
            <line x1={padding} y1={getY(50)} x2={chartWidth - padding} y2={getY(50)} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

            {/* Threshold Labels */}
            <text x={chartWidth - padding + 5} y={getY(85) + 3} fill="#10b981" fontSize="9" opacity="0.6">85% Premium</text>
            <text x={chartWidth - padding + 5} y={getY(70) + 3} fill="#f59e0b" fontSize="9" opacity="0.6">70% Standard</text>
            <text x={chartWidth - padding + 5} y={getY(50) + 3} fill="#ef4444" fontSize="9" opacity="0.6">50% Reject</text>

            {/* Cold Path */}
            <path d={coldPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" opacity={storageCondition === 'cold' ? 1 : 0.4} />

            {/* Room Path */}
            <path d={roomPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" opacity={storageCondition === 'room' ? 1 : 0.4} />

            {/* Active Day Vertical Indicator */}
            <line
              x1={getX(selectedDay)}
              y1={padding}
              x2={getX(selectedDay)}
              y2={chartHeight - padding}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="2 2"
            />

            {/* Selected Day Node */}
            <circle
              cx={getX(selectedDay)}
              cy={getY(currentFreshness)}
              r="6"
              fill={storageCondition === 'cold' ? '#06b6d4' : '#f59e0b'}
              stroke="#0f172a"
              strokeWidth="2.5"
              className="animate-pulse"
            />
          </svg>

          {/* X-Axis Day Labels */}
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground mt-2 px-6">
            <span>Day 0 (Now)</span>
            <span>Day 3</span>
            <span>Day 7 (1 Wk)</span>
            <span>Day 10</span>
            <span>Day 14 (2 Wks)</span>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Simulate Time Horizon:
            </span>
            <span className="font-mono text-sm font-extrabold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30">
              {selectedDay === 0 ? 'Today (Day 0)' : `Day +${selectedDay} (${selectedDay * 24} hours)`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="14"
            step="1"
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="w-full h-2 bg-muted/70 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Forecast Details Card */}
        <motion.div
          key={`${selectedDay}-${storageCondition}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border/60"
        >
          <div className="flex flex-col justify-center">
            <span className="text-xs text-muted-foreground">Estimated Freshness</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black font-mono ${currentFreshness >= 80 ? 'text-emerald-400' : currentFreshness >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                {currentFreshness}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({currentFreshness > initialFreshness ? `+${(currentFreshness - initialFreshness).toFixed(1)}` : (currentFreshness - initialFreshness).toFixed(1)}% Δ)
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xs text-muted-foreground">Quality Classification</span>
            <div className="mt-1">
              {getStatusBadge(currentFreshness)}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-xs text-muted-foreground">Recommended Logistics Action</span>
            <p className="text-xs text-foreground mt-1 font-medium leading-tight">
              {getActionAdvisory(currentFreshness)}
            </p>
          </div>
        </motion.div>
      </div>
    </Card>
  );
};
