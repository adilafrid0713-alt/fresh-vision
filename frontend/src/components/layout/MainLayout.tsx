import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useThemeStore } from '../../store/themeStore';

export const MainLayout: React.FC = () => {
  const { sidebarOpen } = useThemeStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        <TopNav />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
