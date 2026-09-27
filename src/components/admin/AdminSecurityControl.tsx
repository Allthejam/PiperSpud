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
  ShieldAlert,
  Radio,
  Sliders,
  Check,
  X,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { UserRecord, UserPermissions } from '@/types/spud';

export const AdminSecurityControl: React.FC = () => {
  const { 
    firebaseUser, 
    users, 
    addUser, 
    updateUser,
    updateUserPermissions,
    toggleUserOnlineStatus,
    removeUser
  } = useApp();

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'owner' | 'admin' | 'editor'>('admin');
  const [newPerms, setNewPerms] = useState<UserPermissions>({
    canManageBookings: true,
    canEditTunes: true,
    canEditCms: true,
    canManageSecurity: true,
    canChat: true
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (role: 'owner' | 'admin' | 'editor') => {
    setNewRole(role);
    if (role === 'editor') {
      setNewPerms({
        canManageBookings: false,
        canEditTunes: true,
        canEditCms: true,
        canManageSecurity: false,
        canChat: false
      });
    } else {
      setNewPerms({
        canManageBookings: true,
        canEditTunes: true,
        canEditCms: true,
        canManageSecurity: role === 'owner' || role === 'admin',
        canChat: true
      });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    const success = await addUser(cleanEmail, newName.trim(), newRole, newPerms);
    setIsSubmitting(false);

    if (success) {
      setFeedback({ 
        type: 'success', 
        message: `Successfully saved ${cleanEmail} to Firestore 'users' collection with role '${newRole}'.` 
      });
      setNewEmail('');
      setNewName('');
      setNewRole('admin');
      setNewPerms({
        canManageBookings: true,
        canEditTunes: true,
        canEditCms: true,
        canManageSecurity: true,
        canChat: true
      });
    } else {
      setFeedback({ type: 'error', message: 'Could not add administrator.' });
    }
  };

  const handleToggleOnline = async (user: UserRecord) => {
    const nextStatus = !user.isOnline;
    await toggleUserOnlineStatus(user.id, nextStatus);
    setFeedback({
      type: 'success',
      message: `${user.name || user.email} presence status set to ${nextStatus ? 'ONLINE' : 'OFFLINE'} (persisted to Firestore).`
    });
  };

  const handlePermissionToggle = async (userId: string, key: keyof UserPermissions, currentValue: boolean) => {
    await updateUserPermissions(userId, { [key]: !currentValue });
  };

  const handleRemove = async (user: UserRecord) => {
    if (user.email.toLowerCase() === 'piperspud@gmail.com') {
      alert('The primary owner email (piperspud@gmail.com) cannot be removed.');
      return;
    }

    if (confirm(`Are you sure you want to revoke Back Office access and delete user record for ${user.email}?`)) {
      await removeUser(user.id);
      setFeedback({ 
        type: 'success', 
        message: `Revoked access and deleted ${user.email} from Firestore 'users' collection.` 
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-card border border-tartan-accent/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Back Office Security & Team Permissions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
              Users Collection & Access Control
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Manage authorized administrators in the Firestore <code className="text-tartan-gold font-mono bg-black/40 px-1.5 py-0.5 rounded">users</code> collection. Control real-time Online/Offline chat availability, roles, and granular module permissions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 bg-tartan-dark/80 border border-tartan-border p-3.5 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-tartan-accent/20 text-tartan-gold flex items-center justify-center font-serif text-xl font-bold border border-tartan-accent/30">
                {users.length}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Firestore Users</p>
                <p className="text-[11px] text-green-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                  <span>Real-Time Sync</span>
                </p>
              </div>
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
              <span>{firebaseUser?.displayName || firebaseUser?.email || 'Master Administrator'}</span>
              <span className="bg-tartan-accent/20 text-tartan-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-tartan-accent/30">
                Active Session
              </span>
            </p>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 sm:text-right">
          <p className="text-gray-300 font-medium">Firestore Realtime Protection</p>
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

      {/* Grid: Add New User + Users Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Add New Admin Form (4 cols) */}
        <div className="lg:col-span-4 bg-tartan-card border border-tartan-border rounded-3xl p-6 space-y-5 h-fit shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-tartan-border">
            <div className="w-8 h-8 rounded-lg bg-tartan-accent/20 text-tartan-gold flex items-center justify-center border border-tartan-accent/30">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Add Team Member</h2>
              <p className="text-[11px] text-gray-400">Add to Firestore 'users' collection</p>
            </div>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-tartan-gold" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. piperspud@gmail.com"
                required
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-tartan-accent text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-tartan-gold" />
                <span>Full Name or Display Name</span>
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
                <span>Role Assignment</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => handleRoleChange(e.target.value as any)}
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-tartan-accent text-xs"
              >
                <option value="admin">Administrator (Full Back Office Control)</option>
                <option value="owner">Owner (Primary Executive)</option>
                <option value="editor">Editor (Diary & Content Only)</option>
              </select>
            </div>

            {/* Granular Permissions Checkboxes */}
            <div className="bg-tartan-dark/70 p-3 rounded-2xl border border-tartan-border/70 space-y-2">
              <span className="text-[11px] font-bold text-tartan-gold uppercase tracking-wider block">
                Module Permissions
              </span>
              <div className="space-y-1.5 text-[11px]">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.canManageBookings}
                    onChange={(e) => setNewPerms({ ...newPerms, canManageBookings: e.target.checked })}
                    className="rounded border-tartan-border text-yellow-500 focus:ring-0"
                  />
                  <span>Bookings, Diary & Payments</span>
                </label>
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.canEditTunes}
                    onChange={(e) => setNewPerms({ ...newPerms, canEditTunes: e.target.checked })}
                    className="rounded border-tartan-border text-yellow-500 focus:ring-0"
                  />
                  <span>Bagpipe Tunes & Jukebox</span>
                </label>
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.canEditCms}
                    onChange={(e) => setNewPerms({ ...newPerms, canEditCms: e.target.checked })}
                    className="rounded border-tartan-border text-yellow-500 focus:ring-0"
                  />
                  <span>In-Page Visual Pencil CMS</span>
                </label>
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.canChat}
                    onChange={(e) => setNewPerms({ ...newPerms, canChat: e.target.checked })}
                    className="rounded border-tartan-border text-yellow-500 focus:ring-0"
                  />
                  <span>Live Chat & Quick Replies</span>
                </label>
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPerms.canManageSecurity}
                    onChange={(e) => setNewPerms({ ...newPerms, canManageSecurity: e.target.checked })}
                    className="rounded border-tartan-border text-yellow-500 focus:ring-0"
                  />
                  <span>Security & User Management</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving to Firestore...' : 'Save User to Firestore'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Users Collection Table (8 cols) */}
        <div className="lg:col-span-8 bg-tartan-card border border-tartan-border rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-tartan-border">
            <div>
              <h2 className="text-sm font-bold text-white">Firestore Users & Permissions</h2>
              <p className="text-[11px] text-gray-400">Real-time status, role and module access</p>
            </div>
            <span className="text-[11px] bg-tartan-navy px-3 py-1 rounded-full border border-tartan-border text-gray-300 font-semibold">
              {users.length} Users in Database
            </span>
          </div>

          <div className="space-y-3.5">
            {users.map((user) => {
              const isSpudPrimary = user.email.toLowerCase() === 'piperspud@gmail.com';
              const isEditing = editingUserId === user.id;

              return (
                <div 
                  key={user.id || user.email}
                  className="bg-tartan-navy/60 border border-tartan-border rounded-2xl p-4 space-y-3 hover:border-tartan-accent/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold flex items-center justify-center font-bold text-base shrink-0">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <span 
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-tartan-navy shadow ${
                            user.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-white">
                            {user.name || user.displayName || user.email.split('@')[0]}
                          </p>
                          {user.role === 'owner' ? (
                            <span className="bg-amber-500/20 text-yellow-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Owner
                            </span>
                          ) : user.role === 'editor' ? (
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
                          <span>{user.email}</span>
                        </p>
                      </div>
                    </div>

                    {/* Online / Offline Toggle & Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                      <button
                        onClick={() => handleToggleOnline(user)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                          user.isOnline
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                            : 'bg-red-950/80 text-red-300 border-red-500/50 hover:bg-red-900'
                        }`}
                        title="Click to toggle live presence status in Firestore"
                      >
                        <Radio className="w-3 h-3" />
                        <span>{user.isOnline ? 'Online (Live)' : 'Offline (Away)'}</span>
                      </button>

                      <button
                        onClick={() => setEditingUserId(isEditing ? null : user.id)}
                        className="p-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 border border-tartan-border text-xs font-semibold flex items-center gap-1"
                        title="Toggle permissions configuration"
                      >
                        <Sliders className="w-3.5 h-3.5 text-tartan-gold" />
                        <span>{isEditing ? 'Close' : 'Permissions'}</span>
                      </button>

                      {!isSpudPrimary ? (
                        <button
                          onClick={() => handleRemove(user)}
                          className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800/60 transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="Revoke Admin Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-800/60 text-gray-500 text-[11px] border border-slate-700/60 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Permissions Checklist Drawer */}
                  <div className={`pt-2 border-t border-tartan-border/60 ${isEditing ? 'block' : 'hidden sm:block'}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
                      
                      <button
                        onClick={() => handlePermissionToggle(user.id, 'canManageBookings', !!user.permissions?.canManageBookings)}
                        className={`p-1.5 rounded-lg border text-left font-medium flex items-center justify-between transition ${
                          user.permissions?.canManageBookings
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900/40 border-slate-700 text-gray-500'
                        }`}
                      >
                        <span>Bookings</span>
                        {user.permissions?.canManageBookings ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-gray-600" />}
                      </button>

                      <button
                        onClick={() => handlePermissionToggle(user.id, 'canEditTunes', !!user.permissions?.canEditTunes)}
                        className={`p-1.5 rounded-lg border text-left font-medium flex items-center justify-between transition ${
                          user.permissions?.canEditTunes
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900/40 border-slate-700 text-gray-500'
                        }`}
                      >
                        <span>Tunes Jukebox</span>
                        {user.permissions?.canEditTunes ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-gray-600" />}
                      </button>

                      <button
                        onClick={() => handlePermissionToggle(user.id, 'canEditCms', !!user.permissions?.canEditCms)}
                        className={`p-1.5 rounded-lg border text-left font-medium flex items-center justify-between transition ${
                          user.permissions?.canEditCms
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900/40 border-slate-700 text-gray-500'
                        }`}
                      >
                        <span>Visual CMS</span>
                        {user.permissions?.canEditCms ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-gray-600" />}
                      </button>

                      <button
                        onClick={() => handlePermissionToggle(user.id, 'canChat', !!user.permissions?.canChat)}
                        className={`p-1.5 rounded-lg border text-left font-medium flex items-center justify-between transition ${
                          user.permissions?.canChat
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900/40 border-slate-700 text-gray-500'
                        }`}
                      >
                        <span>Live Chat</span>
                        {user.permissions?.canChat ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-gray-600" />}
                      </button>

                      <button
                        onClick={() => handlePermissionToggle(user.id, 'canManageSecurity', !!user.permissions?.canManageSecurity)}
                        className={`p-1.5 rounded-lg border text-left font-medium flex items-center justify-between transition ${
                          user.permissions?.canManageSecurity
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900/40 border-slate-700 text-gray-500'
                        }`}
                      >
                        <span>Security & Team</span>
                        {user.permissions?.canManageSecurity ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-gray-600" />}
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-tartan-border text-xs text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-tartan-gold" />
              <span>Synced directly with Firestore 'users' collection</span>
            </span>
            <span className="text-[11px] text-green-400 font-semibold">Real-Time Cloud Connected</span>
          </div>
        </div>

      </div>

    </div>
  );
};
