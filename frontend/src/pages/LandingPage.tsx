import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, ShieldCheck, Cpu, ArrowRight, CheckCircle2, Zap, BarChart3, Layers, Lock, Eye, Sparkles, TrendingUp, Activity, Box } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { useInspectionStore } from '../store/inspectionStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeInspection, recentInspections } = useInspectionStore();
  const [spectralMode, setSpectralMode] = useState<'rgb' | 'uv' | 'nir' | 'thermal'>('rgb');

  const latestRecord = activeInspection || (recentInspections.length > 0 ? recentInspections[0] : null);

  const displayRecord = latestRecord || {
    id: 'INS-8921',
    food_type: 'Apple (Fuji)',
    metrics: {
      freshness_score: 98.2,
      confidence: 99.4,
      damage_percentage: 1.2,
      shelf_life_days: 16.5,
      quality_grade: 'A' as const,
    },
    defects: [],
    raw_image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    processing_time_ms: 42
  };

  const rotArea = (displayRecord.defects || [])
    .filter(d => d.defect_type === 'Rot')
    .reduce((acc, d) => acc + (d.area_percentage || 0), 0)
    .toFixed(1);

  const formatConfidence = (conf?: number) => {
    if (conf === undefined || conf === null) return '99.4%';
    if (conf <= 1) {
      return `${(conf * 100).toFixed(1)}%`;
    }
    return `${Number(conf).toFixed(1)}%`;
  };

  const spectralStyles = {
    rgb: '',
    uv: 'filter hue-rotate-[140deg] contrast-200 brightness-90 saturate-[3]',
    nir: 'filter invert-[0.15] contrast-150 saturate-[1.8] sepia-[0.3] hue-rotate-[280deg]',
    thermal: 'filter saturate-[4] hue-rotate-[320deg] contrast-150 brightness-110'
  };

  return (
    <div className="space-y-16 pb-12 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950 to-emerald-950/40 p-8 md:p-14 shadow-2xl backdrop-blur-2xl">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 h-[32rem] w-[32rem] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 h-96 w-96 rounded-full bg-blue-500/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Hero Copy (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge label="AI INSPECTION PLATFORM v2.4" variant="premium" glow pulse />
              <Badge label="ENTERPRISE QUALITY & PRICING" variant="info" />
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                ISO 22000 COMPLIANT
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight font-sans">
              Autonomous Food <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Quality &amp; Market Intelligence
              </span>
            </h1>

            <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
              State-of-the-art multi-spectral computer vision for commercial food processing plants. Detect sub-surface tissue breakdown, predict precise shelf-life decay, and instantly index global agricultural spot market valuations with sub-50ms deterministic accuracy.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => navigate('/upload')}
                className="glass-button-primary flex items-center gap-3 px-7 py-4 rounded-2xl text-sm font-bold shadow-2xl cursor-pointer"
              >
                <Scan className="h-5 w-5 animate-pulse" />
                <span>Launch AI Inspector Console</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="glass-button-secondary flex items-center gap-2.5 px-6 py-4 rounded-2xl text-sm font-semibold cursor-pointer"
              >
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span>Global Agricultural Pricing Hub</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-white/10 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Sub-50ms Optical Inference
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Air-Gapped Data Privacy
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" /> Real-Time Spot Parity ($/kg)
              </div>
            </div>
          </div>

          {/* Animated AI Scanner Graphic with Interactive Multi-Spectral Mode Switcher (5 cols) */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:col-span-5">
            <div className="glass-panel relative rounded-3xl p-6 border border-emerald-500/30 shadow-2xl shadow-emerald-950/60">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 font-mono text-xs">
                <span className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE MULTI-SPECTRAL OPTICAL SENSOR
                </span>
                <span className="text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/10">
                  {latestRecord ? `UPLOAD • ${displayRecord.id}` : 'CONVEYOR CAM #04'}
                </span>
              </div>

              {/* Spectral Mode Toggles */}
              <div className="grid grid-cols-4 gap-1.5 mb-3 bg-slate-950/90 p-1.5 rounded-xl border border-white/10 font-mono text-[10px]">
                <button
                  onClick={() => setSpectralMode('rgb')}
                  className={`py-1.5 rounded-lg font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    spectralMode === 'rgb' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="h-3 w-3" />
                  <span>RGB OPTICAL</span>
                </button>
                <button
                  onClick={() => setSpectralMode('uv')}
                  className={`py-1.5 rounded-lg font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    spectralMode === 'uv' ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>UV ROT DETECT</span>
                </button>
                <button
                  onClick={() => setSpectralMode('nir')}
                  className={`py-1.5 rounded-lg font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    spectralMode === 'nir' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  <span>NIR BRIX/SUGAR</span>
                </button>
                <button
                  onClick={() => setSpectralMode('thermal')}
                  className={`py-1.5 rounded-lg font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                    spectralMode === 'thermal' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="h-3 w-3" />
                  <span>THERMAL MAP</span>
                </button>
              </div>

              {/* Interactive Frame */}
              <div 
                onClick={() => {
                  if (latestRecord) {
                    navigate('/result');
                  } else {
                    navigate('/upload');
                  }
                }}
                className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center group cursor-pointer shadow-inner"
                title="Click to enter detailed visualizer & analysis"
              >
                {/* Scanning Laser */}
                <div className="animate-laser z-20" />
                
                {/* Simulated Food Image with Multi-Spectral Filter */}
                <img
                  src={displayRecord.raw_image_url}
                  alt={displayRecord.food_type}
                  className={`w-full h-full object-cover opacity-85 group-hover:scale-105 transition-all duration-700 ${spectralStyles[spectralMode]}`}
                />

                {/* Bounding Box Overlay */}
                <div className="absolute inset-6 border-2 border-emerald-400/80 rounded-xl bg-emerald-500/10 flex flex-col justify-between p-3.5 pointer-events-none z-10 animate-pulse">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-500 text-slate-950 text-[11px] font-mono font-extrabold px-2 py-0.5 rounded shadow">
                      {displayRecord.food_type} • {formatConfidence(displayRecord.metrics.confidence)}
                    </span>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border shadow ${
                      displayRecord.metrics.quality_grade === 'A' ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40' :
                      displayRecord.metrics.quality_grade === 'B' ? 'bg-blue-950/90 text-blue-400 border-blue-500/40' :
                      displayRecord.metrics.quality_grade === 'C' ? 'bg-amber-950/90 text-amber-400 border-amber-500/40' :
                      'bg-red-950/90 text-red-400 border-red-500/40'
                    }`}>
                      GRADE: {displayRecord.metrics.quality_grade}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono font-bold text-slate-100 bg-slate-950/90 px-2.5 py-1.5 rounded-lg border border-white/15 backdrop-blur self-start shadow-lg">
                    Rot: {rotArea}% | Damage: {displayRecord.metrics.damage_percentage}% | Shelf Life: ~{displayRecord.metrics.shelf_life_days} Days
                  </div>
                </div>

                {/* Spectral Mode Tag */}
                <div className="absolute bottom-2 right-2 z-20 bg-slate-900/90 text-slate-300 font-mono text-[9px] px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                  SPECTRUM: {spectralMode.toUpperCase()}
                </div>
              </div>

              {/* Real-time Telemetry Bar */}
              <div className="mt-4 grid grid-cols-3 gap-3 text-center font-mono">
                <div className="rounded-xl bg-slate-900/90 p-3 border border-white/10 hover:border-emerald-500/40 transition-colors shadow-sm">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">FRESHNESS INDEX</span>
                  <span className={`text-base font-extrabold mt-0.5 block ${
                    displayRecord.metrics.freshness_score >= 80 ? 'text-emerald-400' :
                    displayRecord.metrics.freshness_score >= 60 ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {displayRecord.metrics.freshness_score}%
                  </span>
                </div>
                <div className="rounded-xl bg-slate-900/90 p-3 border border-white/10 hover:border-blue-500/40 transition-colors shadow-sm">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">TENSOR CONFIDENCE</span>
                  <span className="text-base font-extrabold text-blue-400 mt-0.5 block">
                    {formatConfidence(displayRecord.metrics.confidence)}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-900/90 p-3 border border-white/10 hover:border-slate-400/40 transition-colors shadow-sm">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">INFERENCE LATENCY</span>
                  <span className="text-base font-extrabold text-slate-200 mt-0.5 block">
                    {displayRecord.processing_time_ms}ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Industrial Operations & Agricultural Intelligence Summary Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'DAILY INSPECTED VOLUME', value: '142,500 kg', sub: '+14.2% shift throughput', icon: Box, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'AVERAGE FRESHNESS INDEX', value: '96.8%', sub: 'Exceeds ISO Grade A threshold', icon: Sparkles, color: 'text-blue-400', border: 'border-blue-500/20' },
          { label: 'FOOD WASTE PREVENTED', value: '$48,250', sub: 'Early rot containment & sorting', icon: TrendingUp, color: 'text-teal-300', border: 'border-teal-500/20' },
          { label: 'CONVEYOR SPEED PARITY', value: '180 units/m', sub: 'Zero bottleneck real-time classification', icon: Zap, color: 'text-amber-400', border: 'border-amber-500/20' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`glass-card rounded-2xl p-5 border ${stat.border} flex items-center gap-4`}>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 shrink-0 shadow-md">
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">{stat.label}</span>
                <span className="text-xl md:text-2xl font-extrabold text-slate-100 font-mono tracking-tight block mt-0.5">{stat.value}</span>
                <span className="text-[11px] text-slate-400 truncate block mt-0.5">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4-Step Workflow Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge label="HIGH-SPEED AUTOMATION" variant="success" size="sm" />
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Automated Industrial Production Line Workflow
          </h2>
          <p className="text-sm text-slate-400">
            How FreshVision AI integrates seamlessly into high-speed factory conveyor feeds and global distribution hubs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            { step: '01', title: 'High-Speed Image Capture', desc: 'Conveyor cameras capture multi-spectral frames at 180 items/minute with auto-exposure and tensor pre-scaling.', icon: Scan },
            { step: '02', title: 'Sub-Surface Feature Isolation', desc: 'Deep learning vision networks isolate produce boundaries and identify internal brix/moisture variations.', icon: Cpu },
            { step: '03', title: 'Defect & Rot Segmentation', desc: 'Multi-parameter chromaticity algorithms precisely segment browning rot, mechanical bruises, and fungal spores.', icon: Layers },
            { step: '04', title: 'Certificate & Spot Parity', desc: 'One-click generation of verifiable ISO certificates matched with live global wholesale market valuation.', icon: ShieldCheck },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40">
                <div className="absolute top-3 right-4 font-mono text-4xl font-extrabold text-white/5 group-hover:text-emerald-500/15 transition-colors">
                  {item.step}
                </div>
                <div className="mb-5 inline-flex p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-blue-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-2.5 group-hover:text-emerald-300 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Enterprise Architecture & Security */}
      <section className="glass-panel rounded-3xl p-8 md:p-10 border border-white/10 grid gap-10 lg:grid-cols-12 items-center">
        <div className="space-y-4 lg:col-span-4">
          <Badge label="AIR-GAPPED DATA SOVEREIGNTY" variant="info" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">Why On-Premise AI Deployment?</h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Commercial food manufacturing plants and agricultural hubs operate in secure, air-gapped environments. Transmitting continuous production line video feeds to external cloud servers creates IP risks, network latency, and exorbitant bandwidth fees.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/about')}
              className="glass-button-secondary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Architecture Specifications</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
          {[
            { title: 'Predictable Operational Costs', desc: 'Dedicated on-premise inference without recurring cloud API transaction costs or monthly bandwidth overhead.', icon: Zap },
            { title: 'Air-Gapped Data Sovereignty', desc: 'Complete facility privacy. No video feeds, proprietary line telemetry, or audit logs ever leave your premises.', icon: Lock },
            { title: 'Deterministic Quality Math', desc: 'Strict chromaticity algorithms guarantee identical, auditable quality grades across every inspection shift.', icon: BarChart3 },
            { title: 'High-Speed 100% Uptime', desc: 'Built-in local optical classifiers ensure continuous line operation even during external network disruptions.', icon: ShieldCheck },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="rounded-2xl bg-slate-900/90 p-5 border border-white/10 flex gap-4 items-start hover:border-blue-500/30 transition-all shadow-md">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{feature.title}</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

