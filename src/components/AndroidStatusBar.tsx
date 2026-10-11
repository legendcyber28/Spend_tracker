import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, WifiOff } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="w-full bg-slate-900 text-slate-200 px-5 pt-2 pb-1.5 flex items-center justify-between text-xs select-none font-medium tracking-tight border-b border-slate-800/60 z-30">
      <div className="flex items-center gap-1.5 font-semibold text-[13px] text-white">
        <span>{time || '10:00'}</span>
        {!isOnline && (
          <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 ml-1">
            <WifiOff className="w-2.5 h-2.5" />
            Offline
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-slate-300">
        <Signal className="w-3.5 h-3.5" />
        {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
        <div className="flex items-center gap-0.5">
          <span className="text-[11px] font-mono">88%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
