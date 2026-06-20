import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getTemplates, createTemplate, updateTemplate } from '@/lib/klaviyo';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  try {
    const templates = await getTemplates();
    return NextResponse.json(templates, { headers: CORS });
  } catch (err) {
    console.error('Error fetching templates:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}

export async function POST(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  try {
    const { name, html, templateId } = await request.json();

    if (templateId) {
      const result = await updateTemplate(templateId, html, name);
      return NextResponse.json(result, { headers: CORS });
    }

    const result = await createTemplate(name || 'LPLA Booking Confirmation', html);
    return NextResponse.json(result, { headers: CORS });
  } catch (err) {
    console.error('Error creating/updating template:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
