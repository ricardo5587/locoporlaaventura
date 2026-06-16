import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/twilio';
import { signJwt } from '@/lib/auth';

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
    const { code } = await request.json();
    const valid = await verifyOtp(process.env.ADMIN_PHONE, code);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401, headers: CORS });
    }
    const token = signJwt({ role: 'admin', email: process.env.ADMIN_EMAIL });
    return NextResponse.json({ token }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
