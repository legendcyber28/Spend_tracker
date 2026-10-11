import React, { useState } from 'react';
import { Repeat, Plus, Trash2, CheckCircle2, Calendar, Edit2, Play, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RecurringRule, RecurrenceFrequency, TransactionType } from '../types';
import { formatCurrency, formatDatePretty } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const RecurringView: React.FC = () => {
  const {
    recurring,
    categories,
    paymentMethods,
    settings,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    processDueRecurring,
    showToast,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Rent');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const openAddModal = (rule?: RecurringRule) => {
    if (rule) {
      setEditingId(rule.id);
      setType(rule.type);
      setAmount(String(rule.amount));
      setCategory(rule.category);
      setPaymentMethod(rule.paymentMethod);
      setFrequency(rule.frequency);
      setNextDueDate(rule.nextDueDate);
      setNote(rule.note || '');
    } else {
      setEditingId(null);
      setType('expense');
      setAmount('');
      setCategory('Rent');
      setPaymentMethod('UPI');
      setFrequency('monthly');
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (editingId) {
      updateRecurring(editingId, {
        type,
        amount: num,
        category,
        paymentMethod,
        frequency,
        nextDueDate,
        note: note.trim() || undefined,
      });
    } else {
      addRecurring({
        type,
        amount: num,
        category,
        paymentMethod,
        frequency,
        startDate: nextDueDate,
        nextDueDate,
        isActive: true,
        note: note.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recurring Rules</h2>
          <p className="text-xs text-slate-400">Automate recurring expenses & incomes</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => processDueRecurring()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold active-press transition"
            title="Check and post due transactions now"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" /> Process Due
          </button>
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active-press transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Rule
          </button>
        </div>
      </div>

      {/* Rules List */}
      {recurring.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
          <Repeat className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No recurring transactions defined.</p>
          <button
            onClick={() => openAddModal()}
            className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            + Create First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recurring.map((rule) => {
            const catObj = categories.find((c) => c.name === rule.category);
            const isExpense = rule.type === 'expense';

            return (
              <div
                key={rule.id}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: catObj?.color || (isExpense ? '#f43f5e' : '#10b981') }}
                  >
                    <CategoryIcon name={catObj?.icon || 'Repeat'} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {rule.category}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {rule.frequency}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Next: {formatDatePretty(rule.nextDueDate)}</span>
                      <span>•</span>
                      <span>{rule.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-extrabold text-xs sm:text-sm ${
                      isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatCurrency(rule.amount, settings)}
                  </span>

                  <button
                    onClick={() => openAddModal(rule)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(rule.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Recurring Rule' : 'New Recurring Rule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              {/* Type */}
              <div className="grid grid-cols-2 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-1.5 rounded-lg font-bold ${
                    type === 'expense' ? 'bg-rose-500 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-1.5 rounded-lg font-bold ${
                    type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  className="w-full text-base font-bold p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                >
                  {categories
                    .filter((c) => c.type === type)
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Next Due Date */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apartment maintenance"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl font-bold bg-emerald-600 text-white shadow-md"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Recurring Rule"
        message="Are you sure you want to delete this recurring automation?"
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteRecurring(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
