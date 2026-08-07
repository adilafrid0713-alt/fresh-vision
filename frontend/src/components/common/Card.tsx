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
      className={`rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden group ${
        hoverEffect ? 'hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-900/20 hover:-translate-y-1' : ''
      } ${
        glow ? 'shadow-[0_0_25px_rgba(139,92,246,0.15)] border-violet-500/20' : ''
      } ${className}`}
    >
      {/* Subtle top reflection line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5 relative z-10">
          <div>
            {title && <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">{title}</h3>}
            {subtitle && <p className="text-[13px] text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

