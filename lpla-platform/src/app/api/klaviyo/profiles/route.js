import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getAllProfiles, getProfileLists } from '@/lib/klaviyo';

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

    // Fetch fresh profiles
    const profiles = await getAllProfiles();

    // Enrich with list memberships
    const enriched = await Promise.all(
      profiles.map(async (p) => {
        try {
          const lists = await getProfileLists(p.id);
          return {
            ...p,
            lists: lists.map(l => ({ id: l.id, name: l.attributes?.name || 'Unnamed' })),
          };
        } catch (err) {
          console.error(`Error fetching lists for profile ${p.id}:`, err);
          return { ...p, lists: [] };
        }
      })
    );

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
