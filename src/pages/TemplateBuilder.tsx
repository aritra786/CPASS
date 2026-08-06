import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MobileDevicePreview } from '../components/MobileDevicePreview';
import { ChannelType, TemplateAction, TemplateType } from '../types';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
  Download,
  HelpCircle,
  Upload
} from 'lucide-react';

export const TemplateBuilder: React.FC = () => {
  const { activeChannel, addTemplate, templates, setActiveTab } = useApp();

  // Form State
  const [templateName, setTemplateName] = useState('order_confirmation_v2');
  const [templateType, setTemplateType] = useState<TemplateType>('Rich Card');
  const [agentName, setAgentName] = useState('CONNEX Support');
  const [variables, setVariables] = useState<string[]>(['Name', 'Order ID']);
  const [newVarInput, setNewVarInput] = useState('');

  const [headerType, setHeaderType] = useState<'None' | 'Image' | 'Video'>('Image');
  const [headerMediaUrl, setHeaderMediaUrl] = useState(
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
  );
  const [bodyText, setBodyText] = useState(
    'Hello [var1], your order #[var2] has been confirmed! We are preparing your shipment.'
  );

  const [actions, setActions] = useState<TemplateAction[]>([
    { id: 'act_1', type: 'URL', label: 'Track Delivery', value: 'https://connex.io/track' },
    { id: 'act_2', type: 'PHONE', label: 'Call Care', value: '+18005550199' },
    { id: 'act_3', type: 'QUICK_REPLY', label: 'Modify Order', value: 'MODIFY' }
  ]);

  const [isSaved, setIsSaved] = useState(false);

  const handleAddVariable = () => {
    if (!newVarInput.trim()) return;
    if (!variables.includes(newVarInput.trim())) {
      setVariables(prev => [...prev, newVarInput.trim()]);
    }
    setNewVarInput('');
  };

  const handleRemoveVariable = (varName: string) => {
    setVariables(prev => prev.filter(v => v !== varName));
  };

  const handleAddAction = () => {
    if (actions.length >= 4) {
      alert('Maximum 4 interactive actions allowed per template.');
      return;
    }
    const newAct: TemplateAction = {
      id: `act_${Date.now()}`,
      type: 'QUICK_REPLY',
      label: 'New Action',
      value: 'ACTION_VAL'
    };
    setActions(prev => [...prev, newAct]);
  };

  const handleRemoveAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAction = (id: string, field: keyof TemplateAction, val: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert('Please enter a template name.');
      return;
    }

    addTemplate({
      name: templateName.toLowerCase().replace(/\s+/g, '_'),
      channel: activeChannel,
      type: templateType,
      agentName,
      bodyText,
      headerMediaUrl,
      headerType,
      variables,
      actions
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setActiveTab('Template');
    }, 1200);
  };

  return (
    <div className="space-y-6">

      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('Dashboard')}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create {activeChannel} Template
            </h1>
            <p className="text-xs text-slate-500">
              Build your message and preview it live on a mobile device
            </p>
          </div>
        </div>

        <button
          onClick={() => alert("CONNEX Template Guidelines:\n- Maximum 2,500 characters per body text\n- Variables formatted in [var1] or [Name]\n- CTA buttons support HTTPS URLs and E.164 phone numbers.")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Template Guideline</span>
        </button>
      </div>

      {/* Main Split Layout: Form on Left, Mobile Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Stepper Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Stepper Header Tabs */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Template Details</div>
                <div className="text-[10px] text-slate-500">Set name, type, agent and variables</div>
              </div>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Message Content</div>
                <div className="text-[10px] text-slate-500">Compose text, actions and media</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveTemplate} className="space-y-6">

            {/* STEP 1: Template Details Box */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Template Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Template Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
                    placeholder="Enter template name..."
                  />
                </div>

                {/* Template Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Template Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium bg-white"
                  >
                    <option value="Text">Text Only</option>
                    <option value="Rich Card">Rich Card</option>
                    <option value="Carousel">Carousel</option>
                    <option value="OTP">OTP / Security</option>
                    <option value="Interactive Action">Interactive Action</option>
                  </select>
                </div>

                {/* Agent Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Agent Name <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium bg-white"
                  >
                    <option value="CONNEX Support">CONNEX Support</option>
                    <option value="CONNEX Marketing">CONNEX Marketing</option>
                    <option value="CONNEX Auth Care">CONNEX Auth Care</option>
                  </select>
                </div>

              </div>

              {/* Variables Management */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Template Variables
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newVarInput}
                    onChange={(e) => setNewVarInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVariable();
                      }
                    }}
                    placeholder="Add Variable (e.g. Name, OrderID)..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariable}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Variable Pills */}
                <div className="flex flex-wrap gap-2">
                  {variables.map((v, i) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg"
                    >
                      <span>[var{i + 1}]: {v}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariable(v)}
                        className="text-blue-400 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* STEP 2: Message Content Box */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900">Message Content</h3>
                <span className="text-[11px] text-slate-400">
                  {bodyText.length} / 2500 characters
                </span>
              </div>

              {/* Note banner matching Screenshot 3 */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>NOTE:</strong> Variables to be added in square brackets i.e <code>[var1]</code>, <code>[var2]</code>.
                </span>
              </div>

              {/* Body Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Text Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  maxLength={2500}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed font-sans"
                  placeholder="Type message content here..."
                />
              </div>

              {/* Header Media Selector (Rich Cards) */}
              {templateType === 'Rich Card' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Header Media (Rich Image)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={headerMediaUrl}
                      onChange={(e) => setHeaderMediaUrl(e.target.value)}
                      placeholder="Paste Image URL (https://...)"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setHeaderMediaUrl(
                          'https://images.unsplash.com/photo-1556742049-0a67f2d429a8?auto=format&fit=crop&w=800&q=80'
                        )
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sample</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Quick Replies / Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Interactive Buttons / Quick Replies ({actions.length}/4)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Button</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {actions.map((act, i) => (
                    <div
                      key={act.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2"
                    >
                      <select
                        value={act.type}
                        onChange={(e) =>
                          handleUpdateAction(act.id, 'type', e.target.value as any)
                        }
                        className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white font-semibold"
                      >
                        <option value="QUICK_REPLY">Quick Reply</option>
                        <option value="URL">Visit URL</option>
                        <option value="PHONE">Call Phone</option>
                      </select>

                      <input
                        type="text"
                        value={act.label}
                        onChange={(e) =>
                          handleUpdateAction(act.id, 'label', e.target.value)
                        }
                        placeholder="Button Label"
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white font-medium"
                      />

                      <input
                        type="text"
                        value={act.value}
                        onChange={(e) =>
                          handleUpdateAction(act.id, 'value', e.target.value)
                        }
                        placeholder="Action Value / URL"
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white font-mono text-[11px]"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveAction(act.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Save Template Action Bar */}
            <div className="flex items-center justify-end gap-3">
              {isSaved ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Template Saved & Submitted for Carrier Approval!</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Submit Template</span>
                </button>
              )}
            </div>

          </form>

        </div>

        {/* Right Column: Live Mobile Device Frame Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="bg-slate-100/80 rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col items-center">
            <MobileDevicePreview
              channel={activeChannel}
              agentName={agentName}
              bodyText={bodyText}
              headerType={headerType}
              headerMediaUrl={headerMediaUrl}
              actions={actions}
              variables={variables}
            />
          </div>
        </div>

      </div>

    </div>
  );
};
