'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  PoundSterling, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  Mail, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { BookingEvent } from '@/types/spud';

export const AdminDashboard: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { bookings, reviews, notifications, openBrevoPreview, approveBooking } = useApp();

  // Metrics
  const totalRevenue = bookings.reduce((sum, b) => b.status === 'deposit_paid' ? sum + b.estimatedPrice : sum, 0);
  const totalDeposits = bookings.reduce((sum, b) => b.status === 'deposit_paid' ? sum + b.depositAmount : sum, 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'deposit_paid');
  const pendingReviews = reviews.filter(r => r.status === 'pending');

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-tartan-card via-tartan-navy to-tartan-dark rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-accent/20 text-tartan-gold text-xs font-bold border border-tartan-accent/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spud the Piper Operations Hub</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
            Welcome Back, Spud!
          </h2>
          <p className="text-sm text-gray-300 max-w-xl">
            Here is your live overview of bookings, diary schedules, automated Brevo email dispatches, and incoming reviews.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onNavigateTab('bookings')}
            className="px-5 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>{pendingBookings.length} Pending Approvals</span>
          </button>
          <button
            onClick={() => onNavigateTab('diary')}
            className="px-5 py-3 rounded-xl bg-tartan-card hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-tartan-border flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-tartan-gold" />
            <span>Open Diary</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Booked Revenue */}
        <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pipeline Revenue</span>
            <div className="p-2 rounded-xl bg-green-950/80 text-green-400 border border-green-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-serif">
            £{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-green-400 flex items-center gap-1 font-semibold">
            <span>+18% from last month</span>
          </p>
        </div>

        {/* Deposits Collected via PayPal */}
        <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">PayPal Deposits Collected</span>
            <div className="p-2 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-tartan-gold font-serif">
            £{totalDeposits.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            {confirmedBookings.length} confirmed locked events
          </p>
        </div>

        {/* Pending Requests Requiring Approval */}
        <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Awaiting Spud\'s Approval</span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-yellow-400 border border-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-serif">
            {pendingBookings.length}
          </div>
          <button
            onClick={() => onNavigateTab('bookings')}
            className="text-[11px] text-tartan-gold font-bold hover:underline flex items-center gap-1"
          >
            <span>Review & Send Brevo Invoices →</span>
          </button>
        </div>

        {/* Customer Satisfaction & Reviews */}
        <div className="bg-tartan-card rounded-2xl p-6 border border-tartan-border shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Review Rating</span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-yellow-400 border border-amber-800">
              <Star className="w-4 h-4 fill-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-serif">
            5.0 <span className="text-sm font-normal text-gray-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-gray-400">
            {pendingReviews.length > 0 ? `${pendingReviews.length} new reviews to moderate` : 'All reviews up to date'}
          </p>
        </div>

      </div>

      {/* Two Column Layout: Urgent Action Queue & Upcoming Diary Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Pending Bookings Quick Approvals */}
        <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-serif">Pending Booking Inquiries</h3>
              <p className="text-xs text-gray-400">One-click approval dispatches official Brevo email + PayPal invoice</p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-tartan-gold hover:underline"
            >
              View All ({bookings.length})
            </button>
          </div>

          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="p-8 text-center bg-tartan-dark/60 rounded-2xl border border-tartan-border text-xs text-gray-400">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <span>All booking requests have been reviewed and approved!</span>
              </div>
            ) : (
              pendingBookings.map((bk: BookingEvent) => (
                <div
                  key={bk.id}
                  className="bg-tartan-dark rounded-2xl p-5 border border-tartan-border/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{bk.clientName}</h4>
                      <p className="text-xs text-tartan-gold font-serif">{bk.eventType}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-extrabold text-white">£{bk.estimatedPrice}</span>
                      <span className="text-[11px] text-gray-400 block">Deposit: £{bk.depositAmount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 bg-tartan-navy/60 p-2.5 rounded-xl border border-slate-800">
                    <div><span className="text-gray-500">Date:</span> <strong>{bk.date}</strong></div>
                    <div><span className="text-gray-500">Venue:</span> <strong>{bk.venueName}</strong></div>
                    <div><span className="text-gray-500">Attire:</span> <strong>{bk.tartanChoice.split(' ')[0]}</strong></div>
                    <div><span className="text-gray-500">Tel:</span> <strong>{bk.clientPhone}</strong></div>
                  </div>

                  {bk.notes && (
                    <p className="text-xs text-gray-400 italic bg-tartan-navy/30 p-2 rounded-lg">
                      &quot;{bk.notes}&quot;
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => approveBooking(bk.id)}
                      className="px-4 py-2 bg-gold-gradient text-tartan-dark font-extrabold text-xs rounded-xl shadow-md hover:brightness-110 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Send Brevo Email</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Upcoming Locked Diary Gigs */}
        <div className="lg:col-span-5 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-serif">Upcoming Diary Gigs</h3>
              <p className="text-xs text-gray-400">Confirmed with PayPal deposits</p>
            </div>
            <button
              onClick={() => onNavigateTab('diary')}
              className="text-xs font-bold text-tartan-gold hover:underline"
            >
              Open Calendar
            </button>
          </div>

          <div className="space-y-4">
            {confirmedBookings.slice(0, 4).map((bk: BookingEvent) => (
              <div
                key={bk.id}
                className="bg-tartan-dark p-4 rounded-2xl border border-green-800/60 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{bk.date}</span>
                    <span className="bg-green-950 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-800">
                      Deposit Paid
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-serif">{bk.clientName}</h4>
                  <p className="text-xs text-gray-300">{bk.venueName}</p>
                  <p className="text-[11px] text-tartan-gold">{bk.timeSlot} • {bk.tartanChoice}</p>
                </div>

                <button
                  onClick={() => openBrevoPreview(bk)}
                  className="p-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 border border-tartan-border"
                  title="View Confirmation Invoice"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick Stats Footnote */}
          <div className="bg-tartan-navy p-4 rounded-2xl border border-tartan-border text-xs text-gray-300 space-y-1">
            <span className="font-bold text-tartan-gold">Pro Tip for Spud:</span>
            <p>You can toggle "Visual Edit Mode" when viewing the main site to instantly edit headers, images, and alt tags with the pencil tool!</p>
          </div>
        </div>

      </div>

    </div>
  );
};
