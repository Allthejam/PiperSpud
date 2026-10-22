'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  MapPin, 
  User, 
  Mail, 
  ArrowLeft,
  AlertCircle,
  Ban,
  Receipt,
  Sparkles
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { TillCharge } from '@/types/spud';
import Link from 'next/link';

function CustomerTillPaymentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chargeId = (params?.id as string) || '';

  // Zero-latency URL fallback parameters
  const urlAmount = parseFloat(searchParams?.get('amount') || '0');
  const urlDesc = searchParams?.get('desc') || '';
  const urlLoc = searchParams?.get('loc') || '';
  const urlName = searchParams?.get('name') || '';
  const urlEmail = searchParams?.get('email') || '';
  const urlBookingId = searchParams?.get('bookingId') || '';

  const [charge, setCharge] = useState<TillCharge | null>(
    urlAmount > 0
      ? {
          id: chargeId,
          amount: urlAmount,
          currency: 'GBP',
          description: urlDesc || 'Highland Bagpipe Performance',
          customerName: urlName || null,
          customerEmail: urlEmail || null,
          eventLocation: urlLoc || 'Live Highland Performance',
          bookingId: urlBookingId || null,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      : null
  );

  const [isLoading, setIsLoading] = useState(!charge);
  const [customerName, setCustomerName] = useState(urlName || '');
  const [customerEmail, setCustomerEmail] = useState(urlEmail || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<{
    orderId: string;
    payerName: string;
    payerEmail: string;
    amount: number;
  } | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'BAARUfCcmsVa_xA5-qncZ9BEyIckeEocj54uxI2dh3wT3_ZrVr9lcb1RDgoW5qwkrxFeuPNVDpUvcKHIbY';

  // Listen to Firestore for live status updates
  useEffect(() => {
    if (!db || !chargeId) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'till_charges', chargeId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setIsLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.data() as TillCharge;
          setCharge(data);
          if (data.customerName && !customerName) setCustomerName(data.customerName);
          if (data.customerEmail && !customerEmail) setCustomerEmail(data.customerEmail);
          if (data.status === 'paid') {
            setIsSuccess(true);
            setReceiptDetails({
              orderId: data.paypalOrderId || chargeId,
              payerName: data.payerName || data.customerName || 'Client',
              payerEmail: data.payerEmail || data.customerEmail || '',
              amount: data.amount
            });
          }
        }
      },
      (err) => {
        console.warn('[Till Pay] Firestore listener warning:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chargeId]);

  const handleCreateOrder = async () => {
    setErrorMessage(null);
    const amountToCharge = charge?.amount || urlAmount;
    if (!amountToCharge || amountToCharge <= 0) {
      throw new Error('Invalid payment amount');
    }

    const trimmedName = customerName.trim();
    if (trimmedName.length < 2) {
      const err = 'Please enter your Full Name above before completing payment.';
      setErrorMessage(err);
      throw new Error(err);
    }

    const trimmedEmail = customerEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      const err = 'Please enter a valid Email Address above to receive your official payment receipt.';
      setErrorMessage(err);
      throw new Error(err);
    }

    try {
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargeId: chargeId,
          bookingId: charge?.bookingId || undefined,
          amount: amountToCharge,
          description: `Spud the Piper: ${charge?.description || 'Event Payment'}`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || 'Failed to initialize PayPal order');
      }
      return data.id;
    } catch (err: any) {
      console.error('[Till Pay] Create order error:', err);
      setErrorMessage(err.message || 'Unable to open payment gateway.');
      throw err;
    }
  };

  const handleApprove = async (data: any) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderID,
          chargeId: chargeId,
          bookingId: charge?.bookingId || undefined
        })
      });

      const captureData = await res.json();
      if (!res.ok || !captureData.success) {
        throw new Error(captureData.error || 'Payment capture could not be completed');
      }

      const finalAmount = charge?.amount || urlAmount;
      const finalPayerEmail = customerEmail.trim() || captureData.payerEmail || 'client@spudthepiper.com';
      const finalPayerName = customerName.trim() || captureData.payerName || 'Valued Guest';

      // 1. Update Firestore till_charges document
      if (db && chargeId) {
        try {
          const docRef = doc(db, 'till_charges', chargeId);
          await setDoc(
            docRef,
            {
              id: chargeId,
              amount: finalAmount,
              currency: 'GBP',
              description: charge?.description || urlDesc || 'Highland Bagpipe Performance',
              customerName: finalPayerName,
              customerEmail: finalPayerEmail,
              eventLocation: charge?.eventLocation || urlLoc || 'Live Highland Performance',
              bookingId: charge?.bookingId || null,
              status: 'paid',
              paypalOrderId: data.orderID,
              paypalCaptureId: captureData.captureId || data.orderID,
              payerName: finalPayerName,
              payerEmail: finalPayerEmail,
              paymentMethod: 'paypal',
              paidAt: new Date().toISOString()
            },
            { merge: true }
          );

          // Permanently save client details into mailing_contacts / CRM database
          const contactId = `contact_${finalPayerEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
          await setDoc(doc(db, 'mailing_contacts', contactId), {
            id: contactId,
            name: finalPayerName,
            email: finalPayerEmail,
            source: 'manual',
            status: 'subscribed',
            tags: ['Event Till', 'Live Performance'],
            location: charge?.eventLocation || urlLoc || 'Live Highland Performance',
            addedAt: new Date().toISOString(),
            notes: `Customer paid at Highland Event Till for: ${charge?.description || urlDesc || 'Performance'} (£${finalAmount.toFixed(2)}) • Ref #${data.orderID}`,
            brevoSynced: false
          }, { merge: true });
        } catch (dbErr) {
          console.error('[Till Pay] Firestore save notice:', dbErr);
        }
      }

      // 2. Dispatch official digital receipt via Brevo
      try {
        await fetch('/api/brevo/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'till_receipt',
            tillCharge: {
              id: chargeId,
              amount: finalAmount,
              description: charge?.description || urlDesc || 'Highland Bagpipe Performance',
              customerName: finalPayerName,
              customerEmail: finalPayerEmail,
              eventLocation: charge?.eventLocation || urlLoc || 'Live Highland Performance',
              paypalOrderId: data.orderID,
              paymentMethod: 'PayPal / Card'
            }
          })
        });
      } catch (emailErr) {
        console.warn('[Till Pay] Receipt email error:', emailErr);
      }

      setReceiptDetails({
        orderId: data.orderID,
        payerName: finalPayerName,
        payerEmail: finalPayerEmail,
        amount: finalAmount
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('[Till Pay] Capture exception:', err);
      setErrorMessage(err.message || 'Payment processing error. Please check your card or PayPal details.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading && !charge) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-10 h-10 text-tartan-gold animate-spin" />
        <p className="text-sm font-medium text-gray-300">Connecting to Spud&apos;s Highland Till...</p>
      </div>
    );
  }

  if (!charge) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-white">Payment Session Expired</h2>
          <p className="text-xs text-gray-400">
            This checkout session is no longer active. Please ask Spud to generate a fresh QR code on his phone.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-tartan-card border border-tartan-border rounded-xl text-xs font-bold text-white hover:border-tartan-gold transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-tartan-gold" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  if (charge.status === 'cancelled') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-400 mx-auto flex items-center justify-center">
          <Ban className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-white">Payment Request Cancelled</h2>
          <p className="text-xs text-gray-400">
            Spud has cancelled or refreshed this payment request. No funds have been charged.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-tartan-card border border-tartan-border rounded-xl text-xs font-bold text-white hover:border-tartan-gold transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-tartan-gold" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
      
      {/* Header Badge */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tartan-accent/15 border border-tartan-accent/40 text-tartan-gold text-xs font-semibold">
          <Receipt className="w-3.5 h-3.5" />
          <span>Highland Event Point-of-Sale • Official Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
          Spud the Piper
        </h1>
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-tartan-gold shrink-0" />
          <span>{charge.eventLocation || 'Live Highland Performance'}</span>
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-tartan-card border-2 border-tartan-border rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

        {isSuccess ? (
          /* Success Receipt Card */
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-950/80 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-extrabold uppercase tracking-wider">
                Payment Completed
              </span>
              <h2 className="text-2xl font-bold text-white font-serif pt-2">
                Thank You, {receiptDetails?.payerName || 'Friend'}!
              </h2>
              <p className="text-xs text-gray-300">
                Your payment to Spud the Piper was successfully authorized and completed.
              </p>
            </div>

            <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/70 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-tartan-border/60 pb-2">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  £{(receiptDetails?.amount || charge.amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400">Description:</span>
                <span className="text-white font-semibold">{charge.description}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400">Location:</span>
                <span className="text-white">{charge.eventLocation || 'Highland Gathering'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-tartan-border/40 font-mono">
                <span className="text-gray-400">Transaction Ref:</span>
                <span className="text-tartan-gold text-[10px]">{receiptDetails?.orderId}</span>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-2xl p-3.5 text-xs text-emerald-300 text-center">
              A digital receipt has been dispatched to <strong>{receiptDetails?.payerEmail || 'your email'}</strong>. Please show this screen to Spud if needed!
            </div>

            <Link
              href="/"
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 text-tartan-dark font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Spud&apos;s Music &amp; Gallery</span>
            </Link>
          </div>
        ) : (
          /* Payment Form View */
          <div className="space-y-6">
            
            {/* Amount & Description Pill */}
            <div className="bg-tartan-dark/90 rounded-2xl p-5 border border-tartan-border/80 text-center space-y-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Total Amount Due</span>
              <div className="text-4xl font-extrabold text-tartan-gold font-serif">
                £{charge.amount.toFixed(2)}
              </div>
              <p className="text-xs text-white font-medium pt-1">
                {charge.description}
              </p>
            </div>

            {/* Customer Contact Details (Mandatory) */}
            <div className="space-y-3 bg-tartan-dark/50 p-4 rounded-2xl border border-tartan-border/60">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-200 uppercase tracking-wider block">
                  Customer Details
                </label>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  * Mandatory for Receipt
                </span>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Full Name (e.g. John MacLeod)"
                    className={`w-full bg-tartan-dark border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      customerName.trim().length >= 2 
                        ? 'border-emerald-500/60 focus:border-emerald-400' 
                        : 'border-amber-500/70 focus:border-amber-400'
                    }`}
                  />
                </div>

                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Your Email for Official Receipt (e.g. john@example.com)"
                    className={`w-full bg-tartan-dark border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors ${
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
                        ? 'border-emerald-500/60 focus:border-emerald-400' 
                        : 'border-amber-500/70 focus:border-amber-400'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mandatory Fields Reminder Banner */}
            {(!customerName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Please enter your Name and Email above to activate checkout and receive your digital receipt.</span>
              </div>
            )}

            {/* Processing Loader */}
            {isProcessing && (
              <div className="py-6 text-center space-y-2 bg-tartan-dark/80 rounded-2xl border border-tartan-border">
                <Loader2 className="w-8 h-8 text-tartan-gold animate-spin mx-auto" />
                <p className="text-xs text-gray-200 font-semibold">Authorizing payment with PayPal &amp; issuing receipt...</p>
              </div>
            )}

            {/* PayPal Smart Payment Buttons */}
            {!isProcessing && (
              <div className="space-y-4 pt-1">
                <div className="bg-white rounded-2xl p-4 shadow-inner">
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
                        console.error('[Till PayPal Error]:', err);
                        setErrorMessage('PayPal gateway issue. Please try card or alternative method.');
                      }}
                    />
                  </PayPalScriptProvider>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit SSL • Card / Apple Pay / Google Pay / PayPal • Instant Notification</span>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default function CustomerTillPaymentPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-tartan-gold animate-spin" />
            </div>
          }
        >
          <CustomerTillPaymentContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
