'use client';

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { useApp } from '@/context/AppContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminDiary } from '@/components/admin/AdminDiary';
import { AdminBookings } from '@/components/admin/AdminBookings';
import { AdminCRM } from '@/components/admin/AdminCRM';
import { AdminMessageCenter } from '@/components/admin/AdminMessageCenter';
import { AdminReviews } from '@/components/admin/AdminReviews';
import { AdminFaqs } from '@/components/admin/AdminFaqs';
import { AdminForumControl } from '@/components/admin/AdminForumControl';
import { AdminSocialLinks } from '@/components/admin/AdminSocialLinks';
import { AdminServices } from '@/components/admin/AdminServices';
import { AdminTravelExpenses } from '@/components/admin/AdminTravelExpenses';
import { AdminMailingList } from '@/components/admin/AdminMailingList';
import { AdminSeoStudio } from '@/components/admin/AdminSeoStudio';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { AdminSecurityControl } from '@/components/admin/AdminSecurityControl';
import { AdminGuide } from '@/components/admin/AdminGuide';
import { AdminGallery } from '@/components/admin/AdminGallery';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { ShieldAlert, ArrowLeft, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Admin Panel Error Boundary caught an exception]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleClearCacheAndReload = () => {
    try {
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-tartan-dark flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-tartan-card border border-rose-600/50 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 flex items-center justify-center border border-rose-600/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-serif">Back Office Module Recovery</h2>
                <p className="text-xs text-rose-300">An unexpected component error occurred while rendering this module.</p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3.5 bg-black/60 border border-rose-900/60 rounded-xl font-mono text-[11px] text-rose-300 overflow-x-auto max-h-36">
                <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Dashboard</span>
              </button>
              <button
                onClick={this.handleClearCacheAndReload}
                className="py-3 px-5 bg-tartan-navy hover:bg-slate-700 text-gray-300 text-xs font-semibold rounded-xl border border-tartan-border flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AdminPage() {
  const { isAdminLoggedIn, isMounted } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (isMounted && !isAdminLoggedIn) {
      setIsLoginModalOpen(true);
    }
  }, [isMounted, isAdminLoggedIn]);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-tartan-dark flex flex-col items-center justify-center p-4 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-tartan-gold animate-spin" />
          <p className="text-xs text-tartan-gold font-medium tracking-wide">Loading Spud&apos;s Back Office...</p>
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-tartan-dark flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-tartan-accent/20 text-tartan-gold flex items-center justify-center mx-auto border border-tartan-accent/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif">Spud&apos;s Back Office Locked</h2>
          <p className="text-xs text-gray-300">
            Sign in with your Google account, admin email & password, or enter the passcode to access your diary, CRM, message center, and website controls.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 hover:shadow-yellow-500/20 transition-all active:scale-[0.99]"
            >
              <ShieldAlert className="w-4 h-4 text-tartan-dark" />
              <span>Sign In with Google or Email</span>
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
    <AdminErrorBoundary onReset={() => setActiveTab('dashboard')}>
      <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
        {activeTab === 'guide' && <AdminGuide onNavigateTab={setActiveTab} />}
        {activeTab === 'gallery' && <AdminGallery />}
        {activeTab === 'services' && <AdminServices />}
        {activeTab === 'travel-expenses' && <AdminTravelExpenses />}
        {activeTab === 'diary' && <AdminDiary />}
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'crm' && <AdminCRM />}
        {activeTab === 'mailing-list' && <AdminMailingList />}
        {activeTab === 'messages' && <AdminMessageCenter />}
        {activeTab === 'faqs' && <AdminFaqs />}
        {activeTab === 'forum' && <AdminForumControl />}
        {activeTab === 'social-links' && <AdminSocialLinks />}
        {activeTab === 'reviews' && <AdminReviews />}
        {activeTab === 'seo' && <AdminSeoStudio />}
        {activeTab === 'security' && <AdminSecurityControl />}
        {activeTab === 'notifications' && <AdminNotifications onNavigateTab={setActiveTab} />}
      </AdminLayout>
    </AdminErrorBoundary>
  );
}
