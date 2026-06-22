import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { renderBookingConfirmation } from '@/lib/email-templates/booking-confirmation';
import {
  getAccount, getLists, getTemplates, createTemplate, updateTemplate,
  createCampaign, getCampaignMessageId, assignTemplateToCampaignMessage, sendCampaign,
} from '@/lib/klaviyo';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

const SAMPLE = {
  firstName: 'Adventurer',
  confirmationNumber: 'LPLA-TEST01',
  eventTitle: 'Rock Climbing · Smith Rock',
  eventCategory: 'Climbing',
  categoryColor: '#155070',
  eventDate: 'Sunday, Jun 21, 2026',
  eventTime: '7:00 AM',
  duration: '6h',
  location: 'Smith Rock, Terrebonne OR',
  note: 'Gear included. Certified guide for all levels.',
  ticketType: 'General Admission',
  quantity: 2,
  unitPrice: 15,
  totalAmount: 30,
  isFree: false,
  whatToBring: ['Comfortable clothing', 'Water (2+ liters)', 'Snacks', 'Sunscreen SPF 30+', 'Closed-toe shoes'],
};

const TEMPLATE_NAME = 'LPLA Test Confirmation';

export async function POST(request) {
  const auth = requireRole(request, ['owner']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json().catch(() => ({}));
    let listId = (body.listId || '').trim();
    const listName = (body.listName || '').trim();
    if (!listId && listName) {
      const lists = await getLists();
      const match = lists.find(l => (l.attributes?.name || '').toLowerCase() === listName.toLowerCase());
      if (!match) {
        return NextResponse.json({ error: `List "${listName}" not found` }, { status: 404, headers: CORS });
      }
      listId = match.id;
    }
    if (!listId) {
      return NextResponse.json({ error: 'listId or listName is required' }, { status: 400, headers: CORS });
    }
    const subject = body.subject || '🏔️ Your LPLA booking is confirmed!';

    // 1. Verified sender from the Klaviyo account.
    const account = await getAccount();
    const contact = account?.attributes?.contact_information || {};
    const fromEmail = body.fromEmail || contact.default_sender_email;
    const fromLabel = body.fromLabel || contact.default_sender_name || 'Loco Por La Aventura';
    if (!fromEmail) {
      return NextResponse.json({
        error: 'No verified sender found in Klaviyo. Set a default sender (verified email/domain) in Klaviyo settings first.',
      }, { status: 400, headers: CORS });
    }

    // 2. Render the booking confirmation with sample data (static, no Jinja).
    const html = renderBookingConfirmation(SAMPLE);

    // 3. Create or update the test template in Klaviyo.
    const existing = (await getTemplates()).find(t => t.attributes?.name === TEMPLATE_NAME);
    let templateId;
    if (existing) {
      await updateTemplate(existing.id, html, TEMPLATE_NAME);
      templateId = existing.id;
    } else {
      const created = await createTemplate(TEMPLATE_NAME, html);
      templateId = created.data.id;
    }

    // 4. Create the campaign targeting the list.
    const campaign = await createCampaign({
      name: `LPLA Test Confirmation · ${new Date().toISOString().slice(0, 16)}`,
      listId, subject,
      previewText: 'See you on the trail!',
      fromEmail, fromLabel,
    });
    const campaignId = campaign.id;

    // 5. Attach the template to the campaign message.
    const messageId = await getCampaignMessageId(campaignId);
    if (!messageId) throw new Error('Could not resolve campaign message id');
    await assignTemplateToCampaignMessage(messageId, templateId);

    // 6. Send it.
    await sendCampaign(campaignId);

    return NextResponse.json({
      ok: true,
      campaignId,
      templateId,
      fromEmail,
      sentToList: listId,
    }, { status: 201, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: CORS });
  }
}
