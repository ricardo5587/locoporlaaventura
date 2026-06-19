import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireRole } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function PATCH(request, { params }) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const updates = {};

    if (body.name) updates.name = body.name;
    if (body.phone) updates.phone = body.phone;
    if (body.role && ['owner', 'editor', 'viewer'].includes(body.role)) {
      if (String(auth.payload.userId) === String(id) && body.role !== 'owner') {
        const { data: owners } = await supabase.from('admin_users').select('id').eq('role', 'owner').eq('active', true);
        if (owners && owners.length <= 1) {
          return NextResponse.json({ error: 'Cannot downgrade the last owner' }, { status: 400, headers: CORS });
        }
      }
      updates.role = body.role;
    }
    if (typeof body.active === 'boolean') {
      if (!body.active && String(auth.payload.userId) === String(id)) {
        return NextResponse.json({ error: 'Cannot suspend yourself' }, { status: 400, headers: CORS });
      }
      updates.active = body.active;
    }
    if (body.password && body.password.length >= 8) {
      updates.password_hash = await bcrypt.hash(body.password, 12);
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select('id, email, name, phone, role, active, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json(data, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function DELETE(request, { params }) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  const { id } = await params;

  if (String(auth.payload.userId) === String(id)) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400, headers: CORS });
  }

  const { data: target } = await supabase.from('admin_users').select('role').eq('id', id).single();
  if (target?.role === 'owner') {
    const { data: owners } = await supabase.from('admin_users').select('id').eq('role', 'owner').eq('active', true);
    if (owners && owners.length <= 1) {
      return NextResponse.json({ error: 'Cannot remove the last owner' }, { status: 400, headers: CORS });
    }
  }

  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
  return NextResponse.json({ success: true }, { headers: CORS });
}
