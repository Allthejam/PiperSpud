'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Mail, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState<string>(emailParam);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'unsubscribed' | 'resubscribed' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string>('');
  const { optOutContact, optInContact } = useApp();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setFeedback('Please provide a valid email address.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);
    setFeedback('');

    try {
      // 1. Client-context update
      if (optOutContact) {
        await optOutContact(email, 'Client clicked unsubscribe link');
      }

      // 2. Server API route update
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'unsubscribe' })
      });
      const data = await res.json();

      if (res.ok && data?.success) {
        setStatus('unsubscribed');
        setFeedback(data.message || 'You have been opted out from seasonal announcements.');
      } else {
        setStatus('error');
        setFeedback(data?.error || 'Could not process unsubscribe request.');
      }
    } catch (err: any) {
      // Even if offline, local context opt-out succeeded
      setStatus('unsubscribed');
      setFeedback('You have been opted out from seasonal announcements.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubscribe = async () => {
    if (!email) return;
    setIsSubmitting(true);
    try {
      if (optInContact) {
        await optInContact(email);
      }
      await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'resubscribe' })
      });
      setStatus('resubscribed');
      setFeedback('You are once again subscribed to Spud the Piper seasonal updates and announcements!');
    } catch (err: any) {
      setStatus('error');
      setFeedback('Failed to resubscribe. Please contact info@spudthepiper.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-gray-200 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full space-y-8 my-auto">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block group">
            <span className="text-xs uppercase tracking-[0.25em] text-tartan-gold font-bold block mb-1">
              Traditional Highland Bagpiper • Scotland
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white group-hover:text-tartan-gold transition-colors">
              Spud The Piper
            </h1>
          </Link>
          <div className="w-16 h-0.5 bg-tartan-gold/60 mx-auto mt-3"></div>
        </div>

        {/* Card */}
        <div className="bg-[#0f172a] rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6">
          
          {status === 'idle' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-tartan-gold">
                <Mail className="w-6 h-6 shrink-0" />
                <h2 className="text-xl font-serif font-bold text-white">
                  Email Preferences & Unsubscribe
                </h2>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">
                You are currently managing subscription preferences for Spud the Piper&apos;s seasonal broadcasts, festive greetings, and Highland newsletters.
              </p>

              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-[#090f1d] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-tartan-gold transition-colors"
                  />
                </div>

                {/* Important reassurance banner */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-300 mb-0.5">Your Event Bookings Remain 100% Safe</p>
                    <p className="text-gray-300 leading-relaxed">
                      Opting out here strictly removes your email from marketing and seasonal newsletter broadcasts. Any wedding, funeral, or party bookings you have confirmed with Spud remain secure in our diary.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="flex-1 bg-red-950/80 hover:bg-red-900 border border-red-600/60 text-red-100 font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Unsubscribe from Mailing List</span>
                    )}
                  </button>
                  <Link
                    href="/"
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 text-sm font-semibold text-center transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          )}

          {status === 'unsubscribed' && (
            <div className="text-center space-y-5 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-white">
                  You Have Been Unsubscribed
                </h2>
                <p className="text-xs text-gray-400">
                  Email: <span className="text-tartan-gold font-mono">{email}</span>
                </p>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
                {feedback || 'You will no longer receive seasonal announcements or newsletter broadcasts from Spud the Piper.'}
              </p>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs text-gray-400 space-y-1 text-left">
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Client Diary Notice</span>
                </p>
                <p>
                  If you have an active booking or wedding in Spud&apos;s diary, your event schedule and direct operational arrangements remain completely intact and active.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleResubscribe}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 border border-slate-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>Unsubscribed by mistake? Resubscribe</span>
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-bold shadow-md hover:brightness-110 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Homepage</span>
                </Link>
              </div>
            </div>
          )}

          {status === 'resubscribed' && (
            <div className="text-center space-y-5 animate-in fade-in">
              <div className="w-14 h-14 bg-tartan-gold/10 border border-tartan-gold/30 rounded-full flex items-center justify-center mx-auto text-tartan-gold">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-white">
                  Welcome Back!
                </h2>
                <p className="text-sm text-gray-300 max-w-md mx-auto">
                  {feedback || 'You have been resubscribed to Spud the Piper announcements and seasonal greetings.'}
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-tartan-dark text-xs font-bold shadow-lg hover:brightness-110 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Homepage</span>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-5 animate-in fade-in">
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-white">
                  Subscription Notice
                </h2>
                <p className="text-sm text-red-300 max-w-md mx-auto">
                  {feedback}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setStatus('idle')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-300 transition-colors"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Spud The Piper • Aviemore, Highlands, Scotland</p>
          <p>© {new Date().getFullYear()} Spud The Piper. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070d18] flex items-center justify-center text-tartan-gold">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
