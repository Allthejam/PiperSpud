'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Check, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  Star, 
  Trash2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { NotificationItem } from '@/types/spud';

export const AdminNotifications: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { notifications, markNotifAsRead, clearAllNotifs, unreadNotifCount } = useApp();

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotifAsRead(notif.id);
    if (notif.actionUrl?.includes('bookings')) onNavigateTab('bookings');
    else if (notif.actionUrl?.includes('messages')) onNavigateTab('messages');
    else if (notif.actionUrl?.includes('reviews')) onNavigateTab('reviews');
    else if (notif.actionUrl?.includes('diary')) onNavigateTab('diary');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-tartan-gold" />
            <h2 className="text-2xl font-bold text-white font-serif">Notifications & Event Reminders</h2>
          </div>
          <p className="text-xs text-gray-400">Real-time alerts for booking requests, PayPal deposits, chat inquiries, and gig countdowns</p>
        </div>

        {unreadNotifCount > 0 && (
          <button
            onClick={clearAllNotifs}
            className="px-4 py-2 bg-tartan-card hover:bg-slate-700 text-gray-200 rounded-xl text-xs font-bold border border-tartan-border flex items-center gap-1.5 shadow"
          >
            <Check className="w-4 h-4 text-green-400" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-4">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No notifications at this time.
          </div>
        ) : (
          notifications.map((notif) => {
            let Icon = Bell;
            let iconBg = 'bg-blue-950 text-blue-400 border-blue-800';

            if (notif.type === 'deposit_paid') {
              Icon = CreditCard;
              iconBg = 'bg-green-950 text-green-400 border-green-800';
            } else if (notif.type === 'booking_request') {
              Icon = Calendar;
              iconBg = 'bg-amber-950 text-yellow-400 border-amber-800';
            } else if (notif.type === 'chat_message') {
              Icon = MessageSquare;
              iconBg = 'bg-purple-950 text-purple-400 border-purple-800';
            } else if (notif.type === 'new_review') {
              Icon = Star;
              iconBg = 'bg-yellow-950 text-yellow-400 border-yellow-800';
            }

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-tartan-navy/90 border-tartan-gold/60 ring-1 ring-tartan-gold/30 shadow-md'
                    : 'bg-tartan-dark/70 border-tartan-border/60 hover:bg-tartan-navy/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-serif">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-tartan-gold"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{notif.timestamp}</p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <span className="text-xs text-tartan-gold font-bold hover:underline">
                    Inspect →
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
