import React, { useEffect, useState } from 'react';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onFinish, 400);
    }, 1200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between py-16 px-6 select-none transition-opacity duration-400 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Animated App Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-2xl shadow-emerald-500/20 flex items-center justify-center transform animate-pulse">
            <img src="/icon.svg" alt="Expense Tracker Logo" className="w-20 h-20 drop-shadow-md" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Expense<span className="text-emerald-400">Tracker</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-medium tracking-wide">
          Simple. Fast. Private.
        </p>

        {/* Android style mini indeterminate loader */}
        <div className="mt-8 w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-emerald-500 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">Android Edition • v1.0.0</p>
      </div>
    </div>
  );
};
