import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ChevronRight,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimePeriod, Transaction } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/formatters';
import { DonutChart, SimpleBarChart } from '../components/Charts';
import { TransactionItem } from '../components/TransactionItem';

export const HomeView: React.FC = () => {
  const {
    transactions,
    categories,
    settings,
    openAddTransaction,
    setActiveTab,
    setSubView,
    insights,
  } = useApp();

  const [period, setPeriod] = useState<TimePeriod>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const todayStr = getTodayDateString();

  // Filter transactions according to selected period
  const filteredTxs = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');

    return transactions.filter((t) => {
      if (period === 'today') {
        return t.date === todayStr;
      }
      if (period === 'week') {
        const txDate = new Date(t.date);
        const dayDiff = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        return dayDiff >= 0 && dayDiff <= 7;
      }
      if (period === 'month') {
        return t.date.startsWith(`${curYear}-${curMonth}`);
      }
      if (period === 'year') {
        return t.date.startsWith(`${curYear}`);
      }
      if (period === 'custom') {
        if (customStart && t.date < customStart) return false;
        if (customEnd && t.date > customEnd) return false;
        return true;
      }
      return true;
    });
  }, [transactions, period, todayStr, customStart, customEnd]);

  // Aggregate stats
  const totalIncome = useMemo(() => {
    return filteredTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTxs]);

  const totalExpense = useMemo(() => {
    return filteredTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTxs]);

  const netBalance = totalIncome - totalExpense;
  const savings = totalIncome - totalExpense;

  // Today's specific spending
  const todaySpending = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.date === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, todayStr]);

  // Recent 5 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  }, [transactions]);

  // Category breakdown for donut chart
  const categoryBreakdown = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    filteredTxs
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
  }, [filteredTxs, categories, totalExpense]);

  // Mini 7-day spending chart for current week trend
  const weeklyTrendBars = useMemo(() => {
    const bars = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      const dayTotal = transactions
        .filter((t) => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      bars.push({
        label: dayName,
        amount: dayTotal,
        isHighlight: i === 0,
      });
    }
    return bars;
  }, [transactions]);

  return (
    <div className="space-y-4 pb-24">
      {/* Top Total Balance Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-5 shadow-xl border border-slate-700/60 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Balance
          </span>
          <span className="text-[11px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Active Wallet
          </span>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          {formatCurrency(netBalance, settings)}
        </div>

        {/* Income / Expense / Savings Sub-grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mb-0.5">
              <ArrowDownLeft className="w-3 h-3" />
              <span>Income</span>
            </div>
            <div className="text-sm font-bold truncate">
              {formatCurrency(totalIncome, settings)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] text-rose-400 mb-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>Expenses</span>
            </div>
            <div className="text-sm font-bold truncate">
              {formatCurrency(totalExpense, settings)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] text-sky-400 mb-0.5">
              <PiggyBank className="w-3 h-3" />
              <span>Savings</span>
            </div>
            <div className="text-sm font-bold truncate">
              {formatCurrency(savings, settings)}
            </div>
          </div>
        </div>
      </div>

      {/* Time-Period Selector */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-x-auto no-scrollbar">
        {(['today', 'week', 'month', 'year', 'custom'] as TimePeriod[]).map((p) => {
          const isSelected = period === p;
          const label =
            p === 'today'
              ? 'Today'
              : p === 'week'
              ? 'This Week'
              : p === 'month'
              ? 'This Month'
              : p === 'year'
              ? 'This Year'
              : 'Custom';
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl text-xs font-semibold transition active-press whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range selector if custom chosen */}
      {period === 'custom' && (
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">From</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">To</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
            />
          </div>
        </div>
      )}

      {/* Today's Spending Pill Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300 block">
            Today's Spending
          </span>
          <span className="text-lg font-extrabold text-amber-900 dark:text-amber-200">
            {formatCurrency(todaySpending, settings)}
          </span>
        </div>
        <button
          onClick={() => {
            setActiveTab('calendar');
          }}
          className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline"
        >
          Daily View <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Financial Insights Banner (if available) */}
      {insights.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
              {insights[0].title}
            </span>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
              {insights[0].description}
            </p>
          </div>
        </div>
      )}

      {/* Spending Trend Chart */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Last 7 Days Spending
          </h3>
          <span className="text-[11px] text-slate-400">Past Week</span>
        </div>
        <SimpleBarChart items={weeklyTrendBars} settings={settings} />
      </div>

      {/* Category Breakdown (Donut Chart) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Category Breakdown
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {period === 'month' ? 'This Month' : period === 'today' ? 'Today' : 'Selected Period'}
          </span>
        </div>
        <DonutChart data={categoryBreakdown} total={totalExpense} settings={settings} />
      </div>

      {/* Recent Transactions */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
          >
            View All ({transactions.length})
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No transactions yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tap + Add Transaction to record your first entry.
            </p>
            <button
              onClick={() => openAddTransaction('expense')}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              + Add Expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} showDate={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
