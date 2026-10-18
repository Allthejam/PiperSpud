'use client';

import React, { useState, useRef, useMemo } from 'react';
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
  Edit2,
  Camera,
  Upload,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Eye,
  SlidersHorizontal,
  Code2,
  Crown
} from 'lucide-react';
import { UserRecord, UserPermissions, UserRole, ModuleAccessLevel, ModulePermissions } from '@/types/spud';
import { ALL_ADMIN_MODULES, defaultPermissions } from '@/lib/initialData';
import { uploadToStorage } from '@/lib/firebase';

export const AdminSecurityControl: React.FC = () => {
  const { 
    firebaseUser, 
    users, 
    addUser, 
    updateUser,
    updateUserPermissions,
    toggleUserOnlineStatus,
    removeUser,
    spudProfileAvatar,
    updateSpudProfileAvatar,
    isOwnerOrDev,
    currentUserRole
  } = useApp();

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');
  const [newPerms, setNewPerms] = useState<UserPermissions>(defaultPermissions.admin);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Avatar Modal State for existing users
  const [avatarModalUser, setAvatarModalUser] = useState<UserRecord | null>(null);
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isUploadingEditAvatar, setIsUploadingEditAvatar] = useState(false);
  const editAvatarFileInputRef = useRef<HTMLInputElement>(null);

  // New User Avatar State
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [isUploadingNewAvatar, setIsUploadingNewAvatar] = useState(false);
  const newAvatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAvatarModal = (user: UserRecord) => {
    const isSpud = user.role === 'owner' || (user.email || '').toLowerCase() === 'piperspud@gmail.com';
    setAvatarModalUser(user);
    setEditAvatarUrl(user.avatarUrl || (isSpud ? spudProfileAvatar : '') || '');
  };

  const handleEditAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEditAvatar(true);
    try {
      const cloudUrl = await uploadToStorage(file, 'user_avatars');
      setEditAvatarUrl(cloudUrl);
    } catch (err) {
      console.warn('Storage upload error, falling back to FileReader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingEditAvatar(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarModalUser) return;
    const cleanUrl = editAvatarUrl.trim();
    const isSpud = avatarModalUser.role === 'owner' || (avatarModalUser.email || '').toLowerCase() === 'piperspud@gmail.com';

    await updateUser(avatarModalUser.id, { avatarUrl: cleanUrl || undefined });
    if (isSpud && cleanUrl) {
      await updateSpudProfileAvatar(cleanUrl);
    }

    setFeedback({
      type: 'success',
      message: `Updated profile avatar image for ${avatarModalUser.name || avatarModalUser.email} in Firestore.`
    });
    setAvatarModalUser(null);
  };

  const handleNewAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingNewAvatar(true);
    try {
      const cloudUrl = await uploadToStorage(file, 'user_avatars');
      setNewAvatarUrl(cloudUrl);
    } catch (err) {
      console.warn('Storage upload error, falling back to FileReader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingNewAvatar(false);
    }
  };

  const moduleGroups = useMemo(() => [
    { groupName: 'Diary & Bookings' as const, modules: ALL_ADMIN_MODULES.filter(m => m.group === 'Diary & Bookings') },
    { groupName: 'Communications & Clients' as const, modules: ALL_ADMIN_MODULES.filter(m => m.group === 'Communications & Clients') },
    { groupName: 'Content & Media' as const, modules: ALL_ADMIN_MODULES.filter(m => m.group === 'Content & Media') },
    { groupName: 'Highland Services' as const, modules: ALL_ADMIN_MODULES.filter(m => m.group === 'Highland Services') },
    { groupName: 'System, SEO & Security' as const, modules: ALL_ADMIN_MODULES.filter(m => m.group === 'System, SEO & Security') },
  ], []);

  const handleRoleChange = (role: UserRole) => {
    setNewRole(role);
    const defaults = defaultPermissions[role] || defaultPermissions.admin;
    setNewPerms(defaults);
  };

  const handleSetModuleAccess = async (user: UserRecord, moduleId: keyof ModulePermissions, level: ModuleAccessLevel) => {
    if (!isOwnerOrDev) {
      setFeedback({ type: 'error', message: 'Only the Owner and Developer can change module permissions.' });
      return;
    }
    const currentModules = user.permissions?.modules || defaultPermissions[user.role]?.modules || {};
    const updatedModules = { ...currentModules, [moduleId]: level };
    await updateUserPermissions(user.id, { modules: updatedModules });
    setFeedback({ 
      type: 'success', 
      message: `Updated ${String(moduleId)} permission to '${level.toUpperCase()}' for ${user.name || user.email}.` 
    });
  };

  const handleSetAllModules = async (user: UserRecord, level: ModuleAccessLevel) => {
    if (!isOwnerOrDev) {
      setFeedback({ type: 'error', message: 'Only the Owner and Developer can change module permissions.' });
      return;
    }
    const newModules = ALL_ADMIN_MODULES.reduce((acc, m) => {
      acc[m.id] = level;
      return acc;
    }, {} as ModulePermissions);
    await updateUserPermissions(user.id, { modules: newModules });
    setFeedback({
      type: 'success',
      message: `Set all module permissions to '${level.toUpperCase()}' for ${user.name || user.email}.`
    });
  };

  const handleResetToRoleDefaults = async (user: UserRecord) => {
    if (!isOwnerOrDev) {
      setFeedback({ type: 'error', message: 'Only the Owner and Developer can change module permissions.' });
      return;
    }
    const roleDefaults = defaultPermissions[user.role] || defaultPermissions.admin;
    await updateUserPermissions(user.id, { 
      ...roleDefaults,
      modules: { ...roleDefaults.modules }
    });
    setFeedback({
      type: 'success',
      message: `Reset permissions to defaults for role '${user.role}' for ${user.name || user.email}.`
    });
  };

  const handleChangeUserRole = async (user: UserRecord, targetRole: UserRole) => {
    if (!isOwnerOrDev) {
      setFeedback({ type: 'error', message: 'Only the Owner and Developer can change user roles.' });
      return;
    }
    if ((user.email || '').toLowerCase() === 'piperspud@gmail.com') {
      alert('The primary owner role cannot be changed.');
      return;
    }
    const roleDefaults = defaultPermissions[targetRole] || defaultPermissions.admin;
    await updateUser(user.id, { 
      role: targetRole,
      permissions: {
        ...roleDefaults,
        modules: { ...roleDefaults.modules }
      }
    });
    setFeedback({
      type: 'success',
      message: `Updated ${user.name || user.email} role to '${targetRole.toUpperCase()}' and applied default module permissions.`
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!isOwnerOrDev) {
      setFeedback({ type: 'error', message: 'Only the Owner and Developer have authority to add new team members.' });
      return;
    }

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    const success = await addUser(cleanEmail, newName.trim(), newRole, newPerms, newAvatarUrl.trim() || undefined);
    setIsSubmitting(false);

    if (success) {
      setFeedback({ 
        type: 'success', 
        message: `Successfully saved ${cleanEmail} to Firestore 'users' collection with role '${newRole}'.` 
      });
      setNewEmail('');
      setNewName('');
      setNewAvatarUrl('');
      setNewRole('admin');
      setNewPerms(defaultPermissions.admin);
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

  const handleRemove = async (user: UserRecord) => {
    if (!isOwnerOrDev) {
      setFeedback({ type: 'error', message: 'Only the Owner and Developer can remove team members.' });
      return;
    }
    const userEmail = (user.email || '').toLowerCase().trim();
    if (userEmail === 'piperspud@gmail.com') {
      alert('The primary owner email (piperspud@gmail.com) cannot be removed.');
      return;
    }

    const displayName = user.email || user.name || 'this administrator';
    if (confirm(`Are you sure you want to revoke Back Office access and delete user record for ${displayName}?`)) {
      await removeUser(user.id);
      setFeedback({ 
        type: 'success', 
        message: `Revoked access and deleted ${displayName} from Firestore 'users' collection.` 
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
              Manage authorized administrators in the Firestore <code className="text-tartan-gold font-mono bg-black/40 px-1.5 py-0.5 rounded">users</code> collection. Real-time Online/Offline chat availability, roles, and granular module permissions are synced directly with your live login sessions.
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
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-tartan-accent text-xs"
              >
                <option value="developer">Developer (Full Access - No Restrictions)</option>
                <option value="owner">Owner (Primary Executive)</option>
                <option value="admin">Administrator (Standard Admin)</option>
                <option value="editor">Editor (Diary & Content Only)</option>
              </select>
            </div>

            {/* Avatar / Profile Photo */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-tartan-gold" />
                  <span>Avatar / Profile Photo</span>
                </span>
                {newAvatarUrl && (
                  <button 
                    type="button" 
                    onClick={() => setNewAvatarUrl('')}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </label>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-tartan-dark border border-tartan-border flex items-center justify-center overflow-hidden shrink-0">
                  {newAvatarUrl ? (
                    <img src={newAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={newAvatarFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleNewAvatarUpload}
                  />
                  <button
                    type="button"
                    onClick={() => newAvatarFileInputRef.current?.click()}
                    disabled={isUploadingNewAvatar}
                    className="w-full py-1.5 px-3 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    {isUploadingNewAvatar ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-tartan-gold" />
                        <span>Uploading Image...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 text-tartan-gold" />
                        <span>Choose Photo or Selfie</span>
                      </>
                    )}
                  </button>
                  <input
                    type="url"
                    value={newAvatarUrl}
                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-lg px-2.5 py-1 text-white placeholder-gray-500 text-[11px] focus:outline-none focus:border-tartan-accent"
                  />
                </div>
              </div>
            </div>

            {/* Granular Permissions Overview */}
            <div className="bg-tartan-dark/70 p-3 rounded-2xl border border-tartan-border/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-tartan-gold uppercase tracking-wider block">
                  Module Permissions
                </span>
                <span className="text-[10px] text-gray-400 capitalize bg-tartan-navy px-2 py-0.5 rounded border border-tartan-border">
                  {newRole} Defaults
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {newRole === 'developer' && 'Full "Edit" access across all 23 Back Office modules with zero restrictions.'}
                {newRole === 'owner' && 'Full Executive control across all modules, payments, team access, and CMS.'}
                {newRole === 'admin' && 'Full operational management with read-only restriction on security settings.'}
                {newRole === 'editor' && 'Access to Diary, Blog, Gallery, Tunes, Attire & CMS with restricted financial & security access.'}
              </p>
              <div className="text-[10px] text-tartan-gold/80 flex items-center gap-1 pt-1 border-t border-tartan-border/40">
                <Sliders className="w-3 h-3" />
                <span>Granular None | View | Edit toggles can be tailored in the user list.</span>
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
            {(users || []).map((user) => {
              const userEmail = (user?.email || '').trim();
              const isSpudPrimary = userEmail.toLowerCase() === 'piperspud@gmail.com';
              const isCurrentUser = Boolean(firebaseUser?.email && userEmail && (firebaseUser.email.toLowerCase().trim() === userEmail.toLowerCase()));
              const isEditing = editingUserId === user.id;
              const displayName = user?.name || user?.displayName || (userEmail ? userEmail.split('@')[0] : 'Admin User');
              const initialLetter = (user?.name || userEmail || 'A')[0].toUpperCase();

              return (
                <div 
                  key={user.id || userEmail || Math.random().toString()}
                  className={`border rounded-2xl p-4 space-y-3 transition-colors ${
                    isCurrentUser 
                      ? 'bg-tartan-navy/90 border-tartan-accent/70 shadow-lg ring-1 ring-tartan-accent/30' 
                      : 'bg-tartan-navy/60 border-tartan-border hover:border-tartan-accent/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="relative group cursor-pointer"
                        onClick={() => handleOpenAvatarModal(user)}
                        title="Click to change or upload avatar"
                      >
                        <div className="w-11 h-11 rounded-xl bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold flex items-center justify-center font-bold text-base shrink-0 overflow-hidden relative">
                          {user.avatarUrl || (isSpudPrimary && spudProfileAvatar) ? (
                            <img src={user.avatarUrl || (isSpudPrimary ? spudProfileAvatar : '')} alt={displayName} className="w-full h-full object-cover" />
                          ) : (
                            initialLetter
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-semibold transition-opacity">
                            <Camera className="w-3.5 h-3.5 mb-0.5 text-tartan-gold" />
                            <span>Edit</span>
                          </div>
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
                            {displayName}
                          </p>
                          {isCurrentUser && (
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                              🟢 You (Current Session)
                            </span>
                          )}
                          {user.role === 'developer' ? (
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Code2 className="w-3 h-3 text-purple-400" />
                              <span>Developer (Full Access)</span>
                            </span>
                          ) : user.role === 'owner' ? (
                            <span className="bg-amber-500/20 text-yellow-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Crown className="w-3 h-3 text-yellow-400" />
                              <span>Owner</span>
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
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1 flex-wrap">
                          <p className="flex items-center gap-1.5 text-gray-300">
                            <Mail className="w-3 h-3 text-gray-500" />
                            <span>{userEmail || 'No email attached'}</span>
                          </p>
                          <span>•</span>
                          <p>
                            Last active: <span className="text-gray-300 font-medium">{user.lastActive ? new Date(user.lastActive).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Active now'}</span>
                          </p>
                        </div>
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
                        onClick={() => handleOpenAvatarModal(user)}
                        className="p-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 border border-tartan-border text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Upload photo or set avatar image"
                      >
                        <Camera className="w-3.5 h-3.5 text-tartan-gold" />
                        <span>Avatar</span>
                      </button>

                      <button
                        onClick={() => setEditingUserId(isEditing ? null : user.id)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                          isEditing 
                            ? 'bg-tartan-gold text-tartan-dark border-tartan-gold font-bold shadow-md' 
                            : 'bg-tartan-navy hover:bg-slate-700 text-gray-300 border-tartan-border'
                        }`}
                        title="Expand module permissions drawer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-tartan-gold" />
                        <span>{isEditing ? 'Close' : 'Permissions'}</span>
                        {isEditing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {!isSpudPrimary ? (
                        <button
                          onClick={() => handleRemove(user)}
                          disabled={!isOwnerOrDev}
                          className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-800/60 transition-colors flex items-center gap-1 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {/* Expanding Module Permissions Drawer */}
                  {isEditing && (
                    <div className="pt-4 border-t border-tartan-border/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      
                      {/* Security Banner: If viewer is NOT Owner or Developer */}
                      {!isOwnerOrDev ? (
                        <div className="bg-amber-950/40 border border-amber-600/50 rounded-2xl p-3 flex items-center gap-3 text-amber-300 text-xs">
                          <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                          <div>
                            <p className="font-bold">Read-Only Permissions View</p>
                            <p className="text-[11px] text-amber-200/80">Only the Owner and Developer have authority to modify roles and module permissions.</p>
                          </div>
                        </div>
                      ) : (
                        /* Owner / Developer Toolbar */
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-tartan-dark/90 p-3.5 rounded-2xl border border-tartan-border">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-tartan-gold" />
                            <span className="text-xs font-bold text-white">Assigned Role:</span>
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeUserRole(user, e.target.value as UserRole)}
                              disabled={isSpudPrimary}
                              className="bg-tartan-card border border-tartan-border rounded-xl px-2.5 py-1 text-xs text-white font-semibold focus:outline-none focus:border-tartan-accent disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <option value="developer">Developer (Full Access - No Restrictions)</option>
                              <option value="owner">Owner (Primary Executive)</option>
                              <option value="admin">Administrator (Standard Admin)</option>
                              <option value="editor">Editor (Diary & Content Only)</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            <span className="text-gray-400 font-medium">Bulk Presets:</span>
                            <button
                              type="button"
                              onClick={() => handleSetAllModules(user, 'edit')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-semibold transition"
                            >
                              All Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetAllModules(user, 'view')}
                              className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-500/50 text-blue-300 font-semibold transition"
                            >
                              All View Only
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResetToRoleDefaults(user)}
                              className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 border border-tartan-border text-gray-300 font-semibold transition flex items-center gap-1"
                            >
                              <RefreshCw className="w-3 h-3 text-tartan-gold" />
                              <span>Reset to Role Defaults</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Grouped Modules Grid */}
                      <div className="space-y-3.5">
                        {moduleGroups.map((grp) => {
                          const userModulePerms = user.permissions?.modules || defaultPermissions[user.role]?.modules || {};
                          return (
                            <div key={grp.groupName} className="bg-tartan-dark/60 border border-tartan-border/70 rounded-2xl p-3.5 space-y-2.5">
                              <div className="flex items-center justify-between pb-1.5 border-b border-tartan-border/40">
                                <h4 className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-2">
                                  <span>{grp.groupName}</span>
                                  <span className="text-[10px] text-gray-400 normal-case font-normal">
                                    ({grp.modules.length} modules)
                                  </span>
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {grp.modules.map((mod) => {
                                  const modAccess: ModuleAccessLevel = userModulePerms[mod.id] || (user.role === 'developer' || user.role === 'owner' ? 'edit' : 'view');

                                  return (
                                    <div 
                                      key={mod.id}
                                      className="bg-tartan-card/90 border border-tartan-border/60 rounded-xl p-2.5 flex items-center justify-between gap-3"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-white truncate">{mod.label}</p>
                                        <p className="text-[10px] text-gray-400 line-clamp-1">{mod.description}</p>
                                      </div>

                                      {/* Segmented 3-button control: None | View | Edit */}
                                      <div className="inline-flex rounded-lg border border-slate-700/80 p-0.5 bg-slate-950/90 shrink-0 text-[10px]">
                                        <button
                                          type="button"
                                          disabled={!isOwnerOrDev}
                                          onClick={() => handleSetModuleAccess(user, mod.id, 'none')}
                                          className={`px-2 py-1 rounded font-semibold transition flex items-center gap-1 ${
                                            modAccess === 'none'
                                              ? 'bg-rose-900/90 text-rose-200 border border-rose-500/80 shadow-sm'
                                              : 'text-gray-400 hover:text-white disabled:hover:text-gray-400'
                                          } ${!isOwnerOrDev ? 'cursor-not-allowed opacity-60' : ''}`}
                                          title="Locked / No Access"
                                        >
                                          <Lock className="w-2.5 h-2.5" />
                                          <span>None</span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={!isOwnerOrDev}
                                          onClick={() => handleSetModuleAccess(user, mod.id, 'view')}
                                          className={`px-2 py-1 rounded font-semibold transition flex items-center gap-1 ${
                                            modAccess === 'view'
                                              ? 'bg-blue-900/90 text-blue-200 border border-blue-500/80 shadow-sm'
                                              : 'text-gray-400 hover:text-white disabled:hover:text-gray-400'
                                          } ${!isOwnerOrDev ? 'cursor-not-allowed opacity-60' : ''}`}
                                          title="View Only (Read Only)"
                                        >
                                          <Eye className="w-2.5 h-2.5" />
                                          <span>View</span>
                                        </button>
                                        <button
                                          type="button"
                                          disabled={!isOwnerOrDev}
                                          onClick={() => handleSetModuleAccess(user, mod.id, 'edit')}
                                          className={`px-2 py-1 rounded font-semibold transition flex items-center gap-1 ${
                                            modAccess === 'edit'
                                              ? 'bg-emerald-900/90 text-emerald-200 border border-emerald-500/80 shadow-sm'
                                              : 'text-gray-400 hover:text-white disabled:hover:text-gray-400'
                                          } ${!isOwnerOrDev ? 'cursor-not-allowed opacity-60' : ''}`}
                                          title="Full Edit Access"
                                        >
                                          <Check className="w-2.5 h-2.5" />
                                          <span>Edit</span>
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

      {/* Edit Avatar Modal */}
      {avatarModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-border rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-tartan-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-tartan-accent/20 border border-tartan-accent/40 text-tartan-gold flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Update Profile Avatar</h3>
                  <p className="text-[11px] text-gray-400">
                    {avatarModalUser.name || avatarModalUser.displayName || avatarModalUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAvatarModalUser(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Preview */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="w-24 h-24 rounded-2xl bg-tartan-dark border-2 border-tartan-gold/60 p-1 shadow-xl relative overflow-hidden flex items-center justify-center">
                {editAvatarUrl ? (
                  <img src={editAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-2xl font-bold text-tartan-gold">
                    {(avatarModalUser.name || avatarModalUser.displayName || avatarModalUser.email || 'A')[0].toUpperCase()}
                  </div>
                )}
                {avatarModalUser.isOnline && (
                  <span className="absolute bottom-2 right-2 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-tartan-card shadow" />
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {editAvatarUrl ? 'Live Cloud Avatar Preview' : 'Initials fallback displayed if no photo'}
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-3.5">
              <input
                type="file"
                ref={editAvatarFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleEditAvatarUpload}
              />
              <button
                type="button"
                onClick={() => editAvatarFileInputRef.current?.click()}
                disabled={isUploadingEditAvatar}
                className="w-full py-2.5 px-4 rounded-xl bg-tartan-navy hover:bg-slate-700 text-white border border-tartan-border text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                {isUploadingEditAvatar ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-tartan-gold" />
                    <span>Uploading Photo to Cloud...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-tartan-gold" />
                    <span>Upload Photo from Device / Take Selfie</span>
                  </>
                )}
              </button>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-gray-400">
                  Or Direct Image URL:
                </label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://... or /og-image.jpg"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                />
              </div>

              {/* Quick Tartan Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-tartan-gold uppercase tracking-wider block">
                  Quick Tartan Presets
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setEditAvatarUrl('/og-image.jpg')}
                    className="p-1.5 rounded-lg bg-tartan-dark/80 hover:bg-tartan-navy border border-tartan-border text-gray-300 font-medium truncate"
                  >
                    🏴󠁧󠁢󠁳󠁣󠁴󠁿 Spud Tartan
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAvatarUrl('/logo.png')}
                    className="p-1.5 rounded-lg bg-tartan-dark/80 hover:bg-tartan-navy border border-tartan-border text-gray-300 font-medium truncate"
                  >
                    🎵 Spud Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditAvatarUrl('')}
                    className="p-1.5 rounded-lg bg-tartan-dark/80 hover:bg-red-950/40 border border-tartan-border text-red-300 font-medium truncate"
                  >
                    ❌ Clear (Initials)
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-tartan-border">
              <button
                type="button"
                onClick={() => setAvatarModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isUploadingEditAvatar}
                className="px-4 py-2 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-extrabold shadow-lg hover:shadow-yellow-500/20 transition active:scale-95 disabled:opacity-50"
              >
                Save Avatar to Firestore
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
