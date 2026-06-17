import { NextResponse } from 'next/server';
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
    const { email } = await request.json();

    const { data: user } = await supabase
      .from('admin_users')
      .select('id, email, phone, role, name')
      .eq('email', email.toLowerCase())
      .eq('active', true)
      .single();

    if (!user) {
      return NextResponse.json({ success: true, message: 'If that email exists, a code was sent.' }, { headers: CORS });
    }

    await sendOtp(user.phone);
    const resetToken = signPendingToken({ userId: user.id, email: user.email, role: user.role, name: user.name, resetPassword: true });
    return NextResponse.json({ success: true, resetToken, message: 'Verification code sent via SMS' }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
