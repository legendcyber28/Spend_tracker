import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  FileText,
  Camera,
  Repeat,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TransactionType, RecurrenceFrequency } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { getTodayDateString, getCurrentTimeString } from '../utils/formatters';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTxOpen,
    closeAddTransaction,
    addTxInitialType,
    editingTransaction,
    categories,
    paymentMethods,
    addTransaction,
    updateTransaction,
    addRecurring,
    settings,
    showToast,
  } = useApp();

  const [type, setType] = useState<TransactionType>(addTxInitialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [note, setNote] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFreq, setRecurringFreq] = useState<RecurrenceFrequency>('monthly');

  // Custom subcategory adder state
  const [isAddingSubcat, setIsAddingSubcat] = useState(false);
  const [customSubcatInput, setCustomSubcatInput] = useState('');

  // Sync when opening modal or editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setSubcategory(editingTransaction.subcategory || '');
      setDate(editingTransaction.date);
      setTime(editingTransaction.time);
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setNote(editingTransaction.note || '');
      setReceiptImage(editingTransaction.receiptImage || '');
      setIsRecurring(Boolean(editingTransaction.isRecurring));
    } else {
      setType(addTxInitialType);
      setAmount('');
      const defaultCat = categories.find((c) => c.type === addTxInitialType);
      setCategory(defaultCat ? defaultCat.name : '');
      setSubcategory('');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      setPaymentMethod('UPI');
      setNote('');
      setReceiptImage('');
      setIsRecurring(false);
      setRecurringFreq('monthly');
    }
  }, [isAddTxOpen, addTxInitialType, editingTransaction, categories]);

  if (!isAddTxOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);
  const activeCategoryObj = categories.find((c) => c.name === category && c.type === type);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Please enter a valid amount greater than 0', 'error');
      return;
    }
    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: numAmount,
        category,
        subcategory: subcategory || undefined,
        date,
        time,
        paymentMethod,
        note: note.trim() || undefined,
        receiptImage: receiptImage || undefined,
        isRecurring,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        category,
        subcategory: subcategory || undefined,
        date,
        time,
        paymentMethod,
        note: note.trim() || undefined,
        receiptImage: receiptImage || undefined,
        isRecurring,
      });

      // If user toggled recurring on a new transaction, also create the recurring rule
      if (isRecurring) {
        addRecurring({
          type,
          amount: numAmount,
          category,
          subcategory: subcategory || undefined,
          paymentMethod,
          note: note.trim() || undefined,
          frequency: recurringFreq,
          startDate: date,
          nextDueDate: date,
          isActive: true,
        });
      }
    }

    closeAddTransaction();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : type === 'expense' ? 'Add Expense' : 'Add Income'}
            </h2>
          </div>
          <button
            onClick={closeAddTransaction}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - scrollable */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
          {/* Expense / Income Segmented Switch */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl select-none">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const first = categories.find((c) => c.type === 'expense');
                if (first) setCategory(first.name);
              }}
              className={`py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const first = categories.find((c) => c.type === 'income');
                if (first) setCategory(first.name);
              }}
              className={`py-2 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full text-3xl font-extrabold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Categories Horizontal Carousel / Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <span className="text-xs text-slate-400 font-medium">
                Selected: <strong className="text-emerald-600 dark:text-emerald-400">{category || 'None'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
              {filteredCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      setSubcategory('');
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition active-press text-center ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-500 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white mb-1 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold truncate w-full leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategories (if any) */}
          {activeCategoryObj && (
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Subcategory (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {activeCategoryObj.subcategories.map((sub) => {
                  const isSel = subcategory === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubcategory(isSel ? '' : sub)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                        isSel
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}

                {/* Add Custom subcat button */}
                {!isAddingSubcat ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingSubcat(true)}
                    className="text-xs px-2.5 py-1 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-emerald-500 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Custom
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="New subcategory"
                      value={customSubcatInput}
                      onChange={(e) => setCustomSubcatInput(e.target.value)}
                      className="text-xs px-2 py-0.5 rounded-lg border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none w-28"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customSubcatInput.trim()) {
                          setSubcategory(customSubcatInput.trim());
                          setIsAddingSubcat(false);
                          setCustomSubcatInput('');
                        }
                      }}
                      className="p-1 rounded-md bg-emerald-500 text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSubcat(false)}
                      className="p-1 rounded-md bg-slate-200 text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Payment Method
            </label>
            <div className="flex flex-wrap gap-1.5">
              {paymentMethods.map((pm) => {
                const isSelected = paymentMethod === pm.name;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.name)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CategoryIcon name={pm.icon} className="w-3.5 h-3.5" />
                    {pm.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Note & Receipt Attachment Row */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner with friends, Uber to airport..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Receipt Image upload & preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Receipt / Bill (Optional)
              </label>
              {receiptImage && (
                <button
                  type="button"
                  onClick={() => setReceiptImage('')}
                  className="text-xs text-rose-500 flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>

            {receiptImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-36">
                <img src={receiptImage} alt="Receipt preview" className="w-full h-36 object-cover" />
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-500 hover:text-emerald-500 cursor-pointer hover:border-emerald-500 transition">
                <Camera className="w-4 h-4" />
                <span>Attach receipt photo or bill</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Recurring Transaction Toggle */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Recurring Transaction
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Automatically repeat this entry
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {isRecurring && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Repeat every:
                </span>
                <select
                  value={recurringFreq}
                  onChange={(e) => setRecurringFreq(e.target.value as RecurrenceFrequency)}
                  className="text-xs font-semibold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
                >
                  <option value="daily">Day</option>
                  <option value="weekly">Week</option>
                  <option value="monthly">Month</option>
                  <option value="yearly">Year</option>
                </select>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition active-press flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              {editingTransaction ? 'Save Changes' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
