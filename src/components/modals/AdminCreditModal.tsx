import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TenantAccount } from '../../types';
import { X, ShieldAlert, ArrowUpRight, ArrowDownLeft, CheckCircle } from 'lucide-react';

interface AdminCreditModalProps {
  tenant: TenantAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminCreditModal: React.FC<AdminCreditModalProps> = ({ tenant, isOpen, onClose }) => {
  const { adminCreditDebit } = useApp();
  const [actionType, setActionType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amount, setAmount] = useState<string>('100');
  const [notes, setNotes] = useState<string>('Manual Adjustment - Invoice Ref #1024');
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !tenant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    adminCreditDebit(tenant.id, parsedAmount, actionType, notes);
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Admin Balance Override</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Tenant Wallet Updated!</h4>
            <p className="text-xs text-slate-500">
              {actionType === 'CREDIT' ? 'Credited' : 'Debited'} ₹{(parseFloat(amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} for {tenant?.companyName || 'Tenant'}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Target Tenant Info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Tenant</div>
              <div className="font-bold text-slate-900 text-sm">{tenant?.companyName || 'Tenant'}</div>
              <div className="flex justify-between items-center text-xs text-slate-600 mt-1">
                <span>Account ID: <strong className="text-slate-900">{tenant?.accountId}</strong></span>
                <span>Current Balance: <strong className="text-emerald-600">₹{(tenant?.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              </div>
            </div>

            {/* Action Toggle: Credit vs Debit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Adjustment Action
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('CREDIT')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    actionType === 'CREDIT'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Manual Credit (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('DEBIT')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    actionType === 'DEBIT'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Manual Debit (-)</span>
                </button>
              </div>
            </div>

            {/* Adjustment Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Amount (₹ INR)
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono font-bold"
              />
            </div>

            {/* Reference / Audit Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Audit Notes / Reference ID
              </label>
              <input
                type="text"
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="Reason for adjustment..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full py-3 text-white rounded-xl font-bold text-sm shadow-md transition-all ${
                actionType === 'CREDIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Apply {actionType === 'CREDIT' ? 'Credit' : 'Debit'} to Tenant Wallet
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
