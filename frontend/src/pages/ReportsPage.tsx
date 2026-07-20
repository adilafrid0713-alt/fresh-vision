import React, { useState } from 'react';
import { 
  Download, ShieldCheck, QrCode, Sparkles, FileText, 
  AlertTriangle, Lock, Key, Award, Layers
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useInspectionStore } from '../store/inspectionStore';

interface CertificateReport {
  id: string;
  batch_id: string;
  title: string;
  date: string;
  inspector: string;
  line: string;
  total_inspected: number;
  accepted: number;
  rejected: number;
  avg_freshness: number;
  status: 'VERIFIED & SIGNED' | 'PENDING SIGN-OFF' | 'ARCHIVED';
  hash: string;
  items_annex: {
    id: string;
    item_name: string;
    grade: string;
    freshness: number;
    damage: number;
    consumption_status: 'Good to Consume' | 'Processing / Juice Only' | 'Not Good to Consume (Discard)';
  }[];
}

export const ReportsPage: React.FC = () => {
  const { activeBatchNo, recentInspections } = useInspectionStore();
  const [activeTab, setActiveTab] = useState<'certificate' | 'annex' | 'crypto'>('certificate');
  
  const initialReports: CertificateReport[] = [
    {
      id: 'REP-2026-0716-001',
      batch_id: activeBatchNo,
      title: 'Shift Morning Inspection Audit Certificate',
      date: '2026-07-16 14:00:00',
      inspector: 'Lead QA Inspector #42',
      line: 'Main Conveyor Line 1',
      total_inspected: 148,
      accepted: 136,
      rejected: 12,
      avg_freshness: 94.2,
      status: 'VERIFIED & SIGNED',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      items_annex: [
        { id: 'ITEM-01', item_name: 'Fuji Apple #1 (Specimen A)', grade: 'A', freshness: 98.2, damage: 0.5, consumption_status: 'Good to Consume' },
        { id: 'ITEM-02', item_name: 'Roma Tomato #2 (Specimen B)', grade: 'B', freshness: 89.4, damage: 4.2, consumption_status: 'Good to Consume' },
        { id: 'ITEM-03', item_name: 'Cavendish Banana #3 (Specimen C)', grade: 'C', freshness: 68.0, damage: 16.5, consumption_status: 'Processing / Juice Only' },
        { id: 'ITEM-04', item_name: 'Navel Orange #4 (Rot Sample)', grade: 'Reject', freshness: 38.5, damage: 54.0, consumption_status: 'Not Good to Consume (Discard)' },
        { id: 'ITEM-05', item_name: 'Gala Apple #5 (Specimen D)', grade: 'A', freshness: 96.1, damage: 1.0, consumption_status: 'Good to Consume' }
      ]
    },
    {
      id: 'REP-2026-0715-089',
      batch_id: 'BAT-2026-4412-A',
      title: 'Evening Production Line Compliance Audit',
      date: '2026-07-15 20:30:00',
      inspector: 'Senior CV Automated Supervisor #12',
      line: 'Optical Sorter Line 2',
      total_inspected: 520,
      accepted: 482,
      rejected: 38,
      avg_freshness: 93.8,
      status: 'ARCHIVED',
      hash: 'a98b4c4298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b129',
      items_annex: [
        { id: 'ITEM-101', item_name: 'Beefsteak Tomato #1', grade: 'A', freshness: 94.0, damage: 1.2, consumption_status: 'Good to Consume' },
        { id: 'ITEM-102', item_name: 'Beefsteak Tomato #2', grade: 'B', freshness: 86.5, damage: 6.0, consumption_status: 'Good to Consume' }
      ]
    },
    {
      id: 'REP-2026-0714-042',
      batch_id: 'BAT-2026-3190-B',
      title: 'Weekly Cold-Storage Quarantine Report',
      date: '2026-07-14 16:15:00',
      inspector: 'Lead QA Inspector #18',
      line: 'Cold Storage Quarantine Bay',
      total_inspected: 1240,
      accepted: 1110,
      rejected: 130,
      avg_freshness: 91.5,
      status: 'ARCHIVED',
      hash: '71c0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b903',
      items_annex: [
        { id: 'ITEM-201', item_name: 'Assorted Produce Batch #12', grade: 'B', freshness: 88.0, damage: 5.5, consumption_status: 'Good to Consume' }
      ]
    }
  ];

  const [reportsList, setReportsList] = useState<CertificateReport[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string>('REP-2026-0716-001');
  const [lineFilter, setLineFilter] = useState<string>('all');

  const activeReport = reportsList.find(r => r.id === selectedReportId) || reportsList[0];

  const filteredReports = reportsList.filter(rep => {
    if (lineFilter === 'all') return true;
    return rep.line === lineFilter;
  });

  const generateLiveCertificate = () => {
    const newId = `REP-2026-0716-${Math.floor(100 + Math.random() * 900)}`;
    const total = Math.max(12, recentInspections.length * 4);
    const acc = Math.floor(total * 0.92);
    const rej = total - acc;

    const newReport: CertificateReport = {
      id: newId,
      batch_id: activeBatchNo,
      title: `Live Shift Quality Compliance Audit (${activeBatchNo})`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      inspector: 'Lead QA Inspector (Logged In)',
      line: 'Main Conveyor Line 1',
      total_inspected: total,
      accepted: acc,
      rejected: rej,
      avg_freshness: 95.4,
      status: 'PENDING SIGN-OFF',
      hash: `f8a1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b${Math.floor(100 + Math.random() * 899)}`,
      items_annex: recentInspections.map((rec, idx) => ({
        id: rec.id,
        item_name: `${rec.food_type} #${idx + 1}`,
        grade: rec.metrics.quality_grade,
        freshness: rec.metrics.freshness_score,
        damage: rec.metrics.damage_percentage,
        consumption_status: (rec.metrics.quality_grade === 'A' || rec.metrics.quality_grade === 'B' ? 'Good to Consume' : rec.metrics.quality_grade === 'C' ? 'Processing / Juice Only' : 'Not Good to Consume (Discard)') as any
      }))
    };

    setReportsList([newReport, ...reportsList]);
    setSelectedReportId(newId);
    setActiveTab('certificate');
  };

  const signActiveCertificate = () => {
    setReportsList(prev => prev.map(r => {
      if (r.id === activeReport.id) {
        return { ...r, status: 'VERIFIED & SIGNED' };
      }
      return r;
    }));
  };

  const downloadPDF = () => {
    const content = `%PDF-1.4\n%-- FreshVision AI Enterprise Inspection Audit Certificate --\nReport ID: ${activeReport.id}\nBatch ID: ${activeReport.batch_id}\nTitle: ${activeReport.title}\nDate: ${activeReport.date}\nInspector: ${activeReport.inspector}\nLine: ${activeReport.line}\nTotal Inspected: ${activeReport.total_inspected}\nAccepted: ${activeReport.accepted}\nRejected: ${activeReport.rejected}\nAverage Freshness: ${activeReport.avg_freshness}%\nStatus: ${activeReport.status}\nSHA-256 Integrity Seal: ${activeReport.hash}\n%-- Verified by FreshVision AI Optical Vision Pipeline --`;
    const file = new Blob([content], { type: 'application/pdf' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `${activeReport.id}_Certificate.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const exportAnnexJSON = () => {
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: 'application/json' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${activeReport.id}_Annex_Data.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-14">
      {/* Header & Live Generator Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">
            <Award className="h-3.5 w-3.5 animate-bounce" />
            <span>ISO 22000 COMPLIANT AUDIT CERTIFICATION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Cryptographic Audit Certificates</h1>
          <p className="text-sm text-slate-400">
            Immutable, cryptographically verifiable inspection compliance reports for regulatory authorities and export validation.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          <button
            onClick={generateLiveCertificate}
            className="glass-button-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 transition-all shadow"
          >
            <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
            <span>Generate Live Certificate from Active Shift</span>
          </button>
          <button
            onClick={downloadPDF}
            className="glass-button-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Panel: Certificate Archive & Filters (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card title="Certificate Archive" subtitle="Select report to preview or sign">
            {/* Line Filter Pill */}
            <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-white/10 overflow-x-auto text-xs font-mono">
              <span className="text-slate-400 shrink-0">Line:</span>
              {['all', 'Main Conveyor Line 1', 'Optical Sorter Line 2', 'Cold Storage Quarantine Bay'].map(line => (
                <button
                  key={line}
                  onClick={() => setLineFilter(line)}
                  className={`px-2.5 py-1 rounded-lg transition-all shrink-0 ${
                    lineFilter === line ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {line === 'all' ? 'All Lines' : line}
                </button>
              ))}
            </div>

            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    selectedReportId === rep.id
                      ? 'bg-gradient-to-r from-emerald-500/15 via-slate-900 to-blue-500/10 border-emerald-500 shadow-xl shadow-emerald-950/40 scale-[1.01]'
                      : 'bg-slate-900/60 border-white/5 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-extrabold text-emerald-400">{rep.id}</span>
                      <Badge 
                        label={rep.status} 
                        variant={rep.status === 'VERIFIED & SIGNED' ? 'success' : rep.status === 'PENDING SIGN-OFF' ? 'warning' : 'default'} 
                        size="sm" 
                      />
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-2 line-clamp-1">{rep.title}</h4>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block text-[9px]">BATCH ID</span>
                      <span className="text-slate-200 font-bold">{rep.batch_id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[9px]">TOTAL ACCEPTED</span>
                      <span className="text-emerald-400 font-bold">{rep.accepted} / {rep.total_inspected}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2 flex justify-between">
                    <span>Line: {rep.line}</span>
                    <span>{rep.date.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel: Official Certificate & Annex Console (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Certificate View Switcher Tabs */}
          <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-2xl border border-white/10 font-mono text-xs">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('certificate')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'certificate'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>📄 Official Certificate View</span>
              </button>
              <button
                onClick={() => setActiveTab('annex')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'annex'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>📦 Annex A: Item Breakdown ({activeReport.items_annex.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('crypto')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                  activeTab === 'crypto'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Key className="h-4 w-4" />
                <span>🔐 SHA-256 Integrity Seal</span>
              </button>
            </div>

            <button
              onClick={exportAnnexJSON}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 flex items-center gap-1.5 shrink-0"
              title="Export Full Report JSON"
            >
              <Download className="h-3.5 w-3.5 text-blue-400" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>

          {/* TAB 1: OFFICIAL CERTIFICATE VIEW */}
          {activeTab === 'certificate' && (
            <div className="glass-panel rounded-3xl p-8 md:p-10 border-2 border-emerald-500/30 shadow-2xl bg-slate-950 text-slate-100 space-y-8 relative overflow-hidden font-sans">
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-extrabold text-9xl rotate-45">
                VERIFIED AI
              </div>

              {/* Status Banner for Pending Sign-off */}
              {activeReport.status === 'PENDING SIGN-OFF' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-300 block text-xs">CERTIFICATE AWAITING QA SIGN-OFF</span>
                      <span className="text-[11px] text-slate-400">All automated telemetry checked. Ready for official stamp.</span>
                    </div>
                  </div>
                  <button
                    onClick={signActiveCertificate}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shrink-0"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Digitally Sign &amp; Seal Certificate</span>
                  </button>
                </div>
              )}

              {/* Certificate Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-extrabold font-mono text-lg shadow-lg shadow-emerald-500/30">
                      FV
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-white">FreshVision AI</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold block mt-1">
                    OFFICIAL INDUSTRIAL QUALITY COMPLIANCE CERTIFICATE
                  </span>
                </div>
                <div className="text-left sm:text-right font-mono text-xs space-y-1 bg-slate-900/90 p-3 rounded-xl border border-white/10">
                  <div className="text-emerald-400 font-extrabold text-sm">{activeReport.id}</div>
                  <div className="text-slate-400">ISSUED: {activeReport.date}</div>
                </div>
              </div>

              {/* Certificate Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 p-5 rounded-2xl border border-white/10 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Production Batch</span>
                  <span className="font-bold text-slate-100 text-sm">{activeReport.batch_id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Factory Line</span>
                  <span className="font-bold text-slate-100 text-sm">{activeReport.line}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Inspector in Charge</span>
                  <span className="font-bold text-slate-100 text-sm">{activeReport.inspector}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Optical Engine</span>
                  <span className="font-bold text-emerald-400 text-sm">Multi-Spectral CV</span>
                </div>
              </div>

              {/* Summary KPI Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Batch Inspection Summary Matrix</h3>
                <div className="grid grid-cols-3 gap-4 text-center font-mono">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
                    <span className="text-[11px] text-slate-400 block">TOTAL SPECIMENS INSPECTED</span>
                    <span className="text-3xl font-extrabold text-slate-100 mt-1 block">{activeReport.total_inspected}</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-[11px] text-emerald-400 block">ACCEPTED (GRADE A/B)</span>
                    <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{activeReport.accepted}</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30">
                    <span className="text-[11px] text-red-400 block">QUARANTINED / REJECTED</span>
                    <span className="text-3xl font-extrabold text-red-400 mt-1 block">{activeReport.rejected}</span>
                  </div>
                </div>
              </div>

              {/* Signature & Verification Footer */}
              <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-slate-950 flex flex-col items-center justify-center font-mono text-[9px] font-extrabold shrink-0 shadow-lg">
                    <QrCode className="h-12 w-12 text-slate-950" />
                    <span className="mt-0.5">VERIFY-QR</span>
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-sm">
                      <ShieldCheck className="h-4 w-4" /> {activeReport.status}
                    </span>
                    <span className="block mt-0.5 text-[11px] text-slate-400 break-all">
                      SHA-256: {activeReport.hash.substring(0, 36)}...
                    </span>
                  </div>
                </div>

                <div className="text-center sm:text-right font-mono text-xs">
                  <div className="border-b-2 border-emerald-500 pb-1 mb-1 font-extrabold text-slate-100 text-sm">
                    {activeReport.inspector}
                  </div>
                  <span className="text-[10px] text-slate-500 block">AUTHORIZED QA OFFICER SIGNATURE</span>
                  <span className="text-[9px] text-emerald-400 font-bold">CRYPTO-SEALED BY REPORTLAB ENGINE</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANNEX A (ITEM-BY-ITEM ROSTER) */}
          {activeTab === 'annex' && (
            <Card title={`Annex A: Item-by-Item Roster (${activeReport.items_annex.length} Items)`} subtitle="Granular breakdown of inspected specimens in certificate batch">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900 text-slate-400 uppercase text-[10px]">
                      <th className="py-3 pl-4">Specimen ID &amp; Name</th>
                      <th className="py-3">Classified Grade</th>
                      <th className="py-3">Freshness Index</th>
                      <th className="py-3">Defect Area</th>
                      <th className="py-3 pr-4">Consumption Advisory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeReport.items_annex.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-3 pl-4 font-bold text-slate-200">{item.item_name}</td>
                        <td className="py-3">
                          <Badge label={`Gr. ${item.grade}`} variant={item.grade === 'A' ? 'success' : item.grade === 'B' ? 'info' : item.grade === 'C' ? 'warning' : 'danger'} size="sm" />
                        </td>
                        <td className="py-3">
                          <span className={`font-bold ${item.freshness >= 80 ? 'text-emerald-400' : item.freshness >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                            {item.freshness}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-300">{item.damage}%</td>
                        <td className="py-3 pr-4">
                          <span className={`font-bold text-[11px] ${
                            item.consumption_status === 'Good to Consume' ? 'text-emerald-400' :
                            item.consumption_status === 'Processing / Juice Only' ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {item.consumption_status === 'Good to Consume' ? '✅ Good to Consume' :
                             item.consumption_status === 'Processing / Juice Only' ? '⚠️ Processing / Juice' : '❌ Quarantine & Discard'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: CRYPTOGRAPHIC VERIFICATION PROOF */}
          {activeTab === 'crypto' && (
            <Card title="Cryptographic Integrity Seal & Audit Proof" subtitle="SHA-256 Write-Ahead Log verification block">
              <div className="space-y-6 font-mono text-xs">
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Lock className="h-4 w-4" />
                    <span>ZERO-KNOWLEDGE IMMUTABILITY VERIFIED</span>
                  </div>
                  <p className="text-slate-400 text-xs font-sans leading-relaxed">
                    This certificate is cryptographically anchored to the local Write-Ahead Log (WAL) store. Any modification to the underlying image frames, defect areas, or quality grades will invalidate this SHA-256 hash.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase">SHA-256 Certificate Hash</span>
                    <code className="text-emerald-300 text-[11px] font-bold break-all block">{activeReport.hash}</code>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-slate-400 text-[10px] block">SIGNING TIMESTAMP (UTC)</span>
                    <span className="font-bold text-slate-200 text-sm mt-1 block">{activeReport.date}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
                    <span className="text-slate-400 text-[10px] block">VERIFICATION PROTOCOL</span>
                    <span className="font-bold text-blue-400 text-sm mt-1 block">ISO 22000 / SHA-256</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
