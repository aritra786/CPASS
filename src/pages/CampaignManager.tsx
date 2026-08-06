import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ListOrdered,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Plus
} from 'lucide-react';

export const CampaignManager: React.FC = () => {
  const { campaigns, pauseCampaign, setActiveTab } = useApp();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Campaign Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time campaign dispatch progress, engagement performance and execution states
          </p>
        </div>

        <button
          onClick={() => setActiveTab('Send Message')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-blue-600" />
            <span>Active & Historic Campaigns</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            Total Campaigns: {campaigns.length}
          </span>
        </div>

        <div className="space-y-4">
          {campaigns.map((cmp) => {
            const deliveredPercent = cmp.recipientCount > 0 ? Math.round((cmp.deliveredCount / cmp.recipientCount) * 100) : 0;
            const readPercent = cmp.deliveredCount > 0 ? Math.round((cmp.readCount / cmp.deliveredCount) * 100) : 0;

            return (
              <div
                key={cmp.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{cmp.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">
                        {cmp.channel}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Created: {cmp.createdAt} | Scheduled: {cmp.scheduledAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        ₹{cmp.totalCost.toFixed(2)} INR
                      </div>
                      <div className="text-[10px] text-slate-400">Total Campaign Cost</div>
                    </div>

                    <button
                      onClick={() => pauseCampaign(cmp.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
                        cmp.status === 'Running'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {cmp.status === 'Running' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{cmp.status === 'Running' ? 'Pause' : 'Resume'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                    <span>
                      Dispatch Delivery: {cmp.deliveredCount.toLocaleString()} / {cmp.recipientCount.toLocaleString()} ({deliveredPercent}%)
                    </span>
                    <span>Read Rate: {readPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${deliveredPercent}%` }} />
                    <div className="bg-rose-400 h-full" style={{ width: `${Math.round((cmp.failedCount / cmp.recipientCount) * 100)}%` }} />
                  </div>
                </div>

                {/* Breakdown metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] pt-1 border-t border-slate-200/60 text-slate-600">
                  <div>Sent: <strong className="text-slate-900">{cmp.sentCount.toLocaleString()}</strong></div>
                  <div>Delivered: <strong className="text-emerald-600">{cmp.deliveredCount.toLocaleString()}</strong></div>
                  <div>Read: <strong className="text-blue-600">{cmp.readCount.toLocaleString()}</strong></div>
                  <div>Failed: <strong className="text-rose-600">{cmp.failedCount.toLocaleString()}</strong></div>
                  <div>SMS Fallback: <strong className="text-amber-600">{cmp.fallbackCount.toLocaleString()}</strong></div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
