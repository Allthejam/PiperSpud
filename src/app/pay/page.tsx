'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { BookingEvent } from '@/types/spud';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MapPin, 
  Shirt, 
  AlertCircle, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

function PayContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id') || searchParams.get('booking');
  const { bookings, markDepositPaid } = useApp();

  const [booking, setBooking] = useState<BookingEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'BAARUfCcmsVa_xA5-qncZ9BEyIckeEocj54uxI2dh3wT3_ZrVr9lcb1RDgoW5qwkrxFeuPNVDpUvcKHIbY';

  useEffect(() => {
    if (bookingId && bookings) {
      const match = bookings.find(b => b.id === bookingId);
      if (match) {
        setBooking(match);
      }
    }
    setIsLoading(false);
  }, [bookingId, bookings]);

  const depositAmount = booking?.depositAmount || 100;

  const handleCreateOrder = async () => {
    setErrorMessage(null);
    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking?.id || bookingId,
          amount: depositAmount,
          description: `Spud the Piper - Deposit for ${booking?.eventType || 'Performance'} on ${booking?.date || 'Scheduled Date'}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || 'Failed to initialize PayPal order');
      }

      return data.id;
    } catch (err: any) {
      console.error('[PayPal create order error]:', err);
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
          bookingId: booking?.id || bookingId
        })
      });

      const captureData = await res.json();
      if (!res.ok || !captureData.success) {
        throw new Error(captureData.error || 'Payment capture failed');
      }

      const txRef = captureData.captureId || data.orderID;
      setTransactionId(txRef);
      setIsPaidSuccess(true);

      if (booking?.id) {
        await markDepositPaid(booking.id, txRef);
      }
    } catch (err: any) {
      console.error('[PayPal capture error]:', err);
      setErrorMessage(err.message || 'Payment authorization failed. Please try again or use another payment method.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 text-tartan-gold animate-spin" />
        <p className="text-xs text-gray-400">Loading your secure checkout details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
      
      {/* Top Shield Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Official PayPal Checkout • Spud the Piper</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Secure Deposit Payment
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
          Complete your deposit via PayPal, Debit, or Credit Card to officially reserve and lock your date in Spud&apos;s diary.
        </p>
      </div>

      {isPaidSuccess ? (
        <div className="bg-tartan-card border-2 border-emerald-500 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-5 animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Deposit Confirmed &amp; Date Locked!
            </h2>
            <p className="text-sm text-gray-300 max-w-md mx-auto">
              Your £{depositAmount}.00 deposit has been successfully captured. Callum Fraser (Spud) has been notified and your date is officially reserved.
            </p>
          </div>

          <div className="bg-tartan-dark/80 rounded-2xl p-4 border border-tartan-border text-xs text-gray-300 font-mono space-y-1">
            <p><strong>PayPal Transaction Reference:</strong> {transactionId}</p>
            <p><strong>Status:</strong> CONFIRMED &amp; DELIVERED</p>
          </div>

          <p className="text-xs text-gray-400">
            An official receipt email has been sent to your inbox via Brevo with full ceremony briefing notes and remaining balance information.
          </p>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-gradient text-tartan-dark font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:brightness-110 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Website</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-tartan-card border border-tartan-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Booking Summary Box */}
          {booking ? (
            <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/70 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-tartan-border/60 pb-3">
                <div>
                  <span className="text-gray-400 font-semibold block text-[11px]">Event Occasion</span>
                  <strong className="text-base text-white font-serif">{booking.eventType}</strong>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-semibold block text-[11px]">Deposit Required</span>
                  <strong className="text-xl text-tartan-gold font-bold">£{depositAmount}.00</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-300 pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span><strong>Date:</strong> {booking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span><strong>Time Slot:</strong> {booking.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span><strong>Venue:</strong> {booking.venueName} ({booking.venuePostcode})</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Shirt className="w-4 h-4 text-tartan-gold shrink-0" />
                  <span><strong>Attire:</strong> {booking.tartanChoice}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-tartan-border/60 text-gray-400 text-[11px]">
                <span>Total Performance Fee: <strong>£{booking.estimatedPrice}.00</strong></span>
                <span>Remaining Balance Due 1 Day Prior: <strong>£{Math.max(0, booking.estimatedPrice - depositAmount)}.00</strong></span>
              </div>
            </div>
          ) : (
            <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/70 text-xs text-gray-300 space-y-2">
              <div className="flex justify-between items-center">
                <span>Standard Performance Hold Deposit</span>
                <span className="text-xl text-tartan-gold font-bold">£{depositAmount}.00</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Booking Reference: <span className="font-mono text-gray-300">{bookingId || 'Direct Invoice'}</span>
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Processing Banner */}
          {isProcessing && (
            <div className="py-6 text-center space-y-2 bg-tartan-dark/50 rounded-2xl border border-tartan-border">
              <Loader2 className="w-8 h-8 text-tartan-gold animate-spin mx-auto" />
              <p className="text-xs text-gray-300 font-semibold">Authorizing payment with PayPal &amp; updating your booking...</p>
            </div>
          )}

          {/* PayPal Smart Buttons Container */}
          {!isProcessing && (
            <div className="space-y-4 pt-2">
              <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-inner">
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
                      height: 48
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

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL Encrypted • PayPal Buyer Protection • Instant Confirmation</span>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default function PayPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-tartan-gold animate-spin" />
          </div>
        }>
          <PayContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
