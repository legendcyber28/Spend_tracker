import { AppSettings, Transaction } from '../types';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
];

export function formatCurrency(amount: number, settings?: Partial<AppSettings>): string {
  const symbol = settings?.currencySymbol || '₹';
  const pos = settings?.currencyPosition || 'prefix';
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  if (pos === 'suffix') {
    return `${amount < 0 ? '-' : ''}${formatted} ${symbol}`;
  }
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getRelativeDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return formatDatePretty(dateStr);
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function exportTransactionsToCSV(transactions: Transaction[], settings: AppSettings): string {
  const headers = ['ID', 'Type', 'Amount', 'Currency', 'Category', 'Subcategory', 'Date', 'Time', 'Payment Method', 'Note', 'Recurring'];
  const rows = transactions.map((t) => [
    t.id,
    t.type,
    t.amount,
    settings.currency,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.subcategory || '').replace(/"/g, '""')}"`,
    t.date,
    t.time,
    `"${(t.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
    t.isRecurring ? 'Yes' : 'No',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadFile(content: string, filename: string, type = 'text/csv'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
