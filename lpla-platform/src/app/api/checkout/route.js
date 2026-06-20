import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chargeCard } from '@/lib/clover';
import { trackEvent } from '@/lib/klaviyo';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, firstName, lastName, email, phone,
            ticketId, qty, cardToken, smsConsent = false, emailConsent = false } = body;

    // load event + find ticket
    const { data: event, error: evErr } = await supabase
      .from('events').select('*').eq('id', eventId).single();
    if (evErr || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404, headers: CORS });

    const ticket = (event.tickets || []).find(t => t.id === ticketId) || event.tickets?.[0];
    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 400, headers: CORS });

    const amount = ticket.price * qty;
    const ticketLabel = ticket.en;
    let cloverChargeId = null;

    if (amount > 0) {
      if (!cardToken) return NextResponse.json({ error: 'Card token required' }, { status: 400, headers: CORS });
      const eventTitle = event.title_en || event.title_es;
      const charge = await chargeCard({
        token: cardToken,
        amount: Math.round(amount * 100), // cents
        description: `LPLA: ${eventTitle} x${qty}`,
      });
      cloverChargeId = charge.id;
    }

    // create order
    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      event_id: eventId,
      first_name: firstName,
      last_name: lastName,
      email, phone,
      ticket_id: ticketId,
      ticket_label: ticketLabel,
      qty, amount,
      channel: 'Website widget',
      status: 'confirmed',
      checked_in: false,
      clover_charge_id: cloverChargeId,
      sms_consent: smsConsent,
      email_consent: emailConsent,
    }).select().single();
    if (orderErr) throw orderErr;

    // decrement spots
    await supabase.rpc('decrement_spots', { event_id: eventId, qty });

    // Track "Booking Confirmed" event in Klaviyo to trigger confirmation email flow
    try {
      const confNum = `LPLA-${order.id.toString().slice(-6).toUpperCase()}`;
      const CAT_COLORS = { Escalada:'#155070', Senderismo:'#3A5E14', Taller:'#5E3B1E', Keynote:'#5E8BBD', Social:'#1B5E7F', 'Expedición':'#2D4D0E', Voluntario:'#00897A' };
      await trackEvent('Booking Confirmed', email, {
        confirmation_number: confNum,
        event_name_en: event.title_en || '',
        event_name_es: event.title_es || '',
        event_date: event.date || '',
        event_time: event.time || '',
        event_duration: event.duration || '',
        event_location: event.location || '',
        event_category: event.category || '',
        event_category_color: CAT_COLORS[event.category] || '#1B5E7F',
        event_note_en: event.desc_en || '',
        event_note_es: event.desc_es || '',
        ticket_type: ticketLabel || '',
        quantity: qty,
        unit_price: ticket.price,
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

    return NextResponse.json({
      order: {
        id: order.id, eventId: order.event_id, firstName: order.first_name,
        lastName: order.last_name, email: order.email, ticketLabel,
        qty: order.qty, amount: order.amount, status: order.status,
        createdAt: order.created_at,
      },
      event: {
        id: event.id,
        titleEs: event.title_es, titleEn: event.title_en,
        date: event.date, time: event.time, location: event.location,
      },
    }, { status: 201, headers: CORS });

  } catch (err) {
    const isPaymentError = err.message?.includes('clover') || err.status === 402;
    return NextResponse.json({ error: err.message }, { status: isPaymentError ? 402 : 500, headers: CORS });
  }
}
