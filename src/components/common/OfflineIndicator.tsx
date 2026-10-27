import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Status koneksi offline"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 flex items-center justify-between gap-3 rounded-xl bg-amber-600 px-4 py-2.5 text-xs md:text-sm font-medium text-white shadow-xl shadow-amber-900/20 max-w-md animate-fade-in"
    >
      <div className="flex items-center gap-2.5">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>Mode Offline: Membaca dari data cache lokal yang tersimpan.</span>
      </div>
      <span className="shrink-0 w-2 h-2 rounded-full bg-amber-200 animate-pulse" />
    </aside>
  );
};
