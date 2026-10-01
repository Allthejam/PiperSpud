'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Shirt, 
  Music, 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Percent, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Shield, 
  History, 
  Compass, 
  Edit3, 
  Save, 
  CreditCard, 
  Play, 
  Square, 
  Tag, 
  PlusCircle, 
  MinusCircle, 
  FileText,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BedDouble,
  Ship,
  Globe
} from 'lucide-react';
import { BookingEvent, BookingAuditEntry, BookingMessage, HighlandDressOption } from '@/types/spud';

interface BookingDetailModalProps {
  booking: BookingEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose
}) => {
  const { 
    updateBooking, 
    addBookingAudit, 
    sendBookingMessage, 
    approveBooking, 
    rejectBooking, 
    markDepositPaid, 
    deleteBooking,
    openBrevoPreview, 
    openPayPalModal,
    playTune,
    currentPlayingTune,
    stopTune
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'messages' | 'audit'>('overview');

  // Pricing & surcharge state
  const [basePriceInput, setBasePriceInput] = useState<number>(0);
  const [travelWaived, setTravelWaived] = useState<boolean>(false);
  const [customSurcharge, setCustomSurcharge] = useState<number>(0);
  const [customSurchargeReason, setCustomSurchargeReason] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [depositAmountInput, setDepositAmountInput] = useState<number>(0);
  const [adminNotesInput, setAdminNotesInput] = useState<string>('');
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState('');

  // Message state
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageStatusMsg, setMessageStatusMsg] = useState('');

  // Approve & Decline modals
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [notifyClientOnDecline, setNotifyClientOnDecline] = useState(true);

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');

  // Synchronize state when booking changes
  React.useEffect(() => {
    if (booking) {
      const initialBase = booking.basePackagePrice !== undefined 
        ? booking.basePackagePrice 
        : Math.max(0, booking.estimatedPrice - (booking.travelExpense || 0) - (booking.customSurcharge || 0) + (booking.discountAmount || 0));
      
      setBasePriceInput(initialBase);
      setTravelWaived(booking.travelWaived || false);
      setCustomSurcharge(booking.customSurcharge || 0);
      setCustomSurchargeReason(booking.customSurchargeReason || '');
      setDiscountAmount(booking.discountAmount || 0);
      setDiscountReason(booking.discountReason || '');
      setDepositAmountInput(booking.depositAmount || 100);
      setAdminNotesInput(booking.adminNotes || '');
      setMessageSubject(`Regarding your ${booking.eventType} booking on ${booking.date}`);
      setMessageBody('');
      setPricingSuccessMsg('');
      setMessageStatusMsg('');
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  // Real-time recalculated total
  const calculatedTravel = travelWaived ? 0 : (booking.travelExpense || 0);
  const calculatedTotal = Math.max(0, basePriceInput + calculatedTravel + (Number(customSurcharge) || 0) - (Number(discountAmount) || 0));

  const handleSavePricingAndNotes = async () => {
    setIsSavingPricing(true);
    try {
      const priceChanged = calculatedTotal !== booking.estimatedPrice || depositAmountInput !== booking.depositAmount;
      const surchargeChanged = customSurcharge !== (booking.customSurcharge || 0);
      const waiverChanged = travelWaived !== (booking.travelWaived || false);

      let auditDetails = `Updated pricing: Base £${basePriceInput}`;
      if (waiverChanged) {
        auditDetails += ` • Travel surcharge ${travelWaived ? 'WAIVED (£0.00)' : `re-applied (£${booking.travelExpense || 0})`}`;
      }
      if (surchargeChanged) {
        auditDetails += ` • Custom surcharge £${customSurcharge} (${customSurchargeReason || 'Adjusted'})`;
      }
      if (discountAmount > 0) {
        auditDetails += ` • Discount -£${discountAmount} (${discountReason || 'Discount'})`;
      }
      auditDetails += ` • Final Total: £${calculatedTotal}.00 (Deposit: £${depositAmountInput}.00)`;

      await updateBooking(booking.id, {
        basePackagePrice: basePriceInput,
        estimatedPrice: calculatedTotal,
        depositAmount: depositAmountInput,
        travelWaived,
        customSurcharge: Number(customSurcharge) || 0,
        customSurchargeReason,
        discountAmount: Number(discountAmount) || 0,
        discountReason,
        adminNotes: adminNotesInput
      });

      if (priceChanged || surchargeChanged || waiverChanged) {
        await addBookingAudit(
          booking.id,
          'Pricing / Surcharge Adjusted',
          'Spud The Piper (Admin)',
          auditDetails,
          'price_adjustment'
        );
      } else if (adminNotesInput !== (booking.adminNotes || '')) {
        await addBookingAudit(
          booking.id,
          'Internal Admin Notes Saved',
          'Spud The Piper (Admin)',
          'Admin notes updated by Spud.',
          'note_added'
        );
      }

      setPricingSuccessMsg('Booking pricing & admin notes successfully updated and synced!');
      setTimeout(() => setPricingSuccessMsg(''), 4000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim()) return;

    setIsSendingMessage(true);
    try {
      const res = await sendBookingMessage(booking.id, {
        body: messageBody.trim(),
        subject: messageSubject.trim() || `Regarding your booking with Spud the Piper`,
        channel: 'email',
        senderName: 'Spud The Piper'
      });

      if (res.success) {
        setMessageBody('');
        setMessageStatusMsg('Message delivered to client via email & logged to audit trail.');
        setTimeout(() => setMessageStatusMsg(''), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleQuickTemplate = (templateType: string) => {
    if (templateType === 'confirm_details') {
      setMessageSubject(`Timings & Details: ${booking.eventType} on ${booking.date}`);
      setMessageBody(`Failte ${booking.clientName},\n\nThank you for your booking request for ${booking.date} at ${booking.venueName}.\n\nI am currently looking over my schedule for that day and would love to confirm your exact ceremony timings and the entrance sequence.\n\nCould you please let me know when you would like me to strike up the pipes (e.g. greeting guests 30 mins prior to arrival)?\n\nLooking forward to speaking soon,\nCallum (Spud the Piper)`);
    } else if (templateType === 'waive_surcharge') {
      setTravelWaived(true);
      setMessageSubject(`Travel Surcharge Waived: ${booking.eventType} on ${booking.date}`);
      setMessageBody(`Hi ${booking.clientName},\n\nGreat news! Since your venue at ${booking.venueName} is close to my route on ${booking.date}, I have waived the travel surcharge for your event.\n\nYour updated quote is £${calculatedTotal - (booking.travelExpense || 0)}.00.\n\nWarm regards,\nSpud the Piper`);
    } else if (templateType === 'tune_requests') {
      setMessageSubject(`Bagpipe Tune Selection for ${booking.date}`);
      setMessageBody(`Hello ${booking.clientName},\n\nRegarding the special tunes for your event at ${booking.venueName}, I see you selected ${(booking.specialTunes || []).join(', ') || 'Highland Cathedral'}.\n\nIf you have any particular walking down the aisle moments or surprise tunes you'd like me to prepare, please let me know!\n\nSlàinte,\nSpud`);
    } else if (templateType === 'payment_link') {
      setMessageSubject(`Booking Deposit Link: Spud the Piper (${booking.date})`);
      setMessageBody(`Hi ${booking.clientName},\n\nYour booking request for ${booking.date} is approved! To officially lock this date in my diary, please complete the £${booking.depositAmount}.00 deposit using our secure PayPal link.\n\nOnce received, your date is 100% reserved.\n\nBest wishes,\nSpud`);
    }
  };

  const handleConfirmApproval = async () => {
    await approveBooking(booking.id, { note: approvalNote.trim() || undefined });
    setIsApproveModalOpen(false);
  };

  const handleConfirmDecline = async () => {
    await rejectBooking(booking.id, declineReason.trim() || 'Date unavailable in diary', notifyClientOnDecline);
    setIsDeclineModalOpen(false);
  };

  const isPending = booking.status === 'pending';
  const isApproved = booking.status === 'approved';
  const isPaid = booking.status === 'deposit_paid';
  const isCancelled = booking.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-tartan-card border border-tartan-border rounded-3xl max-w-4xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-tartan-dark/95 p-5 sm:p-6 border-b border-tartan-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-tight">
                {booking.clientName}
              </h2>
              {isPending && (
                <span className="bg-amber-950 text-yellow-300 border border-yellow-700 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Approval</span>
                </span>
              )}
              {isApproved && (
                <span className="bg-blue-950 text-blue-300 border border-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Approved • Awaiting Deposit</span>
                </span>
              )}
              {isPaid && (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Deposit Paid • Locked</span>
                </span>
              )}
              {isCancelled && (
                <span className="bg-red-950 text-red-300 border border-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Declined</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              <span className="text-tartan-gold font-serif font-bold text-sm">{booking.eventType}</span>
              <span>•</span>
              <span>Ref: <strong className="text-gray-200 font-mono">#{booking.id}</strong></span>
              <span>•</span>
              <span>Requested: {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="text-right pr-2 hidden sm:block">
              <span className="text-[11px] text-gray-400 block">Total Fee:</span>
              <span className="text-xl font-bold text-white">£{booking.estimatedPrice}.00</span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-tartan-navy hover:bg-slate-700 text-gray-300 hover:text-white border border-tartan-border flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-tartan-navy/60 px-5 sm:px-6 border-b border-tartan-border flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Details', icon: Calendar },
            { id: 'pricing', label: 'Pricing & Surcharges', icon: DollarSign },
            { id: 'messages', label: `Messages (${booking.messages?.length || 0})`, icon: MessageSquare },
            { id: 'audit', label: `Audit Trail (${booking.auditTrail?.length || 1})`, icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-tartan-gold text-tartan-gold bg-tartan-accent/10'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Key Event Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Schedule & Venue Card */}
                <div className="bg-tartan-dark/70 rounded-2xl p-5 border border-tartan-border space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-tartan-gold uppercase tracking-wider border-b border-tartan-border/60 pb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date, Time & Venue</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Event Date:</span>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{booking.date}</span>
                        <span className="text-xs font-normal text-tartan-gold bg-tartan-navy px-2 py-0.5 rounded-md border border-tartan-border">
                          {new Date(booking.date).toLocaleDateString('en-GB', { weekday: 'long' })}
                        </span>
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Preferred Time Slot:</span>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-tartan-gold" />
                        <span>{booking.timeSlot}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Venue & Address:</span>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{booking.venueName}</span>
                      </p>
                      {booking.venueAddress && booking.venueAddress !== booking.venueName && (
                        <p className="text-gray-300 text-xs pl-5 mt-0.5">{booking.venueAddress}</p>
                      )}
                      <p className="text-xs text-tartan-gold pl-5 mt-0.5 font-mono">Postcode: {booking.venuePostcode || 'N/A'}</p>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Highland Dress Preference:</span>
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                        <Shirt className="w-4 h-4 text-tartan-gold" />
                        <span>{booking.tartanChoice}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client Contact & Communication Card */}
                <div className="bg-tartan-dark/70 rounded-2xl p-5 border border-tartan-border space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-tartan-gold uppercase tracking-wider border-b border-tartan-border/60 pb-2">
                    <User className="w-4 h-4" />
                    <span>Client Contact Details</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">Full Name:</span>
                      <p className="text-sm font-bold text-white">{booking.clientName}</p>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Email Address:</span>
                      <a 
                        href={`mailto:${booking.clientEmail}`} 
                        className="text-sm font-bold text-tartan-gold hover:underline flex items-center gap-1.5"
                      >
                        <Mail className="w-4 h-4" />
                        <span>{booking.clientEmail}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Telephone / Mobile:</span>
                      <a 
                        href={`tel:${booking.clientPhone}`} 
                        className="text-sm font-bold text-emerald-400 hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{booking.clientPhone}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-gray-400 block mb-0.5">Client Preferred Contact Method:</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-tartan-navy text-xs font-bold border border-tartan-border text-white">
                        {booking.preferredContactMethod === 'telephone' ? (
                          <>
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Prefers Telephone Call / WhatsApp</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5 text-tartan-gold" />
                            <span>Prefers Email Correspondence</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Requested Bagpipe Tunes (with player & pill badges) */}
              <div className="bg-tartan-dark/70 rounded-2xl p-5 border border-tartan-border space-y-3">
                <div className="flex items-center justify-between border-b border-tartan-border/60 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-tartan-gold uppercase tracking-wider">
                    <Music className="w-4 h-4" />
                    <span>Special Bagpipe Tunes Requested ({booking.specialTunes?.length || 0})</span>
                  </div>
                  <span className="text-[11px] text-gray-400">Selected during booking request</span>
                </div>

                {(!booking.specialTunes || booking.specialTunes.length === 0) ? (
                  <p className="text-xs text-gray-400 italic">No specific tunes requested. Spud will curate the standard Scottish repertoire.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {booking.specialTunes.map((tuneTitle, idx) => {
                      const isPlaying = currentPlayingTune === tuneTitle;
                      return (
                        <div
                          key={idx}
                          className="bg-tartan-navy/80 p-2.5 rounded-xl border border-tartan-border flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-tartan-dark text-tartan-gold flex items-center justify-center font-bold text-[10px] shrink-0 border border-tartan-border">
                              {idx + 1}
                            </span>
                            <span className="text-white font-medium truncate">{tuneTitle}</span>
                          </div>
                          <button
                            onClick={() => isPlaying ? stopTune() : playTune(tuneTitle)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isPlaying 
                                ? 'bg-amber-500 text-tartan-dark border-amber-400 animate-pulse' 
                                : 'bg-tartan-dark hover:bg-slate-700 text-tartan-gold border-tartan-border'
                            }`}
                            title={isPlaying ? 'Stop tune preview' : 'Play bagpipe tune preview'}
                          >
                            {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Client Notes & Special Instructions */}
              {booking.notes && (
                <div className="bg-tartan-navy/50 rounded-2xl p-5 border border-tartan-border space-y-2">
                  <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider block">
                    Client Special Instructions / Timings / Notes:
                  </span>
                  <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap italic bg-black/40 p-3 rounded-xl border border-slate-800">
                    "{booking.notes}"
                  </p>
                </div>
              )}

              {/* Private Internal Admin Notes for Spud */}
              <div className="bg-tartan-dark/70 rounded-2xl p-5 border border-tartan-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-tartan-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span>Private Internal Admin Notes (Spud Only)</span>
                  </span>
                  <span className="text-[10px] text-gray-400">Never shown to client</span>
                </div>
                <textarea
                  rows={3}
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Add private back-office notes (e.g. Groom's brother is playing snare, sound check at 12:45, access via north castle arch)..."
                  className="w-full bg-tartan-navy border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSavePricingAndNotes}
                    disabled={isSavingPricing}
                    className="px-4 py-2 bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-tartan-gold" />
                    <span>Save Internal Notes</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRICING & SURCHARGE CONTROLS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              
              {/* Interactive Pricing Form Card */}
              <div className="bg-tartan-dark/80 rounded-3xl p-6 border border-tartan-border space-y-5">
                <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white font-serif">Fee & Surcharge Adjustments</h3>
                    <p className="text-xs text-gray-400">Apply travel fee waivers, custom timing surcharges, or discounts before invoice dispatch</p>
                  </div>
                  <span className="text-xs font-bold text-tartan-gold bg-tartan-navy px-3 py-1.5 rounded-xl border border-tartan-border">
                    Live Total: £{calculatedTotal}.00
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  
                  {/* Base Package Price */}
                  <div>
                    <label className="block font-semibold text-tartan-gold mb-1.5">
                      Base Performance Fee (£) *
                    </label>
                    <input
                      type="number"
                      value={basePriceInput}
                      onChange={(e) => setBasePriceInput(Number(e.target.value) || 0)}
                      className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-tartan-accent"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Standard package rate for {booking.eventType}</span>
                  </div>

                  {/* Required Deposit Amount */}
                  <div>
                    <label className="block font-semibold text-tartan-gold mb-1.5">
                      Provisional PayPal Deposit (£) *
                    </label>
                    <input
                      type="number"
                      value={depositAmountInput}
                      onChange={(e) => setDepositAmountInput(Number(e.target.value) || 0)}
                      className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-3.5 py-2.5 text-tartan-gold font-bold text-sm focus:outline-none focus:border-tartan-accent"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Due upon booking approval to lock the date</span>
                  </div>

                </div>

                {/* Travel & Mileage Surcharge Management */}
                <div className="bg-tartan-navy/70 p-4 rounded-2xl border border-tartan-border space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-tartan-gold" />
                      <span className="font-bold text-white text-xs">Travel & Mileage Logistics</span>
                    </div>
                    <span className="text-xs text-gray-300 font-mono">
                      Distance: <strong>{booking.distanceMiles !== undefined ? `${booking.distanceMiles} miles` : 'Standard'}</strong> from Aviemore Base
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-300">
                    {booking.travelBreakdownText || 'Standard travel formula applied.'}
                  </p>

                  <div className="pt-2 border-t border-tartan-border/60 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">Calculated Expense:</span>
                      <strong className="text-white text-sm">£{booking.travelExpense || 0}.00</strong>
                      {travelWaived && (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          WAIVED (£0.00)
                        </span>
                      )}
                    </div>

                    {/* Waive Surcharge Button */}
                    <button
                      type="button"
                      onClick={() => setTravelWaived(!travelWaived)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                        travelWaived
                          ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950/80 hover:bg-amber-900 text-yellow-300 border border-yellow-700'
                      }`}
                    >
                      {travelWaived ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Travel Fee Waived (Click to Restore)</span>
                        </>
                      ) : (
                        <>
                          <MinusCircle className="w-4 h-4" />
                          <span>Waive Travel Surcharge (£0.00)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Custom Surcharge & Discounts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  
                  {/* Custom Surcharge (e.g. late evening / extra hour) */}
                  <div className="bg-tartan-navy/40 p-4 rounded-2xl border border-tartan-border space-y-2">
                    <label className="font-semibold text-tartan-gold flex items-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Custom Surcharge (+£)</span>
                    </label>
                    <input
                      type="number"
                      value={customSurcharge}
                      onChange={(e) => setCustomSurcharge(Number(e.target.value) || 0)}
                      placeholder="e.g. 50"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-tartan-accent"
                    />
                    <input
                      type="text"
                      value={customSurchargeReason}
                      onChange={(e) => setCustomSurchargeReason(e.target.value)}
                      placeholder="Reason: e.g. Extended 2hr Evening Ceilidh Set"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-gray-200 placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                  {/* Custom Discount */}
                  <div className="bg-tartan-navy/40 p-4 rounded-2xl border border-tartan-border space-y-2">
                    <label className="font-semibold text-emerald-400 flex items-center gap-1">
                      <MinusCircle className="w-3.5 h-3.5" />
                      <span>Special Discount (-£)</span>
                    </label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      placeholder="e.g. 30"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-tartan-accent"
                    />
                    <input
                      type="text"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="Reason: e.g. Returning Client / Highland Charity"
                      className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-gray-200 placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
                    />
                  </div>

                </div>

                {/* Real-time Recalculated Summary Table */}
                <div className="bg-tartan-dark p-4 rounded-2xl border border-tartan-gold/40 text-xs space-y-2">
                  <span className="font-bold text-tartan-gold uppercase tracking-wider block border-b border-tartan-border/60 pb-1.5">
                    Final Invoice Breakdown Preview:
                  </span>
                  <div className="space-y-1.5 text-gray-300">
                    <div className="flex justify-between">
                      <span>Base Service Package:</span>
                      <strong className="text-white">£{basePriceInput}.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Travel Expenses ({travelWaived ? 'Waived' : `${booking.distanceMiles || 0} mi`}):</span>
                      <strong className={travelWaived ? 'text-emerald-400' : 'text-white'}>
                        {travelWaived ? '£0.00 (FREE)' : `£${booking.travelExpense || 0}.00`}
                      </strong>
                    </div>
                    {customSurcharge > 0 && (
                      <div className="flex justify-between text-yellow-300">
                        <span>Custom Surcharge ({customSurchargeReason || 'Additional Fee'}):</span>
                        <strong>+£{customSurcharge}.00</strong>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount ({discountReason || 'Special Offer'}):</span>
                        <strong>-£{discountAmount}.00</strong>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-white border-t border-tartan-border/80 pt-2">
                      <span className="font-serif">Total Performance Investment:</span>
                      <span className="text-tartan-gold">£{calculatedTotal}.00</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Deposit via PayPal upon Approval:</span>
                      <span className="text-white font-bold">£{depositAmountInput}.00</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Remaining Balance Due on Event Day:</span>
                      <span className="text-white font-bold">£{Math.max(0, calculatedTotal - depositAmountInput)}.00</span>
                    </div>
                  </div>
                </div>

                {/* Save Feedback Alert */}
                {pricingSuccessMsg && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pricingSuccessMsg}</span>
                  </div>
                )}

                {/* Action Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSavePricingAndNotes}
                    disabled={isSavingPricing}
                    className="py-3 px-6 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Save className="w-4 h-4 text-tartan-dark" />
                    <span>{isSavingPricing ? 'Saving & Recalculating...' : 'Save Pricing & Recalculate Quote'}</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: IN-APP CLIENT MESSAGING */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              
              {/* Message Header & Quick Templates */}
              <div className="bg-tartan-dark/70 rounded-2xl p-4 border border-tartan-border space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-tartan-gold uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>Direct Client Communication (Dispatched via Brevo Email)</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Recipient: <strong className="text-white">{booking.clientName}</strong> ({booking.clientEmail})
                  </span>
                </div>

                {/* Quick Reply Template Chips */}
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold block mb-1.5">Quick Response Templates:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleQuickTemplate('confirm_details')}
                      className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-xs flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3 text-tartan-gold" />
                      <span>Confirm Timings & Schedule</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTemplate('waive_surcharge')}
                      className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-xs flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Waive Travel Fee</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTemplate('tune_requests')}
                      className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-xs flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>Custom Tune Discussion</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickTemplate('payment_link')}
                      className="px-2.5 py-1 rounded-lg bg-tartan-navy hover:bg-slate-700 text-gray-200 border border-tartan-border text-xs flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Deposit Follow-up</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Composer Form */}
              <form onSubmit={handleSendMessage} className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Subject..."
                    className="w-full bg-tartan-navy border border-tartan-border rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-tartan-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-tartan-gold mb-1">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Type your message to the client here. When sent, this will be emailed directly from Spud's Brevo account and saved to the message history..."
                    className="w-full bg-tartan-navy border border-tartan-border rounded-xl p-3 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent font-sans leading-relaxed"
                  />
                </div>

                {messageStatusMsg && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{messageStatusMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-gray-400">
                    Sends to: <strong className="text-gray-200">{booking.clientEmail}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={isSendingMessage || !messageBody.trim()}
                    className="py-2.5 px-5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-110 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-tartan-dark" />
                    <span>{isSendingMessage ? 'Sending Email...' : 'Send Message to Client'}</span>
                  </button>
                </div>
              </form>

              {/* Message History Thread */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Communication History ({booking.messages?.length || 0} messages)
                </span>

                {(!booking.messages || booking.messages.length === 0) ? (
                  <div className="p-8 text-center bg-tartan-dark/50 rounded-2xl border border-tartan-border text-gray-400 text-xs space-y-1">
                    <MessageSquare className="w-6 h-6 mx-auto text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-300">No Messages Sent Yet</p>
                    <p className="text-[11px]">Use the composer above to email the client directly from Spud's back office.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {booking.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-tartan-dark/80 rounded-2xl p-4 border border-tartan-border space-y-2 text-xs shadow"
                      >
                        <div className="flex items-center justify-between border-b border-tartan-border/60 pb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-tartan-accent/20 text-tartan-gold flex items-center justify-center font-bold text-xs border border-tartan-accent/40">
                              S
                            </span>
                            <span className="font-bold text-white">{msg.senderName || 'Spud The Piper'}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                              Email Dispatched
                            </span>
                          </div>
                          <span className="text-gray-400 text-[11px]">
                            {new Date(msg.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {msg.subject && (
                          <p className="font-bold text-tartan-gold text-xs">Subject: {msg.subject}</p>
                        )}

                        <div className="text-gray-200 whitespace-pre-wrap leading-relaxed bg-black/40 p-3 rounded-xl border border-slate-800 font-sans">
                          {msg.body}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: FULL AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-tartan-border/60 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-tartan-gold uppercase tracking-wider">
                  <History className="w-4 h-4" />
                  <span>Immutable Activity Log & Audit Trail</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {booking.auditTrail?.length || 1} logged events
                </span>
              </div>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-tartan-border/60">
                {(booking.auditTrail || [
                  {
                    id: 'audit-init',
                    timestamp: booking.createdAt,
                    action: 'Provisional Booking Requested',
                    actor: `${booking.clientName} (Website Booking Form)`,
                    details: `Requested ${booking.eventType} on ${booking.date} at ${booking.venueName} (${booking.timeSlot}).`,
                    type: 'system'
                  }
                ]).map((entry: BookingAuditEntry, idx: number) => {
                  let badgeColor = 'bg-blue-950 text-blue-300 border-blue-800';
                  if (entry.type === 'status_change') badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                  if (entry.type === 'price_adjustment') badgeColor = 'bg-purple-950 text-purple-300 border-purple-800';
                  if (entry.type === 'message_sent') badgeColor = 'bg-amber-950 text-yellow-300 border-yellow-800';

                  return (
                    <div key={entry.id || idx} className="relative pl-8 text-xs space-y-1">
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-tartan-gold border-2 border-tartan-dark -translate-x-1/2"></div>
                      
                      <div className="bg-tartan-dark/80 p-3.5 rounded-2xl border border-tartan-border space-y-1.5 shadow">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-bold text-white text-xs">{entry.action}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(entry.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-semibold">Actor:</span>
                          <span className="text-[11px] text-tartan-gold font-medium">{entry.actor}</span>
                        </div>

                        {entry.details && (
                          <p className="text-gray-300 text-xs bg-tartan-navy/60 p-2.5 rounded-xl border border-slate-800">
                            {entry.details}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Action Footer Toolbar */}
        <div className="bg-tartan-dark/95 p-4 sm:p-5 border-t border-tartan-border flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Status:</span>
            <strong className="text-white uppercase">{booking.status.replace('_', ' ')}</strong>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end w-full sm:w-auto">
            
            {/* Pending actions */}
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={() => setIsDeclineModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800 flex items-center gap-1.5 transition"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-tartan-dark" />
                  <span>Approve & Send Brevo Invoice</span>
                </button>
              </>
            )}

            {/* Approved actions */}
            {isApproved && (
              <>
                <button
                  type="button"
                  onClick={() => openBrevoPreview(booking)}
                  className="px-4 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-200 text-xs font-semibold border border-tartan-border flex items-center gap-1.5 transition"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>View Brevo Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPayPalModal(booking)}
                  className="px-5 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#003087] text-white font-extrabold text-xs shadow flex items-center gap-1.5 transition"
                >
                  <CreditCard className="w-4 h-4 text-yellow-300" />
                  <span>Record / Test PayPal Deposit</span>
                </button>
              </>
            )}

            {/* Paid actions */}
            {isPaid && (
              <button
                type="button"
                onClick={() => openBrevoPreview(booking)}
                className="px-4 py-2.5 rounded-xl bg-green-950 hover:bg-green-900 text-green-300 text-xs font-semibold border border-green-800 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View Official Confirmed Receipt</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-tartan-navy hover:bg-slate-700 text-gray-300 text-xs font-semibold border border-tartan-border"
            >
              Close
            </button>

          </div>

        </div>

      </div>

      {/* Approve Confirmation Dialog */}
      {isApproveModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-tartan-card border border-tartan-gold rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-gradient/20 text-tartan-gold flex items-center justify-center border border-tartan-gold/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">Approve Booking Request?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Approving this request will automatically generate and send an official Brevo invoice email to <strong className="text-white">{booking.clientEmail}</strong> with the <strong className="text-tartan-gold">£{depositAmountInput}.00 PayPal deposit link</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-tartan-gold mb-1">
                Optional Personal Note in Approval Email:
              </label>
              <textarea
                rows={2}
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="e.g. Delighted to play for you! Looking forward to your special day."
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl p-2.5 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="flex-1 py-2.5 bg-tartan-navy hover:bg-slate-700 text-gray-300 text-xs font-semibold rounded-xl border border-tartan-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="flex-1 py-2.5 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-110"
              >
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Dialog */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-tartan-card border border-rose-600 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 flex items-center justify-center border border-rose-600/40">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">Decline Booking Request</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Provide a reason for declining availability for <strong className="text-white">{booking.clientName}</strong> on <strong className="text-white">{booking.date}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-tartan-gold mb-1">
                Reason for Declining:
              </label>
              <input
                type="text"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g. Prior wedding booking on Isle of Skye that day"
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-accent"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyClientOnDecline}
                onChange={(e) => setNotifyClientOnDecline(e.target.checked)}
                className="rounded border-slate-700 bg-tartan-dark text-tartan-gold focus:ring-0"
              />
              <span>Send polite notification email to client via Brevo</span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                className="flex-1 py-2.5 bg-tartan-navy hover:bg-slate-700 text-gray-300 text-xs font-semibold rounded-xl border border-tartan-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
