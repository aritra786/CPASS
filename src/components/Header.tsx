import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  X,
  Wallet,
  BookOpen,
  ChevronDown,
  User,
  Shield,
  LogOut,
  PlusCircle,
  Building2,
  Check,
  Zap,
  Globe,
  MessageSquare,
  MessageCircle
} from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onOpenAddFunds: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  onOpenAddFunds
}) => {
  const {
    portalMode,
    walletBalance,
    selectedAccountId,
    userProfile,
    tenants,
    switchTenantAccount,
    logoutUser
  } = useApp();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* BRAND NAME CONNEX */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
                  CONNEX
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  CPaaS
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:block">
                Communication Simplified
              </span>
            </div>
          </div>
        </div>

        {/* Center & Right Navigation Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* Admin Indicator (Only visible when accessing /admin) */}
          {portalMode === 'admin' && (
            <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5 shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Platform Admin Portal (/admin)</span>
            </div>
          )}

          {/* Account ID Display (Fixed for User Portal, Dropdown for Platform Admin) */}
          {portalMode === 'admin' ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  setAccountMenuOpen(!accountMenuOpen);
                  setProfileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors shadow-2xs"
                id="account-selector-btn"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedAccountId}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Tenant Account
                  </div>
                  {tenants.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        switchTenantAccount(t.id);
                        setAccountMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between text-slate-700"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{t.accountId}</div>
                        <div className="text-[11px] text-slate-500">{t.companyName}</div>
                      </div>
                      {selectedAccountId === t.accountId && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedAccountId}</span>
            </div>
          )}

          {/* Live Wallet Balance Widget */}
          <div className="flex items-center bg-blue-50/80 border border-blue-200/80 rounded-xl p-1 pl-2.5 sm:pl-3">
            <div className="flex items-center gap-2 mr-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <div className="text-[9px] uppercase font-bold tracking-wider text-blue-600/80 leading-none">
                  Wallet
                </div>
                <div className="text-xs font-extrabold text-blue-900 leading-tight">
                  ₹{(walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <button
              onClick={onOpenAddFunds}
              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
              id="add-funds-btn"
              title="Top Up Wallet"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Funds</span>
            </button>
          </div>

          {/* Knowledge Hub Pill Button */}
          <a
            href="#knowledge-hub"
            onClick={(e) => {
              e.preventDefault();
              alert("CONNEX Knowledge Hub & API Specs: Access documentation, RCS schemas, and WhatsApp webhook guides.");
            }}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-600/40 hover:bg-blue-50 rounded-full transition-colors"
            id="knowledge-hub-btn"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>KNOWLEDGE HUB</span>
          </a>

          {/* Profile User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileMenuOpen(!profileMenuOpen);
                setAccountMenuOpen(false);
              }}
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 hover:border-blue-400 flex items-center justify-center text-slate-700 transition-colors"
              id="profile-dropdown-btn"
            >
              <User className="w-4 h-4" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {(userProfile?.name || 'User').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{userProfile?.name || 'User'}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[170px]">{userProfile?.email || ''}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                      {userProfile?.role || 'Tenant User'}
                    </span>
                  </div>
                </div>

                <div className="py-2 space-y-1">
                  <div className="px-3 py-1 text-xs font-medium text-slate-500">
                    Company: <span className="font-bold text-slate-800">{userProfile?.company || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logoutUser();
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Switch Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
