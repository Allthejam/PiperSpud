import { NextRequest, NextResponse } from 'next/server';
import { BookingEvent } from '@/types/spud';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      type, 
      booking, 
      paypalLink,
      to,
      name,
      replyMessage,
      recipientEmail: customRecipientEmail,
      recipientName: customRecipientName,
      subject: customSubject,
      messageContent: customMessageContent,
      originalQuestion
    } = body as {
      type: 'booking_approved' | 'booking_created' | 'deposit_received' | 'inquiry_reply' | 'custom';
      booking?: BookingEvent;
      paypalLink?: string;
      to?: string;
      name?: string;
      replyMessage?: string;
      recipientEmail?: string;
      recipientName?: string;
      subject?: string;
      messageContent?: string;
      originalQuestion?: string;
    };

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'spud@spudthepiper.co.uk';
    const senderName = process.env.BREVO_SENDER_NAME || 'Spud the Piper';

    let subject = '';
    let htmlContent = '';
    let recipientEmail = to || customRecipientEmail || booking?.clientEmail || '';
    let recipientName = name || customRecipientName || booking?.clientName || 'Valued Client';
    const finalMessageContent = replyMessage || customMessageContent || '';

    if (type === 'inquiry_reply' || (!booking && recipientEmail)) {
      subject = customSubject || `Regarding Your Bagpipe Inquiry - Spud the Piper`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #c5a059;">
          <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #c5a059; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 0.5px;">Spud The Piper</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Direct Reply from Spud</p>
          </div>

          <div style="background-color: #131d33; padding: 22px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Dear <strong style="color: #c5a059;">${recipientName}</strong>,
            </p>
            <div style="font-size: 14px; line-height: 1.7; color: #e2e8f0; white-space: pre-wrap; margin: 16px 0;">${finalMessageContent}</div>

            ${originalQuestion ? `
            <div style="background-color: #0b1120; border-radius: 10px; padding: 14px 16px; margin: 20px 0 10px 0; border-left: 3px solid #64748b;">
              <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold;">Your Inquiry:</p>
              <p style="margin: 0; font-size: 13px; color: #cbd5e1; font-style: italic;">"${originalQuestion}"</p>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
            <p style="margin: 0 0 4px 0;"><strong style="color: #ffffff;">Callum Fraser (Spud the Piper)</strong> • Scotland & Worldwide</p>
            <p style="margin: 0 0 4px 0;">📞 Phone / WhatsApp: <a href="tel:07793491367" style="color: #c5a059; text-decoration: none;">07793 491367</a> • 🌐 <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
          </div>
        </div>
      `;
    } else if (type === 'booking_approved' && booking) {
      const formattedDepositLink = paypalLink || (booking.depositAmount ? `https://paypal.me/spudthepiper/${booking.depositAmount}` : 'https://paypal.me/spudthepiper/50');
      subject = `🏴󠁧󠁢󠁳󠁣󠁴󠁿 Booking Approved: Spud the Piper for ${booking.eventType} on ${booking.date}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #c5a059;">
          <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #c5a059; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 0.5px;">Spud The Piper</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Official Booking Approval & Deposit Invoice</p>
          </div>

          <div style="background-color: #131d33; padding: 22px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Dear <strong style="color: #c5a059;">${booking.clientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              Great news! Callum Fraser (Spud the Piper) has personally reviewed your booking request and confirmed availability for your upcoming event.
            </p>

            <div style="background-color: #0b1120; border-radius: 10px; padding: 16px; margin: 18px 0; border-left: 4px solid #c5a059;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Event / Occasion:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.eventType}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Date & Time Slot:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.date} (${booking.timeSlot})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Venue & Location:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.venueName} (${booking.venuePostcode})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Highland Dress Attire:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.tartanChoice}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Total Performance Fee:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">£${booking.estimatedPrice}.00</td>
                </tr>
                <tr style="border-top: 1px dashed #334155;">
                  <td style="padding: 8px 0 0 0; color: #c5a059; font-weight: bold;">Provisional Deposit Required:</td>
                  <td style="padding: 8px 0 0 0; text-align: right; font-size: 16px; font-weight: bold; color: #c5a059;">£${booking.depositAmount}.00</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #cbd5e1;">
              To secure and officially lock this date in Spud's diary, please complete your £${booking.depositAmount}.00 deposit payment using the secure PayPal button below:
            </p>

            <div style="text-align: center; margin: 24px 0 16px 0;">
              <a href="${formattedDepositLink}" target="_blank" style="background: linear-gradient(135deg, #c5a059 0%, #dfb76c 100%); color: #0b1120; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(197, 160, 89, 0.3);">
                Pay £${booking.depositAmount}.00 Deposit via PayPal
              </a>
            </div>
          </div>

          <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">Spud The Piper • Aviemore, Highlands, Scotland • <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
            <p style="margin: 0;">Automated Dispatch Engine powered by Brevo Transactional Email</p>
          </div>
        </div>
      `;
    } else if (type === 'deposit_received' && booking) {
      subject = `✅ Deposit Received & Booking Locked: Spud the Piper (${booking.date})`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #22c55e;">
          <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #22c55e; margin: 0; font-size: 26px; font-family: Georgia, serif;">Official Deposit Receipt</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Booking Reference #${booking.id.slice(0, 8)}</p>
          </div>

          <div style="background-color: #131d33; padding: 22px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Dear <strong style="color: #c5a059;">${booking.clientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              Thank you! Your deposit payment of <strong style="color: #22c55e;">£${booking.depositAmount}.00</strong> has been successfully captured. Your booking date is now <strong style="color: #22c55e;">100% LOCKED IN</strong> on Spud's official diary.
            </p>

            <div style="background-color: #0b1120; border-radius: 10px; padding: 16px; margin: 18px 0; border-left: 4px solid #22c55e;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">Event Date: <strong style="color: #ffffff;">${booking.date}</strong></p>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">Slot: <strong style="color: #ffffff;">${booking.timeSlot}</strong></p>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">Venue: <strong style="color: #ffffff;">${booking.venueName}</strong></p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Remaining Balance Due on Event Day: <strong style="color: #ffffff;">£${Math.max(0, booking.estimatedPrice - booking.depositAmount)}.00</strong></p>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #cbd5e1;">
              Spud will be in touch closer to the date to confirm any final timing details or special tune selections.
            </p>
          </div>

          <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">Spud The Piper • Aviemore, Highlands, Scotland • <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
          </div>
        </div>
      `;
    } else if (booking) {
      // Notification to Spud on new booking creation
      recipientEmail = process.env.BREVO_FALLBACK_SENDER_EMAIL || 'piperspud@gmail.com';
      recipientName = 'Spud Fraser';
      subject = `🔔 New Booking Enquiry from ${booking.clientName} (${booking.date})`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1527; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #c5a059;">
          <h2 style="color: #c5a059; margin-top: 0;">New Booking Enquiry Received</h2>
          <p style="font-size: 14px; color: #e2e8f0;">A new provisional booking request has been submitted on your website diary:</p>
          <ul style="font-size: 13px; color: #cbd5e1; line-height: 1.8;">
            <li><strong>Client:</strong> ${booking.clientName} (${booking.clientPhone} • ${booking.clientEmail})</li>
            <li><strong>Preferred Contact:</strong> ${booking.preferredContactMethod === 'telephone' ? '📞 Telephone' : '✉️ Email'}</li>
            <li><strong>Event:</strong> ${booking.eventType}</li>
            <li><strong>Date & Slot:</strong> ${booking.date} (${booking.timeSlot})</li>
            <li><strong>Venue:</strong> ${booking.venueName} (${booking.venuePostcode})</li>
            <li><strong>Travel Logistics:</strong> ${booking.travelBreakdownText || 'Standard'}</li>
            <li><strong>Total Fee:</strong> £${booking.estimatedPrice}.00 (Deposit: £${booking.depositAmount}.00)</li>
          </ul>
          <p style="font-size: 13px; color: #94a3b8;">Log into your Back Office Admin Diary to review and approve with 1 click.</p>
        </div>
      `;
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'No recipient email specified' }, { status: 400 });
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey || '',
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const brevoData = await brevoRes.json();
    return NextResponse.json({ success: true, brevoResponse: brevoData });
  } catch (error: any) {
    console.error('Brevo Dispatch Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
