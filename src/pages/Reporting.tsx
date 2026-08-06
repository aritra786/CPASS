import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DateRangePicker } from '../components/DateRangePicker';
import { BarChart2, Search, Download, CheckCircle2, AlertTriangle, RefreshCw, Eye, Send } from 'lucide-react';

export const Reporting: React.FC = () => {
  const { messageLogs } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('2026-07-07');
  const [endDate, setEndDate] = useState('2026-08-06');

  const filteredLogs = (messageLogs || []).filter(m => {
    const query = (search || '').toLowerCase();
    const matchesSearch =
      (m.recipientPhone || '').toLowerCase().includes(query) ||
      (m.templateName || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCsv = () => {
    const csvHeader = "Timestamp,Channel,Recipient,Status,Cost,Error\n";
    const csvRows = filteredLogs.map(m => `${m.timestamp},${m.channel},${m.recipientPhone},${m.status},${m.cost},"${m.errorReason || ''}"`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CONNEX_Message_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Detailed Delivery & Status Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit itemized message statuses, carrier delivery receipts, error codes and SMS fallback events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />

          <button
            onClick={exportCsv}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Logs (CSV)</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4">
        
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Message Logs</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search phone, template..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Read">Read</option>
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
              <option value="Fallback">Fallback</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Recipient Phone</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Template Name</th>
                <th className="py-3 px-4 text-center">Delivery Status</th>
                <th className="py-3 px-4 text-right">Cost (₹)</th>
                <th className="py-3 px-4">Carrier Notes / Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{m.timestamp}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.recipientPhone}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                      {m.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{m.templateName}</td>
                  <td className="py-3 px-4 text-center">
                    {m.status === 'Delivered' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    )}
                    {m.status === 'Read' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Read
                      </span>
                    )}
                    {m.status === 'Sent' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full inline-flex items-center gap-1">
                        <Send className="w-3 h-3" /> Sent
                      </span>
                    )}
                    {m.status === 'Failed' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Failed
                      </span>
                    )}
                    {m.status === 'Fallback' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 rounded-full inline-flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> SMS Fallback
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{m.cost.toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">
                    {m.errorReason ? (
                      <span className="text-rose-600 font-semibold">{m.errorReason}</span>
                    ) : (
                      'Carrier ACK Received'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
