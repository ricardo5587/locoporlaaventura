import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function mapOrder(row) {
  return {
    id: row.id, eventId: row.event_id, firstName: row.first_name,
    lastName: row.last_name, email: row.email, phone: row.phone,
    ticketId: row.ticket_id, ticketLabel: row.ticket_label,
    qty: row.qty, amount: row.amount, channel: row.channel,
    status: row.status, checkedIn: row.checked_in,
    cloverChargeId: row.clover_charge_id,
    smsConsent: row.sms_consent, emailConsent: row.email_consent,
    createdAt: row.created_at,
  };
}

export async function GET(request) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status  = searchParams.get('status');
    const search  = searchParams.get('search');
    const page    = parseInt(searchParams.get('page') || '1', 10);
    const limit   = parseInt(searchParams.get('limit') || '25', 10);
    const offset  = (page - 1) * limit;

    let query = supabase.from('orders').select('*', { count: 'exact' });
    if (eventId) query = query.eq('event_id', eventId);
    if (status && status !== 'all') query = query.eq('status', status);
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return NextResponse.json({
      orders: data.map(mapOrder),
      total: count,
      page,
      pages: Math.ceil(count / limit),
    }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, firstName, lastName, email, phone,
            ticketId, ticketLabel, qty, amount,
            channel = 'Website widget', cloverChargeId,
            smsConsent = false, emailConsent = false } = body;

    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      event_id: eventId, first_name: firstName, last_name: lastName,
      email, phone, ticket_id: ticketId, ticket_label: ticketLabel,
      qty, amount, channel, status: 'confirmed', checked_in: false,
      clover_charge_id: cloverChargeId || null,
      sms_consent: smsConsent, email_consent: emailConsent,
    }).select().single();
    if (orderErr) throw orderErr;

    // decrement spots_left on the event
    await supabase.rpc('decrement_spots', { event_id: eventId, qty });

    return NextResponse.json(mapOrder(order), { status: 201, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
