'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminDiary } from '@/components/admin/AdminDiary';
import { AdminBookings } from '@/components/admin/AdminBookings';
import { AdminCRM } from '@/components/admin/AdminCRM';
import { AdminMessageCenter } from '@/components/admin/AdminMessageCenter';
import { AdminReviews } from '@/components/admin/AdminReviews';
import { AdminForumControl } from '@/components/admin/AdminForumControl';
import { AdminSocialLinks } from '@/components/admin/AdminSocialLinks';
import { AdminSeoStudio } from '@/components/admin/AdminSeoStudio';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const { isAdminLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      setIsLoginModalOpen(true);
    }
  }, [isAdminLoggedIn]);

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-tartan-dark flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-tartan-accent/20 text-tartan-gold flex items-center justify-center mx-auto border border-tartan-accent/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif">Spud\'s Back Office Locked</h2>
          <p className="text-xs text-gray-300">
            Please log in with the admin passcode to access your diary, client list, Brevo email dispatcher, and SEO tools.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
            >
              Enter Admin Passcode (spud123)
            </button>
            <a
              href="/"
              className="w-full py-3 bg-tartan-navy hover:bg-slate-700 text-gray-300 text-xs font-semibold rounded-xl border border-tartan-border flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </a>
          </div>
        </div>
        <AdminLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </div>
    );
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
      {activeTab === 'diary' && <AdminDiary />}
      {activeTab === 'bookings' && <AdminBookings />}
      {activeTab === 'crm' && <AdminCRM />}
      {activeTab === 'messages' && <AdminMessageCenter />}
      {activeTab === 'forum' && <AdminForumControl />}
      {activeTab === 'social-links' && <AdminSocialLinks />}
      {activeTab === 'reviews' && <AdminReviews />}
      {activeTab === 'seo' && <AdminSeoStudio />}
      {activeTab === 'notifications' && <AdminNotifications onNavigateTab={setActiveTab} />}
    </AdminLayout>
  );
}
