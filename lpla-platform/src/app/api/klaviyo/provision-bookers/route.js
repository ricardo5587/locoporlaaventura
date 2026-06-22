import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getBookersListId } from '@/lib/klaviyo';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Owner-only, idempotent. Finds or creates the single "Event Bookers" list and
// returns its id. Run once, then pin the id as KLAVIYO_BOOKERS_LIST_ID in Vercel.
export async function GET(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;
  try {
    const listId = await getBookersListId();
    return NextResponse.json({
      ok: true,
      listId,
      note: 'Add this as KLAVIYO_BOOKERS_LIST_ID in your Vercel env vars.',
    }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
