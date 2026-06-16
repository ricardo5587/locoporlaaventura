const CLOVER_BASE = 'https://scl.clover.com/v1';

export async function chargeCard({ token, amount, description }) {
  const res = await fetch(`${CLOVER_BASE}/charges`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOVER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,          // in cents
      currency: 'usd',
      source: token,
      description,
      capture: true,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(err.message || 'Clover charge failed'), { status: 402 });
  }
  return res.json();
}

export async function refundCharge(chargeId, amountCents) {
  const body = amountCents ? { amount: amountCents } : {};
  const res = await fetch(`${CLOVER_BASE}/charges/${chargeId}/refunds`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOVER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Clover refund failed');
  }
  return res.json();
}
