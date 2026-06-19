import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createCampaign } from '@/lib/klaviyo';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  try {
    const { name, subject, listId, content } = await request.json();
    if (!name || !subject || !listId || !content) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400, headers: CORS });
    }

    const result = await createCampaign(name, subject, listId, content);
    return NextResponse.json(result, { status: 201, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
