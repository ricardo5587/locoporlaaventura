// ─────────────────────────────────────────────────────────────
//  Heading-as-image endpoint for email.
//  Gmail strips web fonts, so the email's most prominent headings
//  (hero "Booking Confirmed!" and the event title) are rendered as
//  PNGs in real Barlow Condensed via next/og + Satori.
//
//  GET /api/og/heading?text=...&size=28&color=ffffff&weight=900&w=560
//    text   – heading text (required)
//    size   – font size px (default 28)
//    color  – hex without # (default 0F2030)
//    weight – 800 | 900 (default 900)
//    w      – image width px (default 560)
//    ls     – letter-spacing px (default 1)
//    align  – left | center (default center)
//  Returns a transparent PNG sized to fit the text.
// ─────────────────────────────────────────────────────────────
import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

let _fonts = null;
async function loadFonts() {
  if (_fonts) return _fonts;
  const dir = path.join(process.cwd(), 'src', 'assets', 'fonts');
  const [black, extrabold] = await Promise.all([
    readFile(path.join(dir, 'BarlowCondensed-Black.ttf')),
    readFile(path.join(dir, 'BarlowCondensed-ExtraBold.ttf')),
  ]);
  _fonts = [
    { name: 'Barlow Condensed', data: black, weight: 900, style: 'normal' },
    { name: 'Barlow Condensed', data: extrabold, weight: 800, style: 'normal' },
  ];
  return _fonts;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || '';
  const size = Math.min(parseInt(searchParams.get('size') || '28', 10), 120);
  const color = '#' + (searchParams.get('color') || '0F2030').replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
  const weight = parseInt(searchParams.get('weight') || '900', 10) === 800 ? 800 : 900;
  const w = Math.min(parseInt(searchParams.get('w') || '560', 10), 600);
  const ls = parseFloat(searchParams.get('ls') || '1');
  const align = searchParams.get('align') === 'left' ? 'flex-start' : 'center';

  if (!text) return new Response('text required', { status: 400 });

  // 2x supersampling for crisp retina rendering; the <img> is shown at 1x.
  const scale = 2;
  const fonts = await loadFonts();
  const lineHeight = Math.round(size * 1.18);
  const lines = parseInt(searchParams.get('lines') || '1', 10);
  const h = Math.min(parseInt(searchParams.get('h') || String(lineHeight * lines), 10), 400);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'flex-start',
          justifyContent: align,
          background: 'transparent',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Barlow Condensed',
            fontSize: size * scale,
            fontWeight: weight,
            color,
            textTransform: 'uppercase',
            letterSpacing: ls * scale,
            lineHeight: 1.1,
            textAlign: align === 'center' ? 'center' : 'left',
            whiteSpace: 'pre-wrap',
          }}
        >
          {text}
        </div>
      </div>
    ),
    {
      width: w * scale,
      height: h * scale,
      fonts,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
}
