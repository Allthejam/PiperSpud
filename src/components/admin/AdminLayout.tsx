'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpenCheck, 
  Users, 
  MessageSquare, 
  Star, 
  Bell, 
  Search, 
  ExternalLink, 
  LogOut, 
  Sparkles,
  Edit3,
  Menu,
  X,
  CreditCard,
  Mail,
  Share2
} from 'lucide-react';
import { BrevoEmailModal } from './BrevoEmailModal';
import { PayPalCheckoutModal } from './PayPalCheckoutModal';

interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const { 
    isAdminLoggedIn, 
    logoutAdmin, 
    unreadNotifCount, 
    unreadChatCount,
    isVisualEditMode,
    toggleVisualEditMode,
    activeBrevoEmail,
    closeBrevoPreview,
    activePayPalModal,
    closePayPalModal
  } = useApp();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'diary', label: 'Interactive Diary', icon: Calendar },
    { id: 'bookings', label: 'Booking Approvals & Deposits', icon: BookOpenCheck, badgeCount: 0 },
    { id: 'crm', label: 'Client CRM', icon: Users },
    { id: 'messages', label: 'Message Center', icon: MessageSquare, badgeCount: unreadChatCount },
    { id: 'forum', label: 'Forum & Category Control', icon: MessageSquare },
    { id: 'social-links', label: 'Social Media Links', icon: Share2 },
    { id: 'reviews', label: 'Review Moderation', icon: Star },
    { id: 'seo', label: 'SEO & Meta Studio', icon: Search },
    { id: 'notifications', label: 'Notification Center', icon: Bell, badgeCount: unreadNotifCount },
  ];

  return (
    <div className="min-h-screen bg-tartan-dark text-gray-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="bg-tartan-card border-b border-tartan-border/80 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 rounded-lg lg:hidden bg-tartan-navy text-gray-300 hover:text-white"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-tartan-accent to-amber-700 flex items-center justify-center text-tartan-dark font-serif font-extrabold text-base shadow-md">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white font-serif uppercase tracking-tight">
                  Spud The Piper
                </h1>
                <span className="bg-tartan-accent/20 text-tartan-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-tartan-accent/40">
                  Back Office
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Events Diary, CRM & Automation Control</p>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* View Main Site Tab with Pencil Edit Switch */}
          <a
            href="/"
            className="px-3 py-1.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-tartan-goldLight text-xs font-bold border border-tartan-border flex items-center gap-1.5 transition-all shadow-sm"
            title="Return to Public Website to test In-Page Visual Pencil Editing"
          >
            <ExternalLink className="w-3.5 h-3.5 text-tartan-gold" />
            <span className="hidden sm:inline">View Public Website & Visual Edit</span>
          </a>

          {/* Notifications Bell */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 relative border border-tartan-border transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-tartan-gold" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={() => {
              logoutAdmin();
              window.location.href = '/';
            }}
            className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Layout Main Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Desktop Sidebar Navigation */}
        <aside className={`w-64 bg-tartan-card/95 border-r border-tartan-border/80 flex flex-col justify-between p-4 shrink-0 transition-all z-30 ${
          isMobileNavOpen ? 'fixed inset-y-0 left-0 top-16 block' : 'hidden lg:flex'
        }`}>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-tartan-gold px-3 mb-2">
              Management Modules
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-gold-gradient text-tartan-dark shadow-md font-bold'
                      : 'text-gray-300 hover:bg-tartan-navy hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-tartan-dark' : 'text-tartan-gold'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-tartan-dark text-tartan-gold' : 'bg-red-600 text-white'
                    }`}>
                      {item.badgeCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Quick Automation Status Widget */}
          <div className="bg-tartan-navy rounded-2xl p-3.5 border border-tartan-border space-y-2 text-[11px]">
            <p className="font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automations Active</span>
            </p>
            <div className="space-y-1.5 text-gray-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-400" /> Brevo Email:</span>
                <span className="text-green-400 font-bold">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-yellow-400" /> PayPal Webhook:</span>
                <span className="text-green-400 font-bold">Listening</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-tartan-dark/70">
          {children}
        </main>
      </div>

      {/* Interactive Brevo Email Preview Modal */}
      {activeBrevoEmail?.isOpen && activeBrevoEmail.booking && (
        <BrevoEmailModal
          isOpen={activeBrevoEmail.isOpen}
          onClose={closeBrevoPreview}
          booking={activeBrevoEmail.booking}
          paypalLink={activeBrevoEmail.paypalLink}
        />
      )}

      {/* Interactive PayPal Checkout Modal */}
      {activePayPalModal?.isOpen && activePayPalModal.booking && (
        <PayPalCheckoutModal
          isOpen={activePayPalModal.isOpen}
          onClose={closePayPalModal}
          booking={activePayPalModal.booking}
        />
      )}

    </div>
  );
};
