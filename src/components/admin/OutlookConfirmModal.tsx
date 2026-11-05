'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { BookingEvent, BookingStatus } from '@/types/spud';
import { 
  Mail, 
  Check, 
  X, 
  CreditCard, 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  Receipt,
  ArrowRight,
  Send
} from 'lucide-react';

interface OutlookConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingEvent | null;
  onConfirmSuccess?: (updated: BookingEvent) => void;
}

export const OutlookConfirmModal: React.FC<OutlookConfirmModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirmSuccess
}) => {
  const { updateBooking, addBookingAudit, addNotification } = useApp();

  const [hasPaymentBeenTaken, setHasPaymentBeenTaken] = useState<boolean>(false);
  const [amountPaidInput, setAmountPaidInput] = useState<string>('100');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer (BACS)');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [offlineNotes, setOfflineNotes] = useState<string>('Confirmed directly by Spud via Outlook.');
  const [sendReceiptEmail, setSendReceiptEmail] = useState<boolean>(true);
  const [sendInvoiceEmail, setSendInvoiceEmail] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (booking) {
      setAmountPaidInput(String(booking.depositAmount || 100));
      setPaymentRef(`BACS-${booking.clientName.split(' ')[0].toUpperCase()}`);
      setOfflineNotes(`Spud confirmed event details and availability directly with ${booking.clientName} via Outlook.`);
      setHasPaymentBeenTaken(false);
      setSendReceiptEmail(true);
      setSendInvoiceEmail(false);
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const totalFee = booking.estimatedPrice || (booking.depositAmount ? booking.depositAmount * 4 : 480);
  const depositDefault = booking.depositAmount || 100;
  const parsedAmountPaid = hasPaymentBeenTaken ? (parseFloat(amountPaidInput) || 0) : 0;
  const remainingBalance = Math.max(0, totalFee - parsedAmountPaid);
  const isFullySettled = hasPaymentBeenTaken && parsedAmountPaid >= totalFee && totalFee > 0;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const nowIso = new Date().toISOString();
    const formattedNow = new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    try {
      if (hasPaymentBeenTaken) {
        // Mode 1: Payment already received by Spud offline (BACS, Cash, etc.)
        const updatedStatus: BookingStatus = 'deposit_paid';
        const isRemainingZero = remainingBalance === 0;

        // Compute balance due date (day before event)
        let balanceDueDate = '';
        if (booking.date) {
          try {
            const d = new Date(booking.date);
            d.setDate(d.getDate() - 1);
            balanceDueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } catch (e) {}
        }

        const updates: Partial<BookingEvent> = {
          status: updatedStatus,
          approvedAt: nowIso,
          depositPaidAt: nowIso,
          depositAmountPaid: parsedAmountPaid,
          depositAmount: parsedAmountPaid,
          depositPaymentMethod: paymentMethod,
          paypalOrderId: paymentRef || `OFFLINE-${Date.now().toString().slice(-6)}`,
          remainingBalance: remainingBalance,
          remainingBalancePaid: isRemainingZero,
          remainingBalancePaidAt: isRemainingZero ? nowIso : undefined,
          balanceDueDate,
          notes: booking.notes 
            ? `${booking.notes}\n[${formattedNow}] Outlook Confirmation: Payment of £${parsedAmountPaid} received via ${paymentMethod}. Outstanding: £${remainingBalance}. Note: ${offlineNotes}`
            : `[${formattedNow}] Outlook Confirmation: Payment of £${parsedAmountPaid} received via ${paymentMethod}. Outstanding: £${remainingBalance}. Note: ${offlineNotes}`
        };

        await updateBooking(booking.id, updates);

        await addBookingAudit(
          booking.id,
          'Confirmed via Outlook & Offline Payment Recorded',
          'Spud The Piper (Admin)',
          `Booking confirmed offline via Outlook. Payment of £${parsedAmountPaid}.00 recorded via ${paymentMethod}. Ref: #${updates.paypalOrderId}. Remaining Balance: £${remainingBalance}.00. Event date & times locked in diary. Note: "${offlineNotes}"`,
          'status_change'
        );

        // Optionally send Brevo deposit receipt & balance invoice email
        if (sendReceiptEmail && booking.clientEmail) {
          try {
            fetch('/api/brevo/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'deposit_received',
                booking: { ...booking, ...updates },
                paypalLink: `https://spudthepiper.com/pay?id=${booking.id}`
              })
            }).catch(err => console.warn('Brevo receipt dispatch warning:', err));
          } catch (e) {
            console.warn(e);
          }
        }

        addNotification({
          type: 'booking_request',
          title: `Booking Confirmed via Outlook (£${parsedAmountPaid} Paid)`,
          message: `${booking.clientName} confirmed for ${booking.date} (${booking.timeSlot}). Payment: £${parsedAmountPaid} via ${paymentMethod}. Remaining: £${remainingBalance}.`,
          actionUrl: '/admin/bookings',
          relatedId: booking.id
        });

        if (onConfirmSuccess) {
          onConfirmSuccess({ ...booking, ...updates });
        }

      } else {
        // Mode 2: Approved via Outlook, but deposit awaiting payment
        const updates: Partial<BookingEvent> = {
          status: 'approved' as BookingStatus,
          approvedAt: nowIso,
          notes: booking.notes 
            ? `${booking.notes}\n[${formattedNow}] Approved via Outlook: Date confirmed offline. Awaiting deposit payment. Note: ${offlineNotes}`
            : `[${formattedNow}] Approved via Outlook: Date confirmed offline. Awaiting deposit payment. Note: ${offlineNotes}`
        };

        await updateBooking(booking.id, updates);

        await addBookingAudit(
          booking.id,
          'Booking Approved (Offline / Outlook Agreement)',
          'Spud The Piper (Admin)',
          `Approved offline via Outlook for date ${booking.date} (${booking.timeSlot}). Awaiting deposit of £${booking.depositAmount || 100}.00. Date locked in diary. Note: "${offlineNotes}"`,
          'status_change'
        );

        // Optionally send Brevo invoice with deposit payment link
        if (sendInvoiceEmail && booking.clientEmail) {
          try {
            fetch('/api/brevo/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'booking_approved',
                booking: { ...booking, ...updates },
                paypalLink: `https://spudthepiper.com/pay?id=${booking.id}`,
                replyMessage: offlineNotes
              })
            }).catch(err => console.warn('Brevo approval invoice dispatch warning:', err));
          } catch (e) {
            console.warn(e);
          }
        }

        addNotification({
          type: 'booking_request',
          title: 'Booking Approved (Outlook Agreement)',
          message: `${booking.clientName} confirmed for ${booking.date} (${booking.timeSlot}). Awaiting deposit payment.`,
          actionUrl: '/admin/bookings',
          relatedId: booking.id
        });

        if (onConfirmSuccess) {
          onConfirmSuccess({ ...booking, ...updates });
        }
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      console.error('Error confirming booking via Outlook:', err);
      alert('Could not update booking: ' + (err?.message || 'Unknown error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-tartan-card border-2 border-sky-500/80 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 text-gray-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-tartan-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-950 text-sky-400 border border-sky-600/60 flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-serif">
                Confirm Booking (Outlook / Offline Agreement)
              </h3>
              <p className="text-xs text-sky-300">
                Lock date in calendar &amp; start audit trail for offline communications
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client & Gig Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-tartan-border text-xs space-y-2">
          <div className="flex items-center justify-between text-white font-bold">
            <span className="text-sm font-serif text-tartan-gold">{booking.clientName}</span>
            <span className="text-gray-400">{booking.clientEmail}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-gray-300">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Calendar className="w-3.5 h-3.5 text-tartan-gold" />
              <span>{booking.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{booking.timeSlot || 'Times agreed'}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate col-span-2 text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{booking.venueName || 'Venue TBD'} ({booking.venuePostcode})</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-gray-400">Total Quoted Fee: <strong className="text-white">£{totalFee}.00</strong></span>
            <span className="text-gray-400">Standard Deposit: <strong className="text-tartan-gold">£{depositDefault}.00</strong></span>
          </div>
        </div>

        {/* Step 1: Has Spud Taken Payment? */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-tartan-gold uppercase tracking-wider">
            Step 1: Has Payment Been Received by Spud?
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Option A: No payment yet */}
            <button
              type="button"
              onClick={() => setHasPaymentBeenTaken(false)}
              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                !hasPaymentBeenTaken
                  ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg ring-1 ring-amber-400'
                  : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-amber-300">
                  <span>⏳ Awaiting Deposit</span>
                </span>
                {!hasPaymentBeenTaken && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[10px] text-gray-300 leading-tight">
                Date agreed in Outlook, but client has not paid deposit yet.
              </p>
            </button>

            {/* Option B: Payment already received */}
            <button
              type="button"
              onClick={() => setHasPaymentBeenTaken(true)}
              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                hasPaymentBeenTaken
                  ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-400'
                  : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-300">
                  <span>💰 Payment Received</span>
                </span>
                {hasPaymentBeenTaken && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[10px] text-gray-300 leading-tight">
                Spud has received BACS transfer, cash, or direct payment.
              </p>
            </button>
          </div>
        </div>

        {/* Dynamic Payment Details (Only if payment was received) */}
        {hasPaymentBeenTaken ? (
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-600/60 space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Payment &amp; Remaining Balance Details</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200 border border-emerald-500/40 font-bold">
                Direct Settlement
              </span>
            </div>

            {/* Amount Paid Input with Quick Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-gray-300">
                  Amount Received by Spud (£):
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAmountPaidInput(String(depositDefault))}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-tartan-gold border border-slate-700 font-bold"
                  >
                    Deposit: £{depositDefault}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmountPaidInput(String(totalFee))}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold"
                  >
                    Full Fee: £{totalFee}
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold">£</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-600/70 rounded-xl pl-7 pr-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            {/* Payment Method & Reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Payment Method:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="Bank Transfer (BACS)">Bank Transfer (BACS)</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Direct PayPal">Direct PayPal Transfer</option>
                  <option value="Card Over Phone">Card Over Phone</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other Offline">Other Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Payment Ref / Note:
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. BACS Ref #1234"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Live Balance Calculation Card */}
            <div className="p-3 rounded-xl bg-black/40 border border-emerald-800/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-300">
                <span>Total Quoted Performance Fee:</span>
                <span className="font-bold text-white">£{totalFee}.00</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>Payment Received ({paymentMethod}):</span>
                <span className="font-bold font-mono">-£{parsedAmountPaid}.00</span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-bold text-white text-sm">
                <span>Remaining Balance Due:</span>
                <span className={isFullySettled ? 'text-emerald-400 font-extrabold' : 'text-tartan-gold font-extrabold font-serif'}>
                  {isFullySettled ? '£0.00 (Fully Settled ✓)' : `£${remainingBalance}.00 (Due Before Gig)`}
                </span>
              </div>
            </div>

            {/* Checkbox: Send Official Receipt & Remaining Balance Invoice */}
            <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendReceiptEmail}
                onChange={(e) => setSendReceiptEmail(e.target.checked)}
                className="mt-0.5 rounded border-gray-700 text-emerald-500 focus:ring-0"
              />
              <span>
                <strong>Send Official Receipt &amp; Balance Statement</strong> to <span className="text-white underline">{booking.clientEmail}</span> via Brevo (showing £{parsedAmountPaid} paid and £{remainingBalance} remaining balance).
              </span>
            </label>
          </div>
        ) : (
          /* Option A Details (No payment taken yet) */
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/50 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Status will be marked: Approved (Awaiting Deposit)</span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              This locks the date (<strong className="text-white">{booking.date}</strong>) and time (<strong className="text-white">{booking.timeSlot}</strong>) into Spud&apos;s diary so no other client can book it.
            </p>

            <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendInvoiceEmail}
                onChange={(e) => setSendInvoiceEmail(e.target.checked)}
                className="mt-0.5 rounded border-gray-700 text-amber-500 focus:ring-0"
              />
              <span>
                <strong>Send Deposit Invoice &amp; Payment Link</strong> to <span className="text-white underline">{booking.clientEmail}</span> via Brevo so they can pay the £{depositDefault} deposit online. (Leave unchecked if Spud is handling payment directly in Outlook).
              </span>
            </label>
          </div>
        )}

        {/* Step 2: Audit Trail & Internal Notes */}
        <div>
          <label className="block text-[11px] font-semibold text-tartan-gold mb-1">
            Audit Trail &amp; Internal Record Note:
          </label>
          <textarea
            rows={2}
            value={offlineNotes}
            onChange={(e) => setOfflineNotes(e.target.value)}
            placeholder="e.g. Spud confirmed agreement on Outlook. Client agreed to pay deposit by Friday."
            className="w-full bg-slate-900 border border-tartan-border rounded-xl p-2.5 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-tartan-gold"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-tartan-border/80">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="flex-1 py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition"
          >
            {isSubmitting ? (
              <span>Updating Diary &amp; Audit...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-tartan-dark" />
                <span>Lock in Calendar &amp; Confirm</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
