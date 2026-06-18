import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  const authResult = requireAuth(request);
  if (authResult.error) return authResult.error;

  try {
    const { text, toLang, kind } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400, headers: CORS });
    }

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Translation unavailable' }, { status: 503, headers: CORS });
    }

    const langName = toLang === 'es' ? 'Latin-American Spanish' : 'English';
    const prompt =
      `You are localizing copy for an outdoor-adventure events platform (Loco Por La Aventura). ` +
      `Translate the following event ${kind || 'text'} into ${langName}. Keep the tone energetic and concise, ` +
      `preserve any proper nouns / place names, and match the original length. ` +
      `Return ONLY the translated ${kind || 'text'} — no quotes, labels, or commentary.\n\n${text}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json({ error: 'Translation failed', detail }, { status: 502, headers: CORS });
    }

    const data = await res.json();
    const raw = (data.content?.[0]?.text || '').trim();
    const clean = raw.replace(/^["“”']+|["“”']+$/g, '').trim();
    return NextResponse.json({ translation: clean }, { headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
