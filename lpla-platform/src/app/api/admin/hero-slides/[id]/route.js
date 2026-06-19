import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import supabase from '@/lib/supabase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function PUT(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const slideId = parseInt(id, 10);
  if (slideId < 1 || slideId > 4) {
    return NextResponse.json({ error: 'Slide ID must be 1-4' }, { status: 400, headers: CORS });
  }

  const body = await request.json();
  const { data, error } = await supabase
    .from('hero_slides')
    .update({ image_url: body.imageUrl, updated_at: new Date().toISOString() })
    .eq('id', slideId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }

  return NextResponse.json(data, { headers: CORS });
}

export async function DELETE(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const slideId = parseInt(id, 10);
  if (slideId < 1 || slideId > 4) {
    return NextResponse.json({ error: 'Slide ID must be 1-4' }, { status: 400, headers: CORS });
  }

  const { data, error } = await supabase
    .from('hero_slides')
    .update({ image_url: null, updated_at: new Date().toISOString() })
    .eq('id', slideId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  }

  return NextResponse.json(data, { headers: CORS });
}
