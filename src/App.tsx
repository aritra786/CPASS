import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SubNavTabs } from './components/SubNavTabs';
import { AddFundsModal } from './components/modals/AddFundsModal';

import { UserDashboard } from './pages/UserDashboard';
import { SendMessage } from './pages/SendMessage';
import { TemplateBuilder } from './pages/TemplateBuilder';
import { WalletBilling } from './pages/WalletBilling';
import { CampaignManager } from './pages/CampaignManager';
import { Reporting } from './pages/Reporting';
import { OptInManager } from './pages/OptInManager';
import { CatalogManager } from './pages/CatalogManager';
import { ContactGroup } from './pages/ContactGroup';
import { ProfileManagement } from './pages/ProfileManagement';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminRates } from './pages/admin/AdminRates';
import { AdminAuthGate } from './pages/admin/AdminAuthGate';
import { UserAuthGate } from './pages/UserAuthGate';

const MainAppLayout: React.FC = () => {
  const { portalMode, setPortalMode, activeTab, isUserLoggedIn } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.startsWith('/admin') || hash === '#/admin' || hash === '#admin') return '/admin';
    return '/';
  });

  const [adminAuthEmail, setAdminAuthEmail] = useState<string | null>(() => {
    return localStorage.getItem('connex_admin_email');
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#/admin' || hash === '#admin') {
        setCurrentRoute('/admin');
        setPortalMode('admin');
      } else {
        setCurrentRoute('/');
        setPortalMode('user');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    handleUrlChange();

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [setPortalMode]);

  const handleAdminSuccess = (email: string) => {
    localStorage.setItem('connex_admin_email', email);
    setAdminAuthEmail(email);
    setPortalMode('admin');
  };

  const handleReturnToUser = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('popstate'));
  };

  // Render view based on activeTab and portalMode
  if (currentRoute === '/admin' || portalMode === 'admin') {
    if (adminAuthEmail !== 'aritra.sardar2805@gmail.com') {
      return (
        <AdminAuthGate
          onAuthenticateSuccess={handleAdminSuccess}
          onReturnToUserPortal={handleReturnToUser}
        />
      );
    }
  }

  if (portalMode !== 'admin' && !isUserLoggedIn) {
    return <UserAuthGate onGoToAdmin={() => setPortalMode('admin')} />;
  }

  const renderMainView = () => {
    if (currentRoute === '/admin' || portalMode === 'admin') {
      switch (activeTab) {
        case 'Admin Users':
          return <AdminUsers />;
        case 'Admin Rates':
          return <AdminRates />;
        case 'Admin Dashboard':
        default:
          return <AdminDashboard />;
      }
    }

    switch (activeTab) {
      case 'Send Message':
        return <SendMessage />;
      case 'Template':
        return <TemplateBuilder />;
      case 'Wallet & Billing':
      case 'Payment Configuration':
        return <WalletBilling onOpenAddFunds={() => setAddFundsOpen(true)} />;
      case 'Campaign Manager':
        return <CampaignManager />;
      case 'Reporting':
        return <Reporting />;
      case 'Opt In':
        return <OptInManager />;
      case 'Catalog Manager':
        return <CatalogManager />;
      case 'Contact Group':
        return <ContactGroup />;
      case 'Profile Management':
      case 'Instant Background Verification':
      case 'Coex User':
        return <ProfileManagement />;
      case 'Dashboard':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex flex-col">
      
      {/* Top Fixed Header */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onOpenAddFunds={() => setAddFundsOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Page Area */}
        <main className="flex-1 lg:pl-64 flex flex-col min-w-0 overflow-y-auto">
          {/* Sub-navigation Tab Bar */}
          <SubNavTabs />

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20">
            {renderMainView()}
          </div>
        </main>
      </div>

      {/* Global Add Funds Modal */}
      <AddFundsModal
        isOpen={addFundsOpen}
        onClose={() => setAddFundsOpen(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
