'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Shirt, 
  Music, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Mail, 
  Send,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { EventType, HighlandDressOption } from '@/types/spud';

export const BookingCalendar: React.FC = () => {
  const { bookings, createBooking, tunesList } = useApp();

  // Calendar view state (Current month: September/October 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-24');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('13:30 - 16:30');
  
  // Form fields
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventType, setEventType] = useState<EventType>('Wedding Ceremony & Reception');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venuePostcode, setVenuePostcode] = useState('');
  const [tartanChoice, setTartanChoice] = useState<HighlandDressOption>('Full No. 1 Dress (Feather Bonnet & Plaid)');
  const [selectedTunes, setSelectedTunes] = useState<string[]>(['Highland Cathedral', 'Scotland the Brave']);
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Pricing calculator
  const pricingMatrix: { [key in EventType]: { base: number; deposit: number } } = {
    'Wedding Ceremony & Reception': { base: 480, deposit: 100 },
    'Wedding Ceremony Only': { base: 320, deposit: 80 },
    'Funeral / Memorial Service': { base: 220, deposit: 50 },
    'Burns Supper / Hogmanay': { base: 450, deposit: 100 },
    'Corporate / Castle Event': { base: 550, deposit: 150 },
    'Birthday / Private Party': { base: 350, deposit: 80 },
    'Highland Bagpipe Experience (Hands-On Workshop / Airbnb)': { base: 280, deposit: 60 },
    'Bagpipe Tuition / Lesson': { base: 60, deposit: 20 },
  };

  const estimatedPrice = pricingMatrix[eventType]?.base || 450;
  const depositAmount = pricingMatrix[eventType]?.deposit || 100;

  // Calendar day generator
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateBooked = (dateStr: string) => {
    return bookings.some(b => b.date === dateStr && (b.status === 'deposit_paid' || b.status === 'approved'));
  };

  const isDatePending = (dateStr: string) => {
    return bookings.some(b => b.date === dateStr && b.status === 'pending');
  };

  const handleTuneToggle = (tuneTitle: string) => {
    if (selectedTunes.includes(tuneTitle)) {
      setSelectedTunes(selectedTunes.filter(t => t !== tuneTitle));
    } else {
      setSelectedTunes([...selectedTunes, tuneTitle]);
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone || !venueName) {
      alert('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newBk = createBooking({
        clientName,
        clientEmail,
        clientPhone,
        eventType,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        venueName,
        venueAddress: venueAddress || venueName,
        venuePostcode: venuePostcode || 'EH1 1AA',
        tartanChoice,
        estimatedPrice,
        depositAmount,
        specialTunes: selectedTunes,
        notes
      });

      setIsSubmitting(false);
      setBookingSuccess(newBk);
    }, 600);
  };

  return (
    <section id="booking" className="py-20 bg-tartan-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
            <CalendarIcon className="w-4 h-4" />
            <span>Interactive Availability & Diary</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
            Check Live Dates & Request a Provisional Booking
          </h2>
          <p className="text-base text-gray-300">
            Select an open date on Spud\'s diary below to reserve your slot. Once submitted, Spud will review your booking and an official Brevo confirmation email with a secure PayPal deposit link will be sent to you.
          </p>
        </div>

        {bookingSuccess ? (
          /* Confirmation Message Card */
          <div className="max-w-2xl mx-auto bg-tartan-card rounded-3xl p-8 border border-tartan-gold text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-green-900/60 text-green-400 border border-green-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white font-serif">Provisional Booking Requested!</h3>
              <p className="text-sm text-gray-300">
                Thank you, <strong className="text-tartan-gold">{bookingSuccess.clientName}</strong>. Your request for <strong className="text-white">{bookingSuccess.eventType}</strong> on <strong className="text-tartan-gold">{bookingSuccess.date}</strong> at <strong className="text-white">{bookingSuccess.venueName}</strong> has been sent directly to Spud the Piper.
              </p>
            </div>

            {/* Workflow Step Explanation */}
            <div className="bg-tartan-navy/80 rounded-2xl p-5 border border-tartan-border text-left space-y-3 text-xs">
              <h4 className="font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Next Automated Steps:</span>
              </h4>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-tartan-accent text-tartan-dark font-bold flex items-center justify-center shrink-0">1</div>
                <p className="text-gray-200">Spud reviews the diary details and approves your slot in his Back Office.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-tartan-accent text-tartan-dark font-bold flex items-center justify-center shrink-0">2</div>
                <p className="text-gray-200">
                  You will receive an official <strong className="text-white">Brevo email</strong> containing your confirmed booking summary and a secure <strong className="text-white">PayPal link</strong> to pay the £{bookingSuccess.depositAmount} deposit.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-tartan-accent text-tartan-dark font-bold flex items-center justify-center shrink-0">3</div>
                <p className="text-gray-200">Upon deposit payment, your date is locked in the diary and full receipts are delivered.</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBookingSuccess(null)}
                className="px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110"
              >
                Book Another Date
              </button>
            </div>
          </div>
        ) : (
          /* Two Column Layout: Calendar on Left, Booking Form on Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive Calendar */}
            <div className="lg:col-span-5 bg-tartan-card rounded-3xl p-6 border border-tartan-accent/40 shadow-2xl space-y-6">
              
              {/* Calendar Month Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <p className="text-xs text-tartan-gold">Select a vacant date to start</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-300 border border-tartan-border"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-300 border border-tartan-border"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty padding days */}
                {[...Array(firstDayIndex)].map((_, i) => (
                  <div key={`empty-${i}`} className="h-10"></div>
                ))}

                {/* Days of Month */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const dayNum = i + 1;
                  const monthFormatted = String(currentMonth + 1).padStart(2, '0');
                  const dayFormatted = String(dayNum).padStart(2, '0');
                  const dateString = `${currentYear}-${monthFormatted}-${dayFormatted}`;

                  const booked = isDateBooked(dateString);
                  const pending = isDatePending(dateString);
                  const isSelected = selectedDate === dateString;

                  let btnStyle = 'bg-tartan-navy/60 text-gray-200 hover:bg-tartan-accent/20 border border-tartan-border/40';
                  if (booked) {
                    btnStyle = 'bg-red-950/70 text-red-300 border border-red-800 cursor-not-allowed opacity-75';
                  } else if (pending) {
                    btnStyle = 'bg-amber-950/70 text-yellow-300 border border-yellow-800';
                  } else if (isSelected) {
                    btnStyle = 'bg-tartan-gold text-tartan-dark font-extrabold ring-2 ring-yellow-300 shadow-md';
                  }

                  return (
                    <button
                      key={dayNum}
                      disabled={booked}
                      onClick={() => !booked && setSelectedDate(dateString)}
                      className={`h-10 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all relative ${btnStyle}`}
                      title={booked ? 'Already Booked' : pending ? 'Provisional Request Pending' : 'Vacant Slot'}
                    >
                      <span>{dayNum}</span>
                      {booked && <span className="w-1 h-1 rounded-full bg-red-400 mt-0.5"></span>}
                      {pending && <span className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5"></span>}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-tartan-border/60 flex items-center justify-between text-[11px] text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-tartan-gold"></span>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-tartan-navy border border-tartan-border"></span>
                  <span>Vacant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span>Pending</span>
                </div>
              </div>

              {/* Live Slot Summary */}
              <div className="bg-tartan-navy rounded-2xl p-4 border border-tartan-border space-y-2">
                <p className="text-xs text-tartan-gold font-bold uppercase tracking-wider">Currently Chosen Date:</p>
                <div className="flex items-center justify-between text-sm font-bold text-white">
                  <span>{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Right: Booking Form & Instant Estimator */}
            <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl">
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                
                {/* Pricing & Deposit Pill Banner */}
                <div className="bg-gradient-to-r from-tartan-navy to-tartan-dark p-4 rounded-2xl border border-tartan-border flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-xs text-gray-400">Instant Estimate:</span>
                    <div className="text-2xl font-extrabold text-white font-serif">
                      £{estimatedPrice} <span className="text-xs font-normal text-tartan-gold">Total</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Required Deposit:</span>
                    <div className="text-lg font-bold text-tartan-gold">
                      £{depositAmount} <span className="text-[10px] text-gray-300">(via PayPal upon approval)</span>
                    </div>
                  </div>
                </div>

                {/* Form Row 1: Event Type & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Event / Occasion Type *
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-tartan-accent"
                    >
                      <option value="Wedding Ceremony & Reception">Wedding Ceremony & Reception</option>
                      <option value="Wedding Ceremony Only">Wedding Ceremony Only</option>
                      <option value="Highland Bagpipe Experience (Hands-On Workshop / Airbnb)">Highland Bagpipe Experience (Hands-On Workshop / Airbnb)</option>
                      <option value="Funeral / Memorial Service">Funeral / Memorial Service</option>
                      <option value="Burns Supper / Hogmanay">Burns Supper / Hogmanay</option>
                      <option value="Corporate / Castle Event">Corporate / Castle Event</option>
                      <option value="Birthday / Private Party">Birthday / Private Party</option>
                      <option value="Bagpipe Tuition / Lesson">Bagpipe Tuition / Lesson</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Preferred Time Slot *
                    </label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-tartan-accent"
                    >
                      <option value="12:00 - 15:00 (Afternoon Ceremony)">12:00 - 15:00 (Afternoon Ceremony)</option>
                      <option value="13:30 - 17:00 (Ceremony & Drinks)">13:30 - 17:00 (Ceremony & Drinks)</option>
                      <option value="17:30 - 21:30 (Evening Reception / Banquet)">17:30 - 21:30 (Evening Reception / Banquet)</option>
                      <option value="Full Day Highland Package (12:00 - 22:00)">Full Day Highland Package (12:00 - 22:00)</option>
                      <option value="Morning Memorial / Funeral (10:00 - 12:30)">Morning Memorial / Funeral (10:00 - 12:30)</option>
                    </select>
                  </div>
                </div>

                {/* Form Row 2: Client Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Fiona MacLeod"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="fiona@example.scot"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="07798 123456"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                {/* Form Row 3: Venue Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Venue Name / Castle *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. Dundas Castle / Edinburgh City Chambers"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Venue Postcode *
                    </label>
                    <input
                      type="text"
                      value={venuePostcode}
                      onChange={(e) => setVenuePostcode(e.target.value)}
                      placeholder="e.g. EH30 9SP"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                {/* Form Row 4: Tartan Attire Preference */}
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center gap-1">
                    <Shirt className="w-3.5 h-3.5" />
                    <span>Preferred Highland Dress Style</span>
                  </label>
                  <select
                    value={tartanChoice}
                    onChange={(e) => setTartanChoice(e.target.value as HighlandDressOption)}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-tartan-accent"
                  >
                    <option value="Full No. 1 Dress (Feather Bonnet & Plaid)">Full No. 1 Dress (Feather Bonnet & Plaid)</option>
                    <option value="Royal Stewart Tartan (Traditional Red)">Royal Stewart Tartan (Traditional Red)</option>
                    <option value="Black Watch Tartan (Military Green/Blue)">Black Watch Tartan (Military Green/Blue)</option>
                    <option value="Modern Day Highland Tweed Jacket">Modern Day Highland Tweed Jacket</option>
                    <option value="Isle of Skye Tartan (Purple/Heather/Green)">Isle of Skye Tartan (Purple/Heather/Green)</option>
                  </select>
                </div>

                {/* Form Row 5: Special Bagpipe Tunes Selection */}
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-2 flex items-center gap-1">
                    <Music className="w-3.5 h-3.5" />
                    <span>Requested Tunes (Select any you wish Spud to perform):</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {tunesList.map((tune) => {
                      const isChecked = selectedTunes.includes(tune.title);
                      return (
                        <div
                          key={tune.id}
                          onClick={() => handleTuneToggle(tune.title)}
                          className={`p-2.5 rounded-xl cursor-pointer text-xs font-medium border flex items-center gap-2 transition-all ${
                            isChecked
                              ? 'bg-tartan-navy text-tartan-gold border-tartan-gold'
                              : 'bg-tartan-dark/70 text-gray-300 border-tartan-border hover:bg-tartan-dark'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            isChecked ? 'bg-tartan-gold text-tartan-dark border-yellow-300' : 'border-slate-600'
                          }`}>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate">{tune.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                    Special Instructions / Timings / Custom Tunes
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell Spud about your ceremony schedule, wedding party names, or specific pipe entrance requests..."
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-sm tracking-wider uppercase shadow-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {isSubmitting ? (
                      <span>Sending Request to Spud...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Provisional Booking Request</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    No payment is required right now. You will receive an official Brevo confirmation email with a PayPal deposit invoice upon Spud\'s approval.
                  </p>
                </div>

              </form>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
