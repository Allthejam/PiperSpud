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
  CalendarCheck,
  Palmtree,
  Users,
  Briefcase,
  Bookmark,
  Trash2
} from 'lucide-react';
import { BookingEvent, BookingStatus, GoogleCalendarEvent, DiaryEntryType } from '@/types/spud';
import { BookingDetailModal } from '@/components/admin/BookingDetailModal';
import { isEventOnDate } from '@/lib/icalParser';

export const AdminDiary: React.FC = () => {
  const { 
    bookings, 
    createBooking,
    deleteBooking,
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
  
  // Selection modals
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [selectedGCalEvent, setSelectedGCalEvent] = useState<GoogleCalendarEvent | null>(null);
  const [selectedCustomEntry, setSelectedCustomEntry] = useState<BookingEvent | null>(null);

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isFeedCopied, setIsFeedCopied] = useState(false);
  const [showAndroidInstructions, setShowAndroidInstructions] = useState(false);

  // Active Category Filter for calendar grid
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | DiaryEntryType>('all');

  // Entry Modal State
  const [entryType, setEntryType] = useState<DiaryEntryType>('booking');
  const [manualTitle, setManualTitle] = useState('');
  const [manualClient, setManualClient] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualDate, setManualDate] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  const [manualEndDate, setManualEndDate] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [manualTime, setManualTime] = useState('14:00 - 17:00');
  const [manualVenue, setManualVenue] = useState('');
  const [manualPrice, setManualPrice] = useState(480);
  const [manualDeposit, setManualDeposit] = useState(100);
  const [manualNotes, setManualNotes] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Calculate confirmed vs pending breakdown for the displayed month
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  // Helper to test if a booking falls within a date (handling single day and multi-day end date)
  const isBookingOnDate = (b: BookingEvent, targetDate: string) => {
    if (!b || !b.date || b.status === 'cancelled') return false;
    const end = (b as any).endDate || b.date;
    return targetDate >= b.date && targetDate <= end;
  };

  const monthWebsiteEvents = (bookings || []).filter(b => {
    if (!b || !b.date || b.status === 'cancelled') return false;
    const end = (b as any).endDate || b.date;
    return b.date.startsWith(currentMonthPrefix) || end.startsWith(currentMonthPrefix);
  });

  const monthGCalEvents = (googleCalendarEvents || []).filter(evt => {
    if (!evt || !evt.startDate) return false;
    return evt.startDate.startsWith(currentMonthPrefix) || (evt.endDate && evt.endDate.startsWith(currentMonthPrefix));
  });

  // Breakdown metrics for the current month
  const bookingCount = monthWebsiteEvents.filter(b => !b.entryType || b.entryType === 'booking').length;
  const holidayCount = monthWebsiteEvents.filter(b => b.entryType === 'holiday').length + monthGCalEvents.filter(g => g.category === 'holiday').length;
  const familyCount = monthWebsiteEvents.filter(b => b.entryType === 'family').length + monthGCalEvents.filter(g => g.category === 'family').length;
  const otherCount = monthWebsiteEvents.filter(b => b.entryType === 'other').length + monthGCalEvents.filter(g => g.category === 'other').length;
  const totalEntriesCount = monthWebsiteEvents.length + monthGCalEvents.length;

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

  const handleOpenAddModal = (dateStr?: string, defaultType: DiaryEntryType = 'booking') => {
    setEntryType(defaultType);
    if (dateStr) {
      setManualDate(dateStr);
      setManualEndDate('');
    }
    setManualTitle('');
    setManualClient('');
    setManualVenue('');
    setManualNotes('');
    setIsAllDay(defaultType !== 'booking');
    setIsAddEventModalOpen(true);
  };

  const handleSaveDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();

    if (entryType === 'booking') {
      if (!manualClient || !manualVenue) return;
      createBooking({
        entryType: 'booking',
        clientName: manualClient,
        clientEmail: manualEmail || 'client@example.scot',
        clientPhone: manualPhone || '07700 900000',
        eventType: 'Wedding Ceremony & Reception',
        date: manualDate,
        timeSlot: isAllDay ? 'All Day' : manualTime,
        venueName: manualVenue,
        venueAddress: manualVenue,
        venuePostcode: 'EH1 1AA',
        tartanChoice: 'Fraser Tartan (Traditional Clan Red)',
        estimatedPrice: Number(manualPrice),
        depositAmount: Number(manualDeposit),
        specialTunes: ['Highland Cathedral'],
        notes: manualNotes || 'Direct diary booking added by Spud'
      });
    } else {
      // Holiday, Family, or Other
      const title = manualTitle || (
        entryType === 'holiday' ? 'Holiday / Time Off' :
        entryType === 'family' ? 'Family Event' : 'Personal Entry'
      );

      createBooking({
        entryType,
        clientName: title,
        clientEmail: 'spudthepiper@gmail.com',
        clientPhone: '07793 491367',
        eventType: entryType === 'holiday' ? 'Holiday / Vacation' : entryType === 'family' ? 'Family Commitment' : 'Personal Diary Entry',
        date: manualDate,
        ...(manualEndDate && manualEndDate >= manualDate ? { endDate: manualEndDate } : {}),
        timeSlot: isAllDay ? 'All Day' : manualTime,
        venueName: manualVenue || 'Private Location',
        venueAddress: manualVenue || 'Highlands',
        venuePostcode: 'PH22 1UJ',
        tartanChoice: 'Fraser Tartan (Traditional Clan Red)',
        estimatedPrice: 0,
        depositAmount: 0,
        specialTunes: [],
        notes: manualNotes || `${entryType.toUpperCase()} entry created in Back Office Diary.`
      } as any);
    }

    setIsAddEventModalOpen(false);
    setManualClient('');
    setManualTitle('');
    setManualVenue('');
    setManualNotes('');
  };

  const handleConvertGCalToBooking = (gEvt: GoogleCalendarEvent) => {
    setEntryType('booking');
    setManualClient(gEvt.summary || 'Google Calendar Event');
    setManualDate(gEvt.startDate);
    setManualTime(gEvt.startTime ? `${gEvt.startTime} - ${gEvt.endTime || 'End'}` : '13:00 - 16:00');
    setManualVenue(gEvt.location || 'Highland Location');
    setManualNotes(gEvt.description || '');
    setSelectedGCalEvent(null);
    setIsAddEventModalOpen(true);
  };

  const handleDeleteCustomEntry = (id: string) => {
    if (confirm('Are you sure you want to remove this entry from your diary?')) {
      deleteBooking(id);
      setSelectedCustomEntry(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Diary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Spud&apos;s Interactive Diary</h2>
          <p className="text-xs text-gray-400">Manage Bookings, Holidays, Family Events, and Google Calendar Sync</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => syncGoogleCalendar(true)}
            disabled={isGoogleCalendarLoading}
            className="px-3.5 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center gap-1.5 border border-sky-800/80 transition shadow"
            title="Refresh feed from Spud's Google Calendar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGoogleCalendarLoading ? 'animate-spin text-sky-400' : ''}`} />
            <span>{isGoogleCalendarLoading ? 'Syncing...' : 'Sync GCal'}</span>
          </button>

          <button
            onClick={() => handleOpenAddModal(undefined, 'booking')}
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

            {/* Android Feed URL */}
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
              Because Spud is on Android, adding the website subscription link into his Google Calendar will sync every confirmed gig, client phone number, venue location, and tartan choice directly to his phone with Google Maps directions!
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
            
            <span className="text-xs font-bold text-tartan-gold bg-tartan-navy px-3 py-1 rounded-full border border-tartan-accent/30">
              {totalEntriesCount} {totalEntriesCount === 1 ? 'Total Entry' : 'Total Entries'} this month
            </span>
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

        {/* Entry Type Filter Pills Bar */}
        <div className="flex items-center gap-2 flex-wrap border-y border-tartan-border/50 py-3">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-tartan-gold" /> Filter:
          </span>

          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeCategoryFilter === 'all'
                ? 'bg-gold-gradient text-tartan-dark border-yellow-400 shadow-md'
                : 'bg-tartan-dark hover:bg-tartan-navy text-gray-300 border-tartan-border'
            }`}
          >
            <span>All Types</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{totalEntriesCount}</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('booking')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeCategoryFilter === 'booking'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                : 'bg-tartan-dark hover:bg-tartan-navy text-emerald-300 border-emerald-900/60'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>Bookings</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{bookingCount}</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('holiday')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeCategoryFilter === 'holiday'
                ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                : 'bg-tartan-dark hover:bg-tartan-navy text-amber-300 border-amber-900/60'
            }`}
          >
            <Palmtree className="w-3 h-3" />
            <span>Holiday</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{holidayCount}</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('family')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeCategoryFilter === 'family'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                : 'bg-tartan-dark hover:bg-tartan-navy text-purple-300 border-purple-900/60'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Family</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{familyCount}</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('other')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              activeCategoryFilter === 'other'
                ? 'bg-teal-600 text-white border-teal-400 shadow-md'
                : 'bg-tartan-dark hover:bg-tartan-navy text-teal-300 border-teal-900/60'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>Other</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{otherCount}</span>
          </button>
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

            // Filter website events for this day
            const rawDayEvents = (bookings || []).filter(b => isBookingOnDate(b, dateStr));
            const dayEvents = rawDayEvents.filter(b => {
              if (activeCategoryFilter === 'all') return true;
              const type = b.entryType || 'booking';
              return type === activeCategoryFilter;
            });

            // Filter Google Calendar events for this day
            const rawDayGCal = (googleCalendarEvents || []).filter(evt => isEventOnDate(evt, dateStr));
            const dayGCal = rawDayGCal.filter(g => {
              if (activeCategoryFilter === 'all') return true;
              return (g.category || 'other') === activeCategoryFilter;
            });

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
                      {dayEvents.some(b => b.entryType === 'holiday') && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                      {dayEvents.some(b => b.entryType === 'family') && <span className="w-2 h-2 rounded-full bg-purple-400"></span>}
                      {dayEvents.some(b => !b.entryType || b.entryType === 'booking') && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
                      {dayGCal.length > 0 && <span className="w-2 h-2 rounded-full bg-sky-400"></span>}
                    </div>
                  )}
                </div>

                {/* Day events badges */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-20 no-scrollbar">
                  
                  {/* Website Entries (Bookings, Holiday, Family, Other) */}
                  {dayEvents.map((evt) => {
                    const type = evt.entryType || 'booking';

                    if (type === 'holiday') {
                      return (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedCustomEntry(evt)}
                          className="w-full text-left p-1 rounded-lg text-[10px] font-bold border truncate block bg-amber-950/80 text-amber-200 border-amber-600/70 hover:brightness-125 transition shadow-sm"
                          title={`Holiday: ${evt.clientName} - ${evt.venueName}`}
                        >
                          <span className="mr-1">🏖️</span>{evt.clientName}
                        </button>
                      );
                    }

                    if (type === 'family') {
                      return (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedCustomEntry(evt)}
                          className="w-full text-left p-1 rounded-lg text-[10px] font-bold border truncate block bg-purple-950/80 text-purple-200 border-purple-600/70 hover:brightness-125 transition shadow-sm"
                          title={`Family: ${evt.clientName} - ${evt.venueName}`}
                        >
                          <span className="mr-1">👨‍👩‍👧‍👦</span>{evt.clientName}
                        </button>
                      );
                    }

                    if (type === 'other') {
                      return (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedCustomEntry(evt)}
                          className="w-full text-left p-1 rounded-lg text-[10px] font-bold border truncate block bg-teal-950/80 text-teal-200 border-teal-600/70 hover:brightness-125 transition shadow-sm"
                          title={`Other: ${evt.clientName} - ${evt.venueName}`}
                        >
                          <span className="mr-1">📌</span>{evt.clientName}
                        </button>
                      );
                    }

                    // Standard Gig Booking
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
                  {dayGCal.map((gEvt) => {
                    let catIcon = '🗓️';
                    let catColor = 'bg-sky-950/70 text-sky-200 border-sky-700/60';
                    if (gEvt.category === 'holiday') {
                      catIcon = '🏖️';
                      catColor = 'bg-amber-950/70 text-amber-200 border-amber-700/60';
                    } else if (gEvt.category === 'family') {
                      catIcon = '👨‍👩‍👧‍👦';
                      catColor = 'bg-purple-950/70 text-purple-200 border-purple-700/60';
                    } else if (gEvt.category === 'booking') {
                      catIcon = '🎵';
                      catColor = 'bg-emerald-950/70 text-emerald-200 border-emerald-700/60';
                    }

                    return (
                      <button
                        key={gEvt.id}
                        onClick={() => setSelectedGCalEvent(gEvt)}
                        className={`w-full text-left p-1 rounded-lg text-[10px] font-semibold border truncate block hover:brightness-125 transition shadow-sm ${catColor}`}
                        title={`Google Calendar: ${gEvt.summary}${gEvt.startTime ? ' at ' + gEvt.startTime : ''}${gEvt.location ? ' - ' + gEvt.location : ''}`}
                      >
                        <span className="mr-1">{catIcon}</span>
                        {gEvt.startTime ? `${gEvt.startTime} ` : ''}{gEvt.summary}
                      </button>
                    );
                  })}

                </div>

                <div className="text-right">
                  <button
                    onClick={() => handleOpenAddModal(dateStr, 'booking')}
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

      {/* Selected Custom Entry Modal (Holiday / Family / Other) */}
      {selectedCustomEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              selectedCustomEntry.entryType === 'holiday' ? 'bg-amber-950 border-amber-800' :
              selectedCustomEntry.entryType === 'family' ? 'bg-purple-950 border-purple-800' :
              'bg-teal-950 border-teal-800'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedCustomEntry.entryType === 'holiday' ? '🏖️' : selectedCustomEntry.entryType === 'family' ? '👨‍👩‍👧‍👦' : '📌'}
                </span>
                <h3 className="text-base font-bold text-white font-serif">
                  {selectedCustomEntry.entryType === 'holiday' ? 'Holiday / Time Off' :
                   selectedCustomEntry.entryType === 'family' ? 'Family Event' : 'Personal Entry'}
                </h3>
              </div>
              <button onClick={() => setSelectedCustomEntry(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="text-[11px] font-bold text-tartan-gold uppercase tracking-wider">Entry Title</p>
                <p className="text-base font-extrabold text-white mt-0.5">{selectedCustomEntry.clientName}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-tartan-dark/70 border border-tartan-border/60">
                <div>
                  <p className="text-gray-400 font-semibold">Date</p>
                  <p className="text-white font-bold">
                    {selectedCustomEntry.date}
                    {(selectedCustomEntry as any).endDate && (selectedCustomEntry as any).endDate !== selectedCustomEntry.date && (
                      <span className="block text-[10px] text-gray-300">to {(selectedCustomEntry as any).endDate}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold">Timing</p>
                  <p className="text-white font-bold">{selectedCustomEntry.timeSlot || 'All Day'}</p>
                </div>
              </div>

              {selectedCustomEntry.venueName && selectedCustomEntry.venueName !== 'Private Location' && (
                <div>
                  <p className="text-gray-400 font-semibold mb-1">Location</p>
                  <div className="flex items-start gap-2 p-3 rounded-2xl bg-tartan-dark/70 border border-tartan-border/60">
                    <MapPin className="w-4 h-4 text-tartan-gold shrink-0 mt-0.5" />
                    <p className="text-white font-medium">{selectedCustomEntry.venueName}</p>
                  </div>
                </div>
              )}

              {selectedCustomEntry.notes && (
                <div>
                  <p className="text-gray-400 font-semibold mb-1">Notes</p>
                  <div className="p-3 rounded-2xl bg-tartan-dark/70 border border-tartan-border/60">
                    <p className="text-gray-200 whitespace-pre-line text-[11px]">{selectedCustomEntry.notes}</p>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>This date is blocked on the public booking calendar so clients cannot book.</span>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-tartan-border/60">
                <button
                  type="button"
                  onClick={() => handleDeleteCustomEntry(selectedCustomEntry.id)}
                  className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-800 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove from Diary</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCustomEntry(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
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

      {/* Add Diary Event Modal (Supporting Booking, Holiday, Family, Other) */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-tartan-card border border-tartan-accent/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-tartan-navy px-6 py-4 border-b border-tartan-border flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white font-serif">Add Entry to Spud&apos;s Diary</h3>
              <button onClick={() => setIsAddEventModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSaveDiaryEntry} className="p-6 space-y-4 text-xs overflow-y-auto">
              
              {/* Entry Type Selector Tabs */}
              <div>
                <label className="block text-tartan-gold font-semibold mb-1.5">
                  Choose Entry Category *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEntryType('booking')}
                    className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1 border transition ${
                      entryType === 'booking'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-tartan-dark hover:bg-tartan-navy text-gray-400 border-tartan-border'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>Booking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEntryType('holiday'); setIsAllDay(true); }}
                    className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1 border transition ${
                      entryType === 'holiday'
                        ? 'bg-amber-950 text-amber-300 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-tartan-dark hover:bg-tartan-navy text-gray-400 border-tartan-border'
                    }`}
                  >
                    <Palmtree className="w-4 h-4 text-amber-400" />
                    <span>Holiday</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEntryType('family'); setIsAllDay(true); }}
                    className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1 border transition ${
                      entryType === 'family'
                        ? 'bg-purple-950 text-purple-300 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-tartan-dark hover:bg-tartan-navy text-gray-400 border-tartan-border'
                    }`}
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Family</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEntryType('other'); setIsAllDay(true); }}
                    className={`py-2 px-2 rounded-xl font-bold text-xs flex flex-col items-center gap-1 border transition ${
                      entryType === 'other'
                        ? 'bg-teal-950 text-teal-300 border-teal-500 ring-2 ring-teal-500/30'
                        : 'bg-tartan-dark hover:bg-tartan-navy text-gray-400 border-tartan-border'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 text-teal-400" />
                    <span>Other</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Form Fields based on Type */}
              {entryType === 'booking' ? (
                <>
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
                </>
              ) : (
                /* Holiday / Family / Other Form */
                <>
                  <div>
                    <label className="block text-tartan-gold font-semibold mb-1">
                      {entryType === 'holiday' ? 'Holiday Title / Destination *' :
                       entryType === 'family' ? 'Family Event / Reason *' : 'Entry Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder={
                        entryType === 'holiday' ? 'e.g. Summer Vacation in Skye' :
                        entryType === 'family' ? "e.g. Daughter's Birthday Celebration" :
                        'e.g. Bagpipes Chanter Maintenance & Practice'
                      }
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-tartan-gold font-semibold mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-tartan-gold font-semibold mb-1">
                        End Date <span className="text-gray-400 font-normal">(Optional for multi-day)</span>
                      </label>
                      <input
                        type="date"
                        value={manualEndDate}
                        min={manualDate}
                        onChange={(e) => setManualEndDate(e.target.value)}
                        className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                      <input
                        type="checkbox"
                        checked={isAllDay}
                        onChange={(e) => setIsAllDay(e.target.checked)}
                        className="w-3.5 h-3.5 accent-tartan-accent rounded"
                      />
                      <span>All Day Event</span>
                    </label>

                    {!isAllDay && (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={manualTime}
                          onChange={(e) => setManualTime(e.target.value)}
                          placeholder="e.g. 10:00 - 14:00"
                          className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-1.5 text-white"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-tartan-gold font-semibold mb-1">Location / Details</label>
                    <input
                      type="text"
                      value={manualVenue}
                      onChange={(e) => setManualVenue(e.target.value)}
                      placeholder="e.g. Aviemore / Edinburgh / Private"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}

              {/* Common Notes field */}
              <div>
                <label className="block text-tartan-gold font-semibold mb-1">Personal Notes / Reminder</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Additional notes for Spud's diary..."
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white text-xs resize-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  This date will automatically sync to Spud&apos;s Android phone and block out the public booking form.
                </span>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gold-gradient text-tartan-dark font-bold rounded-xl shadow hover:brightness-110"
                >
                  Save Entry
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
