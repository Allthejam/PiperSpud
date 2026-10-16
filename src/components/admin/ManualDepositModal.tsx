'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { BookingEvent } from '@/types/spud';
import { 
  Building2, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  PoundSterling, 
  Calendar, 
  FileText, 
  Loader2, 
  Banknote, 
  PhoneCall, 
  HelpCircle,
  MailCheck
} from 'lucide-react';

interface ManualDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingEvent;
}

export const ManualDepositModal: React.FC<ManualDepositModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const { markDepositPaid, bookings } = useApp();

  const currentBooking = (bookings || []).find(b => b.id === booking.id) || booking;
  const initialDeposit = currentBooking.depositAmount || 100;
  const totalFee = currentBooking.estimatedPrice || initialDeposit;

  const [paymentMethod, setPaymentMethod] = useState<'BACS / Direct Bank Transfer' | 'Cash' | 'Card (Taken Over Phone)' | 'Cheque' | 'Other Offline'>('BACS / Direct Bank Transfer');
  const [depositAmount, setDepositAmount] = useState<number>(initialDeposit);
  const [referenceId, setReferenceId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [sendBrevoReceipt, setSendBrevoReceipt] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate dynamic sensible reference when modal opens or method changes
  useEffect(() => {
    if (isOpen) {
      const prefix = paymentMethod.includes('BACS') ? 'BACS' : paymentMethod.includes('Cash') ? 'CASH' : paymentMethod.includes('Phone') ? 'PHONE-CARD' : 'MANUAL';
      const cleanRef = `${prefix}-${currentBooking.id.slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      setReferenceId(cleanRef);
      setDepositAmount(currentBooking.depositAmount || 100);
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen, paymentMethod, currentBooking.id, currentBooking.depositAmount]);

  if (!isOpen) return null;

  const remainingBalance = Math.max(0, totalFee - depositAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) {
      setError('Please enter a valid deposit amount greater than £0.00.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await markDepositPaid(currentBooking.id, referenceId || `MANUAL-${Date.now().toString().slice(-6)}`, {
        method: paymentMethod,
        depositAmount,
        notes: notes.trim(),
        sendEmail: sendBrevoReceipt
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('[ManualDepositModal] Error recording deposit:', err);
      setError(err?.message || 'Failed to record deposit. Please check console.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-tartan-card text-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 border border-amber-500/40">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-tartan-navy text-white px-6 py-4 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif">Record Manual Deposit</h3>
              <p className="text-[11px] text-amber-200/80">Offline BACS, Cash or Phone Payment</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-white font-serif">Manual Deposit Confirmed!</h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto">
              £{depositAmount}.00 deposit recorded via <strong className="text-amber-300">{paymentMethod}</strong> (Ref: <span className="font-mono text-white">{referenceId}</span>).
            </p>
            <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-2xl p-4 text-xs font-semibold space-y-1 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Booking locked &amp; confirmed in diary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Remaining balance updated: £{remainingBalance}.00</span>
              </div>
              {sendBrevoReceipt && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Official Brevo confirmation receipt dispatched</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Booking Details Pill */}
            <div className="bg-tartan-dark/80 border border-tartan-border rounded-2xl p-3.5 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-tartan-border/60">
                <span className="text-gray-400 font-medium">Client / Event:</span>
                <span className="font-bold text-white font-serif">{currentBooking.clientName} ({currentBooking.eventType})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Date &amp; Venue:</span>
                <span className="text-amber-300 font-medium">{currentBooking.date} • {currentBooking.venueName}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-tartan-border/60 text-gray-300">
                <span>Total Performance Fee: <strong className="text-white">£{totalFee}.00</strong></span>
                <span>Remaining Due: <strong className="text-emerald-400">£{remainingBalance}.00</strong></span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Payment Method:
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="BACS / Direct Bank Transfer">🏦 BACS / Direct Bank Transfer</option>
                <option value="Cash">💵 Cash Payment (In Person)</option>
                <option value="Card (Taken Over Phone)">📞 Card Payment (Taken Over Phone)</option>
                <option value="Cheque">📜 Cheque / Bank Draft</option>
                <option value="Other Offline">📁 Other Offline Method</option>
              </select>
            </div>

            {/* Amount and Ref row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">
                  Deposit Amount (£):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">£</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-tartan-dark border border-tartan-border rounded-xl pl-7 pr-3 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-300">
                  Transaction / Bank Ref:
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="e.g. BACS-SMITH-100"
                  className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-300">
                Admin Notes / Bank Statement Memo (Optional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Verified on Santander online banking on 16 Oct"
                className="w-full bg-tartan-dark border border-tartan-border rounded-xl px-3 py-2.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Send Brevo Receipt Checkbox */}
            <div className="bg-slate-900/60 border border-tartan-border rounded-xl p-3 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="sendBrevoReceipt"
                checked={sendBrevoReceipt}
                onChange={(e) => setSendBrevoReceipt(e.target.checked)}
                className="mt-0.5 rounded border-gray-600 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="sendBrevoReceipt" className="text-xs text-gray-300 cursor-pointer leading-relaxed">
                <span className="font-semibold text-white flex items-center gap-1">
                  <MailCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Dispatch Brevo Official Booking Receipt
                </span>
                Sends official confirmation email to <strong className="text-amber-300">{currentBooking.clientEmail}</strong> confirming deposit receipt and remaining balance details.
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-tartan-dark hover:bg-slate-800 text-gray-300 text-xs font-semibold rounded-xl border border-tartan-border transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recording &amp; Locking...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Confirm Deposit &amp; Lock Date</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
