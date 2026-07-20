import React, { useState } from 'react';
import { Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { useSettingsStore } from '../store/settingsStore';

export const SettingsPage: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useSettingsStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const categories = ['AI Pipeline', 'Alerts', 'Factory Line', 'Reporting'] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Platform Configuration &amp; Sensitivity</h1>
          <p className="text-xs text-slate-400">Tune automated feature detection thresholds, quality grading sensitivity, and conveyor line IDs</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetSettings}
            className="glass-button-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="glass-button-primary flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-3 shadow-lg shadow-emerald-950/50 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>System configuration successfully applied to vision processing engine.</span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categorySettings = settings.filter((s) => s.category === category);
          if (categorySettings.length === 0) return null;

          return (
            <Card key={category} title={`${category} Parameters`} subtitle={`Adjust runtime telemetry for ${category.toLowerCase()}`}>
              <div className="space-y-5 divide-y divide-white/5">
                {categorySettings.map((setting) => (
                  <div key={setting.key} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="max-w-md">
                      <span className="text-sm font-semibold text-slate-200 font-mono">{setting.key}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{setting.description}</p>
                    </div>

                    <div className="w-full sm:w-48 shrink-0">
                      {typeof setting.value === 'boolean' ? (
                        <button
                          onClick={() => updateSetting(setting.key, !setting.value)}
                          className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
                            setting.value
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                              : 'bg-slate-900 text-slate-400 border-white/10'
                          }`}
                        >
                          {setting.value ? 'ENABLED' : 'DISABLED'}
                        </button>
                      ) : typeof setting.value === 'number' ? (
                        <div className="space-y-1">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={setting.value}
                            onChange={(e) => updateSetting(setting.key, parseFloat(e.target.value))}
                            className="w-full accent-emerald-500 cursor-pointer bg-slate-800 rounded-lg h-2"
                          />
                          <div className="text-right font-mono text-xs font-bold text-emerald-400">
                            {setting.value}
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={setting.value as string}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
