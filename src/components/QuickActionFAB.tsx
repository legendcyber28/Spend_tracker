import React, { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickActionFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openAddTransaction } = useApp();

  const handleOpenAdd = (type: 'expense' | 'income') => {
    setIsOpen(false);
    openAddTransaction(type);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 transition-opacity"
        />
      )}

      <div className="fixed bottom-20 right-4 sm:right-8 z-40 flex flex-col items-end gap-2.5">
        {/* Speed Dial Options */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-1 animate-in fade-in slide-in-from-bottom-4 duration-150">
            {/* Add Income button */}
            <div className="flex items-center gap-2">
              <span className="bg-slate-900/90 dark:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-md border border-slate-700">
                + Income
              </span>
              <button
                onClick={() => handleOpenAdd('income')}
                className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg active-press transition"
                aria-label="Add Income"
              >
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Add Expense button */}
            <div className="flex items-center gap-2">
              <span className="bg-slate-900/90 dark:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-md border border-slate-700">
                - Expense
              </span>
              <button
                onClick={() => handleOpenAdd('expense')}
                className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg active-press transition"
                aria-label="Add Expense"
              >
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Main FAB Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-900/30 transition-all duration-200 active-press ${
            isOpen ? 'bg-slate-800 rotate-45' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
          aria-label={isOpen ? 'Close' : 'Add Transaction'}
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>
    </>
  );
};
