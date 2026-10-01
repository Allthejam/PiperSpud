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
  Filter
} from 'lucide-react';
import { BookingEvent, BookingStatus } from '@/types/spud';
import { BookingDetailModal } from '@/components/admin/BookingDetailModal';

export const AdminDiary: React.FC = () => {
  const { bookings, openBrevoPreview, openPayPalModal, createBooking } = useApp();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // New manual diary event form
  const [manualClient, setManualClient] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualDate, setManualDate] = useState('2026-10-31');
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
      tartanChoice: 'Full No. 1 Dress (Feather Bonnet & Plaid)',
      estimatedPrice: Number(manualPrice),
      depositAmount: Number(manualDeposit),
      specialTunes: ['Highland Cathedral'],
      notes: 'Direct diary booking added by Spud'
    });

    setIsAddEventModalOpen(false);
    setManualClient('');
    setManualVenue('');
  };

  return (
    <div className="space-y-6">
      
      {/* Diary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-serif">Spud\'s Interactive Diary</h2>
          <p className="text-xs text-gray-400">View and manage gigs, locked dates, and provisional holds</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs flex items-center gap-2 shadow-lg hover:brightness-110"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event to Diary</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Grid Card */}
      <div className="bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-border shadow-2xl space-y-6">
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white font-serif">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <span className="text-xs font-bold text-tartan-gold bg-tartan-navy px-3 py-1 rounded-full border border-tartan-accent/30">
              {bookings.filter(b => b.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length} Gigs this month
            </span>
          </div>

          <div className="flex items-center gap-2">
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
            <div key={`empty-admin-${i}`} className="min-h-[100px] bg-tartan-dark/30 rounded-2xl border border-transparent"></div>
          ))}

          {/* Actual days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const monthFormatted = String(currentMonth + 1).padStart(2, '0');
            const dayFormatted = String(dayNum).padStart(2, '0');
            const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;

            const dayEvents = bookings.filter(b => b.date === dateStr);

            return (
              <div
                key={dayNum}
                className="min-h-[100px] bg-tartan-dark/70 rounded-2xl p-2 border border-tartan-border/50 flex flex-col justify-between hover:border-tartan-accent/40 transition-colors group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-300">{dayNum}</span>
                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-tartan-gold"></span>
                  )}
                </div>

                {/* Day events badges */}
                <div className="space-y-1 mt-1 overflow-y-auto max-h-16 no-scrollbar">
                  {dayEvents.map((evt) => {
                    const isPaid = evt.status === 'deposit_paid';
                    const isApproved = evt.status === 'approved';
                    const isPending = evt.status === 'pending';

                    let badgeColor = 'bg-blue-950 text-blue-200 border-blue-800';
                    if (isPaid) badgeColor = 'bg-green-950 text-green-300 border-green-800';
                    if (isApproved) badgeColor = 'bg-indigo-950 text-indigo-300 border-indigo-800';
                    if (isPending) badgeColor = 'bg-amber-950 text-yellow-300 border-yellow-800';

                    return (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`w-full text-left p-1 rounded-lg text-[10px] font-bold border truncate block ${badgeColor} hover:brightness-125`}
                        title={`${evt.clientName} - ${evt.venueName}`}
                      >
                        {evt.clientName.split(' ')[0]} ({evt.venueName.slice(0, 10)}...)
                      </button>
                    );
                  })}
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

      {/* Selected Event Full Details & Actions Modal */}
      {selectedEvent && (
        <BookingDetailModal
          booking={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
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
