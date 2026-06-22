// Streams a downloadable .ics file for Apple Calendar (and any ICS client).
// Query params: title, start, end (YYYYMMDDTHHMMSS), location, details.
import { NextResponse } from 'next/server';

function esc(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Loco Por La Aventura Event';
  const start = searchParams.get('start') || '';
  const end = searchParams.get('end') || '';
  const location = searchParams.get('location') || '';
  const details = searchParams.get('details') || '';

  if (!/^\d{8}T\d{6}$/.test(start) || !/^\d{8}T\d{6}$/.test(end)) {
    return NextResponse.json({ error: 'invalid start/end' }, { status: 400 });
  }

  const uid = `${start}-${Math.random().toString(36).slice(2)}@locoporlaaventura.com`;
  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Loco Por La Aventura//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${esc(title)}`,
    location ? `LOCATION:${esc(location)}` : '',
    details ? `DESCRIPTION:${esc(details)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="event.ics"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
