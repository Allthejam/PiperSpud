'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, Lock, X, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAdmin } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = loginAdmin(password);
    if (success) {
      onClose();
      window.location.href = '/admin';
    } else {
      setError('Incorrect passcode. Try "spud123" or "admin".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-tartan-card border border-tartan-accent/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-tartan-navy px-6 py-5 border-b border-tartan-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tartan-accent/20 flex items-center justify-center text-tartan-gold border border-tartan-accent/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Spud\'s Back Office Login</h3>
              <p className="text-xs text-tartan-gold">Secure Admin & Diary Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-tartan-dark/60 rounded-xl p-3 border border-tartan-border/60 text-xs text-gray-300">
            <span className="text-tartan-gold font-bold">Demo Quick Access:</span> Use password <code className="bg-slate-800 px-1.5 py-0.5 rounded text-tartan-gold font-mono font-bold">spud123</code> or <code className="bg-slate-800 px-1.5 py-0.5 rounded text-tartan-gold font-mono font-bold">admin</code> to log into the Back Office and test all Brevo/PayPal workflows.
          </div>

          <div>
            <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Passcode</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent font-medium text-sm"
                autoFocus
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

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
      </div>
    </div>
  );
};
