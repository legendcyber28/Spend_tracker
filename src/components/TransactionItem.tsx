import React, { useState } from 'react';
import { MoreVertical, Edit2, Copy, Trash2, Tag, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { Transaction } from '../types';
import { useApp } from '../context/AppContext';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDatePretty } from '../utils/formatters';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
  transaction: Transaction;
  showDate?: boolean;
}

export const TransactionItem: React.FC<Props> = ({ transaction, showDate = false }) => {
  const { categories, settings, openAddTransaction, duplicateTransaction, deleteTransaction } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const catObj = categories.find((c) => c.name === transaction.category);
  const isIncome = transaction.type === 'income';

  const handleEdit = () => {
    setShowMenu(false);
    openAddTransaction(transaction.type, transaction);
  };

  const handleDuplicate = () => {
    setShowMenu(false);
    duplicateTransaction(transaction.id);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    deleteTransaction(transaction.id);
  };

  return (
    <>
      <div className="relative group flex items-center justify-between p-3.5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition active-press">
        {/* Left: Icon & Title */}
        <div
          onClick={handleEdit}
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: catObj?.color || (isIncome ? '#10b981' : '#f43f5e') }}
          >
            <CategoryIcon name={catObj?.icon || (isIncome ? 'TrendingUp' : 'Receipt')} className="w-5 h-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {transaction.category}
              </span>
              {transaction.subcategory && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 truncate">
                  {transaction.subcategory}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {showDate && <span>{formatDatePretty(transaction.date)} • </span>}
              <span>{transaction.time || '12:00'}</span>
              <span>•</span>
              <span className="truncate">{transaction.paymentMethod || 'Cash'}</span>
              {transaction.note && (
                <>
                  <span>•</span>
                  <span className="truncate italic max-w-[100px]">"{transaction.note}"</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount & Quick Menu */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <div className="text-right">
            <span
              className={`text-sm sm:text-base font-extrabold block tracking-tight ${
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(transaction.amount, settings)}
            </span>
          </div>

          {/* Three-dots menu button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-7 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    Edit
                  </button>
                  <button
                    onClick={handleDuplicate}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-500" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${transaction.category} ${transaction.type} of ${formatCurrency(transaction.amount, settings)}?`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
