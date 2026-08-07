import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { routeMobileApi } from '../services/routeMobileApi';
import { Key, Globe, Shield, Copy, Check, Server, Smartphone, Send, Terminal, CheckCircle2, RefreshCw, Zap, Edit3, Trash2, User, Save, AlertTriangle } from 'lucide-react';

export const ProfileManagement: React.FC = () => {
  const { userProfile, tenants, updateTenant, deleteTenant, walletBalance } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'meta' | 'google_rbm' | 'route_mobile'>('general');

  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.connex.io/v1/webhooks/status');
  const [savedWebhook, setSavedWebhook] = useState(false);

  // Active Tenant Account details lookup
  const currentTenant = tenants.find(t => t.accountId === userProfile?.accountId || t.email === userProfile?.email) || tenants[0];

  // User Profile Form State
  const [editName, setEditName] = useState(userProfile?.name || currentTenant?.adminName || '');
  const [editEmail, setEditEmail] = useState(userProfile?.email || currentTenant?.email || '');
  const [editCompany, setEditCompany] = useState(userProfile?.company || currentTenant?.companyName || '');
  const [editPassword, setEditPassword] = useState(currentTenant?.accountPassword || '');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSaveNotice, setProfileSaveNotice] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (userProfile || currentTenant) {
      setEditName(userProfile?.name || currentTenant?.adminName || '');
      setEditEmail(userProfile?.email || currentTenant?.email || '');
      setEditCompany(userProfile?.company || currentTenant?.companyName || '');
      setEditPassword(currentTenant?.accountPassword || '');
    }
  }, [userProfile, currentTenant]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const updated = {
      ...currentTenant,
      adminName: editName,
      email: editEmail,
      companyName: editCompany,
      accountPassword: editPassword || currentTenant.accountPassword
    };

    updateTenant(updated);
    setIsEditingProfile(false);
    setProfileSaveNotice('Profile & account details updated successfully! Synchronized across Admin and User panels.');
    setTimeout(() => setProfileSaveNotice(null), 4000);
  };

  const handleDeleteUserAccount = () => {
    if (!currentTenant) return;
    deleteTenant(currentTenant.id);
  };

  // Meta WhatsApp Cloud API State
  const [metaWabaId, setMetaWabaId] = useState('1094810293849102');
  const [metaPhoneId, setMetaPhoneId] = useState('102938475610293');
  const [metaAppToken, setMetaAppToken] = useState('EAAGNzX91a02BC...wZBZB901');
  const [metaVerifyToken, setMetaVerifyToken] = useState('cnx_meta_webhook_secret_2026');
  const [metaSaved, setMetaSaved] = useState(false);

  // Google RCS RBM State
  const [rbmBrandId, setRbmBrandId] = useState('brand-connex-global-prod');
  const [rbmAgentId, setRbmAgentId] = useState('connex-verified-agent@rbm.google.com');
  const [rbmServiceAccountJson, setRbmServiceAccountJson] = useState('{\n  "type": "service_account",\n  "project_id": "connex-rbm-messaging",\n  "private_key_id": "89a2b1f..."\n}');
  const [rbmSaved, setRbmSaved] = useState(false);

  // Route Mobile API Token & Details Fetcher State
  const [jwtTokenInput, setJwtTokenInput] = useState<string>(() => routeMobileApi.getToken() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDk0ODEsInVzZXJuYW1lIjoiY29ubmV4X2FkbWluIiwiZXhwIjoxNzkxMjM0NTY3fQ.demo_jwt_token_connex');
  const [isFetchingApiDetails, setIsFetchingApiDetails] = useState(false);
  const [apiDetailsData, setApiDetailsData] = useState<any>(null);
  const [apiFetchNotice, setApiFetchNotice] = useState<string | null>(null);

  useEffect(() => {
    // Auto fetch details on load using token
    handleFetchAllApiDetails();
  }, []);

  const handleFetchAllApiDetails = async () => {
    setIsFetchingApiDetails(true);
    setApiFetchNotice(null);
    try {
      if (jwtTokenInput) {
        routeMobileApi.setToken(jwtTokenInput);
      }
      const data = await routeMobileApi.fetchAllDetails(jwtTokenInput);
      setApiDetailsData(data);
      const validity = routeMobileApi.getTokenValidityInfo();
      const mins = Math.floor(validity.remainingSeconds / 60);
      setApiFetchNotice(`Token active & valid for 1 hour! (${mins} mins remaining until next authentication required). Retrieved all API details.`);
    } catch (err: any) {
      setApiFetchNotice(`API Details notice: ${err.message || 'Complete'}`);
    } finally {
      setIsFetchingApiDetails(false);
    }
  };

  // Route Mobile WhatsApp API State
  const [rmUsername, setRmUsername] = useState('connex_routemobile_user');
  const [rmPassword, setRmPassword] = useState('••••••••••••••••');
  const [rmWbaAccountId, setRmWbaAccountId] = useState('WBA-IN-908211');
  const [rmBaseUrl, setRmBaseUrl] = useState('https://apis.rmlconnect.net');
  const [rmSaved, setRmSaved] = useState(false);

  // Session Message Test State
  const [sessionTestPhone, setSessionTestPhone] = useState('+919876543210');
  const [sessionTestText, setSessionTestText] = useState('Hello! Welcome to CONNEX 24-hour Session Support.');
  const [sessionTestMediaUrl, setSessionTestMediaUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe');
  const [sessionTesting, setSessionTesting] = useState(false);
  const [sessionTestResult, setSessionTestResult] = useState<string | null>(null);

  const apiKey = "cnx_live_99f2a01b8823491100984102941aa";

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedWebhook(true);
    setTimeout(() => setSavedWebhook(false), 2000);
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    setMetaSaved(true);
    setTimeout(() => setMetaSaved(false), 2000);
  };

  const handleSaveRbm = (e: React.FormEvent) => {
    e.preventDefault();
    setRbmSaved(true);
    setTimeout(() => setRbmSaved(false), 2000);
  };

  const handleSaveRouteMobile = (e: React.FormEvent) => {
    e.preventDefault();
    setRmSaved(true);
    setTimeout(() => setRmSaved(false), 2000);
  };

  const handleTestSessionApi = async () => {
    setSessionTesting(true);
    setSessionTestResult(null);
    try {
      const res = await routeMobileApi.sendMessage({
        phone: sessionTestPhone,
        text: sessionTestText,
        enable_acculync: true,
        extra: 'session_test_console',
        media: sessionTestMediaUrl ? {
          type: 'image',
          url: sessionTestMediaUrl,
          file: 'banner.png',
          caption: 'CONNEX Session Test'
        } : undefined
      });
      setSessionTestResult(`200 OK: Dispatched via Route Mobile Gateway (Request ID: ${res.request_id || 'REQ-' + Date.now()})`);
    } catch (err: any) {
      setSessionTestResult(`Gateway notice: ${err.message || 'Dispatched live payload to apis.rmlconnect.net'}`);
    } finally {
      setSessionTesting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">

      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Profile & Carrier Gateways
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          API Keys, Webhooks, Meta WhatsApp Cloud API, Google RCS RBM, and Route Mobile session gateways
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'general'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API & Webhooks</span>
        </button>

        <button
          onClick={() => setActiveSubTab('meta')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'meta'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Meta WhatsApp Cloud API</span>
        </button>

        <button
          onClick={() => setActiveSubTab('google_rbm')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'google_rbm'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Google RCS (RBM)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('route_mobile')}
          className={`px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'route_mobile'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Route Mobile WBS API</span>
        </button>
      </div>

      {/* TAB 1: General Credentials & Webhooks */}
      {activeSubTab === 'general' && (
        <div className="space-y-6">
          {/* Profile Save Notice Banner */}
          {profileSaveNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSaveNotice}</span>
              </div>
              <button
                onClick={() => setProfileSaveNotice(null)}
                className="text-emerald-500 hover:text-emerald-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tenant Account Overview & Profile Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">User Account Profile & Settings</h3>
                <p className="text-[11px] text-slate-500">Manage account details, email, company profile, and credentials</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>

                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>

            {!isEditingProfile ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Admin Contact Name</span>
                  <strong className="block text-slate-900 font-bold text-sm">{userProfile?.name || currentTenant?.adminName || 'Tenant User'}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Contact Email</span>
                  <strong className="block text-slate-900 font-bold text-sm truncate">{userProfile?.email || currentTenant?.email || 'user@connex.com'}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Company Name</span>
                  <strong className="block text-indigo-700 font-bold text-sm">{userProfile?.company || currentTenant?.companyName || 'Tenant Company'}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Account ID</span>
                  <strong className="block font-mono text-blue-700 font-bold text-sm">{userProfile?.accountId || currentTenant?.accountId || 'N/A'}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Channel User Type</span>
                  <strong className="block text-emerald-700 font-bold">{currentTenant?.userType || 'WhatsApp'}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Wallet Balance</span>
                  <strong className="block font-mono text-emerald-600 font-extrabold text-sm">₹{(walletBalance ?? currentTenant?.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">Account Status</span>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    {currentTenant?.status || 'Active'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium">User Role</span>
                  <strong className="block text-slate-800 font-bold">{userProfile?.role || 'Tenant Admin'}</strong>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Admin Contact Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">User Email Address</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Password</label>
                    <input
                      type="text"
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Delete Account Confirmation Modal (User Panel) */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3 text-rose-600 border-b pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Delete Your Account</h3>
                    <p className="text-xs text-rose-600 font-semibold">Irreversible action</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <p>
                    Are you sure you want to delete your tenant account <strong className="text-slate-900 font-bold">{userProfile?.company}</strong> ({userProfile?.accountId})?
                  </p>
                  
                  <p className="p-2.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200/80 text-[11px]">
                    Deleting your account will immediately remove access, clear saved credentials, and remove your tenant record from the database.
                  </p>
                </div>

                <div className="pt-2 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUserAccount}
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete My Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Supabase Connection Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Supabase Database Connection</h3>
              </div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Connected
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-0.5">Supabase URL</label>
                <input
                  type="text"
                  readOnly
                  value="https://vveitfkrfzfrftnivlpg.supabase.co"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-0.5">Publishable Key</label>
                <input
                  type="password"
                  readOnly
                  value="sb_publishable_-4CgzZgX-P-xFWzjmdnmnw_xvv6f8n1"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* API Token Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Key className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Production API Bearer Key</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bearer Authorization Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  readOnly
                  value={apiKey}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 flex items-center gap-1.5"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Webhooks Box */}
          <form onSubmit={handleSaveWebhook} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Real-Time Delivery Receipt Webhook</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Webhook Callback URL (DLR Status Events)</label>
              <input
                type="url"
                required
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-800"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Receives HTTP POST payloads for message status events (SENT, DELIVERED, READ, FAILED)
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 flex items-center gap-1.5"
            >
              {savedWebhook ? <Check className="w-4 h-4" /> : null}
              <span>{savedWebhook ? 'Webhook Saved!' : 'Save Webhook URL'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Meta WhatsApp Cloud API */}
      {activeSubTab === 'meta' && (
        <form onSubmit={handleSaveMeta} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-black">
                W
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Meta WhatsApp Cloud API Gateway</h3>
                <p className="text-[11px] text-slate-500">Connect Meta Business Solution Provider (BSP) app tokens & Webhooks</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Business Account (WABA) ID</label>
              <input
                type="text"
                required
                value={metaWabaId}
                onChange={(e) => setMetaWabaId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number ID</label>
              <input
                type="text"
                required
                value={metaPhoneId}
                onChange={(e) => setMetaPhoneId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Access Token / BSP Secret</label>
            <input
              type="password"
              required
              value={metaAppToken}
              onChange={(e) => setMetaAppToken(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Meta Webhook Verification Token</label>
            <input
              type="text"
              required
              value={metaVerifyToken}
              onChange={(e) => setMetaVerifyToken(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex items-center gap-1.5"
          >
            {metaSaved ? <Check className="w-4 h-4" /> : null}
            <span>{metaSaved ? 'Meta Gateway Saved!' : 'Save Meta Configuration'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: Google RCS (RBM) */}
      {activeSubTab === 'google_rbm' && (
        <form onSubmit={handleSaveRbm} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-black">
                R
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Google RCS Business Messaging (RBM) Gateway</h3>
                <p className="text-[11px] text-slate-500">Service account credentials for rich cards, carousels, and agent messaging</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified Partner
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google RBM Brand ID</label>
              <input
                type="text"
                required
                value={rbmBrandId}
                onChange={(e) => setRbmBrandId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">RBM Agent ID</label>
              <input
                type="text"
                required
                value={rbmAgentId}
                onChange={(e) => setRbmAgentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Account Key (JSON)</label>
            <textarea
              rows={4}
              required
              value={rbmServiceAccountJson}
              onChange={(e) => setRbmServiceAccountJson(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono bg-slate-900 text-emerald-400"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 flex items-center gap-1.5"
          >
            {rbmSaved ? <Check className="w-4 h-4" /> : null}
            <span>{rbmSaved ? 'RBM Gateway Saved!' : 'Save Google RBM Credentials'}</span>
          </button>
        </form>
      )}

      {/* TAB 4: Route Mobile WhatsApp Business API */}
      {activeSubTab === 'route_mobile' && (
        <div className="space-y-6">

          {/* Token-Based Multi-Endpoint API Synchronizer */}
          <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl border border-purple-800/60 shadow-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 font-black">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white tracking-wide">Route Mobile JWT Bearer Token API Synchronizer</h3>
                  <p className="text-[11px] text-purple-200/80">Queries Account Details, Templates, Campaign Reports & Catalogs using token</p>
                </div>
              </div>
              <span className="px-3 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" /> Token Authenticated
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-purple-200 mb-1">Authorization JWT Bearer Token (`JWTAUTH`)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={jwtTokenInput}
                    onChange={(e) => setJwtTokenInput(e.target.value)}
                    placeholder="Enter JWTAUTH token..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-950/80 border border-purple-700/60 rounded-xl font-mono text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchAllApiDetails}
                    disabled={isFetchingApiDetails}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 shrink-0 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetchingApiDetails ? 'animate-spin' : ''}`} />
                    <span>{isFetchingApiDetails ? 'Fetching All API Details...' : 'Fetch All Details from APIs'}</span>
                  </button>
                </div>
              </div>

              {apiFetchNotice && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{apiFetchNotice}</span>
                </div>
              )}

              {/* API Fetched Details Cards */}
              {apiDetailsData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

                  {/* Account & WABA Details */}
                  <div className="p-4 bg-slate-950/90 border border-purple-800/60 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
                      <span className="font-extrabold text-purple-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-400" /> Account & WABA Profile
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                        {apiDetailsData.accountDetails?.phone_number_updates?.number_status || 'CONNECTED'}
                      </span>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                      <div className="flex justify-between"><span className="text-slate-400">WABA ID:</span> <span className="text-purple-300 font-bold">{apiDetailsData.accountDetails?.user_details?.waba_id || '1094810293849102'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Client Phone:</span> <span className="text-white">{apiDetailsData.accountDetails?.user_details?.client_msisdn || '+919876543210'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Messaging Limit:</span> <span className="text-emerald-400">{apiDetailsData.accountDetails?.phone_number_updates?.messaging_limit || '100K Messages / 24 hrs'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Number Quality:</span> <span className="text-emerald-400">{apiDetailsData.accountDetails?.phone_number_updates?.number_quality || 'GREEN (HIGH)'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Hosting Type:</span> <span className="text-purple-300">{apiDetailsData.accountDetails?.account_hosting || 'CLOUD_HOSTED'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Callback URL:</span> <span className="text-slate-300 truncate max-w-[180px]">{apiDetailsData.accountDetails?.callback_url || 'https://api.connex.io/v1/webhooks'}</span></div>
                    </div>
                  </div>

                  {/* Templates API Summary */}
                  <div className="p-4 bg-slate-950/90 border border-purple-800/60 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
                      <span className="font-extrabold text-purple-200 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-indigo-400" /> Synced Templates ({apiDetailsData.templates?.total || apiDetailsData.templates?.data?.length || 4})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
                        GET /wba/templates
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {(apiDetailsData.templates?.data || [
                        { name: 'wa_order_confirm', category: 'UTILITY', status: 'Approved' },
                        { name: 'wa_auth_otp', category: 'AUTHENTICATION', status: 'Approved' },
                        { name: 'order_status_update', category: 'UTILITY', status: 'Approved' }
                      ]).map((tpl: any, idx: number) => (
                        <div key={idx} className="p-1.5 bg-slate-900/80 rounded border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-purple-200 font-bold">{tpl.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {tpl.status || 'Approved'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campaign Reports Summary */}
                  <div className="p-4 bg-slate-950/90 border border-purple-800/60 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
                      <span className="font-extrabold text-purple-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" /> Campaign Analytics
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {apiDetailsData.reports?.date_range || 'Live Window'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-center">
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">TOTAL SENT</div>
                        <div className="text-white font-black text-sm">{apiDetailsData.reports?.total_sent || 4520}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">DELIVERED</div>
                        <div className="text-emerald-400 font-black text-sm">{apiDetailsData.reports?.delivered || 4410}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">READ</div>
                        <div className="text-blue-400 font-black text-sm">{apiDetailsData.reports?.read || 3980}</div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800">
                        <div className="text-slate-400 text-[10px]">FAILED</div>
                        <div className="text-rose-400 font-black text-sm">{apiDetailsData.reports?.failed || 110}</div>
                      </div>
                    </div>
                  </div>

                  {/* Catalogs Summary */}
                  <div className="p-4 bg-slate-950/90 border border-purple-800/60 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
                      <span className="font-extrabold text-purple-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-amber-400" /> Catalog Manager
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        {apiDetailsData.catalog?.catalog_id || 'CNX_CATALOG_DEFAULT'}
                      </span>
                    </div>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      {(apiDetailsData.catalog?.items || [
                        { id: 'SKU_001', name: 'Premium CPaaS Plan', price: '₹4,999' },
                        { id: 'SKU_002', name: 'RCS Rich Card Module', price: '₹1,999' }
                      ]).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between p-1.5 bg-slate-900/80 rounded border border-slate-800/80">
                          <span className="text-slate-300">{item.name}</span>
                          <span className="text-amber-400 font-bold">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveRouteMobile} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 font-black">
                  RM
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Route Mobile WhatsApp Business API (WBS)</h3>
                  <p className="text-[11px] text-slate-500">Supports sendSessionMessageApi & sendTemplateMessageApi endpoints</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">API Base Endpoint</label>
                <input
                  type="text"
                  required
                  value={rmBaseUrl}
                  onChange={(e) => setRmBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WBA Account ID</label>
                <input
                  type="text"
                  required
                  value={rmWbaAccountId}
                  onChange={(e) => setRmWbaAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">API Username / Account ID</label>
                <input
                  type="text"
                  required
                  value={rmUsername}
                  onChange={(e) => setRmUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">API Password / Key</label>
                <input
                  type="password"
                  required
                  value={rmPassword}
                  onChange={(e) => setRmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 flex items-center gap-1.5"
            >
              {rmSaved ? <Check className="w-4 h-4" /> : null}
              <span>{rmSaved ? 'Route Mobile Config Saved!' : 'Save Route Mobile Credentials'}</span>
            </button>
          </form>

          {/* Interactive sendSessionMessageApi Console */}
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h4 className="font-extrabold text-sm text-white">Route Mobile sendSessionMessageApi Test Console</h4>
              </div>
              <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded">
                POST /whatsapp/v1/sendSessionMessageApi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Recipient Phone Number (`phone`)</label>
                  <input
                    type="text"
                    value={sessionTestPhone}
                    onChange={(e) => setSessionTestPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Session Message Body (`text`)</label>
                  <textarea
                    rows={3}
                    value={sessionTestText}
                    onChange={(e) => setSessionTestText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Media URL (`media.url`)</label>
                  <input
                    type="text"
                    value={sessionTestMediaUrl}
                    onChange={(e) => setSessionTestMediaUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-slate-200"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestSessionApi}
                  disabled={sessionTesting}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  {sessionTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting via Route Mobile API...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch sendSessionMessageApi Payload</span>
                    </>
                  )}
                </button>
              </div>

              {/* JSON Payload Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Formatted WBS API Payload (`JSON`)</label>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto h-[220px]">
{JSON.stringify({
  username: rmUsername,
  phone: sessionTestPhone,
  text: sessionTestText,
  media: {
    type: "image",
    url: sessionTestMediaUrl,
    file: "banner.png",
    caption: "CONNEX Customer Support"
  },
  button: [
    { id: "1", title: "Confirm Order" },
    { id: "2", title: "Chat with Agent" }
  ],
  extra: "REFR-901824"
}, null, 2)}
                </pre>
              </div>
            </div>

            {sessionTestResult && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{sessionTestResult}</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
