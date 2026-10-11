import { getLiveServerApiKeys } from '@/lib/serverApiKeys';

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live';
const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

/**
 * Generates an OAuth 2.0 access token using client credentials.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const serverKeys = await getLiveServerApiKeys();
  const clientId = serverKeys.paypalClientId || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = serverKeys.paypalClientSecret || process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client credentials are not configured in environment variables or database');
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

/**
 * Validates a PayPal webhook signature with PayPal's verification API.
 */
export async function verifyPayPalWebhookSignature(params: {
  transmissionId: string;
  transmissionTime: string;
  certUrl: string;
  authAlgo: string;
  transmissionSig: string;
  webhookId: string;
  webhookEvent: any;
}): Promise<boolean> {
  try {
    const accessToken = await getPayPalAccessToken();
    const verificationPayload = {
      transmission_id: params.transmissionId,
      transmission_time: params.transmissionTime,
      cert_url: params.certUrl,
      auth_algo: params.authAlgo,
      transmission_sig: params.transmissionSig,
      webhook_id: params.webhookId,
      webhook_event: params.webhookEvent
    };

    const res = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verificationPayload)
    });

    if (!res.ok) {
      console.warn('[PayPal Webhook] Verification endpoint responded with status:', res.status);
      return false;
    }

    const result = await res.json();
    return result.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('[PayPal Webhook] Error during signature verification:', err);
    return false;
  }
}
