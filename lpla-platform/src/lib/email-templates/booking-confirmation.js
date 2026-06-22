// ─────────────────────────────────────────────────────────────
//  LPLA Booking-Confirmation Email Template
//  Exports:
//    renderBookingConfirmation(data) => HTML string
//    KLAVIYO_TEMPLATE_HTML            => Jinja-ready HTML string
// ─────────────────────────────────────────────────────────────

/* ── Brand tokens ── */
const C = {
  tealDark:   '#0B1E2B',
  teal:       '#1B5E7F',
  tealMid:    '#155070',
  green:      '#7EBF2E',
  greenDark:  '#5C8F22',
  cream:      '#E8D5B5',
  creamLight: '#F5EDD8',
  creamPale:  '#FAF6EE',
  brown:      '#5E3B1E',
  brownMid:   '#7A4F2A',
  mountain:   '#4A6E1A',
  mountainDk: '#2D4D0E',
  text:       '#0F2030',
  textMuted:  '#5A7080',
  white:      '#FFFFFF',
};

const LOGO_URL = 'https://locoporlaaventura.vercel.app/logo.png';
const FONT_HEADING = "'Barlow Condensed', Arial, sans-serif";
const FONT_BODY    = "'Nunito', Arial, sans-serif";

/* ── Icon helpers (emoji/Unicode — render in Gmail, Outlook, Apple Mail) ── */
/* Inline SVG is stripped by Gmail/Outlook, so we use emoji glyphs instead. */

const mountainSvg = () => `<div style="font-family:Arial,sans-serif;font-size:22px;line-height:28px;text-align:center;letter-spacing:6px;padding:6px 0;">🏔️ ⛰️ 🏔️ ⛰️ 🏔️</div>`;

const checkCircleSvg = `
<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
  <tr><td align="center" style="width:56px;height:56px;border-radius:50%;background-color:${C.green};text-align:center;vertical-align:middle;font-family:Arial,sans-serif;font-size:30px;line-height:56px;color:${C.white};font-weight:bold;">&#10003;</td></tr>
</table>`;

const iconCalendar = '<span style="font-size:16px;">📅</span>';
const iconClock    = '<span style="font-size:16px;">⏱️</span>';
const iconPin      = '<span style="font-size:16px;">📍</span>';
const iconInfo     = '<span style="font-size:16px;">ℹ️</span>';
const iconTicket   = '<span style="font-size:20px;">🎫</span>';
const iconBackpack = '<span style="font-size:20px;">🎒</span>';
const smallCheck   = '<span style="font-size:14px;">✅</span>';
const iconStar     = '<span style="font-size:18px;">⭐</span>';

const socialLink = (href, label) => `<a href="${href}" style="color:${C.white};text-decoration:none;font-family:${FONT_BODY};font-size:13px;font-weight:700;margin:0 10px;">${label}</a>`;
const socialInstagram = socialLink('https://www.instagram.com/locoporlaaventura/', 'Instagram');
const socialFacebook  = socialLink('https://www.facebook.com/locoporlaaventura', 'Facebook');
const socialTiktok    = socialLink('https://www.tiktok.com/@locoporlaaventura', 'TikTok');

/* ── Detail-row helper ── */
function detailRow(icon, label, value) {
  if (!value) return '';
  return `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="30" valign="top" style="padding-right:8px;">${icon}</td>
          <td style="font-family:${FONT_BODY};font-size:14px;color:${C.text};">
            <span style="font-weight:700;">${label}:</span> ${esc(value)}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

/* ── Escape HTML helper (skips Jinja {{…}} and {%…%} blocks) ── */
function esc(s) {
  if (s == null) return '';
  const str = String(s);
  if (/\{\{.*\}\}/.test(str) || /\{%.*%\}/.test(str)) return str;
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Format currency ── */
function fmtPrice(amount, es) {
  if (amount == null) return '';
  const n = Number(amount);
  if (isNaN(n)) return '$' + amount;
  if (n === 0) return es ? 'Gratis' : 'Free';
  return '$' + n.toFixed(2);
}

/* ── Google Calendar URL builder ── */
function googleCalUrl(data) {
  if (data.calendarUrl) return data.calendarUrl;
  return '#';
}

/* ── Apple Calendar URL ── */
function appleCalUrl(data) {
  // Placeholder — real implementation would generate .ics
  return '#';
}

/* ────────────────────────────────────────
   Main render function
   ──────────────────────────────────────── */

export function renderBookingConfirmation(data) {
  const {
    es = false,
    firstName = 'Adventurer',
    confirmationNumber = '',
    eventTitle = '',
    eventCategory = '',
    categoryColor = C.teal,
    eventDate = '',
    eventTime = '',
    duration = '',
    location = '',
    note = '',
    ticketType = '',
    quantity = 1,
    unitPrice = 0,
    totalAmount = 0,
    isFree = false,
    whatToBring = [],
    calendarUrl = '',
    eventDetailUrl = '#',
  } = data || {};

  const t = {
    confirmed:   es ? '¡Reserva Confirmada!' : 'Booking Confirmed!',
    confLabel:   es ? 'Confirmación' : 'Confirmation',
    greeting:    es ? `¡Hola, ${esc(firstName)}!` : `Hey there, ${esc(firstName)}!`,
    saveEmail:   es
      ? 'Guarda este correo. Lo necesitarás el día del evento.'
      : 'Save this email. You\'ll need it on the day of your adventure.',
    date:        es ? 'Fecha' : 'Date',
    time:        es ? 'Hora'  : 'Time',
    duration:    es ? 'Duración' : 'Duration',
    location:    es ? 'Ubicación' : 'Location',
    note:        es ? 'Nota' : 'Note',
    ticketDets:  es ? 'Detalles del Boleto' : 'Ticket Details',
    type:        es ? 'Tipo' : 'Type',
    qty:         es ? 'Cantidad' : 'Qty',
    price:       es ? 'Precio' : 'Unit Price',
    total:       es ? 'Total' : 'Total',
    free:        es ? 'Gratis' : 'Free',
    whatToBring: es ? 'Qué llevar' : 'What to Bring',
    viewEvent:   es ? 'Ver Detalles del Evento' : 'View Event Details',
    shareAdv:    es ? '¡Comparte tu aventura!' : 'Share your adventure!',
    addGoogle:   es ? 'Google Calendar' : 'Add to Google Calendar',
    addApple:    es ? 'Apple Calendar' : 'Add to Apple Calendar',
    address:     '544 SE Oak St #206, Portland, OR 97214',
    nonprofit:   es
      ? 'Loco Por La Aventura es una organización sin fines de lucro 501(c)(3).'
      : 'Loco Por La Aventura is a registered 501(c)(3) nonprofit organization.',
    unsubscribe: es ? 'Desuscribirse' : 'Unsubscribe',
    privacy:     es ? 'Privacidad' : 'Privacy',
    terms:       es ? 'Términos' : 'Terms',
  };

  const dateTimeStr = [eventDate, eventTime].filter(Boolean).join(es ? ' a las ' : ' at ');

  const whatToBringHtml = whatToBring.length ? `
  <!-- What to Bring -->
  <tr><td style="padding:0 24px 24px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.creamLight};border-radius:12px;padding:20px;">
      <tr><td style="padding:20px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-right:8px;vertical-align:middle;">${iconBackpack}</td>
            <td style="font-family:${FONT_HEADING};font-size:18px;font-weight:700;color:${C.brown};text-transform:uppercase;letter-spacing:1px;">
              ${t.whatToBring}
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:12px;">
          ${whatToBring.map(item => `
          <tr>
            <td style="padding:4px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="24" valign="top" style="padding-right:8px;">${smallCheck}</td>
                  <td style="font-family:${FONT_BODY};font-size:14px;color:${C.brown};">${esc(item)}</td>
                </tr>
              </table>
            </td>
          </tr>`).join('')}
        </table>
      </td></tr>
    </table>
  </td></tr>` : '';

  return `<!DOCTYPE html>
<html lang="${es ? 'es' : 'en'}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${t.confirmed}</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
  <!--[if mso]>
  <style>table,td{font-family:Arial,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#e0d9cf;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- Outer wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#e0d9cf;">
    <tr><td align="center" style="padding:24px 16px;">

      <!-- Email container 600px -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:${C.creamPale};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);">

        <!-- ═══ HEADER ═══ -->
        <tr><td style="background-color:${C.tealDark};padding:32px 24px 0;text-align:center;">
          <img src="${LOGO_URL}" alt="Loco Por La Aventura" width="140" style="display:inline-block;max-width:140px;height:auto;border:0;">
        </td></tr>
        <tr><td style="background-color:${C.tealDark};padding:0;">
          ${mountainSvg(C.teal)}
        </td></tr>

        <!-- ═══ HERO BAND ═══ -->
        <tr><td style="background-color:${C.teal};padding:32px 24px;text-align:center;">
          ${checkCircleSvg}
          <h1 style="margin:16px 0 8px;font-family:${FONT_HEADING};font-size:28px;font-weight:700;color:${C.white};text-transform:uppercase;letter-spacing:1.5px;">
            ${t.confirmed}
          </h1>
          <p style="margin:0;font-family:${FONT_BODY};font-size:14px;color:rgba(255,255,255,0.85);">
            ${t.confLabel} #<strong style="color:${C.white};font-size:16px;">${esc(confirmationNumber)}</strong>
          </p>
        </td></tr>

        <!-- ═══ BODY ═══ -->
        <!-- Greeting -->
        <tr><td style="padding:32px 24px 8px;">
          <h2 style="margin:0;font-family:${FONT_HEADING};font-size:22px;font-weight:700;color:${C.text};">
            ${t.greeting}
          </h2>
        </td></tr>
        <tr><td style="padding:0 24px 24px;">
          <p style="margin:0;font-family:${FONT_BODY};font-size:15px;color:${C.textMuted};line-height:1.6;">
            ${t.saveEmail}
          </p>
        </td></tr>

        <!-- ═══ EVENT CARD ═══ -->
        <tr><td style="padding:0 24px 24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.white};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <!-- Category stripe -->
            <tr><td style="height:6px;background-color:${categoryColor};font-size:1px;line-height:1px;">&nbsp;</td></tr>
            <!-- Event title -->
            <tr><td style="padding:20px 20px 4px;">
              ${eventCategory ? `<p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${categoryColor};text-transform:uppercase;letter-spacing:1.2px;">${esc(eventCategory)}</p>` : ''}
              <h3 style="margin:0;font-family:${FONT_HEADING};font-size:20px;font-weight:700;color:${C.text};">
                ${esc(eventTitle)}
              </h3>
            </td></tr>
            <!-- Details -->
            <tr><td style="padding:12px 20px 4px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${detailRow(iconCalendar, t.date, dateTimeStr)}
                ${detailRow(iconClock, t.duration, duration)}
                ${detailRow(iconPin, t.location, location)}
                ${detailRow(iconInfo, t.note, note)}
              </table>
            </td></tr>
            <!-- Calendar buttons -->
            <tr><td style="padding:16px 20px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="${googleCalUrl(data)}" style="display:inline-block;padding:8px 18px;background-color:${C.teal};color:${C.white};font-family:${FONT_BODY};font-size:12px;font-weight:700;text-decoration:none;border-radius:20px;">
                      ${t.addGoogle}
                    </a>
                  </td>
                  <td>
                    <a href="${appleCalUrl(data)}" style="display:inline-block;padding:8px 18px;background-color:${C.tealMid};color:${C.white};font-family:${FONT_BODY};font-size:12px;font-weight:700;text-decoration:none;border-radius:20px;">
                      ${t.addApple}
                    </a>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- ═══ TICKET DETAILS CARD ═══ -->
        <tr><td style="padding:0 24px 24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.white};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <!-- Header -->
            <tr><td style="padding:18px 20px 12px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:8px;vertical-align:middle;">${iconTicket}</td>
                  <td style="font-family:${FONT_HEADING};font-size:18px;font-weight:700;color:${C.text};text-transform:uppercase;letter-spacing:1px;">
                    ${t.ticketDets}
                  </td>
                </tr>
              </table>
            </td></tr>
            <!-- Rows -->
            <tr><td style="padding:0 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;font-family:${FONT_BODY};font-size:14px;color:${C.textMuted};">${t.type}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;font-family:${FONT_BODY};font-size:14px;color:${C.text};text-align:right;font-weight:600;">${esc(ticketType)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;font-family:${FONT_BODY};font-size:14px;color:${C.textMuted};">${t.qty}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;font-family:${FONT_BODY};font-size:14px;color:${C.text};text-align:right;font-weight:600;">${quantity}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;font-family:${FONT_BODY};font-size:14px;color:${C.textMuted};">${t.price}</td>
                  <td style="padding:8px 0;border-bottom:1px solid #f0ebe3;font-family:${FONT_BODY};font-size:14px;color:${C.text};text-align:right;font-weight:600;">${isFree ? t.free : fmtPrice(unitPrice, es)}</td>
                </tr>
              </table>
            </td></tr>
            <!-- Total -->
            <tr><td style="padding:14px 20px 18px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.creamPale};border-radius:8px;">
                <tr>
                  <td style="padding:12px 16px;font-family:${FONT_HEADING};font-size:16px;font-weight:700;color:${C.text};text-transform:uppercase;">${t.total}</td>
                  <td style="padding:12px 16px;font-family:${FONT_HEADING};font-size:22px;font-weight:700;color:${C.teal};text-align:right;">
                    ${isFree ? t.free : fmtPrice(totalAmount, es)}
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        ${whatToBringHtml}

        <!-- ═══ CTA BUTTON ═══ -->
        <tr><td style="padding:8px 24px 32px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td align="center" style="background-color:${C.teal};border-radius:12px;padding:16px;">
              <a href="${esc(eventDetailUrl)}" style="display:block;font-family:${FONT_HEADING};font-size:16px;font-weight:700;color:${C.white};text-decoration:none;text-transform:uppercase;letter-spacing:1.5px;">
                ${t.viewEvent}
              </a>
            </td></tr>
          </table>
        </td></tr>

        <!-- ═══ SOCIAL ═══ -->
        <tr><td style="padding:0 24px 24px;text-align:center;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="padding:0 8px;">${iconStar}</td>
              <td style="padding:0 8px;">${iconStar}</td>
              <td style="padding:0 8px;">${iconStar}</td>
            </tr>
          </table>
          <p style="margin:12px 0 16px;font-family:${FONT_BODY};font-size:14px;color:${C.textMuted};font-weight:600;">
            ${t.shareAdv}
          </p>
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td>${socialInstagram}</td>
              <td>${socialFacebook}</td>
              <td>${socialTiktok}</td>
            </tr>
          </table>
        </td></tr>

        <!-- ═══ FOOTER ═══ -->
        <tr><td style="background-color:${C.tealDark};padding:0;">
          ${mountainSvg(C.mountain)}
        </td></tr>
        <tr><td style="background-color:${C.tealDark};padding:0 24px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="LPLA" width="80" style="display:inline-block;max-width:80px;height:auto;border:0;opacity:0.7;">
          <p style="margin:12px 0 4px;font-family:${FONT_BODY};font-size:12px;color:rgba(255,255,255,0.5);">
            ${t.address}
          </p>
          <p style="margin:0 0 4px;font-family:${FONT_BODY};font-size:12px;">
            <a href="mailto:info@locoporlaaventura.com" style="color:rgba(255,255,255,0.6);text-decoration:underline;">info@locoporlaaventura.com</a>
          </p>
          <p style="margin:0 0 12px;font-family:${FONT_BODY};font-size:11px;color:rgba(255,255,255,0.4);line-height:1.5;">
            ${t.nonprofit}
          </p>
          <p style="margin:0;font-family:${FONT_BODY};font-size:11px;">
            <a href="#" style="color:rgba(255,255,255,0.5);text-decoration:underline;margin:0 8px;">${t.unsubscribe}</a>
            <a href="#" style="color:rgba(255,255,255,0.5);text-decoration:underline;margin:0 8px;">${t.privacy}</a>
            <a href="#" style="color:rgba(255,255,255,0.5);text-decoration:underline;margin:0 8px;">${t.terms}</a>
          </p>
        </td></tr>

      </table>
      <!-- /Email container -->

    </td></tr>
  </table>
</body>
</html>`;
}

/* ────────────────────────────────────────
   Klaviyo Template (English, Jinja vars)
   ──────────────────────────────────────── */

export const KLAVIYO_TEMPLATE_HTML = renderBookingConfirmation({
  es: false,
  firstName: '{{ person.first_name|default:"Adventurer" }}',
  confirmationNumber: '{{ event.extra.confirmation_number }}',
  eventTitle: '{{ event.extra.event_name_en }}',
  eventCategory: '{{ event.extra.event_category }}',
  categoryColor: C.teal,
  eventDate: '{{ event.extra.event_date }}',
  eventTime: '{{ event.extra.event_time }}',
  duration: '{{ event.extra.event_duration }}',
  location: '{{ event.extra.event_location }}',
  note: '',
  ticketType: '{{ event.extra.ticket_type }}',
  quantity: '{{ event.extra.quantity }}',
  unitPrice: 'SENTINEL_UNIT',
  totalAmount: 'SENTINEL_TOTAL',
  isFree: false,
  whatToBring: [],
  calendarUrl: '#',
  eventDetailUrl: '#',
})
  // fmtPrice turns non-numeric strings into "$NaN" — replace with Jinja
  // First $NaN = unit price row, second $NaN = total row
  .replace(
    '$NaN',
    '{% if event.extra.is_free %}Free{% else %}{{ event.extra.unit_price }}{% endif %}'
  )
  .replace(
    '$NaN',
    '{% if event.extra.is_free %}Free{% else %}{{ event.extra.total_amount }}{% endif %}'
  );
