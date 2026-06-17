import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, name, phone, role, active, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  return NextResponse.json(data, { headers: CORS });
}

export async function POST(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  try {
    const { email, name, phone, password, role } = await request.json();

    if (!email || !name || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400, headers: CORS });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400, headers: CORS });
    }
    if (!['owner', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400, headers: CORS });
    }

    const hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase
      .from('admin_users')
      .insert({ email: email.toLowerCase(), name, phone, password_hash: hash, role })
      .select('id, email, name, phone, role, active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Email already exists' }, { status: 409, headers: CORS });
      return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    }
    return NextResponse.json(data, { status: 201, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
