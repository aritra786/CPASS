import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CreditCard, Building, Wallet, CheckCircle, ShieldCheck } from 'lucide-react';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ isOpen, onClose }) => {
  const { addFunds } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('netbanking');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const amounts = [1000, 2500, 5000, 10000, 25000];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (isNaN(finalAmount) || finalAmount <= 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      addFunds(finalAmount, paymentMethod === 'card' ? 'Visa ending 4242' : paymentMethod === 'wire' ? 'Corporate Wire Transfer' : 'NetBanking / UPI');
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-200" />
            <h3 className="font-bold text-base">Top Up CONNEX Wallet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
            <p className="text-sm text-slate-500">
              Funds have been added directly to your CONNEX wallet balance.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="p-6 space-y-5">
            
            {/* Amount Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Recharge Amount (₹ INR)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {amounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="mt-2.5">
                <input
                  type="number"
                  placeholder="Or enter custom amount..."
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Payment Gateway / Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600 mb-1" />
                  <div className="text-xs font-bold">Credit Card</div>
                  <div className="text-[10px] text-slate-500">Instant</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wire')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'wire'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building className="w-5 h-5 text-blue-600 mb-1" />
                  <div className="text-xs font-bold">Corporate Wire</div>
                  <div className="text-[10px] text-slate-500">PO Invoice</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
                  <div className="text-xs font-bold">NetBanking / UPI</div>
                  <div className="text-[10px] text-slate-500">Automated</div>
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Amount:</span>
                <span className="font-semibold text-slate-900">
                  ₹{(customAmount ? parseFloat(customAmount) || 0 : selectedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Processing Fee (0%):</span>
                <span className="font-semibold text-slate-900">₹0.00</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Charge:</span>
                <span className="text-blue-700">
                  ₹{(customAmount ? parseFloat(customAmount) || 0 : selectedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment Gateway...</span>
                </>
              ) : (
                <span>Confirm & Pay Now</span>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
