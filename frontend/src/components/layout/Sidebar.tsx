import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  BarChart3, 
  FileText, 
  Settings, 
  Scan, 
  ShieldCheck, 
  Cpu,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  ShieldAlert,
  ShoppingBag,
  ImageIcon
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useInspectionStore } from '../../store/inspectionStore';
import { useI18nStore } from '../../store/i18nStore';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useThemeStore();
  const { activeBatchNo } = useInspectionStore();
  const { t } = useI18nStore();

  const navItems = [
    { name: t('overviewConsole', 'Overview'), path: '/', icon: LayoutDashboard },
    { name: t('launchInspector', 'AI Inspector'), path: '/upload', icon: Scan, highlight: true },
    { name: 'Fresh Market', path: '/market', icon: ShoppingBag },
    { name: 'Media Library', path: '/media', icon: ImageIcon },
    { name: t('dashboard', 'Dashboard'), path: '/dashboard', icon: BarChart3 },
    { name: t('auditHistory', 'History'), path: '/history', icon: History },
    { name: t('pdfCertificates', 'Reports'), path: '/reports', icon: FileText },
    { name: t('adminPanel', 'Admin Panel'), path: '/admin', icon: ShieldAlert },
    { name: t('systemSettings', 'Settings'), path: '/settings', icon: Settings },
    { name: t('operatorSignIn', 'Sign In'), path: '/login', icon: KeyRound },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r bg-card hidden md:flex flex-col justify-between ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Scan className="h-4 w-4 text-primary-foreground font-extrabold" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight text-sm text-foreground">
                  FreshVision
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase">
                  Enterprise
                </span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors group relative ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                  } ${!sidebarOpen ? 'justify-center px-2' : ''}`
                }
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
                    item.highlight ? 'text-blue-500' : ''
                  }`}
                />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="border-t p-4 bg-card">
        {sidebarOpen ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Cpu className="h-3 w-3" /> Core
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium bg-green-500/10 px-1.5 py-0.5 rounded">
                ONLINE
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t">
              <span>BATCH:</span>
              <span className="font-mono text-foreground">{activeBatchNo}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="System Online">
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>
    </aside>
  );
};
