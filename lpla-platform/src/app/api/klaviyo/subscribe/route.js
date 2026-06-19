import { NextResponse } from 'next/server';
import { subscribeToList } from '@/lib/klaviyo';

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
    const { listId, email, firstName = '', lastName = '' } = await request.json();
    if (!listId || !email) {
      return NextResponse.json({ error: 'listId and email required' }, { status: 400, headers: CORS });
    }

    await subscribeToList(listId, email, firstName, lastName);
    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
