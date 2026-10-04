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
      originalQuestion,
      visitorPhone,
      eventType,
      eventDate
    } = body as {
      type: 
        | 'booking_approved' 
        | 'booking_created' 
        | 'deposit_received' 
        | 'inquiry_reply' 
        | 'admin_inquiry_alert' 
        | 'admin_chat_alert' 
        | 'client_balance_reminder_7day'
        | 'admin_event_reminder_7day'
        | 'admin_event_reminder_1day'
        | 'client_balance_reminder_1day'
        | 'balance_paid_receipt'
        | 'custom';
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
      visitorPhone?: string;
      eventType?: string;
      eventDate?: string;
    };

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'info@spudthepiper.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Spud the Piper';
    const adminAlertEmail = process.env.BREVO_ADMIN_ALERT_EMAIL || 'Spud@spudthepiper.com';
    const trustpilotInviteEmail = process.env.TRUSTPILOT_INVITE_EMAIL || 'spudthepiper.com+aebdc308b6@invite.trustpilot.com';

    let subject = '';
    let htmlContent = '';
    let recipientEmail = to || customRecipientEmail || booking?.clientEmail || '';
    let recipientName = name || customRecipientName || booking?.clientName || 'Valued Client';
    const finalMessageContent = replyMessage || customMessageContent || '';

    const formatEventDate = (dateStr?: string) => {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    const getDayBeforeFormatted = (dateStr?: string) => {
      if (!dateStr) return 'Day before event';
      try {
        const d = new Date(dateStr);
        d.setDate(d.getDate() - 1);
        return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) {
        return 'Day prior to event';
      }
    };

    // ================= 1. Direct Email Reply from Spud to Client =================
    if (type === 'inquiry_reply' || (!booking && type !== 'admin_inquiry_alert' && type !== 'admin_chat_alert' && recipientEmail && recipientEmail !== adminAlertEmail)) {
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
    } 
    // ================= 2. Instant Alert to Spud for Offline Email Inquiry / Contact Form =================
    else if (type === 'admin_inquiry_alert') {
      recipientEmail = adminAlertEmail;
      recipientName = 'Spud Fraser';
      subject = `🔔 New Website Inquiry: ${name || 'Visitor'} ${eventDate ? `(${eventDate})` : ''}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 28px 24px; border-radius: 16px; border: 1px solid #c5a059;">
          <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
            <span style="background-color: #9333ea; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">New Website Inquiry</span>
            <h2 style="color: #c5a059; margin: 12px 0 4px 0; font-size: 22px; font-family: Georgia, serif;">Inquiry Received on spudthepiper.com</h2>
            <p style="color: #94a3b8; margin: 0; font-size: 13px;">A potential client has submitted an inquiry via your website:</p>
          </div>

          <div style="background-color: #131d33; padding: 20px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; width: 35%;">Client Name:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${name || 'Website Visitor'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Email Address:</td>
                <td style="padding: 6px 0; font-weight: bold;"><a href="mailto:${customRecipientEmail || to}" style="color: #c5a059; text-decoration: underline;">${customRecipientEmail || to || 'Not provided'}</a></td>
              </tr>
              ${visitorPhone ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Phone Number:</td>
                <td style="padding: 6px 0; font-weight: bold;"><a href="tel:${visitorPhone}" style="color: #22c55e; text-decoration: none;">${visitorPhone}</a></td>
              </tr>
              ` : ''}
              ${eventType ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Event / Occasion:</td>
                <td style="padding: 6px 0; color: #ffffff;">${eventType}</td>
              </tr>
              ` : ''}
              ${eventDate ? `
              <tr>
                <td style="padding: 6px 0; color: #94a3b8;">Event Date:</td>
                <td style="padding: 6px 0; color: #facc15; font-weight: bold;">${eventDate}</td>
              </tr>
              ` : ''}
            </table>

            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed #334155;">
              <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; display: block; margin-bottom: 6px;">Client's Question / Message:</span>
              <div style="background-color: #0b1120; border-radius: 8px; padding: 14px; color: #e2e8f0; font-size: 14px; line-height: 1.6; border-left: 3px solid #c5a059;">
                ${finalMessageContent || originalQuestion || 'No message provided'}
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 24px 0 10px 0;">
            <a href="https://spudthepiper.com/admin" target="_blank" style="background: linear-gradient(135deg, #c5a059 0%, #dfb76c 100%); color: #0b1120; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
              Open Message Center to Reply
            </a>
          </div>
        </div>
      `;
    }
    // ================= 3. Instant Alert to Spud for Live Chat Messages =================
    else if (type === 'admin_chat_alert') {
      recipientEmail = adminAlertEmail;
      recipientName = 'Spud Fraser';
      subject = `💬 Live Chat from ${name || 'Website Visitor'}`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 28px 24px; border-radius: 16px; border: 1px solid #38bdf8;">
          <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
            <span style="background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Live Chat Message</span>
            <h2 style="color: #38bdf8; margin: 12px 0 4px 0; font-size: 22px; font-family: Georgia, serif;">Incoming Live Message from ${name || 'Visitor'}</h2>
            <p style="color: #94a3b8; margin: 0; font-size: 13px;">A visitor is waiting on your live website chat right now:</p>
          </div>

          <div style="background-color: #131d33; padding: 20px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 20px;">
            <div style="background-color: #0b1120; border-radius: 8px; padding: 16px; color: #f8fafc; font-size: 15px; line-height: 1.6; border-left: 4px solid #38bdf8;">
              "${finalMessageContent}"
            </div>

            <div style="margin-top: 14px; font-size: 12px; color: #94a3b8;">
              ${to || customRecipientEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${to || customRecipientEmail}</p>` : ''}
              ${visitorPhone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${visitorPhone}</p>` : ''}
            </div>
          </div>

          <div style="text-align: center; margin: 24px 0 10px 0;">
            <a href="https://spudthepiper.com/admin" target="_blank" style="background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%); color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
              Reply Live in Back Office
            </a>
          </div>
        </div>
      `;
    }
    // ================= 3.5 Booking Request Received (Client Confirmation & Admin Alert) =================
    else if (type === 'booking_created' && booking) {
      recipientEmail = booking.clientEmail;
      recipientName = booking.clientName || 'Valued Client';
      subject = `🏴󠁧󠁢󠁳󠁣󠁴󠁿 Booking Request Received: Spud the Piper (${booking.eventType} - ${formatEventDate(booking.date)})`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #c5a059;">
          <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #c5a059; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 0.5px;">Spud The Piper</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Booking Request Received • Under Review</p>
          </div>

          <div style="background-color: #131d33; padding: 22px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Dear <strong style="color: #c5a059;">${booking.clientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              Thank you for choosing Spud the Piper! We have successfully received your provisional booking request for <strong style="color: #ffffff;">${booking.eventType}</strong> on <strong style="color: #facc15;">${formatEventDate(booking.date)}</strong>.
            </p>

            <!-- Event Summary Box -->
            <div style="background-color: #0b1120; border-radius: 10px; padding: 16px; margin: 18px 0; border-left: 4px solid #c5a059;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Event / Occasion:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.eventType}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Requested Date:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${formatEventDate(booking.date)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Preferred Time Slot:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Venue & Location:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.venueName} (${booking.venuePostcode})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Highland Dress Style:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.tartanChoice}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Requested Bagpipe Tunes:</td>
                  <td style="padding: 6px 0; text-align: right; color: #facc15; font-weight: bold;">${(booking.specialTunes || []).join(', ') || 'Traditional Scottish Repertoire'}</td>
                </tr>
                <tr style="border-top: 1px dashed #334155;">
                  <td style="padding: 6px 0; color: #94a3b8;">Estimated Total Fee:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">£${booking.estimatedPrice}.00</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #c5a059; font-weight: bold;">Provisional Deposit (upon approval):</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #c5a059;">£${booking.depositAmount}.00</td>
                </tr>
              </table>
            </div>

            <!-- What Happens Next Box -->
            <div style="background-color: #1e293b; border-radius: 10px; padding: 16px; margin: 18px 0; border: 1px solid #334155;">
              <h3 style="color: #facc15; margin: 0 0 8px 0; font-size: 14px;">📋 What Happens Next?</h3>
              <ul style="font-size: 13px; color: #cbd5e1; line-height: 1.6; margin: 0; padding-left: 18px;">
                <li>Callum (Spud) will personally check his private diary and travel logistics for your date.</li>
                <li>Once verified, you will receive an <strong>Official Approval Confirmation Email</strong> containing your secure PayPal deposit link.</li>
                <li>Completing your £${booking.depositAmount}.00 deposit officially locks your date in Spud's diary.</li>
                <li><strong>No payment is required right now.</strong></li>
              </ul>
            </div>

            ${booking.notes ? `
            <div style="margin-top: 14px; padding: 12px; background-color: #0b1120; border-radius: 8px; border: 1px solid #1e293b; font-size: 12px;">
              <strong style="color: #94a3b8; display: block; margin-bottom: 4px;">Your Notes / Instructions:</strong>
              <span style="color: #e2e8f0; font-style: italic;">"${booking.notes}"</span>
            </div>
            ` : ''}

            <div style="margin-top: 20px; font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px dashed #334155; padding-top: 12px;">
              <p style="margin: 0 0 4px 0;">If you need to make any quick adjustments or have questions, feel free to reply directly to this email or call Spud on <a href="tel:07793491367" style="color: #c5a059; text-decoration: none; font-weight: bold;">07793 491367</a>.</p>
            </div>
          </div>

          <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">Spud The Piper • Aviemore, Highlands, Scotland • <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
            <p style="margin: 0;">Automated Booking Dispatch powered by Brevo Transactional Email</p>
          </div>
        </div>
      `;

      // Also trigger a background copy / alert to Spud so he is instantly alerted
      if (adminAlertEmail && apiKey) {
        try {
          fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': apiKey,
              'Content-Type': 'application/json',
              'accept': 'application/json'
            },
            body: JSON.stringify({
              sender: { name: senderName, email: senderEmail },
              to: [{ email: adminAlertEmail, name: 'Spud Fraser' }],
              subject: `🔔 New Booking Request: ${booking.clientName} (${booking.eventType} - ${booking.date})`,
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1527; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #c5a059;">
                  <h2 style="color: #c5a059; margin-top: 0;">New Booking Request Received</h2>
                  <p style="font-size: 14px; color: #e2e8f0;">A new provisional booking request was just submitted on your website:</p>
                  <ul style="font-size: 13px; color: #cbd5e1; line-height: 1.8;">
                    <li><strong>Client:</strong> ${booking.clientName} (<a href="tel:${booking.clientPhone}" style="color: #22c55e;">${booking.clientPhone}</a> • ${booking.clientEmail})</li>
                    <li><strong>Preferred Contact:</strong> ${booking.preferredContactMethod === 'telephone' ? '📞 Telephone' : '✉️ Email'}</li>
                    <li><strong>Event:</strong> ${booking.eventType}</li>
                    <li><strong>Date & Slot:</strong> ${booking.date} (${booking.timeSlot})</li>
                    <li><strong>Venue:</strong> ${booking.venueName} (${booking.venuePostcode})</li>
                    <li><strong>Attire:</strong> ${booking.tartanChoice}</li>
                    <li><strong>Requested Tunes:</strong> ${(booking.specialTunes || []).join(', ') || 'Standard Selection'}</li>
                    <li><strong>Travel Logistics:</strong> ${booking.travelBreakdownText || 'Standard'}</li>
                    <li><strong>Total Estimated Fee:</strong> £${booking.estimatedPrice}.00 (Deposit: £${booking.depositAmount}.00)</li>
                    ${booking.notes ? `<li><strong>Client Notes:</strong> "${booking.notes}"</li>` : ''}
                  </ul>
                  <div style="text-align: center; margin: 20px 0 10px 0;">
                    <a href="https://spudthepiper.com/admin/bookings" target="_blank" style="background: linear-gradient(135deg, #c5a059 0%, #dfb76c 100%); color: #0b1120; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                      Review & Approve in Back Office
                    </a>
                  </div>
                </div>
              `
            })
          }).catch(e => console.warn('Admin alert email background trigger error:', e));
        } catch (e) {
          console.warn('Admin alert send warning:', e);
        }
      }
    }
    // ================= 4. Booking Approved by Spud (Deposit Invoice) =================
    else if (type === 'booking_approved' && booking) {
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
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${formatEventDate(booking.date)} (${booking.timeSlot})</td>
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
    } 
    // ================= 5. Deposit Confirmed & Official Booking Receipt =================
    else if (type === 'deposit_received' && booking) {
      const remainingBalance = Math.max(0, booking.estimatedPrice - (booking.depositAmount || 0));
      const balancePaymentLink = `https://paypal.me/spudthepiper/${remainingBalance}`;
      const dayBeforeDate = getDayBeforeFormatted(booking.date);
      const paidDateFormatted = booking.depositPaidAt 
        ? new Date(booking.depositPaidAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      subject = `✅ Deposit Received & Booking Locked: Spud the Piper (${booking.date})`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #22c55e;">
          <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #22c55e; margin: 0; font-size: 26px; font-family: Georgia, serif;">Official Booking Confirmed & Locked</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Deposit Paid via PayPal • Booking Reference #${booking.id.slice(0, 8)}</p>
          </div>

          <div style="background-color: #131d33; padding: 22px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Dear <strong style="color: #c5a059;">${booking.clientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              Thank you! Your deposit payment of <strong style="color: #22c55e;">£${booking.depositAmount}.00</strong> has been received via PayPal on <strong>${paidDateFormatted}</strong>. Your event date is now <strong style="color: #22c55e;">100% OFFICIALLY LOCKED</strong> in Spud's private diary.
            </p>

            <div style="background-color: #0b1120; border-radius: 10px; padding: 16px; margin: 18px 0; border-left: 4px solid #22c55e;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Event / Occasion:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.eventType}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Confirmed Date:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${formatEventDate(booking.date)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Time Slot:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Venue & Postcode:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.venueName} (${booking.venuePostcode})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Highland Dress:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.tartanChoice}</td>
                </tr>
                <tr style="border-top: 1px dashed #334155;">
                  <td style="padding: 6px 0; color: #94a3b8;">Total Performance Fee:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">£${booking.estimatedPrice}.00</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #22c55e; font-weight: bold;">Deposit Paid (PayPal):</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #22c55e;">-£${booking.depositAmount}.00 (PAID)</td>
                </tr>
                <tr style="border-top: 1px solid #1e293b;">
                  <td style="padding: 8px 0 0 0; color: #facc15; font-weight: bold; font-size: 14px;">Remaining Balance:</td>
                  <td style="padding: 8px 0 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #facc15;">£${remainingBalance}.00</td>
                </tr>
              </table>
            </div>

            <!-- Remaining Balance Payment Instructions -->
            <div style="background-color: #1e293b; border-radius: 10px; padding: 16px; margin: 18px 0; border: 1px solid #334155;">
              <h3 style="color: #facc15; margin: 0 0 8px 0; font-size: 14px;">💳 Remaining Balance Payment</h3>
              <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5; margin: 0 0 12px 0;">
                The outstanding balance of <strong style="color: #ffffff;">£${remainingBalance}.00</strong> is due <strong>the day before your event (${dayBeforeDate})</strong>. You can settle this at any time before the event using the direct PayPal payment link below:
              </p>
              <div style="text-align: center; margin: 12px 0 6px 0;">
                <a href="${balancePaymentLink}" target="_blank" style="background: linear-gradient(135deg, #0070BA 0%, #003087 100%); color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                  Pay Remaining Balance (£${remainingBalance}.00) via PayPal
                </a>
              </div>
            </div>

            <div style="font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px dashed #334155; padding-top: 12px; margin-top: 16px;">
              <p style="margin: 0 0 4px 0;">🔔 <strong>Reminder Policy:</strong> If the remaining balance is still outstanding 7 days prior to your event, a friendly reminder will be sent to your email.</p>
              <p style="margin: 0;">Spud personally checks his schedule and will also be in contact to coordinate final timings and bagpipe music cues.</p>
            </div>
          </div>

          <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">Spud The Piper • Aviemore, Highlands, Scotland • <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
          </div>
        </div>
      `;
    }
    // ================= 6. 7-Day Balance & Event Reminder to Client =================
    else if (type === 'client_balance_reminder_7day' && booking) {
      const remainingBalance = Math.max(0, booking.estimatedPrice - (booking.depositAmount || 0));
      const balancePaymentLink = `https://paypal.me/spudthepiper/${remainingBalance}`;
      const dayBeforeDate = getDayBeforeFormatted(booking.date);

      subject = `⏰ 7 Days Until Your Event: Final Balance Reminder - Spud the Piper (${booking.date})`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #f59e0b;">
          <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #f59e0b; margin: 0; font-size: 26px; font-family: Georgia, serif;">7 Days to Your Event!</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Friendly Balance Reminder & Final Preparation</p>
          </div>

          <div style="background-color: #131d33; padding: 22px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Dear <strong style="color: #c5a059;">${booking.clientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              Your special occasion is just <strong style="color: #f59e0b;">7 days away</strong>! Callum (Spud the Piper) is preparing for your performance on <strong>${formatEventDate(booking.date)}</strong> at <strong>${booking.venueName}</strong>.
            </p>

            <div style="background-color: #0b1120; border-radius: 10px; padding: 16px; margin: 18px 0; border-left: 4px solid #f59e0b;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Event Date:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${formatEventDate(booking.date)} (${booking.timeSlot})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Venue:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">${booking.venueName} (${booking.venuePostcode})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Total Fee:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #ffffff;">£${booking.estimatedPrice}.00</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #22c55e;">Deposit Received:</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #22c55e;">£${booking.depositAmount}.00 (PAID)</td>
                </tr>
                <tr style="border-top: 1px dashed #334155;">
                  <td style="padding: 8px 0 0 0; color: #f59e0b; font-weight: bold; font-size: 14px;">Remaining Balance Due:</td>
                  <td style="padding: 8px 0 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #f59e0b;">£${remainingBalance}.00</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #cbd5e1;">
              As per our booking policy, the remaining balance of <strong style="color: #ffffff;">£${remainingBalance}.00</strong> is due the day before your event (<strong>${dayBeforeDate}</strong>). Please complete this using the PayPal link below:
            </p>

            <div style="text-align: center; margin: 24px 0 16px 0;">
              <a href="${balancePaymentLink}" target="_blank" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0b1120; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);">
                Pay Remaining Balance (£${remainingBalance}.00) via PayPal
              </a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 16px;">
              If you have any last-minute adjustments to timings or arrival entrances, please reply directly to this email or call Spud on <a href="tel:07793491367" style="color: #c5a059; text-decoration: none;">07793 491367</a>.
            </p>
          </div>

          <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">Spud The Piper • Aviemore, Highlands, Scotland • <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
          </div>
        </div>
      `;
    }
    // ================= 7. 7-Day Diary Alert to Spud =================
    else if (type === 'admin_event_reminder_7day' && booking) {
      recipientEmail = adminAlertEmail;
      recipientName = 'Spud Fraser';
      const remainingBalance = Math.max(0, booking.estimatedPrice - (booking.depositAmount || 0));
      const balanceStatus = booking.remainingBalancePaid 
        ? '✅ FULLY PAID (£0.00 Outstanding)' 
        : `⚠️ £${remainingBalance}.00 OUTSTANDING (Due 1 day before event)`;

      subject = `📅 7-Day Gig Alert: ${booking.clientName} on ${booking.date} at ${booking.venueName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1527; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f59e0b;">
          <span style="background-color: #f59e0b; color: #0b1120; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Upcoming Gig in 7 Days</span>
          <h2 style="color: #f59e0b; margin: 12px 0 4px 0;">Gig Reminder: ${booking.clientName}</h2>
          <p style="font-size: 14px; color: #e2e8f0;">You have a confirmed booking coming up in exactly 7 days. Here is your event briefing:</p>

          <div style="background-color: #131d33; padding: 18px; border-radius: 8px; border: 1px solid #334155; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e2e8f0;">
              <tr><td style="padding: 5px 0; color: #94a3b8;">Date & Slot:</td><td style="padding: 5px 0; font-weight: bold; color: #ffffff;">${formatEventDate(booking.date)} (${booking.timeSlot})</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Client:</td><td style="padding: 5px 0; font-weight: bold; color: #ffffff;">${booking.clientName} (<a href="tel:${booking.clientPhone}" style="color: #22c55e;">${booking.clientPhone}</a> • ${booking.clientEmail})</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Venue & Postcode:</td><td style="padding: 5px 0; font-weight: bold; color: #ffffff;">${booking.venueName} (${booking.venuePostcode})</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Attire:</td><td style="padding: 5px 0; color: #ffffff;">${booking.tartanChoice}</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Tunes Requested:</td><td style="padding: 5px 0; color: #c5a059;">${(booking.specialTunes || []).join(', ') || 'Standard Selection'}</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Balance Status:</td><td style="padding: 5px 0; font-weight: bold;">${balanceStatus}</td></tr>
            </table>
          </div>

          <div style="text-align: center; margin: 20px 0 10px 0;">
            <a href="https://spudthepiper.com/admin/diary" target="_blank" style="background: linear-gradient(135deg, #c5a059 0%, #dfb76c 100%); color: #0b1120; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 6px; display: inline-block; text-transform: uppercase;">
              Open Back Office Diary
            </a>
          </div>
        </div>
      `;
    }
    // ================= 8. 1-Day (Day Before) Urgent Gig Alert to Spud =================
    else if (type === 'admin_event_reminder_1day' && booking) {
      recipientEmail = adminAlertEmail;
      recipientName = 'Spud Fraser';
      const remainingBalance = Math.max(0, booking.estimatedPrice - (booking.depositAmount || 0));
      const balanceStatus = booking.remainingBalancePaid 
        ? '✅ FULLY SETTLED' 
        : `⚠️ £${remainingBalance}.00 OUTSTANDING (Collect before/during event)`;

      subject = `🚨 TOMORROW'S GIG: ${booking.clientName} at ${booking.venueName} (${booking.timeSlot})`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d1527; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #ef4444;">
          <span style="background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">🚨 Gig Tomorrow</span>
          <h2 style="color: #ef4444; margin: 12px 0 4px 0;">Event Sheet for Tomorrow: ${booking.clientName}</h2>
          <p style="font-size: 14px; color: #e2e8f0;">Here is your complete preparation sheet for tomorrow's performance:</p>

          <div style="background-color: #131d33; padding: 18px; border-radius: 8px; border: 1px solid #334155; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e2e8f0;">
              <tr><td style="padding: 5px 0; color: #94a3b8;">Event Date:</td><td style="padding: 5px 0; font-weight: bold; color: #facc15;">TOMORROW (${formatEventDate(booking.date)})</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Time Slot:</td><td style="padding: 5px 0; font-weight: bold; color: #ffffff;">${booking.timeSlot}</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Client:</td><td style="padding: 5px 0; font-weight: bold; color: #ffffff;">${booking.clientName} (<a href="tel:${booking.clientPhone}" style="color: #22c55e;">${booking.clientPhone}</a>)</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Venue & Postcode:</td><td style="padding: 5px 0; font-weight: bold; color: #ffffff;">${booking.venueName} (${booking.venuePostcode})</td></tr>
              ${booking.venueAddress && booking.venueAddress !== booking.venueName ? `<tr><td style="padding: 5px 0; color: #94a3b8;">Address:</td><td style="padding: 5px 0; color: #cbd5e1;">${booking.venueAddress}</td></tr>` : ''}
              <tr><td style="padding: 5px 0; color: #94a3b8;">Highland Dress:</td><td style="padding: 5px 0; font-weight: bold; color: #ffffff;">${booking.tartanChoice}</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Requested Tunes:</td><td style="padding: 5px 0; color: #c5a059; font-weight: bold;">${(booking.specialTunes || []).join(', ') || 'Standard Selection'}</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Travel Logistics:</td><td style="padding: 5px 0; color: #cbd5e1;">${booking.travelBreakdownText || 'Standard'}</td></tr>
              <tr><td style="padding: 5px 0; color: #94a3b8;">Payment Status:</td><td style="padding: 5px 0; font-weight: bold;">${balanceStatus}</td></tr>
              ${booking.notes ? `<tr><td style="padding: 5px 0; color: #94a3b8;">Client Notes:</td><td style="padding: 5px 0; color: #facc15; font-style: italic;">"${booking.notes}"</td></tr>` : ''}
              ${booking.adminNotes ? `<tr><td style="padding: 5px 0; color: #94a3b8;">Spud's Private Notes:</td><td style="padding: 5px 0; color: #38bdf8; font-style: italic;">"${booking.adminNotes}"</td></tr>` : ''}
            </table>
          </div>

          <div style="text-align: center; margin: 20px 0 10px 0;">
            <a href="https://spudthepiper.com/admin/diary" target="_blank" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 6px; display: inline-block; text-transform: uppercase;">
              View Gig in Diary
            </a>
          </div>
        </div>
      `;
    }
    // ================= 9. 1-Day Final Balance Reminder to Client =================
    else if (type === 'client_balance_reminder_1day' && booking) {
      const remainingBalance = Math.max(0, booking.estimatedPrice - (booking.depositAmount || 0));
      const balancePaymentLink = `https://paypal.me/spudthepiper/${remainingBalance}`;

      subject = `⚠️ Tomorrow's Performance & Final Balance: Spud the Piper (${booking.date})`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #ef4444;">
          <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #facc15; margin: 0; font-size: 26px; font-family: Georgia, serif;">See You Tomorrow!</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Final Balance & Performance Details</p>
          </div>

          <div style="background-color: #131d33; padding: 22px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Dear <strong style="color: #c5a059;">${booking.clientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              Callum Fraser (Spud the Piper) is ready and tuned up for your performance tomorrow at <strong>${booking.venueName}</strong> (${booking.timeSlot}).
            </p>

            <div style="background-color: #0b1120; border-radius: 10px; padding: 16px; margin: 18px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #94a3b8;">Outstanding Balance: <strong style="color: #ef4444; font-size: 16px;">£${remainingBalance}.00</strong></p>
              <p style="margin: 0; font-size: 12px; color: #cbd5e1;">Please settle the final balance today using the secure PayPal link below:</p>
            </div>

            <div style="text-align: center; margin: 20px 0 16px 0;">
              <a href="${balancePaymentLink}" target="_blank" style="background: linear-gradient(135deg, #0070BA 0%, #003087 100%); color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; text-transform: uppercase;">
                Pay Final Balance (£${remainingBalance}.00) via PayPal
              </a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 16px;">
              For any urgent inquiries on the day, please call Spud directly at <a href="tel:07793491367" style="color: #c5a059; text-decoration: none;">07793 491367</a>.
            </p>
          </div>

          <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">Spud The Piper • Aviemore, Highlands, Scotland • <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
          </div>
        </div>
      `;
    }
    // ================= 10. Balance Paid Final Receipt =================
    else if (type === 'balance_paid_receipt' && booking) {
      subject = `🎉 Full Payment Received: Spud the Piper (${booking.date})`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #22c55e;">
          <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
            <h1 style="color: #22c55e; margin: 0; font-size: 26px; font-family: Georgia, serif;">Payment Fully Settled</h1>
            <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Official Full Payment Receipt • Ref #${booking.id.slice(0, 8)}</p>
          </div>

          <div style="background-color: #131d33; padding: 22px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
              Dear <strong style="color: #c5a059;">${booking.clientName}</strong>,
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
              We have received full and final payment for your booking on <strong>${formatEventDate(booking.date)}</strong> at <strong>${booking.venueName}</strong>. Total performance investment of <strong style="color: #22c55e;">£${booking.estimatedPrice}.00</strong> is completely settled.
            </p>
            <p style="font-size: 13px; line-height: 1.5; color: #cbd5e1;">
              Thank you for having Spud the Piper provide the traditional Scottish soundtrack to your special event!
            </p>
          </div>

          <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
            <p style="margin: 0 0 4px 0;">Spud The Piper • Aviemore, Highlands, Scotland • <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
          </div>
        </div>
      `;
    }
    // ================= 11. New Booking Enquiry Alert to Spud =================
    else if (booking) {
      recipientEmail = adminAlertEmail;
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
          <div style="text-align: center; margin: 20px 0 10px 0;">
            <a href="https://spudthepiper.com/admin/bookings" target="_blank" style="background: linear-gradient(135deg, #c5a059 0%, #dfb76c 100%); color: #0b1120; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 6px; display: inline-block; text-transform: uppercase;">
              Review & Approve in Diary
            </a>
          </div>
        </div>
      `;
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'No recipient email specified' }, { status: 400 });
    }

    // Determine if this is a client-facing transactional email eligible for Trustpilot Review Invites
    const bccList: { email: string; name: string }[] = [];
    const isClientFacing = 
      recipientEmail !== adminAlertEmail && 
      (
        type === 'deposit_received' ||
        type === 'balance_paid_receipt' ||
        type === 'booking_approved' ||
        type === 'booking_created' ||
        type === 'client_balance_reminder_7day' ||
        type === 'client_balance_reminder_1day' ||
        type === 'inquiry_reply'
      );

    if (isClientFacing && trustpilotInviteEmail) {
      bccList.push({
        email: trustpilotInviteEmail,
        name: 'Trustpilot Automated Invites'
      });
    }

    const emailPayload: Record<string, any> = {
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
    };

    if (bccList.length > 0) {
      emailPayload.bcc = bccList;
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey || '',
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    const brevoData = await brevoRes.json();
    return NextResponse.json({ success: true, brevoResponse: brevoData, trustpilotBccActive: bccList.length > 0 });
  } catch (error: any) {
    console.error('Brevo Dispatch Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
