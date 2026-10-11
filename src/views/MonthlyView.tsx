import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { DonutChart, SimpleBarChart } from '../components/Charts';
import { TransactionItem } from '../components/TransactionItem';

export const MonthlyView: React.FC = () => {
  const {
    transactions,
    categories,
    settings,
    selectedMonth,
    setSelectedMonth,
    setSelectedDate,
    setSubView,
  } = useApp();

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  // Monthly transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalExpense = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalIncome = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const savings = totalIncome - totalExpense;

  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const avgDailySpending = daysInMonth > 0 ? Math.round(totalExpense / daysInMonth) : 0;

  // Highest spending day & category
  const { highestDay, highestCategory } = useMemo(() => {
    const dayTotals: Record<string, number> = {};
    const catTotals: Record<string, number> = {};

    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        dayTotals[t.date] = (dayTotals[t.date] || 0) + t.amount;
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      });

    const topDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

    return {
      highestDay: topDay ? { date: topDay[0], amount: topDay[1] } : null,
      highestCategory: topCat ? { name: topCat[0], amount: topCat[1] } : null,
    };
  }, [monthTransactions]);

  // Daily spending chart bars
  const dailyChartBars = useMemo(() => {
    const bars = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
      const amount = monthTransactions
        .filter((t) => t.type === 'expense' && t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      bars.push({
        label: String(day),
        amount,
        isHighlight: highestDay?.date === dateStr,
      });
    }
    return bars;
  }, [selectedMonth, daysInMonth, monthTransactions, highestDay]);

  // Category breakdown for donut
  const categoryBreakdown = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    monthTransactions
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
  }, [monthTransactions, categories, totalExpense]);

  const monthLabel = new Date(yearNum, monthNum - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Month Navigator Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active-press"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{monthLabel}</h2>
          <span className="text-[10px] text-slate-400 font-medium">Monthly Analytics</span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active-press"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-emerald-500 uppercase block mb-1">Income</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
            {formatCurrency(totalIncome, settings)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-rose-500 uppercase block mb-1">Expenses</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
            {formatCurrency(totalExpense, settings)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-sky-500 uppercase block mb-1">Savings</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
            {formatCurrency(savings, settings)}
          </span>
        </div>
      </div>

      {/* Stats Details Row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
            Avg Daily Spending
          </span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">
            {formatCurrency(avgDailySpending, settings)} / day
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
            Top Category
          </span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
            {highestCategory ? highestCategory.name : 'None'}
          </span>
        </div>
      </div>

      {/* Daily Spending Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
            Daily Spending Pattern
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">Days 1 - {daysInMonth}</span>
        </div>
        <SimpleBarChart
          items={dailyChartBars}
          settings={settings}
          onBarClick={(idx) => {
            const clickedDay = String(idx + 1).padStart(2, '0');
            setSelectedDate(`${selectedMonth}-${clickedDay}`);
            setSubView('daily');
          }}
        />
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Tap any bar to inspect daily breakdown
        </p>
      </div>

      {/* Category Breakdown Donut */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3">
          Monthly Category Breakdown
        </h3>
        <DonutChart data={categoryBreakdown} total={totalExpense} settings={settings} />
      </div>

      {/* Month Transactions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
            Transactions ({monthTransactions.length})
          </h3>
        </div>

        {monthTransactions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">No transactions recorded in this month.</p>
          </div>
        ) : (
          monthTransactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} showDate={true} />)
        )}
      </div>
    </div>
  );
};
