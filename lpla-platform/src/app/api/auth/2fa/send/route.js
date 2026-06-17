import { NextResponse } from 'next/server';
import { sendOtp } from '@/lib/twilio';
import { verifyJwt } from '@/lib/auth';

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
    const { pendingToken } = await request.json();

    let pending;
    try {
      pending = verifyJwt(pendingToken);
    } catch {
      return NextResponse.json({ error: 'Session expired' }, { status: 401, headers: CORS });
    }

    const { data: user } = await (await import('@/lib/supabase')).supabase
      .from('admin_users')
      .select('phone')
      .eq('id', pending.userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401, headers: CORS });
    }

    await sendOtp(user.phone);
    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
