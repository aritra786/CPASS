import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';

interface AdminAuthGateProps {
  onAuthenticateSuccess: (username: string) => void;
  onReturnToUserPortal: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({
  onAuthenticateSuccess,
  onReturnToUserPortal
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      if (trimmedUser.toUpperCase() === 'ARITRA' && password === 'ARITRA009') {
        setSuccessMsg('Authentication successful! Redirecting to Admin Dashboard...');
        setTimeout(() => {
          setIsVerifying(false);
          onAuthenticateSuccess('ARITRA');
        }, 400);
      } else {
        setIsVerifying(false);
        setError('Invalid username or password. Please try again.');
      }
    }, 400);
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
            Restricted path <code className="px-1.5 py-0.5 bg-slate-100 font-mono text-indigo-600 rounded font-bold">/admin</code> protected by Admin Login
          </p>
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                id="admin-username-input"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all outline-none"
                id="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            id="admin-login-submit-btn"
          >
            <Lock className="w-4 h-4" />
            <span>{isVerifying ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
          </button>
        </form>

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


