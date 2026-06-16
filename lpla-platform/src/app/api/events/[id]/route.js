import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function mapEvent(row) {
  return {
    id: row.id, titleEs: row.title_es, titleEn: row.title_en,
    descEs: row.desc_es, descEn: row.desc_en, date: row.date,
    time: row.time, location: row.location, category: row.category,
    price: row.price, isFree: row.is_free, totalSpots: row.total_spots,
    spotsLeft: row.spots_left, draft: row.draft, image: row.image,
    tickets: row.tickets, createdAt: row.created_at,
  };
}

export async function PATCH(request, { params }) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  try {
    const body = await request.json();
    const updates = {};
    if (body.titleEs !== undefined)    updates.title_es    = body.titleEs;
    if (body.titleEn !== undefined)    updates.title_en    = body.titleEn;
    if (body.descEs !== undefined)     updates.desc_es     = body.descEs;
    if (body.descEn !== undefined)     updates.desc_en     = body.descEn;
    if (body.date !== undefined)       updates.date        = body.date;
    if (body.time !== undefined)       updates.time        = body.time;
    if (body.location !== undefined)   updates.location    = body.location;
    if (body.category !== undefined)   updates.category    = body.category;
    if (body.price !== undefined)      updates.price       = body.price;
    if (body.isFree !== undefined)     updates.is_free     = body.isFree;
    if (body.totalSpots !== undefined) updates.total_spots = body.totalSpots;
    if (body.spotsLeft !== undefined)  updates.spots_left  = body.spotsLeft;
    if (body.draft !== undefined)      updates.draft       = body.draft;
    if (body.image !== undefined)      updates.image       = body.image;
    if (body.tickets !== undefined)    updates.tickets     = body.tickets;
    const { data, error } = await supabase
      .from('events').update(updates).eq('id', params.id).select().single();
    if (error) throw error;
    return NextResponse.json(mapEvent(data), { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function DELETE(request, { params }) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;
  try {
    const { error } = await supabase.from('events').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
