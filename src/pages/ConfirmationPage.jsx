import { WEB, useBreakpoint, fmtDate } from '../lib/tokens';

const IMG = 'https://locoporlaaventura.vercel.app/email';
const LOGO = 'https://locoporlaaventura.vercel.app/logo.png';
const F = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

const CAT_COLORS = {
  Escalada: '#155070', Senderismo: '#3A5E14', Taller: '#5E3B1E',
  Keynote: '#5E8BBD', Social: '#1B5E7F', 'Expedición': '#2D4D0E', Voluntario: '#00897A',
};

function Stars({ n = 3, color = WEB.green, size = 8 }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 10 10">
          <polygon points="5,.5 6.16,3.54 9.51,3.54 6.86,5.73 7.94,8.79 5,6.64 2.06,8.79 3.14,5.73 .49,3.54 3.84,3.54" fill={color} />
        </svg>
      ))}
    </div>
  );
}

function MtnTop() {
  return <img src={`${IMG}/mtn-top.png`} alt="" style={{ display: 'block', width: '100%' }} />;
}

function MtnBot() {
  return <img src={`${IMG}/mtn-bot.png`} alt="" style={{ display: 'block', width: '100%' }} />;
}

function DetailRow({ icon, text }) {
  if (!text) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
      <img src={`${IMG}/${icon}`} width={15} height={15} alt="" style={{ marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontFamily: F, fontSize: 14, color: WEB.text, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

export function ConfirmationPage({ booking, lang, onHome }) {
  const { isMobile } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;
  const { event, form, total, selectedTicket, confirmationNumber } = booking;

  const isFree = total === 0;
  const catColor = CAT_COLORS[event.category] || '#1B5E7F';
  const dateLine = `${fmtDate(event.date, lang)}  ·  ${event.time}`;
  const durationLine = event.duration ? `${L('Duración', 'Duration')}: ${event.duration}` : '';
  const qty = form.quantity || 1;
  const unitPrice = qty > 0 ? total / qty : 0;
  const qtyLabel = qty === 1 ? L('entrada', 'ticket') : L('entradas', 'tickets');

  return (
    <div style={{ background: '#E8E0D4', minHeight: '100vh', padding: isMobile ? '0' : '32px 16px 48px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#FAF6EE', borderRadius: isMobile ? 0 : 16, overflow: 'hidden', boxShadow: isMobile ? 'none' : '0 8px 48px rgba(0,0,0,.18)' }}>

        {/* HEADER */}
        <div style={{ background: WEB.tealDark, padding: '28px 24px 0', textAlign: 'center' }}>
          <img src={LOGO} alt="Loco Por La Aventura" style={{ height: 100, objectFit: 'contain' }} />
          <div style={{ height: 8 }} />
          <Stars n={3} color="rgba(126,191,46,.6)" size={8} />
          <div style={{ height: 10 }} />
          <MtnTop />
        </div>

        {/* HERO BAND */}
        <div style={{ background: WEB.teal, padding: '18px 24px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: WEB.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={`${IMG}/hero-check.png`} width={22} height={22} alt="✓" />
          </div>
          <div style={{ fontFamily: F, fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5, lineHeight: 1.05 }}>
            {L('¡Reserva Confirmada!', 'Booking Confirmed!')}
          </div>
          {confirmationNumber && (
            <div style={{ fontFamily: F, fontSize: 13, color: 'rgba(255,255,255,.65)' }}>
              {L('Confirmación', 'Confirmation')}{' '}
              <strong style={{ color: '#fff', fontWeight: 800 }}>#{confirmationNumber}</strong>
            </div>
          )}
        </div>

        {/* BODY */}
        <div style={{ padding: '28px 20px 36px' }}>

          {/* Greeting */}
          <div style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: WEB.text, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>
            {L(`¡Hola, ${form.firstName}!`, `Hey there, ${form.firstName}!`)}
          </div>
          <p style={{ fontFamily: F, fontSize: 15, color: WEB.textMuted, lineHeight: 1.75, marginBottom: 24, margin: '0 0 24px' }}>
            {L(
              'Tu reserva fue procesada con éxito. Guarda este email para el día del evento. ¡Tu próxima aventura está a punto de comenzar!',
              'Your booking was successfully processed. Save this email for event day. Your next adventure is just around the corner!'
            )}
          </p>

          {/* EVENT CARD */}
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 14, boxShadow: '0 2px 18px rgba(0,0,0,.09)' }}>
            {/* Category stripe */}
            <div style={{ background: catColor, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: F, fontSize: 11.5, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,.9)' }}>
                {event.category}
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.2)' }} />
              <Stars n={2} color="rgba(255,255,255,.5)" size={6} />
            </div>

            <div style={{ padding: '20px 20px 0' }}>
              <div style={{ fontFamily: F, fontSize: 26, fontWeight: 900, color: WEB.text, textTransform: 'uppercase', letterSpacing: .5, lineHeight: 1.15, marginBottom: 18 }}>
                {L(event.titleEs, event.titleEn)}
              </div>
              <div style={{ paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                <DetailRow icon="icon-cal.png" text={dateLine} />
                {durationLine && <DetailRow icon="icon-clock.png" text={durationLine} />}
                <DetailRow icon="icon-pin.png" text={event.location} />
              </div>

              {/* Note */}
              {(event.descEn || event.descEs) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 0' }}>
                  <img src={`${IMG}/icon-info.png`} width={15} height={15} alt="" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontFamily: F, fontSize: 13.5, color: WEB.textMuted, lineHeight: 1.7 }}>
                    {L(event.descEs, event.descEn)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* TICKET DETAILS */}
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 14, boxShadow: '0 2px 18px rgba(0,0,0,.09)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={`${IMG}/icon-ticket.png`} width={15} height={15} alt="" />
              <span style={{ fontFamily: F, fontSize: 12, fontWeight: 800, letterSpacing: 1.6, textTransform: 'uppercase', color: WEB.text }}>
                {L('Detalle de Entrada', 'Ticket Details')}
              </span>
            </div>
            <div style={{ padding: '0 20px' }}>
              {[
                [L('Tipo', 'Type'), L(selectedTicket.es, selectedTicket.en)],
                [L('Cantidad', 'Qty'), `${qty} ${qtyLabel}`],
                [L('Precio unitario', 'Unit price'), isFree ? L('Gratuito', 'Free') : `$${unitPrice.toFixed(2)}`],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                  <span style={{ fontFamily: F, fontSize: 14, color: WEB.textMuted }}>{label}</span>
                  <span style={{ fontFamily: F, fontSize: 14.5, fontWeight: 700, color: WEB.text }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
                <span style={{ fontFamily: F, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5, color: WEB.text }}>
                  {L('Total pagado', 'Total paid')}
                </span>
                <span style={{ fontFamily: F, fontSize: 28, fontWeight: 900, color: isFree ? WEB.green : WEB.text, letterSpacing: -.5 }}>
                  {isFree ? L('¡GRATIS!', 'FREE!') : `$${total.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          {/* WHAT TO BRING */}
          {event.whatToBring && event.whatToBring.length > 0 && (
            <div style={{ background: '#F5EDD8', border: '1px solid #E8D5B5', borderRadius: 16, padding: '16px 20px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <img src={`${IMG}/icon-pack.png`} width={15} height={15} alt="" />
                <span style={{ fontFamily: F, fontSize: 12, fontWeight: 800, letterSpacing: 1.6, textTransform: 'uppercase', color: '#5E3B1E' }}>
                  {L('¿Qué traer?', 'What to Bring')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {event.whatToBring.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={`${IMG}/icon-check.png`} width={16} height={16} alt="" />
                    <span style={{ fontFamily: F, fontSize: 14, color: WEB.text, lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 14, boxShadow: '0 2px 18px rgba(0,0,0,.09)' }}>
            <div style={{ fontFamily: F, fontSize: 12, fontWeight: 800, letterSpacing: 1.6, textTransform: 'uppercase', color: WEB.teal, marginBottom: 12 }}>
              {L('Tus Notificaciones', 'Your Notifications')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>✉️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: WEB.text }}>
                    {L('Confirmación por email enviada', 'Booking confirmation email sent')}
                  </div>
                  <div style={{ fontFamily: F, fontSize: 12, color: WEB.textMuted }}>{form.email}</div>
                </div>
                <span style={{ fontSize: 14, color: WEB.green }}>✓</span>
              </div>
              {form.smsConsent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📱</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: WEB.text }}>
                      {L('SMS de confirmación', 'SMS confirmation')}
                    </div>
                    <div style={{ fontFamily: F, fontSize: 12, color: WEB.textMuted }}>{form.phone}</div>
                  </div>
                  <span style={{ fontSize: 14, color: WEB.green }}>✓</span>
                </div>
              )}
              {form.emailConsent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📬</span>
                  <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: WEB.text }}>
                    {L('Suscrito al newsletter', 'Subscribed to newsletter')}
                  </div>
                  <span style={{ fontSize: 14, color: WEB.green }}>✓</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onHome}
            style={{ display: 'block', width: '100%', background: WEB.teal, color: '#fff', textAlign: 'center', padding: 17, borderRadius: 14, fontFamily: F, fontSize: 19, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, border: 'none', cursor: 'pointer', marginBottom: 28 }}
          >
            {L('← Ver Más Eventos', '← See More Events')}
          </button>

          {/* Star divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.08)' }} />
            <Stars n={3} color={WEB.green} size={9} />
            <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.08)' }} />
          </div>

          {/* Community */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: F, fontSize: 17, fontWeight: 800, color: WEB.tealDark, textTransform: 'uppercase', letterSpacing: .7, marginBottom: 8 }}>
              {L('¡Comparte tu aventura!', 'Share your adventure!')}
            </div>
            <p style={{ fontFamily: F, fontSize: 14, color: WEB.textMuted, lineHeight: 1.75, margin: '0 0 16px' }}>
              {L('Etiquétanos con #LocosPorLaAventura y conecta con la comunidad.', 'Tag us with #LocosPorLaAventura and connect with the community.')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { href: 'https://www.instagram.com/locoporlaaventura/?hl=en', label: 'Instagram · @locoporlaaventura' },
                { href: 'https://www.facebook.com/Locoporlaaventura/', label: 'Facebook · @Locoporlaaventura' },
                { href: 'https://www.tiktok.com/@anibalrocheta', label: 'TikTok · @anibalrocheta' },
              ].map(({ href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: WEB.teal, textDecoration: 'none', letterSpacing: .3 }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ background: WEB.tealDark }}>
          <MtnBot />
          <div style={{ padding: '14px 24px 36px', textAlign: 'center' }}>
            <img src={LOGO} alt="LPLA" style={{ height: 44, objectFit: 'contain', opacity: .7 }} />
            <div style={{ fontFamily: F, fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.8, marginTop: 10 }}>
              544 SE Oak St #206, Portland, OR 97214<br />
              <a href="mailto:info@locoporlaaventura.com" style={{ color: 'rgba(255,255,255,.55)', textDecoration: 'none' }}>info@locoporlaaventura.com</a>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,.07)', margin: '14px 0' }} />
            <div style={{ fontFamily: F, fontSize: 11.5, color: 'rgba(255,255,255,.35)', lineHeight: 1.8 }}>
              {L(
                'Loco por la Aventura es una organización sin fines de lucro 501(c)(3) con sede en Oregón, dedicada a promover la equidad educativa, el acceso al aire libre y la justicia ambiental para la comunidad latina — y más allá.',
                'Loco por la Aventura is a 501(c)(3) nonprofit organization based in Oregon, dedicated to advancing educational equity, outdoor access, and environmental justice for the Latino community — and beyond.'
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
