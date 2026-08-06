import React from 'react';
import { ChannelType, TemplateAction } from '../types';
import {
  CheckCircle2,
  MoreVertical,
  ArrowLeft,
  Image as ImageIcon,
  Send,
  Plus,
  Smile,
  ExternalLink,
  PhoneCall,
  MessageCircle,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

interface MobileDevicePreviewProps {
  channel: ChannelType;
  agentName: string;
  bodyText: string;
  headerMediaUrl?: string;
  headerType?: string;
  actions: TemplateAction[];
  variables?: string[];
  variableValues?: Record<string, string>;
}

export const MobileDevicePreview: React.FC<MobileDevicePreviewProps> = ({
  channel,
  agentName,
  bodyText,
  headerMediaUrl,
  headerType,
  actions,
  variables = [],
  variableValues = {}
}) => {
  // Replace variables like [var1], [Name] in body text
  let renderedBody = bodyText || 'Your message text will appear here...';
  
  // Replace [var1], [var2] or [Name]
  variables.forEach((v, idx) => {
    const val = variableValues[v] || variableValues[`var${idx + 1}`] || `[${v}]`;
    renderedBody = renderedBody.replace(new RegExp(`\\[${v}\\]|\\[var${idx + 1}\\]`, 'gi'), val);
  });

  const isRCS = channel === 'RCS';
  const isWhatsApp = channel === 'WhatsApp';

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        LIVE MOBILE DEVICE PREVIEW
      </div>

      {/* Smartphone Outer Shell */}
      <div className="relative w-full max-w-[340px] h-[660px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-800 flex flex-col overflow-hidden">
        
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-b-2xl z-30 flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Smartphone Screen Canvas */}
        <div className="w-full h-full bg-slate-100 rounded-[34px] overflow-hidden flex flex-col relative font-sans text-slate-900">

          {/* Status Bar */}
          <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[10px] font-semibold text-slate-700 bg-slate-100/90 backdrop-blur-xs z-20">
            <span>9:30</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Chat Channel Header */}
          <div
            className={`px-3 py-2.5 border-b flex items-center justify-between text-white z-20 ${
              isWhatsApp
                ? 'bg-emerald-700 border-emerald-800'
                : 'bg-blue-600 border-blue-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 cursor-pointer" />
              
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
                  {agentName ? agentName[0] : 'C'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white rounded-full p-0.5">
                  <CheckCircle2 className="w-3 h-3 fill-blue-500 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 font-bold text-xs leading-tight">
                  <span className="truncate max-w-[130px]">
                    {agentName || (isRCS ? 'RCS Business' : 'WhatsApp Business')}
                  </span>
                  <CheckCircle2 className="w-3 h-3 fill-blue-400 text-white shrink-0" />
                </div>
                <div className="text-[9px] text-white/80 leading-none mt-0.5">
                  Verified Business Account
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/90">
              <MoreVertical className="w-4 h-4 cursor-pointer" />
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#e5ddd5]/30">

            {/* Date Badge */}
            <div className="text-center my-1">
              <span className="text-[10px] font-semibold bg-white/80 text-slate-500 px-2.5 py-0.5 rounded-full shadow-2xs">
                Today
              </span>
            </div>

            {/* Message Card Bubble */}
            <div className="max-w-[88%] ml-auto bg-white rounded-2xl rounded-tr-xs shadow-xs border border-slate-200/80 overflow-hidden font-sans">
              
              {/* Optional Header Media Image */}
              {headerType === 'Image' && (
                <div className="w-full h-36 bg-slate-100 overflow-hidden relative border-b border-slate-100">
                  {headerMediaUrl ? (
                    <img
                      src={headerMediaUrl}
                      alt="Header Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-medium">Header Media Preview</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message Body Text */}
              <div className="p-3 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {renderedBody}
              </div>

              {/* Timestamp & Read Status Ticks */}
              <div className="px-3 pb-2 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                <span>9:30 AM</span>
                <span className="text-blue-500 font-extrabold">✓✓</span>
              </div>

              {/* Interactive Call-to-Action & Quick Reply Buttons */}
              {actions && actions.length > 0 && (
                <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/60">
                  {actions.map((act, i) => (
                    <button
                      key={act.id || i}
                      className="w-full py-2 px-3 text-xs font-bold text-blue-600 hover:bg-blue-50/80 transition-colors flex items-center justify-center gap-1.5 active:bg-blue-100"
                    >
                      {act.type === 'URL' && <ExternalLink className="w-3.5 h-3.5" />}
                      {act.type === 'PHONE' && <PhoneCall className="w-3.5 h-3.5" />}
                      {act.type === 'QUICK_REPLY' && <MessageCircle className="w-3.5 h-3.5" />}
                      <span>{act.label || `Action ${i + 1}`}</span>
                    </button>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-2">
            <div className="flex items-center gap-1 text-slate-400">
              <Plus className="w-4 h-4 cursor-pointer" />
              <Smile className="w-4 h-4 cursor-pointer" />
            </div>
            <div className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-[11px] text-slate-400 font-sans">
              {isRCS ? 'RCS message...' : 'Message...'}
            </div>
            <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center ${
              isWhatsApp ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
