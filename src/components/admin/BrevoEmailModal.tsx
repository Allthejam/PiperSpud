'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { BookingEvent } from '@/types/spud';
import { Mail, Check, X, CreditCard, ExternalLink, ShieldCheck, Sparkles, Send } from 'lucide-react';

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
  const { openPayPalModal } = useApp();

  if (!isOpen) return null;

  const handlePaypalClick = () => {
    onClose();
    openPayPalModal(booking);
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
          <div className="text-gray-400 font-mono text-[11px]">Template: spud_booking_approval_v2</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Header Details */}
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span><strong>From:</strong> Spud the Piper &lt;bookings@spudthepiper.co.uk&gt;</span>
            <span className="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded">Status: Delivered</span>
          </div>
          <div><strong>To:</strong> {booking.clientName} &lt;{booking.clientEmail}&gt;</div>
          <div><strong>Subject:</strong> Booking Approved! Your Deposit Link for {booking.eventType} on {booking.date}</div>
        </div>

        {/* Rendered HTML Email Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {/* Email Scottish Banner */}
          <div className="bg-[#0C1B33] text-white p-6 rounded-2xl text-center space-y-2 border border-[#D4AF37]/50 shadow-md">
            <h2 className="text-2xl font-bold font-serif text-[#F3C954] uppercase tracking-wide">
              Spud The Piper
            </h2>
            <p className="text-xs text-gray-300 uppercase tracking-widest font-semibold">
              Scotland\'s Premier Highland Bagpiper
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p className="text-base font-bold text-gray-900">
              Failte {booking.clientName},
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
                <p className="font-bold text-gray-900">{booking.eventType}</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Date & Time:</span>
                <p className="font-bold text-gray-900">{booking.date} ({booking.timeSlot})</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Venue:</span>
                <p className="font-bold text-gray-900">{booking.venueName}</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Highland Attire:</span>
                <p className="font-bold text-gray-900">{booking.tartanChoice}</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Total Fee:</span>
                <p className="font-bold text-gray-900">£{booking.estimatedPrice}.00</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold">Deposit Required:</span>
                <p className="font-bold text-amber-700 text-sm">£{booking.depositAmount}.00</p>
              </div>
              {booking.travelBreakdownText && (
                <div className="col-span-2 pt-2 border-t border-amber-200">
                  <span className="text-gray-500 font-semibold">Travel & Logistics:</span>
                  <p className="text-gray-800 font-medium">{booking.travelBreakdownText}</p>
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
              <span>Pay £{booking.depositAmount}.00 Deposit with PayPal</span>
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
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500">Brevo Transactional API Webhook Monitor</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs rounded-xl"
          >
            Close Email Preview
          </button>
        </div>

      </div>
    </div>
  );
};
