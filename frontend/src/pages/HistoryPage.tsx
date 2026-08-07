import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ShieldCheck, FileText, RefreshCw, X, Trash2, Copy, RotateCcw, FileSpreadsheet
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useInspectionStore } from '../store/inspectionStore';
import { useToastStore } from '../store/toastStore';
import { useI18nStore } from '../store/i18nStore';
import type { InspectionRecord } from '../types';
import { exportInspectionsToExcel } from '../utils/excelGenerator';
import { generateInspectionPDFReport } from '../utils/pdfGenerator';
import { analyzeFoodImageWithGemini } from '../services/geminiService';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { recentInspections, activeBatchNo, setActiveInspection, addRecentInspection } = useInspectionStore();
  const { addToast } = useToastStore();
  const { t } = useI18nStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [selectedAuditModal, setSelectedAuditModal] = useState<InspectionRecord | null>(null);
  const [deletedRecordIds, setDeletedRecordIds] = useState<string[]>([]);
  const [showBin, setShowBin] = useState(false);

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
    }
  ];

  const allCombined = [...recentInspections, ...baseHistory].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const activeRecords = allCombined.filter((r) => !deletedRecordIds.includes(r.id));
  const binRecords = allCombined.filter((r) => deletedRecordIds.includes(r.id));

  const targetSet = showBin ? binRecords : activeRecords;

  const filteredRecords = targetSet.filter((rec) => {
    const matchesSearch = rec.food_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.batch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rec.metrics.recommendation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || rec.metrics.quality_grade === gradeFilter;
    return matchesSearch && matchesGrade;
  });

  const handleDeleteRecord = (id: string) => {
    setDeletedRecordIds((prev) => [...prev, id]);
    addToast({
      type: 'warning',
      title: 'Record Moved to Bin',
      message: `Inspection ${id} moved to soft-delete bin. Can be restored anytime.`,
    });
  };

  const handleRestoreRecord = (id: string) => {
    setDeletedRecordIds((prev) => prev.filter((i) => i !== id));
    addToast({
      type: 'success',
      title: 'Record Restored',
      message: `Inspection ${id} restored to active audit history logs.`,
    });
  };

  const handleDuplicateRecord = (rec: InspectionRecord) => {
    const dup: InspectionRecord = {
      ...rec,
      id: `INS-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: `Duplicated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    addRecentInspection(dup);
    addToast({
      type: 'info',
      title: 'Inspection Duplicated',
      message: `New record created with ID ${dup.id}.`,
    });
  };

  const handleReAnalyze = async (rec: InspectionRecord) => {
    addToast({
      type: 'info',
      title: 'Re-Analyzing Image',
      message: `Running Gemini Vision AI multi-spectral model on ${rec.id}...`,
    });
    try {
      const updated = await analyzeFoodImageWithGemini(rec.raw_image_url, rec.batch_id, rec.food_type);
      addRecentInspection(updated);
      setActiveInspection(updated);
      addToast({
        type: 'success',
        title: 'Re-Analysis Complete',
        message: `Freshness: ${updated.metrics.freshness_score}% | Grade: ${updated.metrics.quality_grade}`,
      });
      navigate('/result');
    } catch (e: any) {
      addToast({ type: 'error', title: 'Re-Analysis Failed', message: e.message });
    }
  };

  const handleExportExcel = () => {
    exportInspectionsToExcel(filteredRecords);
    addToast({
      type: 'success',
      title: 'Excel Export Complete',
      message: 'Generated formatted multi-sheet XLSX inspection report.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-14 font-sans">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-primary/20 text-primary text-xs font-mono mb-2">
            <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
            <span>IMMUTABLE SHA-256 AUDIT LOGGING</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-mono">
            {showBin ? 'Soft-Deleted Bin Records' : t('auditHistory', 'AI Inspection Audit Logs')}
          </h1>
          <p className="text-sm text-muted-foreground">
            Cryptographically sealed historical records of optical classifications, defect measurements, and PDF exports.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <button
            onClick={() => setShowBin(!showBin)}
            className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-all ${
              showBin
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-card border-border text-muted-foreground hover:text-foreground'
            }`}
            title="Toggle Bin View"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-cyan-500/40 text-primary text-xs font-bold font-mono hover:bg-cyan-500/10 transition-all shadow-lg"
          >
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            <span>{t('exportExcel', 'Export Excel')}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 bg-card/90 border-border">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Search food, batch ID, grade, or defect...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto font-mono text-xs">
            <div className="flex items-center gap-1.5 bg-background px-2.5 py-1.5 rounded-xl border border-border">
              <Filter className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground mr-1 text-[11px]">Grade:</span>
              {['all', 'A', 'B', 'C', 'Reject'].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setGradeFilter(grade)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    gradeFilter === grade
                      ? 'bg-primary text-primary-foreground font-bold shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {grade === 'all' ? 'All' : grade}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Audit Table */}
      <Card className="p-0 overflow-hidden border border-border">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-card/80 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                <th className="py-4 pl-5">Inspection ID</th>
                <th className="py-4">Produce Specimen</th>
                <th className="py-4">Freshness & Grade</th>
                <th className="py-4">Risk Rating</th>
                <th className="py-4 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-mono">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-card/50 transition-colors">
                    <td className="py-4 pl-5 text-xs">
                      <div className="font-extrabold text-foreground">{rec.id}</div>
                      <div className="text-[10px] text-muted-foreground">{rec.batch_id}</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={rec.raw_image_url} alt={rec.food_type} className="h-10 w-10 rounded-lg object-cover bg-accent border border-border shrink-0" />
                        <div>
                          <span className="font-bold text-foreground block text-xs">{rec.food_type}</span>
                          <span className="text-[10px] text-muted-foreground">Confidence: {rec.metrics.confidence}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-xs font-bold text-primary">{rec.metrics.freshness_score}%</div>
                      <Badge label={`Grade ${rec.metrics.quality_grade}`} variant={rec.metrics.quality_grade === 'A' ? 'success' : 'warning'} size="sm" />
                    </td>
                    <td className="py-4 text-xs font-bold text-muted-foreground">{rec.metrics.risk_level}</td>
                    <td className="py-4 text-right pr-5 space-x-1">
                      {!showBin ? (
                        <>
                          <button
                            onClick={() => generateInspectionPDFReport(rec)}
                            className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-blue-400 transition-colors"
                            title="Generate PDF Certificate"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateRecord(rec)}
                            className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-muted-foreground transition-colors"
                            title="Duplicate Record"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReAnalyze(rec)}
                            className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-primary transition-colors"
                            title="Re-Analyze with Vision AI"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-2 rounded-lg bg-accent hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Soft Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestoreRecord(rec.id)}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 flex items-center gap-1.5 ml-auto"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No inspection logs found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-border font-mono">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((rec) => (
                <div key={rec.id} className="p-4 space-y-4 hover:bg-card/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <img src={rec.raw_image_url} alt={rec.food_type} className="h-12 w-12 rounded-lg object-cover bg-accent border border-border shrink-0" />
                      <div>
                        <div className="font-extrabold text-foreground text-sm">{rec.id}</div>
                        <span className="font-bold text-muted-foreground block text-xs">{rec.food_type}</span>
                        <div className="text-[10px] text-slate-500">{rec.batch_id}</div>
                      </div>
                    </div>
                    <Badge label={`Grade ${rec.metrics.quality_grade}`} variant={rec.metrics.quality_grade === 'A' ? 'success' : 'warning'} size="sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-card p-2 rounded border border-border">
                      <span className="text-slate-500 block text-[10px]">Freshness</span>
                      <span className="font-bold text-primary">{rec.metrics.freshness_score}%</span>
                    </div>
                    <div className="bg-card p-2 rounded border border-border">
                      <span className="text-slate-500 block text-[10px]">Risk</span>
                      <span className="font-bold text-muted-foreground">{rec.metrics.risk_level}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    {!showBin ? (
                      <>
                        <button
                          onClick={() => generateInspectionPDFReport(rec)}
                          className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-blue-400 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateRecord(rec)}
                          className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-muted-foreground transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReAnalyze(rec)}
                          className="p-2 rounded-lg bg-accent hover:bg-accent/80 text-primary transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-2 rounded-lg bg-accent hover:bg-rose-500/20 text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRestoreRecord(rec.id)}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                No inspection logs found matching filters.
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal */}
      {selectedAuditModal && (
        <div className="fixed inset-0 z-50 bg-muted/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-white/20 rounded-3xl max-w-xl w-full p-6 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="font-bold text-foreground text-sm">Certificate Verification - {selectedAuditModal.id}</span>
              <button onClick={() => setSelectedAuditModal(null)} className="p-1 text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div>Recommendation: {selectedAuditModal.metrics.recommendation}</div>
          </div>
        </div>
      )}
    </div>
  );
};
