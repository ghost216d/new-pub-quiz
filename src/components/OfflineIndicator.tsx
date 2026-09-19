import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-3 left-3 right-3 md:right-auto md:left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 border-2 border-amber-950 px-3.5 py-2 text-xs font-bold text-white shadow-xl animate-bounce"
    >
      <WifiOff className="w-4 h-4 text-amber-200" />
      <span>Offline Mode Active — Cached questions & local mode are ready!</span>
    </div>
  );
};
