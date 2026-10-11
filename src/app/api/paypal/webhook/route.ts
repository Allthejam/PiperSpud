import { NextRequest, NextResponse } from 'next/server';
import { verifyPayPalWebhookSignature } from '@/lib/paypal';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BookingEvent, BookingAuditEntry } from '@/types/spud';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = JSON.parse(rawBody);

    const transmissionId = req.headers.get('paypal-transmission-id') || '';
    const transmissionTime = req.headers.get('paypal-transmission-time') || '';
    const certUrl = req.headers.get('paypal-cert-url') || '';
    const authAlgo = req.headers.get('paypal-auth-algo') || '';
    const transmissionSig = req.headers.get('paypal-transmission-sig') || '';
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || '1CD71679DE937282Y';

    // Verify webhook signature with PayPal if headers are present
    if (transmissionId && transmissionSig && certUrl && authAlgo) {
      const isValid = await verifyPayPalWebhookSignature({
        transmissionId,
        transmissionTime,
        certUrl,
        authAlgo,
        transmissionSig,
        webhookId,
        webhookEvent: event
      });

      if (!isValid) {
        console.warn('[PayPal Webhook] Signature verification failed');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const eventType = event.event_type;
    console.log(`[PayPal Webhook Received]: ${eventType} (ID: ${event.id})`);

    // Handle Payment Capture Completed
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const captureId = resource.id;
      const amountValue = resource.amount?.value;
      const customId = resource.custom_id;
      const payerEmail = resource.payer?.email_address || event.summary || '';

      const bookingId = customId || resource.supplementary_data?.related_ids?.order_id;
      const nowIso = new Date().toISOString();
      const formattedDate = new Date(nowIso).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      if (bookingId && db) {
        try {
          const bookingRef = doc(db, 'bookings', bookingId);
          const bookingSnap = await getDoc(bookingRef);

          if (bookingSnap.exists()) {
            const existingBk = bookingSnap.data() as BookingEvent;
            
            // Only update if not already marked as deposit paid
            if (existingBk.status !== 'deposit_paid') {
              const depositAmt = Number(amountValue) || existingBk.depositAmount || 100;
              const remainingBal = Math.max(0, existingBk.estimatedPrice - depositAmt);

              const auditEntry: BookingAuditEntry = {
                id: `audit-${Date.now()}`,
                timestamp: nowIso,
                action: 'PayPal Deposit Confirmed via Webhook',
                actor: 'PayPal Webhook Engine',
                details: `Deposit of £${depositAmt}.00 automatically captured via PayPal webhook on ${formattedDate}. Transaction ID: #${captureId}. Event date officially LOCKED in diary.`,
                type: 'status_change'
              };

              const updatedBooking: Partial<BookingEvent> = {
                status: 'deposit_paid',
                depositPaidAt: nowIso,
                depositAmountPaid: depositAmt,
                depositPaymentMethod: 'PayPal Webhook',
                paypalOrderId: captureId,
                depositPayerEmail: payerEmail,
                remainingBalance: remainingBal,
                auditTrail: [auditEntry, ...(existingBk.auditTrail || [])]
              };

              await updateDoc(bookingRef, updatedBooking);
              console.log(`[PayPal Webhook] Booking ${bookingId} locked in Firestore successfully!`);

              // Dispatch official confirmed receipt via Brevo
              try {
                const protocol = req.headers.get('x-forwarded-proto') || 'https';
                const host = req.headers.get('host') || 'spudthepiper.com';
                await fetch(`${protocol}://${host}/api/brevo/send`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'deposit_received',
                    booking: { ...existingBk, ...updatedBooking }
                  })
                });
                console.log(`[PayPal Webhook] Brevo confirmation email dispatched for booking ${bookingId}`);
              } catch (brevoErr) {
                console.error('[PayPal Webhook] Failed to dispatch Brevo receipt:', brevoErr);
              }
            }
          }
        } catch (dbErr) {
          console.error('[PayPal Webhook] Firestore error while updating booking:', dbErr);
        }
      }
    }

    return NextResponse.json({ received: true, eventType });
  } catch (error: any) {
    console.error('[PayPal Webhook Error]:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
