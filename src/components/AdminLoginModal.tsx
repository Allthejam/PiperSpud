'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  UserPlus, 
  LogIn, 
  HelpCircle 
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'passcode';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    sendPasswordReset, 
    loginAdmin 
  } = useApp();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (res.success) {
      onClose();
      window.location.href = '/admin';
    } else {
      setError(res.error || 'Google sign-in failed. Please try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      setIsLoading(false);
      if (res.success) {
        onClose();
        window.location.href = '/admin';
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } else if (mode === 'register') {
      const res = await registerWithEmail(email, password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage('Account created and signed in successfully!');
        setTimeout(() => {
          onClose();
          window.location.href = '/admin';
        }, 1200);
      } else {
        setError(res.error || 'Account creation failed.');
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setError('Please enter the email associated with your account.');
      return;
    }

    setIsLoading(true);
    const res = await sendPasswordReset(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage('Password reset link sent! Check your inbox (and spam folder).');
    } else {
      setError(res.error || 'Failed to send password reset email.');
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    const success = loginAdmin(passcode);
    if (success) {
      onClose();
      window.location.href = '/admin';
    } else {
      setError('Incorrect passcode. Enter "spud123" or "admin".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-tartan-card border border-tartan-accent/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-tartan-navy px-6 py-5 border-b border-tartan-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tartan-accent/20 flex items-center justify-center text-tartan-gold border border-tartan-accent/40 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif tracking-wide">
                Spud\'s Back Office Login
              </h3>
              <p className="text-xs text-tartan-gold">Live Firebase Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-tartan-border bg-tartan-dark/60 text-xs">
          <button
            onClick={() => { setMode('login'); resetMessages(); }}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              mode === 'login' 
                ? 'border-tartan-gold text-tartan-gold bg-tartan-card' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { setMode('register'); resetMessages(); }}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              mode === 'register' 
                ? 'border-tartan-gold text-tartan-gold bg-tartan-card' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Admin</span>
          </button>

          <button
            onClick={() => { setMode('passcode'); resetMessages(); }}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              mode === 'passcode' 
                ? 'border-tartan-gold text-tartan-gold bg-tartan-card' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Passcode</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-950/70 border border-green-800 rounded-xl text-green-200 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE: LOGIN or REGISTER */}
          {(mode === 'login' || mode === 'register') && (
            <>
              {/* Google 1-Click Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.37 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.27 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Sign in with Google (1-Click)</span>
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-tartan-border"></div>
                <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Or with email & password
                </span>
                <div className="flex-grow border-t border-tartan-border"></div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="spud@spudthepiper.com"
                    required
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-tartan-gold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); resetMessages(); }}
                        className="text-[11px] text-tartan-gold hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Choose a secure password (min 6 chars)' : '••••••••'}
                    required
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-sm"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs flex items-center gap-2 shadow-lg hover:shadow-yellow-500/20 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-tartan-dark" />
                    ) : (
                      <>
                        <span>{mode === 'register' ? 'Register Account' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="bg-tartan-dark/60 rounded-xl p-3 border border-tartan-border/60 text-xs text-gray-300">
                Enter your admin email address and we will dispatch an instant password reset link directly via Firebase Auth.
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Admin Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="spud@spudthepiper.com"
                  required
                  autoFocus
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-sm"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { setMode('login'); resetMessages(); }}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  ← Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Send Reset Email</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* MODE: PASSCODE QUICK ACCESS */}
          {mode === 'passcode' && (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="bg-tartan-dark/60 rounded-xl p-3 border border-tartan-border/60 text-xs text-gray-300">
                <span className="text-tartan-gold font-bold">Offline / Demo Passcode:</span> Use <code className="bg-slate-800 px-1.5 py-0.5 rounded text-tartan-gold font-mono font-bold">spud123</code> or <code className="bg-slate-800 px-1.5 py-0.5 rounded text-tartan-gold font-mono font-bold">admin</code> for quick offline bypass.
              </div>

              <div>
                <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Passcode</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode..."
                    required
                    autoFocus
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-sm"
                  />
                  <KeyRound className="w-4 h-4 text-gray-500 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs flex items-center gap-2 shadow-lg hover:shadow-yellow-500/20 transition-transform active:scale-95"
                >
                  <span>Unlock Back Office</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
