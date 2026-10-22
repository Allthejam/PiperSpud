import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalBaseUrl } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, chargeId, amount, description } = body;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: chargeId || bookingId || `spud-${Date.now()}`,
          description: description || `Spud the Piper - Performance Payment`,
          custom_id: chargeId || bookingId || '',
          amount: {
            currency_code: 'GBP',
            value: numericAmount.toFixed(2)
          }
        }
      ],
      application_context: {
        brand_name: 'Spud The Piper',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING'
      }
    };

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[PayPal create-order error]:', data);
      return NextResponse.json({ error: data.message || 'Failed to create PayPal order' }, { status: response.status });
    }

    return NextResponse.json({ id: data.id, status: data.status });
  } catch (error: any) {
    console.error('[PayPal create-order exception]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
