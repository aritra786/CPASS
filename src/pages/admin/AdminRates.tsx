import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SlidersHorizontal, Globe, DollarSign, Check } from 'lucide-react';

export const AdminRates: React.FC = () => {
  const { rateCards, updateRateCard } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);

  const [editRate, setEditRate] = useState<string>('');
  const [editMargin, setEditMargin] = useState<string>('');

  const handleStartEdit = (rc: any) => {
    setEditingId(rc.id);
    setEditRate(rc.ratePerMsg.toString());
    setEditMargin(rc.marginPercent.toString());
  };

  const handleSave = (id: string) => {
    updateRateCard(id, parseFloat(editRate) || 0.005, parseFloat(editMargin) || 12);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Carrier Rate Cards & Channel Margins
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure baseline carrier message pricing, country tariffs, and platform profit margin overlays
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 space-y-4">
        
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h3 className="font-extrabold text-sm text-slate-900">Per-Message Pricing Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Country & Code</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Base Wholesale Rate (₹)</th>
                <th className="py-3 px-4 text-right">Margin Overlay (%)</th>
                <th className="py-3 px-4 text-right">End-User Tariff (₹)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {rateCards.map(rc => {
                const endUserPrice = rc.ratePerMsg * (1 + rc.marginPercent / 100);
                const isEditing = editingId === rc.id;

                return (
                  <tr key={rc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {rc.country} <span className="text-slate-400 font-mono">({rc.countryCode})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                        {rc.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{rc.category}</td>
                    
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.0001"
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-20 px-2 py-1 text-xs border border-indigo-300 rounded font-mono font-bold text-right"
                        />
                      ) : (
                        `₹${rc.ratePerMsg.toFixed(4)}`
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">
                      {isEditing ? (
                        <input
                          type="number"
                          step="1"
                          value={editMargin}
                          onChange={(e) => setEditMargin(e.target.value)}
                          className="w-16 px-2 py-1 text-xs border border-indigo-300 rounded font-mono font-bold text-right"
                        />
                      ) : (
                        `${rc.marginPercent}%`
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600">
                      ₹{endUserPrice.toFixed(4)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => handleSave(rc.id)}
                          className="px-3 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg shadow-2xs flex items-center gap-1 mx-auto"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(rc)}
                          className="px-3 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200"
                        >
                          Edit Rate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
