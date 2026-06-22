// ─────────────────────────────────────────────────────────────
//  LPLA Booking-Confirmation Email Template
//  Matches the LPLA design mockup, rebuilt as email-safe table HTML.
//  Graphics (mountains, icons, stars) are hosted PNGs because Gmail/Outlook
//  strip inline SVG. Assets live in /public/email and are served from the
//  admin domain.
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

const IMG = 'https://locoporlaaventura.vercel.app/email';
const LOGO_URL = 'https://locoporlaaventura.vercel.app/logo.png';
// Heading-image endpoint: renders text as a PNG in real Barlow Condensed so
// Gmail (which strips web fonts) still shows the brand typeface on the two
// most prominent headings — the hero and the event title.
const OG = 'https://locoporlaaventura.vercel.app/api/og/heading';

// Build a Barlow-Condensed heading image + its responsive <img>. Falls back to
// live text via alt so the meaning survives if images are blocked.
function headingImg({ text, size, color, weight = 900, w, align = 'center', maxChars = 30 }) {
  const safe = String(text || '');
  // Jinja/dynamic strings can't be baked into a static image URL, so fall back
  // to live styled text (used by the Klaviyo export path).
  if (/\{\{.*\}\}/.test(safe) || /\{%.*%\}/.test(safe)) {
    return `<div style="font-family:${FH};font-size:${size}px;font-weight:${weight};color:${color};text-transform:uppercase;letter-spacing:${align==='center'?'1.5px':'.5px'};line-height:1.1;text-align:${align};">${safe}</div>`;
  }
  const lines = safe.length > maxChars ? 2 : 1;
  const h = Math.round(size * 1.18) * lines;
  const url = `${OG}?text=${encodeURIComponent(safe)}&size=${size}&color=${String(color).replace('#','')}&weight=${weight}&w=${w}&h=${h}&lines=${lines}&align=${align}`;
  const disp = align === 'left' ? 'block' : 'inline-block';
  return `<img src="${url}" width="${w}" height="${h}" alt="${esc(safe)}" style="display:${disp};width:100%;max-width:${w}px;height:auto;border:0;${align==='center'?'margin:0 auto;':''}">`;
}
// Heading falls back to Arial Narrow (condensed, system-available) so Gmail —
// which won't load web fonts — stays close to Barlow Condensed. Apple Mail/iOS
// load the real web fonts via the <link>/@font-face in <head>.
const FH = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
const FB = "'Nunito', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/* ── Escape HTML (skips Jinja {{…}} and {%…%} blocks) ── */
function esc(s) {
  if (s == null) return '';
  const str = String(s);
  if (/\{\{.*\}\}/.test(str) || /\{%.*%\}/.test(str)) return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Format currency (returns "$NaN" for non-numeric so the Klaviyo
   template can swap in Jinja conditionals) ── */
function fmtPrice(amount, es) {
  const n = Number(amount);
  if (isNaN(n)) return '$NaN';
  if (n === 0) return es ? 'Gratis' : 'Free';
  return '$' + n.toFixed(2);
}

/* ── Small helpers ── */
function starsRow(file, n, size) {
  const cell = `<td style="padding:0 2.5px;"><img src="${IMG}/${file}" width="${size}" height="${size}" alt="" style="display:block;border:0;"></td>`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>${cell.repeat(n)}</tr></table>`;
}

function detailRow(iconFile, text, color) {
  if (!text) return '';
  return `<tr><td style="padding-bottom:12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="26" valign="top" style="padding-top:1px;"><img src="${IMG}/${iconFile}" width="15" height="15" alt="" style="display:block;border:0;"></td>
      <td style="font-family:${FB};font-size:14px;color:${color || C.text};line-height:1.5;">${esc(text)}</td>
    </tr></table>
  </td></tr>`;
}

function calButton(url, iconFile, label) {
  return `<a href="${url}" style="display:block;background:${C.teal};border-radius:999px;padding:13px 20px;text-decoration:none;text-align:center;">
    <img src="${IMG}/${iconFile}" width="20" height="20" alt="" style="vertical-align:middle;border:0;margin-right:9px;border-radius:5px;">
    <span style="font-family:${FH};font-size:14px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:${C.white};vertical-align:middle;">${label}</span>
  </a>`;
}

/* ────────────────────────────────────────
   Main render function
   ──────────────────────────────────────── */
export function renderBookingConfirmation(data) {
  const {
    es = false,
    firstName = '',
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

  const name = firstName || (es ? 'aventurero/a' : 'adventurer');
  const gCal = calendarUrl || '#';
  const dateLine = [eventDate, eventTime].filter(Boolean).join('  ·  ');
  const durationLine = duration ? `${es ? 'Duración' : 'Duration'}: ${duration}` : '';
  const qtyLabel = quantity == 1 ? (es ? 'entrada' : 'ticket') : (es ? 'entradas' : 'tickets');
  const unitDisplay = isFree ? (es ? 'Gratuito' : 'Free') : fmtPrice(unitPrice, es);
  const totalDisplay = isFree ? (es ? '¡GRATIS!' : 'FREE!') : fmtPrice(totalAmount, es);

  const t = {
    confirmed: es ? '¡Reserva Confirmada!' : 'Booking Confirmed!',
    confLabel: es ? 'Confirmación' : 'Confirmation',
    greeting: es ? `¡Hola, ${esc(name)}!` : `Hey there, ${esc(name)}!`,
    intro: es
      ? 'Tu reserva fue procesada con éxito. Guarda este email para el día del evento. ¡Tu próxima aventura está a punto de comenzar!'
      : 'Your booking was successfully processed. Save this email for event day. Your next adventure is just around the corner!',
    ticketDets: es ? 'Detalle de Entrada' : 'Ticket Details',
    type: es ? 'Tipo' : 'Type',
    qty: es ? 'Cantidad' : 'Qty',
    unit: es ? 'Precio unitario' : 'Unit price',
    total: es ? 'Total pagado' : 'Total paid',
    whatToBring: es ? '¿Qué traer?' : 'What to Bring',
    viewEvent: es ? 'Ver Detalles del Evento' : 'View Event Details',
    addGoogle: es ? 'Agregar a Google Calendar' : 'Add to Google Calendar',
    addApple: es ? 'Agregar a Apple Calendar' : 'Add to Apple Calendar',
    shareTitle: es ? '¡Comparte tu aventura!' : 'Share your adventure!',
    shareBody: es ? 'Etiquétanos con #LocosPorLaAventura y conecta con la comunidad.' : 'Tag us with #LocosPorLaAventura and connect with the community.',
    address: '544 SE Oak St #206, Portland, OR 97214',
    nonprofit: es
      ? 'Loco por la Aventura es una organización sin fines de lucro 501(c)(3) con sede en Oregón.'
      : 'Loco por la Aventura is a 501(c)(3) nonprofit organization based in Oregon.',
    received: es ? 'Recibiste este email porque realizaste una reserva.' : 'You received this email because you made a booking.',
    unsubscribe: es ? 'Cancelar suscripción' : 'Unsubscribe',
    privacy: es ? 'Privacidad' : 'Privacy',
    terms: es ? 'Términos' : 'Terms',
  };

  const socials = [
    { href: 'https://www.instagram.com/locoporlaaventura/?hl=en', label: 'Instagram · @locoporlaaventura' },
    { href: 'https://www.facebook.com/Locoporlaaventura/', label: 'Facebook · @Locoporlaaventura' },
    { href: 'https://www.tiktok.com/@anibalrocheta', label: 'TikTok · @anibalrocheta' },
  ];

  const bringHtml = (whatToBring && whatToBring.length) ? `
  <tr><td style="padding:14px 20px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.creamLight};border:1px solid ${C.cream};border-radius:16px;">
      <tr><td style="padding:16px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="24" valign="middle"><img src="${IMG}/icon-pack.png" width="15" height="15" alt="" style="display:block;border:0;"></td>
          <td style="font-family:${FH};font-size:12px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:${C.brown};">${t.whatToBring}</td>
        </tr></table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
          ${whatToBring.map(item => `<tr><td style="padding-bottom:10px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="26" valign="middle"><img src="${IMG}/icon-check.png" width="16" height="16" alt="" style="display:block;border:0;"></td>
              <td style="font-family:${FB};font-size:14px;color:${C.text};line-height:1.4;">${esc(item)}</td>
            </tr></table>
          </td></tr>`).join('')}
        </table>
      </td></tr>
    </table>
  </td></tr>` : '';

  return `<!DOCTYPE html>
<html lang="${es ? 'es' : 'en'}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${t.confirmed}</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap');
  </style>
  <!--[if mso]><style>table,td,div,span,a,p{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#E8E0D4;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#E8E0D4;">
    <tr><td align="center" style="padding:24px 12px 40px;">

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:${C.creamPale};border-radius:16px;overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,0.18);">

        <!-- HEADER -->
        <tr><td style="background-color:${C.tealDark};padding:28px 24px 10px;text-align:center;">
          <img src="${LOGO_URL}" width="97" height="100" alt="Loco Por La Aventura" style="display:inline-block;border:0;">
          <div style="height:8px;line-height:8px;">&nbsp;</div>
          ${starsRow('star-green.png', 3, 8)}
        </td></tr>
        <tr><td style="background-color:${C.tealDark};padding:0;font-size:0;line-height:0;">
          <img src="${IMG}/mtn-top.png" width="600" alt="" style="display:block;width:100%;border:0;">
        </td></tr>

        <!-- HERO BAND -->
        <tr><td style="background-color:${C.teal};padding:18px 24px 22px;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>
            <td style="width:48px;height:48px;background-color:${C.green};border-radius:50%;text-align:center;vertical-align:middle;">
              <img src="${IMG}/hero-check.png" width="22" height="22" alt="✓" style="display:inline-block;border:0;vertical-align:middle;">
            </td>
          </tr></table>
          <div style="height:10px;line-height:10px;">&nbsp;</div>
          ${headingImg({ text: t.confirmed, size: 30, color: C.white, weight: 900, w: 520, align: 'center', maxChars: 26 })}
          <div style="font-family:${FB};font-size:13px;color:rgba(255,255,255,.65);margin-top:6px;">${t.confLabel} <strong style="color:${C.white};font-weight:800;">#${esc(confirmationNumber)}</strong></div>
        </td></tr>

        <!-- BODY -->
        <tr><td style="padding:28px 20px 36px;">
          <div style="font-family:${FH};font-size:24px;font-weight:800;color:${C.text};text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">${t.greeting}</div>
          <p style="margin:0;font-family:${FB};font-size:15px;color:${C.textMuted};line-height:1.75;">${t.intro}</p>
        </td></tr>

        <!-- EVENT CARD -->
        <tr><td style="padding:16px 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.white};border-radius:16px;overflow:hidden;box-shadow:0 2px 18px rgba(0,0,0,.09);">
            <tr><td style="background-color:${categoryColor};padding:12px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="font-family:${FH};font-size:11.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.9);">${esc(eventCategory)}</td>
                <td style="height:1px;background:rgba(255,255,255,.2);font-size:0;line-height:0;">&nbsp;</td>
                <td width="40" align="right">${starsRow('star-white.png', 2, 6)}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:20px 20px 0;">
              <div style="margin-bottom:18px;">${headingImg({ text: eventTitle, size: 26, color: C.text, weight: 900, w: 512, align: 'left', maxChars: 30 })}</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid rgba(0,0,0,.06);padding-bottom:4px;">
                ${detailRow('icon-cal.png', dateLine)}
                ${detailRow('icon-clock.png', durationLine)}
                ${detailRow('icon-pin.png', location)}
                <tr><td style="padding-top:6px;padding-bottom:6px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td style="padding-bottom:10px;">${calButton(gCal, 'gcal.png', t.addGoogle)}</td></tr>
                    <tr><td>${calButton('#', 'acal.png', t.addApple)}</td></tr>
                  </table>
                </td></tr>
              </table>
              ${note ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="26" valign="top" style="padding:14px 0;padding-top:15px;"><img src="${IMG}/icon-info.png" width="15" height="15" alt="" style="display:block;border:0;"></td>
                <td style="padding:14px 0;font-family:${FB};font-size:13.5px;color:${C.textMuted};line-height:1.7;">${esc(note)}</td>
              </tr></table>` : '<div style="height:6px;"></div>'}
            </td></tr>
          </table>
        </td></tr>

        <!-- TICKET DETAILS -->
        <tr><td style="padding:14px 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.white};border-radius:16px;overflow:hidden;box-shadow:0 2px 18px rgba(0,0,0,.09);">
            <tr><td style="padding:14px 20px;border-bottom:1px solid rgba(0,0,0,.06);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td width="24" valign="middle"><img src="${IMG}/icon-ticket.png" width="15" height="15" alt="" style="display:block;border:0;"></td>
                <td style="font-family:${FH};font-size:12px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:${C.text};">${t.ticketDets}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:0 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,.05);font-family:${FB};font-size:14px;color:${C.textMuted};">${t.type}</td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,.05);font-family:${FB};font-size:14.5px;font-weight:700;color:${C.text};">${esc(ticketType)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,.05);font-family:${FB};font-size:14px;color:${C.textMuted};">${t.qty}</td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,.05);font-family:${FB};font-size:14.5px;font-weight:700;color:${C.text};">${quantity} ${qtyLabel}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,.05);font-family:${FB};font-size:14px;color:${C.textMuted};">${t.unit}</td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,.05);font-family:${FB};font-size:14.5px;font-weight:700;color:${C.text};">${unitDisplay}</td>
                </tr>
                <tr>
                  <td style="padding:15px 0;font-family:${FH};font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:${C.text};">${t.total}</td>
                  <td align="right" style="padding:15px 0;font-family:${FH};font-size:28px;font-weight:900;color:${isFree ? C.green : C.text};letter-spacing:-.5px;">${totalDisplay}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- WHAT TO BRING -->
        ${bringHtml}

        <!-- CTA -->
        <tr><td style="padding:14px 20px 0;">
          <a href="${esc(eventDetailUrl)}" style="display:block;background-color:${C.teal};color:${C.white};text-align:center;padding:17px;border-radius:14px;font-family:${FH};font-size:19px;font-weight:800;text-transform:uppercase;letter-spacing:1px;text-decoration:none;margin-bottom:28px;">${t.viewEvent}</a>
        </td></tr>

        <!-- DIVIDER -->
        <tr><td style="padding:24px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="border-bottom:1px solid rgba(0,0,0,.08);font-size:0;line-height:0;">&nbsp;</td>
            <td width="60" align="center" style="padding:0 12px;">${starsRow('star-green.png', 3, 9)}</td>
            <td style="border-bottom:1px solid rgba(0,0,0,.08);font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- COMMUNITY -->
        <tr><td style="padding:0 20px 32px;text-align:center;">
          <div style="font-family:${FH};font-size:17px;font-weight:800;color:${C.tealDark};text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">${t.shareTitle}</div>
          <p style="margin:0 0 16px;font-family:${FB};font-size:14px;color:${C.textMuted};line-height:1.75;">${t.shareBody}</p>
          ${socials.map(s => `<div style="margin-bottom:8px;"><a href="${s.href}" style="font-family:${FH};font-size:15px;font-weight:700;color:${C.teal};text-decoration:none;letter-spacing:.3px;">${s.label}</a></div>`).join('')}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background-color:${C.tealDark};padding:0;font-size:0;line-height:0;">
          <img src="${IMG}/mtn-bot.png" width="600" alt="" style="display:block;width:100%;border:0;">
        </td></tr>
        <tr><td style="background-color:${C.tealDark};padding:14px 24px 36px;text-align:center;">
          <img src="${LOGO_URL}" width="42" height="44" alt="LPLA" style="display:inline-block;border:0;opacity:.7;">
          <div style="font-family:${FB};font-size:12px;color:rgba(255,255,255,.45);text-align:center;line-height:1.8;margin-top:10px;">
            ${t.address}<br>
            <a href="mailto:info@locoporlaaventura.com" style="color:rgba(255,255,255,.55);text-decoration:none;">info@locoporlaaventura.com</a>
          </div>
          <div style="height:1px;background:rgba(255,255,255,.07);margin:14px 0;">&nbsp;</div>
          <div style="font-family:${FB};font-size:11.5px;color:rgba(255,255,255,.35);text-align:center;line-height:1.8;">${t.nonprofit}</div>
          <div style="height:1px;background:rgba(255,255,255,.07);margin:14px 0;">&nbsp;</div>
          <div style="font-family:${FB};font-size:11px;color:rgba(255,255,255,.3);text-align:center;line-height:1.9;">
            ${t.received}<br>
            <a href="#" style="color:rgba(255,255,255,.45);text-decoration:underline;">${t.unsubscribe}</a> ·
            <a href="https://locoporlaaventura.com/pages/privacy-policy" style="color:rgba(255,255,255,.45);text-decoration:underline;">${t.privacy}</a> ·
            <a href="https://locoporlaaventura.com/pages/terms-of-service" style="color:rgba(255,255,255,.45);text-decoration:underline;">${t.terms}</a>
          </div>
        </td></tr>

      </table>

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
  firstName: '{{ person.first_name|default:"adventurer" }}',
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
  .replace('$NaN', '{% if event.extra.is_free %}Free{% else %}{{ event.extra.unit_price }}{% endif %}')
  .replace('$NaN', '{% if event.extra.is_free %}FREE!{% else %}{{ event.extra.total_amount }}{% endif %}');
