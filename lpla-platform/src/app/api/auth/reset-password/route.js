import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyOtp } from '@/lib/twilio';
import { verifyJwt } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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
    const { code, resetToken, newPassword } = await request.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400, headers: CORS });
    }

    let pending;
    try {
      pending = verifyJwt(resetToken);
    } catch {
      return NextResponse.json({ error: 'Reset session expired, please start over' }, { status: 401, headers: CORS });
    }

    const { data: user } = await supabase
      .from('admin_users')
      .select('phone')
      .eq('id', pending.userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401, headers: CORS });
    }

    const valid = await verifyOtp(user.phone, code);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401, headers: CORS });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await supabase
      .from('admin_users')
      .update({ password_hash: hash, updated_at: new Date().toISOString() })
      .eq('id', pending.userId);

    return NextResponse.json({ success: true, message: 'Password reset successfully' }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
