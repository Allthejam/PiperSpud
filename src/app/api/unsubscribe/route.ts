import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, setDoc, where, updateDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const action = body.action === 'resubscribe' ? 'subscribed' : 'unsubscribed';
    const reason = body.reason || 'User opted out via unsubscribe link';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (db) {
      // 1. Record in dedicated opt_outs collection
      const optOutRef = doc(db, 'opt_outs', email.replace(/[^a-zA-Z0-9_-]/g, '_'));
      await setDoc(optOutRef, {
        email,
        status: action,
        updatedAt: new Date().toISOString(),
        reason: action === 'unsubscribed' ? reason : 'Client resubscribed'
      }, { merge: true }).catch(e => console.warn('Opt-outs save warning:', e));

      // 2. Update any matching contacts in mailing_contacts
      try {
        const q = query(collection(db, 'mailing_contacts'), where('email', '==', email));
        const snap = await getDocs(q);
        const updates: Promise<any>[] = [];
        snap.forEach(docSnap => {
          updates.push(updateDoc(docSnap.ref, {
            status: action,
            unsubscribedAt: action === 'unsubscribed' ? new Date().toISOString() : null,
            unsubscribeReason: action === 'unsubscribed' ? reason : null
          }));
        });
        await Promise.all(updates);
      } catch (err) {
        console.warn('Mailing contacts update warning:', err);
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
  // Return status
  return NextResponse.json({
    email,
    instructions: 'Send a POST request with { email, action: "unsubscribe" | "resubscribe" } to update preferences.'
  });
}
