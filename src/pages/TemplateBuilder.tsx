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
  Upload,
  Image as ImageIcon,
  FileDown,
  Layers,
  Info,
  CreditCard
} from 'lucide-react';

interface CarouselCardItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'Image' | 'Video';
  width: 'Small' | 'Medium' | 'Full';
  height: 'Short' | 'Medium' | 'Tall';
  actions: TemplateAction[];
}

interface TemplateBuilderProps {
  onCancel?: () => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ onCancel }) => {
  const { activeChannel, addTemplate, setActiveTab } = useApp();

  // Form State
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState<TemplateType>('Text');
  const [agentName, setAgentName] = useState('Select Agent Name');
  const [messageOrder, setMessageOrder] = useState('Select Message Order');

  // Variables
  const [variables, setVariables] = useState<string[]>([]);
  const [newVarInput, setNewVarInput] = useState('');

  // Text message content
  const [bodyText, setBodyText] = useState('');

  // Rich card / Media State
  const [mediaType, setMediaType] = useState<'Image' | 'Video'>('Image');
  const [mediaWidth, setMediaWidth] = useState<'Small' | 'Medium' | 'Full'>('Small');
  const [mediaHeight, setMediaHeight] = useState<'Short' | 'Medium' | 'Tall'>('Short');
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');

  // Carousel Cards State
  const [carouselCards, setCarouselCards] = useState<CarouselCardItem[]>([
    {
      id: 'card_1',
      title: 'Card 1',
      description: 'No description yet',
      mediaUrl: '',
      mediaType: 'Image',
      width: 'Small',
      height: 'Short',
      actions: []
    },
    {
      id: 'card_2',
      title: 'Card 2',
      description: 'No description yet',
      mediaUrl: '',
      mediaType: 'Image',
      width: 'Small',
      height: 'Short',
      actions: []
    }
  ]);
  const [selectedCarouselIndex, setSelectedCarouselIndex] = useState(0);

  // Actions
  const [actions, setActions] = useState<TemplateAction[]>([]);

  const [isSaved, setIsSaved] = useState(false);

  // Determine if Section 1 is filled
  const isDetailsComplete = Boolean(templateName.trim() && agentName !== 'Select Agent Name');

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

  const handleAddCarouselCard = () => {
    if (carouselCards.length >= 10) {
      alert('Maximum 10 cards allowed per carousel template.');
      return;
    }
    const newIdx = carouselCards.length + 1;
    const newCard: CarouselCardItem = {
      id: `card_${Date.now()}`,
      title: `Card ${newIdx}`,
      description: 'No description yet',
      mediaUrl: '',
      mediaType: 'Image',
      width: 'Small',
      height: 'Short',
      actions: []
    };
    setCarouselCards(prev => [...prev, newCard]);
    setSelectedCarouselIndex(carouselCards.length);
  };

  const handleRemoveCarouselCard = (id: string) => {
    if (carouselCards.length <= 1) {
      alert('Carousel requires at least 1 card.');
      return;
    }
    setCarouselCards(prev => prev.filter(c => c.id !== id));
    setSelectedCarouselIndex(0);
  };

  const handleAddAction = () => {
    if (actions.length >= 4) {
      alert('Maximum 4 interactive actions allowed.');
      return;
    }
    const newAct: TemplateAction = {
      id: `act_${Date.now()}`,
      type: 'QUICK_REPLY',
      label: 'Action Button',
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
    if (agentName === 'Select Agent Name') {
      alert('Please select an agent name.');
      return;
    }

    addTemplate({
      name: templateName.toLowerCase().replace(/\s+/g, '_'),
      channel: 'RCS',
      type: templateType,
      agentName,
      bodyText: bodyText || (templateType === 'Carousel' ? 'Carousel template' : 'Template body'),
      headerMediaUrl,
      headerType: templateType === 'Rich Card' ? 'Image' : 'None',
      variables,
      actions
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onCancel) {
        onCancel();
      } else {
        setActiveTab('Template');
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">

      {/* Top Header Row matching Screenshots 1, 2, 3, 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onCancel) onCancel();
              else setActiveTab('Template');
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create RCS Template
            </h1>
            <p className="text-xs text-slate-500">
              Build your message and preview it live on a mobile device
            </p>
          </div>
        </div>

        <button
          onClick={() => alert("Downloading RCS Template Guideline PDF...")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-xl transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Template Guideline</span>
        </button>
      </div>

      {/* Main Grid: Stepper Form (Left 7 Cols) & Mobile Live Preview (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-5">

          {/* Stepper Navigation Bar matching Screenshot 1 */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center gap-4">
            
            {/* Step 1 */}
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Template details</div>
                <div className="text-[10px] text-slate-500 line-clamp-1">
                  Set the name, type, agent and variables
                </div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Step 2 */}
            <div className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                isDetailsComplete ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                {isDetailsComplete ? '2' : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div>
                <div className={`text-xs font-bold ${isDetailsComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                  Message content
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1">
                  Compose the message, actions and cards for this template
                </div>
              </div>
            </div>

          </div>

          <form onSubmit={handleSaveTemplate} className="space-y-5">

            {/* SECTION 1: Template details Card matching Screenshots 1-4 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Template details</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Set the name, type, agent and variables
                  </p>
                </div>
              </div>

              {/* Form Row 1 */}
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
                    placeholder="Enter template name..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    <option value="Text">Text</option>
                    <option value="Rich Card">Rich Card</option>
                    <option value="Carousel">Carousel</option>
                    <option value="Text + PDF">Text + PDF</option>
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    <option value="Select Agent Name">Select Agent Name</option>
                    <option value="RMLUAT11">RMLUAT11</option>
                    <option value="routeotp">routeotp</option>
                    <option value="CONNEX Support">CONNEX Support</option>
                  </select>
                </div>

              </div>

              {/* Form Row 2: Variables & Message Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                
                {/* Variables */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Variables
                  </label>
                  <div className="flex gap-2">
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
                      placeholder="Add Variables ..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
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

                  {variables.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {variables.map((v, i) => (
                        <span
                          key={v}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg"
                        >
                          <span>[var{i + 1}]: {v}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariable(v)}
                            className="text-blue-400 hover:text-blue-800 text-sm font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Order (Shown for Text + PDF) matching Screenshot 4 */}
                {templateType === 'Text + PDF' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Message Order
                    </label>
                    <select
                      value={messageOrder}
                      onChange={(e) => setMessageOrder(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    >
                      <option value="Select Message Order">Select Message Order</option>
                      <option value="Text then PDF">Text then PDF</option>
                      <option value="PDF then Text">PDF then Text</option>
                    </select>
                  </div>
                )}

              </div>

            </div>

            {/* Complete Notice Banner matching Screenshots 1-4 */}
            <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
              isDetailsComplete
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50/90 border-amber-200 text-amber-800'
            }`}>
              {isDetailsComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>
                {isDetailsComplete
                  ? 'Template details complete! Message content unlocked.'
                  : 'Complete Template details above to unlock Message content.'}
              </span>
            </div>

            {/* SECTION 2: Message content Card matching Screenshots 1, 2, 3, 4 */}
            <div className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 transition-all ${
              !isDetailsComplete && 'opacity-60 pointer-events-none'
            }`}>
              
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Message content</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Compose the message, actions and cards for this template
                  </p>
                </div>
              </div>

              {/* Yellow Note Box matching Screenshots 1, 2, 3, 4 */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>NOTE:</strong> Variables to be added in between square brackets i.e [var].
                </span>
              </div>

              {/* TYPE SPECIFIC FORM CONTROLE */}

              {/* 1. TEXT ONLY / TEXT + PDF */}
              {(templateType === 'Text' || templateType === 'Text + PDF') && (
                <div className="space-y-4">
                  
                  {templateType === 'Text + PDF' && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Upload PDF Document
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Paste PDF Document URL (https://...)"
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload PDF</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter Text Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      maxLength={2500}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Maximum 2500 characters..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* 2. RICH CARD EDITOR matching Screenshot 2 */}
              {templateType === 'Rich Card' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <h4 className="font-extrabold text-xs text-slate-900 mb-0.5">Rich card</h4>
                    <p className="text-[11px] text-slate-500">Configure media, text and per-card suggestions</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Media Type</label>
                      <select
                        value={mediaType}
                        onChange={(e) => setMediaType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="Image">Image</option>
                        <option value="Video">Video</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Width</label>
                      <select
                        value={mediaWidth}
                        onChange={(e) => setMediaWidth(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Full">Full</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Media Height</label>
                      <select
                        value={mediaHeight}
                        onChange={(e) => setMediaHeight(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="Short">Short</option>
                        <option value="Medium">Medium</option>
                        <option value="Tall">Tall</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Media URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={headerMediaUrl}
                        onChange={(e) => setHeaderMediaUrl(e.target.value)}
                        placeholder="Enter media URL (https://...)"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setHeaderMediaUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                      >
                        Sample Image
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enter Card Message / Description
                    </label>
                    <textarea
                      rows={3}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Maximum 2500 characters..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* 3. CAROUSEL EDITOR matching Screenshot 3 */}
              {templateType === 'Carousel' && (
                <div className="space-y-4">
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900">Carousel Message Editor</h4>
                      <p className="text-[11px] text-slate-500">Advanced carousel message cards</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-200/80 text-slate-700 font-extrabold text-[10px] rounded-lg">
                      Up to {carouselCards.length}/10
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Left Column: Cards List matching Screenshot 3 */}
                    <div className="md:col-span-5 space-y-2">
                      {carouselCards.map((card, idx) => (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCarouselIndex(idx)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            selectedCarouselIndex === idx
                              ? 'bg-red-50/50 border-rose-300 ring-1 ring-rose-300'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                              {idx + 1}
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-extrabold text-xs text-slate-900">{card.title}</div>
                              <div className="text-[10px] text-slate-400 line-clamp-1">{card.description}</div>
                            </div>
                          </div>

                          {carouselCards.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCarouselCard(card.id);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddCarouselCard}
                        className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-dashed border-blue-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Card</span>
                      </button>

                      <p className="text-[10px] text-slate-400 font-medium">
                        You can add up to 10 cards in a carousel template.
                      </p>
                    </div>

                    {/* Right Column: Card Details Editor matching Screenshot 3 */}
                    <div className="md:col-span-7 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-800">Card Details</h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Media Type</label>
                          <select className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium">
                            <option value="Image">Image</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Width</label>
                          <select className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium">
                            <option value="Small">Small</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Media Height</label>
                        <select className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium">
                          <option value="Short">Short</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Title</label>
                        <input
                          type="text"
                          value={carouselCards[selectedCarouselIndex]?.title || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCarouselCards(prev => prev.map((c, i) => i === selectedCarouselIndex ? { ...c, title: val } : c));
                          }}
                          placeholder="Card title"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Description</label>
                        <textarea
                          rows={2}
                          value={carouselCards[selectedCarouselIndex]?.description || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCarouselCards(prev => prev.map((c, i) => i === selectedCarouselIndex ? { ...c, description: val } : c));
                          }}
                          placeholder="Card description"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                        />
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* Interactive Quick Replies / Action Buttons for all types */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
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
                        onChange={(e) => handleUpdateAction(act.id, 'type', e.target.value as any)}
                        className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white font-semibold"
                      >
                        <option value="QUICK_REPLY">Quick Reply</option>
                        <option value="URL">Visit URL</option>
                        <option value="PHONE">Call Phone</option>
                      </select>

                      <input
                        type="text"
                        value={act.label}
                        onChange={(e) => handleUpdateAction(act.id, 'label', e.target.value)}
                        placeholder="Button Label"
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white font-medium"
                      />

                      <input
                        type="text"
                        value={act.value}
                        onChange={(e) => handleUpdateAction(act.id, 'value', e.target.value)}
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

            {/* Save Template Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {isSaved ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Template Saved & Submitted for Carrier Approval!</span>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!isDetailsComplete}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Submit Template</span>
                </button>
              )}
            </div>

          </form>

        </div>

        {/* Right Live Device Preview Column (5 Cols) matching Screenshots 1, 2, 3, 4 */}
        <div className="lg:col-span-5 sticky top-20">
          <MobileDevicePreview
            channel="RCS"
            agentName={agentName === 'Select Agent Name' ? 'RCS Business' : agentName}
            templateType={templateType}
            bodyText={bodyText}
            headerMediaUrl={headerMediaUrl}
            headerType={templateType === 'Rich Card' ? 'Image' : 'None'}
            actions={actions}
            variables={variables}
            messageOrder={messageOrder}
            cards={carouselCards.map(c => ({
              title: c.title,
              description: c.description,
              mediaUrl: c.mediaUrl,
              actions: c.actions
            }))}
          />
        </div>

      </div>

    </div>
  );
};
