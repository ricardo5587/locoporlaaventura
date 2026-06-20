import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getAllProfiles, getLists, getListMembers } from '@/lib/klaviyo';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Simple in-memory cache (resets on server restart)
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

    // Return cached data if still fresh
    if (profilesCache && !forceRefresh && (now - cacheTime) < CACHE_DURATION) {
      return NextResponse.json(profilesCache, { headers: CORS });
    }

    // Fetch fresh profiles and all lists in parallel
    const [profiles, lists] = await Promise.all([getAllProfiles(), getLists()]);

    // Build a profileId -> [{id, name}] map by fetching each list's members.
    // This is O(#lists) API calls instead of O(#profiles), so it won't time out.
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

    // Enrich each profile from the map (no per-profile API call)
    const enriched = profiles.map((p) => ({
      ...p,
      lists: profileListMap[p.id] || [],
    }));

    // Cache it
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

  // Force refresh cache
  profilesCache = null;
  cacheTime = 0;

  return NextResponse.json({ success: true, message: 'Cache cleared' }, { headers: CORS });
}
