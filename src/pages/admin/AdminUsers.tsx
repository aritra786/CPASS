import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminCreditModal } from '../../components/modals/AdminCreditModal';
import { TenantAccount } from '../../types';
import {
  Users,
  Plus,
  Shield,
  CreditCard,
  Building2,
  CheckCircle2,
  XCircle,
  Search,
  DollarSign,
  Eye,
  EyeOff,
  Copy,
  Check,
  MessageSquare,
  Smartphone,
  Layers,
  Lock,
  Mail,
  PlusCircle,
  ArrowUpRight,
  Zap,
  Key,
  Edit3,
  Trash2,
  AlertTriangle,
  Save
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { tenants, toggleTenantStatus, addTenant, updateTenant, deleteTenant, adminCreditDebit, loginUserAccount, setPortalMode } = useApp();

  const [selectedTenantForCredit, setSelectedTenantForCredit] = useState<TenantAccount | null>(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [createdSuccessAccount, setCreatedSuccessAccount] = useState<{ accountId: string; passwordText: string; companyName: string } | null>(null);

  // Edit Tenant State
  const [editingTenant, setEditingTenant] = useState<TenantAccount | null>(null);

  // Delete Tenant State
  const [deletingTenant, setDeletingTenant] = useState<TenantAccount | null>(null);

  // Status/Feedback Banner Notice
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Segregation Filter: 'ALL' | 'WhatsApp' | 'RCS' | 'Both'
  const [segregationTab, setSegregationTab] = useState<'ALL' | 'WhatsApp' | 'RCS' | 'Both'>('ALL');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Show/Hide Password State per tenant ID
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);

  // Dedicated Quick Balance Addition Section State
  const [quickAddTenantId, setQuickAddTenantId] = useState<string>('');
  const [quickAddAmount, setQuickAddAmount] = useState<string>('5000');
  const [quickAddNotes, setQuickAddNotes] = useState<string>('Standard Top-Up Invoice #2026');
  const [quickAddSuccess, setQuickAddSuccess] = useState<string | null>(null);

  // Onboard New Tenant Form State
  const [companyName, setCompanyName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'WhatsApp' | 'RCS' | 'Both'>('WhatsApp');
  const [initialBalance, setInitialBalance] = useState('1000');

  const handleSaveEditTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    // Ensure channels are synced with userType
    let channels: TenantAccount['channels'] = editingTenant.channels || ['WhatsApp'];
    if (editingTenant.userType === 'WhatsApp') channels = ['WhatsApp'];
    if (editingTenant.userType === 'RCS') channels = ['RCS'];
    if (editingTenant.userType === 'Both') channels = ['RCS', 'WhatsApp', 'Viber', 'Acculync'];

    const updated = {
      ...editingTenant,
      channels
    };

    updateTenant(updated);
    setActionNotice(`Successfully updated account "${updated.companyName}" (${updated.accountId}). Live updates synced to User Panel.`);
    setEditingTenant(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleConfirmDeleteTenant = () => {
    if (!deletingTenant) return;

    const company = deletingTenant.companyName;
    const accId = deletingTenant.accountId;
    deleteTenant(deletingTenant.id);
    setActionNotice(`User account "${company}" (${accId}) has been deleted successfully.`);
    setDeletingTenant(null);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = (id: string, pass?: string) => {
    if (!pass) return;
    navigator.clipboard.writeText(pass);
    setCopiedPassId(id);
    setTimeout(() => setCopiedPassId(null), 2000);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !accountId || !email) return;

    // Map userType to channels
    let channels: TenantAccount['channels'] = ['WhatsApp'];
    if (userType === 'RCS') channels = ['RCS'];
    if (userType === 'Both') channels = ['RCS', 'WhatsApp', 'Viber', 'Acculync'];

    const pass = accountPassword || `CnxPass_${Math.floor(1000 + Math.random() * 9000)}!`;

    addTenant({
      companyName,
      accountId,
      accountPassword: pass,
      adminName: adminName || 'Tenant Admin',
      email,
      userType,
      channels,
      walletBalance: parseFloat(initialBalance) || 0,
      status: 'Active'
    });

    setCreatedSuccessAccount({
      accountId,
      passwordText: pass,
      companyName
    });

    setShowCreateModal(false);
    setCompanyName('');
    setAccountId('');
    setAccountPassword('');
    setAdminName('');
    setEmail('');
    setUserType('WhatsApp');
    setInitialBalance('1000');
  };

  const handleQuickAddBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = quickAddTenantId || (tenants.length > 0 ? tenants[0].id : '');
    const amount = parseFloat(quickAddAmount);
    if (!targetId || isNaN(amount) || amount <= 0) return;

    adminCreditDebit(targetId, amount, 'CREDIT', quickAddNotes);
    const targetTenant = tenants.find(t => t.id === targetId);
    setQuickAddSuccess(`Successfully added ₹${amount.toLocaleString('en-IN')} balance to ${targetTenant?.companyName || 'Account'}`);
    setTimeout(() => setQuickAddSuccess(null), 3500);
  };

  // Filter Tenants by Search and Segregation Tab
  const filteredTenants = (tenants || []).filter(t => {
    const query = (search || '').toLowerCase();
    const matchesSearch =
      (t.companyName || '').toLowerCase().includes(query) ||
      (t.accountId || '').toLowerCase().includes(query) ||
      (t.email || '').toLowerCase().includes(query) ||
      (t.adminName || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

    const channels = t.channels || [];
    const userType = t.userType || '';

    if (segregationTab === 'ALL') return true;
    if (segregationTab === 'WhatsApp') return userType === 'WhatsApp' || userType === 'Both' || channels.includes('WhatsApp');
    if (segregationTab === 'RCS') return userType === 'RCS' || userType === 'Both' || channels.includes('RCS');
    if (segregationTab === 'Both') return userType === 'Both' || (channels.includes('WhatsApp') && channels.includes('RCS'));

    return true;
  });

  // KPI Metrics
  const totalAccounts = (tenants || []).length;
  const whatsappCount = (tenants || []).filter(t => t.userType === 'WhatsApp' || (t.channels && t.channels.includes('WhatsApp'))).length;
  const rcsCount = (tenants || []).filter(t => t.userType === 'RCS' || (t.channels && t.channels.includes('RCS'))).length;
  const bothCount = (tenants || []).filter(t => t.userType === 'Both' || (t.channels && t.channels.includes('WhatsApp') && t.channels.includes('RCS'))).length;
  const totalBalance = (tenants || []).reduce((acc, t) => acc + (t.walletBalance || 0), 0);

  return (
    <div className="space-y-6">

      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Account Management & Segregation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage enterprise accounts, segregating WhatsApp and RCS users with credentials, channel access, and balance additions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (tenants.length > 0) setSelectedTenantForCredit(tenants[0]);
              setCreditModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Balance Addition</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Account</span>
          </button>
        </div>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-indigo-400 hover:text-indigo-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Onboarding Banner */}
      {createdSuccessAccount && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-emerald-900">Account Onboarded Successfully!</span>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-300">
                {createdSuccessAccount.accountId}
              </span>
            </div>
            <p className="text-xs text-slate-700">
              Account created for <strong>{createdSuccessAccount.companyName}</strong>. Password: <code className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-slate-900">{createdSuccessAccount.passwordText}</code>
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                loginUserAccount(createdSuccessAccount.accountId, createdSuccessAccount.passwordText);
                setPortalMode('user');
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Log In to User Portal as this Account
            </button>
            <button
              onClick={() => setCreatedSuccessAccount(null)}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{totalAccounts}</div>
          <div className="text-[11px] text-slate-400">Active Tenants</div>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
            <span>WhatsApp Users</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900">{whatsappCount}</div>
          <div className="text-[11px] text-emerald-700">Meta Cloud / WBS Users</div>
        </div>

        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200/60 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-800 text-xs font-semibold">
            <span>RCS Users</span>
            <Smartphone className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-900">{rcsCount}</div>
          <div className="text-[11px] text-indigo-700">Google RBM Users</div>
        </div>

        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/60 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-800 text-xs font-semibold">
            <span>Platform Holdings</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-900 font-mono">
            ₹{(totalBalance ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-purple-700">Combined Wallet Balance</div>
        </div>
      </div>

      {/* Balance Addition Quick Section Card */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Balance Addition Section</h3>
              <p className="text-[11px] text-slate-400">Direct wallet credit overrides for enterprise tenant accounts</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> Instant Recharge
          </span>
        </div>

        <form onSubmit={handleQuickAddBalance} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Account</label>
            <select
              value={quickAddTenantId || (tenants[0]?.id || '')}
              onChange={(e) => setQuickAddTenantId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-medium"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.companyName} ({t.accountId}) — ₹{(t.walletBalance ?? 0).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Add Balance Amount (₹ INR)</label>
            <input
              type="number"
              required
              step="100"
              min="1"
              value={quickAddAmount}
              onChange={(e) => setQuickAddAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Reference / Note</label>
            <input
              type="text"
              required
              value={quickAddNotes}
              onChange={(e) => setQuickAddNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
              placeholder="e.g. Bank Transfer Ref #9901"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Credit to Wallet</span>
            </button>
          </div>
        </form>

        {quickAddSuccess && (
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{quickAddSuccess}</span>
          </div>
        )}
      </div>

      {/* Dedicated Channel Segregation Filter Bar (Placed Above) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Channel User Segregation Filter</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Showing: <strong className="text-slate-900">{filteredTenants.length}</strong> of {totalAccounts} accounts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setSegregationTab('ALL')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
              segregationTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>All Accounts</span>
            </div>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
              segregationTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalAccounts}
            </span>
          </button>

          <button
            onClick={() => setSegregationTab('WhatsApp')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
              segregationTab === 'WhatsApp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 border border-emerald-200/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Users</span>
            </div>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
              segregationTab === 'WhatsApp' ? 'bg-emerald-700 text-white' : 'bg-emerald-200/80 text-emerald-800'
            }`}>
              {whatsappCount}
            </span>
          </button>

          <button
            onClick={() => setSegregationTab('RCS')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
              segregationTab === 'RCS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50/60 hover:bg-indigo-100/60 text-indigo-800 border border-indigo-200/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>RCS Users</span>
            </div>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
              segregationTab === 'RCS' ? 'bg-indigo-700 text-white' : 'bg-indigo-200/80 text-indigo-800'
            }`}>
              {rcsCount}
            </span>
          </button>

          <button
            onClick={() => setSegregationTab('Both')}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between ${
              segregationTab === 'Both'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50/60 hover:bg-purple-100/60 text-purple-800 border border-purple-200/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Hybrid (RCS + WA)</span>
            </div>
            <span className={`px-2 py-0.5 text-[10px] rounded-full font-extrabold ${
              segregationTab === 'Both' ? 'bg-purple-700 text-white' : 'bg-purple-200/80 text-purple-800'
            }`}>
              {bothCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Account Segregation Table Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4">
        
        {/* Search Bar Section Only */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company name, account ID, admin name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-24 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden w-full font-medium"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
              >
                Clear
              </button>
            ) : (
              <button
                type="button"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1 hover:bg-indigo-700 transition-colors"
              >
                <Search className="w-3 h-3" />
                <span>Search</span>
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 hidden sm:block">
            Matching Accounts: <span className="font-extrabold text-slate-900">{filteredTenants.length}</span>
          </div>
        </div>

        {/* Account List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Account ID</th>
                <th className="py-3 px-4">Account Password</th>
                <th className="py-3 px-4">JWT Auth Token</th>
                <th className="py-3 px-4">User Email & Contact</th>
                <th className="py-3 px-4 text-center">User Type</th>
                <th className="py-3 px-4 text-right">Wallet Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Balance Addition / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No accounts found for the selected segregation filter or search query.
                  </td>
                </tr>
              ) : (
                filteredTenants.map(t => {
                  const showPass = !!visiblePasswords[t.id];
                  const passwordText = t.accountPassword || 'CnxSecret_9921#';
                  const accountIdClean = (t.accountId || 'user').toLowerCase();
                  const jwtStr = t.jwtToken || `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo3ODk0MSwidXNlcm5hbWUiOiI${accountIdClean}\",\"ZXhwIjoxNzkxMjM0NTY3fQ.connex_jwt_token_${accountIdClean}`;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Company Name */}
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{t.companyName}</span>
                        </div>
                      </td>

                      {/* Account ID */}
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        <span className="bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                          {t.accountId}
                        </span>
                      </td>

                      {/* Account Password */}
                      <td className="py-3 px-4 font-mono text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                            {showPass ? passwordText : '••••••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(t.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title={showPass ? 'Hide password' : 'Show password'}
                          >
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopyPassword(t.id, passwordText)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                            title="Copy Password"
                          >
                            {copiedPassId === t.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* JWT Auth Token */}
                      <td className="py-3 px-4 font-mono text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-purple-50 border border-purple-200/80 text-purple-900 font-semibold px-2 py-0.5 rounded-md text-[10px] truncate max-w-[120px]" title={jwtStr}>
                            {jwtStr.substring(0, 16)}...
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(jwtStr);
                              setActionNotice(`Copied JWT Auth Token for ${t.companyName}`);
                              setTimeout(() => setActionNotice(null), 3000);
                            }}
                            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                            title="Copy JWT Auth Token"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* User Email & Contact */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{t.adminName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{t.email}</span>
                        </div>
                      </td>

                      {/* User Type Badge */}
                      <td className="py-3 px-4 text-center">
                        {t.userType === 'WhatsApp' ? (
                          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full inline-flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp User
                          </span>
                        ) : t.userType === 'RCS' ? (
                          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full inline-flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-indigo-600" /> RCS User
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 rounded-full inline-flex items-center gap-1">
                            <Zap className="w-3 h-3 text-purple-600" /> RCS + WhatsApp (Hybrid)
                          </span>
                        )}
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600 text-sm">
                        ₹{(t.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {t.status === 'Active' ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Suspended
                          </span>
                        )}
                      </td>

                      {/* Balance Addition & Actions */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedTenantForCredit(t);
                            setCreditModalOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs inline-flex items-center gap-1 transition-colors"
                          title="Balance Addition Section"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>+ Balance</span>
                        </button>

                        <button
                          onClick={() => setEditingTenant({ ...t })}
                          className="px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg inline-flex items-center gap-1 transition-colors"
                          title="Edit User Account Details"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-600" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => toggleTenantStatus(t.id)}
                          className="px-2 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          {t.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          onClick={() => setDeletingTenant(t)}
                          className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg inline-flex items-center gap-1 transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Admin Wallet Credit/Debit Modal */}
      <AdminCreditModal
        tenant={selectedTenantForCredit}
        isOpen={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
      />

      {/* Onboard New Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-base text-slate-900">Onboard New Enterprise Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Nexus Global CPaaS"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account ID Code</label>
                  <input
                    type="text"
                    required
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-mono"
                    placeholder="NEXUS_CPAAS_01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                  <input
                    type="text"
                    required
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                    placeholder="CnxPass_9921#!"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    placeholder="admin@nexusglobal.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin Contact Name</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    placeholder="e.g. Alex Rivera"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Type (Segregation)</label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="WhatsApp">WhatsApp User</option>
                    <option value="RCS">RCS User</option>
                    <option value="Both">Both (RCS + WhatsApp)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Balance Addition (₹ INR)</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold text-emerald-600"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xs"
                >
                  Onboard Enterprise Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Enterprise User Account Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-black text-base text-slate-900">Update User Account</h3>
                  <p className="text-[11px] text-slate-500">Editing account settings for {editingTenant.accountId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTenant} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.companyName}
                    onChange={(e) => setEditingTenant({ ...editingTenant, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account ID Code</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.accountId}
                    onChange={(e) => setEditingTenant({ ...editingTenant, accountId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.accountPassword || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, accountPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Email</label>
                  <input
                    type="email"
                    required
                    value={editingTenant.email}
                    onChange={(e) => setEditingTenant({ ...editingTenant, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Admin Contact Name</label>
                  <input
                    type="text"
                    value={editingTenant.adminName || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, adminName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Type (Segregation)</label>
                  <select
                    value={editingTenant.userType || 'WhatsApp'}
                    onChange={(e) => setEditingTenant({ ...editingTenant, userType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="WhatsApp">WhatsApp User</option>
                    <option value="RCS">RCS User</option>
                    <option value="Both">Both (RCS + WhatsApp)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editingTenant.status}
                    onChange={(e) => setEditingTenant({ ...editingTenant, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wallet Balance (₹ INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTenant.walletBalance ?? 0}
                    onChange={(e) => setEditingTenant({ ...editingTenant, walletBalance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Account Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Enterprise User Account Modal */}
      {deletingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b pb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Delete User Account</h3>
                <p className="text-xs text-rose-600 font-semibold">Action cannot be reversed</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Are you sure you want to permanently delete the account for <strong className="text-slate-900 font-bold">{deletingTenant.companyName}</strong>?
              </p>
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-[11px]">
                <div><span className="text-slate-400">Account ID:</span> <strong className="text-indigo-700">{deletingTenant.accountId}</strong></div>
                <div><span className="text-slate-400">Admin Email:</span> <strong className="text-slate-800">{deletingTenant.email}</strong></div>
                <div><span className="text-slate-400">Wallet Balance:</span> <strong className="text-emerald-700">₹{(deletingTenant.walletBalance ?? 0).toLocaleString('en-IN')}</strong></div>
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80">
                Warning: Deleting this user will immediately revoke login access, remove the wallet balance, and update all active user panels.
              </p>
            </div>

            <div className="pt-2 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingTenant(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTenant}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
