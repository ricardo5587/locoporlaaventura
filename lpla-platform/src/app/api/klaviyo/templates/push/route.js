import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createTemplate, updateTemplate, getTemplates } from '@/lib/klaviyo';
import { KLAVIYO_TEMPLATE_HTML } from '@/lib/email-templates/booking-confirmation';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const TEMPLATE_NAME = 'LPLA Booking Confirmation';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  try {
    const templates = await getTemplates();
    const existing = templates.find(t => t.attributes?.name === TEMPLATE_NAME);

    let result;
    if (existing) {
      result = await updateTemplate(existing.id, KLAVIYO_TEMPLATE_HTML, TEMPLATE_NAME);
      return NextResponse.json({ action: 'updated', templateId: existing.id, data: result }, { headers: CORS });
    }

    result = await createTemplate(TEMPLATE_NAME, KLAVIYO_TEMPLATE_HTML);
    return NextResponse.json({ action: 'created', data: result }, { headers: CORS });
  } catch (err) {
    console.error('Error pushing template to Klaviyo:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
