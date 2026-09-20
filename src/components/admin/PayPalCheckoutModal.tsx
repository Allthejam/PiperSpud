'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BookingEvent } from '@/types/spud';
import { CreditCard, CheckCircle2, X, ShieldCheck, Lock, Sparkles } from 'lucide-react';

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
  const { markDepositPaid } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedOrderId = `PP-TX-${Date.now().toString().slice(-7)}`;
      markDepositPaid(booking.id, generatedOrderId);
      setIsProcessing(false);
      setIsPaid(true);

      setTimeout(() => {
        setIsPaid(false);
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 border-2 border-[#0070BA]">
        
        {/* PayPal Top Banner */}
        <div className="bg-[#003087] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold italic text-[#0079C1]">Pay<span className="text-[#00457C]">Pal</span></span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white font-medium">Smart Checkout</span>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isPaid ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 border-2 border-green-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-serif">Payment Successful!</h3>
            <p className="text-xs text-gray-600">
              Deposit of <strong className="text-gray-900">£{booking.depositAmount}.00</strong> captured successfully. Booking status updated to <span className="text-green-700 font-bold">CONFIRMED</span> and Brevo confirmation receipt dispatched!
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Payee Details */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 font-semibold">Paying to:</p>
                <h4 className="text-base font-bold text-gray-900">Spud the Piper Ltd</h4>
                <p className="text-xs text-gray-500">{booking.eventType}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500">Deposit Due:</span>
                <div className="text-2xl font-extrabold text-[#003087]">£{booking.depositAmount}.00</div>
              </div>
            </div>

            {/* Event Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs space-y-1.5 text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Client:</span>
                <span className="font-bold">{booking.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-bold">{booking.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venue:</span>
                <span className="font-bold">{booking.venueName}</span>
              </div>
            </div>

            {/* Simulated Payment Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSimulatePayment}
                className="w-full py-3.5 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Authorizing PayPal Payment...</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Complete £{booking.depositAmount}.00 PayPal Deposit</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSimulatePayment}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Debit or Credit Card</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>256-Bit SSL Encrypted PayPal Gateway Simulation</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
