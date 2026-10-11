import React, { useState, useMemo } from 'react';
import { FileText, Download, Printer, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDatePretty, exportTransactionsToCSV, downloadFile } from '../utils/formatters';

type ReportType = 'daily' | 'monthly' | 'yearly' | 'category' | 'income' | 'expense' | 'budget';

export const ReportsView: React.FC = () => {
  const { transactions, categories, budgets, settings, showToast } = useApp();

  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  // Filter report transactions
  const reportTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (reportType === 'daily') return t.date === selectedDate;
      if (reportType === 'monthly') return t.date.startsWith(selectedMonth);
      if (reportType === 'yearly') return t.date.startsWith(String(selectedYear));
      if (reportType === 'income') return t.type === 'income';
      if (reportType === 'expense') return t.type === 'expense';
      return true;
    });
  }, [transactions, reportType, selectedDate, selectedMonth, selectedYear]);

  const totalExpense = useMemo(() => {
    return reportTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  }, [reportTransactions]);

  const totalIncome = useMemo(() => {
    return reportTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  }, [reportTransactions]);

  const netSavings = totalIncome - totalExpense;

  // Category breakdown
  const categorySummary = useMemo(() => {
    const totals: Record<string, number> = {};
    reportTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });

    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [reportTransactions, totalExpense]);

  const handleExportCSV = () => {
    const csv = exportTransactionsToCSV(reportTransactions, settings);
    downloadFile(csv, `expense-tracker-report-${reportType}-${Date.now()}.csv`);
    showToast('CSV Report downloaded', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Financial Reports</h2>
          <p className="text-xs text-slate-400">Generate and export statements</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold active-press transition"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active-press transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'monthly', label: 'Monthly' },
          { id: 'daily', label: 'Daily' },
          { id: 'yearly', label: 'Yearly' },
          { id: 'expense', label: 'Expenses' },
          { id: 'income', label: 'Income' },
          { id: 'category', label: 'Category' },
          { id: 'budget', label: 'Budget' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setReportType(item.id as any)}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
              reportType === item.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Date Parameter Chooser */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Statement Period:</span>
        {reportType === 'daily' && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        )}
        {reportType === 'monthly' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        )}
        {reportType === 'yearly' && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
        {(reportType === 'category' || reportType === 'budget' || reportType === 'income' || reportType === 'expense') && (
          <span className="text-slate-400">All available records</span>
        )}
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 print:p-0 print:border-none">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Expense Tracker</h1>
            <p className="text-xs text-slate-400 capitalize">{reportType} Financial Statement</p>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <span>Generated on {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Financial Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-emerald-500 uppercase font-bold block mb-0.5">Total Income</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalIncome, settings)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-rose-500 uppercase font-bold block mb-0.5">Total Expenses</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(totalExpense, settings)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-sky-500 uppercase font-bold block mb-0.5">Net Savings</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {formatCurrency(netSavings, settings)}
            </span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        {categorySummary.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-2">
              Spending by Category
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {categorySummary.map((cat) => (
                <div key={cat.name} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCurrency(cat.amount, settings)}</span>
                    <span className="text-[11px] text-slate-400 font-mono w-8 text-right">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itemized Transactions Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-2">
            Itemized Entries ({reportTransactions.length})
          </h3>
          <div className="overflow-x-auto max-h-64 overflow-y-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2 px-2.5">Date</th>
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5">Method</th>
                  <th className="py-2 px-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-2.5 text-slate-500 whitespace-nowrap">{t.date}</td>
                    <td className="py-2 px-2.5 font-medium text-slate-900 dark:text-white">{t.category}</td>
                    <td className="py-2 px-2.5 text-slate-400">{t.paymentMethod}</td>
                    <td
                      className={`py-2 px-2.5 text-right font-bold whitespace-nowrap ${
                        t.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount, settings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
