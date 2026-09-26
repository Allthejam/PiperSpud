import { NextRequest, NextResponse } from 'next/server';
import { MailingContact, EmailCampaign } from '@/types/spud';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaign, recipients } = body as {
      campaign: EmailCampaign;
      recipients: MailingContact[];
    };

    if (!campaign || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'Missing campaign details or recipients' }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ warning: 'Brevo API key not set, simulated broadcast success' }, { status: 200 });
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'info@spudthepiper.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'Spud the Piper';

    // Build rich HTML email for the seasonal broadcast
    const generateHtml = (contactName: string) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0d1527; color: #f8fafc; padding: 32px 24px; border-radius: 16px; border: 1px solid #c5a059;">
        <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="color: #c5a059; margin: 0; font-size: 26px; font-family: Georgia, serif; letter-spacing: 0.5px;">Spud The Piper</h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Traditional Highland Bagpiper • Scotland</p>
        </div>

        <div style="background-color: #131d33; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
          <h2 style="color: #f1f5f9; font-size: 20px; font-family: Georgia, serif; margin-top: 0; border-left: 3px solid #c5a059; padding-left: 12px;">
            ${campaign.heading}
          </h2>

          <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0; margin-top: 16px;">
            Dear <strong style="color: #c5a059;">${contactName}</strong>,
          </p>

          <div style="font-size: 14px; line-height: 1.7; color: #cbd5e1; white-space: pre-line; margin: 18px 0;">
${campaign.bodyContent}
          </div>

          ${campaign.ctaUrl && campaign.ctaText ? `
            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="${campaign.ctaUrl}" target="_blank" style="background: linear-gradient(135deg, #c5a059 0%, #dfb76c 100%); color: #0b1120; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(197, 160, 89, 0.3);">
                ${campaign.ctaText}
              </a>
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
          <p style="margin: 0 0 4px 0;">Spud The Piper • Aviemore, Highlands, Scotland • <a href="https://spudthepiper.com" style="color: #c5a059; text-decoration: none;">spudthepiper.com</a></p>
          <p style="margin: 0;">You are receiving this update as a valued client, booking organiser, or subscriber of Spud the Piper.</p>
        </div>
      </div>
    `;

    // Send to recipients in batches or loop
    const results = [];
    for (const recipient of recipients) {
      if (!recipient.email) continue;
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
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
                email: recipient.email,
                name: recipient.name || 'Valued Client'
              }
            ],
            subject: campaign.subject,
            htmlContent: generateHtml(recipient.name || 'Valued Client')
          })
        });
        const resData = await brevoRes.json();
        results.push({ email: recipient.email, status: brevoRes.status, messageId: resData?.messageId });
      } catch (err: any) {
        results.push({ email: recipient.email, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: results.filter(r => r.status === 201).length,
      totalRequested: recipients.length,
      results
    });
  } catch (error: any) {
    console.error('Brevo Broadcast Dispatch Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
