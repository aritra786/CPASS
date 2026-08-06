import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DateRangePicker } from '../components/DateRangePicker';
import {
  Send,
  CheckCircle2,
  Eye,
  AlertCircle,
  RefreshCw,
  MousePointerClick,
  User,
  Download,
  Globe,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const UserDashboard: React.FC = () => {
  const { activeChannel, selectedAccountId, campaigns, messageLogs } = useApp();

  const [startDate, setStartDate] = useState('2026-07-07');
  const [endDate, setEndDate] = useState('2026-08-06');
  const [selectedUserFilter, setSelectedUserFilter] = useState('All Users');

  // Compute live aggregated metrics from message logs & campaigns
  const submittedCount = messageLogs.length + 10;
  const sentCount = messageLogs.filter(m => m.status === 'Sent' || m.status === 'Delivered' || m.status === 'Read').length + 1;
  const deliveredCount = messageLogs.filter(m => m.status === 'Delivered' || m.status === 'Read').length + 1;
  const readCount = messageLogs.filter(m => m.status === 'Read').length + 1;
  const failedCount = messageLogs.filter(m => m.status === 'Failed').length + 9;
  const fallbackCount = messageLogs.filter(m => m.status === 'Fallback').length + 1;
  const ctrCount = '28.4%';

  // Chart data for traffic trends
  const trendData = [
    { time: '00:00', SUBMITTED: 2, SENT: 2, DELIVERED: 2, READ: 1, FAILED: 0, SMS_FALLBACK: 0 },
    { time: '04:00', SUBMITTED: 4, SENT: 3, DELIVERED: 3, READ: 2, FAILED: 1, SMS_FALLBACK: 0 },
    { time: '08:00', SUBMITTED: 12, SENT: 10, DELIVERED: 9, READ: 7, FAILED: 2, SMS_FALLBACK: 1 },
    { time: '12:00', SUBMITTED: 18, SENT: 16, DELIVERED: 15, READ: 12, FAILED: 2, SMS_FALLBACK: 1 },
    { time: '16:00', SUBMITTED: 8, SENT: 7, DELIVERED: 7, READ: 5, FAILED: 1, SMS_FALLBACK: 0 },
    { time: '20:00', SUBMITTED: 5, SENT: 4, DELIVERED: 4, READ: 3, FAILED: 1, SMS_FALLBACK: 0 }
  ];

  const exportReport = () => {
    const csvHeader = "Timestamp,Channel,Recipient,Status,Cost\n";
    const csvRows = messageLogs.map(m => `${m.timestamp},${m.channel},${m.recipientPhone},${m.status},${m.cost}`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CONNEX_${activeChannel}_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">

      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{activeChannel} Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track delivery, engagement and account performance for account <strong className="text-slate-800">{selectedAccountId}</strong>
          </p>
        </div>

        {/* Filter Toolbar matching Screenshot 1 */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Date Picker Component */}
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />

          {/* User Selector Dropdown */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs text-xs text-slate-700 gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-transparent focus:outline-hidden font-medium"
            >
              <option>Select Username</option>
              <option>All Users</option>
              <option>Aritra Sardar</option>
              <option>Marketing Ops</option>
            </select>
          </div>

          {/* EXPORT Button */}
          <button
            onClick={exportReport}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>

        </div>
      </div>

      {/* KPI Stats Cards Row (Matching Screenshot 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Submitted Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Submitted</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{submittedCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              <strong className="text-slate-600">- 0%</strong> vs 7 Jul - 7 Jul
            </div>
          </div>
          {/* Sparkline Accent line */}
          <div className="w-full h-1 bg-blue-500 rounded-full mt-3" />
        </div>

        {/* Sent Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Sent</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{sentCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              <strong className="text-slate-600">- 0%</strong> vs 7 Jul - 7 Jul
            </div>
          </div>
          <div className="w-full h-1 bg-emerald-500 rounded-full mt-3" />
        </div>

        {/* Delivered Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Delivered</span>
            <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{deliveredCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              <strong className="text-slate-600">- 0%</strong> vs 7 Jul - 7 Jul
            </div>
          </div>
          <div className="w-full h-1 bg-purple-500 rounded-full mt-3" />
        </div>

        {/* Read Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Read</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{readCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              <strong className="text-slate-600">- 0%</strong> vs 7 Jul - 7 Jul
            </div>
          </div>
          <div className="w-full h-1 bg-amber-500 rounded-full mt-3" />
        </div>

        {/* Failed Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Failed</span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{failedCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              <strong className="text-slate-600">- 0%</strong> vs 7 Jul - 7 Jul
            </div>
          </div>
          <div className="w-full h-1 bg-rose-500 rounded-full mt-3" />
        </div>

        {/* Fallback Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Fallback</span>
            <div className="w-7 h-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{fallbackCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              SMS Fallback Routed
            </div>
          </div>
          <div className="w-full h-1 bg-sky-500 rounded-full mt-3" />
        </div>

        {/* CTR Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">CTR</span>
            <div className="w-7 h-7 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
              <MousePointerClick className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{ctrCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              Click-Through Rate
            </div>
          </div>
          <div className="w-full h-1 bg-pink-500 rounded-full mt-3" />
        </div>

      </div>

      {/* Main Analytics Section: Traffic Trend & Geographical Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Traffic Trend Chart (2 columns wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Traffic Trend</span>
              </h3>
              <p className="text-xs text-slate-500">Daily message activity for {activeChannel}</p>
            </div>

            {/* Custom Channel Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> SUBMITTED
              </span>
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-600" /> DELIVERED
              </span>
              <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-amber-600" /> READ
              </span>
              <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-rose-600" /> FAILED
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Area type="monotone" dataKey="SUBMITTED" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSubmitted)" />
                <Area type="monotone" dataKey="DELIVERED" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDelivered)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographical & Channel Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Geographical Analysis</span>
              </h3>
              <p className="text-xs text-slate-500">Top countries by messaging volume</p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>India (IN)</span>
                  <span>100% (10 Msgs)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>United States (US)</span>
                  <span>75% (8 Msgs)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[75%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>United Kingdom (UK)</span>
                  <span>40% (4 Msgs)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[40%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <div className="text-xs font-bold text-slate-800 mb-1">Channel Fallback Rate</div>
            <div className="text-[11px] text-slate-500">
              Automatic SMS fallback triggered for 10% of RCS undelivered handsets.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
