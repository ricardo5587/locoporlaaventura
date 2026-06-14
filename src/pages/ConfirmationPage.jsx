import { WEB, useBreakpoint, fmtDate } from '../lib/tokens';
import { WebBadge, WebImgPlaceholder } from '../components/shared';

export function ConfirmationPage({ booking, lang, onHome }) {
  const { isMobile } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;
  const { event, form, total, selectedTicket } = booking;

  return (
    <div style={{ background:WEB.bg, minHeight:'100vh', paddingTop:32, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start' }}>
      <div style={{ width:'100%', maxWidth:640, padding: isMobile ? '40px 20px' : '60px 24px' }}>

        {/* Success header */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:WEB.greenPale, border:`3px solid ${WEB.green}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:36 }}>✅</div>
          <h1 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 34 : 44, fontWeight:800, textTransform:'uppercase', color:WEB.text, letterSpacing:.4, margin:'0 0 10px' }}>
            {L('¡Reserva Confirmada!', 'Booking Confirmed!')}
          </h1>
          <p style={{ fontFamily:'Nunito,system-ui', fontSize:16, color:WEB.textMuted }}>
            {L(`Hola ${form.firstName}, tu plaza está reservada. 🎉`, `Hey ${form.firstName}, your spot is reserved. 🎉`)}
          </p>
        </div>

        {/* Booking summary card */}
        <div style={{ background:WEB.card, borderRadius:WEB.radiusLg, boxShadow:WEB.shadowMd, overflow:'hidden', marginBottom:20 }}>
          <WebImgPlaceholder height={160} label="" index={event.index} />
          <div style={{ padding:'20px 24px' }}>
            <WebBadge bg={WEB.teal} style={{ marginBottom:10 }}>{event.category}</WebBadge>
            <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:26, fontWeight:800, color:WEB.text, textTransform:'uppercase', letterSpacing:.3, marginBottom:14 }}>
              {L(event.titleEs, event.titleEn)}
            </div>
            {[
              [L('Fecha', 'Date'), `${fmtDate(event.date, lang)} · ${event.time}`],
              [L('Lugar', 'Location'), event.location],
              [L('Entrada', 'Ticket'), `${L(selectedTicket.es, selectedTicket.en)} × ${form.quantity}`],
              [L('Total pagado', 'Total paid'), total === 0 ? L('Gratis', 'Free') : `$${total}`],
              [L('Nombre', 'Name'), `${form.firstName} ${form.lastName}`],
              [L('Email', 'Email'), form.email],
              [L('Teléfono', 'Phone'), form.phone],
            ].map(([label, val]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:`1px solid ${WEB.border}` }}>
                <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:WEB.textMuted }}>{label}</span>
                <span style={{ fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600, color:WEB.text }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications status */}
        <div style={{ background:WEB.card, borderRadius:WEB.radius, padding:'18px 20px', boxShadow:WEB.shadow, marginBottom:24 }}>
          <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:16, fontWeight:800, color:WEB.teal, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
            📲 {L('Tus Notificaciones', 'Your Notifications')}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:20 }}>✉️</span>
              <div>
                <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600, color:WEB.text }}>
                  {L('Confirmación por email enviada', 'Booking confirmation email sent')}
                </div>
                <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted }}>{form.email}</div>
              </div>
              <span style={{ marginLeft:'auto', fontSize:16 }}>✅</span>
            </div>
            {form.smsConsent && (
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:20 }}>📱</span>
                <div>
                  <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600, color:WEB.text }}>
                    {L('SMS de confirmación enviado', 'SMS confirmation sent')} {L('(vía Klaviyo)', '(via Klaviyo)')}
                  </div>
                  <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted }}>{form.phone}</div>
                </div>
                <span style={{ marginLeft:'auto', fontSize:16 }}>✅</span>
              </div>
            )}
            {form.emailConsent && (
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:20 }}>📬</span>
                <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600, color:WEB.text }}>
                  {L('Suscrito al newsletter de LPLA', 'Subscribed to LPLA newsletter')}
                </div>
                <span style={{ marginLeft:'auto', fontSize:16 }}>✅</span>
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:20 }}>⏰</span>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:WEB.text }}>
                {L('Recordatorio automático 24h antes del evento', 'Automatic reminder 24h before the event')}
              </div>
            </div>
          </div>
        </div>

        <button onClick={onHome} style={{ width:'100%', height:52, borderRadius:14, border:`2px solid ${WEB.teal}`, background:'transparent', color:WEB.teal, fontFamily:'Barlow Condensed,system-ui', fontSize:18, fontWeight:800, letterSpacing:.3, cursor:'pointer', marginBottom:10 }}>
          ← {L('Ver Más Eventos', 'See More Events')}
        </button>
      </div>
    </div>
  );
}
