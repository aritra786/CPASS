import React, { useState } from 'react';
import { Users, Plus, Upload, Trash2, Tag } from 'lucide-react';

export const ContactGroup: React.FC = () => {
  const [groups, setGroups] = useState<{ id: string; name: string; count: number; channels: string[]; lastUpdated: string }[]>(() => {
    const saved = localStorage.getItem('connex_contact_groups');
    return saved ? JSON.parse(saved) : [];
  });

  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    const newGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      count: 0,
      channels: ['WhatsApp', 'RCS'],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    const updated = [newGroup, ...groups];
    setGroups(updated);
    localStorage.setItem('connex_contact_groups', JSON.stringify(updated));
    setGroupName('');
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Audience Contact Groups & Segmentation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Organize target recipient lists into audience segments for targeted omnichannel dispatches
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Create Group Form */}
        <form onSubmit={handleCreateGroup} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Create Contact Group</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Group Name</label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              placeholder="e.g. November Black Friday Leads"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Save Contact Group</span>
          </button>
        </form>

        {/* Groups List */}
        <div className="md:col-span-2 space-y-3">
          {groups.map(g => (
            <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{g.name}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Contacts: <strong className="text-slate-800">{g.count.toLocaleString()}</strong></span>
                  <span>Updated: {g.lastUpdated}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {g.channels.map(ch => (
                  <span key={ch} className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    {ch}
                  </span>
                ))}
                <button
                  onClick={() => setGroups(prev => prev.filter(item => item.id !== g.id))}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
