import { renderBookingConfirmation } from '@/lib/email-templates/booking-confirmation';
import { sendEmail } from '@/lib/email/resend';
import { googleCalendarUrl, appleCalendarUrl } from '@/lib/email/calendar';

export const CAT_COLORS = {
  Escalada: '#155070', Senderismo: '#3A5E14', Taller: '#5E3B1E',
  Keynote: '#5E8BBD', Social: '#1B5E7F', 'Expedición': '#2D4D0E', Voluntario: '#00897A',
};

// Build the renderBookingConfirmation data object from an event row + order facts.
export function buildBookingData({ event, firstName, confirmationNumber, ticketLabel, qty, unitPrice, amount, es = false }) {
  const title = (es ? event?.title_es : event?.title_en) || event?.title_en || event?.title_es || '';
  return {
    es,
    firstName: firstName || 'Adventurer',
    confirmationNumber,
    eventTitle: title,
    eventCategory: event?.category || '',
    categoryColor: CAT_COLORS[event?.category] || '#1B5E7F',
    eventDate: event?.date || '',
    eventTime: event?.time || '',
    duration: event?.duration || '',
    location: event?.location || '',
    note: (es ? event?.desc_es : event?.desc_en) || '',
    ticketType: ticketLabel || '',
    quantity: qty,
    unitPrice: unitPrice ?? 0,
    totalAmount: amount ?? 0,
    isFree: (amount ?? 0) === 0,
    whatToBring: Array.isArray(event?.what_to_bring) ? event.what_to_bring : [],
    calendarUrl: googleCalendarUrl(event, title),
    appleCalendarUrl: appleCalendarUrl(event, title),
    eventDetailUrl: event?.id ? `https://locoporlaaventura.com/events/${event.id}` : '#',
  };
}

// Render + send a booking confirmation email. Returns the Resend response.
export async function sendBookingConfirmation(args) {
  const { email } = args;
  if (!email) throw new Error('email is required to send a confirmation');
  const data = buildBookingData(args);
  const html = renderBookingConfirmation(data);
  const subject = data.es
    ? `🏔️ ¡Reserva confirmada! ${data.eventTitle}`
    : `🏔️ Booking confirmed! ${data.eventTitle}`;
  return sendEmail({ to: email, subject, html });
}
