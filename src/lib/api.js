const API = 'https://locoporlaaventura.vercel.app';

export async function submitForm(formType, payload) {
  if (formType !== 'booking') {
    console.warn('[LPLA] Unknown form type:', formType);
    return { ok: true, simulated: true };
  }

  const body = {
    eventId: payload.event.id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    ticketId: payload.ticket?.id || 'general',
    ticketLabel: payload.ticket?.en || payload.ticket?.es || 'General',
    qty: payload.quantity || 1,
    amount: payload.total || 0,
    channel: 'Website widget',
    smsConsent: payload.smsConsent || false,
    emailConsent: payload.emailConsent || false,
  };

  const res = await fetch(`${API}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Booking failed (${res.status})`);
  }

  const order = await res.json();
  return { ok: true, order };
}

// Fetch the signed-in user's own bookings. The Google ID token (credential)
// is verified server-side, so this only ever returns the caller's records.
export async function fetchMyBookings(credential) {
  const res = await fetch(`${API}/api/my-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Could not load bookings (${res.status})`);
  }
  return res.json(); // { email, bookings: [...] }
}
