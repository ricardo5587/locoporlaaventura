import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createList, upsertProfile, addProfilesToList } from '@/lib/klaviyo';

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
    const body = await request.json().catch(() => ({}));
    const name = (body.name || 'LPLA Test List').trim();
    const email = (body.email || '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400, headers: CORS });
    }

    const list = await createList(name);
    const listId = list.id;

    const profileId = await upsertProfile(email, {
      first_name: body.firstName || '',
      last_name: body.lastName || '',
    });

    await addProfilesToList(listId, [profileId]);

    return NextResponse.json({
      ok: true,
      listId,
      listName: name,
      profileId,
      email,
    }, { status: 201, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
