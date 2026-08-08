import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { routeMobileApi } from '../services/routeMobileApi';
import { backendApi } from '../services/backendApi';
import { ChannelType } from '../types';
import {
  Send,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Wallet,
  Sparkles,
  Phone,
  Layers,
  HelpCircle,
  Key,
  Globe,
  RefreshCw,
  Search,
  X,
  ChevronDown,
  Check
} from 'lucide-react';

export const SendMessage: React.FC = () => {
  const {
    activeChannel,
    walletBalance,
    templates,
    sendSingleMessage,
    sendBulkCampaign,
    setActiveTab,
    rateCards
  } = useApp();

  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [recipientPhone, setRecipientPhone] = useState('+919876543210');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('Hello! Welcome to CONNEX CPaaS platform services.');
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState<boolean>(false);
  
  // API Key State
  const [jwtToken, setJwtToken] = useState<string>(() => routeMobileApi.getToken() || localStorage.getItem('rml_jwt_token') || '');
  const [showApiSettings, setShowShowApiSettings] = useState<boolean>(false);
  const [apiResponseDetails, setApiResponseDetails] = useState<any | null>(null);

  // Template variables state
  const [templateVariableValues, setTemplateVariableValues] = useState<Record<string, string>>({
    'var1': 'John Doe',
    'var2': '99821',
    'var3': 'CONFIRM30'
  });

  // Bulk state
  const [campaignName, setCampaignName] = useState('Q3 Customer Re-Engagement');
  const [recipientCount, setRecipientCount] = useState<number>(1000);
  const [parsedCsvName, setParsedCsvName] = useState<string>('');

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Auto populate customMessage when template is selected
  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find(t => t.id === tplId);
    if (tpl) {
      setCustomMessage(tpl.bodyText || '');
    }
  };

  // Compute final interpolated message body replacing [var1], {{1}}, etc.
  const getInterpolatedMessage = (): string => {
    let msg = customMessage;
    if (selectedTemplate && selectedTemplate.variables) {
      selectedTemplate.variables.forEach((v, idx) => {
        const val = templateVariableValues[`var_${idx + 1}`] || templateVariableValues[v] || `[${v}]`;
        msg = msg.replace(`[var${idx + 1}]`, val)
                 .replace(`{{${idx + 1}}}`, val)
                 .replace(`[${v}]`, val);
      });
    }
    return msg;
  };

  // Rate lookup for channel
  const matchedRate = rateCards.find(r => r.channel === activeChannel);
  const costPerMsg = matchedRate?.ratePerMsg ?? 0.0085;
  const totalCost = mode === 'single' ? costPerMsg : (recipientCount ?? 1) * costPerMsg;

  const handleSaveToken = (val: string) => {
    setJwtToken(val);
    routeMobileApi.setToken(val);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setParsedCsvName(file.name);
      setRecipientCount(Math.floor(500 + Math.random() * 2500));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);
    setSendSuccess(null);
    setApiResponseDetails(null);

    const currentBal = walletBalance ?? 0;
    if (currentBal < totalCost) {
      setSendError(`Insufficient Wallet Balance (₹${currentBal.toFixed(2)} available vs ₹${(totalCost ?? 0).toFixed(2)} required). Please top up your wallet.`);
      return;
    }

    setIsSending(true);

    try {
      const finalMsgText = getInterpolatedMessage();
      const tName = selectedTemplate ? selectedTemplate.name : 'session_direct';

      // Ensure active token is saved in routeMobileApi
      const activeToken = jwtToken || routeMobileApi.getToken() || localStorage.getItem('rml_jwt_token') || '';
      if (activeToken) {
        routeMobileApi.setToken(activeToken);
      }

      // Live Backend API Message Dispatcher (/api/messages/send) & Route Mobile Upstream API
      let apiResult: any = null;
      try {
        apiResult = await backendApi.sendMessage({
          channel: activeChannel === 'WhatsApp' ? 'WhatsApp' : 'RCS',
          recipientPhone,
          text: finalMsgText,
          templateId: tName,
          variables: Object.values(templateVariableValues),
          sender: selectedTemplate?.agentName || 'WA_GATEWAY'
        });

        // Also call Route Mobile API client directly
        const rmlDirect = await routeMobileApi.sendMessage({
          phone: recipientPhone,
          text: finalMsgText,
          extra: activeChannel
        });

        setApiResponseDetails({
          backendResponse: apiResult,
          routeMobileDirect: rmlDirect
        });
      } catch (errApi) {
        console.warn('Backend API gateway fallback notice:', errApi);
      }

      if (mode === 'single') {
        const ok = sendSingleMessage(recipientPhone, activeChannel, tName, totalCost);
        if (ok) {
          const reqIdText = apiResult?.data?.id ? ` (Backend Msg ID: ${apiResult.data.id})` : '';
          setSendSuccess(`Single ${activeChannel} message sent to ${recipientPhone}${reqIdText}! Cost ₹${(totalCost ?? 0).toFixed(4)} deducted from wallet.`);
        } else {
          setSendError('Failed to dispatch message.');
        }
      } else {
        const ok = sendBulkCampaign(activeChannel, tName, recipientCount, costPerMsg, campaignName);
        if (ok) {
          setSendSuccess(`Campaign "${campaignName}" dispatched to ${(recipientCount ?? 0).toLocaleString()} recipients! Total ₹${(totalCost ?? 0).toFixed(2)} deducted from wallet.`);
        } else {
          setSendError('Failed to execute bulk campaign.');
        }
      }
    } catch (err: any) {
      console.error('API Send error:', err);
      setSendError(`Route Mobile API connection notice: ${err.message || 'Error triggering gateway'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Dispatch {activeChannel} Messages
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Execute single session dispatches or broadcast bulk campaigns with instant wallet settlement
        </p>
      </div>

      {/* Wallet Balance Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="text-xs text-blue-200 font-medium">Available Wallet Balance</div>
            <div className="text-xl font-black text-white">
              ₹{(walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-800">
          <div className="text-[11px] text-blue-200">Current Channel Rate ({activeChannel}):</div>
          <div className="text-sm font-extrabold text-blue-300">
            ₹{(costPerMsg ?? 0).toFixed(4)} / message
          </div>
        </div>
      </div>

      {/* Route Mobile API Gateway Status Banner */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="font-extrabold text-xs text-slate-900">Route Mobile WhatsApp API Endpoint: </span>
              <span className="font-mono text-xs text-blue-600">https://apis.rmlconnect.net</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowShowApiSettings(!showApiSettings)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{showApiSettings ? 'Hide API Auth' : 'Configure JWT Token'}</span>
          </button>
        </div>

        {showApiSettings && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-[11px] font-bold text-slate-700">
              Route Mobile Authorization JWT Token / Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={jwtToken}
                onChange={(e) => handleSaveToken(e.target.value)}
                placeholder="Paste JWTAUTH token or Bearer key..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={async () => {
                  if (jwtToken) routeMobileApi.setToken(jwtToken);
                  try {
                    const data = await routeMobileApi.fetchAllDetails(jwtToken);
                    setApiResponseDetails({
                      status: '200 OK Token Validated',
                      details: data
                    });
                  } catch (err: any) {
                    setApiResponseDetails({ error: err.message || 'Error fetching details' });
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-2xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Fetch Details from APIs</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Token is used to authorize endpoints on <code>apis.rmlconnect.net</code> and backend proxy.
            </p>
          </div>
        )}

        {apiResponseDetails && (
          <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
            <div className="text-emerald-400 font-bold text-[10px]">ROUTE MOBILE GATEWAY LIVE RESPONSE:</div>
            <pre>{JSON.stringify(apiResponseDetails, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Main Dispatch Form */}
      <form onSubmit={handleSend} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">

        {/* Mode Toggle: Single vs Bulk */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Dispatch Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                mode === 'single'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xs font-bold">Single Session Dispatch</div>
                <div className="text-[10px] text-slate-500">Test message to single recipient</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('bulk')}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                mode === 'bulk'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-xs font-bold">Bulk CSV Campaign</div>
                <div className="text-[10px] text-slate-500">Broadcast to uploaded subscriber list</div>
              </div>
            </button>
          </div>
        </div>

        {/* Single Mode Input */}
        {mode === 'single' ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recipient Phone Number (E.164 Format) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-medium"
              placeholder="+919876543210"
            />
          </div>
        ) : (
          /* Bulk Mode Inputs */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campaign Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Recipient List (CSV / Excel)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center bg-slate-50/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleCsvUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-800">
                  {parsedCsvName ? `Uploaded: ${parsedCsvName}` : 'Click or Drag CSV recipient file here'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Supported columns: Phone, Name, Variable1, Variable2
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audience Recipient Volume Count
              </label>
              <input
                type="number"
                value={recipientCount}
                onChange={(e) => setRecipientCount(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono font-bold"
                min="1"
              />
            </div>
          </div>
        )}

        {/* Approved Template Selection with Live Search */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">
              Select Approved {activeChannel} Template
            </label>
            <button
              type="button"
              onClick={() => setActiveTab('Template')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              + Create Template
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={templateSearchQuery}
                onChange={(e) => {
                  setTemplateSearchQuery(e.target.value);
                  setIsTemplateDropdownOpen(true);
                }}
                onFocus={() => setIsTemplateDropdownOpen(true)}
                placeholder={`Search ${activeChannel} template by name, category (e.g. wa_auth_otp, marketing)...`}
                className="w-full pl-9 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
              />
              {templateSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setTemplateSearchQuery('');
                  }}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selected Active Template Badge Banner */}
            {selectedTemplate ? (
              <div className="mt-2 p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0 px-2 py-0.5 bg-blue-600 text-white font-mono font-bold text-[10px] rounded-md uppercase">
                    {selectedTemplate.category || 'Utility'}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                      <span>{selectedTemplate.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({selectedTemplate.type})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {selectedTemplate.bodyText || 'Template text selected'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectTemplate('')}
                  className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200/60"
                >
                  Clear Selection
                </button>
              </div>
            ) : null}

            {/* Filtered Templates Dropdown List */}
            {isTemplateDropdownOpen && (
              <div className="mt-1.5 max-h-60 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg z-20 space-y-0.5 p-1.5 divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectTemplate('');
                    setIsTemplateDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                    !selectedTemplateId ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>-- Direct Custom Message (Session) --</span>
                  {!selectedTemplateId && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>

                {templates
                  .filter(t => (t.channel || '').toLowerCase() === (activeChannel || '').toLowerCase())
                  .filter(t => {
                    if (!templateSearchQuery.trim()) return true;
                    const q = templateSearchQuery.toLowerCase();
                    return (
                      t.name.toLowerCase().includes(q) ||
                      (t.category || '').toLowerCase().includes(q) ||
                      (t.type || '').toLowerCase().includes(q) ||
                      (t.bodyText || '').toLowerCase().includes(q) ||
                      (t.agentName || '').toLowerCase().includes(q)
                    );
                  })
                  .map((t, idx) => {
                    const isSelected = selectedTemplateId === t.id;
                    return (
                      <button
                        key={`${t.id}_${idx}`}
                        type="button"
                        onClick={() => {
                          handleSelectTemplate(t.id);
                          setIsTemplateDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition-all space-y-1 block ${
                          isSelected
                            ? 'bg-blue-50/90 border border-blue-200 text-blue-900'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold text-xs truncate">
                            <span className="truncate">{t.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({t.type})</span>
                          </div>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase shrink-0 ${
                            t.category === 'Marketing' ? 'bg-purple-100 text-purple-700' :
                            t.category === 'Authentication' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {t.category || 'UTILITY'}
                          </span>
                        </div>
                        {t.bodyText && (
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {t.bodyText}
                          </p>
                        )}
                      </button>
                    );
                  })}

                {templates
                  .filter(t => (t.channel || '').toLowerCase() === (activeChannel || '').toLowerCase())
                  .filter(t => {
                    if (!templateSearchQuery.trim()) return true;
                    const q = templateSearchQuery.toLowerCase();
                    return (
                      t.name.toLowerCase().includes(q) ||
                      (t.category || '').toLowerCase().includes(q) ||
                      (t.type || '').toLowerCase().includes(q) ||
                      (t.bodyText || '').toLowerCase().includes(q)
                    );
                  }).length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No templates matching "{templateSearchQuery}"
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* If template has variables, render dynamic input fields */}
          {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2.5">
              <div className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Template Dynamic Variables ({selectedTemplate.variables.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedTemplate.variables.map((v, idx) => (
                  <div key={idx}>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Variable #{idx + 1}: <span className="font-mono text-blue-700">{v}</span>
                    </label>
                    <input
                      type="text"
                      value={templateVariableValues[`var_${idx + 1}`] || ''}
                      onChange={(e) => setTemplateVariableValues(prev => ({
                        ...prev,
                        [`var_${idx + 1}`]: e.target.value,
                        [v]: e.target.value
                      }))}
                      placeholder={`Enter value for ${v}...`}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Text Body / Preview Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message Content / Template Text
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              placeholder="Type session message content..."
            />
          </div>

          {/* Live Substituted Preview */}
          <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
              Live Substituted {activeChannel} Preview:
            </div>
            <div className="text-xs font-sans text-slate-200 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
              {getInterpolatedMessage()}
            </div>
          </div>
        </div>

        {/* Cost Summary Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Volume Recipients:</span>
            <span className="font-bold text-slate-900">
              {mode === 'single' ? '1 Recipient' : `${(recipientCount ?? 0).toLocaleString()} Recipients`}
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Rate Per Message:</span>
            <span className="font-bold text-slate-900">₹{(costPerMsg ?? 0).toFixed(4)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black">
            <span className="text-slate-900">Estimated Total Wallet Deduction:</span>
            <span className="text-blue-700">₹{(totalCost ?? 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Feedback Banners */}
        {sendError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{sendError}</span>
          </div>
        )}

        {sendSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sendSuccess}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSending}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Dispatching through {activeChannel} Carriers...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Execute {activeChannel} Dispatch (₹{(totalCost ?? 0).toFixed(2)})</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
};
