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
  MessageCircle,
  Wifi,
  Battery,
  Signal,
  FileText,
  Maximize2
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
  actions: TemplateAction[];
  variables?: string[];
  variableValues?: Record<string, string>;
  cards?: CarouselCard[];
  messageOrder?: string;
}

export const MobileDevicePreview: React.FC<MobileDevicePreviewProps> = ({
  channel,
  agentName,
  templateType = 'Text',
  bodyText,
  headerMediaUrl,
  headerType,
  actions,
  variables = [],
  variableValues = {},
  cards = [],
  messageOrder = 'Text then PDF'
}) => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  // Replace variables like [var1], [Name] in body text
  let renderedBody = bodyText || 'Your message text will appear here...';
  
  variables.forEach((v, idx) => {
    const val = variableValues[v] || variableValues[`var${idx + 1}`] || `[${v}]`;
    renderedBody = renderedBody.replace(new RegExp(`\\[${v}\\]|\\[var${idx + 1}\\]`, 'gi'), val);
  });

  const isRCS = channel === 'RCS';
  const isWhatsApp = channel === 'WhatsApp';

  const isRichCard = templateType === 'Rich Card';
  const isCarousel = templateType === 'Carousel';
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
        <div className="w-full h-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col relative font-sans text-slate-900">

          {/* Status Bar */}
          <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[10px] font-semibold text-slate-700 bg-white border-b border-slate-100 z-20">
            <span>9:30</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Chat Channel Header matching Screenshot 1/2/3 */}
          <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-slate-600 cursor-pointer" />
              
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {agentName ? agentName[0].toUpperCase() : 'R'}
              </div>

              <div>
                <div className="flex items-center gap-1 font-bold text-xs text-slate-900 leading-tight">
                  <span className="truncate max-w-[120px]">
                    {agentName || 'RCS Business'}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 fill-blue-600 text-white shrink-0" />
                </div>
                <div className="text-[9px] text-slate-500 font-medium leading-none">
                  Business Messaging
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <MoreVertical className="w-4 h-4 cursor-pointer" />
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-100/60">

            {/* Date Badge */}
            <div className="text-center my-1">
              <span className="text-[10px] font-semibold bg-white/90 text-slate-500 px-3 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                Today
              </span>
            </div>

            {/* TYPE 1: TEXT ONLY */}
            {templateType === 'Text' && (
              <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-xs p-3 shadow-2xs border border-slate-200/90 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                <p>{renderedBody}</p>

                {actions && actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {actions.map((act, i) => (
                      <button
                        key={act.id || i}
                        className="w-full py-1.5 px-3 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
                      >
                        {act.type === 'URL' && <ExternalLink className="w-3 h-3" />}
                        {act.type === 'PHONE' && <PhoneCall className="w-3 h-3" />}
                        <span>{act.label || `Action ${i + 1}`}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TYPE 2: RICH CARD matching Screenshot 2 */}
            {isRichCard && (
              <div className="max-w-[95%] bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden text-xs">
                {/* Media Image Box */}
                <div className="w-full h-36 bg-slate-200/80 flex items-center justify-center relative overflow-hidden">
                  {headerMediaUrl ? (
                    <img
                      src={headerMediaUrl}
                      alt="Rich Card Media"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <ImageIcon className="w-10 h-10 stroke-1" />
                      <span className="text-[10px] font-bold text-slate-400">Card media</span>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 text-xs">Card title</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    {renderedBody}
                  </p>

                  <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600">
                    <Maximize2 className="w-3 h-3" />
                    <span>Tap to open</span>
                  </div>
                </div>

                {actions && actions.length > 0 && (
                  <div className="p-2 bg-slate-50 border-t border-slate-100 space-y-1.5">
                    {actions.map((act, i) => (
                      <button
                        key={act.id || i}
                        className="w-full py-1.5 px-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-2xs"
                      >
                        {act.label || `Action ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TYPE 3: CAROUSEL matching Screenshot 3 */}
            {isCarousel && (
              <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {(cards.length > 0 ? cards : [
                    { title: 'Card title', description: renderedBody },
                    { title: 'Card 2', description: 'Second card content...' }
                  ]).map((card, idx) => (
                    <div
                      key={idx}
                      className="min-w-[210px] max-w-[210px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs shrink-0 snap-center"
                    >
                      <div className="w-full h-28 bg-slate-200/80 flex flex-col items-center justify-center text-slate-400">
                        {card.mediaUrl ? (
                          <img src={card.mediaUrl} alt={card.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 stroke-1 text-slate-400" />
                        )}
                      </div>

                      <div className="p-2.5 space-y-1">
                        <div className="font-extrabold text-slate-900 text-xs truncate">
                          {card.title || `Card title`}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2">
                          {card.description || renderedBody}
                        </p>
                        <div className="pt-1 flex items-center gap-1 text-[9px] font-bold text-blue-600">
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>Tap to open</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Scroll Line Indicator */}
                <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto relative overflow-hidden">
                  <div className="w-12 h-full bg-blue-600 rounded-full" />
                </div>
              </div>
            )}

            {/* TYPE 4: TEXT + PDF matching Screenshot 4 */}
            {isTextPdf && (
              <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-xs p-3 shadow-2xs border border-slate-200/90 space-y-3">
                {messageOrder === 'PDF then Text' && (
                  <p className="text-xs text-slate-800 leading-relaxed">{renderedBody}</p>
                )}

                {/* PDF Media Card Box */}
                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-1.5">
                  <div className="w-10 h-12 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-center shadow-2xs">
                    <FileText className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="font-extrabold text-xs text-slate-800">PDF document</div>
                  <div className="text-[9px] text-slate-400 font-medium">Click to view/download</div>
                </div>

                {messageOrder !== 'PDF then Text' && (
                  <p className="text-xs text-slate-800 leading-relaxed">{renderedBody}</p>
                )}

                {actions && actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {actions.map((act, i) => (
                      <button
                        key={act.id || i}
                        className="w-full py-1.5 px-3 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                      >
                        {act.label || `Action ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Chat Input Bar matching Screenshots 1-4 */}
          <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-600 cursor-pointer">
              +
            </div>
            <div className="flex-1 text-[11px] text-slate-400 font-medium truncate">
              RCS message
            </div>
            <Smile className="w-4 h-4 text-slate-400 cursor-pointer" />
            <ImageIcon className="w-4 h-4 text-slate-400 cursor-pointer" />
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center cursor-pointer shadow-2xs">
              <Send className="w-3 h-3" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
