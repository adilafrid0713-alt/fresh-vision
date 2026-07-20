import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  BarChart3, 
  FileText, 
  Settings, 
  Info, 
  Scan, 
  ShieldCheck, 
  Cpu,
  ChevronLeft,
  ChevronRight,
  KeyRound
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useInspectionStore } from '../../store/inspectionStore';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useThemeStore();
  const { activeBatchNo } = useInspectionStore();

  const navItems = [
    { name: 'Overview Console', path: '/', icon: LayoutDashboard },
    { name: 'Operator Sign In', path: '/login', icon: KeyRound },
    { name: 'Launch AI Inspector', path: '/upload', icon: Scan, highlight: true },
    { name: 'Market & Line Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Audit History Logs', path: '/history', icon: History },
    { name: 'PDF Certificates', path: '/reports', icon: FileText },
    { name: 'System Settings', path: '/settings', icon: Settings },
    { name: 'About Platform', path: '/about', icon: Info },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r border-white/10 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between shadow-2xl ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 bg-slate-900/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 shadow-lg shadow-emerald-500/30 border border-white/20">
              <Scan className="h-5 w-5 text-slate-950 font-extrabold animate-pulse" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wider text-base text-slate-100 uppercase font-mono">
                    FreshVision
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold tracking-widest uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 w-fit mt-0.5">
                  AI PROD v2.4
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors border border-transparent hover:border-white/10"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        {/* Active Line Badge */}
        {sidebarOpen && (
          <div className="mx-3 my-4 p-3 rounded-xl bg-gradient-to-br from-slate-900/90 to-emerald-950/40 border border-emerald-500/30 shadow-lg shadow-emerald-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] font-mono font-bold text-slate-200">LINE: Main Conveyor 1</span>
                <span className="text-[10px] text-slate-400 font-mono">180 units/min</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-extrabold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-md shadow">
              ONLINE
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-2 space-y-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/25 via-emerald-500/15 to-blue-500/10 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-950/50 font-bold'
                      : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100 border border-transparent hover:border-white/5'
                  } ${!sidebarOpen ? 'justify-center px-2' : ''}`
                }
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    item.highlight ? 'text-emerald-400 font-extrabold animate-pulse' : ''
                  }`}
                />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
                {item.highlight && !sidebarOpen && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="border-t border-white/10 p-3.5 bg-slate-900/60 backdrop-blur-xl">
        {sidebarOpen ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5 text-blue-400 animate-pulse" /> Vision AI Core
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Air-Gapped Security
              </span>
              <span className="text-emerald-400 font-bold">100% SECURE</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>BATCH ID:</span>
              <span className="font-bold text-slate-200">{activeBatchNo}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Enterprise Security Active">
            <ShieldCheck className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};

