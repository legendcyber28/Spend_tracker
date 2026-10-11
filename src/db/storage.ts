import {
  Transaction,
  Category,
  PaymentMethod,
  Budget,
  RecurringRule,
  AppSettings,
} from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: 'exp-food',
    name: 'Food',
    type: 'expense',
    icon: 'Utensils',
    color: '#f97316',
    subcategories: ['Restaurant', 'Takeout', 'Snacks', 'Coffee', 'Dining Out'],
  },
  {
    id: 'exp-groceries',
    name: 'Groceries',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#10b981',
    subcategories: ['Supermarket', 'Vegetables & Fruits', 'Dairy', 'Spices & Staples'],
  },
  {
    id: 'exp-transport',
    name: 'Transportation',
    type: 'expense',
    icon: 'Car',
    color: '#06b6d4',
    subcategories: ['Metro', 'Bus', 'Cab / Auto', 'Train', 'Parking', 'Toll'],
  },
  {
    id: 'exp-fuel',
    name: 'Fuel',
    type: 'expense',
    icon: 'Fuel',
    color: '#ef4444',
    subcategories: ['Petrol', 'Diesel', 'CNG', 'EV Charging'],
  },
  {
    id: 'exp-shopping',
    name: 'Shopping',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#ec4899',
    subcategories: ['Clothing', 'Footwear', 'Electronics', 'Home Decor', 'Accessories'],
  },
  {
    id: 'exp-bills',
    name: 'Bills & Utilities',
    type: 'expense',
    icon: 'Zap',
    color: '#eab308',
    subcategories: ['Electricity', 'Water', 'Gas Cylinder', 'Broadband / WiFi', 'Mobile Recharge'],
  },
  {
    id: 'exp-rent',
    name: 'Rent',
    type: 'expense',
    icon: 'Home',
    color: '#8b5cf6',
    subcategories: ['House Rent', 'Maintenance', 'Office Space'],
  },
  {
    id: 'exp-healthcare',
    name: 'Healthcare',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#14b8a6',
    subcategories: ['Doctor Consultation', 'Medicines', 'Lab Tests', 'Dental'],
  },
  {
    id: 'exp-education',
    name: 'Education',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#3b82f6',
    subcategories: ['Tuition Fee', 'Books & Stationery', 'Online Courses', 'Certification'],
  },
  {
    id: 'exp-entertainment',
    name: 'Entertainment',
    type: 'expense',
    icon: 'Film',
    color: '#a855f7',
    subcategories: ['Movies', 'Concerts', 'Gaming', 'Outing', 'Theme Parks'],
  },
  {
    id: 'exp-travel',
    name: 'Travel',
    type: 'expense',
    icon: 'Plane',
    color: '#0284c7',
    subcategories: ['Flight Tickets', 'Hotel Stay', 'Tour Packages', 'Sightseeing'],
  },
  {
    id: 'exp-personal-care',
    name: 'Personal Care',
    type: 'expense',
    icon: 'Sparkles',
    color: '#d946ef',
    subcategories: ['Salon & Barber', 'Skincare', 'Spa', 'Gym & Fitness'],
  },
  {
    id: 'exp-subscriptions',
    name: 'Subscriptions',
    type: 'expense',
    icon: 'Tv',
    color: '#6366f1',
    subcategories: ['Netflix / Prime', 'Spotify / Music', 'Cloud Storage', 'Software'],
  },
  {
    id: 'exp-emi-loans',
    name: 'EMI / Loans',
    type: 'expense',
    icon: 'CreditCard',
    color: '#f43f5e',
    subcategories: ['Home Loan', 'Car Loan', 'Personal Loan', 'Credit Card EMI'],
  },
  {
    id: 'exp-insurance',
    name: 'Insurance',
    type: 'expense',
    icon: 'ShieldCheck',
    color: '#475569',
    subcategories: ['Health Insurance', 'Vehicle Insurance', 'Term Life Insurance'],
  },
  {
    id: 'exp-gifts',
    name: 'Gifts',
    type: 'expense',
    icon: 'Gift',
    color: '#f59e0b',
    subcategories: ['Birthday', 'Anniversary', 'Festival', 'Wedding'],
  },
  {
    id: 'exp-family',
    name: 'Family',
    type: 'expense',
    icon: 'Users',
    color: '#84cc16',
    subcategories: ['Parents Allowance', 'Kids Expenses', 'Household Help'],
  },
  {
    id: 'exp-other',
    name: 'Other',
    type: 'expense',
    icon: 'HelpCircle',
    color: '#64748b',
    subcategories: ['Miscellaneous', 'Unplanned'],
  },

  // Income Categories
  {
    id: 'inc-salary',
    name: 'Salary',
    type: 'income',
    icon: 'Briefcase',
    color: '#10b981',
    subcategories: ['Full-time Salary', 'Advance Salary', 'Overtime'],
  },
  {
    id: 'inc-freelance',
    name: 'Freelance',
    type: 'income',
    icon: 'Laptop',
    color: '#06b6d4',
    subcategories: ['Consulting', 'Design Project', 'Development Work', 'Content Writing'],
  },
  {
    id: 'inc-business',
    name: 'Business',
    type: 'income',
    icon: 'Store',
    color: '#3b82f6',
    subcategories: ['Client Sales', 'Service Revenue', 'Partnership Share'],
  },
  {
    id: 'inc-investment',
    name: 'Investment',
    type: 'income',
    icon: 'TrendingUp',
    color: '#8b5cf6',
    subcategories: ['Stock Dividends', 'Mutual Funds Return', 'Fixed Deposit Interest', 'Crypto'],
  },
  {
    id: 'inc-bonus',
    name: 'Bonus',
    type: 'income',
    icon: 'Award',
    color: '#eab308',
    subcategories: ['Performance Bonus', 'Festive Bonus', 'Referral Bonus'],
  },
  {
    id: 'inc-gift',
    name: 'Gift',
    type: 'income',
    icon: 'Gift',
    color: '#ec4899',
    subcategories: ['Cash Gift', 'Family Support'],
  },
  {
    id: 'inc-other',
    name: 'Other',
    type: 'income',
    icon: 'DollarSign',
    color: '#64748b',
    subcategories: ['Cashback', 'Refund', 'Rental Income'],
  },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm-upi', name: 'UPI', icon: 'Smartphone' },
  { id: 'pm-cash', name: 'Cash', icon: 'Banknote' },
  { id: 'pm-debit', name: 'Debit Card', icon: 'CreditCard' },
  { id: 'pm-credit', name: 'Credit Card', icon: 'CreditCard' },
  { id: 'pm-bank', name: 'Bank Transfer', icon: 'Building' },
  { id: 'pm-wallet', name: 'Wallet', icon: 'Wallet' },
  { id: 'pm-other', name: 'Other', icon: 'MoreHorizontal' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'INR',
  currencySymbol: '₹',
  currencyPosition: 'prefix',
  theme: 'system',
  securityEnabled: false,
  pinCode: '',
  biometricEnabled: false,
  notifications: {
    dailyReminder: true,
    budgetWarning: true,
    recurringPaymentReminder: true,
    monthlySummary: true,
  },
  budgetThreshold75: true,
  budgetThreshold90: true,
  budgetThreshold100: true,
};

export const DEFAULT_BUDGETS: Budget[] = [
  { id: 'b-overall', category: 'all', amount: 35000, period: 'monthly' },
  { id: 'b-food', category: 'Food', amount: 8000, period: 'monthly' },
  { id: 'b-groceries', category: 'Groceries', amount: 6000, period: 'monthly' },
  { id: 'b-transport', category: 'Transportation', amount: 3500, period: 'monthly' },
  { id: 'b-shopping', category: 'Shopping', amount: 5000, period: 'monthly' },
  { id: 'b-bills', category: 'Bills & Utilities', amount: 4500, period: 'monthly' },
];

export const DEFAULT_RECURRING: RecurringRule[] = [
  {
    id: 'rec-rent',
    type: 'expense',
    amount: 14000,
    category: 'Rent',
    subcategory: 'House Rent',
    paymentMethod: 'UPI',
    note: 'Apartment monthly rent',
    frequency: 'monthly',
    startDate: '2026-09-01',
    nextDueDate: '2026-11-01',
    isActive: true,
  },
  {
    id: 'rec-wifi',
    type: 'expense',
    amount: 999,
    category: 'Bills & Utilities',
    subcategory: 'Broadband / WiFi',
    paymentMethod: 'Credit Card',
    note: 'Fiber broadband bill',
    frequency: 'monthly',
    startDate: '2026-09-15',
    nextDueDate: '2026-10-15',
    isActive: true,
  },
  {
    id: 'rec-salary',
    type: 'income',
    amount: 65000,
    category: 'Salary',
    subcategory: 'Full-time Salary',
    paymentMethod: 'Bank Transfer',
    note: 'Monthly salary credit',
    frequency: 'monthly',
    startDate: '2026-09-01',
    nextDueDate: '2026-11-01',
    isActive: true,
  },
];

export const generateSampleTransactions = (): Transaction[] => {
  // Let's create sensible realistic transactions around current date (October 2026)
  return [
    {
      id: 'tx-1',
      type: 'income',
      amount: 65000,
      category: 'Salary',
      subcategory: 'Full-time Salary',
      date: '2026-10-01',
      time: '09:30',
      paymentMethod: 'Bank Transfer',
      note: 'October Salary credited',
      createdAt: Date.now() - 9 * 86400000,
      updatedAt: Date.now() - 9 * 86400000,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 14000,
      category: 'Rent',
      subcategory: 'House Rent',
      date: '2026-10-02',
      time: '11:00',
      paymentMethod: 'UPI',
      note: 'Monthly apartment rent paid to owner',
      createdAt: Date.now() - 8 * 86400000,
      updatedAt: Date.now() - 8 * 86400000,
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 2450,
      category: 'Groceries',
      subcategory: 'Supermarket',
      date: '2026-10-03',
      time: '18:45',
      paymentMethod: 'Credit Card',
      note: 'Weekly essentials & snacks',
      createdAt: Date.now() - 7 * 86400000,
      updatedAt: Date.now() - 7 * 86400000,
    },
    {
      id: 'tx-4',
      type: 'expense',
      amount: 680,
      category: 'Food',
      subcategory: 'Dining Out',
      date: '2026-10-04',
      time: '13:20',
      paymentMethod: 'UPI',
      note: 'Lunch at Cafe Nirvana',
      createdAt: Date.now() - 6 * 86400000,
      updatedAt: Date.now() - 6 * 86400000,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 1200,
      category: 'Fuel',
      subcategory: 'Petrol',
      date: '2026-10-05',
      time: '08:50',
      paymentMethod: 'UPI',
      note: 'Full tank petrol for bike',
      createdAt: Date.now() - 5 * 86400000,
      updatedAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'tx-6',
      type: 'income',
      amount: 12500,
      category: 'Freelance',
      subcategory: 'Development Work',
      date: '2026-10-06',
      time: '15:10',
      paymentMethod: 'UPI',
      note: 'Landing page dev milestone payout',
      createdAt: Date.now() - 4 * 86400000,
      updatedAt: Date.now() - 4 * 86400000,
    },
    {
      id: 'tx-7',
      type: 'expense',
      amount: 1850,
      category: 'Shopping',
      subcategory: 'Clothing',
      date: '2026-10-07',
      time: '19:15',
      paymentMethod: 'Debit Card',
      note: 'Casual polo shirts',
      createdAt: Date.now() - 3 * 86400000,
      updatedAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 450,
      category: 'Food',
      subcategory: 'Coffee',
      date: '2026-10-08',
      time: '16:00',
      paymentMethod: 'UPI',
      note: 'Starbucks coffee with colleague',
      createdAt: Date.now() - 2 * 86400000,
      updatedAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'tx-9',
      type: 'expense',
      amount: 320,
      category: 'Transportation',
      subcategory: 'Cab / Auto',
      date: '2026-10-09',
      time: '21:10',
      paymentMethod: 'UPI',
      note: 'Uber cab ride back from meetup',
      createdAt: Date.now() - 1 * 86400000,
      updatedAt: Date.now() - 1 * 86400000,
    },
    {
      id: 'tx-10',
      type: 'expense',
      amount: 280,
      category: 'Food',
      subcategory: 'Restaurant',
      date: '2026-10-10',
      time: '13:00',
      paymentMethod: 'UPI',
      note: 'Thali lunch at South Corner',
      createdAt: Date.now() - 1800000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: 'tx-11',
      type: 'expense',
      amount: 120,
      category: 'Transportation',
      subcategory: 'Metro',
      date: '2026-10-10',
      time: '09:15',
      paymentMethod: 'Cash',
      note: 'Metro card topup',
      createdAt: Date.now() - 14400000,
      updatedAt: Date.now() - 14400000,
    },
    {
      id: 'tx-12',
      type: 'expense',
      amount: 3500,
      category: 'Bills & Utilities',
      subcategory: 'Electricity',
      date: '2026-09-28',
      time: '10:30',
      paymentMethod: 'UPI',
      note: 'September state electricity bill',
      createdAt: Date.now() - 12 * 86400000,
      updatedAt: Date.now() - 12 * 86400000,
    },
    {
      id: 'tx-13',
      type: 'expense',
      amount: 4200,
      category: 'Shopping',
      subcategory: 'Electronics',
      date: '2026-09-25',
      time: '17:00',
      paymentMethod: 'Credit Card',
      note: 'Noise-canceling earphones',
      createdAt: Date.now() - 15 * 86400000,
      updatedAt: Date.now() - 15 * 86400000,
    },
    {
      id: 'tx-14',
      type: 'income',
      amount: 65000,
      category: 'Salary',
      subcategory: 'Full-time Salary',
      date: '2026-09-01',
      time: '09:30',
      paymentMethod: 'Bank Transfer',
      note: 'September Salary credited',
      createdAt: Date.now() - 39 * 86400000,
      updatedAt: Date.now() - 39 * 86400000,
    },
  ];
};

const STORAGE_KEYS = {
  TRANSACTIONS: 'et_transactions',
  CATEGORIES: 'et_categories',
  PAYMENT_METHODS: 'et_payment_methods',
  BUDGETS: 'et_budgets',
  RECURRING: 'et_recurring',
  SETTINGS: 'et_settings',
  INITIALIZED: 'et_initialized_v2',
};

export class StorageService {
  static loadTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        const samples = generateSampleTransactions();
        this.saveTransactions(samples);
        return samples;
      }
      return JSON.parse(data);
    } catch {
      return generateSampleTransactions();
    }
  }

  static saveTransactions(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }

  static loadCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  static saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  }

  static loadPaymentMethods(): PaymentMethod[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
      if (!data) {
        this.savePaymentMethods(DEFAULT_PAYMENT_METHODS);
        return DEFAULT_PAYMENT_METHODS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PAYMENT_METHODS;
    }
  }

  static savePaymentMethods(methods: PaymentMethod[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
    } catch (e) {
      console.error('Failed to save payment methods', e);
    }
  }

  static loadBudgets(): Budget[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        this.saveBudgets(DEFAULT_BUDGETS);
        return DEFAULT_BUDGETS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_BUDGETS;
    }
  }

  static saveBudgets(budgets: Budget[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }

  static loadRecurring(): RecurringRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING);
      if (!data) {
        this.saveRecurring(DEFAULT_RECURRING);
        return DEFAULT_RECURRING;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_RECURRING;
    }
  }

  static saveRecurring(rules: RecurringRule[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(rules));
    } catch (e) {
      console.error('Failed to save recurring rules', e);
    }
  }

  static loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        this.saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  static exportBackup(): string {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      transactions: this.loadTransactions(),
      categories: this.loadCategories(),
      paymentMethods: this.loadPaymentMethods(),
      budgets: this.loadBudgets(),
      recurring: this.loadRecurring(),
      settings: this.loadSettings(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  static importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.transactions)) {
        this.saveTransactions(data.transactions);
      }
      if (Array.isArray(data.categories)) {
        this.saveCategories(data.categories);
      }
      if (Array.isArray(data.paymentMethods)) {
        this.savePaymentMethods(data.paymentMethods);
      }
      if (Array.isArray(data.budgets)) {
        this.saveBudgets(data.budgets);
      }
      if (Array.isArray(data.recurring)) {
        this.saveRecurring(data.recurring);
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings(data.settings);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  static resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENT_METHODS);
    localStorage.removeItem(STORAGE_KEYS.BUDGETS);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  }
}
