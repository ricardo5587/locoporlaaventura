import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function mapEvent(row) {
  return {
    id: row.id,
    titleEs: row.title_es,
    titleEn: row.title_en,
    descEs: row.desc_es,
    descEn: row.desc_en,
    date: row.date,
    time: row.time,
    location: row.location,
    category: row.category,
    price: row.price,
    isFree: row.is_free,
    totalSpots: row.total_spots,
    spotsLeft: row.spots_left,
    draft: row.draft,
    image: row.image,
    tickets: row.tickets,
    createdAt: row.created_at,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const draft = searchParams.get('draft');
    const search = searchParams.get('search');

    let query = supabase.from('events').select('*');

    if (category) query = query.eq('category', category);
    if (draft !== null && draft !== undefined) query = query.eq('draft', draft === 'true');
    if (search) {
      query = query.or(`title_es.ilike.%${search}%,title_en.ilike.%${search}%`);
    }

    const { data, error } = await query.order('date', { ascending: true });
    if (error) throw error;

    return NextResponse.json(data.map(mapEvent), { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(request) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const { data, error } = await supabase.from('events').insert({
      title_es: body.titleEs,
      title_en: body.titleEn,
      desc_es: body.descEs,
      desc_en: body.descEn,
      date: body.date,
      time: body.time,
      location: body.location,
      category: body.category,
      price: body.price,
      is_free: body.isFree,
      total_spots: body.totalSpots,
      spots_left: body.spotsLeft ?? body.totalSpots,
      draft: body.draft ?? false,
      image: body.image,
      tickets: body.tickets ?? [],
    }).select().single();

    if (error) throw error;
    return NextResponse.json(mapEvent(data), { status: 201, headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
