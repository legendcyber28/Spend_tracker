import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Lock,
  Download,
  Calendar,
  Smartphone,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AndroidStatusBar } from './AndroidStatusBar';
import { AndroidNavigationBar } from './AndroidNavigationBar';
import { BottomNav } from './BottomNav';
import { QuickActionFAB } from './QuickActionFAB';

interface Props {
  children: React.ReactNode;
  onOpenApkModal: () => void;
}

export const AndroidFrame: React.FC<Props> = ({ children, onOpenApkModal }) => {
  const {
    activeTab,
    setActiveTab,
    subView,
    setSubView,
    settings,
    lockApp,
  } = useApp();

  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);

  // Compute title
  const getHeaderTitle = () => {
    if (subView === 'daily') return 'Daily Expenses';
    if (subView === 'monthly') return 'Monthly Analytics';
    if (subView === 'yearly') return 'Yearly Analytics';
    if (subView === 'categories') return 'Categories';
    if (subView === 'payment-methods') return 'Payment Methods';
    if (subView === 'recurring') return 'Recurring Rules';
    if (subView === 'reports') return 'Reports';

    if (activeTab === 'home') return 'Expense Tracker';
    if (activeTab === 'transactions') return 'All Transactions';
    if (activeTab === 'calendar') return 'Calendar View';
    if (activeTab === 'analytics') return 'Analytics';
    if (activeTab === 'budget') return 'Budgets';
    if (activeTab === 'settings') return 'Settings';
    return 'Expense Tracker';
  };

  const handleHeaderBack = () => {
    if (subView) {
      setSubView(null);
    } else if (activeTab !== 'home') {
      setActiveTab('home');
    }
  };

  const showBackButton = Boolean(subView) || activeTab !== 'home';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center sm:p-4 select-none">
      {/* Desktop Helper Toggle for Phone Chassis vs Expanded */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          Android Mobile Preview
        </span>
        <button
          onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
          className="flex items-center gap-1 hover:text-white transition"
          title="Toggle phone chassis frame"
        >
          {isDesktopExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" /> Phone Frame
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" /> Full Width
            </>
          )}
        </button>
      </div>

      {/* Main Android Device Container */}
      <div
        className={`w-full ${
          isDesktopExpanded ? 'max-w-2xl' : 'max-w-md'
        } bg-slate-100 dark:bg-slate-950 sm:rounded-[42px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 flex flex-col h-screen sm:h-[860px] max-h-screen relative overflow-hidden transition-all duration-300`}
      >
        {/* Android Punch-hole Camera (aesthetic for phone chassis) */}
        <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rounded-full z-40 border border-slate-800" />

        {/* 1. Android Status Bar */}
        <AndroidStatusBar />

        {/* 2. Top App Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between z-20 shadow-xs border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            {showBackButton ? (
              <button
                onClick={handleHeaderBack}
                className="p-1.5 -ml-1 text-slate-300 hover:text-white active:bg-slate-800 rounded-full transition"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center p-0.5">
                <img src="/icon.svg" alt="App Logo" className="w-5 h-5" />
              </div>
            )}
            <h1 className="text-base font-bold tracking-tight">{getHeaderTitle()}</h1>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1">
            {/* Quick Calendar button */}
            {activeTab !== 'calendar' && !subView && (
              <button
                onClick={() => setActiveTab('calendar')}
                className="p-2 text-slate-300 hover:text-white active:bg-slate-800 rounded-full transition"
                aria-label="Calendar view"
              >
                <Calendar className="w-4 h-4" />
              </button>
            )}

            {/* Quick APK button */}
            <button
              onClick={onOpenApkModal}
              className="p-2 text-emerald-400 hover:text-emerald-300 active:bg-slate-800 rounded-full transition"
              title="Download or install APK"
              aria-label="APK Export"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Quick Lock if security enabled */}
            {settings.securityEnabled && (
              <button
                onClick={lockApp}
                className="p-2 text-slate-300 hover:text-white active:bg-slate-800 rounded-full transition"
                title="Lock Application"
                aria-label="Lock App"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto px-4 py-3 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 no-scrollbar relative">
          {children}
        </main>

        {/* 4. Floating Action Button (+) */}
        <QuickActionFAB />

        {/* 5. Android Bottom Navigation Tabs */}
        <BottomNav />

        {/* 6. Android System Navigation Gesture Bar */}
        <AndroidNavigationBar
          onBack={handleHeaderBack}
          onHome={() => {
            setSubView(null);
            setActiveTab('home');
          }}
        />
      </div>
    </div>
  );
};
