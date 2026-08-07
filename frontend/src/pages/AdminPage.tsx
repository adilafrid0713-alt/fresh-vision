import React, { useState } from 'react';
import { Users, ShieldCheck, Cpu, HardDrive, Activity, Trash2, Server } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import { motion } from 'framer-motion';

export const AdminPage: React.FC = () => {
  const { addToast } = useToastStore();

  const [usersList, setUsersList] = useState([
    { id: 'USR-0001', name: 'Chief Quality Inspector', email: 'admin@freshvision.ai', role: 'SuperAdmin', created: '2026-01-10' },
    { id: 'USR-0002', name: 'Plant Operator Alpha', email: 'operator.line1@freshvision.ai', role: 'Quality Inspector', created: '2026-03-14' },
    { id: 'USR-0003', name: 'Compliance Auditor', email: 'auditor@freshvision.ai', role: 'Compliance Auditor', created: '2026-05-20' },
    { id: 'USR-0004', name: 'Logistics Lead', email: 'logistics@freshvision.ai', role: 'Quality Inspector', created: '2026-06-02' },
  ]);

  const [auditLogs] = useState([
    { id: 'LOG-109', action: 'BATCH_EXPORT_EXCEL', user: 'admin@freshvision.ai', time: '10:42 AM', details: 'Exported 142 inspection logs' },
    { id: 'LOG-108', action: 'LIVE_CAMERA_SCAN', user: 'operator.line1@freshvision.ai', time: '09:15 AM', details: 'Optical camera frame analyzed Grade A' },
    { id: 'LOG-107', action: 'USER_LOGIN', user: 'admin@freshvision.ai', time: '08:30 AM', details: 'Authenticated via JWT token' },
  ]);

  const handleDeleteUser = (id: string) => {
    setUsersList(usersList.filter((u) => u.id !== id));
    addToast({
      type: 'warning',
      title: 'User Account Revoked',
      message: `User ${id} has been removed from enterprise registry.`,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
              SUPERADMIN CONTROL CONSOLE
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-mono mt-1">
            Enterprise User Management • API Telemetry • System Infrastructure
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold flex items-center gap-2 shadow-lg">
            <Server className="h-4 w-4 text-cyan-400 animate-pulse" /> SYSTEM UPTIME: 99.98%
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-xl backdrop-blur-xl space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Registered Users</span>
            <Users className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">{usersList.length}</div>
          <div className="text-[11px] text-cyan-400 font-mono">100% Active Licences</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/30 shadow-xl backdrop-blur-xl space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Gemini API Calls</span>
            <Cpu className="h-5 w-5 text-blue-400 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">1,842</div>
          <div className="text-[11px] text-blue-400 font-mono">Rate Limit: 300 req / 15m</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 shadow-xl backdrop-blur-xl space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Storage Volume</span>
            <HardDrive className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">24.8 GB</div>
          <div className="text-[11px] text-purple-400 font-mono">SQLite DB + Images</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl bg-slate-900/80 border border-teal-500/30 shadow-xl backdrop-blur-xl space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Air-Gap Protection</span>
            <ShieldCheck className="h-5 w-5 text-teal-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-100">SECURE</div>
          <div className="text-[11px] text-teal-400 font-mono">JWT RSA-256 Validated</div>
        </motion.div>
      </div>

      {/* User Management Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100 font-mono">
                ENTERPRISE OPERATOR REGISTRY
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Manage roles, active sessions, and security access
              </p>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono uppercase">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Name & Role</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-cyan-400">{u.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-100">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.role}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{u.email}</td>
                  <td className="py-3.5 px-4 text-slate-400">{u.created}</td>
                  <td className="py-3.5 px-4 text-right">
                    {u.role !== 'SuperAdmin' ? (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all"
                        title="Revoke Access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                        PROTECTED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col divide-y divide-white/5 font-mono">
            {usersList.map((u) => (
              <div key={u.id} className="p-4 space-y-3 hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-cyan-400 text-xs">{u.id}</div>
                    <div className="font-bold text-slate-100 text-sm mt-0.5">{u.name}</div>
                  </div>
                  {u.role !== 'SuperAdmin' ? (
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-transparent transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/30">
                      PROTECTED
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2 rounded border border-white/5">
                    <span className="text-slate-500 block">Role</span>
                    <span className="text-slate-300 font-bold">{u.role}</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-white/5">
                    <span className="text-slate-500 block">Created</span>
                    <span className="text-slate-300">{u.created}</span>
                  </div>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-white/5 text-[11px]">
                  <span className="text-slate-500 block">Email Address</span>
                  <span className="text-slate-300">{u.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-100 font-mono flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" /> SYSTEM AUDIT LOG FEED
        </h3>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5 font-mono text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold">{log.id}</span>
                <span className="text-slate-200 font-semibold">{log.action}</span>
                <span className="text-slate-400">by {log.user}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span>{log.details}</span>
                <span className="text-slate-500">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
