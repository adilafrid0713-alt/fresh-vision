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
        return `bg-cyan-500/10 text-cyan-400 border-cyan-500/20 ${glow ? 'shadow-[0_0_15px_rgba(34,211,238,0.2)] border-cyan-400/50' : ''}`;
      case 'warning':
        return `bg-amber-500/10 text-amber-400 border-amber-500/20 ${glow ? 'shadow-[0_0_15px_rgba(245,158,11,0.2)] border-amber-400/50' : ''}`;
      case 'danger':
        return `bg-rose-500/10 text-rose-400 border-rose-500/20 ${glow ? 'shadow-[0_0_15px_rgba(244,63,94,0.2)] border-rose-400/50' : ''}`;
      case 'info':
        return `bg-indigo-500/10 text-indigo-400 border-indigo-500/20 ${glow ? 'shadow-[0_0_15px_rgba(99,102,241,0.2)] border-indigo-400/50' : ''}`;
      case 'premium':
        return `bg-violet-500/10 text-violet-400 border-violet-500/20 ${glow ? 'shadow-[0_0_20px_rgba(139,92,246,0.3)] border-violet-400/50' : ''}`;
      default:
        return 'bg-white/5 text-slate-300 border-white/10 backdrop-blur-md';
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

