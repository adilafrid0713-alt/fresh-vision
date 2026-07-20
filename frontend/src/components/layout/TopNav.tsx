import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Bell, RefreshCw, Layers, User, LogIn, LogOut, Globe, Sparkles } from 'lucide-react';
import { useInspectionStore } from '../../store/inspectionStore';
import { useAuthStore } from '../../store/authStore';

export const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const { activeBatchNo, setActiveBatchNo, selectedFoodTypeHint, setSelectedFoodTypeHint } = useInspectionStore();
  const { user, isLoggedIn, logout } = useAuthStore();

  const foodTypes = [
    'Auto-Detect',
    'Apple',
    'Banana',
    'Orange',
    'Tomato',
    'Potato',
    'Mango',
    'Guava',
    'Carrot',
    'Cucumber',
    'Onion'
  ];

  // Spot prices for ticker preview
  const spotTickerItems = [
    { name: 'Cavendish Banana', code: 'BAN-01', usd: 1.42, change: '+2.9%', up: true },
    { name: 'Fuji Apple Grade A', code: 'APP-02', usd: 2.85, change: '+4.0%', up: true },
    { name: 'Alfonso Mango Premium', code: 'MAN-03', usd: 4.25, change: '+3.7%', up: true },
    { name: 'Roma Tomato Wholesale', code: 'TOM-04', usd: 1.95, change: '-7.1%', up: false },
    { name: 'Hass Avocado Export', code: 'AVO-05', usd: 5.40, change: '+5.9%', up: true },
    { name: 'Red Onion Storage Globe', code: 'ONI-06', usd: 1.35, change: '+3.8%', up: true },
    { name: 'Kochi Pepper & Spice', code: 'SPI-07', usd: 12.80, change: '+1.5%', up: true },
    { name: 'Sweet Corn Raw Kernels', code: 'CRN-08', usd: 1.25, change: '+2.5%', up: true },
  ];

  const generateNewBatch = () => {
    const newNo = `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`;
    setActiveBatchNo(newNo);
  };

  return (
    <div className="sticky top-0 z-30 flex flex-col w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-2xl shadow-2xl">
      {/* Top Command Bar */}
      <header className="flex h-16 w-full items-center justify-between px-6">
        {/* Left: System Telemetry Banner */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-xs font-mono bg-slate-900/90 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.15)] group transition-all hover:border-emerald-500/50">
            <Layers className="h-4 w-4 text-emerald-400 shrink-0 animate-pulse" />
            <span className="text-slate-400 font-medium">ACTIVE BATCH:</span>
            <span className="font-extrabold text-slate-100 tracking-wider">{activeBatchNo}</span>
            <button 
              onClick={generateNewBatch}
              className="ml-1 p-1 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
              title="Generate New Production Batch ID"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-slate-900/90 border border-blue-500/30 px-3.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-400">TARGET CROP:</span>
            <select 
              value={selectedFoodTypeHint}
              onChange={(e) => setSelectedFoodTypeHint(e.target.value)}
              className="bg-transparent text-blue-300 font-bold focus:outline-none cursor-pointer"
            >
              {foodTypes.map((type) => (
                <option key={type} value={type} className="bg-slate-900 text-slate-200">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Security & Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-mono font-bold text-emerald-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>OPTICAL SENSORS: ONLINE</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-500/30 px-3.5 py-1 text-xs font-mono font-bold text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            <span>ISO 22000 • AIR-GAPPED</span>
          </div>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-2.5 bg-slate-900/90 border border-emerald-500/40 rounded-xl px-3.5 py-1.5 shadow-md">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <User className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-extrabold text-slate-100 leading-none">{user.role}</span>
                <span className="text-[10px] font-mono text-slate-400 leading-tight">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="ml-1 text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 px-4 py-2 text-xs font-extrabold text-slate-950 hover:from-emerald-400 hover:to-blue-500 shadow-lg shadow-emerald-500/25 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Operator Sign In</span>
            </button>
          )}

          <button className="relative rounded-xl p-2 bg-slate-900/80 border border-white/10 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </button>
        </div>
      </header>

      {/* Global Agricultural Spot Market Ticker Bar */}
      <div className="h-8 border-t border-white/10 bg-slate-950/90 overflow-hidden flex items-center px-4 font-mono text-[11px] select-none">
        <div className="flex items-center gap-2 shrink-0 bg-slate-900 px-2.5 py-0.5 rounded border border-white/10 mr-4 z-10">
          <Globe className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '12s' }} />
          <span className="font-bold text-emerald-400 uppercase tracking-wider">LIVE GLOBAL SPOT INDEX</span>
        </div>

        <div className="overflow-hidden flex-1 relative">
          <div className="animate-ticker gap-8 text-slate-300">
            {spotTickerItems.concat(spotTickerItems).map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 cursor-pointer hover:text-emerald-300 transition-colors shrink-0"
              >
                <span className="text-slate-400 font-bold">{item.code}:</span>
                <span className="text-slate-100 font-semibold">{item.name}</span>
                <span className="font-bold text-emerald-400">${item.usd.toFixed(2)}/kg</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${item.up ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/80 text-red-400 border border-red-500/30'}`}>
                  {item.change}
                </span>
                <span className="text-slate-600">|</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


