import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }

  return NextResponse.json(data, { headers: CORS });
}

export async function PUT(request) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;

  const body = await request.json();
  const allowed = ['welcome_en', 'welcome_es', 'title_line1', 'title_line2', 'subtitle_en', 'subtitle_es'];
  const updates = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from('hero_content')
    .update(updates)
    .eq('id', 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }

  return NextResponse.json(data, { headers: CORS });
}
