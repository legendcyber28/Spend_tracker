import React, { useState } from 'react';
import { Plus, Trash2, X, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { CategoryIcon, AVAILABLE_ICONS } from '../components/CategoryIcon';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const PaymentMethodsView: React.FC = () => {
  const { paymentMethods, addPaymentMethod, deletePaymentMethod, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('CreditCard');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter payment method name', 'error');
      return;
    }

    addPaymentMethod({
      name: name.trim(),
      icon,
    });

    setName('');
    setIcon('CreditCard');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Payment Methods</h2>
          <p className="text-xs text-slate-400">Cash, UPI, Cards, Wallets, and Banks</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active-press transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Method
        </button>
      </div>

      {/* Methods List */}
      <div className="space-y-2">
        {paymentMethods.map((pm) => (
          <div
            key={pm.id}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <CategoryIcon name={pm.icon} className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  {pm.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {pm.isCustom ? 'Custom Method' : 'Standard'}
                </span>
              </div>
            </div>

            {pm.isCustom && (
              <button
                onClick={() => setDeleteTargetId(pm.id)}
                className="p-1.5 text-slate-400 hover:text-rose-500"
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">New Payment Method</h3>
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
                  Method Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. PayPal, Sodexo Card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none font-semibold text-xs"
                />
              </div>

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
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Payment Method"
        message="Are you sure you want to remove this custom payment method?"
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTargetId) {
            deletePaymentMethod(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
