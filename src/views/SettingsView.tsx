import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Smartphone,
  Shield,
  Bell,
  Database,
  Info,
  ChevronRight,
  Download,
  Upload,
  Trash2,
  Lock,
  Fingerprint,
  RotateCcw,
  Layers,
  CreditCard,
  Repeat,
  FileText,
  DollarSign,
  Package,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENCIES, exportTransactionsToCSV, downloadFile } from '../utils/formatters';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface Props {
  onOpenApkModal: () => void;
}

export const SettingsView: React.FC<Props> = ({ onOpenApkModal }) => {
  const {
    settings,
    updateSettings,
    transactions,
    resetAllData,
    loadSampleData,
    exportBackup,
    importBackup,
    setSubView,
    showToast,
  } = useApp();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Handle Backup Export
  const handleExportBackup = () => {
    const backupJson = exportBackup();
    downloadFile(backupJson, `expense-tracker-backup-${Date.now()}.json`, 'application/json');
    showToast('Backup file downloaded', 'success');
  };

  // Handle Backup Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        importBackup(text);
      };
      reader.readAsText(file);
    }
  };

  const handleExportCSV = () => {
    const csv = exportTransactionsToCSV(transactions, settings);
    downloadFile(csv, `expense-tracker-transactions-${Date.now()}.csv`);
    showToast('Transactions CSV exported', 'success');
  };

  // Handle PIN Save
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      showToast('PIN must be exactly 4 digits', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('PINs do not match', 'error');
      return;
    }

    updateSettings({
      securityEnabled: true,
      pinCode: newPin,
    });
    setShowPinModal(false);
    setNewPin('');
    setConfirmPin('');
    showToast('App PIN set successfully', 'success');
  };

  const handleRemovePin = () => {
    updateSettings({
      securityEnabled: false,
      pinCode: '',
      biometricEnabled: false,
    });
    showToast('App PIN removed', 'info');
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Top Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-xs text-slate-400">Preferences, security, and data management</p>
      </div>

      {/* APK & Mobile Installation Banner */}
      <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl shadow-lg flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <Package className="w-4 h-4" />
            <span>Install on Android Phone</span>
          </div>
          <p className="text-[11px] text-emerald-100 max-w-[210px] leading-tight">
            Export APK, configure Android Studio, or install instantly as WebAPK PWA.
          </p>
        </div>
        <button
          onClick={onOpenApkModal}
          className="px-3.5 py-2 rounded-xl bg-white text-emerald-800 text-xs font-extrabold hover:bg-emerald-50 active-press shadow-md"
        >
          Export APK
        </button>
      </div>

      {/* 1. Appearance Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
          <Sun className="w-4 h-4 text-emerald-500" /> Appearance
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Smartphone },
          ].map((item) => {
            const isSel = settings.theme === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => updateSettings({ theme: item.id as any })}
                className={`py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition active-press ${
                  isSel
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Currency Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" /> Currency
        </h3>

        <div className="grid grid-cols-3 gap-1.5">
          {CURRENCIES.map((curr) => {
            const isSel = settings.currency === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() =>
                  updateSettings({
                    currency: curr.code,
                    currencySymbol: curr.symbol,
                  })
                }
                className={`py-2 px-2 rounded-xl text-xs font-bold transition ${
                  isSel
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {curr.code} ({curr.symbol})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Manage Sections Links */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
        <button
          onClick={() => setSubView('categories')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white">Manage Categories & Subcategories</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setSubView('payment-methods')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition"
        >
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white">Manage Payment Methods</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setSubView('recurring')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition"
        >
          <div className="flex items-center gap-2.5">
            <Repeat className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white">Recurring Transactions</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setSubView('reports')}
          className="w-full p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white">Reports & Statements</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 4. Security Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" /> Security & App Lock
        </h3>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">4-Digit App PIN</span>
            <span className="text-[11px] text-slate-400">
              {settings.securityEnabled ? 'PIN lock is active' : 'Lock your app with a PIN code'}
            </span>
          </div>

          {settings.securityEnabled ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPinModal(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                Change
              </button>
              <button
                onClick={handleRemovePin}
                className="text-xs text-rose-500 font-semibold"
              >
                Disable
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPinModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Set PIN
            </button>
          )}
        </div>

        {/* Biometric Toggle */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Fingerprint / Biometrics</span>
              <span className="text-[11px] text-slate-400">Unlock quickly using fingerprint</span>
            </div>
          </div>

          <input
            type="checkbox"
            checked={settings.biometricEnabled}
            onChange={(e) => updateSettings({ biometricEnabled: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 5. Notifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-500" /> Notifications & Alerts
        </h3>

        {[
          { key: 'dailyReminder', label: 'Daily expense reminder', desc: 'Notification to record your daily expenses' },
          { key: 'budgetWarning', label: 'Budget limit warnings', desc: 'Alert when 75% and 90% budget is consumed' },
          { key: 'recurringPaymentReminder', label: 'Recurring payment reminders', desc: 'Alert on upcoming bill due dates' },
          { key: 'monthlySummary', label: 'Monthly financial summary', desc: 'Overview statement on 1st of month' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">{item.label}</span>
              <span className="text-[11px] text-slate-400">{item.desc}</span>
            </div>
            <input
              type="checkbox"
              checked={(settings.notifications as any)[item.key]}
              onChange={(e) =>
                updateSettings({
                  notifications: {
                    ...settings.notifications,
                    [item.key]: e.target.checked,
                  },
                })
              }
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* 6. Data Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-500" /> Data Backup & Restore
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={handleExportBackup}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 active-press"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" /> Backup JSON
          </button>

          <label className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer active-press">
            <Upload className="w-3.5 h-3.5 text-blue-500" /> Restore JSON
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 active-press"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" /> Export CSV
          </button>

          <button
            onClick={loadSampleData}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 active-press"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-500" /> Load Sample Data
          </button>
        </div>

        <div className="pt-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 active-press transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All App Data
          </button>
        </div>
      </div>

      {/* 7. About Application */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 text-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-500" /> About Expense Tracker
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
          Expense Tracker is a fast, offline-first personal finance application engineered for Android.
          Your data is encrypted and saved strictly on your local device without external tracking.
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Release Edition</span>
          <span className="font-mono font-bold text-slate-600 dark:text-slate-300">v1.0.0 (Android APK ready)</span>
        </div>
      </div>

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Set 4-Digit Security PIN</h3>
            <form onSubmit={handleSavePin} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Enter 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-xl font-bold p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Confirm PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-widest text-xl font-bold p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md"
                >
                  Enable PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirm}
        title="Clear All Application Data?"
        message="This action will permanently delete all recorded expenses, income, custom categories, and budgets from this device. Are you sure you want to proceed?"
        confirmLabel="Erase Everything"
        isDestructive={true}
        onConfirm={() => {
          resetAllData();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
