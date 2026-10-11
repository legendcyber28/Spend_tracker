import React, { useState, useMemo } from 'react';
import {
  PieChart,
  CreditCard,
  TrendingUp,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { DonutChart, SimpleBarChart } from '../components/Charts';
import { CategoryIcon } from '../components/CategoryIcon';

export const AnalyticsView: React.FC = () => {
  const { transactions, categories, paymentMethods, settings, insights, setSubView } = useApp();

  const [activeTab, setActiveTab] = useState<'categories' | 'payments' | 'trends' | 'insights'>('categories');
  const [period, setPeriod] = useState<'this-month' | 'last-month' | 'this-year' | 'all'>('this-month');

  // Filter transactions according to selected period
  const filteredTxs = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');

    const lastMonthDate = new Date(curYear, now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    return transactions.filter((t) => {
      if (period === 'this-month') return t.date.startsWith(`${curYear}-${curMonth}`);
      if (period === 'last-month') return t.date.startsWith(lastMonthStr);
      if (period === 'this-year') return t.date.startsWith(`${curYear}`);
      return true;
    });
  }, [transactions, period]);

  const totalExpense = useMemo(() => {
    return filteredTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }, [filteredTxs]);

  const totalIncome = useMemo(() => {
    return filteredTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }, [filteredTxs]);

  const netSavings = totalIncome - totalExpense;

  // Category Analytics Breakdown
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });

    return Object.entries(totals)
      .map(([name, amount]) => {
        const cat = categories.find((c) => c.name === name);
        const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        return {
          name,
          amount,
          color: cat?.color || '#10b981',
          percentage,
          icon: cat?.icon || 'Tag',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTxs, categories, totalExpense]);

  // Payment Method Analytics Breakdown
  const paymentBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredTxs.forEach((t) => {
      const pm = t.paymentMethod || 'Other';
      totals[pm] = (totals[pm] || 0) + t.amount;
    });

    const totalAll = totalExpense + totalIncome;

    return Object.entries(totals)
      .map(([name, amount]) => {
        const pmObj = paymentMethods.find((p) => p.name === name);
        const percentage = totalAll > 0 ? Math.round((amount / totalAll) * 100) : 0;
        return {
          name,
          amount,
          percentage,
          icon: pmObj?.icon || 'CreditCard',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTxs, paymentMethods, totalExpense, totalIncome]);

  // Monthly Savings Trend (last 6 months)
  const savingsTrendBars = useMemo(() => {
    const bars = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      const mInc = transactions
        .filter((t) => t.type === 'income' && t.date.startsWith(prefix))
        .reduce((s, t) => s + t.amount, 0);
      const mExp = transactions
        .filter((t) => t.type === 'expense' && t.date.startsWith(prefix))
        .reduce((s, t) => s + t.amount, 0);
      const mSavings = Math.max(mInc - mExp, 0);

      bars.push({
        label: monthName,
        amount: mSavings,
        isHighlight: i === 0,
      });
    }

    return bars;
  }, [transactions]);

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Financial Analytics</h2>
          <p className="text-xs text-slate-400">Deep insights into your spending habits</p>
        </div>

        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
        >
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="this-year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Quick Navigation to Daily / Monthly / Yearly views */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setSubView('daily')}
          className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center active-press transition"
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily View</span>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Inspect Days</span>
        </button>

        <button
          onClick={() => setSubView('monthly')}
          className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center active-press transition"
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly View</span>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Monthly Trends</span>
        </button>

        <button
          onClick={() => setSubView('yearly')}
          className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center active-press transition"
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Yearly View</span>
          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">12 Months</span>
        </button>
      </div>

      {/* Analytics Sub-tabs */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {[
          { id: 'categories', label: 'Categories' },
          { id: 'payments', label: 'Payment Methods' },
          { id: 'trends', label: 'Trends' },
          { id: 'insights', label: 'Insights' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content 1: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3">
              Expense Distribution
            </h3>
            <DonutChart data={categoryBreakdown} total={totalExpense} settings={settings} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase px-1">
              Category Rankings
            </h3>
            {categoryBreakdown.map((cat, idx) => (
              <div
                key={cat.name}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-400 text-[10px] w-4">{idx + 1}.</span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">{cat.percentage}% of spending</span>
                  </div>
                </div>

                <span className="font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(cat.amount, settings)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: Payment Methods */}
      {activeTab === 'payments' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3">
              Payment Method Breakdown
            </h3>
            <div className="space-y-3">
              {paymentBreakdown.map((pm) => (
                <div key={pm.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={pm.icon} className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-slate-900 dark:text-white">{pm.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold">{formatCurrency(pm.amount, settings)}</span>
                      <span className="text-[11px] text-slate-400 font-mono w-8 text-right">
                        {pm.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pm.percentage}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Trends & Income vs Expense */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          {/* Income vs Expense Comparison Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Income vs Expenses
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                  Income Total
                </span>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(totalIncome, settings)}
                </span>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block mb-1">
                  Expense Total
                </span>
                <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">
                  {formatCurrency(totalExpense, settings)}
                </span>
              </div>
            </div>

            {/* Comparison Ratio bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Savings Margin: {totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0}%</span>
                <span>Net: {formatCurrency(netSavings, settings)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                <div
                  style={{
                    width: `${totalIncome + totalExpense > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 50}%`,
                  }}
                  className="h-full bg-emerald-500"
                />
                <div
                  style={{
                    width: `${totalIncome + totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 50}%`,
                  }}
                  className="h-full bg-rose-500"
                />
              </div>
            </div>
          </div>

          {/* 6-Month Savings Trend */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-2">
              Savings Trend (Last 6 Months)
            </h3>
            <SimpleBarChart items={savingsTrendBars} settings={settings} />
          </div>
        </div>
      )}

      {/* Tab Content 4: Financial Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">
              Smart Financial Insights
            </h3>
          </div>

          {insights.length === 0 ? (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl text-center border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-400">Add more transactions to generate rich insights.</p>
            </div>
          ) : (
            insights.map((ins) => (
              <div
                key={ins.id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-start gap-3"
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    ins.type === 'warning'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : ins.type === 'success'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ins.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {ins.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
