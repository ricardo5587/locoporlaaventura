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

  try {
    // Return cached data from Supabase
    const { data: cached } = await supabase
      .from('klaviyo_cache')
      .select('data, updated_at')
      .eq('id', 'profiles')
      .single();

    if (cached && cached.data && Array.isArray(cached.data) && cached.data.length > 0) {
      return NextResponse.json({
        profiles: cached.data,
        cachedAt: cached.updated_at,
      }, { headers: CORS });
    }

    // No cache — return empty so frontend knows to trigger a refresh
    return NextResponse.json({
      profiles: [],
      cachedAt: null,
    }, { headers: CORS });
  } catch (err) {
    console.error('Error reading profiles cache:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function POST(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  try {
    // Fetch all profiles from Klaviyo
    const profiles = await getAllProfiles();

    // Fetch all lists and their members
    const lists = await getLists();
    const profileListMap = {};
    for (const list of lists) {
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
    }

    // Enrich profiles with list memberships
    const enriched = profiles.map((p) => ({
      ...p,
      lists: profileListMap[p.id] || [],
    }));

    // Save to Supabase cache
    const { error: upsertErr } = await supabase
      .from('klaviyo_cache')
      .upsert({
        id: 'profiles',
        data: enriched,
        updated_at: new Date().toISOString(),
      });

    if (upsertErr) {
      console.error('Error saving profiles cache:', upsertErr);
    }

    return NextResponse.json({
      profiles: enriched,
      cachedAt: new Date().toISOString(),
      refreshed: true,
    }, { headers: CORS });
  } catch (err) {
    console.error('Error refreshing Klaviyo profiles:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
