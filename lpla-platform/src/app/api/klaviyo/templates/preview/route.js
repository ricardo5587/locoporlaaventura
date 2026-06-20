import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { renderBookingConfirmation } from '@/lib/email-templates/booking-confirmation';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request) {
  const auth = requireRole(request, ['owner', 'editor']);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const event = url.searchParams.get('event') || 'climbing';

  const SAMPLE_EVENTS = {
    climbing: {
      firstName: 'Carlos',
      confirmationNumber: 'LPLA-4827',
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
    },
    hiking: {
      firstName: 'María',
      confirmationNumber: 'LPLA-7391',
      eventTitle: 'Sunrise Hike · Mt. Hood',
      eventCategory: 'Hiking',
      categoryColor: '#3A5E14',
      eventDate: 'Saturday, Jun 28, 2026',
      eventTime: '5:30 AM',
      duration: '4h',
      location: 'Timberline Lodge, Mt. Hood OR',
      note: 'Meeting point: Timberline Lodge Parking.',
      ticketType: 'Standard',
      quantity: 1,
      unitPrice: 8,
      totalAmount: 8,
      isFree: false,
      whatToBring: ['Headlamp', 'Warm jacket', 'Water', 'Hiking boots', 'Light snacks'],
    },
    free: {
      firstName: 'Adventurer',
      confirmationNumber: 'LPLA-1002',
      eventTitle: 'LPLA Community BBQ',
      eventCategory: 'Social',
      categoryColor: '#1B5E7F',
      eventDate: 'Sunday, Sep 6, 2026',
      eventTime: '12:00 PM',
      duration: '5h',
      location: 'Tom McCall Waterfront Park, Portland OR',
      note: 'Food and live Latin music included.',
      ticketType: 'Adult',
      quantity: 3,
      unitPrice: 0,
      totalAmount: 0,
      isFree: true,
      whatToBring: ['Good vibes!', 'Sunscreen', 'Chair (optional)'],
    },
  };

  const data = SAMPLE_EVENTS[event] || SAMPLE_EVENTS.climbing;
  const html = renderBookingConfirmation(data);

  return new NextResponse(html, {
    headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' },
  });
}
