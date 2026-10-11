import React, { useState, useMemo } from 'react';
import {
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Budget } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const BudgetView: React.FC = () => {
  const {
    budgets,
    categories,
    transactions,
    settings,
    saveBudget,
    deleteBudget,
    showToast,
  } = useApp();

  // Add / Edit Budget Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState<string>('all');
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Compute current month expenses
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = useMemo(() => {
    return transactions.filter(
      (t) => t.type === 'expense' && t.date.startsWith(currentMonthPrefix)
    );
  }, [transactions, currentMonthPrefix]);

  const totalMonthExpense = useMemo(() => {
    return currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthExpenses]);

  // Map category to spent amount
  const categorySpentMap = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthExpenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [currentMonthExpenses]);

  const openAddModal = (existing?: Budget) => {
    if (existing) {
      setEditingId(existing.id);
      setBudgetCategory(existing.category);
      setBudgetAmount(String(existing.amount));
    } else {
      setEditingId(null);
      setBudgetCategory(categories.find((c) => c.type === 'expense')?.name || 'Food');
      setBudgetAmount('');
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(budgetAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid budget amount', 'error');
      return;
    }

    saveBudget({
      id: editingId || `b-${Date.now()}`,
      category: budgetCategory,
      amount: amt,
      period: 'monthly',
    });

    setIsModalOpen(false);
  };

  const overallBudget = budgets.find((b) => b.category === 'all');
  const categoryBudgets = budgets.filter((b) => b.category !== 'all');

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Monthly Budgets</h2>
          <p className="text-xs text-slate-400">Keep spending in check and avoid overspending</p>
        </div>
        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active-press transition"
        >
          <Plus className="w-3.5 h-3.5" /> Set Budget
        </button>
      </div>

      {/* Overall Monthly Budget Card */}
      {overallBudget ? (
        (() => {
          const spent = totalMonthExpense;
          const remaining = overallBudget.amount - spent;
          const pct = Math.min(Math.round((spent / overallBudget.amount) * 100), 100);
          const isOver = spent > overallBudget.amount;
          const isWarning90 = pct >= 90 && !isOver;
          const isWarning75 = pct >= 75 && pct < 90;

          return (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 rounded-3xl border border-slate-700/80 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Overall Monthly Limit</h3>
                    <span className="text-[11px] text-slate-400">This Month</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openAddModal(overallBudget)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                    aria-label="Edit overall budget"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300">
                    Spent: <strong className="text-white">{formatCurrency(spent, settings)}</strong>
                  </span>
                  <span className="font-mono text-xs">
                    {pct}% of {formatCurrency(overallBudget.amount, settings)}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-700/80 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-rose-500'
                        : isWarning90
                        ? 'bg-amber-400'
                        : isWarning75
                        ? 'bg-amber-300'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>
              </div>

              {/* Status Warning Banner */}
              <div className="pt-1 flex items-center justify-between text-xs">
                {isOver ? (
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <AlertCircle className="w-4 h-4" /> Exceeded by {formatCurrency(Math.abs(remaining), settings)}
                  </span>
                ) : isWarning90 ? (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4" /> Warning: 90% budget used!
                  </span>
                ) : isWarning75 ? (
                  <span className="flex items-center gap-1 text-amber-300 font-medium">
                    <AlertTriangle className="w-4 h-4" /> 75% budget used
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> On track! Remaining: {formatCurrency(remaining, settings)}
                  </span>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-2">No overall monthly budget set.</p>
          <button
            onClick={() => {
              setEditingId(null);
              setBudgetCategory('all');
              setBudgetAmount('30000');
              setIsModalOpen(true);
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Set Overall Budget (e.g. ₹30,000)
          </button>
        </div>
      )}

      {/* Category Budgets Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase px-1">
          Category Budgets ({categoryBudgets.length})
        </h3>

        {categoryBudgets.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400">No category-specific budgets set yet.</p>
            <button
              onClick={() => openAddModal()}
              className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              + Add Category Budget
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {categoryBudgets.map((b) => {
              const catObj = categories.find((c) => c.name === b.category);
              const spent = categorySpentMap[b.category] || 0;
              const remaining = b.amount - spent;
              const pct = Math.min(Math.round((spent / b.amount) * 100), 100);
              const isOver = spent > b.amount;
              const isWarning90 = pct >= 90 && !isOver;
              const isWarning75 = pct >= 75 && pct < 90;

              return (
                <div
                  key={b.id}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: catObj?.color || '#10b981' }}
                      >
                        <CategoryIcon name={catObj?.icon || 'Tag'} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {b.category}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Budget: {formatCurrency(b.amount, settings)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openAddModal(b)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label="Edit budget"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(b.id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        aria-label="Delete budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 dark:text-slate-400">
                        Spent: <strong>{formatCurrency(spent, settings)}</strong>
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {pct}% Used
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver
                            ? 'bg-rose-500'
                            : isWarning90
                            ? 'bg-amber-500'
                            : isWarning75
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Remaining / Exceeded label */}
                  <div className="text-[11px] flex items-center justify-between pt-0.5">
                    {isOver ? (
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Over budget by {formatCurrency(Math.abs(remaining), settings)}
                      </span>
                    ) : isWarning90 ? (
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 90% reached! Only {formatCurrency(remaining, settings)} left
                      </span>
                    ) : isWarning75 ? (
                      <span className="text-amber-500 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> 75% reached ({formatCurrency(remaining, settings)} left)
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Remaining: {formatCurrency(remaining, settings)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Set / Edit Budget Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xs sm:max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Budget' : 'Set Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Budget Target
                </label>
                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                >
                  <option value="all">Overall Monthly Budget</option>
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Monthly Limit Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full text-base font-bold p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Budget"
        message="Are you sure you want to remove this budget limit?"
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteBudget(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
