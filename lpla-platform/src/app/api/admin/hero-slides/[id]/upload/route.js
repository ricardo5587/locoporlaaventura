import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getStorageClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request, { params }) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const slideId = parseInt(id, 10);
  if (slideId < 1 || slideId > 4) {
    return NextResponse.json({ error: 'Slide ID must be 1-4' }, { status: 400, headers: CORS });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400, headers: CORS });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File exceeds 50 MB limit' }, { status: 400, headers: CORS });
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and AVIF allowed' }, { status: 400, headers: CORS });
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const filename = `hero-slide-${slideId}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageClient();

    const { error: uploadError } = await storage.storage
      .from('event-images')
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500, headers: CORS });
    }

    const { data: urlData } = storage.storage.from('event-images').getPublicUrl(filename);
    const imageUrl = urlData.publicUrl;

    const { data, error } = await supabase
      .from('hero_slides')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', slideId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    }

    return NextResponse.json({ imageUrl, slide: data }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
