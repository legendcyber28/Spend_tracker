import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AndroidFrame } from './components/AndroidFrame';
import { SplashScreen } from './components/SplashScreen';
import { PinLockScreen } from './components/PinLockScreen';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ToastContainer } from './components/Toast';
import { ApkExportModal } from './components/ApkExportModal';

// Views
import { HomeView } from './views/HomeView';
import { TransactionsView } from './views/TransactionsView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { BudgetView } from './views/BudgetView';
import { SettingsView } from './views/SettingsView';
import { DailyView } from './views/DailyView';
import { MonthlyView } from './views/MonthlyView';
import { YearlyView } from './views/YearlyView';
import { CategoryManagerView } from './views/CategoryManagerView';
import { PaymentMethodsView } from './views/PaymentMethodsView';
import { RecurringView } from './views/RecurringView';
import { ReportsView } from './views/ReportsView';

const MainScreen: React.FC = () => {
  const { activeTab, subView, isLocked } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Splash Screen on initial launch
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Pin Lock screen if security is enabled and locked
  if (isLocked) {
    return <PinLockScreen />;
  }

  // Render subviews or main navigation tabs
  const renderContent = () => {
    if (subView === 'daily') return <DailyView />;
    if (subView === 'monthly') return <MonthlyView />;
    if (subView === 'yearly') return <YearlyView />;
    if (subView === 'categories') return <CategoryManagerView />;
    if (subView === 'payment-methods') return <PaymentMethodsView />;
    if (subView === 'recurring') return <RecurringView />;
    if (subView === 'reports') return <ReportsView />;

    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'transactions':
        return <TransactionsView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'budget':
        return <BudgetView />;
      case 'settings':
        return <SettingsView onOpenApkModal={() => setIsApkModalOpen(true)} />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      <AndroidFrame onOpenApkModal={() => setIsApkModalOpen(true)}>
        {renderContent()}
      </AndroidFrame>

      {/* Global Modals & Notifications */}
      <AddTransactionModal />
      <ToastContainer />
      <ApkExportModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainScreen />
    </AppProvider>
  );
}
