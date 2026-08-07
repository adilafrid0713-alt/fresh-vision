import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
import { useThemeStore } from '../../store/themeStore';
import { AnimatePresence, motion } from 'framer-motion';

export const MainLayout: React.FC = () => {
  const { sidebarOpen } = useThemeStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out flex flex-col md:pl-20 ${
          sidebarOpen ? 'md:pl-64' : ''
        }`}
      >
        <TopNav />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
