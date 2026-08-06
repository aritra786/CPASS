import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  PlusCircle,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  CheckCircle2,
  Receipt,
  Download,
  Building
} from 'lucide-react';

interface WalletBillingProps {
  onOpenAddFunds: () => void;
}

export const WalletBilling: React.FC<WalletBillingProps> = ({ onOpenAddFunds }) => {
  const {
    walletBalance,
    transactions,
    autoRechargeEnabled,
    autoRechargeThreshold,
    autoRechargeAmount,
    updateAutoRecharge
  } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Auto recharge local form
  const [enabled, setEnabled] = useState(autoRechargeEnabled);
  const [threshold, setThreshold] = useState(autoRechargeThreshold.toString());
  const [rechargeAmt, setRechargeAmt] = useState(autoRechargeAmount.toString());
  const [savedAuto, setSavedAuto] = useState(false);

  const handleSaveAuto = (e: React.FormEvent) => {
    e.preventDefault();
    updateAutoRecharge(enabled, parseFloat(threshold) || 20, parseFloat(rechargeAmt) || 100);
    setSavedAuto(true);
    setTimeout(() => setSavedAuto(false), 2000);
  };

  const filteredTxns = transactions.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceId.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Wallet & Billing Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your prepaid balance, automated threshold recharges, and itemized transaction invoices
          </p>
        </div>

        <button
          onClick={onOpenAddFunds}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Funds to Wallet</span>
        </button>
      </div>

      {/* Top Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Main Balance Card */}
        <div className="bg-gradient-to-tr from-slate-900 via-blue-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-blue-300">
                Current CONNEX Balance
              </div>
              <div className="text-3xl font-black text-white mt-1">
                ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-200" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-800/80 flex justify-between items-center text-xs text-blue-200">
            <span>Status: <strong className="text-emerald-400">Active & Funded</strong></span>
            <span>Ref: <strong>RMLUAT11</strong></span>
          </div>
        </div>

        {/* Auto Recharge Config Form */}
        <form onSubmit={handleSaveAuto} className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Auto-Recharge Trigger</h3>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trigger When Balance Drops Below (₹ INR)
              </label>
              <input
                type="number"
                disabled={!enabled}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl disabled:bg-slate-100 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Automated Top-Up Amount (₹ INR)
              </label>
              <input
                type="number"
                disabled={!enabled}
                value={rechargeAmt}
                onChange={(e) => setRechargeAmt(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl disabled:bg-slate-100 font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Cards on file are charged automatically when balance threshold triggers.
            </span>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {savedAuto ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Rule</span>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* Transaction Ledger Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>Billing Transaction Ledger</span>
            </h3>
            <p className="text-xs text-slate-500">Historical credits, debits and campaign settlements</p>
          </div>

          <div className="flex items-center gap-2">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Txn ID, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-48"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="CREDIT">Credits (+)</option>
              <option value="DEBIT">Debits (-)</option>
              <option value="AUTO_RECHARGE">Auto Recharge</option>
            </select>

          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Txn ID</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Balance After (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    No matching billing records found.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{t.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="py-3 px-4">
                      {t.type === 'CREDIT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ArrowUpRight className="w-3 h-3" /> Credit
                        </span>
                      )}
                      {t.type === 'DEBIT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <ArrowDownLeft className="w-3 h-3" /> Debit
                        </span>
                      )}
                      {t.type === 'AUTO_RECHARGE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <RefreshCw className="w-3 h-3" /> Auto Top-Up
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {t.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                        {t.channel || 'System'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-extrabold ${
                      t.type === 'CREDIT' || t.type === 'AUTO_RECHARGE' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {t.type === 'CREDIT' || t.type === 'AUTO_RECHARGE' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-600">
                      ₹{t.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
