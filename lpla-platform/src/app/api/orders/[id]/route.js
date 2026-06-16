import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { refundCharge } from '@/lib/clover';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
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
    createdAt: row.created_at,
  };
}

export async function PATCH(request, { params }) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  try {
    const body = await request.json();
    const { data: existing, error: fetchErr } = await supabase
      .from('orders').select('*').eq('id', params.id).single();
    if (fetchErr) throw fetchErr;

    const updates = {};

    if (body.checkedIn === true) {
      updates.checked_in = true;
      updates.status = 'confirmed';
    } else if (body.checkedIn === false) {
      updates.checked_in = false;
    }

    if (body.status === 'cancelled') {
      updates.status = 'cancelled';
      // restore spot
      await supabase.rpc('increment_spots', { event_id: existing.event_id, qty: existing.qty });
    }

    if (body.status === 'refunded') {
      updates.status = 'refunded';
      if (existing.clover_charge_id) {
        await refundCharge(existing.clover_charge_id);
      }
      await supabase.rpc('increment_spots', { event_id: existing.event_id, qty: existing.qty });
    }

    const { data, error } = await supabase
      .from('orders').update(updates).eq('id', params.id).select().single();
    if (error) throw error;
    return NextResponse.json(mapOrder(data), { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
