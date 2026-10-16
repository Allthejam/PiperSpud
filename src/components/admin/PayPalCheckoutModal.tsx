'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BookingEvent } from '@/types/spud';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CreditCard, CheckCircle2, X, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingEvent;
}

export const PayPalCheckoutModal: React.FC<PayPalCheckoutModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const { markDepositPaid, bookings } = useApp();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState<string>('');

  if (!isOpen) return null;

  // Freshest booking data
  const currentBooking = (bookings || []).find(b => b.id === booking.id) || booking;
  const depositAmount = currentBooking.depositAmount || 100;
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'BAARUfCcmsVa_xA5-qncZ9BEyIckeEocj54uxI2dh3wT3_ZrVr9lcb1RDgoW5qwkrxFeuPNVDpUvcKHIbY';

  const handleCreateOrder = async () => {
    setErrorMessage(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: currentBooking.id,
          amount: depositAmount,
          description: `Spud the Piper - Deposit for ${currentBooking.eventType} on ${currentBooking.date}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || 'Failed to initialize PayPal order');
      }

      return data.id;
    } catch (err: any) {
      console.error('[PayPal create order failed]:', err);
      setErrorMessage(err.message || 'Unable to connect to PayPal. Please try again.');
      throw err;
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderID,
          bookingId: currentBooking.id
        })
      });

      const captureData = await res.json();
      if (!res.ok || !captureData.success) {
        throw new Error(captureData.error || 'Payment capture failed');
      }

      setPaidOrderId(captureData.captureId || data.orderID);
      setIsPaid(true);

      // Automatically update booking in state, Firestore, and dispatch Brevo receipt
      await markDepositPaid(currentBooking.id, captureData.captureId || data.orderID, { method: 'PayPal / Card' });

      setTimeout(() => {
        setIsPaid(false);
        onClose();
      }, 3500);
    } catch (err: any) {
      console.error('[PayPal capture order error]:', err);
      setErrorMessage(err.message || 'Payment authorization failed. Please check your card or balance.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 border-2 border-[#0070BA]">
        
        {/* PayPal Top Banner */}
        <div className="bg-[#003087] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-extrabold italic text-[#0079C1]">
              Pay<span className="text-white">Pal</span>
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
              Live Gateway
            </span>
            <span className="text-xs bg-white/10 text-white/90 border border-white/20 px-2 py-0.5 rounded font-medium">
              Take Phone / Card Payment
            </span>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isPaid ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 border-2 border-green-500 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-serif">Deposit Paid &amp; Date Locked!</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
              Deposit of <strong className="text-gray-900 font-bold">£{depositAmount}.00</strong> captured successfully via PayPal (Ref: <span className="font-mono text-xs text-gray-800">{paidOrderId}</span>).
            </p>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold">
              ✓ Booking marked CONFIRMED in diary<br />
              ✓ Official Brevo confirmation email sent with remaining balance details
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Payee Details */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Payee:</p>
                <h4 className="text-base font-bold text-gray-900">Spud the Piper</h4>
                <p className="text-xs text-gray-500">{currentBooking.eventType}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Deposit Due:</span>
                <div className="text-2xl font-extrabold text-[#003087]">£{depositAmount}.00</div>
              </div>
            </div>

            {/* Event Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs space-y-1.5 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Client:</span>
                <span className="font-bold text-gray-900">{currentBooking.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Date &amp; Time:</span>
                <span className="font-bold text-gray-900">{currentBooking.date} ({currentBooking.timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Venue:</span>
                <span className="font-bold text-gray-900">{currentBooking.venueName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span className="text-gray-500 font-medium">Total Performance Fee:</span>
                <span className="font-bold text-gray-900">£{currentBooking.estimatedPrice}.00</span>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Processing Spinner */}
            {isProcessing && (
              <div className="py-6 text-center space-y-2">
                <Loader2 className="w-8 h-8 text-[#0070BA] animate-spin mx-auto" />
                <p className="text-xs text-gray-600 font-medium">Capturing payment with PayPal &amp; locking diary date...</p>
              </div>
            )}

            {/* Real Live PayPal Smart Buttons */}
            {!isProcessing && (
              <div className="space-y-3 pt-1 min-h-[140px]">
                <PayPalScriptProvider
                  options={{
                    clientId: clientId,
                    currency: 'GBP',
                    intent: 'capture'
                  }}
                >
                  <PayPalButtons
                    style={{
                      layout: 'vertical',
                      color: 'gold',
                      shape: 'rect',
                      label: 'pay',
                      height: 44
                    }}
                    createOrder={handleCreateOrder}
                    onApprove={handleApprove}
                    onError={(err) => {
                      console.error('[PayPal Buttons Error]:', err);
                      setErrorMessage('PayPal gateway encountered an issue. Please try again.');
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1 border-t border-gray-100">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>Official PayPal Live SSL Encrypted Merchant Gateway</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
