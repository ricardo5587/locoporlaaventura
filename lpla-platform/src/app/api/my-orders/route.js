import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GOOGLE_CLIENT_ID = '69227862746-1gimbgl14rc4dr157kn178j66008ttf9.apps.googleusercontent.com';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Verify a Google ID token (the "credential" One Tap hands the browser) by
// asking Google's tokeninfo endpoint, which validates the signature + expiry
// server-side. We additionally enforce that the token was minted for OUR app
// (audience check), so a token issued to a different Google client can't be
// replayed here. Returns the verified, lowercased email or null.
async function verifyGoogleEmail(credential) {
  const res = await fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential)
  );
  if (!res.ok) return null;
  const info = await res.json();
  if (info.aud !== GOOGLE_CLIENT_ID) return null;
  if (!info.email) return null;
  if (info.email_verified === false || info.email_verified === 'false') return null;
  return info.email.toLowerCase();
}

export async function POST(request) {
  try {
    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400, headers: CORS });
    }

    const email = await verifyGoogleEmail(credential);
    if (!email) {
      return NextResponse.json({ error: 'Invalid or expired sign-in' }, { status: 401, headers: CORS });
    }

    // Only ever returns the verified user's own orders.
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('email', email)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Pull the related events in one query and index them by id.
    const eventIds = [...new Set((orders || []).map(o => o.event_id))];
    let eventsById = {};
    if (eventIds.length) {
      const { data: events } = await supabase.from('events').select('*').in('id', eventIds);
      eventsById = Object.fromEntries((events || []).map(e => [e.id, e]));
    }

    const bookings = (orders || []).map(o => {
      const ev = eventsById[o.event_id] || {};
      return {
        id: o.id,
        confirmationNumber: `LPLA-${o.id.toString().slice(-6).toUpperCase()}`,
        eventId: o.event_id,
        eventTitleEn: ev.title_en || '',
        eventTitleEs: ev.title_es || '',
        eventDate: ev.date || '',
        eventTime: ev.time || '',
        eventLocation: ev.location || '',
        ticketLabel: o.ticket_label,
        qty: o.qty,
        amount: o.amount,
        status: o.status,
        // The user's own contact details — used to pre-fill future bookings.
        firstName: o.first_name,
        lastName: o.last_name,
        phone: o.phone,
        createdAt: o.created_at,
      };
    });

    return NextResponse.json({ email, bookings }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
