import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getAllProfiles, getLists, getListMembers } from '@/lib/klaviyo';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request) {
  const auth = requireRole(request, ['owner', 'editor']);
  if (auth.error) return auth.error;

  const forceRefresh = new URL(request.url).searchParams.get('refresh') === '1';

  try {
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('klaviyo_cache')
        .select('data, updated_at')
        .eq('id', 'profiles')
        .single();

      if (cached?.data && Array.isArray(cached.data) && cached.data.length > 0) {
        return NextResponse.json(cached.data, {
          headers: { ...CORS, 'X-Cache': 'hit', 'X-Cache-Updated': cached.updated_at },
        });
      }
    }

    const [profiles, lists] = await Promise.all([getAllProfiles(), getLists()]);

    const profileListMap = {};
    await Promise.all(
      lists.map(async (list) => {
        const listName = list.attributes?.name || 'Unnamed';
        try {
          const memberIds = await getListMembers(list.id);
          memberIds.forEach((pid) => {
            if (!profileListMap[pid]) profileListMap[pid] = [];
            profileListMap[pid].push({ id: list.id, name: listName });
          });
        } catch (err) {
          console.error(`Error fetching members for list ${listName}:`, err);
        }
      })
    );

    const enriched = profiles.map((p) => ({
      ...p,
      lists: profileListMap[p.id] || [],
    }));

    try {
      await supabase
        .from('klaviyo_cache')
        .upsert({ id: 'profiles', data: enriched, updated_at: new Date().toISOString() });
    } catch (cacheErr) {
      // A cache-write failure (e.g. payload too large) must not fail the request;
      // we still return the freshly fetched data.
      console.error('Klaviyo cache write failed:', cacheErr.message);
    }

    return NextResponse.json(enriched, {
      headers: { ...CORS, 'X-Cache': 'miss' },
    });
  } catch (err) {
    console.error('Error fetching profiles:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
