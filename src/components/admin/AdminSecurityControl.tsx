'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Mail, 
  User, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Sparkles, 
  Globe, 
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { AdminUserRecord } from '@/types/spud';

export const AdminSecurityControl: React.FC = () => {
  const { 
    firebaseUser, 
    adminWhitelist, 
    addAuthorizedAdmin, 
    removeAuthorizedAdmin 
  } = useApp();

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'owner' | 'admin' | 'editor'>('admin');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    const success = await addAuthorizedAdmin(cleanEmail, newName.trim(), newRole);
    setIsSubmitting(false);

    if (success) {
      setFeedback({ 
        type: 'success', 
        message: `Successfully granted Back Office access to ${cleanEmail}. They can now sign in using Google or Email.` 
      });
      setNewEmail('');
      setNewName('');
      setNewRole('admin');
    } else {
      setFeedback({ type: 'error', message: 'Could not add administrator.' });
    }
  };

  const handleRemove = async (admin: AdminUserRecord) => {
    if (admin.email.toLowerCase() === 'piperspud@gmail.com') {
      alert('The primary owner email (piperspud@gmail.com) cannot be removed.');
      return;
    }

    if (confirm(`Are you sure you want to revoke Back Office access for ${admin.email}?`)) {
      await removeAuthorizedAdmin(admin.id);
      setFeedback({ 
        type: 'success', 
        message: `Revoked access for ${admin.email}.` 
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-card border border-tartan-accent/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Back Office Security & Access Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
              Authorized Admin Whitelist
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Control which Google accounts and email addresses are permitted to log in and manage Spud's Back Office, client bookings, and website content.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-tartan-dark/70 border border-tartan-border p-3.5 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-tartan-accent/20 text-tartan-gold flex items-center justify-center font-serif text-xl font-bold border border-tartan-accent/30">
              {adminWhitelist.length}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Authorized Users</p>
              <p className="text-[11px] text-green-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                <span>Firestore Whitelist Active</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Session Info Banner */}
      <div className="bg-tartan-card/80 border border-tartan-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tartan-navy border border-tartan-border flex items-center justify-center text-tartan-gold font-bold text-sm">
            {firebaseUser?.photoURL ? (
              <img src={firebaseUser.photoURL} alt="Avatar" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <User className="w-5 h-5 text-tartan-gold" />
            )}
          </div>
          <div>
            <p className="text-xs text-gray-400">Current Logged-in Session</p>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <span>{firebaseUser?.displayName || firebaseUser?.email || 'Passcode Administrator'}</span>
              <span className="bg-tartan-accent/20 text-tartan-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-tartan-accent/30">
                Active Admin
              </span>
            </p>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 sm:text-right">
          <p className="text-gray-300 font-medium">Protection Policy</p>
          <p>Any non-whitelisted email is blocked immediately upon sign-in.</p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-150 ${
          feedback.type === 'success' 
            ? 'bg-green-950/60 border-green-800 text-green-200' 
            : 'bg-red-950/60 border-red-800 text-red-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="text-xs sm:text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Grid: Add New Admin + Whitelist Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add New Admin Form */}
        <div className="bg-tartan-card border border-tartan-border rounded-3xl p-6 space-y-5 h-fit shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-tartan-border">
            <div className="w-8 h-8 rounded-lg bg-tartan-accent/20 text-tartan-gold flex items-center justify-center border border-tartan-accent/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Grant Admin Access</h2>
              <p className="text-[11px] text-gray-400">Add an authorized Google or email user</p>
            </div>
          </div>

          <form onSubmit={handleAddAdmin} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-tartan-gold" />
                <span>Admin Email Address *</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. piperspud@gmail.com"
                required
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-xs"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                They can sign in using this email address or their Google account.
              </p>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-tartan-gold" />
                <span>Full Name or Display Label</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Spud (Calum Fraser)"
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-tartan-gold" />
                <span>Role & Permissions</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-tartan-accent text-xs"
              >
                <option value="admin">Administrator (Full Back Office Control)</option>
                <option value="owner">Owner (Primary Executive)</option>
                <option value="editor">Editor (Diary & Content Only)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Granting Access...' : 'Authorize Administrator'}</span>
            </button>
          </form>

          <div className="bg-tartan-dark/60 rounded-xl p-3.5 border border-tartan-border/60 text-[11px] text-gray-400 space-y-1.5">
            <p className="font-bold text-tartan-gold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Instant Cloud Enforcement</span>
            </p>
            <p>
              Once added, the user can immediately click <strong>Sign in with Google</strong> or use their password to enter.
            </p>
          </div>
        </div>

        {/* Right Column: Whitelist Table */}
        <div className="lg:col-span-2 bg-tartan-card border border-tartan-border rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-tartan-border">
            <div>
              <h2 className="text-sm font-bold text-white">Authorized Admin Accounts</h2>
              <p className="text-[11px] text-gray-400">Users with active Back Office access privileges</p>
            </div>
            <span className="text-[11px] bg-tartan-navy px-3 py-1 rounded-full border border-tartan-border text-gray-300 font-semibold">
              {adminWhitelist.length} Allowed
            </span>
          </div>

          <div className="space-y-3">
            {adminWhitelist.map((admin) => {
              const isSpudPrimary = admin.email.toLowerCase() === 'piperspud@gmail.com';

              return (
                <div 
                  key={admin.id || admin.email}
                  className="bg-tartan-navy/60 border border-tartan-border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-tartan-accent/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold flex items-center justify-center font-bold text-sm shrink-0">
                      {(admin.name || admin.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">
                          {admin.name || admin.email.split('@')[0]}
                        </p>
                        {admin.role === 'owner' ? (
                          <span className="bg-amber-500/20 text-yellow-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Owner
                          </span>
                        ) : admin.role === 'editor' ? (
                          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Editor
                          </span>
                        ) : (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                        {isSpudPrimary && (
                          <span className="bg-tartan-gold/20 text-tartan-gold text-[10px] font-bold px-1.5 py-0.2 rounded border border-tartan-gold/40">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span>{admin.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-[11px] text-gray-400 text-right hidden md:block">
                      <p>Added</p>
                      <p className="text-gray-300">{new Date(admin.addedAt).toLocaleDateString()}</p>
                    </div>

                    {!isSpudPrimary ? (
                      <button
                        onClick={() => handleRemove(admin)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800/60 transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Revoke Admin Access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    ) : (
                      <div className="px-2.5 py-1.5 rounded-xl bg-slate-800/60 text-gray-500 text-[11px] border border-slate-700/60 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Protected</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-tartan-border text-xs text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-tartan-gold" />
              <span>Public Registration is Disabled</span>
            </span>
            <span className="text-[11px]">Protected by Firebase Rules</span>
          </div>
        </div>

      </div>

    </div>
  );
};
