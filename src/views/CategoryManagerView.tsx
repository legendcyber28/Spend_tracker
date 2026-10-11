import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Check, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category, TransactionType } from '../types';
import { CategoryIcon, AVAILABLE_ICONS } from '../components/CategoryIcon';
import { formatCurrency } from '../utils/formatters';
import { ConfirmationModal } from '../components/ConfirmationModal';

const PRESET_COLORS = [
  '#f97316', '#10b981', '#06b6d4', '#ef4444', '#ec4899', '#eab308',
  '#8b5cf6', '#14b8a6', '#3b82f6', '#a855f7', '#0284c7', '#d946ef',
  '#6366f1', '#f43f5e', '#84cc16', '#64748b',
];

export const CategoryManagerView: React.FC = () => {
  const { categories, transactions, settings, addCategory, updateCategory, deleteCategory, showToast } = useApp();

  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Utensils');
  const [color, setColor] = useState('#10b981');
  const [subcategoriesStr, setSubcategoriesStr] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Spending per category calculation
  const categorySpendingMap = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    transactions.forEach((t) => {
      if (!map[t.category]) {
        map[t.category] = { total: 0, count: 0 };
      }
      map[t.category].total += t.amount;
      map[t.category].count += 1;
    });
    return map;
  }, [transactions]);

  const filteredCategories = categories.filter((c) => c.type === activeType);

  const openAddModal = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setName(cat.name);
      setIcon(cat.icon);
      setColor(cat.color);
      setSubcategoriesStr(cat.subcategories.join(', '));
    } else {
      setEditingId(null);
      setName('');
      setIcon('Tag');
      setColor('#10b981');
      setSubcategoriesStr('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }

    const subcats = subcategoriesStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId) {
      updateCategory(editingId, {
        name: name.trim(),
        icon,
        color,
        subcategories: subcats,
      });
    } else {
      addCategory({
        name: name.trim(),
        type: activeType,
        icon,
        color,
        subcategories: subcats,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Manage Categories</h2>
          <p className="text-xs text-slate-400">Add, edit, and organize spending types</p>
        </div>

        <button
          onClick={() => openAddModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active-press transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>

      {/* Expense / Income Switch */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl select-none">
        <button
          type="button"
          onClick={() => setActiveType('expense')}
          className={`py-2 rounded-xl text-xs font-bold transition ${
            activeType === 'expense'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Expense Categories
        </button>
        <button
          type="button"
          onClick={() => setActiveType('income')}
          className={`py-2 rounded-xl text-xs font-bold transition ${
            activeType === 'income'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Income Categories
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-2">
        {filteredCategories.map((cat) => {
          const stats = categorySpendingMap[cat.name] || { total: 0, count: 0 };

          return (
            <div
              key={cat.id}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {cat.name}
                    </span>
                    {cat.isCustom && (
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1 py-0.2 rounded">
                        Custom
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                    <span>Spent: <strong>{formatCurrency(stats.total, settings)}</strong></span>
                    <span> • {stats.count} transactions</span>
                  </div>

                  {cat.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cat.subcategories.slice(0, 3).map((sub) => (
                        <span
                          key={sub}
                          className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500"
                        >
                          {sub}
                        </span>
                      ))}
                      {cat.subcategories.length > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{cat.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openAddModal(cat)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(cat.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Category' : 'New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pet Care, Gadgets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none font-semibold text-xs"
                />
              </div>

              {/* Color Palette */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition flex items-center justify-center ${
                        color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon selector */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-xl flex items-center justify-center ${
                        icon === ic
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories comma-separated */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vet, Pet Food, Toys"
                  value={subcategoriesStr}
                  onChange={(e) => setSubcategoriesStr(e.target.value)}
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Category"
        message="Are you sure you want to delete this category? Existing transactions will retain their historical record."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteCategory(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
