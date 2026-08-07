import React from 'react';
import { useApp } from '../context/AppContext';

export const SubNavTabs: React.FC = () => {
  const { activeTab, setActiveTab, portalMode } = useApp();

  if (portalMode === 'admin') {
    const adminTabs = [
      { name: 'Admin Dashboard', label: 'Platform Overview' },
      { name: 'Admin Users', label: 'Tenant Accounts' },
      { name: 'Admin Rates', label: 'Rate Cards & Margins' },
      { name: 'Supabase SQL Editor', label: 'Supabase SQL Studio' }
    ];

    return (
      <div className="border-b border-slate-200 mb-6 bg-white px-4 pt-2">
        <nav className="flex space-x-6 overflow-x-auto no-scrollbar">
          {adminTabs.map(tab => {
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  const userTabs = [
    'Dashboard',
    'Send Message',
    'Campaign Manager',
    'Reporting',
    'Template',
    'Opt In',
    'Contact Group',
    'Wallet & Billing'
  ];

  return (
    <div className="border-b border-slate-200 mb-6 bg-white px-4 sm:px-6 pt-2">
      <nav className="flex space-x-6 overflow-x-auto no-scrollbar">
        {userTabs.map(tabName => {
          const isActive = activeTab === tabName;
          return (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tabName}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
