import React, { useState, useEffect, useMemo } from 'react';
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
  Upload,
  Image as ImageIcon,
  Info,
  Megaphone,
  Bell,
  MessageSquare,
  Copy,
  BookOpen,
  Tag,
  Grid,
  Book,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Smile,
  ExternalLink,
  PhoneCall,
  Video
} from 'lucide-react';

import { backendApi } from '../services/backendApi';
import { routeMobileApi } from '../services/routeMobileApi';

interface CarouselCardItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'Image' | 'Video';
  actions: TemplateAction[];
}

interface TemplateBuilderProps {
  initialChannel?: 'WhatsApp' | 'RCS';
  onCancel?: () => void;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ initialChannel, onCancel }) => {
  const { activeChannel, addTemplate, setActiveTab, tenants, selectedAccountId } = useApp();

  const currentTenant = tenants.find(t => t.accountId === selectedAccountId);
  const allowedUserType = currentTenant?.userType || 'Both';

  // Selected Channel: WhatsApp vs RCS
  const [templateChannel, setTemplateChannel] = useState<'WhatsApp' | 'RCS'>(() => {
    if (allowedUserType === 'WhatsApp') return 'WhatsApp';
    if (allowedUserType === 'RCS') return 'RCS';
    return initialChannel || (activeChannel === 'WhatsApp' ? 'WhatsApp' : 'RCS');
  });

  // Section 1: Basic Information State matching screenshots
  const [category, setCategory] = useState<'Marketing' | 'Utility' | 'Authentication'>('Marketing');
  const [subcategory, setSubcategory] = useState<
    'Default' | 'Carousel' | 'Copy code' | 'Catalog' | 'Limited Time Offer' | 'Multi-Product Message Template'
  >('Default');
  const [templateName, setTemplateName] = useState('');
  const [language, setLanguage] = useState('English');
  const [agentName, setAgentName] = useState('WABA 109481 (Meta)');

  // Section 2: Message Content State matching screenshots
  const [headerType, setHeaderType] = useState<'None' | 'Text' | 'Media'>('None');
  const [mediaType, setMediaType] = useState<'Image' | 'Video' | 'Document'>('Image');
  const [headerText, setHeaderText] = useState('');
  const [headerMediaUrl, setHeaderMediaUrl] = useState('');
  
  const [bodyText, setBodyText] = useState('');
  const [footerText, setFooterText] = useState('');
  
  // Carousel State matching Screenshot 4
  const [carouselCards, setCarouselCards] = useState<CarouselCardItem[]>([
    { id: 'card_1', title: 'Card 1', description: '', mediaUrl: '', mediaType: 'Image', actions: [] },
    { id: 'card_2', title: 'Card 2', description: '', mediaUrl: '', mediaType: 'Image', actions: [] }
  ]);
  const [selectedCarouselIndex, setSelectedCarouselIndex] = useState(0);

  // Buttons State
  const [actions, setActions] = useState<TemplateAction[]>([]);

  // Advanced Options State
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [ttlSeconds, setTtlSeconds] = useState('');

  // Variables & Modals
  const [variables, setVariables] = useState<string[]>([]);
  const [showGuidelineModal, setShowGuidelineModal] = useState(false);
  const [showAddSampleModal, setShowAddSampleModal] = useState(false);
  const [sampleValues, setSampleValues] = useState<Record<string, string>>({});

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (allowedUserType === 'WhatsApp') {
      setTemplateChannel('WhatsApp');
      setAgentName('WABA 109481 (Meta)');
    } else if (allowedUserType === 'RCS') {
      setTemplateChannel('RCS');
      setAgentName('RMLUAT11');
    }
  }, [allowedUserType]);

  // Determine if Basic Information is filled (Step 1 unlock logic)
  const isBasicInfoComplete = Boolean(templateName.trim().length > 0);

  const [sampleHeaderMediaUrl, setSampleHeaderMediaUrl] = useState<string>('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80');
  const [sampleDocName, setSampleDocName] = useState<string>('Sample_Invoice.pdf');
  const [rmlSubmitStatus, setRmlSubmitStatus] = useState<any | null>(null);

  // Automatically extract all variables present in headerText, bodyText, and carousel cards
  const activeDetectedVariables = useMemo(() => {
    const fullText = `${headerText} ${bodyText} ${carouselCards.map(c => c.description).join(' ')}`;
    const matches = Array.from(fullText.matchAll(/\{\{(\d+)\}\}/g)).map(m => m[1]);
    const varMatches = Array.from(fullText.matchAll(/\[var(\d+)\]/gi)).map(m => m[1]);
    const unique = Array.from(new Set([...matches, ...varMatches]));
    unique.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    if (unique.length === 0 && variables.length > 0) {
      return variables.map(v => v.replace(/^var/i, ''));
    }
    return unique;
  }, [headerText, bodyText, carouselCards, variables]);

  const handleAddVariableToBody = () => {
    const matches = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g)).map(m => parseInt(m[1], 10));
    const varMatches = Array.from(bodyText.matchAll(/\[var(\d+)\]/gi)).map(m => parseInt(m[1], 10));
    const allNums = [...matches, ...varMatches];
    const maxNum = allNums.length > 0 ? Math.max(...allNums) : 0;
    const nextVarNum = maxNum + 1;
    const varTag = `{{${nextVarNum}}}`;
    setBodyText(prev => prev ? `${prev} ${varTag}` : varTag);
    if (!variables.includes(String(nextVarNum))) {
      setVariables(prev => [...prev, String(nextVarNum)]);
    }
  };

  const handleInsertFormat = (formatSymbol: string) => {
    setBodyText(prev => `${prev}${formatSymbol}text${formatSymbol}`);
  };

  const handleAddCarouselCard = () => {
    if (carouselCards.length >= 10) {
      alert('Maximum 10 cards allowed in a carousel template.');
      return;
    }
    const newIdx = carouselCards.length + 1;
    const newCard: CarouselCardItem = {
      id: `card_${Date.now()}`,
      title: `Card ${newIdx}`,
      description: '',
      mediaUrl: '',
      mediaType: 'Image',
      actions: []
    };
    setCarouselCards(prev => [...prev, newCard]);
    setSelectedCarouselIndex(carouselCards.length);
  };

  const handleRemoveCarouselCard = (id: string) => {
    if (carouselCards.length <= 2) {
      alert('Carousel requires at least 2 cards.');
      return;
    }
    setCarouselCards(prev => prev.filter(c => c.id !== id));
    setSelectedCarouselIndex(0);
  };

  const handleAddAction = (type: 'QUICK_REPLY' | 'URL' | 'PHONE' | 'COPY_CODE' = 'QUICK_REPLY') => {
    if (actions.length >= 3 && templateChannel === 'WhatsApp') {
      alert('Maximum 3 buttons allowed for standard WhatsApp templates.');
      return;
    }
    const newAct: TemplateAction = {
      id: `act_${Date.now()}`,
      type,
      label: type === 'URL' ? 'Visit Website' : type === 'PHONE' ? 'Call Us' : 'Quick Reply',
      value: type === 'URL' ? 'https://example.com' : type === 'PHONE' ? '+1234567890' : 'RESPONSE'
    };
    setActions(prev => [...prev, newAct]);
  };

  const handleRemoveAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateAction = (id: string, field: keyof TemplateAction, val: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert('Please enter a template name.');
      return;
    }

    const formattedName = templateName.toLowerCase().replace(/\s+/g, '_');

    // Construct Route Mobile WhatsApp Template Registration API Payload
    const rmlComponents: any[] = [];
    if (headerType !== 'None') {
      const headerComp: any = {
        type: 'HEADER',
        format: headerType === 'Media' ? mediaType.toUpperCase() : 'TEXT'
      };
      if (headerType === 'Text') {
        headerComp.text = headerText;
      }
      if (headerType === 'Media') {
        const mediaSample = sampleHeaderMediaUrl || headerMediaUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';
        headerComp.example = {
          header_handle: [mediaSample]
        };
      }
      rmlComponents.push(headerComp);
    }

    // Body component
    const bodyComp: any = {
      type: 'BODY',
      text: bodyText || (subcategory === 'Carousel' ? 'Carousel template' : 'Template body text')
    };
    if (activeDetectedVariables.length > 0) {
      bodyComp.example = {
        body_text: [activeDetectedVariables.map(v => sampleValues[v] || sampleValues[`var${v}`] || `Sample_${v}`)]
      };
    }
    rmlComponents.push(bodyComp);

    // Footer
    if (footerText) {
      rmlComponents.push({ type: 'FOOTER', text: footerText });
    }

    // Actions/Buttons
    if (actions.length > 0) {
      rmlComponents.push({
        type: 'BUTTONS',
        buttons: actions.map(a => ({
          type: a.type === 'URL' ? 'URL' : a.type === 'PHONE' ? 'PHONE_NUMBER' : 'QUICK_REPLY',
          text: a.label,
          url: a.type === 'URL' ? a.value : undefined,
          phone_number: a.type === 'PHONE' ? a.value : undefined
        }))
      });
    }

    const rmlPayload = {
      name: formattedName,
      category: category.toUpperCase(),
      language: language.includes('Spanish') ? 'es' : language.includes('Hindi') ? 'hi' : 'en_US',
      components: rmlComponents
    };

    let rmlRes: any = null;
    try {
      rmlRes = await routeMobileApi.createTemplate(rmlPayload);
      setRmlSubmitStatus(rmlRes);
    } catch (err: any) {
      console.warn('Route Mobile template registration API response:', err);
    }

    const newTplData = {
      name: formattedName,
      channel: templateChannel,
      type: (subcategory === 'Carousel' ? 'Carousel' : headerType === 'Media' ? 'Rich Card' : 'Text') as TemplateType,
      agentName,
      category,
      subcategory,
      language,
      bodyText: bodyText || (subcategory === 'Carousel' ? 'Carousel template' : 'Template body text'),
      headerType: headerType === 'Media' ? mediaType : headerType,
      headerText,
      headerMediaUrl: sampleHeaderMediaUrl || headerMediaUrl,
      footerText,
      variables,
      actions,
      ttlSeconds,
      status: 'Approved' as const
    };

    // 1. Add locally
    addTemplate(newTplData);

    // 2. Call backend server
    try {
      await backendApi.saveTemplate(newTplData);
    } catch (err) {
      console.warn('Backend API save template notice:', err);
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      if (onCancel) {
        onCancel();
      } else {
        setActiveTab('Template');
      }
    }, 1800);
  };

  return (
    <div className="space-y-6">

      {/* Top Header Stepper Indicator matching Screenshots 1-4 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-6 w-full sm:w-auto">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Template Details</div>
              <div className="text-[11px] text-slate-500">Category, name & language</div>
            </div>
          </div>

          <div className="hidden md:block w-12 h-px bg-slate-200" />

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
              isBasicInfoComplete ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}>
              {isBasicInfoComplete ? '2' : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <div className={`text-xs font-bold ${isBasicInfoComplete ? 'text-slate-900' : 'text-slate-400'}`}>
                Message Content
              </div>
              <div className="text-[11px] text-slate-400">Compose your template</div>
            </div>
          </div>
        </div>

        {/* Top Right Guidelines Action */}
        <button
          type="button"
          onClick={() => setShowGuidelineModal(true)}
          className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>Template Guideline</span>
        </button>
      </div>

      {/* Main Form + Live Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Form Column (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveTemplate} className="space-y-6">

            {/* SECTION 1: BASIC INFORMATION matching Screenshots 1-4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Basic Information</h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuidelineModal(true)}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Book className="w-3.5 h-3.5" />
                  <span>Template Guideline</span>
                </button>
              </div>

              {/* Category Cards Selector matching Screenshots 1-4 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Marketing */}
                  <div
                    onClick={() => setCategory('Marketing')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                      category === 'Marketing'
                        ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {category === 'Marketing' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 mb-1">Marketing</div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Promotions, offers, announcements & re-engagement.
                      </p>
                    </div>
                  </div>

                  {/* Utility */}
                  <div
                    onClick={() => setCategory('Utility')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                      category === 'Utility'
                        ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {category === 'Utility' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 mb-1">Utility</div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Order updates, reminders & account notifications.
                      </p>
                    </div>
                  </div>

                  {/* Authentication */}
                  <div
                    onClick={() => setCategory('Authentication')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                      category === 'Authentication'
                        ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-600/20 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {category === 'Authentication' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 mb-1">Authentication</div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        One-time passcodes & verification messages.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Select Subcategory Grid matching Screenshots 1-4 */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Select Subcategory <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  
                  {/* Default */}
                  <button
                    type="button"
                    onClick={() => setSubcategory('Default')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all ${
                      subcategory === 'Default'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Default</span>
                  </button>

                  {/* Carousel */}
                  <button
                    type="button"
                    onClick={() => setSubcategory('Carousel')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all ${
                      subcategory === 'Carousel'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Carousel</span>
                  </button>

                  {/* Copy code */}
                  <button
                    type="button"
                    onClick={() => setSubcategory('Copy code')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all ${
                      subcategory === 'Copy code'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Copy className="w-4 h-4 text-emerald-600" />
                    <span>Copy code</span>
                  </button>

                  {/* Catalog */}
                  <button
                    type="button"
                    onClick={() => setSubcategory('Catalog')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all ${
                      subcategory === 'Catalog'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Catalog</span>
                  </button>

                  {/* Limited Time Offer */}
                  <button
                    type="button"
                    onClick={() => setSubcategory('Limited Time Offer')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all ${
                      subcategory === 'Limited Time Offer'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Tag className="w-4 h-4 text-rose-600" />
                    <span>Limited Time Offer</span>
                  </button>

                  {/* Multi-Product Message Template */}
                  <button
                    type="button"
                    onClick={() => setSubcategory('Multi-Product Message Template')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2.5 transition-all ${
                      subcategory === 'Multi-Product Message Template'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Grid className="w-4 h-4 text-purple-600" />
                    <span className="truncate">Multi-Product Message Template</span>
                  </button>

                </div>
              </div>

              {/* Name & Language Row matching Screenshots 1-4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Name */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {templateName.length}/512
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Language <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs appearance-none pr-10"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-slate-400">
                      <span className="text-xs">×</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Complete Basic Information Warning Banner matching Screenshots 1-4 */}
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 font-medium shadow-2xs ${
              isBasicInfoComplete
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {isBasicInfoComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>
                {isBasicInfoComplete ? (
                  <>
                    Basic Information complete! <strong>Message Content</strong> unlocked below.
                  </>
                ) : (
                  <>
                    Complete <strong>Basic Information</strong> above to unlock Message Content.
                  </>
                )}
              </span>
            </div>

            {/* SECTION 2: MESSAGE CONTENT matching Screenshots 1-4 */}
            <div className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5 transition-all ${
              !isBasicInfoComplete && 'opacity-60 pointer-events-none'
            }`}>
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Message Content</h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddSampleModal(true)}
                  className="px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>ADD SAMPLE</span>
                  {Object.keys(sampleValues).length > 0 && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{Object.keys(sampleValues).length}</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Header (Optional) matching Screenshots 1-4 */}
              {subcategory !== 'Carousel' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Header <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  
                  {/* Option Pills */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setHeaderType('None')}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        headerType === 'None'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {headerType === 'None' && <Check className="w-3.5 h-3.5" />}
                      <span>None</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHeaderType('Text')}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        headerType === 'Text'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {headerType === 'Text' && <Check className="w-3.5 h-3.5" />}
                      <span>Text</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHeaderType('Media')}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        headerType === 'Media'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {headerType === 'Media' && <Check className="w-3.5 h-3.5" />}
                      <span>Media</span>
                    </button>
                  </div>

                  {/* If Media selected */}
                  {headerType === 'Media' && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-2">
                      <div className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                        MEDIA TYPE
                      </div>
                      <div className="flex gap-2">
                        {(['Image', 'Video', 'Document'] as const).map((mType) => (
                          <button
                            key={mType}
                            type="button"
                            onClick={() => setMediaType(mType)}
                            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                              mediaType === mType
                                ? 'border-blue-600 bg-white text-blue-700 shadow-2xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {mType === 'Image' && <ImageIcon className="w-3.5 h-3.5" />}
                            {mType === 'Video' && <Video className="w-3.5 h-3.5" />}
                            {mType === 'Document' && <FileText className="w-3.5 h-3.5" />}
                            <span>{mType}</span>
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="url"
                          value={headerMediaUrl}
                          onChange={(e) => setHeaderMediaUrl(e.target.value)}
                          placeholder="Paste media sample URL (https://...)"
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setHeaderMediaUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80')}
                          className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
                        >
                          Sample
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If Text selected */}
                  {headerType === 'Text' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        maxLength={60}
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="Enter header text..."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                      />
                    </div>
                  )}

                </div>
              )}

              {/* Body * matching Screenshots 1-4 */}
              {subcategory !== 'Carousel' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Body <span className="text-rose-500">*</span>
                  </label>
                  
                  {/* Rich Textarea Box with Bottom Formatting Bar */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white shadow-2xs">
                    <textarea
                      rows={5}
                      maxLength={1024}
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Enter body text..."
                      className="w-full p-4 text-xs font-medium text-slate-800 focus:outline-none leading-relaxed resize-y"
                    />

                    {/* Bottom Formatting Toolbar inside textarea box */}
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {/* Formatting icons */}
                        <button
                          type="button"
                          onClick={() => handleInsertFormat('*')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 font-bold text-xs"
                          title="Bold (*text*)"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat('_')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 italic text-xs font-bold"
                          title="Italic (_text_)"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat('~')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 line-through text-xs font-bold"
                          title="Strikethrough (~text~)"
                        >
                          S
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat('```')}
                          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 font-mono text-[11px]"
                          title="Monospace (```text```)"
                        >
                          &lt;/&gt;
                        </button>

                        <div className="h-4 w-px bg-slate-300 mx-1" />

                        {/* Add Variable Button */}
                        <button
                          type="button"
                          onClick={handleAddVariableToBody}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>+ ADD VARIABLE</span>
                          <Info className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>

                      {/* Character counter */}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {bodyText.length}/1024
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CAROUSEL SECTION matching Screenshot 4 */}
              {subcategory === 'Carousel' && (
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
                    CAROUSEL SECTION
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Carousel Cards</h4>
                        <p className="text-[11px] text-slate-500">
                          All cards share the same set of buttons. Edit each card's content individually.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700 shrink-0">HEADER TYPE *</label>
                        <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold">
                          <option value="Image">Image</option>
                          <option value="Video">Video</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      
                      {/* Left: Card Selector */}
                      <div className="md:col-span-5 space-y-2">
                        {carouselCards.map((card, idx) => (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCarouselIndex(idx)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              selectedCarouselIndex === idx
                                ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-2xs'
                                : 'bg-white/80 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                                {idx + 1}
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-extrabold text-xs text-slate-900">Card {idx + 1}</div>
                                <div className="text-[10px] text-slate-400">
                                  {card.description ? card.description.slice(0, 20) : 'No content yet'}
                                </div>
                              </div>
                            </div>

                            {carouselCards.length > 2 && (
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
                          className="w-full py-2.5 bg-white hover:bg-slate-100 text-blue-600 border border-dashed border-blue-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Card</span>
                        </button>

                        <p className="text-[10px] text-slate-400">
                          You can add 2 to 10 cards in a carousel template.
                        </p>
                      </div>

                      {/* Right: Card Details Editor */}
                      <div className="md:col-span-7 bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                        <h4 className="font-extrabold text-xs text-slate-900">
                          Card {selectedCarouselIndex + 1} Details
                        </h4>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            BODY *
                          </label>
                          <p className="text-[10px] text-rose-500 mb-1">
                            Note: In Carousel body only 2 new lines can be added.
                          </p>

                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <textarea
                              rows={3}
                              maxLength={160}
                              value={carouselCards[selectedCarouselIndex]?.description || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCarouselCards(prev => prev.map((c, i) => i === selectedCarouselIndex ? { ...c, description: val } : c));
                              }}
                              placeholder="Enter body text..."
                              className="w-full p-2.5 text-xs font-medium focus:outline-none"
                            />
                            <div className="px-2.5 py-1.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                              <button
                                type="button"
                                onClick={() => {
                                  const currentDesc = carouselCards[selectedCarouselIndex]?.description || '';
                                  const matches = Array.from(currentDesc.matchAll(/\{\{(\d+)\}\}/g)).map(m => parseInt(m[1], 10));
                                  const varMatches = Array.from(currentDesc.matchAll(/\[var(\d+)\]/gi)).map(m => parseInt(m[1], 10));
                                  const allNums = [...matches, ...varMatches];
                                  const maxNum = allNums.length > 0 ? Math.max(...allNums) : 0;
                                  const nextNum = maxNum + 1;
                                  const newDesc = currentDesc ? `${currentDesc} {{${nextNum}}}` : `{{${nextNum}}}`;
                                  setCarouselCards(prev => prev.map((c, i) => i === selectedCarouselIndex ? { ...c, description: newDesc } : c));
                                }}
                                className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                + ADD VARIABLE
                              </button>
                              <span>{(carouselCards[selectedCarouselIndex]?.description || '').length}/160</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            BUTTONS *
                          </label>
                          <p className="text-[10px] text-slate-400 mb-2">
                            No buttons added yet. Add up to 2 buttons per card — they apply to every card.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddAction('URL')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add CTA-URL</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddAction('PHONE')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add CTA-Phone</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddAction('QUICK_REPLY')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-600 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Quick Reply</span>
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Footer (Optional) matching Screenshots 1-4 */}
              {subcategory !== 'Carousel' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700">
                      Footer <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {footerText.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={60}
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Enter footer text..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              )}

              {/* BUTTONS (Optional) matching Screenshots 1-4 */}
              {subcategory !== 'Carousel' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      BUTTONS <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddAction('QUICK_REPLY')}
                      className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-2xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Button</span>
                    </button>
                  </div>

                  {actions.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium">
                      No buttons added yet. Click <strong>Add Button</strong> to attach buttons to your template.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {actions.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2"
                        >
                          <select
                            value={act.type}
                            onChange={(e) => handleUpdateAction(act.id, 'type', e.target.value as any)}
                            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-semibold"
                          >
                            <option value="QUICK_REPLY">Quick Reply</option>
                            <option value="URL">Visit URL</option>
                            <option value="PHONE">Call Phone</option>
                            <option value="COPY_CODE">Copy Code</option>
                          </select>

                          <input
                            type="text"
                            value={act.label}
                            onChange={(e) => handleUpdateAction(act.id, 'label', e.target.value)}
                            placeholder="Button Text"
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-medium"
                          />

                          <input
                            type="text"
                            value={act.value}
                            onChange={(e) => handleUpdateAction(act.id, 'value', e.target.value)}
                            placeholder="Value / URL"
                            className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white font-mono text-[11px]"
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
                  )}
                </div>
              )}

            </div>

            {/* SECTION 3: ADVANCED OPTIONS matching Screenshots 1-4 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div
                onClick={() => setAdvancedExpanded(!advancedExpanded)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">Advanced Options</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Optional
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Message expiry, pricing & delivery preferences
                    </p>
                  </div>
                </div>

                {advancedExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {advancedExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      TTL (Time-To-Live)
                    </label>
                    <input
                      type="text"
                      value={ttlSeconds}
                      onChange={(e) => setTtlSeconds(e.target.value)}
                      placeholder="Enter TTL in seconds..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Applies via MM Lite — 12 hours to 30 days. All values in seconds.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button Bar matching Screenshots 1-4 */}
            <div className="space-y-3 pt-2">
              {rmlSubmitStatus && (
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-1">
                  <div className="text-emerald-400 font-bold">ROUTE MOBILE API REGISTRATION RESPONSE:</div>
                  <pre>{JSON.stringify(rmlSubmitStatus, null, 2)}</pre>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                {isSaved ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-200 shadow-2xs">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Template Registered & Submitted Successfully!</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={!isBasicInfoComplete}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>SUBMIT TEMPLATE</span>
                  </button>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Live Device Preview Column (Right 5 Cols) matching Screenshots 1-4 */}
        <div className="lg:col-span-5 sticky top-6">
          <MobileDevicePreview
            channel={templateChannel}
            agentName="Route Mobile"
            templateType={subcategory === 'Carousel' ? 'Carousel' : headerType === 'Media' ? 'Rich Card' : 'Text'}
            bodyText={bodyText}
            headerMediaUrl={headerMediaUrl}
            headerType={headerType}
            headerText={headerText}
            footerText={footerText}
            actions={actions}
            variables={activeDetectedVariables}
            variableValues={sampleValues}
            cards={carouselCards.map(c => ({
              title: c.title,
              description: c.description,
              mediaUrl: c.mediaUrl
            }))}
            subcategory={subcategory}
          />
        </div>

      </div>

      {/* Guideline Modal */}
      {showGuidelineModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>WhatsApp Template Guidelines</span>
              </h3>
              <button
                onClick={() => setShowGuidelineModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-96 overflow-y-auto pr-1">
              <p>
                <strong>Category Rules:</strong>
                <br />
                - <strong>Marketing:</strong> Promotions, product launches, discounts.
                <br />
                - <strong>Utility:</strong> Post-purchase updates, invoices, delivery status.
                <br />
                - <strong>Authentication:</strong> One-time passcodes (OTP).
              </p>
              <p>
                <strong>Formatting Shortcuts:</strong>
                <br />
                - Bold: <code className="bg-slate-100 px-1 rounded">*text*</code>
                <br />
                - Italic: <code className="bg-slate-100 px-1 rounded">_text_</code>
                <br />
                - Strikethrough: <code className="bg-slate-100 px-1 rounded">~text~</code>
                <br />
                - Monospace: <code className="bg-slate-100 px-1 rounded">```text```</code>
              </p>
              <p>
                <strong>Variables:</strong> Place variables inside square brackets or double curly braces (e.g. <code className="bg-slate-100 px-1 rounded">[var1]</code> or <code className="bg-slate-100 px-1 rounded">{"{{1}}"}</code>).
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuidelineModal(false)}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sample Modal */}
      {showAddSampleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">Add Sample Variable Values</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSampleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide sample values for template validation and live preview. For WhatsApp templates, variables must be formatted as <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono font-bold">{"{{1}}"}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono font-bold">{"{{2}}"}</code>.
              </p>

              {/* Sample Header Media / Document Section */}
              {(headerType === 'Media' || subcategory === 'Carousel') && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      {mediaType === 'Image' && <ImageIcon className="w-4 h-4 text-blue-600" />}
                      {mediaType === 'Video' && <Video className="w-4 h-4 text-blue-600" />}
                      {mediaType === 'Document' && <FileText className="w-4 h-4 text-blue-600" />}
                      <span>Header Sample {mediaType} / Document File</span>
                    </label>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-200/80 text-blue-800 rounded-md">
                      Required for Meta
                    </span>
                  </div>

                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={sampleHeaderMediaUrl}
                        onChange={(e) => {
                          setSampleHeaderMediaUrl(e.target.value);
                          setHeaderMediaUrl(e.target.value);
                        }}
                        placeholder={`Paste sample ${mediaType.toLowerCase()} URL (https://...)...`}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      />
                      <label className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept={mediaType === 'Image' ? 'image/*' : mediaType === 'Video' ? 'video/*' : '.pdf,.doc,.docx'}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const result = evt.target?.result as string;
                                setSampleHeaderMediaUrl(result);
                                setHeaderMediaUrl(result);
                                setSampleDocName(file.name);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Quick Preset Selector Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 font-bold">Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';
                          setSampleHeaderMediaUrl(url);
                          setHeaderMediaUrl(url);
                        }}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                      >
                        🖼️ E-Commerce Banner
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80';
                          setSampleHeaderMediaUrl(url);
                          setHeaderMediaUrl(url);
                        }}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                      >
                        📄 Invoice Sample PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4';
                          setSampleHeaderMediaUrl(url);
                          setHeaderMediaUrl(url);
                        }}
                        className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                      >
                        🎥 Video Sample
                      </button>
                    </div>
                  </div>

                  {sampleHeaderMediaUrl && (
                    <div className="p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                      {mediaType === 'Image' ? (
                        <img src={sampleHeaderMediaUrl} alt="Sample Header" className="w-12 h-12 object-cover rounded-lg border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {mediaType}
                        </div>
                      )}
                      <div className="overflow-hidden text-ellipsis text-[11px] text-slate-600 font-mono">
                        <div className="font-bold text-slate-800">{sampleDocName || 'Sample File Attached'}</div>
                        <div className="truncate text-slate-400">{sampleHeaderMediaUrl}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Variable Sample Values */}
              {activeDetectedVariables.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-center">
                  <p className="text-xs font-semibold text-amber-900">
                    No body variables detected yet.
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Click below to insert variable <code className="font-bold">{"{{1}}"}</code> into your message body.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddVariableToBody();
                    }}
                    className="mt-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs"
                  >
                    + Add {"{{1}}"} Variable to Body
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center pt-1 pb-1">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                      Detected Variables ({activeDetectedVariables.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultSamples: Record<string, string> = {
                          '1': 'John Doe',
                          '2': 'Order #98214',
                          '3': '$49.99',
                          '4': 'Tomorrow at 10 AM'
                        };
                        const updated = { ...sampleValues };
                        activeDetectedVariables.forEach((v, idx) => {
                          const val = defaultSamples[v] || defaultSamples[String(idx + 1)] || `Sample ${v}`;
                          updated[v] = val;
                          updated[`var${v}`] = val;
                        });
                        setSampleValues(updated);
                      }}
                      className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors border border-blue-200 cursor-pointer"
                    >
                      ⚡ Auto-fill Samples
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeDetectedVariables.map((v) => (
                      <div key={v} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                        <label className="block text-xs font-black text-slate-800 flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            Variable {"{{" + v + "}}"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            e.g. Name, Order ID, Price
                          </span>
                        </label>
                        <input
                          type="text"
                          value={sampleValues[v] || sampleValues[`var${v}`] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSampleValues(prev => ({
                              ...prev,
                              [v]: val,
                              [`var${v}`]: val
                            }));
                          }}
                          placeholder={`Enter sample text for {{${v}}}...`}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSampleModal(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Save Samples
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
