import React, { useState } from 'react';
import { Lock, Fingerprint, Delete } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PinLockScreen: React.FC = () => {
  const { unlockWithPin, unlockWithBiometric, settings } = useApp();
  const [enteredPin, setEnteredPin] = useState('');
  const [isError, setIsError] = useState(false);

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    const next = enteredPin + digit;
    setEnteredPin(next);

    if (next.length === 4) {
      setTimeout(() => {
        const success = unlockWithPin(next);
        if (!success) {
          setIsError(true);
          setTimeout(() => {
            setEnteredPin('');
            setIsError(false);
          }, 600);
        }
      }, 100);
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between py-12 px-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col items-center mt-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Expense Tracker</h2>
        <p className="text-sm text-slate-400 mt-1">Enter your 4-digit security PIN</p>

        {/* PIN Dots */}
        <div className={`flex items-center gap-4 mt-8 ${isError ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = enteredPin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-emerald-400 scale-110 shadow-md shadow-emerald-500/50'
                    : 'bg-slate-800 border border-slate-700'
                } ${isError ? 'bg-rose-500 border-rose-400' : ''}`}
              />
            );
          })}
        </div>
        {isError && <p className="text-xs text-rose-400 font-medium mt-3">Incorrect PIN. Try again.</p>}
      </div>

      {/* Number Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleDigit(String(num))}
            className="w-18 h-18 mx-auto rounded-full bg-slate-900 border border-slate-800 text-white text-2xl font-medium flex items-center justify-center active:bg-slate-800 active:scale-95 transition"
          >
            {num}
          </button>
        ))}

        {/* Biometric Button */}
        <button
          onClick={unlockWithBiometric}
          className="w-18 h-18 mx-auto rounded-full bg-slate-900/50 border border-slate-800/80 text-emerald-400 flex items-center justify-center active:bg-slate-800 active:scale-95 transition"
          title="Fingerprint Unlock"
        >
          <Fingerprint className="w-7 h-7" />
        </button>

        {/* Zero */}
        <button
          onClick={() => handleDigit('0')}
          className="w-18 h-18 mx-auto rounded-full bg-slate-900 border border-slate-800 text-white text-2xl font-medium flex items-center justify-center active:bg-slate-800 active:scale-95 transition"
        >
          0
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="w-18 h-18 mx-auto rounded-full bg-slate-900/50 border border-slate-800/80 text-slate-400 flex items-center justify-center active:bg-slate-800 active:scale-95 transition"
          aria-label="Delete"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      <div className="text-center text-xs text-slate-500">
        Secured with Local Device Encryption
      </div>
    </div>
  );
};
