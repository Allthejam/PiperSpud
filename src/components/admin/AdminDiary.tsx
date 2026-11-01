'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Shirt, 
  Music, 
  Plus, 
  X, 
  CheckCircle2, 
  Mail, 
  CreditCard,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Info,
  CalendarCheck
} from 'lucide-react';
import { BookingEvent, BookingStatus, GoogleCalendarEvent } from '@/types/spud';
import { BookingDetailModal } from '@/components/admin/BookingDetailModal';
import { isEventOnDate } from '@/lib/icalParser';

export const AdminDiary: React.FC = () => {
  const { 
    bookings, 
    openBrevoPreview, 
    openPayPalModal, 
    createBooking,
    googleCalendarEvents,
    isGoogleCalendarLoading,
    lastGoogleCalendarSync,
    googleCalendarError,
    syncGoogleCalendar,
    isGoogleCalendarBlockEnabled,
    setIsGoogleCalendarBlockEnabled
  } = useApp();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [selectedGCalEvent, setSelectedGCalEvent] = useState<GoogleCalendarEvent | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isFeedCopied, setIsFeedCopied] = useState(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState(false);

  // New manual diary event form
  const [manualClient, setManualClient] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualDate, setManualDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  const [manualTime, setManualTime] = useState('14:00 - 17:00');
  const [manualVenue, setManualVenue] = useState('');
  const [manualPrice, setManualPrice] = useState(480);
  const [manualDeposit, setManualDeposit] = useState(100);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Calculate confirmed vs pending breakdown for the displayed month
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthEvents = (bookings || []).filter(b => b && b.date && b.date.startsWith(currentMonthPrefix));
  const confirmedCount = monthEvents.filter(b => b.status === 'deposit_paid').length;
  const pendingCount = monthEvents.filter(b => b.status === 'pending' || b.status === 'approved').length;
  const totalMonthEvents = monthEvents.length;

  // Google Calendar events in this month
  const monthGCalEvents = (googleCalendarEvents || []).filter(evt => {
    if (!evt || !evt.startDate) return false;
    return evt.startDate.startsWith(currentMonthPrefix) || (evt.endDate && evt.endDate.startsWith(currentMonthPrefix));
  });

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleCopyAndroidFeedLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.spudthepiper.com';
    const feedUrl = `${origin}/api/calendar/spud-diary.ics`;
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(feedUrl);
      setIsFeedCopied(true);
      setTimeout(() => setIsFeedCopied(false), 3000);
    }
  };

  const handleCreateManualEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClient || !manualVenue) return;

    createBooking({
      clientName: manualClient,
      clientEmail: manualEmail || 'client@example.scot',
      clientPhone: manualPhone || '07700 900000',
      eventType: 'Wedding Ceremony & Reception',
      date: manualDate,
      timeSlot: manualTime,
      venueName: manualVenue,
      venueAddress: manualVenue,
      venuePostcode: 'EH1 1AA',
      tartanChoice: 'Fraser Tartan (Traditional Clan Red)',
      estimatedPrice: Number(manualPrice),
      depositAmount: Number(manualDeposit),
      specialTunes: ['Highland Cathedral'],
      notes: 'Direct diary booking added by Spud'
    });

    setIsAddEventModalOpen(false);
    setManualClient('');
    setManualVenue('');
  };

  const handleConvertGCalToBooking = (gEvt: GoogleCalendarEvent) => {
    setManualClient(gEvt.summary || 'Google Calendar Event');
    setManualDate(gEvt.startDate);
    setManualTime(gEvt.startTime ? `${gEvt.startTime} - ${gEvt.endTime || 'End'}` : '13:00 - 16:00');
    setManualVenue(gEvt.location || 'Highland Location');
    setSelectedGCalEvent(null);
    setIsAddEventModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Diary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Spud&apos;s Interactive Diary</h2>
          <p className="text-xs text-gray-400">View and manage gigs, locked dates, and provisional holds</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => syncGoogleCalendar(true)}
            disabled={isGoogleCalendarLoading}
            className="px-3.5 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1.5 border border-sky-800/80 transition shadow"
            title="Refresh feed from Spud's Google Calendar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGoogleCalendarLoading ? 'animate-spin text-sky-400' : ''}`} />
            <span>{isGoogleCalendarLoading ? 'Syncing...' : 'Sync Google Calendar'}</span>
          </button>

          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs flex items-center gap-2 shadow-lg hover:brightness-110"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event to Diary</span>
          </button>
        </div>
      </div>

      {/* Google Calendar & Android Live Sync Bar */}
      <div className="bg-gradient-to-r from-sky-950/40 via-tartan-card to-tartan-dark/90 p-4 sm:p-5 rounded-3xl border border-sky-800/40 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-900/60 border border-sky-600/50 flex items-center justify-center shrink-0 shadow-inner">
              <CalendarCheck className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-sm font-bold text-white">
                  Google Calendar Active <span className="text-sky-300 font-medium text-xs">(spudthepiper@gmail.com)</span>
                </p>
              </div>
              <p className="text-xs text-gray-400">
                {googleCalendarEvents.length > 0 
                  ? `${googleCalendarEvents.length} calendar events synchronized in schedule window.` 
                  : 'Syncing with Google Calendar...'}
                {lastGoogleCalendarSync && (
                  <span className="text-[11px] text-gray-500 ml-1.5">
                    • Last updated: {new Date(lastGoogleCalendarSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-block toggle */}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-tartan-dark/80 border border-tartan-border cursor-pointer hover:border-sky-500/50 transition">
              <input
                type="checkbox"
                checked={isGoogleCalendarBlockEnabled}
                onChange={(e) => setIsGoogleCalendarBlockEnabled(e.target.checked)}
                className="w-3.5 h-3.5 accent-sky-400 rounded cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-gray-300">
                Block Public Bookings on GCal Events
              </span>
            </label>

            {/* Android / Google Calendar Sync Feed Link */}
            <button
              onClick={handleCopyAndroidFeedLink}
              className="px-3 py-1.5 rounded-xl bg-sky-900/50 hover:bg-sky-800/60 text-sky-200 border border-sky-700/60 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Copy iCal feed link to paste into Google Calendar"
            >
              {isFeedCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-300" />}
              <span>{isFeedCopied ? 'Link Copied!' : 'Copy Android Feed URL'}</span>
            </button>

            <button
              onClick={() => setShowAndroidInstructions(!showAndroidInstructions)}
              className="p-1.5 rounded-xl bg-tartan-dark hover:bg-tartan-navy text-gray-400 hover:text-white border border-tartan-border text-xs"
              title="How to sync with Android"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Android instructions dropdown */}
        {showAndroidInstructions && (
          <div className="p-3.5 rounded-2xl bg-tartan-dark/95 border border-sky-800/60 text-xs space-y-2 text-gray-300 animate-in fade-in-50">
            <div className="flex items-center justify-between text-sky-300 font-bold">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>How to auto-sync Website Bookings to Spud&apos;s Android Phone</span>
              </div>
              <button onClick={() => setShowAndroidInstructions(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <p className="text-[11px] leading-relaxed">
              Because Spud is on Android, adding the website subscription link once into his Google Calendar will sync every confirmed gig, client phone number, venue location, and tartan choice directly to his phone with Google Maps directions!
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300">
              <li>Open <strong className="text-sky-300">calendar.google.com</strong> on any computer or browser signed into <code className="text-tartan-gold">spudthepiper@gmail.com</code>.</li>
              <li>In the left sidebar, look for <strong>Other calendars</strong> and click the <strong>+ (Add other calendars)</strong> button.</li>
              <li>Select <strong>From URL</strong>.</li>
              <li>Paste the feed link: <code className="text-yellow-300 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">https://www.spudthepiper.com/api/calendar/spud-diary.ics</code> (or tap &apos;Copy Android Feed URL&apos; above).</li>
              <li>Click <strong>Add calendar</strong>. That&apos;s it! Every gig and wedding is now permanently linked to his Android phone!</li>
            </ol>
          </div>
        )}

        {googleCalendarError && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Google Calendar Sync Notice: {googleCalendarError}</span>
          </div>
        )}
      </div>

      {/* Main Calendar Grid Card */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
        
        {/* Month Navigation & Confirmed / Pending Breakdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-white font-serif">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            
            {/* Clear Status Breakdown Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-tartan-gold bg-tartan-navy px-3 py-1 rounded-full border border-tartan-accent/30">
                {totalMonthEvents} {totalMonthEvents === 1 ? 'Website Gig' : 'Website Gigs'}
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{confirmedCount} Confirmed</span>
              </span>
              {pendingCount > 0 && (
                <span className="text-xs font-bold text-yellow-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-yellow-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{pendingCount} Pending</span>
                </span>
              )}
              {monthGCalEvents.length > 0 && (
                <span className="text-xs font-bold text-sky-300 bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-800 flex items-center gap-1.5">
                  <span className="text-[10px]">🗓️</span>
                  <span>{monthGCalEvents.length} GCal Events</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-white border border-tartan-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-white border border-tartan-border"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400">
          <span>Sunday</span><span>Monday</span><span>Tuesday</span><span>Wednesday</span><span>Thursday</span><span>Friday</span><span>Saturday</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty prefix boxes */}
          {[...Array(firstDayIndex)].map((_, i) => (
            <div key={`empty-admin-${i}`} className="min-h-[105px] bg-tartan-dark/30 rounded-2xl border border-transparent"></div>
          ))}

          {/* Actual days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const monthFormatted = String(currentMonth + 1).padStart(2, '0');
            const dayFormatted = String(dayNum).padStart(2, '0');
            const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;

            const dayEvents = (bookings || []).filter(b => b && b.date === dateStr);
            const dayGCal = (googleCalendarEvents || []).filter(evt => isEventOnDate(evt, dateStr));

            const hasAnyEvents = dayEvents.length > 0 || dayGCal.length > 0;

            return (
              <div
                key={dayNum}
                className="min-h-[105px] bg-tartan-dark/70 rounded-2xl p-2 border border-tartan-border/50 flex flex-col justify-between hover:border-tartan-accent/40 transition-colors group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-300">{dayNum}</span>
                  {hasAnyEvents && (
                    <div className="flex items-center gap-1">
                      {dayEvents.length > 0 && <span className="w-2 h-2 rounded-full bg-tartan-gold"></span>}
                      {dayGCal.length > 0 && <span className="w-2 h-2 rounded-full bg-sky-400"></span>}
                    </div>
                  )}
                </div>

                {/* Day events badges */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-20 no-scrollbar">
                  
                  {/* Website Bookings */}
                  {dayEvents.map((evt) => {
                    const isPaid = evt.status === 'deposit_paid';
                    const isApproved = evt.status === 'approved';
                    const isPending = evt.status === 'pending';

                    let badgeColor = 'bg-blue-950 text-blue-200 border-blue-800';
                    let statusLabel = 'Hold';
                    if (isPaid) {
                      badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm';
                      statusLabel = '🔒 Paid';
                    } else if (isApproved) {
                      badgeColor = 'bg-blue-950 text-blue-300 border-blue-700';
                      statusLabel = '✉️ Due';
                    } else if (isPending) {
                      badgeColor = 'bg-amber-950 text-yellow-300 border-yellow-700';
                      statusLabel = '⏳ Hold';
                    }

                    return (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left p-1 rounded-lg text-[10px] font-bold border truncate block ${badgeColor} hover:brightness-125 transition`}
                        title={`Website Booking: ${evt.clientName} (${evt.status.replace('_', ' ')}) - ${evt.venueName}`}
                      >
                        {statusLabel}: {evt.clientName.split(' ')[0]}
                      </button>
                    );
                  })}

                  {/* Google Calendar Events */}
                  {dayGCal.map((gEvt) => (
                    <button
                      key={gEvt.id}
                      onClick={() => setSelectedGCalEvent(gEvt)}
                      className="w-full text-left p-1 rounded-lg text-[10px] font-semibold border truncate block bg-sky-950/70 text-sky-200 border-sky-700/60 hover:brightness-125 transition shadow-sm"
                      title={`Google Calendar: ${gEvt.summary}${gEvt.startTime ? ' at ' + gEvt.startTime : ''}${gEvt.location ? ' - ' + gEvt.location : ''}`}
                    >
                      <span className="text-sky-400 mr-1">🗓️</span>
                      {gEvt.startTime ? `${gEvt.startTime} ` : ''}{gEvt.summary}
                    </button>
                  ))}

                </div>

                <div className="text-right">
                  <button
                    onClick={() => {
                      setManualDate(dateStr);
                      setIsAddEventModalOpen(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-tartan-gold hover:underline font-semibold"
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Website Booking Full Details & Actions Modal */}
      {selectedEvent && (
        <BookingDetailModal
          booking={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Selected Google Calendar Event Modal */}
      {selectedGCalEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-sky-600/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-sky-950 to-tartan-navy px-6 py-4 border-b border-sky-700/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🗓️</span>
                <h3 className="text-base font-bold text-white font-serif">Google Calendar Event</h3>
              </div>
              <button onClick={() => setSelectedGCalEvent(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Event Title</p>
                <p className="text-sm font-extrabold text-white mt-0.5">{selectedGCalEvent.summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-tartan-dark/70 border border-tartan-border/60">
                <div>
                  <p className="text-gray-400 font-semibold">Date</p>
                  <p className="text-white font-bold">{selectedGCalEvent.startDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold">Time</p>
                  <p className="text-white font-bold">
                    {selectedGCalEvent.startTime 
                      ? `${selectedGCalEvent.startTime}${selectedGCalEvent.endTime ? ' - ' + selectedGCalEvent.endTime : ''}`
                      : 'All Day Event'}
                  </p>
                </div>
              </div>

              {selectedGCalEvent.location && (
                <div>
                  <p className="text-gray-400 font-semibold mb-1">Location / Venue</p>
                  <div className="flex items-start gap-2 p-3 rounded-2xl bg-tartan-dark/70 border border-tartan-border/60">
                    <MapPin className="w-4 h-4 text-tartan-gold shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-medium whitespace-pre-line">{selectedGCalEvent.location}</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedGCalEvent.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 mt-1 font-semibold"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {selectedGCalEvent.description && (
                <div>
                  <p className="text-gray-400 font-semibold mb-1">Notes / Description</p>
                  <div className="p-3 rounded-2xl bg-tartan-dark/70 border border-tartan-border/60 max-h-32 overflow-y-auto">
                    <p className="text-gray-200 whitespace-pre-line text-[11px] leading-relaxed">
                      {selectedGCalEvent.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-tartan-border/60">
                <button
                  type="button"
                  onClick={() => handleConvertGCalToBooking(selectedGCalEvent)}
                  className="px-3.5 py-2 rounded-xl bg-tartan-navy hover:bg-slate-700 text-tartan-gold font-bold text-xs flex items-center gap-1.5 border border-tartan-border"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Convert to Booking</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href="https://calendar.google.com/calendar/r"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-semibold text-xs flex items-center gap-1 border border-sky-700/60"
                  >
                    <span>Open GCal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedGCalEvent(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Event Modal */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-serif">Add Diary Booking</h3>
              <button onClick={() => setIsAddEventModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateManualEvent} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block text-tartan-gold font-semibold mb-1">Client / Couple Name *</label>
                <input
                  type="text"
                  required
                  value={manualClient}
                  onChange={(e) => setManualClient(e.target.value)}
                  placeholder="e.g. Isla & Bruce MacKay"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-tartan-gold font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-tartan-gold font-semibold mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="13:00 - 16:30"
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-tartan-gold font-semibold mb-1">Venue / Castle Location *</label>
                <input
                  type="text"
                  required
                  value={manualVenue}
                  onChange={(e) => setManualVenue(e.target.value)}
                  placeholder="e.g. Blair Castle, Perthshire"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-tartan-gold font-semibold mb-1">Total Fee (£)</label>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(Number(e.target.value))}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-tartan-gold font-semibold mb-1">Deposit (£)</label>
                  <input
                    type="number"
                    value={manualDeposit}
                    onChange={(e) => setManualDeposit(Number(e.target.value))}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-gray-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-gradient text-tartan-dark font-bold rounded-xl"
                >
                  Save to Diary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
