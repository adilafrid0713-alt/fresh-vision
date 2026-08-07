import React, { useState } from 'react';
import { 
  Award, CheckCircle2, ShieldCheck, Cpu, Eye, Zap, Lock, FileText, 
  Sparkles, Box, Server
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const AboutPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(3); // Default to Multi-Item Segmentation

  const pipelineStages = [
    {
      step: 1,
      title: 'Optical Ingestion & Conveyor Capture',
      icon: Eye,
      tech: 'High-Speed CMOS / 500x500 Frame Matrix',
      description: 'Ingests multi-spectral raw camera frames at 60 FPS from high-speed factory sorting belts without motion blur or chromatic aberration.'
    },
    {
      step: 2,
      title: 'CLAHE Contrast & GrabCut Preprocessing',
      icon: Zap,
      tech: 'OpenCV Chromatic Normalization',
      description: 'Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) to normalize variable factory lighting and isolate specimens from background clutter.'
    },
    {
      step: 3,
      title: 'Multi-Item Bounding Box Segmentation',
      icon: Box,
      tech: 'Autonomous Multi-Instance Detection',
      description: 'Simultaneously detects, isolates, and indexes multiple produce items inside mixed trays or baskets (`[ymin, xmin, ymax, xmax]`) for item-by-item analysis.'
    },
    {
      step: 4,
      title: 'HSV Browning Rot & GLCM Texture Engine',
      icon: Cpu,
      tech: 'Deterministic Chromatic & Spatial Variance',
      description: 'Scans each item for sub-surface enzymatic browning, mechanical friction bruises, wrinkle formation, and fungal rot lesions down to 1.5% surface area.'
    },
    {
      step: 5,
      title: 'Biological Consumption Advisory & Grading',
      icon: Sparkles,
      tech: 'ISO 22000 Grading Matrix (A/B/C/Reject)',
      description: 'Synthesizes freshness kinetics to output item-specific consumption status (`Good to Consume`, `Juice Only`, `Quarantine`) with detailed good vs bad justifications.'
    },
    {
      step: 6,
      title: 'SHA-256 Cryptographic Audit Sealing',
      icon: Lock,
      tech: 'Write-Ahead Log (WAL) Immutable Store',
      description: 'Logs immutable historical inspection records sealed with cryptographic SHA-256 hashes to guarantee regulatory transparency and prevent tampering.'
    },
    {
      step: 7,
      title: 'ReportLab PDF Certificate Generation',
      icon: FileText,
      tech: 'Automated Compliance Certification',
      description: 'Generates official, verifiable PDF audit certificates featuring item annexes and QR verification codes for international export compliance.'
    }
  ];

  const currentStageInfo = pipelineStages[selectedStage];

  const capabilities = [
    {
      title: 'Granular Multi-Item Consumption Advisory',
      badge: 'NEW IN V2.4',
      variant: 'success' as const,
      description: 'Unlike legacy single-item classifiers, FreshVision AI detects every produce item inside dense trays one by one. Each item receives distinct spatial bounding boxes, individual quality grades (`Grade A/B/C/Reject`), and comprehensive positive/negative biological justifications (`Why is it Good vs Why is it Bad`).'
    },
    {
      title: 'Sub-50ms Deterministic Optical Vision',
      badge: 'CORE ENGINE',
      variant: 'info' as const,
      description: 'Combines neural object detection with deterministic OpenCV mathematical algorithms (`HSV Color Degradation`, `GLCM Texture Variance`, `CLAHE Chromaticity`). Operates with zero network latency right on high-speed conveyor belts.'
    },
    {
      title: 'Predictive Shelf Life Kinetics & Thermal Decay',
      badge: 'ALGORITHMIC',
      variant: 'warning' as const,
      description: 'Calculates remaining cold-storage refrigeration longevity (`4°C`) based on biological decay rate, moisture loss, and bruise severity, enabling precise inventory sorting for export vs immediate processing.'
    },
    {
      title: 'Air-Gapped Data Sovereignty & Zero-Cloud Risk',
      badge: 'SECURITY',
      variant: 'default' as const,
      description: 'Engineered for strict enterprise environments. 100% of image processing, database logging, and certificate generation executes locally on-premise without transmitting factory telemetry or trade secrets to external servers.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Hero Banner Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 border border-primary/20 text-primary text-xs font-mono shadow-lg">
          <Award className="h-4 w-4 text-primary" />
          <span>ENTERPRISE MULTI-SPECTRAL VISION PLATFORM V2.4</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
          About <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">FreshVision AI</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          The industry-leading autonomous computer vision platform engineered for high-speed commercial food manufacturing, real-time multi-item quality grading, and immutable ISO 22000 compliance auditing.
        </p>

        {/* Executive KPI Pill Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-lg">
            <span className="text-2xl font-extrabold text-primary block">99.99%</span>
            <span className="text-[11px] text-muted-foreground mt-1 block">LINE INSPECTION UPTIME</span>
          </div>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-lg">
            <span className="text-2xl font-extrabold text-blue-500 dark:text-blue-400 block">&lt; 50 ms</span>
            <span className="text-[11px] text-muted-foreground mt-1 block">OPTICAL INFERENCE LATENCY</span>
          </div>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-lg">
            <span className="text-2xl font-extrabold text-amber-400 block">100%</span>
            <span className="text-[11px] text-muted-foreground mt-1 block">ON-PREMISE AIR-GAPPED</span>
          </div>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-lg">
            <span className="text-2xl font-extrabold text-purple-400 block">SHA-256</span>
            <span className="text-[11px] text-muted-foreground mt-1 block">CRYPTOGRAPHIC AUDIT SEAL</span>
          </div>
        </div>
      </div>

      {/* Interactive 7-Stage Vision Pipeline Architecture */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-border shadow-lg">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
                INTERACTIVE ARCHITECTURAL PIPELINE
              </span>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight mt-0.5">
                The 7-Stage Autonomous Inspection Pipeline
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Click any stage below to inspect deep optical mechanics</span>
          </div>

          {/* Pipeline Stage Buttons Horizontal/Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-xs">
            {pipelineStages.map((st, idx) => {
              const Icon = st.icon;
              const isSelected = selectedStage === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedStage(idx)}
                  className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center justify-between space-y-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-t from-cyan-500/20 to-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/50 scale-[1.03]'
                      : 'bg-muted/50 border-border hover:border-slate-700 hover:bg-muted/50/60 text-muted-foreground'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-primary text-slate-950 shadow' : 'bg-muted/50 text-muted-foreground'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-bold">STAGE 0{st.step}</span>
                    <span className={`text-xs font-bold block mt-0.5 line-clamp-2 leading-tight ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {st.title.split(' & ')[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stage Details Showcase Box */}
          <div className="mt-6 p-6 md:p-8 rounded-3xl bg-background border-2 border-primary/20 grid md:grid-cols-12 gap-6 items-center shadow-xl">
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-primary font-mono font-extrabold text-slate-950 text-xs shadow">
                  STAGE 0{currentStageInfo.step} OF 07
                </span>
                <span className="text-xs font-mono text-primary font-bold bg-cyan-950/60 px-3 py-1 rounded-xl border border-primary/20">
                  {currentStageInfo.tech}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                {currentStageInfo.title}
              </h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed pt-1">
                {currentStageInfo.description}
              </p>
            </div>

            <div className="md:col-span-4 p-5 rounded-2xl bg-muted/40 border border-border flex flex-col justify-between font-mono text-xs space-y-4">
              <div className="flex items-center justify-between text-muted-foreground border-b border-border pb-2">
                <span>STAGE LATENCY</span>
                <span className="font-bold text-primary">&lt; 8.2 ms</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground border-b border-border pb-2">
                <span>CONCURRENCY</span>
                <span className="font-bold text-blue-500 dark:text-blue-400">Multi-Threaded WAL</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>SECURITY LEVEL</span>
                <span className="font-bold text-foreground">ISO 22000 Air-Gapped</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Core Enterprise Capabilities Showcase */}
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">
            ENTERPRISE ARCHITECTURAL PILLARS
          </span>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Why Top Industrial Food Manufacturers Choose FreshVision AI
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-muted/30 border border-border hover:border-primary/30 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl group"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                    {cap.title}
                  </h3>
                  <Badge label={cap.badge} variant={cap.variant} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>VERIFIED COMPLIANCE</span>
                <span className="text-primary font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE ENGINE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Stack & Compliance Standards Grid */}
      <Card title="Industrial Architecture & Compliance Matrix" subtitle="Strict adherence to global food safety and cryptographic security mandates">
        <div className="grid gap-6 md:grid-cols-3 font-mono text-xs pt-2">
          <div className="p-5 rounded-2xl bg-background border border-border space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold uppercase text-[11px] border-b border-border pb-2.5">
              <Server className="h-4 w-4" />
              <span>Optical Vision &amp; Hardware</span>
            </div>
            <ul className="space-y-2.5 text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> 60 FPS High-Speed Belt Ingestion</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Multi-Spectral &amp; NIR Frame Support</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> CLAHE Chromatic Normalization</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> GrabCut Foreground Extraction</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border space-y-3">
            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-bold uppercase text-[11px] border-b border-border pb-2.5">
              <Cpu className="h-4 w-4" />
              <span>AI &amp; Mathematical Grading</span>
            </div>
            <ul className="space-y-2.5 text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" /> Multi-Item Instance Segmentation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" /> HSV Browning &amp; Rot Lesion Mapping</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" /> GLCM Spatial Texture Variance</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" /> Thermal Shelf-Life Kinetics Model</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold uppercase text-[11px] border-b border-border pb-2.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Food Safety &amp; Audit Security</span>
            </div>
            <ul className="space-y-2.5 text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> ISO 22000 Food Safety Standards</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> HACCP Automated Quarantine Routing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> SHA-256 Immutable WAL Sealing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" /> PDF Cryptographic QR Certificates</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
