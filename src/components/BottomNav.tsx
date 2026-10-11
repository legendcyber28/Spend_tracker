import React from 'react';
import { Home, Receipt, PieChart, Wallet, Settings, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openAddTransaction, setSubView } = useApp();

  const navItems: { tab: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'transactions', label: 'History', icon: Receipt },
    { tab: 'analytics', label: 'Analytics', icon: PieChart },
    { tab: 'budget', label: 'Budget', icon: Wallet },
    { tab: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    setSubView(null);
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 select-none z-20">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item, index) => {
          const isActive = activeTab === item.tab;
          const Icon = item.icon;

          // Insert space or standard tab
          return (
            <button
              key={item.tab}
              onClick={() => handleTabClick(item.tab)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                  isActive ? 'bg-emerald-100 dark:bg-emerald-950/80' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
