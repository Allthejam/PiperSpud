'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Check, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  Star, 
  Trash2, 
  Music,
  CheckCheck,
  ShieldCheck,
  Inbox,
  Filter
} from 'lucide-react';
import { NotificationItem } from '@/types/spud';

type NotifFilter = 'all' | 'unread' | 'bookings' | 'chat' | 'reviews' | 'system';

export const AdminNotifications: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { 
    notifications, 
    markNotifAsRead, 
    clearAllNotifs, 
    deleteNotification, 
    unreadNotifCount,
    testDeviceNotificationAlert,
    requestNotificationPermission
  } = useApp();
  const [activeFilter, setActiveFilter] = useState<NotifFilter>('all');

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotifAsRead(notif.id);
    if (notif.actionUrl?.includes('bookings')) onNavigateTab('bookings');
    else if (notif.actionUrl?.includes('messages')) onNavigateTab('messages');
    else if (notif.actionUrl?.includes('reviews')) onNavigateTab('reviews');
    else if (notif.actionUrl?.includes('diary')) onNavigateTab('diary');
    else if (notif.actionUrl?.includes('tunes')) onNavigateTab('tunes');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'bookings') return n.type === 'booking_request' || n.type === 'deposit_paid' || n.type === 'gig_reminder';
    if (activeFilter === 'chat') return n.type === 'chat_message';
    if (activeFilter === 'reviews') return n.type === 'new_review';
    if (activeFilter === 'system') return n.type === 'system' || n.type === 'tune_added';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-tartan-card/80 backdrop-blur border border-tartan-border/60 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-tartan-gold/15 border border-tartan-gold/30 flex items-center justify-center text-tartan-gold shadow">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-white font-serif tracking-wide">Notifications & Reminders</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Firestore Sync
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Real-time alerts for booking requests, PayPal deposits, live chat inquiries, and system events</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (requestNotificationPermission) {
                requestNotificationPermission().then(granted => {
                  if (granted) {
                    testDeviceNotificationAlert();
                  } else {
                    testDeviceNotificationAlert();
                  }
                });
              } else {
                testDeviceNotificationAlert();
              }
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-tartan-dark rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-1.5 transition"
            title="Test audio chime ping and mobile vibration"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Test Device Ping & Sound</span>
          </button>

          {unreadNotifCount > 0 && (
            <button
              onClick={clearAllNotifs}
              className="px-3.5 py-2 bg-tartan-navy hover:bg-slate-700 text-gray-200 rounded-xl text-xs font-bold border border-tartan-border flex items-center gap-1.5 shadow transition"
              title="Mark all notifications as read"
            >
              <CheckCheck className="w-4 h-4 text-tartan-gold" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Spud Notification Guard & Backup Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-tartan-navy to-indigo-950/60 p-4 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0 text-base">
            ✉️
          </span>
          <div>
            <span className="text-white font-bold block">Spud Fail-Safe Email Alerts (Brevo Active)</span>
            <span className="text-gray-300 text-[11px]">
              Incoming live chats, offline questions & bookings are delivered instantly to <strong className="text-purple-300">Spud@spudthepiper.com</strong> so you never miss an inquiry on iOS or mobile.
            </span>
          </div>
        </div>
        <button
          onClick={testDeviceNotificationAlert}
          className="px-3 py-1.5 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-500/40 text-purple-200 rounded-xl text-[11px] font-bold shrink-0 transition"
        >
          🔊 Ping Sound Test
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-tartan-dark/90 rounded-2xl border border-tartan-border/50">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeFilter === 'all'
              ? 'bg-tartan-gold text-tartan-dark shadow'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>All ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeFilter === 'unread'
              ? 'bg-tartan-gold text-tartan-dark shadow'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Unread ({unreadNotifCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('bookings')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeFilter === 'bookings'
              ? 'bg-tartan-gold text-tartan-dark shadow'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Bookings & Deposits</span>
        </button>

        <button
          onClick={() => setActiveFilter('chat')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeFilter === 'chat'
              ? 'bg-tartan-gold text-tartan-dark shadow'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat Inquiries</span>
        </button>

        <button
          onClick={() => setActiveFilter('reviews')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeFilter === 'reviews'
              ? 'bg-tartan-gold text-tartan-dark shadow'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Reviews</span>
        </button>

        <button
          onClick={() => setActiveFilter('system')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeFilter === 'system'
              ? 'bg-tartan-gold text-tartan-dark shadow'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>System & Tunes</span>
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-tartan-navy/60 border border-tartan-border/60 mx-auto flex items-center justify-center text-gray-500">
              <Inbox className="w-8 h-8 opacity-60" />
            </div>
            <h3 className="text-sm font-bold text-gray-300 font-serif">No notifications found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {activeFilter === 'unread' 
                ? 'All clear! You are caught up with all live alerts.'
                : 'Any new bookings, PayPal deposits, chat messages, or reviews will appear here instantly in real time.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            let Icon = Bell;
            let iconBg = 'bg-blue-950/80 text-blue-400 border-blue-800/80';
            let badgeText = 'Alert';

            if (notif.type === 'deposit_paid') {
              Icon = CreditCard;
              iconBg = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
              badgeText = 'Deposit Paid';
            } else if (notif.type === 'booking_request') {
              Icon = Calendar;
              iconBg = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
              badgeText = 'Booking Request';
            } else if (notif.type === 'chat_message') {
              Icon = MessageSquare;
              iconBg = 'bg-purple-950/80 text-purple-400 border-purple-800/80';
              badgeText = 'Chat Inquiry';
            } else if (notif.type === 'new_review') {
              Icon = Star;
              iconBg = 'bg-yellow-950/80 text-yellow-400 border-yellow-800/80';
              badgeText = 'New Review';
            } else if (notif.type === 'tune_added') {
              Icon = Music;
              iconBg = 'bg-indigo-950/80 text-indigo-400 border-indigo-800/80';
              badgeText = 'Jukebox Tune';
            } else if (notif.type === 'system') {
              Icon = ShieldCheck;
              iconBg = 'bg-slate-900 text-tartan-gold border-tartan-gold/40';
              badgeText = 'System';
            }

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-gradient-to-r from-tartan-navy/90 to-tartan-navy/60 border-tartan-gold/60 ring-1 ring-tartan-gold/30 shadow-lg hover:border-tartan-gold'
                    : 'bg-tartan-dark/70 border-tartan-border/60 hover:bg-tartan-navy/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${iconBg} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/40 text-gray-300 border border-white/10">
                        {badgeText}
                      </span>
                      <h4 className="text-sm font-bold text-white font-serif truncate">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-tartan-gold shrink-0 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed break-words">{notif.message}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{notif.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition border border-transparent hover:border-red-900/40"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-tartan-gold font-bold group-hover:underline hidden sm:inline-block">
                    View →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
