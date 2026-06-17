import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

export function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function signPendingToken(payload) {
  return jwt.sign({ ...payload, pending2fa: true }, JWT_SECRET, { expiresIn: '10m' });
}

export function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function requireAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyJwt(token);
    if (payload.pending2fa) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { payload };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }
}

export function requireRole(request, roles) {
  const result = requireAuth(request);
  if (result.error) return result;
  if (!roles.includes(result.payload.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return result;
}
