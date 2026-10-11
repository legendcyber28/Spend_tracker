export type TransactionType = 'expense' | 'income';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  subcategories: string[];
  isCustom?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  subcategory?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: string;
  note?: string;
  receiptImage?: string; // base64 or object url
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Budget {
  id: string;
  category: string; // 'all' or category name
  amount: number;
  period: 'monthly';
  alertThreshold75?: boolean;
  alertThreshold90?: boolean;
}

export interface RecurringRule {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  subcategory?: string;
  paymentMethod: string;
  note?: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  nextDueDate: string;
  isActive: boolean;
  lastProcessedDate?: string;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  currencyPosition: 'prefix' | 'suffix';
  theme: 'light' | 'dark' | 'system';
  securityEnabled: boolean;
  pinCode?: string;
  biometricEnabled: boolean;
  notifications: {
    dailyReminder: boolean;
    budgetWarning: boolean;
    recurringPaymentReminder: boolean;
    monthlySummary: boolean;
  };
  budgetThreshold75: boolean;
  budgetThreshold90: boolean;
  budgetThreshold100: boolean;
}

export type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export type NavigationTab = 'home' | 'transactions' | 'calendar' | 'analytics' | 'budget' | 'settings';

export interface FinancialInsight {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  icon: string;
}
