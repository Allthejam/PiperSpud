'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Compass,
  BedDouble,
  Ship,
  Globe,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { EventType, HighlandDressOption } from '@/types/spud';
import { calculateTravelCosts } from '@/lib/travelCalculator';
import { initialTravelConfig } from '@/lib/initialData';

export const BookingCalendar: React.FC = () => {
  const { createBooking, tunesList, travelConfig, services, pricingConfig } = useApp();

  // Dynamic Real-time Date references
  const today = new Date();
  const currentRealYear = today.getFullYear();
  const currentRealMonth = today.getMonth(); // 0 is January
  const currentRealDay = today.getDate();
  const todayFormatted = `${currentRealYear}-${String(currentRealMonth + 1).padStart(2, '0')}-${String(currentRealDay).padStart(2, '0')}`;

  // Calendar view state (starts at current month & year)
  const [currentYear, setCurrentYear] = useState(currentRealYear);
  const [currentMonth, setCurrentMonth] = useState(currentRealMonth);

  // Selected date is mandatory and must be strictly in the future
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('13:30 - 16:30');
  
  // Form fields - default to first active service package title
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'email' | 'telephone'>('email');
  const [eventType, setEventType] = useState<string>(services[0]?.title || 'Scottish Castle & Highland Weddings');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venuePostcode, setVenuePostcode] = useState('');
  const [tartanChoice, setTartanChoice] = useState<HighlandDressOption>('Full No. 1 Dress (Feather Bonnet & Plaid)');
  const [selectedTunes, setSelectedTunes] = useState<string[]>(['Highland Cathedral', 'Scotland the Brave']);
  const [visibleTuneCount, setVisibleTuneCount] = useState<number>(6); // 2 rows of 3
  const [notes, setNotes] = useState('');

  // Prioritize tunes placed on the Home Page first (Spud's favorites & catchment tunes), then popular tunes
  const sortedTunes = React.useMemo(() => {
    return [...tunesList].sort((a, b) => {
      const aHome = a.showOnHomePage ? 1 : 0;
      const bHome = b.showOnHomePage ? 1 : 0;
      if (bHome !== aHome) return bHome - aHome;
      const aPop = a.isPopular ? 1 : 0;
      const bPop = b.isPopular ? 1 : 0;
      if (bPop !== aPop) return bPop - aPop;
      return a.title.localeCompare(b.title);
    });
  }, [tunesList]);

  const displayedTunes = sortedTunes.slice(0, visibleTuneCount);

  // Auto-detect service from client URL params matching active services
  useEffect(() => {
    if (typeof window !== 'undefined' && services && services.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const serviceParam = urlParams.get('service');
      if (serviceParam) {
        const lower = serviceParam.toLowerCase();
        const matched = services.find(s => 
          s.slug.toLowerCase() === lower || 
          s.title.toLowerCase().includes(lower) || 
          (lower.includes('wedding') && s.title.toLowerCase().includes('wedding')) ||
          (lower.includes('funeral') && (s.title.toLowerCase().includes('funeral') || s.title.toLowerCase().includes('memorial') || s.title.toLowerCase().includes('lament'))) ||
          (lower.includes('burns') && (s.title.toLowerCase().includes('burns') || s.title.toLowerCase().includes('hogmanay'))) ||
          (lower.includes('corporate') && (s.title.toLowerCase().includes('corporate') || s.title.toLowerCase().includes('castle'))) ||
          (lower.includes('experience') && (s.title.toLowerCase().includes('experience') || s.title.toLowerCase().includes('workshop') || s.title.toLowerCase().includes('airbnb'))) ||
          (lower.includes('lesson') && (s.title.toLowerCase().includes('lesson') || s.title.toLowerCase().includes('tuition'))) ||
          (lower.includes('birthday') && (s.title.toLowerCase().includes('birthday') || s.title.toLowerCase().includes('anniversary') || s.title.toLowerCase().includes('party')))
        );
        if (matched) {
          setEventType(matched.title);
        }
      }
    }
  }, [services]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Dynamic Pricing from active services state in AppContext
  const selectedService = services.find(s => s.title === eventType || s.slug === eventType) || services[0];
  const basePackagePrice = selectedService?.basePrice ?? 480;
  const depositAmount = selectedService?.depositAmount ?? 100;

  // Live Travel Expenses Calculation
  const travelResult = calculateTravelCosts(
    venuePostcode, 
    venueName, 
    venueAddress, 
    travelConfig || initialTravelConfig
  );

  const travelExpense = travelResult.isOverseasOrMaxDistance ? 0 : travelResult.totalTravelExpense;
  const estimatedPrice = basePackagePrice + travelExpense;

  // Calendar day generator
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isPrevMonthDisabled = 
    currentYear < currentRealYear || 
    (currentYear === currentRealYear && currentMonth <= currentRealMonth);

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
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

  const handleTuneToggle = (tuneTitle: string) => {
    if (selectedTunes.includes(tuneTitle)) {
      setSelectedTunes(selectedTunes.filter(t => t !== tuneTitle));
    } else {
      setSelectedTunes([...selectedTunes, tuneTitle]);
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || selectedDate <= todayFormatted) {
      setDateError('Event date is mandatory. Please select a valid future date on the calendar.');
      const calendarEl = document.getElementById('booking-calendar-card');
      if (calendarEl) calendarEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setDateError('');

    if (!clientName || !clientEmail || !clientPhone || !venueName) {
      alert('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const formattedBreakdown = `${travelResult.explanationText} • Preferred Contact: ${preferredContactMethod === 'email' ? 'Email' : 'Telephone'}`;
      
      const newBk = createBooking({
        clientName,
        clientEmail,
        clientPhone,
        preferredContactMethod,
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
        notes,
        distanceMiles: travelResult.distanceMiles,
        travelExpense: travelResult.totalTravelExpense,
        isOvernightRequired: travelResult.isOvernightTriggered,
        overnightExpense: travelResult.overnightCost,
        isOverseasOrCustomQuote: travelResult.isOverseasOrMaxDistance,
        travelBreakdownText: formattedBreakdown
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
            <ShieldCheck className="w-4 h-4" />
            <span>Direct Date Request & Custom Estimate</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight">
            Choose Your Event Date & Request Booking
          </h2>
          <p className="text-base text-gray-300">
            Select your preferred date on the calendar below. Spud personally reviews each inquiry against his private diary and will email you directly to confirm availability, travel logistics, and finalize details.
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

            {/* Travel & Pricing Breakdown Pill */}
            <div className="bg-tartan-dark/90 rounded-2xl p-4 border border-tartan-border text-left space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-tartan-border/60 pb-2">
                <span className="text-gray-400">Venue Distance & Travel:</span>
                <span className="text-tartan-gold font-bold">
                  {bookingSuccess.isOverseasOrCustomQuote
                    ? 'Bespoke Expedition Enquiry'
                    : bookingSuccess.travelExpense === 0
                    ? 'FREE Travel (Within 50-Mile Radius)'
                    : `+£${bookingSuccess.travelExpense} Additional Expenses`}
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                {bookingSuccess.travelBreakdownText || 'Standard travel policy applied.'}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-tartan-border/40">
                <span className="text-gray-400">Preferred Contact Method:</span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  {bookingSuccess.preferredContactMethod === 'telephone' ? (
                    <>
                      <Phone className="w-3.5 h-3.5 text-tartan-gold" />
                      <span>Telephone ({bookingSuccess.clientPhone})</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 text-tartan-gold" />
                      <span>Email ({bookingSuccess.clientEmail})</span>
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-white font-bold">Estimated Total:</span>
                <span className="text-white font-extrabold text-sm">
                  {bookingSuccess.isOverseasOrCustomQuote ? 'Tailored Quote on Review' : `£${bookingSuccess.estimatedPrice}`}
                </span>
              </div>
            </div>

            {/* Workflow Step Explanation */}
            <div className="bg-tartan-navy/80 rounded-2xl p-5 border border-tartan-border text-left space-y-3 text-xs">
              <h4 className="font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Next Automated Steps:</span>
              </h4>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-tartan-accent text-tartan-dark font-bold flex items-center justify-center shrink-0">1</div>
                <p className="text-gray-200">Spud reviews your event details, venue location, and travel logistics in his private Back Office diary.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-tartan-accent text-tartan-dark font-bold flex items-center justify-center shrink-0">2</div>
                <p className="text-gray-200">
                  You will receive an official <strong className="text-white">Brevo confirmation email</strong> with your booking summary, travel details, and a secure <strong className="text-white">PayPal link</strong> to pay the £{bookingSuccess.depositAmount} deposit.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-tartan-accent text-tartan-dark font-bold flex items-center justify-center shrink-0">3</div>
                <p className="text-gray-200">Upon deposit payment, your date is locked in Spud's private diary and full receipts are delivered.</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBookingSuccess(null)}
                className="px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110"
              >
                Request Another Date
              </button>
            </div>
          </div>
        ) : (
          /* Two Column Layout: Calendar on Left, Booking Form on Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive Calendar */}
            <div id="booking-calendar-card" className="lg:col-span-5 bg-tartan-card rounded-3xl p-6 border border-tartan-accent/40 shadow-2xl space-y-6 scroll-mt-24">
              
              {/* Calendar Month Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <p className="text-xs text-tartan-gold">Select your event date (Future dates only)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isPrevMonthDisabled}
                    onClick={handlePrevMonth}
                    className={`p-2 rounded-lg border transition ${
                      isPrevMonthDisabled
                        ? 'bg-tartan-dark/40 text-gray-600 border-transparent cursor-not-allowed opacity-40'
                        : 'bg-tartan-navy hover:bg-slate-700 text-gray-300 border-tartan-border'
                    }`}
                    title={isPrevMonthDisabled ? 'Cannot navigate to past months' : 'Previous month'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-300 border border-tartan-border transition"
                    title="Next month"
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
                  <div key={`empty-${i}`} className="h-11"></div>
                ))}

                {/* Days of Month */}
                {[...Array(daysInMonth)].map((_, i) => {
                  const dayNum = i + 1;
                  const monthFormatted = String(currentMonth + 1).padStart(2, '0');
                  const dayFormatted = String(dayNum).padStart(2, '0');
                  const dateString = `${currentYear}-${monthFormatted}-${dayFormatted}`;

                  const isPast = dateString < todayFormatted;
                  const isToday = dateString === todayFormatted;
                  const isSelectableFuture = dateString > todayFormatted;
                  const isSelected = selectedDate === dateString;

                  let btnStyle = '';
                  if (isSelected) {
                    btnStyle = 'bg-gold-gradient text-tartan-dark font-extrabold ring-2 ring-yellow-400 shadow-xl scale-105 z-10';
                  } else if (isToday) {
                    btnStyle = 'bg-tartan-dark/80 text-gray-400 border border-tartan-gold/50 cursor-not-allowed opacity-60';
                  } else if (isPast) {
                    btnStyle = 'bg-tartan-dark/30 text-gray-600 border border-transparent cursor-not-allowed opacity-30';
                  } else {
                    btnStyle = 'bg-tartan-navy/70 text-gray-200 hover:bg-tartan-accent/25 hover:text-white hover:border-tartan-gold/60 border border-tartan-border/50 cursor-pointer active:scale-95';
                  }

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={!isSelectableFuture}
                      onClick={() => {
                        if (isSelectableFuture) {
                          setSelectedDate(dateString);
                          setDateError('');
                        }
                      }}
                      className={`h-11 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all relative ${btnStyle}`}
                      title={
                        isToday
                          ? `Today (${dayNum} ${monthNames[currentMonth]}) - Events must be booked for future dates`
                          : isPast
                          ? `Past date (${dayNum} ${monthNames[currentMonth]}) - Unavailable`
                          : `Select ${dayNum} ${monthNames[currentMonth]} ${currentYear}`
                      }
                    >
                      <span>{dayNum}</span>
                      {isToday && (
                        <span className="text-[8px] font-bold text-tartan-gold uppercase leading-none tracking-tighter mt-0.5">Today</span>
                      )}
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-tartan-dark mt-0.5"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Privacy & Selection Legend */}
              <div className="pt-4 border-t border-tartan-border/60 flex items-center justify-between text-[11px] text-gray-300 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-tartan-gold"></span>
                    <span className="font-semibold text-white">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600 opacity-40"></span>
                    <span>Past (Closed)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-tartan-gold font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Private Diary</span>
                </div>
              </div>

              {/* Live Chosen Date Summary & Alert */}
              <div className={`p-4 rounded-2xl border space-y-2 transition-all ${
                selectedDate 
                  ? 'bg-tartan-navy border-tartan-border' 
                  : dateError
                  ? 'bg-red-950/60 border-rose-500 ring-2 ring-rose-500/40 animate-pulse'
                  : 'bg-amber-950/40 border-amber-500/60'
              }`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-tartan-gold">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Chosen Event Date (Mandatory):</span>
                  </p>
                  {selectedDate ? (
                    <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Date Selected</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-950 text-yellow-300 border border-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-yellow-400" />
                      <span>Action Required</span>
                    </span>
                  )}
                </div>

                {selectedDate ? (
                  <div className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                ) : (
                  <div className="text-xs text-amber-200 space-y-0.5">
                    <p className="font-semibold">👈 Please click a future date on the calendar above.</p>
                    <p className="text-[11px] text-gray-400">Past dates and same-day bookings are not permitted to prevent booking errors.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Booking Form & Instant Estimator */}
            <div className="lg:col-span-7 bg-tartan-card rounded-3xl p-6 sm:p-8 border border-tartan-accent/40 shadow-2xl">
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                
                {/* Dynamic Pricing & Travel Expense Pill Banner */}
                <div className="bg-gradient-to-r from-tartan-navy to-tartan-dark p-4 rounded-2xl border border-tartan-border space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <span className="text-xs text-gray-400">
                        {pricingConfig?.hidePrices ? 'Pricing & Quote:' : 'Total Price Estimate:'}
                      </span>
                      <div className="text-2xl font-extrabold text-white font-serif">
                        {pricingConfig?.hidePrices ? (
                          <span className="text-xl text-amber-400">{pricingConfig.poaLabel || 'Price on Application'}</span>
                        ) : travelResult.isOverseasOrMaxDistance ? (
                          <span className="text-xl text-amber-400">Bespoke Quote</span>
                        ) : (
                          <>
                            £{estimatedPrice} <span className="text-xs font-normal text-tartan-gold">Total</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">
                        {pricingConfig?.hidePrices ? 'Payment & Invoicing:' : 'Provisional Deposit:'}
                      </span>
                      <div className="text-lg font-bold text-tartan-gold">
                        {pricingConfig?.hidePrices ? (
                          <span className="text-sm text-tartan-gold font-bold">PayPal Deposit upon Approval</span>
                        ) : (
                          <>
                            £{depositAmount} <span className="text-[10px] text-gray-300">(via PayPal upon approval)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Itemised Breakdown Details / POA Notice */}
                  {!pricingConfig?.hidePrices ? (
                    <div className="pt-2 border-t border-tartan-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Base Service:</span>
                        <span className="text-white font-bold">£{basePackagePrice}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Travel ({travelResult.distanceMiles} mi):</span>
                        <span className={`font-bold ${
                          travelResult.isWithinFreeRadius 
                            ? 'text-emerald-400' 
                            : travelResult.isOverseasOrMaxDistance 
                            ? 'text-amber-400' 
                            : 'text-tartan-gold'
                        }`}>
                          {travelResult.isWithinFreeRadius 
                            ? 'FREE (Included)' 
                            : travelResult.isOverseasOrMaxDistance 
                            ? 'Expedition Quote' 
                            : `+£${travelResult.totalTravelExpense}`}
                        </span>
                      </div>

                      {travelResult.isOvernightTriggered && (
                        <div className="flex items-center gap-1 text-blue-300">
                          <BedDouble className="w-3.5 h-3.5" />
                          <span>+£{travelResult.overnightCost} Overnight</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-tartan-border/60 text-xs text-gray-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-tartan-gold shrink-0" />
                      <span>{pricingConfig.poaDescription || 'Bespoke quote calculated upon inquiry based on your date, venue location & requirements.'}</span>
                    </div>
                  )}
                </div>

                {/* Form Row 1: Event Type & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5">
                      Event / Occasion Type *
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-tartan-accent font-medium"
                    >
                      {services && services.length > 0 ? (
                        services.map((srv) => (
                          <option key={srv.id} value={srv.title} className="bg-tartan-navy text-white">
                            {srv.title} {pricingConfig?.hidePrices ? '(POA)' : `(${srv.priceEstimate || `£${srv.basePrice}`})`}
                          </option>
                        ))
                      ) : (
                        <option value="Scottish Castle & Highland Weddings">Scottish Castle & Highland Weddings</option>
                      )}
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
                <div className="space-y-3">
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

                  {/* Preferred Contact Method Selector */}
                  <div className="flex items-center justify-between bg-tartan-dark/80 px-4 py-2.5 rounded-xl border border-tartan-border text-xs flex-wrap gap-2">
                    <span className="text-gray-400 font-medium">Preferred Contact Method:</span>
                    <div className="flex items-center gap-1.5 bg-tartan-navy p-1 rounded-lg border border-tartan-border">
                      <button
                        type="button"
                        onClick={() => setPreferredContactMethod('email')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          preferredContactMethod === 'email'
                            ? 'bg-tartan-gold text-tartan-dark shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreferredContactMethod('telephone')}
                        className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          preferredContactMethod === 'telephone'
                            ? 'bg-tartan-gold text-tartan-dark shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Telephone</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Row 3: Venue Location & Dynamic Travel Distance Feedback */}
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
                    <label className="block text-xs font-semibold text-tartan-gold mb-1.5 flex items-center justify-between">
                      <span>Venue Postcode *</span>
                      <span className="text-[10px] text-gray-400 font-normal">Base: {travelConfig?.publicBaseDisplay || 'Aviemore, Highlands'}</span>
                    </label>
                    <input
                      type="text"
                      value={venuePostcode}
                      onChange={(e) => setVenuePostcode(e.target.value.toUpperCase())}
                      placeholder="e.g. EH30 9SP, IV40 8DX..."
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3.5 py-3 text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-tartan-accent"
                    />
                  </div>
                </div>

                {/* Real-time Distance & Travel Expense Feedback Badge */}
                {venuePostcode && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                    travelResult.isWithinFreeRadius
                      ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
                      : travelResult.isOverseasOrMaxDistance
                      ? 'bg-amber-950/80 border-amber-600/80 text-amber-200'
                      : 'bg-yellow-950/60 border-yellow-700/80 text-yellow-200'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {travelResult.isWithinFreeRadius ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : travelResult.isOverseasOrMaxDistance ? (
                        <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Compass className="w-4 h-4 text-tartan-gold shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{travelResult.explanationText}</p>
                      </div>
                    </div>

                    {travelResult.isOverseasOrMaxDistance && (
                      <div className="pt-2 border-t border-amber-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <span className="text-amber-300 font-medium">How would you prefer Spud to contact you for this bespoke quote?</span>
                        <div className="flex items-center gap-1.5 bg-amber-900/60 p-1 rounded-lg border border-amber-700">
                          <button
                            type="button"
                            onClick={() => setPreferredContactMethod('email')}
                            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                              preferredContactMethod === 'email'
                                ? 'bg-tartan-gold text-tartan-dark shadow-sm'
                                : 'text-amber-200 hover:text-white'
                            }`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreferredContactMethod('telephone')}
                            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                              preferredContactMethod === 'telephone'
                                ? 'bg-tartan-gold text-tartan-dark shadow-sm'
                                : 'text-amber-200 hover:text-white'
                            }`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Telephone</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-semibold text-tartan-gold flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5" />
                      <span>Requested Tunes ({selectedTunes.length} selected):</span>
                    </label>
                    <span className="text-[11px] text-gray-400 font-medium">
                      Showing {Math.min(visibleTuneCount, sortedTunes.length)} of {sortedTunes.length} tunes
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {displayedTunes.map((tune) => {
                      const isChecked = selectedTunes.includes(tune.title);
                      return (
                        <div
                          key={tune.id}
                          onClick={() => handleTuneToggle(tune.title)}
                          className={`p-2.5 rounded-xl cursor-pointer text-xs font-medium border flex items-center justify-between gap-2 transition-all ${
                            isChecked
                              ? 'bg-tartan-navy text-tartan-gold border-tartan-gold shadow-md'
                              : 'bg-tartan-dark/70 text-gray-300 border-tartan-border hover:bg-tartan-dark hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                              isChecked ? 'bg-tartan-gold text-tartan-dark border-yellow-300' : 'border-slate-600'
                            }`}>
                              {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className="truncate">{tune.title}</span>
                          </div>
                          {tune.showOnHomePage && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-tartan-gold/15 text-tartan-gold font-bold shrink-0 border border-tartan-gold/30">
                              Featured
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expand / Collapse Controls (2 rows per click) */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    {visibleTuneCount < sortedTunes.length && (
                      <button
                        type="button"
                        onClick={() => setVisibleTuneCount(prev => prev + 6)}
                        className="px-4 py-2 rounded-xl bg-tartan-dark/90 hover:bg-tartan-navy text-gray-200 hover:text-white border border-tartan-border/80 text-xs font-bold flex items-center gap-2 transition shadow hover:border-tartan-gold/60 active:scale-95"
                      >
                        <ChevronDown className="w-4 h-4 text-tartan-gold animate-bounce" />
                        <span>See More Tunes ({sortedTunes.length - visibleTuneCount} remaining)</span>
                      </button>
                    )}
                    {visibleTuneCount > 6 && (
                      <button
                        type="button"
                        onClick={() => setVisibleTuneCount(6)}
                        className="px-4 py-2 rounded-xl bg-tartan-dark/90 hover:bg-tartan-navy text-gray-400 hover:text-gray-200 border border-tartan-border/80 text-xs font-semibold flex items-center gap-1.5 transition shadow active:scale-95"
                      >
                        <ChevronUp className="w-4 h-4" />
                        <span>Show Less</span>
                      </button>
                    )}
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

                {/* Date Validation Alert Banner */}
                {dateError && (
                  <div className="p-3.5 bg-red-950/80 border border-rose-600 rounded-xl text-xs text-rose-300 flex items-center gap-2.5 animate-bounce">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-semibold">{dateError}</span>
                  </div>
                )}

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
