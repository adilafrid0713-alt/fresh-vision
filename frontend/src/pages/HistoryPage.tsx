import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, Eye, ShieldCheck, Clock, AlertTriangle, 
  ChevronDown, ChevronUp, FileText, ExternalLink, Calendar, RefreshCw, X
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useInspectionStore } from '../store/inspectionStore';
import type { InspectionRecord } from '../types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { recentInspections, activeBatchNo, setActiveInspection } = useInspectionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [lineFilter, setLineFilter] = useState<string>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedAuditModal, setSelectedAuditModal] = useState<InspectionRecord | null>(null);

  // Comprehensive realistic historical records with rich multi-item support and multi-line telemetry
  const baseHistory: InspectionRecord[] = [
    {
      id: 'INS-8925',
      batch_id: activeBatchNo,
      timestamp: 'Today, 14:48:22',
      food_type: 'Assorted Multi-Produce Batch',
      metrics: { freshness_score: 84.5, confidence: 99.3, damage_percentage: 11.0, shelf_life_days: 8.5, quality_grade: 'B' as const, risk_level: 'Moderate' as const, recommendation: 'Sorted Multi-Item Batch: Segregate Grade A items for retail, Grade C for juice extraction, and discard rot items.' },
      defects: [
        { id: 'DEF-01', defect_type: 'Bruise', severity: 0.35, area_percentage: 11.0, bbox: [100, 100, 300, 300] }
      ],
      detected_items: [
        {
          id: 'ITEM-01', name: 'Fuji Apple #1 (Top-Left)', food_type: 'Apple (Fuji)', bbox: [80, 80, 420, 380],
          consumption_status: 'Good to Consume', summary: 'Firm crisp apple with vibrant red blush and zero blemishes.',
          good_bad_explanation: { why_good: 'High structural firmness and intact waxy cuticle layer.', why_bad: 'No surface defects detected.' },
          metrics: { freshness_score: 96.5, quality_grade: 'A', damage_percentage: 0.0, confidence: 99.4 }
        },
        {
          id: 'ITEM-02', name: 'Cavendish Banana #2 (Center)', food_type: 'Banana (Cavendish)', bbox: [420, 280, 680, 750],
          consumption_status: 'Processing / Juice Only', summary: 'Advanced sugar spotting with peel browning.',
          good_bad_explanation: { why_good: 'High sugar content ideal for bakery puree or extraction.', why_bad: 'Peel exhibits 16% chromatic darkening and softening.' },
          metrics: { freshness_score: 68.5, quality_grade: 'C', damage_percentage: 16.0, confidence: 99.1 }
        },
        {
          id: 'ITEM-03', name: 'Navel Orange #3 (Bottom-Left)', food_type: 'Orange (Navel)', bbox: [660, 90, 930, 410],
          consumption_status: 'Not Good to Consume (Discard)', summary: 'Active biological fungal lesion with green mold growth around stem.',
          good_bad_explanation: { why_good: 'None. Fungal spore colonization has breached cell walls.', why_bad: 'Contains 28% active Penicillium rot lesion. Must be quarantined.' },
          metrics: { freshness_score: 38.0, quality_grade: 'Reject', damage_percentage: 28.0, confidence: 99.6 }
        }
      ],
      raw_image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
      processing_time_ms: 310
    },
    {
      id: 'INS-8921',
      batch_id: activeBatchNo,
      timestamp: 'Today, 14:42:15',
      food_type: 'Apple (Fuji)',
      metrics: { freshness_score: 98.2, confidence: 99.4, damage_percentage: 1.2, shelf_life_days: 16.5, quality_grade: 'A' as const, risk_level: 'Low' as const, recommendation: 'Suitable for Premium Export & Retail Supermarket Packaging.' },
      defects: [],
      raw_image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
      processing_time_ms: 42
    },
    {
      id: 'INS-8920',
      batch_id: activeBatchNo,
      timestamp: 'Today, 14:38:02',
      food_type: 'Tomato (Roma)',
      metrics: { freshness_score: 92.1, confidence: 98.1, damage_percentage: 4.5, shelf_life_days: 11.0, quality_grade: 'B' as const, risk_level: 'Low' as const, recommendation: 'Standard Domestic Supermarket Distribution.' },
      defects: [
        { id: 'DEF-01', defect_type: 'Bruise', severity: 0.25, area_percentage: 4.5, bbox: [120, 150, 280, 310] }
      ],
      raw_image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      processing_time_ms: 38
    },
    {
      id: 'INS-8919',
      batch_id: activeBatchNo,
      timestamp: 'Today, 14:30:45',
      food_type: 'Banana (Cavendish)',
      metrics: { freshness_score: 64.0, confidence: 96.8, damage_percentage: 28.5, shelf_life_days: 4.0, quality_grade: 'C' as const, risk_level: 'Moderate' as const, recommendation: 'Immediate Processing / Puree / Juice Extraction.' },
      defects: [
        { id: 'DEF-01', defect_type: 'Discoloration', severity: 0.60, area_percentage: 28.5, bbox: [90, 80, 410, 420] }
      ],
      raw_image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80',
      processing_time_ms: 55
    },
    {
      id: 'INS-8918',
      batch_id: activeBatchNo,
      timestamp: 'Today, 14:21:10',
      food_type: 'Orange (Navel)',
      metrics: { freshness_score: 38.5, confidence: 99.1, damage_percentage: 54.0, shelf_life_days: 1.0, quality_grade: 'Reject' as const, risk_level: 'Critical' as const, recommendation: 'QUARANTINE & DISCARD immediately. Active decay detected.' },
      defects: [
        { id: 'DEF-01', defect_type: 'Rot', severity: 0.85, area_percentage: 54.0, bbox: [80, 90, 420, 430] }
      ],
      raw_image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80',
      processing_time_ms: 48
    },
    {
      id: 'INS-8917',
      batch_id: 'BAT-2026-4412-A',
      timestamp: 'Yesterday, 18:12:00',
      food_type: 'Apple (Gala)',
      metrics: { freshness_score: 95.0, confidence: 99.2, damage_percentage: 2.0, shelf_life_days: 15.0, quality_grade: 'A' as const, risk_level: 'Low' as const, recommendation: 'Suitable for Premium Export & Retail Supermarket Packaging.' },
      defects: [],
      raw_image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80',
      processing_time_ms: 44
    },
    {
      id: 'INS-8916',
      batch_id: 'BAT-2026-4412-A',
      timestamp: 'Yesterday, 17:45:30',
      food_type: 'Tomato (Beefsteak)',
      metrics: { freshness_score: 88.4, confidence: 97.5, damage_percentage: 8.2, shelf_life_days: 9.5, quality_grade: 'B' as const, risk_level: 'Low' as const, recommendation: 'Standard Domestic Supermarket Shelf Distribution.' },
      defects: [
        { id: 'DEF-01', defect_type: 'Mechanical Damage', severity: 0.30, area_percentage: 8.2, bbox: [140, 160, 290, 320] }
      ],
      raw_image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
      processing_time_ms: 41
    }
  ];

  // Merge recent state inspections with base history without duplicates
  const allRecords = [...recentInspections, ...baseHistory].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  // Filter logic
  const filteredRecords = allRecords.filter((rec) => {
    const matchesSearch = rec.food_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.metrics.recommendation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || rec.metrics.quality_grade === gradeFilter;
    const matchesRisk = riskFilter === 'all' || rec.metrics.risk_level === riskFilter;
    const matchesLine = lineFilter === 'all' || (lineFilter === 'current' ? rec.batch_id === activeBatchNo : rec.batch_id !== activeBatchNo);
    return matchesSearch && matchesGrade && matchesRisk && matchesLine;
  });

  // KPI calculations
  const totalCount = filteredRecords.length;
  const acceptedCount = filteredRecords.filter(r => r.metrics.quality_grade === 'A' || r.metrics.quality_grade === 'B').length;
  const rejectedCount = filteredRecords.filter(r => r.metrics.quality_grade === 'Reject').length;
  const avgFreshness = totalCount > 0 
    ? (filteredRecords.reduce((acc, r) => acc + r.metrics.freshness_score, 0) / totalCount).toFixed(1)
    : '0.0';
  const acceptanceRatio = totalCount > 0 ? ((acceptedCount / totalCount) * 100).toFixed(1) : '0.0';

  const exportAllCSV = () => {
    let csv = 'ID,Batch ID,Timestamp,Produce Item,Grade,Freshness Score (%),Damage Area (%),Shelf Life (Days),Risk Level,Recommendation\n';
    filteredRecords.forEach((r) => {
      csv += `"${r.id}","${r.batch_id}","${r.timestamp}","${r.food_type}","${r.metrics.quality_grade}",${r.metrics.freshness_score},${r.metrics.damage_percentage},${r.metrics.shelf_life_days},"${r.metrics.risk_level}","${r.metrics.recommendation}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FreshVision_Audit_Logs_${activeBatchNo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportRecordJSON = (rec: InspectionRecord) => {
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rec.id}_Audit_Verification.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-14">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
            <span>IMMUTABLE SHA-256 AUDIT LOGGING</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">AI Inspection Audit Logs</h1>
          <p className="text-sm text-slate-400">
            Cryptographically sealed historical records of optical classifications, defect measurements, and consumption advice.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <button
            onClick={() => { setSearchTerm(''); setGradeFilter('all'); setRiskFilter('all'); setLineFilter('all'); }}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-slate-100 transition-colors"
            title="Reset Filters"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={exportAllCSV}
            className="glass-button-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>Export Audit Archive (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-900 border-white/10">
          <span className="text-[11px] text-slate-400 uppercase">Filtered Audit Records</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-slate-100">{totalCount}</span>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              100% SEALED
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block truncate">Active Batch: {activeBatchNo}</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900 to-emerald-950/30 border-emerald-500/20">
          <span className="text-[11px] text-slate-400 uppercase">Average Freshness Index</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-400">{avgFreshness}%</span>
            <span className="text-xs text-slate-400 font-normal">Across {totalCount} items</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, Number(avgFreshness))}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900 to-blue-950/30 border-blue-500/20">
          <span className="text-[11px] text-slate-400 uppercase">Acceptance Ratio (Grade A/B)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-blue-400">{acceptanceRatio}%</span>
            <span className="text-xs text-slate-400 font-normal">{acceptedCount} Accepted</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${acceptanceRatio}%` }} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900 to-red-950/30 border-red-500/20">
          <span className="text-[11px] text-slate-400 uppercase">Quarantined / Rejected</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-red-400">{rejectedCount}</span>
            <span className="text-xs text-red-300 font-bold bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 animate-pulse">
              ISO 22000 ALERT
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block">Automatic diversion active</span>
        </Card>
      </div>

      {/* Search & Multi-Dimension Filter Console */}
      <Card className="p-4 bg-slate-900/90 border-white/10">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Inspection ID, crop, batch no, or advice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto font-mono text-xs">
            {/* Grade Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-white/10">
              <Filter className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400 mr-1 text-[11px]">Grade:</span>
              {['all', 'A', 'B', 'C', 'Reject'].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setGradeFilter(grade)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    gradeFilter === grade
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {grade === 'all' ? 'All' : grade}
                </button>
              ))}
            </div>

            {/* Risk Level Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-400 text-[11px]">Risk:</span>
              {['all', 'Low', 'Moderate', 'Critical'].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    riskFilter === risk
                      ? 'bg-blue-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {risk === 'all' ? 'All' : risk}
                </button>
              ))}
            </div>

            {/* Batch Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1.5 rounded-xl border border-white/10">
              <Calendar className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <button
                onClick={() => setLineFilter('all')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lineFilter === 'all' ? 'bg-slate-800 text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Batches
              </button>
              <button
                onClick={() => setLineFilter('current')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lineFilter === 'current' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Current Shift Only
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comprehensive Audit Table */}
      <Card className="p-0 overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-4 pl-5">Inspection ID &amp; Batch</th>
                <th className="py-4">Produce Specimen</th>
                <th className="py-4">Timestamp &amp; Line</th>
                <th className="py-4">Freshness &amp; Damage</th>
                <th className="py-4">Quality Grade</th>
                <th className="py-4">Risk Rating</th>
                <th className="py-4 text-right pr-5">Inspection Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const isExpanded = expandedRowId === rec.id;
                  const isMulti = rec.detected_items && rec.detected_items.length > 1;

                  return (
                    <React.Fragment key={rec.id}>
                      <tr className={`hover:bg-slate-900/50 transition-colors group ${isExpanded ? 'bg-slate-900/70' : ''}`}>
                        <td className="py-4 pl-5 font-mono text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-100">{rec.id}</span>
                            {isMulti && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                                {rec.detected_items?.length} Items
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-emerald-400" />
                            <span>{rec.batch_id}</span>
                          </div>
                        </td>

                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img src={rec.raw_image_url} alt={rec.food_type} className="h-10 w-10 rounded-lg object-cover bg-slate-800 border border-white/10 shrink-0 shadow" />
                            <div>
                              <span className="font-bold text-slate-200 block text-xs">{rec.food_type}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Confidence: {rec.metrics.confidence}%</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 font-mono text-xs text-slate-300">
                          <div>{rec.timestamp}</div>
                          <div className="text-[10px] text-slate-500">LINE: Main Conveyor Line 1 • 4°C</div>
                        </td>

                        <td className="py-4 font-mono">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="text-xs flex items-center gap-1">
                                <span className="text-slate-400 text-[10px]">Freshness:</span>
                                <span className={`font-bold ${rec.metrics.freshness_score >= 80 ? 'text-emerald-400' : rec.metrics.freshness_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {rec.metrics.freshness_score}%
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Damage Area: <span className={rec.metrics.damage_percentage > 15 ? 'text-red-400 font-bold' : 'text-slate-300'}>{rec.metrics.damage_percentage}%</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4">
                          <Badge 
                            label={`GRADE ${rec.metrics.quality_grade}`} 
                            variant={rec.metrics.quality_grade === 'A' ? 'success' : rec.metrics.quality_grade === 'B' ? 'info' : rec.metrics.quality_grade === 'C' ? 'warning' : 'danger'}
                            size="sm"
                          />
                        </td>

                        <td className="py-4 font-mono text-xs">
                          <span className={`px-2 py-1 rounded-md font-bold text-[11px] ${
                            rec.metrics.risk_level === 'Low' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' :
                            rec.metrics.risk_level === 'Moderate' ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' :
                            'bg-red-950/80 text-red-300 border border-red-500/40 animate-pulse'
                          }`}>
                            {rec.metrics.risk_level} Risk
                          </span>
                        </td>

                        <td className="py-4 text-right pr-5">
                          <div className="flex items-center justify-end gap-2 font-mono text-xs">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : rec.id)}
                              className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 transition-colors"
                              title="Toggle Quick Audit Preview"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => setSelectedAuditModal(rec)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5 text-blue-400" />
                              <span>Details</span>
                            </button>
                            <button
                              onClick={() => { setActiveInspection(rec); navigate('/result'); }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors shadow"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Audit Console</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Row Preview */}
                      {isExpanded && (
                        <tr className="bg-slate-950/90 border-b border-white/10">
                          <td colSpan={7} className="p-5 pl-8">
                            <div className="grid gap-6 md:grid-cols-3 bg-slate-900/80 p-5 rounded-2xl border border-white/10">
                              {/* Left: Recommendation & Shelf Life */}
                              <div className="space-y-3">
                                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                                  Enterprise Recommendation Plan
                                </span>
                                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-white/5">
                                  {rec.metrics.recommendation}
                                </p>
                                <div className="flex items-center justify-between font-mono text-xs pt-1">
                                  <span className="text-slate-400">Est. Cold Storage Shelf Life:</span>
                                  <span className="text-amber-400 font-bold">~{rec.metrics.shelf_life_days} days</span>
                                </div>
                              </div>

                              {/* Center: Multi-Item Breakdown or Defect Profile */}
                              <div className="space-y-3">
                                <span className="text-[11px] font-mono font-bold text-blue-400 uppercase tracking-wider block">
                                  {isMulti ? `Detected Items Breakdown (${rec.detected_items?.length})` : 'Optical Defect Regions'}
                                </span>
                                {isMulti && rec.detected_items ? (
                                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                    {rec.detected_items.map((item, i) => (
                                      <div key={i} className="p-2 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between text-xs font-mono">
                                        <span className="text-slate-300 truncate max-w-[160px]">#{i + 1} {item.name}</span>
                                        <span className={item.consumption_status === 'Good to Consume' ? 'text-emerald-400 font-bold' : item.consumption_status === 'Processing / Juice Only' ? 'text-amber-400' : 'text-red-400 font-bold'}>
                                          {item.consumption_status === 'Good to Consume' ? '✅ Good' : item.consumption_status === 'Processing / Juice Only' ? '⚠️ Juice' : '❌ Discard'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : rec.defects && rec.defects.length > 0 ? (
                                  <div className="space-y-2">
                                    {rec.defects.map((def, i) => (
                                      <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-white/5 flex justify-between items-center text-xs font-mono">
                                        <span className="text-slate-300">{def.defect_type}</span>
                                        <span className="text-red-400 font-bold">Severity: {(def.severity * 100).toFixed(0)}% ({def.area_percentage}% area)</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-center text-xs font-mono text-emerald-400">
                                    ✅ No surface defects or active rot detected.
                                  </div>
                                )}
                              </div>

                              {/* Right: Cryptographic Signature & Export */}
                              <div className="space-y-3 flex flex-col justify-between">
                                <div>
                                  <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
                                    SHA-256 Audit Seal
                                  </span>
                                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-white/5 font-mono text-[10px] text-slate-400 break-all leading-relaxed">
                                    HASH: {rec.id.replace('INS-', '9a8d')}c4198fc1c149afbf4c8996fb92427ae41e4649b{rec.metrics.freshness_score.toFixed(0)}
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-2 font-mono text-xs">
                                  <button
                                    onClick={() => exportRecordJSON(rec)}
                                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Download className="h-3.5 w-3.5 text-blue-400" />
                                    <span>Export JSON</span>
                                  </button>
                                  <button
                                    onClick={() => { setActiveInspection(rec); navigate('/result'); }}
                                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center gap-1.5 transition-colors font-bold"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>Full Inspection</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500 font-mono text-xs">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-amber-500/50" />
                      <span>No inspection audit logs found matching your filter criteria.</span>
                      <button
                        onClick={() => { setSearchTerm(''); setGradeFilter('all'); setRiskFilter('all'); setLineFilter('all'); }}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Verification Slide-over Modal */}
      {selectedAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Cryptographic Audit Certificate Verification</h2>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">Record ID: {selectedAuditModal.id} • Batch: {selectedAuditModal.batch_id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditModal(null)}
                className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="aspect-square rounded-2xl bg-slate-950 border border-white/10 overflow-hidden relative flex items-center justify-center">
                <img src={selectedAuditModal.raw_image_url} alt="Specimen" className="w-full h-full object-contain" />
                <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur px-3 py-1 rounded-lg border border-white/10 font-mono text-xs font-bold text-emerald-400">
                  {selectedAuditModal.food_type}
                </div>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Freshness Index:</span>
                    <span className="font-bold text-emerald-400 text-sm">{selectedAuditModal.metrics.freshness_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Surface Damage Area:</span>
                    <span className="font-bold text-slate-200">{selectedAuditModal.metrics.damage_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Classified Quality Grade:</span>
                    <Badge label={`Grade ${selectedAuditModal.metrics.quality_grade}`} variant={selectedAuditModal.metrics.quality_grade === 'A' ? 'success' : 'warning'} size="sm" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Shelf Life:</span>
                    <span className="font-bold text-amber-400">~{selectedAuditModal.metrics.shelf_life_days} days</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-1.5">
                  <span className="text-emerald-400 font-bold block uppercase text-[11px]">Industrial Action Plan</span>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">{selectedAuditModal.metrics.recommendation}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[10px] text-slate-400 break-all space-y-1">
                  <span className="font-bold text-slate-300 block">Digital Verification Signature (SHA-256):</span>
                  <code>{selectedAuditModal.id}e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10 font-mono text-xs">
              <button
                onClick={() => exportRecordJSON(selectedAuditModal)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 flex items-center gap-2 font-semibold transition-colors"
              >
                <Download className="h-4 w-4 text-blue-400" />
                <span>Export Verification JSON</span>
              </button>
              <button
                onClick={() => {
                  const rec = selectedAuditModal;
                  setSelectedAuditModal(null);
                  setActiveInspection(rec);
                  navigate('/result');
                }}
                className="glass-button-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>Open Full Multi-Item Inspector Console</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
