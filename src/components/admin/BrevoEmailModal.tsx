'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BookingEvent } from '@/types/spud';
import { Mail, Check, X, CreditCard, ExternalLink, ShieldCheck, Sparkles, Send, RefreshCw, AlertCircle, History } from 'lucide-react';

interface BrevoEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingEvent;
  paypalLink: string;
}

export const BrevoEmailModal: React.FC<BrevoEmailModalProps> = ({
  isOpen,
  onClose,
  booking,
  paypalLink
}) => {
  const { openPayPalModal, resendApprovalEmail, bookings } = useApp();
  const [isResending, setIsResending] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Use the freshest booking data from global state if available
  const currentBooking = (bookings || []).find(b => b.id === booking.id) || booking;

  // Calculate email dispatch count & history
  const emailHistory = currentBooking.brevoEmailHistory || [];
  const totalSends = Math.max(1, emailHistory.length);

  const handlePaypalClick = () => {
    onClose();
    openPayPalModal(currentBooking);
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendStatusMsg(null);
    try {
      console.log('[BrevoEmailModal] handleResend called for booking:', currentBooking);
      const result = await resendApprovalEmail(currentBooking);
      console.log('[BrevoEmailModal] resend result:', result);
      if (result.success) {
        const timeNow = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateNow = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        setResendStatusMsg({
          type: 'success',
          text: `Approval email successfully resent (Send #${result.sendCount || 2}) at ${timeNow} on ${dateNow}! Recorded in Audit Trail.`
        });
      } else {
        setResendStatusMsg({
          type: 'error',
          text: result.error || 'Failed to dispatch email. Please check internet connection.'
        });
      }
    } catch (err: any) {
      console.error('[BrevoEmailModal] error resending email:', err);
      setResendStatusMsg({
        type: 'error',
        text: err?.message || 'Unexpected error sending email.'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 border border-yellow-400">
        
        {/* Brevo Top Diagnostic Bar */}
        <div className="bg-slate-900 text-white px-6 py-3 text-xs flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="font-bold text-blue-300 flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              Brevo Transactional Email Engine • Live Preview
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-blue-900/60 text-blue-200 border border-blue-700 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
              Dispatched: {totalSends} {totalSends === 1 ? 'time' : 'times'}
            </span>
            <div className="text-gray-400 font-mono text-[11px] hidden sm:block">Template: spud_booking_approval_v2</div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Header Details */}
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span><strong>From:</strong> Spud the Piper &lt;bookings@spudthepiper.co.uk&gt;</span>
            <span className="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded flex items-center gap-1">
              <Check className="w-3 h-3" />
              Status: Delivered
            </span>
          </div>
          <div><strong>To:</strong> {currentBooking.clientName} &lt;{currentBooking.clientEmail}&gt;</div>
          <div><strong>Subject:</strong> Booking Approved! Your Deposit Link for {currentBooking.eventType} on {currentBooking.date}</div>
        </div>

        {/* Resend Status Banner if triggered */}
        {resendStatusMsg && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b animate-in fade-in ${
            resendStatusMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {resendStatusMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{resendStatusMsg.text}</span>
          </div>
        )}

        {/* Dispatch Log Pill Bar (shows all past sends with timestamps) */}
        {emailHistory.length > 0 && (
          <div className="bg-slate-50 px-6 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
            <span className="font-bold flex items-center gap-1 text-slate-800">
              <History className="w-3.5 h-3.5 text-blue-600" /> Dispatch History:
            </span>
            {emailHistory.map((item, idx) => (
              <span key={idx} className="bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-700 font-mono">
                #{idx + 1}: {new Date(item.sentAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            ))}
          </div>
        )}

        {/* Rendered HTML Email Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[58vh] overflow-y-auto">
          
          {/* Email Scottish Banner */}
          <div className="bg-[#0C1B33] text-white p-6 rounded-2xl text-center space-y-2 border border-[#D4AF37]/50 shadow-md">
            <h2 className="text-2xl font-bold font-serif text-[#F3C954] uppercase tracking-wide">
              Spud The Piper
            </h2>
            <p className="text-xs text-gray-300 uppercase tracking-widest font-semibold">
              Scotland&apos;s Premier Highland Bagpiper
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p className="text-base font-bold text-gray-900">
              Failte {currentBooking.clientName},
            </p>
            <p>
              I am delighted to confirm that your event request has been officially approved in my diary! I am looking forward to piping at your special occasion and making it truly unforgettable.
            </p>
          </div>

          {/* Event Summary Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3 text-xs text-gray-800">
            <h4 className="font-bold text-amber-900 uppercase tracking-wider text-sm border-b border-amber-200 pb-2">
              Event Details & Confirmation Summary
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 font-semibold">Occasion:</span>
                <p className="font-bold text-gray-900">{currentBooking.eventType}</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Date & Time:</span>
                <p className="font-bold text-gray-900">{currentBooking.date} ({currentBooking.timeSlot})</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Venue:</span>
                <p className="font-bold text-gray-900">{currentBooking.venueName}</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Highland Attire:</span>
                <p className="font-bold text-gray-900">{currentBooking.tartanChoice}</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Total Fee:</span>
                <p className="font-bold text-gray-900">£{currentBooking.estimatedPrice}.00</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Deposit Required:</span>
                <p className="font-bold text-amber-700 text-sm">£{currentBooking.depositAmount}.00</p>
              </div>
              {currentBooking.travelBreakdownText && (
                <div className="col-span-2 pt-2 border-t border-amber-200">
                  <span className="text-gray-500 font-semibold">Travel & Logistics:</span>
                  <p className="text-gray-800 font-medium">{currentBooking.travelBreakdownText}</p>
                </div>
              )}
            </div>
          </div>

          {/* PayPal Payment CTA in Email */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center space-y-3">
            <p className="text-xs text-gray-600">
              To lock in your date securely, please click below to complete your deposit via PayPal:
            </p>

            <button
              onClick={handlePaypalClick}
              className="px-8 py-3.5 bg-[#0070BA] hover:bg-[#003087] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <CreditCard className="w-5 h-5 text-yellow-300" />
              <span>Pay £{currentBooking.depositAmount}.00 Deposit with PayPal</span>
            </button>

            <p className="text-[11px] text-gray-400">
              Instant confirmation • PayPal Buyer Protection • Official Brevo Receipt Generated
            </p>
          </div>

          <div className="text-xs text-gray-500 border-t border-gray-200 pt-4">
            <p>If you have any tune alterations or questions, simply reply to this email or call 07793 491367.</p>
            <p className="mt-1 font-serif text-gray-800">Warm regards,<br /><strong>Spud the Piper</strong></p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Brevo Transactional API Webhook Monitor</span>
            {emailHistory.length > 1 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                Resent {emailHistory.length - 1} {emailHistory.length - 1 === 1 ? 'time' : 'times'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isResending}
              onClick={handleResend}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Resend this transactional email via Brevo and log to Audit Trail"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Resending via Brevo...' : 'Resend Email'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl"
            >
              Close Email Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
