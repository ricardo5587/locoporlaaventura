import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getLists, getListProfiles } from '@/lib/klaviyo';
import { sendBookingConfirmation } from '@/lib/email/send-booking';
import { resendConfigured } from '@/lib/email/resend';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Sample event used so the test email shows the full, finished design.
const SAMPLE_EVENT = {
  id: 0,
  title_en: 'Rock Climbing · Smith Rock',
  category: 'Escalada',
  date: 'Sunday, Jun 21, 2026',
  time: '7:00 AM',
  duration: '6h',
  location: 'Smith Rock, Terrebonne OR',
  desc_en: 'Gear included. Certified guide for all levels.',
  what_to_bring: ['Comfortable clothing', 'Water (2+ liters)', 'Snacks', 'Sunscreen SPF 30+', 'Closed-toe shoes'],
};

export async function POST(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  if (!resendConfigured()) {
    return NextResponse.json({
      error: 'RESEND_API_KEY is not set in the environment.',
    }, { status: 400, headers: CORS });
  }

  try {
    const body = await request.json().catch(() => ({}));

    // Resolve recipients: an explicit email, or all members of a list.
    let recipients = [];
    if (body.email) {
      recipients = [{ email: body.email, firstName: body.firstName || '' }];
    } else {
      let listId = (body.listId || '').trim();
      const listName = (body.listName || '').trim();
      if (!listId && listName) {
        const lists = await getLists();
        const match = lists.find(l => (l.attributes?.name || '').toLowerCase() === listName.toLowerCase());
        if (!match) return NextResponse.json({ error: `List "${listName}" not found` }, { status: 404, headers: CORS });
        listId = match.id;
      }
      if (!listId) return NextResponse.json({ error: 'email, listId, or listName is required' }, { status: 400, headers: CORS });
      recipients = (await getListProfiles(listId)).filter(p => p.email);
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients with an email address were found.' }, { status: 400, headers: CORS });
    }

    const results = [];
    for (const r of recipients) {
      try {
        const res = await sendBookingConfirmation({
          event: SAMPLE_EVENT,
          email: r.email,
          firstName: r.firstName,
          confirmationNumber: 'LPLA-TEST01',
          ticketLabel: 'General Admission',
          qty: 2,
          unitPrice: 15,
          amount: 30,
        });
        results.push({ email: r.email, ok: true, id: res?.id });
      } catch (err) {
        results.push({ email: r.email, ok: false, error: err.message });
      }
    }

    const sent = results.filter(r => r.ok).length;
    return NextResponse.json({ ok: sent > 0, sent, total: recipients.length, results }, { status: 201, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
