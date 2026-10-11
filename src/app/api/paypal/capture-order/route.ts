import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalBaseUrl } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, bookingId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[PayPal capture-order error]:', data);
      return NextResponse.json({ error: data.message || 'Failed to capture PayPal order' }, { status: response.status });
    }

    // Extract capture details
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = capture?.id || data.id;
    const payerEmail = data.payer?.email_address;
    const amountPaid = capture?.amount?.value;

    return NextResponse.json({
      success: true,
      orderId: data.id,
      captureId,
      status: data.status,
      payerEmail,
      amountPaid,
      bookingId
    });
  } catch (error: any) {
    console.error('[PayPal capture-order exception]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
