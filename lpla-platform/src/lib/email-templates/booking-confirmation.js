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

const LOGO_URL = 'https://locoporlaaventura.com/cdn/shop/files/logolpla_200x.png';
const FONT_HEADING = "'Barlow Condensed', Arial, sans-serif";
const FONT_BODY    = "'Nunito', Arial, sans-serif";

/* ── Inline SVG helpers ── */

const mountainSvg = (fill) => `
<svg width="600" height="60" viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg" style="display:block;">
  <polygon points="0,60 80,18 140,40 200,10 280,38 340,8 400,32 460,14 520,36 600,4 600,60" fill="${fill}" opacity="0.25"/>
  <polygon points="0,60 60,30 130,48 190,22 260,44 330,16 410,42 480,20 550,44 600,18 600,60" fill="${fill}" opacity="0.45"/>
</svg>`;

const checkCircleSvg = `
<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
  <tr><td align="center" style="width:56px;height:56px;border-radius:50%;background-color:${C.green};text-align:center;vertical-align:middle;">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6 12 10 16 18 8" stroke="${C.white}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  </td></tr>
</table>`;

const iconCalendar = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><rect x="3" y="4" width="18" height="18" rx="2" stroke="${C.teal}" stroke-width="2" fill="none"/><line x1="3" y1="10" x2="21" y2="10" stroke="${C.teal}" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="${C.teal}" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="2" x2="16" y2="6" stroke="${C.teal}" stroke-width="2" stroke-linecap="round"/></svg>`;

const iconClock = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><circle cx="12" cy="12" r="9" stroke="${C.teal}" stroke-width="2" fill="none"/><polyline points="12 7 12 12 16 14" stroke="${C.teal}" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`;

const iconPin = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="${C.teal}" stroke-width="2" fill="none"/><circle cx="12" cy="9" r="2.5" stroke="${C.teal}" stroke-width="2" fill="none"/></svg>`;

const iconInfo = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><circle cx="12" cy="12" r="9" stroke="${C.teal}" stroke-width="2" fill="none"/><line x1="12" y1="16" x2="12" y2="12" stroke="${C.teal}" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="8" r="1" fill="${C.teal}"/></svg>`;

const iconTicket = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><path d="M2 9V6a2 2 0 012-2h16a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3a2 2 0 000-4z" stroke="${C.teal}" stroke-width="2" fill="none"/><line x1="9" y1="4" x2="9" y2="20" stroke="${C.teal}" stroke-width="1.5" stroke-dasharray="3 3"/></svg>`;

const iconBackpack = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><rect x="5" y="8" width="14" height="14" rx="3" stroke="${C.brownMid}" stroke-width="2" fill="none"/><path d="M8 8V6a4 4 0 018 0v2" stroke="${C.brownMid}" stroke-width="2" fill="none"/><rect x="9" y="12" width="6" height="4" rx="1" stroke="${C.brownMid}" stroke-width="1.5" fill="none"/></svg>`;

const smallCheck = `<svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><circle cx="12" cy="12" r="10" fill="${C.green}"/><polyline points="7 12 10 15 17 9" stroke="${C.white}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

const iconStar = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${C.cream}" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>`;

const socialInstagram = `<a href="https://www.instagram.com/locoporlaaventura/" style="text-decoration:none;margin:0 6px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="${C.white}" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="5" stroke="${C.white}" stroke-width="1.5" fill="none"/><circle cx="17.5" cy="6.5" r="1.2" fill="${C.white}"/></svg></a>`;
const socialFacebook = `<a href="https://www.facebook.com/locoporlaaventura" style="text-decoration:none;margin:0 6px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="${C.white}" stroke-width="1.5" fill="none"/><path d="M16 8h-2a3 3 0 00-3 3v2h-2v3h2v5h3v-5h2l1-3h-3v-2a1 1 0 011-1h2V8z" fill="${C.white}"/></svg></a>`;
const socialTiktok = `<a href="https://www.tiktok.com/@locoporlaaventura" style="text-decoration:none;margin:0 6px;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="${C.white}" stroke-width="1.5" fill="none"/><path d="M15 4v8a5 5 0 11-3-4.58" stroke="${C.white}" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M15 4c1.5.5 3 2 3.5 4" stroke="${C.white}" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg></a>`;

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
        <tr><td style="background-color:${C.tealDark};padding:0;font-size:0;line-height:0;">
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
        <tr><td style="background-color:${C.tealDark};padding:0;font-size:0;line-height:0;">
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
