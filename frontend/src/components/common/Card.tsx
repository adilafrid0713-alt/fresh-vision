import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  hoverEffect?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  hoverEffect = false,
  glow = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden group ${
        hoverEffect ? 'hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-950/30 hover:-translate-y-1' : ''
      } ${
        glow ? 'shadow-[0_0_25px_rgba(16,185,129,0.15)] border-emerald-500/30' : ''
      } ${className}`}
    >
      {/* Subtle top reflection line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 relative z-10">
          <div>
            {title && <h3 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

