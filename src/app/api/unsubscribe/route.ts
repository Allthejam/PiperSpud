import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email || '';
    const email = rawEmail.trim().toLowerCase();
    const action = body.action === 'resubscribe' ? 'subscribed' : 'unsubscribed';
    const reason = body.reason || 'User opted out via unsubscribe link';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (db) {
      // 1. Record in dedicated opt_outs collection
      const optOutDocId = email.replace(/[^a-zA-Z0-9_-]/g, '_');
      await setDoc(doc(db, 'opt_outs', optOutDocId), {
        email,
        status: action,
        updatedAt: new Date().toISOString(),
        reason: action === 'unsubscribed' ? reason : 'Client resubscribed'
      }, { merge: true }).catch(e => console.warn('Opt-outs save warning:', e));

      // 2. Scan ALL documents in mailing_contacts to find any matching this email (case-insensitive)
      try {
        const snap = await getDocs(collection(db, 'mailing_contacts'));
        const matchingDocs: any[] = [];
        
        snap.forEach(d => {
          const data = d.data();
          const docEmail = (data.email || '').trim().toLowerCase();
          if (docEmail === email) {
            matchingDocs.push(d);
          }
        });

        if (matchingDocs.length > 0) {
          // Update primary document
          const primaryDoc = matchingDocs[0];
          await updateDoc(primaryDoc.ref, {
            status: action,
            unsubscribedAt: action === 'unsubscribed' ? new Date().toISOString() : null,
            unsubscribeReason: action === 'unsubscribed' ? reason : null
          });

          // Deduplicate: If there are multiple documents for this same email, delete the excess duplicates
          for (let i = 1; i < matchingDocs.length; i++) {
            await deleteDoc(matchingDocs[i].ref).catch(e => console.warn('Delete duplicate doc error:', e));
          }
        } else {
          // If no doc in mailing_contacts yet, check if this email exists in bookings (CRM)
          let clientName = email.split('@')[0];
          let bookingVenue = '';
          let bookingEvent = '';
          let bookingDate = '';
          let bookingPhone = '';

          try {
            const bookingsSnap = await getDocs(collection(db, 'bookings'));
            bookingsSnap.forEach(b => {
              const bData = b.data();
              if ((bData.clientEmail || '').trim().toLowerCase() === email) {
                if (bData.clientName) clientName = bData.clientName;
                if (bData.venueName) bookingVenue = bData.venueName;
                if (bData.eventType) bookingEvent = bData.eventType;
                if (bData.date) bookingDate = bData.date;
                if (bData.clientPhone) bookingPhone = bData.clientPhone;
              }
            });
          } catch (bErr) {
            console.warn('Booking lookup error:', bErr);
          }

          // Create unified record in mailing_contacts with status: 'unsubscribed'
          const newDocRef = doc(db, 'mailing_contacts', `contact-${optOutDocId}`);
          await setDoc(newDocRef, {
            id: `contact-${optOutDocId}`,
            name: clientName,
            email,
            phone: bookingPhone || undefined,
            source: bookingEvent ? 'booking' : 'manual',
            status: action,
            tags: action === 'unsubscribed' ? ['Opted Out', 'CRM Client'] : ['CRM Client'],
            eventType: bookingEvent || undefined,
            eventDate: bookingDate || undefined,
            venueName: bookingVenue || undefined,
            addedAt: new Date().toISOString(),
            unsubscribedAt: action === 'unsubscribed' ? new Date().toISOString() : null,
            unsubscribeReason: action === 'unsubscribed' ? reason : null,
            brevoSynced: true
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Mailing contacts update error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      email,
      status: action,
      message: action === 'unsubscribed'
        ? 'You have been successfully opted out from Spud the Piper announcements. Any existing bookings remain secure.'
        : 'You have been successfully resubscribed to Spud the Piper announcements.'
    });
  } catch (error: any) {
    console.error('Unsubscribe API error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email parameter missing' }, { status: 400 });
  }
  return NextResponse.json({
    email,
    instructions: 'Send a POST request with { email, action: "unsubscribe" | "resubscribe" } to update preferences.'
  });
}
