import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { subscribeToList, trackEvent, getBookersListId } from '@/lib/klaviyo';
import { sendBookingConfirmation } from '@/lib/email/send-booking';

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

    // Fetch event details for confirmation email
    const { data: event } = await supabase
      .from('events').select('*').eq('id', eventId).single();

    // Subscribe to Klaviyo newsletter list if configured
    const klaviyoListId = process.env.KLAVIYO_DEFAULT_LIST_ID;
    if (klaviyoListId && emailConsent) {
      try {
        await subscribeToList(klaviyoListId, email, firstName, lastName);
      } catch (err) {
        console.error('Klaviyo subscription failed:', err.message);
      }
    }

    // Add to "Event Bookers" list (all bookers, regardless of marketing consent)
    try {
      const bookersListId = await getBookersListId();
      await subscribeToList(bookersListId, email, firstName, lastName);
    } catch (err) {
      console.error('Klaviyo Event Bookers list failed:', err.message);
    }

    const confNum = `LPLA-${order.id.toString().slice(-6).toUpperCase()}`;

    // Send the booking confirmation email (transactional, via Resend).
    try {
      await sendBookingConfirmation({
        event, email, firstName,
        confirmationNumber: confNum,
        ticketLabel, qty,
        unitPrice: amount / (qty || 1),
        amount,
      });
    } catch (err) {
      console.error('Booking confirmation email failed:', err.message);
    }

    // Track "Booking Confirmed" event in Klaviyo for marketing/segmentation.
    try {
      const CAT_COLORS = { Escalada:'#155070', Senderismo:'#3A5E14', Taller:'#5E3B1E', Keynote:'#5E8BBD', Social:'#1B5E7F', 'Expedición':'#2D4D0E', Voluntario:'#00897A' };
      await trackEvent('Booking Confirmed', email, {
        confirmation_number: confNum,
        event_name_en: event?.title_en || '',
        event_name_es: event?.title_es || '',
        event_date: event?.date || '',
        event_time: event?.time || '',
        event_duration: event?.duration || '',
        event_location: event?.location || '',
        event_category: event?.category || '',
        event_category_color: CAT_COLORS[event?.category] || '#1B5E7F',
        event_note_en: event?.desc_en || '',
        event_note_es: event?.desc_es || '',
        ticket_type: ticketLabel || '',
        quantity: qty,
        unit_price: amount / (qty || 1),
        total_amount: amount,
        is_free: amount === 0,
        order_id: order.id,
      }, {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
      });
    } catch (err) {
      console.error('Klaviyo booking event tracking failed:', err.message);
    }

    return NextResponse.json({ ...mapOrder(order), confirmationNumber: confNum }, { status: 201, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
