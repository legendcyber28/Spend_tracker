import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, PiggyBank, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { SimpleBarChart, DonutChart } from '../components/Charts';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const YearlyView: React.FC = () => {
  const {
    transactions,
    categories,
    settings,
    selectedYear,
    setSelectedYear,
    setSelectedMonth,
    setSubView,
  } = useApp();

  const yearTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(String(selectedYear)));
  }, [transactions, selectedYear]);

  const totalExpense = useMemo(() => {
    return yearTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [yearTransactions]);

  const totalIncome = useMemo(() => {
    return yearTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [yearTransactions]);

  const totalSavings = totalIncome - totalExpense;
  const avgMonthlyExpense = Math.round(totalExpense / 12);
  const avgDailyExpense = Math.round(totalExpense / 365);

  // 12 months array
  const monthlyData = useMemo(() => {
    return MONTH_NAMES.map((name, idx) => {
      const monthPrefix = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
      const monthTxs = yearTransactions.filter((t) => t.date.startsWith(monthPrefix));
      const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      return {
        monthIndex: idx,
        name,
        monthPrefix,
        expense: exp,
        income: inc,
        savings: inc - exp,
      };
    });
  }, [selectedYear, yearTransactions]);

  // Highest and Lowest months
  const { highestMonth, lowestMonth } = useMemo(() => {
    const nonZero = monthlyData.filter((m) => m.expense > 0);
    if (nonZero.length === 0) return { highestMonth: null, lowestMonth: null };

    const sorted = [...nonZero].sort((a, b) => b.expense - a.expense);
    return {
      highestMonth: sorted[0],
      lowestMonth: sorted[sorted.length - 1],
    };
  }, [monthlyData]);

  // Top Category
  const highestCategory = useMemo(() => {
    const catTotals: Record<string, number> = {};
    yearTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
      });

    const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? sorted[0][0] : 'None';
  }, [yearTransactions]);

  // Chart bars for 12 months
  const chartBars = useMemo(() => {
    return monthlyData.map((m) => ({
      label: m.name,
      amount: m.expense,
      isHighlight: highestMonth?.name === m.name,
    }));
  }, [monthlyData, highestMonth]);

  const handleBarTap = (index: number) => {
    const monthStr = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;
    setSelectedMonth(monthStr);
    setSubView('monthly');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Year Navigator */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <button
          onClick={() => setSelectedYear(selectedYear - 1)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active-press"
          aria-label="Previous year"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedYear}</h2>
          <span className="text-[10px] text-slate-400 font-medium">Yearly Overview</span>
        </div>

        <button
          onClick={() => setSelectedYear(selectedYear + 1)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active-press"
          aria-label="Next year"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Year Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-emerald-500 uppercase block mb-1">Total Income</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
            {formatCurrency(totalIncome, settings)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-rose-500 uppercase block mb-1">Total Expense</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
            {formatCurrency(totalExpense, settings)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold text-sky-500 uppercase block mb-1">Net Savings</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
            {formatCurrency(totalSavings, settings)}
          </span>
        </div>
      </div>

      {/* Statistics Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
            Avg Monthly Expense
          </span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">
            {formatCurrency(avgMonthlyExpense, settings)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
            Avg Daily Expense
          </span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">
            {formatCurrency(avgDailyExpense, settings)}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
            Highest Month
          </span>
          <span className="font-extrabold text-rose-600 dark:text-rose-400 truncate block">
            {highestMonth ? `${highestMonth.name} (${formatCurrency(highestMonth.expense, settings)})` : 'None'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
            Top Category
          </span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
            {highestCategory}
          </span>
        </div>
      </div>

      {/* 12-Month Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
            12-Month Spending
          </h3>
          <span className="text-[10px] text-slate-400">Jan – Dec</span>
        </div>
        <SimpleBarChart items={chartBars} settings={settings} onBarClick={handleBarTap} />
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Tap any month bar to open full monthly breakdown
        </p>
      </div>

      {/* Month List Breakdown */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase px-1">
          Monthly Overview List
        </h3>
        <div className="space-y-1.5">
          {monthlyData.map((m) => (
            <div
              key={m.name}
              onClick={() => {
                setSelectedMonth(m.monthPrefix);
                setSubView('monthly');
              }}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500 cursor-pointer active-press transition text-xs"
            >
              <span className="font-bold text-slate-900 dark:text-white w-12">{m.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-rose-500 font-semibold">
                  -{formatCurrency(m.expense, settings)}
                </span>
                <span className="text-emerald-500 font-semibold">
                  +{formatCurrency(m.income, settings)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
