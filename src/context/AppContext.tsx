import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Transaction,
  Category,
  PaymentMethod,
  Budget,
  RecurringRule,
  AppSettings,
  NavigationTab,
  TransactionType,
  FinancialInsight,
} from '../types';
import {
  StorageService,
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_BUDGETS,
  DEFAULT_SETTINGS,
  generateSampleTransactions,
} from '../db/storage';
import { getTodayDateString } from '../utils/formatters';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  // Data
  transactions: Transaction[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  budgets: Budget[];
  recurring: RecurringRule[];
  settings: AppSettings;
  
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  subView: string | null;
  setSubView: (view: string | null) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;

  // Add / Edit Modal
  isAddTxOpen: boolean;
  addTxInitialType: TransactionType;
  editingTransaction: Transaction | null;
  openAddTransaction: (type?: TransactionType, editTx?: Transaction | null) => void;
  closeAddTransaction: () => void;

  // Security
  isLocked: boolean;
  unlockWithPin: (pin: string) => boolean;
  unlockWithBiometric: () => boolean;
  lockApp: () => void;

  // Transactions CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => void;

  // Categories CRUD
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Payment Methods CRUD
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => void;
  deletePaymentMethod: (id: string) => void;

  // Budgets CRUD
  saveBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;

  // Recurring CRUD
  addRecurring: (rule: Omit<RecurringRule, 'id'>) => void;
  updateRecurring: (id: string, updates: Partial<RecurringRule>) => void;
  deleteRecurring: (id: string) => void;
  processDueRecurring: () => number;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Toast
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Insights
  insights: FinancialInsight[];

  // Data management
  resetAllData: () => void;
  loadSampleData: () => void;
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.loadTransactions());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.loadCategories());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => StorageService.loadPaymentMethods());
  const [budgets, setBudgets] = useState<Budget[]>(() => StorageService.loadBudgets());
  const [recurring, setRecurring] = useState<RecurringRule[]>(() => StorageService.loadRecurring());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.loadSettings());

  // Navigation states
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [subView, setSubView] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  // Transaction Modal
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [addTxInitialType, setAddTxInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Security state
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const s = StorageService.loadSettings();
    return Boolean(s.securityEnabled && s.pinCode);
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to storage
  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.savePaymentMethods(paymentMethods);
  }, [paymentMethods]);

  useEffect(() => {
    StorageService.saveBudgets(budgets);
  }, [budgets]);

  useEffect(() => {
    StorageService.saveRecurring(recurring);
  }, [recurring]);

  useEffect(() => {
    StorageService.saveSettings(settings);
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings]);

  // Handle hardware / browser back button to navigate back cleanly
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isAddTxOpen) {
        setIsAddTxOpen(false);
        return;
      }
      if (subView) {
        setSubView(null);
        return;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAddTxOpen, subView, activeTab]);

  // Push history entry when opening modal or subview for Android back button support
  const openAddTransaction = (type: TransactionType = 'expense', editTx: Transaction | null = null) => {
    setAddTxInitialType(type);
    setEditingTransaction(editTx);
    setIsAddTxOpen(true);
    window.history.pushState({ modal: 'addTx' }, '');
  };

  const closeAddTransaction = () => {
    setIsAddTxOpen(false);
    setEditingTransaction(null);
  };

  const unlockWithPin = (pin: string): boolean => {
    if (pin === settings.pinCode) {
      setIsLocked(false);
      showToast('Unlocked successfully', 'success');
      return true;
    }
    showToast('Incorrect PIN', 'error');
    return false;
  };

  const unlockWithBiometric = (): boolean => {
    if (settings.biometricEnabled) {
      setIsLocked(false);
      showToast('Fingerprint verified', 'success');
      return true;
    }
    showToast('Biometrics not enabled in Settings', 'error');
    return false;
  };

  const lockApp = () => {
    if (settings.securityEnabled && settings.pinCode) {
      setIsLocked(true);
    }
  };

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`${tx.type === 'expense' ? 'Expense' : 'Income'} recorded!`, 'success');
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t))
    );
    showToast('Transaction updated', 'success');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted', 'info');
  };

  const duplicateTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    const duplicated: Transaction = {
      ...target,
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: getTodayDateString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTransactions((prev) => [duplicated, ...prev]);
    showToast('Transaction duplicated to Today', 'success');
  };

  // Category Actions
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${cat.name}" added`, 'success');
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Category updated', 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category deleted', 'info');
  };

  // Payment Methods
  const addPaymentMethod = (pm: Omit<PaymentMethod, 'id'>) => {
    const newPm: PaymentMethod = {
      ...pm,
      id: `pm-${Date.now()}`,
      isCustom: true,
    };
    setPaymentMethods((prev) => [...prev, newPm]);
    showToast(`Payment method "${pm.name}" added`, 'success');
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
    showToast('Payment method removed', 'info');
  };

  // Budgets
  const saveBudget = (budget: Budget) => {
    setBudgets((prev) => {
      const exists = prev.findIndex((b) => b.category === budget.category);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = budget;
        return next;
      }
      return [...prev, { ...budget, id: budget.id || `b-${Date.now()}` }];
    });
    showToast('Budget saved', 'success');
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showToast('Budget removed', 'info');
  };

  // Recurring
  const addRecurring = (rule: Omit<RecurringRule, 'id'>) => {
    const newRule: RecurringRule = {
      ...rule,
      id: `rec-${Date.now()}`,
    };
    setRecurring((prev) => [...prev, newRule]);
    showToast('Recurring rule saved', 'success');
  };

  const updateRecurring = (id: string, updates: Partial<RecurringRule>) => {
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    showToast('Recurring rule updated', 'success');
  };

  const deleteRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
    showToast('Recurring rule deleted', 'info');
  };

  const processDueRecurring = (): number => {
    const today = getTodayDateString();
    let processedCount = 0;
    const newTransactions: Transaction[] = [];

    const updatedRules = recurring.map((rule) => {
      if (!rule.isActive || rule.nextDueDate > today) {
        return rule;
      }

      // Generate transaction
      newTransactions.push({
        id: `tx-rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: rule.type,
        amount: rule.amount,
        category: rule.category,
        subcategory: rule.subcategory,
        date: rule.nextDueDate,
        time: '09:00',
        paymentMethod: rule.paymentMethod,
        note: `[Recurring] ${rule.note || rule.category}`,
        isRecurring: true,
        recurringId: rule.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      processedCount++;

      // Compute next date
      const d = new Date(rule.nextDueDate);
      if (rule.frequency === 'daily') d.setDate(d.getDate() + 1);
      else if (rule.frequency === 'weekly') d.setDate(d.getDate() + 7);
      else if (rule.frequency === 'monthly') d.setMonth(d.getMonth() + 1);
      else if (rule.frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);

      const nextDue = d.toISOString().split('T')[0];
      return {
        ...rule,
        lastProcessedDate: rule.nextDueDate,
        nextDueDate: nextDue,
      };
    });

    if (processedCount > 0) {
      setTransactions((prev) => [...newTransactions, ...prev]);
      setRecurring(updatedRules);
      showToast(`Processed ${processedCount} due recurring transactions!`, 'success');
    }
    return processedCount;
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Settings saved', 'success');
  };

  const resetAllData = () => {
    StorageService.resetAllData();
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    setBudgets([]);
    setRecurring([]);
    setSettings(DEFAULT_SETTINGS);
    setIsLocked(false);
    showToast('All app data cleared', 'info');
  };

  const loadSampleData = () => {
    const samples = generateSampleTransactions();
    setTransactions(samples);
    setCategories(DEFAULT_CATEGORIES);
    setPaymentMethods(DEFAULT_PAYMENT_METHODS);
    setBudgets(DEFAULT_BUDGETS);
    setSettings(DEFAULT_SETTINGS);
    showToast('Sample financial data loaded', 'success');
  };

  const exportBackup = () => {
    return StorageService.exportBackup();
  };

  const importBackup = (json: string): boolean => {
    const success = StorageService.importBackup(json);
    if (success) {
      setTransactions(StorageService.loadTransactions());
      setCategories(StorageService.loadCategories());
      setPaymentMethods(StorageService.loadPaymentMethods());
      setBudgets(StorageService.loadBudgets());
      setRecurring(StorageService.loadRecurring());
      setSettings(StorageService.loadSettings());
      showToast('Data restored successfully', 'success');
      return true;
    }
    showToast('Invalid backup file', 'error');
    return false;
  };

  // Compute smart financial insights dynamically
  const insights = useMemo<FinancialInsight[]>(() => {
    const list: FinancialInsight[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonthStr));
    const lastMonthTxs = transactions.filter((t) => t.date.startsWith(lastMonthStr));

    const curExpense = currentMonthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const lastExpense = lastMonthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Insight 1: Month-over-month spending comparison
    if (lastExpense > 0 && curExpense > 0) {
      const diffPct = Math.round(((curExpense - lastExpense) / lastExpense) * 100);
      if (diffPct > 0) {
        list.push({
          id: 'ins-mom',
          type: 'warning',
          title: 'Spending Up This Month',
          description: `You spent ${diffPct}% more this month than last month (${settings.currencySymbol}${curExpense.toLocaleString()} vs ${settings.currencySymbol}${lastExpense.toLocaleString()}).`,
          icon: 'TrendingUp',
        });
      } else {
        list.push({
          id: 'ins-mom-down',
          type: 'success',
          title: 'Great Savings Progress',
          description: `You have spent ${Math.abs(diffPct)}% less this month compared to last month. Keep it up!`,
          icon: 'Award',
        });
      }
    }

    // Insight 2: Highest spending category
    const categoryTotals: Record<string, number> = {};
    currentMonthTxs
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategoryEntry && curExpense > 0) {
      const topCatPct = Math.round((topCategoryEntry[1] / curExpense) * 100);
      list.push({
        id: 'ins-top-cat',
        type: 'info',
        title: `${topCategoryEntry[0]} is Top Expense`,
        description: `${topCategoryEntry[0]} accounts for ${topCatPct}% (${settings.currencySymbol}${topCategoryEntry[1].toLocaleString()}) of your spending this month.`,
        icon: 'Utensils',
      });
    }

    // Insight 3: Daily Average
    const dayOfMonth = now.getDate();
    if (dayOfMonth > 0 && curExpense > 0) {
      const dailyAvg = Math.round(curExpense / dayOfMonth);
      list.push({
        id: 'ins-daily-avg',
        type: 'info',
        title: 'Average Daily Spending',
        description: `Your average daily expenditure this month is ${settings.currencySymbol}${dailyAvg.toLocaleString()}.`,
        icon: 'Zap',
      });
    }

    // Insight 4: Monthly Budget remaining
    const overallBudget = budgets.find((b) => b.category === 'all');
    if (overallBudget) {
      const remaining = overallBudget.amount - curExpense;
      const pctUsed = Math.round((curExpense / overallBudget.amount) * 100);
      if (remaining > 0) {
        list.push({
          id: 'ins-budget',
          type: pctUsed > 85 ? 'warning' : 'success',
          title: 'Budget Remaining',
          description: `You have ${settings.currencySymbol}${remaining.toLocaleString()} left (${100 - pctUsed}% available) from your monthly limit.`,
          icon: 'Wallet',
        });
      } else {
        list.push({
          id: 'ins-budget-exceeded',
          type: 'warning',
          title: 'Monthly Budget Exceeded',
          description: `You have exceeded your overall monthly budget by ${settings.currencySymbol}${Math.abs(remaining).toLocaleString()}!`,
          icon: 'ShieldCheck',
        });
      }
    }

    return list;
  }, [transactions, budgets, settings]);

  return (
    <AppContext.Provider
      value={{
        transactions,
        categories,
        paymentMethods,
        budgets,
        recurring,
        settings,
        activeTab,
        setActiveTab,
        subView,
        setSubView,
        selectedDate,
        setSelectedDate,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        isAddTxOpen,
        addTxInitialType,
        editingTransaction,
        openAddTransaction,
        closeAddTransaction,
        isLocked,
        unlockWithPin,
        unlockWithBiometric,
        lockApp,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        duplicateTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addPaymentMethod,
        deletePaymentMethod,
        saveBudget,
        deleteBudget,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        processDueRecurring,
        updateSettings,
        toasts,
        showToast,
        removeToast,
        insights,
        resetAllData,
        loadSampleData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
