import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getAllProfiles, getLists, getListMembers } from '@/lib/klaviyo';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

let profilesCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request) {
  const auth = requireRole(request, ['owner', 'editor']);
  if (auth.error) return auth.error;

  try {
    const now = Date.now();
    const forceRefresh = new URL(request.url).searchParams.get('refresh') === '1';

    if (profilesCache && !forceRefresh && (now - cacheTime) < CACHE_DURATION) {
      return NextResponse.json(profilesCache, { headers: CORS });
    }

    // Fetch profiles and lists in parallel
    const [profiles, lists] = await Promise.all([
      getAllProfiles(),
      getLists(),
    ]);

    // Build a map: profileId -> [{ id, name }] by fetching members per list
    const profileListMap = {};
    await Promise.all(
      lists.map(async (list) => {
        const listName = list.attributes?.name || 'Unnamed';
        const listId = list.id;
        try {
          const memberIds = await getListMembers(listId);
          memberIds.forEach((pid) => {
            if (!profileListMap[pid]) profileListMap[pid] = [];
            profileListMap[pid].push({ id: listId, name: listName });
          });
        } catch (err) {
          console.error(`Error fetching members for list ${listName}:`, err);
        }
      })
    );

    // Enrich profiles with their list memberships
    const enriched = profiles.map((p) => ({
      ...p,
      lists: profileListMap[p.id] || [],
    }));

    profilesCache = enriched;
    cacheTime = now;

    return NextResponse.json(enriched, { headers: CORS });
  } catch (err) {
    console.error('Error fetching profiles:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function POST(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  profilesCache = null;
  cacheTime = 0;

  return NextResponse.json({ success: true, message: 'Cache cleared' }, { headers: CORS });
}
