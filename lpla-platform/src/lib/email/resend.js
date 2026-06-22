const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Default sender. Override via RESEND_FROM env var in Vercel.
const FROM_DEFAULT = process.env.RESEND_FROM || 'Loco Por La Aventura <onboarding@resend.dev>';

export function resendConfigured() {
  return !!RESEND_API_KEY;
}

export async function sendEmail({ to, subject, html, from, replyTo }) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: from || FROM_DEFAULT,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${res.status} ${err}`);
  }
  return res.json();
}
