import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const btnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  const toggleMenu = () => {
    if (showMenu) {
      setShowMenu(false);
      return;
    }
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const menuH = 130;
      const below = r.bottom + 4;
      const top = below + menuH > window.innerHeight ? Math.max(8, r.top - menuH - 4) : below;
      setMenuPos({ top, right: Math.max(8, window.innerWidth - r.right) });
    }
    setShowMenu(true);
  };

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
      <div className="relative flex items-center gap-2 p-3.5 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-2xs">
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
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {transaction.category}
              </span>
              {transaction.subcategory && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 truncate shrink min-w-0">
                  {transaction.subcategory}
                </span>
              )}
            </div>

            <div className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5">
              {showDate && <span className="whitespace-nowrap">{formatDatePretty(transaction.date)}</span>}
              <span className="whitespace-nowrap">{showDate ? '• ' : ''}{transaction.time || '12:00'}</span>
              <span className="whitespace-nowrap">• {transaction.paymentMethod || 'Cash'}</span>
            </div>
            {transaction.note && (
              <div className="mt-0.5 text-[11px] italic text-slate-500 dark:text-slate-400 truncate">
                "{transaction.note}"
              </div>
            )}
          </div>
        </div>

        {/* Right: Amount & Quick Menu */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-sm sm:text-base font-extrabold whitespace-nowrap tracking-tight ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount, settings)}
          </span>

          <button
            ref={btnRef}
            onClick={toggleMenu}
            className="p-2 -mr-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            aria-label="Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showMenu &&
        menuPos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setShowMenu(false)} />
            <div
              style={{ top: menuPos.top, right: menuPos.right }}
              className="fixed w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-[91]"
            >
              <button
                onClick={handleEdit}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                Edit
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-500" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </>,
          document.body
        )}

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
