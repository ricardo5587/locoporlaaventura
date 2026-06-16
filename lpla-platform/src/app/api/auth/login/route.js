import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendOtp } from '@/lib/twilio';

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
    const adminEmail = process.env.ADMIN_EMAIL || '';
    const adminHash  = process.env.ADMIN_PASSWORD_HASH || '';

    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: CORS });
    }

    const valid = await bcrypt.compare(password, adminHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: CORS });
    }

    await sendOtp(process.env.ADMIN_PHONE);
    return NextResponse.json({ success: true, message: 'OTP sent to registered phone' }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
