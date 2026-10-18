import { MailingContact } from '@/types/spud';

/**
 * Normalizes email by trimming whitespace and converting to lowercase
 */
export function normalizeEmail(email?: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Scans an array of mailing contacts, detects all duplicate emails,
 * and merges them into a clean, unified array where each email is unique.
 * 
 * Rules:
 * 1. If ANY record with this email has status === 'unsubscribed' or is in optOutSet,
 *    the merged contact is marked status: 'unsubscribed'.
 * 2. Merges tags, preserving all unique tags.
 * 3. Picks the richest name (avoiding fallback names like 'Valued Client' or email prefix if a real name exists).
 * 4. Preserves phone, venue, event type, date, and notes from any record that has them.
 * 5. If any record originated as a booking, the source is marked 'booking'.
 */
export function deduplicateAndMergeContacts(
  contacts: MailingContact[],
  optOutEmails?: Set<string>
): { cleanContacts: MailingContact[]; duplicateCount: number } {
  const map = new Map<string, MailingContact>();
  let duplicateCount = 0;

  for (const c of contacts) {
    if (!c || !c.email) continue;
    const key = normalizeEmail(c.email);
    if (!key || !key.includes('@')) continue;

    const isExplicitlyOptedOut = c.status === 'unsubscribed' || (optOutEmails ? optOutEmails.has(key) : false);

    if (!map.has(key)) {
      map.set(key, {
        ...c,
        email: key,
        status: isExplicitlyOptedOut ? 'unsubscribed' : (c.status || 'subscribed'),
        unsubscribedAt: isExplicitlyOptedOut ? (c.unsubscribedAt || new Date().toISOString()) : undefined,
        tags: Array.isArray(c.tags) ? Array.from(new Set(c.tags)) : []
      });
    } else {
      duplicateCount++;
      const existing = map.get(key)!;

      // Rule 1: Opt-out wins over subscribed
      const shouldBeUnsubscribed = existing.status === 'unsubscribed' || isExplicitlyOptedOut;

      // Rule 2: Best name selection (prefer real client names over generic fallbacks)
      const isExistingNameGeneric = !existing.name || existing.name === 'Valued Client' || existing.name === key.split('@')[0];
      const isCurrentNameBetter = c.name && c.name !== 'Valued Client' && c.name !== key.split('@')[0];
      const bestName = isExistingNameGeneric && isCurrentNameBetter ? c.name : existing.name || c.name;

      // Rule 3: Merge tags without duplicates
      const mergedTags = Array.from(new Set([...(existing.tags || []), ...(c.tags || [])]));

      map.set(key, {
        ...existing,
        name: bestName,
        phone: existing.phone || c.phone,
        source: existing.source === 'booking' || c.source === 'booking' ? 'booking' : existing.source,
        status: shouldBeUnsubscribed ? 'unsubscribed' : 'subscribed',
        unsubscribedAt: shouldBeUnsubscribed ? (existing.unsubscribedAt || c.unsubscribedAt || new Date().toISOString()) : undefined,
        unsubscribeReason: existing.unsubscribeReason || c.unsubscribeReason,
        tags: mergedTags,
        eventType: existing.eventType || c.eventType,
        eventDate: existing.eventDate || c.eventDate,
        venueName: existing.venueName || c.venueName,
        location: existing.location || c.location,
        notes: existing.notes || c.notes,
        brevoSynced: existing.brevoSynced || c.brevoSynced
      });
    }
  }

  return {
    cleanContacts: Array.from(map.values()),
    duplicateCount
  };
}
