import React, { useState } from 'react';
import { CheckCircle2, UserX, Plus, Trash2, Search, ShieldCheck } from 'lucide-react';

export const OptInManager: React.FC = () => {
  const [optInList, setOptInList] = useState([
    { id: '1', phone: '+91 98765 43210', channel: 'WhatsApp', optInDate: '2026-07-15', status: 'Subscribed' },
    { id: '2', phone: '+1 415 555 2671', channel: 'RCS', optInDate: '2026-07-20', status: 'Subscribed' },
    { id: '3', phone: '+44 7911 123456', channel: 'Viber', optInDate: '2026-08-01', status: 'Unsubscribed' },
    { id: '4', phone: '+91 91234 56789', channel: 'RCS', optInDate: '2026-08-03', status: 'Subscribed' }
  ]);

  const [newPhone, setNewPhone] = useState('');
  const [search, setSearch] = useState('');

  const handleAddPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;
    setOptInList(prev => [
      { id: Date.now().toString(), phone: newPhone.trim(), channel: 'WhatsApp', optInDate: new Date().toISOString().split('T')[0], status: 'Subscribed' },
      ...prev
    ]);
    setNewPhone('');
  };

  const handleToggle = (id: string) => {
    setOptInList(prev => prev.map(item => item.id === id ? { ...item, status: item.status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed' } : item));
  };

  const filtered = (optInList || []).filter(o => (o.phone || '').includes(search || ''));

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Subscriber Opt-In & Opt-Out Lists
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Maintain subscriber consent registry and blacklist compliance for RCS & WhatsApp regulations
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        
        {/* Add phone & search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <form onSubmit={handleAddPhone} className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              required
              placeholder="Add opt-in subscriber (+919876543210)..."
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Add Opt-In</span>
            </button>
          </form>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Subscriber Phone</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Consent Date</th>
                <th className="py-3 px-4">Consent Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.phone}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded">
                      {item.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{item.optInDate}</td>
                  <td className="py-3 px-4">
                    {item.status === 'Subscribed' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Subscribed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full inline-flex items-center gap-1">
                        <UserX className="w-3 h-3" /> Opted Out
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggle(item.id)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100"
                    >
                      Toggle Consent
                    </button>
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
