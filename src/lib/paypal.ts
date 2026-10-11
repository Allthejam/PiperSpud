const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live';
const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

/**
 * Generates an OAuth 2.0 access token using client credentials.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client credentials are not configured in environment variables');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[PayPal API] Token generation failed:', errorData);
    throw new Error(`Failed to generate PayPal token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export function getPayPalBaseUrl(): string {
  return PAYPAL_BASE_URL;
}
