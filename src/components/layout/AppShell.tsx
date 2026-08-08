import React from 'react';
import { DemoBanner } from './DemoBanner';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../../store/useAppStore';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { loadInitialData, skus } = useAppStore();

  React.useEffect(() => {
    if (skus.length === 0) {
      loadInitialData();
    }
  }, [skus.length, loadInitialData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased selection:bg-green-100 selection:text-green-900">
      <DemoBanner />
      <TopBar />
      <Sidebar />
      <main className="lg:ml-64 pt-[88px] min-h-screen p-3 sm:p-6 lg:p-8 pb-16 transition-all duration-300 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
