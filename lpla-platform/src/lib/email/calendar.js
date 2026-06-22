// Calendar link helpers for the booking confirmation email.
// Parses an event's raw date/time/duration into start/end, then builds a
// Google Calendar "add event" URL and an Apple-friendly .ics download URL.

const BASE = 'https://locoporlaaventura.vercel.app';

// Parse an ISO date ('2026-06-21') + clock time ('7:00 AM') into a Date.
function parseStart(date, time) {
  if (!date) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(date));
  if (!m) return null;
  let hour = 9, min = 0;
  const t = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(String(time || ''));
  if (t) {
    hour = parseInt(t[1], 10);
    min = parseInt(t[2], 10);
    const mer = (t[3] || '').toUpperCase();
    if (mer === 'PM' && hour < 12) hour += 12;
    if (mer === 'AM' && hour === 12) hour = 0;
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hour, min);
}

// Best-effort parse of a duration string ('6h', '5h', '2 días') into hours.
function durationHours(duration) {
  const s = String(duration || '').toLowerCase();
  const days = /(\d+)\s*(d|día|dias|días|day)/.exec(s);
  if (days) return parseInt(days[1], 10) * 24;
  const hrs = /(\d+)\s*(h|hr|hora)/.exec(s);
  if (hrs) return parseInt(hrs[1], 10);
  return 2;
}

// Format a Date as a floating local calendar stamp: YYYYMMDDTHHMMSS.
function stamp(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

// Returns { start, end } stamps, or null if the date couldn't be parsed.
export function eventWindow(event) {
  const start = parseStart(event?.date, event?.time);
  if (!start) return null;
  const end = new Date(start.getTime() + durationHours(event?.duration) * 3600000);
  return { start: stamp(start), end: stamp(end) };
}

export function googleCalendarUrl(event, title) {
  const win = eventWindow(event);
  if (!win) return '';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || event?.title_en || event?.title_es || 'Event',
    dates: `${win.start}/${win.end}`,
    details: event?.desc_en || event?.desc_es || '',
    location: event?.location || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Points at our ICS endpoint, which streams a downloadable .ics (Apple Calendar).
export function appleCalendarUrl(event, title) {
  const win = eventWindow(event);
  if (!win) return '';
  const params = new URLSearchParams({
    title: title || event?.title_en || event?.title_es || 'Event',
    start: win.start,
    end: win.end,
    location: event?.location || '',
    details: event?.desc_en || event?.desc_es || '',
  });
  return `${BASE}/api/calendar?${params.toString()}`;
}
