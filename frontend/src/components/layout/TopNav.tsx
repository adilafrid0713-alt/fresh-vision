import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogIn, LogOut, Globe, Video, QrCode, Search, Moon, Sun, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useI18nStore } from '../../store/i18nStore';
import { useThemeStore } from '../../store/themeStore';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../../i18n/translations';
import { LiveCameraModal } from '../inspection/LiveCameraModal';
import { BarcodeScannerModal } from '../inspection/BarcodeScannerModal';
import { Button } from '../ui/Button';

export const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();
  const { language, setLanguage } = useI18nStore();
  const { themeMode, setThemeMode, toggleSidebar } = useThemeStore();

  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);

  const triggerGlobalSearch = () => {
    const event = new CustomEvent('open-global-search');
    window.dispatchEvent(event);
  };

  return (
    <div className="sticky top-0 z-30 flex w-full border-b bg-background/80 backdrop-blur-md">
      <header className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCameraModalOpen(true)} className="h-8 gap-2 hidden xl:flex">
              <Video className="h-4 w-4" />
              <span>Camera</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScannerModalOpen(true)} className="h-8 gap-2 hidden xl:flex">
              <QrCode className="h-4 w-4" />
              <span>Scan QR</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={triggerGlobalSearch}
            className="flex items-center gap-2 bg-muted/50 hover:bg-muted border border-border px-3 py-1.5 rounded-md text-sm text-muted-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline-block">Search...</span>
            <kbd className="hidden sm:inline-block bg-background text-[10px] px-1.5 py-0.5 rounded border ml-2">Ctrl+K</kbd>
          </button>

          <div className="hidden sm:flex items-center gap-1 border border-border px-2 py-1 rounded-md text-sm bg-muted/30 hover:bg-muted/50 transition-colors">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select
              aria-label="Select Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer border-none py-0.5"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-background text-foreground">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle Theme"
            title="Toggle Theme"
          >
            {themeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-2 pl-2 sm:pl-4 sm:border-l border-border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden md:flex flex-col text-left mr-2">
                <span className="text-xs font-semibold leading-none">{user.role}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/login')} className="h-8 px-3 gap-2 ml-2">
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}

          <button aria-label="Notifications" className="relative p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors hidden sm:block">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </button>
        </div>
      </header>

      <LiveCameraModal isOpen={cameraModalOpen} onClose={() => setCameraModalOpen(false)} />
      <BarcodeScannerModal isOpen={scannerModalOpen} onClose={() => setScannerModalOpen(false)} />
    </div>
  );
};
