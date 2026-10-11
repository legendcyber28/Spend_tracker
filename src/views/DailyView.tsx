import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDatePretty, getRelativeDateLabel } from '../utils/formatters';
import { DonutChart } from '../components/Charts';
import { TransactionItem } from '../components/TransactionItem';

export const DailyView: React.FC = () => {
  const { transactions, categories, settings, selectedDate, setSelectedDate, openAddTransaction } = useApp();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Day transactions
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const totalExpense = useMemo(() => {
    return dayTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  const totalIncome = useMemo(() => {
    return dayTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  const netBalance = totalIncome - totalExpense;

  const highestExpense = useMemo(() => {
    const exp = dayTransactions.filter((t) => t.type === 'expense');
    if (exp.length === 0) return 0;
    return Math.max(...exp.map((t) => t.amount));
  }, [dayTransactions]);

  // Category breakdown for day
  const categoryBreakdown = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    dayTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryTotals)
      .map(([name, amount]) => {
        const cat = categories.find((c) => c.name === name);
        const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return {
          name,
          amount,
          color: cat?.color || '#10b981',
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [dayTransactions, categories, totalExpense]);

  return (
    <div className="space-y-4 pb-24">
      {/* Date Navigator Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active-press"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none text-center cursor-pointer"
          />
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active-press"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Date Banner */}
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {getRelativeDateLabel(selectedDate)}
        </h2>
        <p className="text-xs text-slate-400">{formatDatePretty(selectedDate)}</p>
      </div>

      {/* Daily Metrics 4-card Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-rose-500 uppercase flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Expense
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalExpense, settings)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-emerald-500 uppercase flex items-center gap-1 mb-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Total Income
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalIncome, settings)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            Net Day Balance
          </span>
          <span
            className={`text-base font-extrabold ${
              netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netBalance, settings)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            Highest Expense
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(highestExpense, settings)}
          </span>
        </div>
      </div>

      {/* Category Breakdown Donut */}
      {totalExpense > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3">
            Day's Spending Breakdown
          </h3>
          <DonutChart data={categoryBreakdown} total={totalExpense} settings={settings} />
        </div>
      )}

      {/* All Transactions for that day */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
            Transactions ({dayTransactions.length})
          </h3>
          <button
            onClick={() => openAddTransaction('expense')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Add For This Day
          </button>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">No transactions recorded on this date.</p>
          </div>
        ) : (
          dayTransactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
        )}
      </div>
    </div>
  );
};
