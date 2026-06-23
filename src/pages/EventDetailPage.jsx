import { useState, useEffect } from 'react';
import { WEB, useBreakpoint, fmtDate, CAT_ICONS } from '../lib/tokens';
import { MAX_W, WebBadge, WebImgPlaceholder, PhoneInput } from '../components/shared';
import { submitForm } from '../lib/api';

export function EventDetailPage({ event, lang, user, prefillPhone, onConfirm, onBack }) {
  const { isMobile, isTablet } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'+1 ',
    ticketId: event.tickets[0]?.id || '',
    quantity:1, notes:'',
    smsConsent:false, emailConsent:false, privacyAccepted:false,
  });
  const [errors, setErrors] = useState({});
  const [payStep, setPayStep] = useState('form'); // 'form' | 'processing' | 'done'
  const [submitError, setSubmitError] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);

  const setF = (k, v) => {
    setForm(f => ({ ...f, [k]:v }));
    if (errors[k]) setErrors(prev => { const { [k]: _, ...rest } = prev; return rest; });
  };

  // Pre-fill from the signed-in Google profile + their most recent booking.
  // Only fills fields the user hasn't already typed into, so it never clobbers
  // edits. Re-runs if they sign in after the page is already open.
  useEffect(() => {
    if (!user && !prefillPhone) return;
    setForm(f => {
      const next = { ...f };
      if (user?.name) {
        const parts = user.name.trim().split(/\s+/);
        if (!f.firstName) next.firstName = parts[0] || '';
        if (!f.lastName)  next.lastName  = parts.slice(1).join(' ');
      }
      if (!f.email && user?.email) next.email = user.email;
      if ((!f.phone || f.phone === '+1 ') && prefillPhone) next.phone = prefillPhone;
      return next;
    });
  }, [user, prefillPhone]);

  const selectedTicket = event.tickets.find(t => t.id === form.ticketId) || event.tickets[0];
  const total = (selectedTicket?.price || 0) * form.quantity;

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = L('Requerido', 'Required');
    if (!form.lastName.trim())  e.lastName  = L('Requerido', 'Required');
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = L('Email inv\u00e1lido', 'Invalid email');
    if (!form.phone.replace(/^\+\d{1,3}\s*/, '').trim()) e.phone = L('Requerido para confirmaciones', 'Required for confirmations');
    if (!form.privacyAccepted) e.privacy = L('Debes aceptar la pol\u00edtica de privacidad', 'You must accept the privacy policy');
    return e;
  }

  // Shared submit \u2014 used by both the full form and the one-tap path.
  // NOTE: paid bookings (total > 0) still flow through the full form; when
  // Clover checkout is wired into the UI, the card step slots in there. This
  // one-tap path is intentionally free-events-only.
  async function doSubmit() {
    setSubmitError('');
    setPayStep('processing');
    try {
      const result = await submitForm('booking', {
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
      const confNum = result.order?.confirmationNumber || '';
      setTimeout(() => onConfirm({ event, form, total, selectedTicket, confirmationNumber: confNum }), 800);
    } catch (err) {
      setSubmitError(L('No se pudo enviar la reserva. Int\u00e9ntalo de nuevo.', 'Could not submit your booking. Please try again.'));
      setPayStep('form');
    }
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    doSubmit();
  }

  // One-tap confirm for signed-in users on free events. Identity (name +
  // email) is already verified by Google; consent is captured by the confirm
  // action + visible microcopy, so no checkboxes are needed. If identity is
  // somehow missing, fall back to the full form rather than submitting blank.
  function handleQuickBook() {
    if (!form.firstName || !form.email) { setShowFullForm(true); return; }
    doSubmit();
  }

  const inputStyle = (hasErr) => ({
    height:50, borderRadius:12, border:`1.5px solid ${hasErr ? '#E74C3C' : WEB.borderMd}`, padding:'0 16px',
    fontFamily:'Nunito,system-ui', fontSize:16, color:WEB.text, background:'#fff', outline:'none',
    width:'100%', boxSizing:'border-box', transition:'border-color .2s',
  });

  const isFull = event.spotsLeft === 0;
  const isLow  = event.spotsLeft > 0 && event.spotsLeft <= 4;

  // One-tap is offered only when the booking is genuinely free and the user
  // is signed in (so we already have a verified name + email).
  const canQuickBook = !!user && total === 0 && !isFull && !showFullForm;
  const maxQty = Math.min(event.spotsLeft || 10, 10);

  return (
    <div style={{ background:WEB.bg, minHeight:'100vh' }}>
      {/* Event hero */}
      <div style={{ position:'relative' }}>
        <WebImgPlaceholder height={isMobile ? 240 : 360} label={`${L(event.titleEs, event.titleEn)} \u00b7 event photo`} index={event.index} image={event.image} />
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
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', padding:'0 0 16px', display:'flex', alignItems:'center', gap:6, fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600, color:WEB.teal }}
          onMouseOver={e => e.currentTarget.style.color=WEB.green}
          onMouseOut={e => e.currentTarget.style.color=WEB.teal}>
          ← {L('Volver a Eventos', 'Back to Events')}
        </button>
        <div style={{ display:'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 420px', gap:40, alignItems:'start' }}>

          {/* LEFT -- Event info */}
          <div>
            <h1 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 28 : 46, fontWeight:800, textTransform:'uppercase', color:WEB.text, letterSpacing:.4, lineHeight:1.05, margin:'0 0 16px' }}>
              {L(event.titleEs, event.titleEn)}
            </h1>

            {/* Details chips */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
              {[
                `\u{1F4C5} ${fmtDate(event.date, lang)}`,
                `\u{1F550} ${event.time}${event.duration ? ` \u00b7 ${event.duration}` : ''}`,
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
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'8px 20px' }}>
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

            {payStep === 'form' && canQuickBook && (
              <>
                <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:22, fontWeight:800, color:WEB.text, textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>
                  {L('Reserva con un Toque', 'One-Tap Booking')}
                </div>
                <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:WEB.textMuted, marginBottom:18 }}>
                  {L('Confirmación instantánea por email', 'Instant confirmation by email')}
                </div>

                {/* Identity card */}
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14, background:WEB.greenPale, border:`1.5px solid rgba(126,191,46,.25)`, marginBottom:18 }}>
                  {user.picture
                    ? <img src={user.picture} alt="" style={{ width:42, height:42, borderRadius:'50%' }} />
                    : <div style={{ width:42, height:42, borderRadius:'50%', background:WEB.green, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, color:'#fff' }}>{(user.name || user.email || '?')[0].toUpperCase()}</div>}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:16, fontWeight:700, color:WEB.text, textTransform:'uppercase', letterSpacing:.3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name || user.email}</div>
                    <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
                  </div>
                  <WebBadge bg={WEB.green}>{L('Gratis', 'Free')}</WebBadge>
                </div>

                {/* Quantity */}
                <div style={{ marginBottom:18 }}>
                  <label style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:8 }}>
                    {L('Personas', 'People')}
                  </label>
                  <div style={{ display:'flex', alignItems:'center', gap:0, background:WEB.bgAlt, borderRadius:12, width:'fit-content', border:`1.5px solid ${WEB.border}` }}>
                    <button onClick={() => setF('quantity', Math.max(1, form.quantity-1))} style={{ width:44, height:44, border:'none', background:'transparent', cursor: form.quantity <= 1 ? 'not-allowed' : 'pointer', fontSize:20, color: form.quantity <= 1 ? WEB.textLight : WEB.teal, fontWeight:700 }}>{'−'}</button>
                    <span style={{ minWidth:36, textAlign:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, color:WEB.text }}>{form.quantity}</span>
                    <button onClick={() => { if (form.quantity < maxQty) setF('quantity', form.quantity+1); }} disabled={form.quantity >= maxQty} style={{ width:44, height:44, border:'none', background:'transparent', cursor: form.quantity >= maxQty ? 'not-allowed' : 'pointer', fontSize:20, color: form.quantity >= maxQty ? WEB.textLight : WEB.green, fontWeight:700 }}>+</button>
                  </div>
                </div>

                {submitError && <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'#E74C3C', marginBottom:14, textAlign:'center' }}>{submitError}</div>}

                {/* One-tap CTA */}
                <button onClick={handleQuickBook} style={{ width:'100%', height:56, borderRadius:14, border:'none', cursor:'pointer', background:WEB.green, color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, letterSpacing:.5, boxShadow:'0 6px 20px rgba(126,191,46,.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'transform .15s, box-shadow .15s' }}
                  onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(126,191,46,.45)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 20px rgba(126,191,46,.35)'; }}>
                  {form.quantity > 1 ? L(`Confirmar ${form.quantity} Lugares`, `Confirm ${form.quantity} Spots`) : L('Confirmar mi Lugar', 'Confirm My Spot')}
                </button>

                <p style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:WEB.textLight, textAlign:'center', lineHeight:1.6, marginTop:10, marginBottom:0 }}>
                  {L('Al confirmar, aceptas la Política de Privacidad y los Términos de Uso. Confirmación por email.', 'By confirming, you accept the Privacy Policy & Terms of Use. Confirmation by email.')}
                </p>

                <button onClick={() => setShowFullForm(true)} style={{ width:'100%', background:'none', border:'none', cursor:'pointer', marginTop:14, fontFamily:'Nunito,system-ui', fontSize:13, fontWeight:600, color:WEB.teal, textDecoration:'underline' }}>
                  {L('Editar mis datos o agregar teléfono', 'Edit my details or add phone')}
                </button>
              </>
            )}

            {payStep === 'form' && !canQuickBook && (
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
                    {(() => { const maxQty = Math.min(event.spotsLeft || 10, 10); const atMax = form.quantity >= maxQty; return (
                    <div style={{ display:'flex', alignItems:'center', gap:0, background:WEB.bgAlt, borderRadius:12, width:'fit-content', border:`1.5px solid ${WEB.border}` }}>
                      <button onClick={() => setF('quantity', Math.max(1, form.quantity-1))} style={{ width:44, height:44, border:'none', background:'transparent', cursor: form.quantity <= 1 ? 'not-allowed' : 'pointer', fontSize:20, color: form.quantity <= 1 ? WEB.textLight : WEB.teal, fontWeight:700 }}>{'\u2212'}</button>
                      <span style={{ minWidth:36, textAlign:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, color:WEB.text }}>{form.quantity}</span>
                      <button onClick={() => { if (!atMax) setF('quantity', form.quantity+1); }} disabled={atMax} style={{ width:44, height:44, border:'none', background:'transparent', cursor: atMax ? 'not-allowed' : 'pointer', fontSize:20, color: atMax ? WEB.textLight : WEB.green, fontWeight:700 }}>+</button>
                    </div>
                    ); })()}
                  </div>
                  {total > 0 && (
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textMuted }}>{L('Total', 'Total')}</div>
                      <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:30, fontWeight:800, color:WEB.teal }}>${total}</div>
                    </div>
                  )}
                </div>

                {/* Personal info */}
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12, marginBottom:12 }}>
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
                  <label style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>{L('Tel\u00e9fono *', 'Phone Number *')}</label>
                  <PhoneInput value={form.phone} onChange={v => setF('phone', v)} hasError={errors.phone} />
                  {errors.phone && <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:'#E74C3C', marginTop:3 }}>{errors.phone}</div>}
                </div>

                {/* ---- CONSENT BLOCK -------------------------------------------------------------- */}
                <div style={{ background:'rgba(27,94,127,.05)', borderRadius:14, padding:'16px 18px', border:`1.5px solid rgba(27,94,127,.1)`, marginBottom:14 }}>
                  <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, color:WEB.teal, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>
                    {L('Comunicaciones', 'Communications')}
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
                  <input type="checkbox" checked={form.privacyAccepted} onChange={e => { setF('privacyAccepted', e.target.checked); if (e.target.checked) setErrors(prev => { const { privacy, ...rest } = prev; return rest; }); }} style={{ marginTop:3, width:18, height:18, accentColor:WEB.teal, flexShrink:0 }} />
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
                    ? L('Confirmaci\u00f3n por email y SMS.', 'Confirmation by email & SMS.')
                    : L('Pago seguro con Clover. Confirmaci\u00f3n por email y SMS.', 'Secure payment by Clover. Confirmation by email & SMS.')}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
