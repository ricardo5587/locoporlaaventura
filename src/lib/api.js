// Sends form submissions to an external form backend (e.g. Formspree, Web3Forms).
// Configure VITE_FORM_ENDPOINT in .env — see README for setup instructions.
export async function submitForm(formType, payload) {
  const endpoint = import.meta.env.VITE_FORM_ENDPOINT;
  if (!endpoint) {
    console.warn('[LPLA] VITE_FORM_ENDPOINT is not set — form submission simulated, nothing was sent.');
    return { ok: true, simulated: true };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ formType, ...payload }),
  });

  if (!res.ok) throw new Error(`Form submission failed (${res.status})`);
  return { ok: true, simulated: false };
}
