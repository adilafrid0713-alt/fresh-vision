import React from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const AnalyticsPage: React.FC = () => {
  // Multi-dimensional quality metrics for industrial reporting
  const weeklyQualityData = [
    { day: 'Mon', gradeA: 180, gradeB: 45, gradeC: 15, reject: 8 },
    { day: 'Tue', gradeA: 210, gradeB: 38, gradeC: 12, reject: 5 },
    { day: 'Wed', gradeA: 195, gradeB: 52, gradeC: 18, reject: 9 },
    { day: 'Thu', gradeA: 240, gradeB: 40, gradeC: 10, reject: 4 },
    { day: 'Fri', gradeA: 220, gradeB: 48, gradeC: 14, reject: 6 },
    { day: 'Sat', gradeA: 160, gradeB: 30, gradeC: 8, reject: 3 },
    { day: 'Sun', gradeA: 140, gradeB: 25, gradeC: 6, reject: 2 },
  ];

  const radarData = [
    { subject: 'Color Match (HSV)', value: 96, fullMark: 100 },
    { subject: 'Surface Texture (GLCM)', value: 92, fullMark: 100 },
    { subject: 'Defect Absence', value: 94, fullMark: 100 },
    { subject: 'Bounding Box Precision', value: 99, fullMark: 100 },
    { subject: 'Inference Latency (<50ms)', value: 98, fullMark: 100 },
    { subject: 'Shelf Life Model Accuracy', value: 91, fullMark: 100 },
  ];

  const shelfLifeDistribution = [
    { range: '0-3 Days (Immediate Use)', items: 45 },
    { range: '4-7 Days (Short Term)', items: 120 },
    { range: '8-14 Days (Standard Retail)', items: 480 },
    { range: '15-21 Days (Premium Cold Storage)', items: 620 },
    { range: '22+ Days (Long Export)', items: 310 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Enterprise Analytics &amp; Predictive Insights</h1>
          <p className="text-xs text-slate-400">Deep mathematical correlation of multi-spectral optical features and cold-storage decay rates</p>
        </div>
        <Badge label="VISION ENGINE: OPTICAL-SPECTRAL-v2" variant="info" glow />
      </div>

      {/* Grid 1: Weekly Grade Distribution & Radar */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Weekly Production Quality Matrix" subtitle="Volume breakdown by automated Quality Grade classification" className="lg:col-span-2">
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyQualityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="gradeA" stackId="a" fill="#10b981" name="Grade A (Excellent)" />
                <Bar dataKey="gradeB" stackId="a" fill="#3b82f6" name="Grade B (Good)" />
                <Bar dataKey="gradeC" stackId="a" fill="#f59e0b" name="Grade C (Acceptable)" />
                <Bar dataKey="reject" stackId="a" fill="#ef4444" name="Rejected (Rot/Defect)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Vision Engine Health Radar" subtitle="Algorithm accuracy & efficiency benchmarks">
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={10} />
                <Radar name="AI Health %" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Grid 2: Predictive Shelf Life */}
      <Card title="Predictive Cold-Storage Shelf Life Distribution" subtitle="Estimated operational duration before quality degradation below Grade C threshold">
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={shelfLifeDistribution} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
              <defs>
                <linearGradient id="colorShelf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="items" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorShelf)" name="Total Produce Items" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
