import React from 'react';
import type { QualityGrade, RiskLevel } from '../../types';

interface BadgeProps {
  label: string | QualityGrade | RiskLevel;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'premium' | 'default';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  glow = false,
  pulse = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return `bg-gradient-to-r from-emerald-950/90 to-teal-950/90 text-emerald-300 border-emerald-500/40 ${glow ? 'shadow-[0_0_15px_rgba(16,185,129,0.45)] border-emerald-400' : ''}`;
      case 'warning':
        return `bg-gradient-to-r from-amber-950/90 to-orange-950/90 text-amber-300 border-amber-500/40 ${glow ? 'shadow-[0_0_15px_rgba(245,158,11,0.45)] border-amber-400' : ''}`;
      case 'danger':
        return `bg-gradient-to-r from-red-950/90 to-rose-950/90 text-red-300 border-red-500/40 ${glow ? 'shadow-[0_0_15px_rgba(239,68,68,0.45)] border-red-400' : ''}`;
      case 'info':
        return `bg-gradient-to-r from-blue-950/90 to-indigo-950/90 text-blue-300 border-blue-500/40 ${glow ? 'shadow-[0_0_15px_rgba(59,130,246,0.45)] border-blue-400' : ''}`;
      case 'premium':
        return `bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 text-emerald-300 border-emerald-400/50 ${glow ? 'shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}`;
      default:
        return 'bg-slate-800/90 text-slate-300 border-slate-700/60 backdrop-blur-md';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[11px] font-bold rounded-md tracking-tight';
      case 'lg':
        return 'px-4 py-1.5 text-sm font-extrabold rounded-lg tracking-wide';
      default:
        return 'px-2.5 py-1 text-xs font-bold rounded-md tracking-tight';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 justify-center border font-mono transition-all duration-200 ${getVariantStyles()} ${getSizeStyles()}`}>
      {pulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping shrink-0" />
      )}
      <span>{label}</span>
    </span>
  );
};

