import React, { useState } from 'react';
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
  Wifi,
  Battery,
  Signal,
  FileText,
  Maximize2,
  Phone,
  Video,
  Paperclip,
  Camera,
  Mic,
  Info,
  Copy
} from 'lucide-react';

interface CarouselCard {
  title?: string;
  description?: string;
  mediaUrl?: string;
  actions?: TemplateAction[];
}

interface MobileDevicePreviewProps {
  channel: ChannelType;
  agentName: string;
  templateType?: string;
  bodyText: string;
  headerMediaUrl?: string;
  headerType?: string;
  headerText?: string;
  footerText?: string;
  actions: TemplateAction[];
  variables?: string[];
  variableValues?: Record<string, string>;
  cards?: CarouselCard[];
  messageOrder?: string;
  subcategory?: string;
}

export const MobileDevicePreview: React.FC<MobileDevicePreviewProps> = ({
  channel,
  agentName,
  templateType = 'Text',
  bodyText,
  headerMediaUrl,
  headerType = 'None',
  headerText = '',
  footerText = '',
  actions,
  variables = [],
  variableValues = {},
  cards = [],
  messageOrder = 'Text then PDF',
  subcategory = 'Default'
}) => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  // Replace variables like [var1], {{1}} in body text
  let renderedBody = bodyText || 'Your message text will appear here...';
  
  variables.forEach((v, idx) => {
    const val = variableValues[v] || variableValues[`var${idx + 1}`] || `[${v}]`;
    renderedBody = renderedBody.replace(new RegExp(`\\[${v}\\]|\\[var${idx + 1}\\]|\\{\\{${idx + 1}\\}\\}`, 'gi'), val);
  });

  const isWhatsApp = channel === 'WhatsApp';
  const isCarousel = subcategory === 'Carousel' || templateType === 'Carousel';
  const isRichCard = templateType === 'Rich Card';
  const isTextPdf = templateType === 'Text + PDF';

  return (
    <div className="w-full flex flex-col items-center justify-center p-1 sm:p-2">
      <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        LIVE PREVIEW
      </div>

      {/* Smartphone Outer Shell matching screenshots */}
      <div className="relative w-full max-w-[320px] h-[640px] bg-slate-950 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800 border-4 border-slate-900 flex flex-col overflow-hidden">
        
        {/* Notch / Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-b-2xl z-30 flex items-center justify-center">
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Smartphone Screen Canvas */}
        <div className="w-full h-full bg-[#efeae2] rounded-[34px] overflow-hidden flex flex-col relative font-sans text-slate-900">

          {/* Status Bar */}
          <div className={`pt-2 px-6 pb-1 flex justify-between items-center text-[10px] font-semibold z-20 ${
            isWhatsApp ? 'bg-[#005c4b] text-white' : 'bg-white text-slate-700 border-b border-slate-100'
          }`}>
            <span>12:30</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Chat Channel Header matching Screenshot 1/2/3/4 */}
          <div className={`px-3 py-2.5 flex items-center justify-between z-20 ${
            isWhatsApp ? 'bg-[#005c4b] text-white shadow-xs' : 'bg-white border-b border-slate-100 text-slate-900'
          }`}>
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 cursor-pointer opacity-90" />
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                isWhatsApp ? 'bg-emerald-700 text-white border border-emerald-500' : 'bg-blue-600 text-white'
              }`}>
                {agentName ? agentName[0].toUpperCase() : 'R'}
              </div>

              <div>
                <div className="flex items-center gap-1 font-bold text-xs leading-tight">
                  <span className="truncate max-w-[110px]">
                    {agentName || (isWhatsApp ? 'Route Mobile' : 'RCS Business')}
                  </span>
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isWhatsApp ? 'fill-emerald-400 text-[#005c4b]' : 'fill-blue-600 text-white'} shrink-0`} />
                </div>
                <div className={`text-[9px] font-medium leading-none mt-0.5 ${isWhatsApp ? 'text-emerald-100' : 'text-slate-500'}`}>
                  online
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-white/90">
              {isWhatsApp && <Video className="w-4 h-4 cursor-pointer" />}
              {isWhatsApp && <Phone className="w-4 h-4 cursor-pointer" />}
              <MoreVertical className="w-4 h-4 cursor-pointer" />
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#efeae2] bg-opacity-90">

            {/* Date Badge */}
            <div className="text-center my-1">
              <span className="text-[10px] font-semibold bg-white/90 text-slate-600 px-3 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                Today
              </span>
            </div>

            {/* Standard WhatsApp Message Bubble */}
            {!isCarousel && (
              <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-xs p-3 shadow-2xs border border-slate-200/60 text-xs text-slate-800 leading-relaxed font-sans space-y-2 relative">
                
                {/* Header Media / Text */}
                {headerType === 'Media' && (
                  <div className="w-full h-32 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                    {headerMediaUrl ? (
                      <img
                        src={headerMediaUrl}
                        alt="Header Media"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <ImageIcon className="w-8 h-8 stroke-1" />
                        <span className="text-[10px] font-semibold">Media Header</span>
                      </div>
                    )}
                  </div>
                )}

                {headerType === 'Text' && headerText && (
                  <div className="font-extrabold text-xs text-slate-900 border-b border-slate-100 pb-1">
                    {headerText}
                  </div>
                )}

                {/* Body Text */}
                <p className="whitespace-pre-wrap">{renderedBody}</p>

                {/* Footer Text */}
                {footerText && (
                  <p className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-100">
                    {footerText}
                  </p>
                )}

                {/* Action Buttons */}
                {actions && actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {actions.map((act, i) => (
                      <button
                        key={act.id || i}
                        className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 text-blue-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors shadow-2xs"
                      >
                        {act.type === 'URL' && <ExternalLink className="w-3 h-3" />}
                        {act.type === 'PHONE' && <PhoneCall className="w-3 h-3" />}
                        {act.type === 'COPY_CODE' && <Copy className="w-3 h-3" />}
                        <span>{act.label || `Action ${i + 1}`}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-[9px] text-slate-400 text-right font-medium mt-1">
                  12:30
                </div>
              </div>
            )}

            {/* CAROUSEL PREVIEW matching Screenshot 4 */}
            {isCarousel && (
              <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {(cards.length > 0 ? cards : [
                    { title: 'Card 1', description: renderedBody },
                    { title: 'Card 2', description: 'Second card content...' }
                  ]).map((card, idx) => (
                    <div
                      key={idx}
                      className="min-w-[200px] max-w-[200px] bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs shrink-0 snap-center"
                    >
                      <div className="w-full h-28 bg-slate-200 flex flex-col items-center justify-center text-slate-400">
                        {card.mediaUrl ? (
                          <img src={card.mediaUrl} alt={card.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 stroke-1 text-slate-400" />
                        )}
                      </div>

                      <div className="p-2.5 space-y-1">
                        <div className="font-extrabold text-slate-900 text-xs truncate">
                          {card.title || `Card ${idx + 1}`}
                        </div>
                        <p className="text-[10px] text-slate-600 line-clamp-2">
                          {card.description || renderedBody}
                        </p>
                      </div>

                      {actions && actions.length > 0 && (
                        <div className="p-2 bg-slate-50 border-t border-slate-100 space-y-1">
                          {actions.slice(0, 2).map((act, i) => (
                            <button
                              key={i}
                              className="w-full py-1 text-blue-600 font-bold text-[11px] text-center"
                            >
                              {act.label || 'view more →'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Chat Input Bar matching Screenshots 1, 2, 3, 4 */}
          <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-2">
            <Smile className="w-4 h-4 text-slate-400 cursor-pointer" />
            <div className="flex-1 text-[11px] text-slate-400 font-medium truncate">
              Message
            </div>
            <Paperclip className="w-4 h-4 text-slate-400 cursor-pointer" />
            <Camera className="w-4 h-4 text-slate-400 cursor-pointer" />
            <div className="w-6 h-6 rounded-full bg-[#005c4b] text-white flex items-center justify-center cursor-pointer shadow-2xs">
              <Mic className="w-3 h-3" />
            </div>
          </div>

        </div>

      </div>

      {/* Info Notice Box matching Screenshots 1, 2, 3, 4 */}
      <div className="mt-3 w-full max-w-[320px] p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-extrabold text-blue-950 text-xs">Preview updates in real-time</div>
          <div className="text-[11px] text-blue-700 leading-snug mt-0.5">
            Changes you make to the content, header, footer or variables will reflect instantly in the preview above.
          </div>
        </div>
      </div>

    </div>
  );
};

