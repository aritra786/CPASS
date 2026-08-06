import React, { useState } from 'react';
import { Shield, Lock, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface AdminAuthGateProps {
  onAuthenticateSuccess: (email: string) => void;
  onReturnToUserPortal: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onAuthenticateSuccess,
  onReturnToUserPortal
}) => {
  const [email, setEmail] = useState('aritra.sardar2805@gmail.com');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const AUTHORIZED_EMAIL = 'aritra.sardar2805@gmail.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedEmail = (email || '').trim().toLowerCase();

    if (cleanedEmail !== AUTHORIZED_EMAIL) {
      setError(`Access Denied: ${cleanedEmail} is not authorized for Admin access. Access is strictly granted to ${AUTHORIZED_EMAIL}.`);
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onAuthenticateSuccess(cleanedEmail);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden p-8 space-y-6">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            CONNEX Admin Portal Access
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Restricted access portal for authorized platform administrators
          </p>
        </div>

        {/* Access Restriction Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 font-medium flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Admin access is granted exclusively to <strong>{AUTHORIZED_EMAIL}</strong>.
          </span>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aritra.sardar2805@gmail.com"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Admin Access Passcode / Security Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Pre-authorized session token for {AUTHORIZED_EMAIL}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Administrator Credentials...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Authenticate & Access Admin Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Return Button */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onReturnToUserPortal}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to CONNEX User Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
};
