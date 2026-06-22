import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendOtp } from '@/lib/twilio';
import { signPendingToken } from '@/lib/auth';
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
    const { email, password } = await request.json();

    const { data: user } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: CORS });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: CORS });
    }

    // Activate pending (invited) users on first successful login
    if (!user.active) {
      await supabase.from('admin_users').update({ active: true, updated_at: new Date().toISOString() }).eq('id', user.id);
    }

    await sendOtp(user.phone);
    const pendingToken = signPendingToken({ userId: user.id, email: user.email, role: user.role, name: user.name });
    return NextResponse.json({ success: true, pendingToken, message: 'OTP sent to registered phone' }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
