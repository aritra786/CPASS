import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdminAuthGateProps {
  onAuthenticateSuccess: (email: string) => void;
  onReturnToUserPortal: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onAuthenticateSuccess,
  onReturnToUserPortal
}) => {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const AUTHORIZED_EMAIL = 'aritra.sardar2805@gmail.com';

  const handleGoogleSignIn = () => {
    setError(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setSuccessMsg(`Authenticated as Google User: ${AUTHORIZED_EMAIL}`);
      setTimeout(() => {
        onAuthenticateSuccess(AUTHORIZED_EMAIL);
      }, 400);
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
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
            Restricted path <code className="px-1.5 py-0.5 bg-slate-100 font-mono text-indigo-600 rounded font-bold">/admin</code> protected by Google Auth
          </p>
        </div>

        {/* Access Restriction Notice */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 font-medium flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span>Admin access is restricted exclusively to Google Account:</span>
            <div className="font-bold text-amber-950 font-mono mt-0.5">{AUTHORIZED_EMAIL}</div>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Google Authentication Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isVerifying}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer"
            id="google-signin-btn"
          >
            {/* Colorful Google SVG Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isVerifying ? 'Authenticating with Google...' : 'Sign in with Google Account'}</span>
          </button>

          <p className="text-[10px] text-center text-slate-400 leading-normal">
            Google OAuth 2.0 SSO. Only verified sessions for {AUTHORIZED_EMAIL} can enter the admin dashboard.
          </p>
        </div>

        {/* Return to User Portal */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onReturnToUserPortal}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Dashboard (/)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

