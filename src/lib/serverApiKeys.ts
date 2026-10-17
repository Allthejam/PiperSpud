const PROJECT_ID = 'piperspud-56c0a';

interface ServerApiKeys {
  brevoApiKey?: string;
  brevoSenderEmail?: string;
  brevoSenderName?: string;
  brevoAdminAlertEmail?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  gaPropertyId?: string;
  gaClientEmail?: string;
  gaPrivateKey?: string;
}

let cachedKeys: ServerApiKeys | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 60 * 1000; // Cache for 60 seconds

/**
 * Fetch API credentials from process.env with automatic dynamic fallback to Firestore settings/api_keys
 * Ensures Brevo transactional email, PayPal live payments, and Google Analytics work 100% reliably in Cloud Run / App Hosting
 * even if environment variables are not injected directly into the container.
 */
export async function getLiveServerApiKeys(): Promise<ServerApiKeys> {
  const now = Date.now();
  if (cachedKeys && (now - lastFetchTime) < CACHE_DURATION_MS) {
    return cachedKeys;
  }

  // 1. Initialise with any environment variables present
  const keys: ServerApiKeys = {
    brevoApiKey: process.env.BREVO_API_KEY,
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'info@spudthepiper.com',
    brevoSenderName: process.env.BREVO_SENDER_NAME || 'Spud the Piper',
    brevoAdminAlertEmail: process.env.BREVO_ADMIN_ALERT_EMAIL || 'info@spudthepiper.com',
    paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    gaPropertyId: process.env.GA_PROPERTY_ID,
    gaClientEmail: process.env.GA_CLIENT_EMAIL,
    gaPrivateKey: process.env.GA_PRIVATE_KEY,
  };

  // If all keys are already present in process.env, return immediately
  if (keys.brevoApiKey && keys.paypalClientSecret && keys.gaPropertyId && keys.gaPrivateKey) {
    cachedKeys = keys;
    lastFetchTime = now;
    return keys;
  }

  // 2. Fetch missing keys dynamically from Firestore REST API (no hardcoded secrets in repository)
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/settings/api_keys`;
    const res = await fetch(url, {
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const data = await res.json();
      const fields = data?.fields;
      if (fields) {
        if (!keys.brevoApiKey && fields.brevoApiKey?.stringValue) {
          keys.brevoApiKey = fields.brevoApiKey.stringValue;
        }
        if (fields.brevoSenderEmail?.stringValue) {
          keys.brevoSenderEmail = fields.brevoSenderEmail.stringValue;
        }
        if (fields.brevoSenderName?.stringValue) {
          keys.brevoSenderName = fields.brevoSenderName.stringValue;
        }
        if (fields.brevoAdminAlertEmail?.stringValue) {
          keys.brevoAdminAlertEmail = fields.brevoAdminAlertEmail.stringValue;
        }
        if (!keys.paypalClientId && fields.paypalClientId?.stringValue) {
          keys.paypalClientId = fields.paypalClientId.stringValue;
        }
        if (!keys.paypalClientSecret && fields.paypalClientSecret?.stringValue) {
          keys.paypalClientSecret = fields.paypalClientSecret.stringValue;
        }
        if (!keys.gaPropertyId && fields.gaPropertyId?.stringValue) {
          keys.gaPropertyId = fields.gaPropertyId.stringValue;
        }
        if (!keys.gaClientEmail && fields.gaClientEmail?.stringValue) {
          keys.gaClientEmail = fields.gaClientEmail.stringValue;
        }
        if (!keys.gaPrivateKey && fields.gaPrivateKey?.stringValue) {
          keys.gaPrivateKey = fields.gaPrivateKey.stringValue;
        }
      }
    }
  } catch (err) {
    console.warn('[ServerApiKeys] Could not retrieve fallback credentials from Firestore:', err);
  }

  cachedKeys = keys;
  lastFetchTime = now;
  return keys;
}
