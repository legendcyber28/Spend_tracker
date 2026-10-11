import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  Calendar,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDatePretty, getRelativeDateLabel } from '../utils/formatters';
import { TransactionItem } from '../components/TransactionItem';

export const TransactionsView: React.FC = () => {
  const { transactions, categories, paymentMethods, settings, openAddTransaction } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Active filter badge count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (dateFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (paymentFilter !== 'all') count++;
    if (minAmount) count++;
    if (maxAmount) count++;
    return count;
  }, [dateFilter, typeFilter, categoryFilter, paymentFilter, minAmount, maxAmount]);

  const resetFilters = () => {
    setDateFilter('all');
    setCustomStart('');
    setCustomEnd('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('newest');
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yestDate = new Date();
    yestDate.setDate(now.getDate() - 1);
    const yestStr = yestDate.toISOString().split('T')[0];
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');

    // Last month calculation
    const lastMonthDate = new Date(curYear, now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    return transactions
      .filter((t) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            t.category.toLowerCase().includes(q) ||
            (t.subcategory && t.subcategory.toLowerCase().includes(q)) ||
            (t.note && t.note.toLowerCase().includes(q)) ||
            t.paymentMethod.toLowerCase().includes(q) ||
            String(t.amount).includes(q);
          if (!matches) return false;
        }

        // Type
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Category
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        // Payment Method
        if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;

        // Min/Max amount
        if (minAmount && t.amount < parseFloat(minAmount)) return false;
        if (maxAmount && t.amount > parseFloat(maxAmount)) return false;

        // Date filter
        if (dateFilter === 'today' && t.date !== todayStr) return false;
        if (dateFilter === 'yesterday' && t.date !== yestStr) return false;
        if (dateFilter === 'this-week') {
          const txDate = new Date(t.date);
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 0 || diffDays > 7) return false;
        }
        if (dateFilter === 'this-month' && !t.date.startsWith(`${curYear}-${curMonth}`)) return false;
        if (dateFilter === 'last-month' && !t.date.startsWith(lastMonthStr)) return false;
        if (dateFilter === 'this-year' && !t.date.startsWith(`${curYear}`)) return false;
        if (dateFilter === 'custom') {
          if (customStart && t.date < customStart) return false;
          if (customEnd && t.date > customEnd) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
        if (sortBy === 'oldest') return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    paymentFilter,
    minAmount,
    maxAmount,
    dateFilter,
    customStart,
    customEnd,
    sortBy,
  ]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; transactions: Transaction[]; totalExpense: number; totalIncome: number }[] = [];
    const dateMap: Record<string, Transaction[]> = {};

    filteredTransactions.forEach((t) => {
      if (!dateMap[t.date]) {
        dateMap[t.date] = [];
      }
      dateMap[t.date].push(t);
    });

    // Keep chronological group order based on sortBy
    const dates = Object.keys(dateMap).sort((a, b) => {
      if (sortBy === 'oldest') return a.localeCompare(b);
      return b.localeCompare(a);
    });

    dates.forEach((d) => {
      const txs = dateMap[d];
      const totalExpense = txs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = txs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      groups.push({ date: d, transactions: txs, totalExpense, totalIncome });
    });

    return groups;
  }, [filteredTransactions, sortBy]);

  return (
    <div className="space-y-3 pb-24">
      {/* Top Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, category, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`p-2.5 rounded-2xl border transition relative active-press ${
            isFilterOpen || activeFiltersCount > 0
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
          aria-label="Filter"
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filter Drawer */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-md space-y-3.5 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Filter Transactions
            </h4>
            <button
              onClick={resetFilters}
              className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['all', 'expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                    typeFilter === t
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Time Range</label>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'this-week', label: 'This Week' },
                { id: 'this-month', label: 'This Month' },
                { id: 'last-month', label: 'Last Month' },
                { id: 'this-year', label: 'This Year' },
                { id: 'custom', label: 'Custom' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDateFilter(opt.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                    dateFilter === opt.id
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {dateFilter === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="text-xs p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Category & Payment Method selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Method</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
              >
                <option value="all">All Methods</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.name}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Min & Max Amount */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Min Amount</label>
              <input
                type="number"
                placeholder="Min 0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Max Amount</label>
              <input
                type="number"
                placeholder="Max"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sort By</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'newest', label: 'Newest' },
                { id: 'oldest', label: 'Oldest' },
                { id: 'highest', label: 'Highest' },
                { id: 'lowest', label: 'Lowest' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold transition ${
                    sortBy === s.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction List Grouped by Date */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No transactions found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or reset your filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Date Header with Daily Total */}
              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  {getRelativeDateLabel(group.date)}
                </span>
                <div className="flex items-center gap-2 font-semibold">
                  {group.totalExpense > 0 && (
                    <span className="text-rose-600 dark:text-rose-400">
                      Spent: {formatCurrency(group.totalExpense, settings)}
                    </span>
                  )}
                  {group.totalIncome > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Recv: +{formatCurrency(group.totalIncome, settings)}
                    </span>
                  )}
                </div>
              </div>

              {/* Day's Transactions */}
              <div className="space-y-2">
                {group.transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
