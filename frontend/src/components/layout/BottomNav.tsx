import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Scan, History, BarChart3, Settings } from 'lucide-react';
import { useI18nStore } from '../../store/i18nStore';

export const BottomNav: React.FC = () => {
  const { t } = useI18nStore();

  const navItems = [
    { name: t('overviewConsole', 'Home'), path: '/', icon: LayoutDashboard },
    { name: t('dashboard', 'Market'), path: '/dashboard', icon: BarChart3 },
    { name: t('launchInspector', 'Scan'), path: '/upload', icon: Scan, isPrimary: true },
    { name: t('auditHistory', 'History'), path: '/history', icon: History },
    { name: t('systemSettings', 'Settings'), path: '/settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`${
                      item.isPrimary
                        ? 'bg-primary text-primary-foreground p-3 rounded-full -mt-6 shadow-md border-[4px] border-background'
                        : `p-1.5 rounded-xl ${isActive ? 'bg-accent text-accent-foreground' : ''}`
                    }`}
                  >
                    <Icon className={`${item.isPrimary ? 'h-5 w-5' : 'h-[20px] w-[20px]'}`} strokeWidth={isActive || item.isPrimary ? 2.5 : 2} />
                  </div>
                  {!item.isPrimary && (
                    <span className={`text-[10px] tracking-wide transition-all ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
