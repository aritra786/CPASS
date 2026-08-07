import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChannelType } from '../types';
import {
  MessageSquare,
  MessageCircle,
  PhoneCall,
  Link,
  LayoutDashboard,
  Send,
  ListOrdered,
  BarChart2,
  FileText,
  CheckCircle2,
  User,
  ShoppingBag,
  Users,
  CreditCard,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  ShieldAlert,
  SlidersHorizontal,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen
}) => {
  const {
    portalMode,
    setPortalMode,
    activeChannel,
    setActiveChannel,
    activeTab,
    setActiveTab,
    logoutUser,
    logoutAdmin,
    tenants,
    selectedAccountId
  } = useApp();

  const currentTenant = tenants.find(t => t.accountId === selectedAccountId);

  // Track expanded channels
  const [expandedChannels, setExpandedChannels] = useState<Record<ChannelType, boolean>>({
    RCS: true,
    WhatsApp: true,
    Viber: false,
    Acculync: false,
    'SMS Fallback': false,
    SMS: false
  });

  const toggleChannel = (ch: ChannelType) => {
    setExpandedChannels(prev => ({
      ...prev,
      [ch]: !prev[ch]
    }));
    setActiveChannel(ch);
  };

  const channelIcons: Partial<Record<ChannelType, React.ReactNode>> = {
    RCS: <MessageSquare className="w-4 h-4 text-blue-600" />,
    WhatsApp: <MessageCircle className="w-4 h-4 text-emerald-600" />,
    Viber: <PhoneCall className="w-4 h-4 text-purple-600" />,
    Acculync: <Link className="w-4 h-4 text-amber-600" />,
    'SMS Fallback': <MessageSquare className="w-4 h-4 text-slate-600" />,
    SMS: <MessageSquare className="w-4 h-4 text-slate-600" />
  };

  const channelList: ChannelType[] = React.useMemo(() => {
    const userType = currentTenant?.userType;
    if (userType === 'WhatsApp') return ['WhatsApp'];
    if (userType === 'RCS') return ['RCS'];
    return ['RCS', 'WhatsApp', 'Viber', 'Acculync'];
  }, [currentTenant?.userType]);

  const subMenuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Send Message', icon: <Send className="w-4 h-4" /> },
    { name: 'Campaign Manager', icon: <ListOrdered className="w-4 h-4" /> },
    { name: 'Reporting', icon: <BarChart2 className="w-4 h-4" /> },
    { name: 'Template', icon: <FileText className="w-4 h-4" /> },
    { name: 'Opt In', icon: <CheckCircle2 className="w-4 h-4" /> },
    { name: 'Profile Management', icon: <User className="w-4 h-4" /> },
    { name: 'Catalog Manager', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'Contact Group', icon: <Users className="w-4 h-4" /> },
    { name: 'Wallet & Billing', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Instant Background Verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { name: 'Coex User', icon: <UserCheck className="w-4 h-4" /> }
  ];

  const adminMenuItems = [
    { id: 'admin_dashboard', tab: 'Admin Dashboard', name: 'Platform Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'admin_users', tab: 'Admin Users', name: 'Tenant Management', icon: <Users className="w-4 h-4" /> },
    { id: 'admin_rates', tab: 'Admin Rates', name: 'Rate Cards & Margins', icon: <SlidersHorizontal className="w-4 h-4" /> }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

          {/* User Portal Products Section */}
          {portalMode === 'user' ? (
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                PRODUCTS
              </div>

              <div className="space-y-1.5">
                {channelList.map(ch => {
                  const isChannelActive = activeChannel === ch;
                  const isExpanded = expandedChannels[ch];

                  return (
                    <div key={ch} className="rounded-xl overflow-hidden">
                      {/* Channel Header Toggle */}
                      <button
                        onClick={() => toggleChannel(ch)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                          isChannelActive
                            ? 'bg-blue-50/80 text-blue-700 border border-blue-200/60 font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {channelIcons[ch]}
                          <span className="text-sm">{ch}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* Sub-menu Items (Expanded under active channel) */}
                      {isExpanded && isChannelActive && (
                        <div className="mt-1 ml-2 pl-3 border-l-2 border-blue-200 space-y-0.5 py-1">
                          {subMenuItems.map(item => {
                            const isTabActive = activeTab === item.name;
                            return (
                              <button
                                key={item.name}
                                onClick={() => {
                                  setActiveTab(item.name);
                                  if (window.innerWidth < 1024) setSidebarOpen(false);
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-all text-left ${
                                  isTabActive
                                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                }`}
                              >
                                {item.icon}
                                <span className="truncate">{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Admin Portal Route Access */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setPortalMode('admin');
                    setActiveTab('Admin Dashboard');
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className="w-full px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl font-bold text-xs flex items-center justify-between transition-colors shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <span>Admin Portal</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-indigo-200/60 text-indigo-900 rounded font-semibold">
                    /admin
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Admin Portal Controls */
            <div>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  SYSTEM ADMINISTRATION
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-100 text-indigo-700 rounded">
                  ADMIN
                </span>
              </div>

              <div className="space-y-1">
                {adminMenuItems.map(item => {
                  const isTabActive = activeTab === item.tab;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.tab);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all text-left ${
                        isTabActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-semibold">{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>Superadmin Controls</span>
                </div>
                <p className="text-[11px] text-indigo-700/90 leading-relaxed">
                  Directly manage tenant wallet accounts, adjust rate cards, and review platform messaging throughput.
                </p>
                <button
                  onClick={() => {
                    setPortalMode('user');
                    setActiveTab('Dashboard');
                    window.history.pushState({}, '', '/');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  className="w-full mt-2 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Return to User Portal (/)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <button
            onClick={() => {
              if (portalMode === 'admin') {
                logoutAdmin();
              } else {
                logoutUser();
              }
            }}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>{portalMode === 'admin' ? 'Logout Admin Portal' : 'Logout'}</span>
          </button>
        </div>

      </aside>
    </>
  );
};
