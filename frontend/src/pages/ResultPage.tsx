import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Download, 
  RefreshCw, Layers, Eye, FileText, Thermometer, Box, ArrowLeft,
  ThumbsUp, ThumbsDown, Sparkles, CheckCircle, Tag, ChevronRight,
  GitCompare, ShoppingBag, ArrowUpRight, Zap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useInspectionStore } from '../store/inspectionStore';
import { SpoilageSimulator } from '../components/inspection/SpoilageSimulator';
import { BatchCompareModal } from '../components/inspection/BatchCompareModal';

export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeInspection, recentInspections, addRecentInspection, resetWorkflow } = useInspectionStore();
  const [viewMode, setViewMode] = useState<'raw' | 'bbox' | 'heatmap'>('bbox');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Good to Consume' | 'Processing / Juice Only' | 'Not Good to Consume (Discard)'>('all');
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  if (!activeInspection) {
    return (
      <div className="flex flex-col items-center justify-center h-[65vh] space-y-5 animate-fadeIn">
        <div className="p-5 rounded-3xl bg-muted/40 border border-emerald-500/30 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <AlertTriangle className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">No Active Inspection Found</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center leading-relaxed">
          Please upload a produce photograph or high-speed conveyor frame to initiate the AI multi-spectral vision analysis.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3.5 rounded-2xl text-sm font-bold shadow-lg cursor-pointer"
        >
          Return to Upload Console
        </button>
      </div>
    );
  }

  const { metrics, food_type, id, timestamp, raw_image_url, processing_time_ms, spoilage_data, ai_pricing, isCached } = activeInspection;

  // AI Pricing Fallback
  const discountPercent = ai_pricing?.suggestedDiscountPercent ?? (
    metrics.quality_grade === 'A' ? 0 : metrics.quality_grade === 'B' ? 15 : metrics.quality_grade === 'C' ? 40 : 80
  );
  const pricingCategory = ai_pricing?.pricingCategory ?? (
    metrics.quality_grade === 'A' ? 'Premium Export & Full Retail' :
    metrics.quality_grade === 'B' ? 'Standard Supermarket Price' :
    metrics.quality_grade === 'C' ? 'Clearance / Industrial Extraction' : 'Salvage & Bio-Compost'
  );
  const pricingReasoning = ai_pricing?.reasoning ?? (
    metrics.quality_grade === 'A' ? 'Zero discount required; pristine biological cell structure.' :
    metrics.quality_grade === 'B' ? 'Minor skin marks; 15% markdown ensures rapid inventory velocity.' :
    metrics.quality_grade === 'C' ? 'Enzymatic softening; 40% discount for commercial puree/juice processors.' : 'Unfit for whole consumption. 80% markdown for compost.'
  );

  const handleListOnMarket = () => {
    navigate('/market/sell', {
      state: {
        fromInspection: true,
        inspectionId: id,
        foodType: food_type,
        qualityGrade: metrics.quality_grade,
        freshnessScore: metrics.freshness_score,
        shelfLifeDays: metrics.shelf_life_days,
        suggestedDiscountPercent: discountPercent,
        pricingCategory: pricingCategory,
        imageUrl: raw_image_url,
        recommendation: metrics.recommendation,
      },
    });
  };

  const detectedItems = activeInspection.detected_items && activeInspection.detected_items.length > 0
    ? activeInspection.detected_items
    : [
        {
          id: 'ITEM-01',
          name: `${food_type} #1 (Primary)`,
          food_type: food_type,
          bbox: [100, 100, 900, 900] as [number, number, number, number],
          consumption_status: (metrics.quality_grade === 'A' || metrics.quality_grade === 'B' ? 'Good to Consume' : metrics.quality_grade === 'C' ? 'Processing / Juice Only' : 'Not Good to Consume (Discard)') as any,
          summary: metrics.recommendation,
          good_bad_explanation: {
            why_good: metrics.quality_grade === 'Reject' ? 'Limited viable tissue remaining due to active degradation.' : 'Exhibits firm internal structure, natural protective cuticle, and healthy cellular moisture levels.',
            why_bad: metrics.quality_grade === 'A' ? 'No surface blemishes or biological degradation detected. Pristine condition.' : metrics.quality_grade === 'B' ? 'Minor mechanical skin friction/bruising without internal rot.' : metrics.quality_grade === 'C' ? 'Significant enzymatic softening and surface browning requiring industrial processing.' : 'Active rot and fungal degradation present. Hazardous for human consumption.'
          },
          metrics: {
            freshness_score: metrics.freshness_score,
            quality_grade: metrics.quality_grade,
            damage_percentage: metrics.damage_percentage,
            confidence: metrics.confidence
          }
        }
      ];

  const filteredItems = statusFilter === 'all'
    ? detectedItems
    : detectedItems.filter(i => i.consumption_status === statusFilter);

  const goodCount = detectedItems.filter(i => i.consumption_status === 'Good to Consume').length;
  const processingCount = detectedItems.filter(i => i.consumption_status === 'Processing / Juice Only').length;
  const discardCount = detectedItems.filter(i => i.consumption_status === 'Not Good to Consume (Discard)').length;

  const handleInspectAnother = () => {
    addRecentInspection(activeInspection);
    resetWorkflow();
    navigate('/upload');
  };

  const downloadReport = (type: 'pdf' | 'csv') => {
    // Simulate instant local PDF/CSV certificate generation
    const element = document.createElement('a');
    const content = type === 'pdf' 
      ? `%PDF-1.4\n%-- FreshVision AI Enterprise Inspection Audit Certificate --\nID: ${id}\nFood: ${food_type}\nGrade: ${metrics.quality_grade}\nFreshness: ${metrics.freshness_score}%\nDamage: ${metrics.damage_percentage}%\nShelf Life: ${metrics.shelf_life_days} days\nRecommendation: ${metrics.recommendation}`
      : `ID,Timestamp,Food Type,Grade,Freshness Score,Damage %,Shelf Life (Days),Risk Level,Recommendation\n"${id}","${timestamp}","${food_type}","${metrics.quality_grade}",${metrics.freshness_score},${metrics.damage_percentage},${metrics.shelf_life_days},"${metrics.risk_level}","${metrics.recommendation}"`;
    
    const file = new Blob([content], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `FreshVision_Audit_${id}.${type}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeIn">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/50/60 backdrop-blur-sm p-5 rounded-2xl border border-border shadow-xl">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-emerald-300 transition-colors shadow-sm"
            title="Return to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight font-sans">Inspection Audit Report</h1>
              <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                {id}
              </span>
              {isCached && (
                <span className="font-mono text-[10px] text-yellow-300 font-bold bg-yellow-950/80 px-2 py-0.5 rounded-md border border-yellow-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  INSTANT CACHE HIT
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Completed at {timestamp} • Inference Latency: <span className="text-foreground font-bold">{processing_time_ms}ms</span></p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCompareOpen(true)}
            className="bg-accent text-foreground hover:bg-accent/80 border border-emerald-500/30 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
          >
            <GitCompare className="h-4 w-4 text-emerald-400" />
            <span>Compare Batches</span>
          </button>
          <button
            onClick={() => downloadReport('csv')}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            <Download className="h-4 w-4 text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => downloadReport('pdf')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md"
          >
            <FileText className="h-4 w-4" />
            <span>PDF Certificate</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer vs Decision Matrix */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left: Multi-Layer Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-3 bg-muted/30 border-emerald-500/30 shadow-lg">
            {/* View Mode Toggle Bar */}
            <div className="flex items-center justify-between bg-muted/40 p-1.5 rounded-xl border border-border mb-3 font-mono text-xs">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'raw' ? 'bg-accent text-foreground font-bold shadow border border-border' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Raw Capture</span>
                </button>
                <button
                  onClick={() => setViewMode('bbox')}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'bbox' ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/30' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>AI Bounding Boxes</span>
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'heatmap' ? 'bg-red-500 text-foreground font-extrabold shadow-lg shadow-red-500/30' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Defect Heatmap</span>
                </button>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold hidden sm:inline px-2 py-0.5 bg-emerald-950/60 rounded border border-emerald-500/20">
                1024x1024 TENSOR
              </span>
            </div>

            {/* Visualizer Display Box */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-background border border-border flex items-center justify-center shadow-sm">
              <img
                src={raw_image_url}
                alt={food_type}
                className={`w-full h-full object-contain transition-all duration-500 ${
                  viewMode === 'heatmap' ? 'filter saturate-200 contrast-150 hue-rotate-15' : ''
                }`}
              />

              {/* Simulated Bounding Box Layer */}
              {viewMode === 'bbox' && (
                <div className="absolute inset-0 pointer-events-auto">
                  {detectedItems.map((item, idx) => {
                    const top = item.bbox[0] / 10;
                    const left = item.bbox[1] / 10;
                    const height = Math.max(10, (item.bbox[2] - item.bbox[0]) / 10);
                    const width = Math.max(10, (item.bbox[3] - item.bbox[1]) / 10);
                    const isSelected = selectedItemId === item.id;
                    const status = item.consumption_status;

                    const borderBgStyle = 
                      status === 'Good to Consume' 
                        ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_18px_rgba(16,185,129,0.4)] hover:bg-emerald-500/25' :
                      status === 'Processing / Juice Only'
                        ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_18px_rgba(245,158,11,0.4)] hover:bg-amber-500/25' :
                        'border-red-500 bg-red-500/25 shadow-[0_0_18px_rgba(239,68,68,0.5)] hover:bg-red-500/35 animate-pulse';

                    const badgeColor =
                      status === 'Good to Consume' ? 'bg-emerald-500 text-slate-950' :
                      status === 'Processing / Juice Only' ? 'bg-amber-500 text-slate-950' :
                      'bg-red-600 text-foreground';

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItemId(item.id);
                          document.getElementById(`item-card-${item.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        style={{ top: `${top}%`, left: `${left}%`, height: `${height}%`, width: `${width}%` }}
                        className={`absolute border-2 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between p-2.5 ${borderBgStyle} ${
                          isSelected ? 'ring-4 ring-white z-30 scale-[1.03] shadow-[0_0_35px_rgba(255,255,255,0.9)]' : 'z-10'
                        }`}
                        title={`${item.name}: ${status}`}
                      >
                        <div className="flex justify-between items-start gap-1 overflow-hidden">
                          <span className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded shadow truncate ${badgeColor}`}>
                            #{idx + 1} {item.food_type}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-muted/30 text-foreground px-1.5 py-0.5 rounded border border-border shrink-0 shadow">
                            Gr.{item.metrics.quality_grade}
                          </span>
                        </div>

                        <div className="bg-muted/30 backdrop-blur px-2 py-1 rounded-lg border border-border text-[11px] font-mono font-bold text-foreground self-start truncate max-w-full shadow-lg">
                          {status === 'Good to Consume' ? '✅ Good' : status === 'Processing / Juice Only' ? '⚠️ Processing' : '❌ Discard'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Simulated OpenCV Defect Heatmap Layer */}
              {viewMode === 'heatmap' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 via-transparent to-amber-500/20 pointer-events-none flex items-center justify-center">
                  <div className="bg-red-950/95 border border-red-500/60 text-red-300 text-xs font-mono font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>HSV COLOR DEGRADATION &amp; BRUISE MAPPING ACTIVE</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3.5 flex items-center justify-between text-xs font-mono text-muted-foreground px-3">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>MODEL: OPTICAL-VISION-v2.pt</span>
              </span>
              <span>OPENCV: GLCM TEXTURE VARIANCE</span>
            </div>
          </Card>
        </div>

        {/* Right: Decision Matrix & Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Executive Quality Grade Card */}
          <Card className={`border-2 ${
            metrics.quality_grade === 'A' ? 'border-emerald-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 shadow-xl shadow-emerald-950/50' :
            metrics.quality_grade === 'B' ? 'border-blue-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 shadow-xl shadow-blue-950/50' :
            metrics.quality_grade === 'C' ? 'border-amber-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/60 shadow-xl shadow-amber-950/50' :
            'border-red-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/60 shadow-xl shadow-red-950/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block font-bold">CLASSIFIED QUALITY GRADE</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-4xl font-extrabold font-mono tracking-tight ${
                    metrics.quality_grade === 'A' ? 'text-emerald-400' :
                    metrics.quality_grade === 'B' ? 'text-blue-400' :
                    metrics.quality_grade === 'C' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    GRADE {metrics.quality_grade}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-1.5 block font-medium">
                  {metrics.quality_grade === 'A' ? 'Excellent - Premium Retail Export Standards' :
                   metrics.quality_grade === 'B' ? 'Good - Standard Supermarket Distribution Grade' :
                   metrics.quality_grade === 'C' ? 'Acceptable - Immediate Puree / Juice Processing' :
                   'REJECTED - High Defect & Rot Concentration Hazard'}
                </span>
              </div>

              <div className={`p-4 rounded-2xl shadow-lg ${
                metrics.quality_grade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20' :
                metrics.quality_grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-blue-500/20' :
                metrics.quality_grade === 'C' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20' :
                'bg-red-500/20 text-red-400 border border-red-500/40 shadow-red-500/20 animate-pulse'
              }`}>
                {metrics.quality_grade === 'A' && <CheckCircle2 className="h-10 w-10" />}
                {metrics.quality_grade === 'B' && <ShieldCheck className="h-10 w-10" />}
                {metrics.quality_grade === 'C' && <AlertTriangle className="h-10 w-10" />}
                {metrics.quality_grade === 'Reject' && <XCircle className="h-10 w-10" />}
              </div>
            </div>
          </Card>

          {/* Key Metric Meters */}
          <Card title="Vision Telemetry Metrics" subtitle="Real-time optical classifier outputs">
            <div className="space-y-4 font-mono">
              {/* Freshness Score */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-bold">FRESHNESS INDEX</span>
                  <span className={`font-extrabold ${metrics.freshness_score >= 85 ? 'text-emerald-400' : metrics.freshness_score >= 65 ? 'text-blue-400' : metrics.freshness_score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                    {metrics.freshness_score}%
                  </span>
                </div>
                <div className="h-3 w-full bg-background rounded-full overflow-hidden p-0.5 border border-border">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${metrics.freshness_score >= 85 ? 'from-emerald-500 to-teal-400' : metrics.freshness_score >= 65 ? 'from-blue-500 to-indigo-400' : metrics.freshness_score >= 50 ? 'from-amber-500 to-orange-400' : 'from-red-600 to-rose-400'}`} 
                    style={{ width: `${metrics.freshness_score}%` }} 
                  />
                </div>
              </div>

              {/* Multi-Factor AI Quality Sub-Indices */}
              {metrics.chromaticity_index !== undefined && (
                <div className="grid grid-cols-3 gap-2.5 py-3 border-y border-border text-[11px]">
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-border shadow">
                    <span className="text-muted-foreground block mb-1 text-[10px] font-bold uppercase">COLOR HEALTH</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{metrics.chromaticity_index}%</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-border shadow">
                    <span className="text-muted-foreground block mb-1 text-[10px] font-bold uppercase">STRUCTURE</span>
                    <span className="text-blue-400 font-extrabold text-sm">{metrics.structural_integrity_index}%</span>
                  </div>
                  <div className="bg-muted/40 p-2.5 rounded-xl border border-border shadow">
                    <span className="text-muted-foreground block mb-1 text-[10px] font-bold uppercase">DEFECT FREE</span>
                    <span className="text-purple-400 font-extrabold text-sm">{metrics.defect_freedom_index}%</span>
                  </div>
                </div>
              )}

              {/* Confidence Score */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-bold">AI MODEL CONFIDENCE</span>
                  <span className="font-extrabold text-blue-400">{(metrics.confidence <= 1 ? metrics.confidence * 100 : metrics.confidence).toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-background rounded-full overflow-hidden p-0.5 border border-border">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-1000" 
                    style={{ width: `${metrics.confidence <= 1 ? metrics.confidence * 100 : metrics.confidence}%` }} 
                  />
                </div>
              </div>

              {/* Surface Damage % */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground font-bold">SURFACE DEFECT &amp; BRUISE AREA</span>
                  <span className={`font-extrabold ${metrics.damage_percentage > 20 ? 'text-red-400' : 'text-foreground'}`}>
                    {metrics.damage_percentage}%
                  </span>
                </div>
                <div className="h-3 w-full bg-background rounded-full overflow-hidden p-0.5 border border-border">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${metrics.damage_percentage > 20 ? 'bg-red-500' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, metrics.damage_percentage * 1.5)}%` }} 
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Shelf Life & Recommendation */}
          <Card title="Storage &amp; Packaging Action Plan">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-muted/40 border border-border shadow-md">
                <div className="p-3.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                  <Thermometer className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-mono text-muted-foreground font-bold uppercase block">ESTIMATED REMAINING SHELF LIFE</span>
                  <div className="text-2xl font-extrabold font-mono text-amber-400 mt-0.5">
                    ~{metrics.shelf_life_days} <span className="text-xs font-normal text-muted-foreground">days at 4°C Cold Storage</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-emerald-500/30 text-xs leading-relaxed shadow-md">
                <span className="font-mono font-extrabold text-emerald-400 block mb-1 tracking-wider uppercase">ENTERPRISE RECOMMENDATION:</span>
                <p className="text-foreground font-medium">{metrics.recommendation}</p>
              </div>

              <button
                onClick={handleInspectAnother}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-border cursor-pointer transition-all"
              >
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                <span>Inspect Another Produce Item</span>
              </button>
            </div>
          </Card>

          {/* AI Dynamic Pricing & 1-Click Fresh Market Bridge */}
          <Card className="bg-gradient-to-br from-emerald-950/40 via-card to-background border-emerald-500/40 shadow-xl overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">AI Dynamic Pricing &amp; Market</h3>
                    <p className="text-[11px] text-muted-foreground">Spot valuation based on biological quality</p>
                  </div>
                </div>
                <Badge variant={discountPercent > 0 ? 'warning' : 'success'} className="font-mono text-xs">
                  {discountPercent > 0 ? `-${discountPercent}% Markdown` : 'Full Retail Value'}
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-background/60 border border-border/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Pricing Tier:</span>
                  <span className="font-bold text-foreground font-mono">{pricingCategory}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Suggested Markdown:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {discountPercent === 0 ? '0% (Premium Export)' : `${discountPercent}% Off Base Rate`}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground border-t border-border/50 pt-2 leading-tight">
                  {pricingReasoning}
                </p>
              </div>

              <button
                onClick={handleListOnMarket}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Sparkles className="h-4 w-4" />
                <span>List on Fresh Market (1-Click AI Pre-Fill)</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* 14-Day Spoilage Simulator Section */}
      <SpoilageSimulator
        foodType={food_type}
        qualityGrade={metrics.quality_grade}
        initialFreshness={metrics.freshness_score}
        shelfLifeDays={metrics.shelf_life_days}
        spoilageData={spoilage_data}
      />

      {/* Item-by-Item Consumption & Quality Breakdown Console */}
      <div id="item-breakdown-section" className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/15 to-blue-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold mb-2.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>INDIVIDUAL ITEM CONSUMPTION ADVISORY</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-sans">Item-by-Item Consumption Breakdown</h2>
            <p className="text-sm text-muted-foreground">
              Detailed multi-item classification indicating which specific produce items are safe to consume, which require extraction, and exact defect rationale.
            </p>
          </div>

          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-accent text-foreground border border-emerald-500/50 shadow-lg' : 'bg-muted/50/70 text-muted-foreground border border-border hover:bg-accent/60 hover:text-foreground'
              }`}
            >
              <Tag className="h-3.5 w-3.5 text-blue-400" />
              <span>All Items ({detectedItems.length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('Good to Consume')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                statusFilter === 'Good to Consume' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400 shadow-lg shadow-emerald-950/60' : 'bg-muted/50/70 text-muted-foreground border border-border hover:bg-accent/60 hover:text-foreground'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Good to Consume ({goodCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('Processing / Juice Only')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                statusFilter === 'Processing / Juice Only' ? 'bg-amber-500/25 text-amber-300 border border-amber-400 shadow-lg shadow-amber-950/60' : 'bg-muted/50/70 text-muted-foreground border border-border hover:bg-accent/60 hover:text-foreground'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Juice/Processing ({processingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('Not Good to Consume (Discard)')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                statusFilter === 'Not Good to Consume (Discard)' ? 'bg-red-500/25 text-red-300 border border-red-400 shadow-lg shadow-red-950/60' : 'bg-muted/50/70 text-muted-foreground border border-border hover:bg-accent/60 hover:text-foreground'
              }`}
            >
              <XCircle className="h-3.5 w-3.5 text-red-400" />
              <span>Do Not Consume ({discardCount})</span>
            </button>
          </div>
        </div>

        {/* Item Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, idx) => {
            const status = item.consumption_status;
            const isSelected = selectedItemId === item.id;

            const borderCardClass =
              status === 'Good to Consume' ? 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/40 shadow-xl' :
              status === 'Processing / Juice Only' ? 'border-amber-500/40 hover:border-amber-400 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-amber-950/40 shadow-xl' :
              'border-red-500/50 hover:border-red-400 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-red-950/50 shadow-xl shadow-red-950/40';

            const statusBadge =
              status === 'Good to Consume' ? (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold font-mono shadow-md">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>GOOD TO CONSUME</span>
                </div>
              ) : status === 'Processing / Juice Only' ? (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold font-mono shadow-md">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>PROCESSING / JUICE ONLY</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600/30 border border-red-500 text-red-300 text-xs font-extrabold font-mono shadow-md animate-pulse">
                  <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>NOT GOOD • DISCARD IMMEDIATELY</span>
                </div>
              );

            return (
              <div
                key={item.id}
                id={`item-card-${item.id}`}
                onClick={() => setSelectedItemId(item.id)}
                className={`rounded-2xl border-2 p-6 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer group ${borderCardClass} ${
                  isSelected ? 'ring-4 ring-emerald-500/60 scale-[1.02] shadow-lg' : ''
                }`}
              >
                <div>
                  {/* Card Header & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                        ITEM #{idx + 1} • {item.food_type}
                      </span>
                      <h3 className="text-lg font-extrabold text-foreground mt-0.5 tracking-tight group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </h3>
                    </div>
                    <Badge 
                      label={`Grade ${item.metrics.quality_grade}`} 
                      variant={item.metrics.quality_grade === 'A' ? 'success' : item.metrics.quality_grade === 'B' ? 'info' : item.metrics.quality_grade === 'C' ? 'warning' : 'danger'}
                      size="sm"
                      glow={status === 'Good to Consume'}
                    />
                  </div>

                  {statusBadge}

                  {/* Summary Box */}
                  <p className="text-xs text-muted-foreground mt-3.5 p-3.5 rounded-xl bg-muted/50 border border-border leading-relaxed font-medium">
                    {item.summary}
                  </p>

                  {/* Why Good vs Why Bad Sections */}
                  <div className="mt-4 space-y-3">
                    {/* Why is it Good */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 font-mono tracking-wide">
                        <ThumbsUp className="h-3.5 w-3.5 shrink-0" />
                        <span>WHY IT IS GOOD / SAFE:</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        {item.good_bad_explanation.why_good}
                      </p>
                    </div>

                    {/* Why is it Bad */}
                    <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 space-y-1.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-400 font-mono tracking-wide">
                        <ThumbsDown className="h-3.5 w-3.5 shrink-0" />
                        <span>WHY IT IS BAD / DEFECTS:</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        {item.good_bad_explanation.why_bad}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & Highlight Button */}
                <div className="pt-4 border-t border-border space-y-3.5">
                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                    <div className="bg-muted/40 p-2 rounded-xl border border-border shadow">
                      <span className="text-muted-foreground block text-[10px] font-bold uppercase">FRESHNESS</span>
                      <span className={`font-extrabold ${item.metrics.freshness_score >= 80 ? 'text-emerald-400' : item.metrics.freshness_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {item.metrics.freshness_score}%
                      </span>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-xl border border-border shadow">
                      <span className="text-muted-foreground block text-[10px] font-bold uppercase">DAMAGE</span>
                      <span className={`font-extrabold ${item.metrics.damage_percentage > 15 ? 'text-red-400' : 'text-foreground'}`}>
                        {item.metrics.damage_percentage}%
                      </span>
                    </div>
                    <div className="bg-muted/40 p-2 rounded-xl border border-border shadow">
                      <span className="text-muted-foreground block text-[10px] font-bold uppercase">CONFIDENCE</span>
                      <span className="font-extrabold text-blue-400">
                        {item.metrics.confidence}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItemId(item.id);
                      setViewMode('bbox');
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-muted/50 hover:bg-accent border border-border text-xs font-bold text-muted-foreground hover:text-emerald-300 flex items-center justify-center gap-2 transition-all shadow-md group-hover:border-emerald-500/30"
                  >
                    <Box className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Locate & Highlight on Vision Frame</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Quality Comparison Modal */}
      <BatchCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        currentRecord={activeInspection}
        historyRecords={recentInspections}
      />
    </div>
  );
};


