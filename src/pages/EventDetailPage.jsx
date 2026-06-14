import { useState } from 'react';
import { WEB, useBreakpoint, fmtDate, CAT_ICONS } from '../lib/tokens';
import { MAX_W, WebBadge, WebImgPlaceholder } from '../components/shared';
import { submitForm } from '../lib/api';

export function EventDetailPage({ event, lang, onConfirm, onBack }) {
  const { isMobile, isTablet } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    ticketId: event.tickets[0]?.id || '',
    quantity:1, notes:'',
    smsConsent:false, emailConsent:false, privacyAccepted:false,
  });
  const [errors, setErrors] = useState({});
  const [payStep, setPayStep] = useState('form'); // 'form' | 'processing' | 'done'
  const [submitError, setSubmitError] = useState('');

  const setF = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const selectedTicket = event.tickets.find(t => t.id === form.ticketId) || event.tickets[0];
  const total = (selectedTicket?.price || 0) * form.quantity;

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = L('Requerido', 'Required');
    if (!form.lastName.trim())  e.lastName  = L('Requerido', 'Required');
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = L('Email inv\u00e1lido', 'Invalid email');
    if (!form.phone.trim()) e.phone = L('Requerido para confirmaciones', 'Required for confirmations');
    if (!form.privacyAccepted) e.privacy = L('Debes aceptar la pol\u00edtica de privacidad', 'You must accept the privacy policy');
    return e;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitError('');
    setPayStep('processing');
    try {
      await submitForm('booking', {
        event: { id: event.id, title: event.titleEn, date: event.date, location: event.location },
        ticket: selectedTicket,
        quantity: form.quantity,
        total,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
        smsConsent: form.smsConsent,
        emailConsent: form.emailConsent,
      });
      setPayStep('done');
      setTimeout(() => onConfirm({ event, form, total, selectedTicket }), 800);
    } catch (err) {
      setSubmitError(L('No se pudo enviar la reserva. Int\u00e9ntalo de nuevo.', 'Could not submit your booking. Please try again.'));
      setPayStep('form');
    }
  }

  const inputStyle = (hasErr) => ({
    height:50, borderRadius:12, border:`1.5px solid ${hasErr ? '#E74C3C' : WEB.borderMd}`, padding:'0 16px',
    fontFamily:'Nunito,system-ui', fontSize:15, color:WEB.text, background:'#fff', outline:'none',
    width:'100%', boxSizing:'border-box', transition:'border-color .2s',
  });

  const isFull = event.spotsLeft === 0;
  const isLow  = event.spotsLeft > 0 && event.spotsLeft <= 4;

  return (
    <div style={{ background:WEB.bg, minHeight:'100vh' }}>
      {/* Event hero */}
      <div style={{ position:'relative' }}>
        <WebImgPlaceholder height={isMobile ? 240 : 360} label={`${L(event.titleEs, event.titleEn)} \u00b7 event photo`} index={event.index} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(11,30,43,.5) 0%,transparent 60%)' }} />
        <button onClick={onBack} style={{ position:'absolute', top:20, left:20, width:40, height:40, borderRadius:'50%', background:'rgba(0,0,0,.4)', border:'none', cursor:'pointer', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="M8 2L2 8l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div style={{ position:'absolute', bottom:16, left:20, display:'flex', gap:8 }}>
          <WebBadge bg={WEB.teal}>{CAT_ICONS[event.category]} {event.category}</WebBadge>
          {isFull && <WebBadge bg="#E74C3C">{L('AGOTADO', 'SOLD OUT')}</WebBadge>}
          {isLow && <WebBadge bg="#E67E22">{'\u26a1'} {L(`Solo ${event.spotsLeft} plazas`, `${event.spotsLeft} spots left`)}</WebBadge>}
        </div>
      </div>

      <div style={{ ...MAX_W, padding: isMobile ? '28px 20px' : '40px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 420px', gap:40, alignItems:'start' }}>

          {/* LEFT -- Event info */}
          <div>
            <h1 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 34 : 46, fontWeight:800, textTransform:'uppercase', color:WEB.text, letterSpacing:.4, lineHeight:1.05, margin:'0 0 16px' }}>
              {L(event.titleEs, event.titleEn)}
            </h1>

            {/* Details chips */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
              {[
                `\u{1F4C5} ${fmtDate(event.date, lang)}`,
                `\u{1F550} ${event.time} \u00b7 ${event.duration}`,
                `\u{1F4CD} ${event.location}`,
                `\u{1F465} ${event.spotsLeft}/${event.totalSpots} ${L('plazas', 'spots')}`,
              ].map(chip => (
                <span key={chip} style={{ padding:'6px 14px', borderRadius:20, background:WEB.bgAlt, border:`1px solid ${WEB.border}`, fontFamily:'Nunito,system-ui', fontSize:13, color:WEB.textMuted }}>
                  {chip}
                </span>
              ))}
            </div>

            {/* Spots progress */}
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted }}>{L('Plazas disponibles', 'Available spots')}</span>
                <span style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color: isLow ? '#E67E22' : WEB.green }}>
                  {event.spotsLeft} {L('de', 'of')} {event.totalSpots}
                </span>
              </div>
              <div style={{ height:6, borderRadius:3, background:WEB.bgAlt, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:3, background: isFull ? '#E74C3C' : isLow ? '#E67E22' : WEB.green, width:`${(event.spotsLeft / event.totalSpots) * 100}%`, transition:'width .5s' }} />
              </div>
            </div>

            {/* Description */}
            <div style={{ fontFamily:'Nunito,system-ui', fontSize:16, color:WEB.text, lineHeight:1.7, marginBottom:24 }}>
              {L(event.descEs, event.descEn)}
            </div>

            {/* What's included */}
            <div style={{ background:WEB.card, borderRadius:WEB.radius, padding:'20px 22px', border:`1px solid ${WEB.border}` }}>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:16, fontWeight:800, color:WEB.teal, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
                {L('\u00bfQu\u00e9 incluye?', "What's Included?")}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 20px' }}>
                {[
                  L('Gu\u00eda certificado', 'Certified guide'),
                  L('Material incluido', 'Equipment included'),
                  L('Seguro de actividad', 'Activity insurance'),
                  L('Confirmaci\u00f3n por SMS', 'SMS confirmation'),
                  L('Recordatorio 24h antes', '24h reminder'),
                  L('Pol\u00edtica de cancelaci\u00f3n', 'Cancellation policy'),
                ].map(item => (
                  <div key={item} style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Nunito,system-ui', fontSize:14, color:WEB.text }}>
                    <span style={{ color:WEB.green, fontWeight:700 }}>{'\u2713'}</span> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT -- Booking form */}
          <div style={{ background:WEB.card, borderRadius:WEB.radiusLg, boxShadow:WEB.shadowMd, padding:isMobile ? '24px 20px' : '28px 28px', position: isMobile ? 'static' : 'sticky', top:88 }}>

            {payStep === 'processing' && (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', border:`4px solid ${WEB.bgAlt}`, borderTopColor:WEB.teal, animation:'spin 1s linear infinite', margin:'0 auto 20px' }} />
                <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:22, fontWeight:800, color:WEB.teal }}>
                  {event.isFree ? L('Confirmando\u2026', 'Confirming\u2026') : L('Procesando pago\u2026', 'Processing payment\u2026')}
                </div>
              </div>
            )}

            {payStep === 'form' && (
              <>
                <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:22, fontWeight:800, color:WEB.text, textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>
                  {L('Reservar Entrada', 'Book Your Ticket')}
                </div>
                <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:WEB.textMuted, marginBottom:20 }}>
                  {L('Confirmaci\u00f3n instant\u00e1nea por email y SMS', 'Instant confirmation by email & SMS')}
                </div>

                {/* Ticket type */}
                {event.tickets.length > 1 && (
                  <div style={{ marginBottom:18 }}>
                    <label style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:8 }}>
                      {L('Tipo de Entrada', 'Ticket Type')}
                    </label>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {event.tickets.map(t => (
                        <label key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, border:`1.5px solid ${form.ticketId===t.id ? WEB.green : WEB.border}`, background: form.ticketId===t.id ? WEB.greenPale : '#fff', cursor:'pointer', transition:'all .2s' }}>
                          <input type="radio" name="ticket" value={t.id} checked={form.ticketId===t.id} onChange={() => setF('ticketId', t.id)} style={{ accentColor:WEB.green, width:18, height:18 }} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:16, fontWeight:700, color:WEB.text, textTransform:'uppercase' }}>{L(t.es, t.en)}</div>
                            <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted }}>{L(t.descEs, t.descEn)}</div>
                          </div>
                          <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, color: t.price===0 ? WEB.green : WEB.teal }}>
                            {t.price === 0 ? L('Gratis', 'Free') : `$${t.price}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div style={{ marginBottom:18, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:8 }}>
                      {L('Personas', 'People')}
                    </label>
                    <div style={{ display:'flex', alignItems:'center', gap:0, background:WEB.bgAlt, borderRadius:12, width:'fit-content', border:`1.5px solid ${WEB.border}` }}>
                      <button onClick={() => setF('quantity', Math.max(1, form.quantity-1))} style={{ width:44, height:44, border:'none', background:'transparent', cursor:'pointer', fontSize:20, color:WEB.teal, fontWeight:700 }}>{'\u2212'}</button>
                      <span style={{ minWidth:36, textAlign:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, color:WEB.text }}>{form.quantity}</span>
                      <button onClick={() => setF('quantity', Math.min(event.spotsLeft || 10, form.quantity+1))} style={{ width:44, height:44, border:'none', background:'transparent', cursor:'pointer', fontSize:20, color:WEB.green, fontWeight:700 }}>+</button>
                    </div>
                  </div>
                  {total > 0 && (
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted }}>{L('Total', 'Total')}</div>
                      <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:30, fontWeight:800, color:WEB.teal }}>${total}</div>
                    </div>
                  )}
                </div>

                {/* Personal info */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <label style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>{L('Nombre *', 'First Name *')}</label>
                    <input value={form.firstName} onChange={e => setF('firstName', e.target.value)} style={inputStyle(errors.firstName)} placeholder="Ana" />
                    {errors.firstName && <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:'#E74C3C', marginTop:3 }}>{errors.firstName}</div>}
                  </div>
                  <div>
                    <label style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>{L('Apellidos *', 'Last Name *')}</label>
                    <input value={form.lastName} onChange={e => setF('lastName', e.target.value)} style={inputStyle(errors.lastName)} placeholder={'Garc\u00eda'} />
                    {errors.lastName && <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:'#E74C3C', marginTop:3 }}>{errors.lastName}</div>}
                  </div>
                </div>
                <div style={{ marginBottom:12 }}>
                  <label style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>{L('Correo Electr\u00f3nico *', 'Email Address *')}</label>
                  <input type="email" value={form.email} onChange={e => setF('email', e.target.value)} style={inputStyle(errors.email)} placeholder="ana@correo.com" />
                  {errors.email && <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:'#E74C3C', marginTop:3 }}>{errors.email}</div>}
                </div>
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>{'\u{1F4F1}'} {L('Tel\u00e9fono *', 'Phone Number *')}</label>
                  <input type="tel" value={form.phone} onChange={e => setF('phone', e.target.value)} style={inputStyle(errors.phone)} placeholder="+1 (555) 000-0000" />
                  {errors.phone && <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:'#E74C3C', marginTop:3 }}>{errors.phone}</div>}
                </div>

                {/* ---- CONSENT BLOCK (Klaviyo) -------------------------------------------------------------- */}
                <div style={{ background:'rgba(27,94,127,.05)', borderRadius:14, padding:'16px 18px', border:`1.5px solid rgba(27,94,127,.1)`, marginBottom:14 }}>
                  <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, color:WEB.teal, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
                    {'\u{1F4F2}'} {L('Comunicaciones (Klaviyo)', 'Communications (Klaviyo)')}
                  </div>
                  <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer', marginBottom:12 }}>
                    <input type="checkbox" checked={form.smsConsent} onChange={e => setF('smsConsent', e.target.checked)} style={{ marginTop:3, width:18, height:18, accentColor:WEB.green, flexShrink:0 }} />
                    <div>
                      <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600, color:WEB.text }}>
                        {L('Confirmaciones y recordatorios por SMS', 'SMS booking confirmations & reminders')}
                      </div>
                      <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted, marginTop:2, lineHeight:1.5 }}>
                        {L('Acepto recibir SMS de Loco Por La Aventura con mi confirmaci\u00f3n de reserva y recordatorios. Responde STOP para cancelar en cualquier momento.', 'I consent to receive SMS from Loco Por La Aventura with my booking confirmation and reminders. Reply STOP to unsubscribe at any time.')}
                      </div>
                    </div>
                  </label>
                  <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer' }}>
                    <input type="checkbox" checked={form.emailConsent} onChange={e => setF('emailConsent', e.target.checked)} style={{ marginTop:3, width:18, height:18, accentColor:WEB.green, flexShrink:0 }} />
                    <div>
                      <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600, color:WEB.text }}>
                        {L('Newsletter y pr\u00f3ximos eventos de LPLA', 'LPLA newsletter & upcoming events')}
                      </div>
                      <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted, marginTop:2, lineHeight:1.5 }}>
                        {L('Acepto recibir correos de marketing de LPLA con pr\u00f3ximos eventos, ofertas y contenido de la comunidad. Puedo cancelar en cualquier momento.', 'I consent to receive marketing emails from LPLA about upcoming events, special offers and community content. I can unsubscribe at any time.')}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Privacy acceptance (required) */}
                <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer', marginBottom:errors.privacy?4:18 }}>
                  <input type="checkbox" checked={form.privacyAccepted} onChange={e => setF('privacyAccepted', e.target.checked)} style={{ marginTop:3, width:18, height:18, accentColor:WEB.teal, flexShrink:0 }} />
                  <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:WEB.textMuted, lineHeight:1.5 }}>
                    {L('* He le\u00eddo y acepto la ', '* I have read and accept the ')}
                    <span style={{ color:WEB.teal, fontWeight:700, cursor:'pointer', textDecoration:'underline' }}>{L('Pol\u00edtica de Privacidad', 'Privacy Policy')}</span>
                    {L(' y los T\u00e9rminos de Uso.', ' and Terms of Use.')}
                  </span>
                </label>
                {errors.privacy && <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:'#E74C3C', marginBottom:14 }}>{errors.privacy}</div>}

                {submitError && <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'#E74C3C', marginBottom:14, textAlign:'center' }}>{submitError}</div>}

                {/* CTA button */}
                <button onClick={handleSubmit} disabled={isFull} style={{ width:'100%', height:56, borderRadius:14, border:'none', cursor: isFull ? 'not-allowed' : 'pointer', background: isFull ? 'rgba(0,0,0,.1)' : (event.isFree ? WEB.green : WEB.teal), color: isFull ? WEB.textMuted : '#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, letterSpacing:.5, boxShadow: isFull ? 'none' : `0 6px 20px ${event.isFree ? 'rgba(126,191,46,.35)' : 'rgba(27,94,127,.35)'}`, display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'transform .15s, box-shadow .15s' }}
                  onMouseOver={e => { if(!isFull){ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 8px 28px ${event.isFree?'rgba(126,191,46,.45)':'rgba(27,94,127,.45)'}`; }}}
                  onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 6px 20px ${event.isFree?'rgba(126,191,46,.35)':'rgba(27,94,127,.35)'}`; }}>
                  {isFull ? L('Evento Agotado', 'Event Sold Out') :
                   event.isFree ? L('Confirmar Reserva Gratuita', 'Confirm Free Booking') :
                   L(`Pagar $${total}`, `Pay $${total}`)}
                </button>

                <p style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:WEB.textLight, textAlign:'center', lineHeight:1.6, marginTop:10, marginBottom:0 }}>
                  {event.isFree
                    ? L('Confirmaci\u00f3n por email y SMS v\u00eda Klaviyo.', 'Confirmation by email & SMS via Klaviyo.')
                    : 'Secure payment by Clover. Confirmation by email & sms via Klaviyo.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
