import React from 'react';

interface Props {
  onBack?: () => void;
  onHome?: () => void;
}

export const AndroidNavigationBar: React.FC<Props> = ({ onBack, onHome }) => {
  return (
    <div className="w-full bg-slate-900 border-t border-slate-800/80 py-2.5 flex items-center justify-around text-slate-400 select-none z-30">
      {/* Android Back Icon */}
      <button
        onClick={onBack}
        aria-label="Android Back"
        className="p-1.5 active:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </button>

      {/* Android Home Gesture Pill / Button */}
      <button
        onClick={onHome}
        aria-label="Android Home"
        className="w-16 h-1.5 bg-slate-500 rounded-full active:bg-emerald-400 hover:bg-slate-300 transition-colors"
      />

      {/* Android Recents / Overview Icon */}
      <button
        aria-label="Android Recents"
        className="p-1.5 active:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white opacity-75"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>
    </div>
  );
};
