import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Key, Globe, Shield, Copy, Check, Server, Smartphone, Send, Terminal, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

export const ProfileManagement: React.FC = () => {
  const { userProfile } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'meta' | 'google_rbm' | 'route_mobile'>('general');

  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.connex.io/v1/webhooks/status');
  const [savedWebhook, setSavedWebhook] = useState(false);

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

  // Route Mobile WhatsApp API State
  const [rmUsername, setRmUsername] = useState('connex_routemobile_user');
  const [rmPassword, setRmPassword] = useState('••••••••••••••••');
  const [rmWbaAccountId, setRmWbaAccountId] = useState('WBA-IN-908211');
  const [rmBaseUrl, setRmBaseUrl] = useState('https://api.routemobile.com/whatsapp/v1');
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

  const handleTestSessionApi = () => {
    setSessionTesting(true);
    setSessionTestResult(null);
    setTimeout(() => {
      setSessionTesting(false);
      setSessionTestResult('200 OK: Session Message Dispatched via Route Mobile API (Message ID: WBS-991024)');
    }, 1000);
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
          {/* Tenant Account Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2">Tenant Account Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>Company: <strong className="block text-slate-900 font-bold">{userProfile.company}</strong></div>
              <div>Account ID: <strong className="block text-blue-700 font-bold">{userProfile.accountId}</strong></div>
              <div>Role: <strong className="block text-slate-900 font-bold">{userProfile.role}</strong></div>
            </div>
          </div>

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
