import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Building2, Wallet, Zap, MessageSquare, TrendingUp, CheckCircle2, LogOut } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { tenants, logoutAdmin, adminAuthEmail } = useApp();

  const totalWalletHeld = tenants.reduce((acc, t) => acc + t.walletBalance, 0);
  const activeTenants = tenants.filter(t => t.status === 'Active').length;

  return (
    <div className="space-y-6">

      {/* Admin Title Banner */}
      <div className="p-5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">CONNEX Platform Admin Overview</h1>
          </div>
          <p className="text-xs text-indigo-200">
            Authenticated as: <strong className="text-amber-300 font-mono">{adminAuthEmail || 'ARITRA'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block px-3 py-1.5 bg-indigo-800/60 border border-indigo-700/80 rounded-xl text-xs font-bold">
            Gateway: <span className="text-emerald-400">100% Operational</span>
          </div>

          <button
            type="button"
            onClick={() => logoutAdmin()}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            id="admin-dashboard-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Wallet Balances Held */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Balances Held</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{(totalWalletHeld ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">+14.2% vs last month</div>
        </div>

        {/* Active Tenant Accounts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Enterprise Tenants</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeTenants} / {tenants.length}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">1 Account Suspended</div>
        </div>

        {/* Total Platform Throughput Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Throughput Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">1,420,500</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Messages Dispatched Today</div>
        </div>

        {/* Estimated Platform Margin Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Monthly Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">₹25,800,000</div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1">15% Average Channel Margin</div>
        </div>

      </div>

      {/* Carrier Gateway Status Row */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 border-b pb-3">Carrier & Gateway Health</h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Google RCS Business Hub</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Latency: 12ms | Uptime 99.99%</div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Meta WhatsApp Cloud API</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Latency: 18ms | Uptime 100%</div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Rakuten Viber Gateway</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Latency: 22ms | Uptime 99.95%</div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Acculync Link Proxy</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Latency: 15ms | Uptime 100%</div>
          </div>
        </div>
      </div>

    </div>
  );
};
