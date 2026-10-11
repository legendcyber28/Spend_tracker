import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDatePretty, getRelativeDateLabel } from '../utils/formatters';
import { TransactionItem } from '../components/TransactionItem';

export const CalendarView: React.FC = () => {
  const { transactions, settings, openAddTransaction } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Compute daily spendings for each day in this month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  const { dailySpendingMap, maxSpending } = useMemo(() => {
    const map: Record<string, { expense: number; income: number; count: number }> = {};
    let max = 0;

    transactions.forEach((t) => {
      if (t.date.startsWith(monthPrefix)) {
        if (!map[t.date]) {
          map[t.date] = { expense: 0, income: 0, count: 0 };
        }
        if (t.type === 'expense') {
          map[t.date].expense += t.amount;
          if (map[t.date].expense > max) max = map[t.date].expense;
        } else {
          map[t.date].income += t.amount;
        }
        map[t.date].count += 1;
      }
    });

    return { dailySpendingMap: map, maxSpending: max };
  }, [transactions, monthPrefix]);

  // Calendar matrix calculation
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ dayNumber: null, dateStr: '' });
    }

    // Days in month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dayNumber: d, dateStr });
    }

    return cells;
  }, [year, month]);

  // Day's transactions for the selected day
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDayStr);
  }, [transactions, selectedDayStr]);

  const dayExpense = useMemo(() => {
    return dayTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }, [dayTransactions]);

  const dayIncome = useMemo(() => {
    return dayTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }, [dayTransactions]);

  return (
    <div className="space-y-4 pb-24">
      {/* Calendar Header with month navigator */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active-press transition"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{monthLabel}</h2>
          <span className="text-[10px] text-slate-400">Spending Heatmap</span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active-press transition"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d} className="text-[11px] font-bold text-slate-400">
              {d}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {calendarCells.map((cell, idx) => {
            if (!cell.dayNumber) {
              return <div key={idx} className="h-11 rounded-xl opacity-0" />;
            }

            const data = dailySpendingMap[cell.dateStr];
            const isSelected = selectedDayStr === cell.dateStr;
            const hasExpense = data && data.expense > 0;
            const hasIncome = data && data.income > 0;

            // Heatmap intensity: low, medium, high
            let heatBg = 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
            if (hasExpense && maxSpending > 0) {
              const ratio = data.expense / maxSpending;
              if (ratio > 0.6) {
                heatBg = 'bg-rose-500 text-white font-bold';
              } else if (ratio > 0.25) {
                heatBg = 'bg-rose-400/80 text-white font-semibold';
              } else {
                heatBg = 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200';
              }
            } else if (hasIncome) {
              heatBg = 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300';
            }

            return (
              <button
                key={cell.dateStr}
                onClick={() => setSelectedDayStr(cell.dateStr)}
                className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition active-press text-xs ${heatBg} ${
                  isSelected ? 'ring-2 ring-emerald-500 scale-105 shadow-sm z-10' : ''
                }`}
              >
                <span>{cell.dayNumber}</span>
                {data && (
                  <span className="text-[8px] opacity-90 truncate max-w-[32px] leading-none">
                    {data.expense > 0 ? `₹${Math.round(data.expense)}` : `+₹${Math.round(data.income)}`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />
            <span>None</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-200 dark:bg-amber-900" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
            <span>High Spend</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              {getRelativeDateLabel(selectedDayStr)}
            </h3>
            <span className="text-[11px] text-slate-400">{formatDatePretty(selectedDayStr)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddTransaction('expense')}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
            >
              + Add Entry
            </button>
          </div>
        </div>

        {/* Day Metric Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-rose-500 uppercase font-bold flex items-center gap-1 mb-0.5">
              <ArrowUpRight className="w-3 h-3" /> Total Expense
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(dayExpense, settings)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-[10px] text-emerald-500 uppercase font-bold flex items-center gap-1 mb-0.5">
              <ArrowDownLeft className="w-3 h-3" /> Total Income
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(dayIncome, settings)}
            </span>
          </div>
        </div>

        {/* Day Transactions List */}
        <div className="space-y-1.5 pt-1">
          {dayTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No transactions on this day.</p>
          ) : (
            dayTransactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
          )}
        </div>
      </div>
    </div>
  );
};
