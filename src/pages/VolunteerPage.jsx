import { useState } from 'react';
import { WEB, useBreakpoint } from '../lib/tokens';
import { MAX_W, WebBadge, WebMountains, PhoneInput } from '../components/shared';
import { submitForm } from '../lib/api';

export function VolunteerPage({ lang, onBack }) {
  const { isMobile, isTablet } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '+1 ',
    interests: [], availability: [], message: '',
    smsConsent: false, emailConsent: false, privacyAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, val) => setForm(f => ({
    ...f, [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val]
  }));

  const interests = [
    { id: 'trail',     es: 'Limpieza de senderos',       en: 'Trail Cleanup',           icon: '🏔️' },
    { id: 'events',    es: 'Logística de eventos',        en: 'Event Logistics',         icon: '🎪' },
    { id: 'photo',     es: 'Fotografía y contenido',      en: 'Photography & Content',   icon: '📸' },
    { id: 'guide',     es: 'Asistente de guía',           en: 'Guide Assistance',        icon: '🧭' },
    { id: 'social',    es: 'Redes sociales',              en: 'Social Media',            icon: '📱' },
    { id: 'firstaid',  es: 'Primeros auxilios',           en: 'First Aid',               icon: '🩺' },
    { id: 'translate', es: 'Traducción / Interpretación', en: 'Translation',             icon: '🗣️' },
    { id: 'admin',     es: 'Administración',              en: 'Admin / Office',          icon: '📋' },
  ];

  const avail = [
    { id: 'wd_am', es: 'Entre semana · Mañana',      en: 'Weekdays · Morning'    },
    { id: 'wd_pm', es: 'Entre semana · Tarde/Noche', en: 'Weekdays · Evening'    },
    { id: 'we_am', es: 'Fines de semana · Mañana',   en: 'Weekends · Morning'    },
    { id: 'we_pm', es: 'Fines de semana · Tarde',    en: 'Weekends · Afternoon'  },
    { id: 'flex',  es: 'Horario flexible',           en: 'Flexible schedule'     },
  ];

  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = L('Requerido', 'Required');
    if (!form.lastName.trim())  e.lastName  = L('Requerido', 'Required');
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = L('Email inválido', 'Invalid email');
    if (!form.phone.replace(/^\+\d{1,3}\s*/, '').trim()) e.phone = L('Requerido', 'Required');
    if (form.interests.length === 0) e.interests = L('Selecciona al menos una área', 'Select at least one area');
    if (!form.privacyAccepted) e.privacy = L('Debes aceptar la política de privacidad', 'You must accept the Privacy Policy');
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitError('');
    setSubmitting(true);
    try {
      await submitForm('volunteer', form);
      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(L('No se pudo enviar la solicitud. Inténtalo de nuevo.', 'Could not submit your application. Please try again.'));
    }
  }

  const inp = (hasErr) => ({
    height: 50, borderRadius: 12, border: `1.5px solid ${hasErr ? '#E74C3C' : WEB.borderMd}`,
    padding: '0 16px', fontFamily: 'Nunito,system-ui', fontSize: 15, color: WEB.text,
    background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'border-color .2s',
  });

  const errMsg = (msg) => msg ? (
    <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: '#E74C3C', marginTop: 4 }}>{msg}</div>
  ) : null;

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ background: WEB.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: WEB.greenPale, border: `3px solid ${WEB.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 38 }}>🤝</div>
          <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: isMobile ? 30 : 48, fontWeight: 800, textTransform: 'uppercase', color: WEB.text, letterSpacing: .4, margin: '0 0 12px', lineHeight: 1.05 }}>
            {L('¡Gracias por unirte!', "You're In!")}
          </h1>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 16, color: WEB.textMuted, lineHeight: 1.7, marginBottom: 32 }}>
            {L(
              `¡Hola ${form.firstName}! Hemos recibido tu solicitud. El equipo de LPLA se pondrá en contacto muy pronto.`,
              `Hey ${form.firstName}! We've received your volunteer application and the LPLA team will reach out soon.`
            )}
          </p>

          <div style={{ background: WEB.card, borderRadius: WEB.radius, padding: '20px 24px', boxShadow: WEB.shadow, marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: WEB.teal, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              📲 {L('Tus comunicaciones', 'Your communications')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>✉️</span>
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: WEB.text, flex: 1 }}>
                  {L('Email de bienvenida enviado a', 'Welcome email sent to')} <strong>{form.email}</strong>
                </span>
                <span>✅</span>
              </div>
              {form.smsConsent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📱</span>
                  <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: WEB.text, flex: 1 }}>
                    {L('SMS de confirmación a', 'Confirmation SMS to')} <strong>{form.phone}</strong>
                  </span>
                  <span>✅</span>
                </div>
              )}
              {form.emailConsent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📬</span>
                  <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: WEB.text, flex: 1 }}>
                    {L('Suscrito/a al newsletter de LPLA', 'Subscribed to LPLA newsletter')}
                  </span>
                  <span>✅</span>
                </div>
              )}
            </div>
          </div>

          <button onClick={onBack} style={{ padding: '14px 32px', borderRadius: 14, border: 'none', cursor: 'pointer', background: WEB.green, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, letterSpacing: .5, boxShadow: '0 6px 20px rgba(126,191,46,.35)' }}>
            ← {L('Ver Eventos', 'See Events')}
          </button>
        </div>
      </div>
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: WEB.bg, minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, ${WEB.tealDark} 0%, ${WEB.mountain} 100%)`, padding: isMobile ? '36px 20px 0' : '52px 24px 0', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1440 400" preserveAspectRatio="none">
          {[.2, .4, .6, .8].map((t, i) => { const y = 400 * t, a = 22 + i * 6; return <path key={i} d={`M0 ${y} Q360 ${y - a} 720 ${y} Q1080 ${y + a} 1440 ${y}`} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1.5" />; })}
        </svg>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 12px' : '0 24px', position: 'relative', zIndex: 5 }}>
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 10, cursor: 'pointer', color: 'rgba(255,255,255,.85)', padding: '8px 16px', fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
            ← {L('Volver a Eventos', 'Back to Events')}
          </button>

          <div style={{ textAlign: 'center', paddingBottom: isMobile ? 48 : 64 }}>
            <WebBadge bg={WEB.green} style={{ marginBottom: 14 }}>🤝 {L('VOLUNTARIADO', 'VOLUNTEER')}</WebBadge>
            <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: isMobile ? 34 : 66, fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: .5, lineHeight: 1.02, margin: '12px 0 16px', textShadow: '0 4px 24px rgba(0,0,0,.3)', whiteSpace: 'pre-line' }}>
              {L('Únete al\nEquipo LPLA', 'Join the\nLPLA Team')}
            </h1>
            <p style={{ fontFamily: 'Nunito,system-ui', fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,.7)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.65 }}>
              {L(
                'Ayúdanos a crear experiencias de aventura memorables para nuestra comunidad. Tu tiempo y energía hacen la diferencia.',
                'Help us create memorable outdoor adventures for our community. Your time and energy make a real difference.'
              )}
            </p>
            <div style={{ display: 'flex', gap: isMobile ? 24 : 52, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['50+', L('Voluntarios activos', 'Active volunteers')], ['20+', L('Eventos/año', 'Events per year')], ['8', L('Ciudades', 'Cities')]].map(([n, l]) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 30, fontWeight: 800, color: '#fff' }}>{n}</div>
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <WebMountains height={72} />
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '40px 20px' : '56px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 460px', gap: 48, alignItems: 'start' }}>

          {/* LEFT — What you'll do */}
          <div>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: WEB.green, marginBottom: 4 }}>
              {L('¿QUÉ HARÁS?', "WHAT YOU'LL DO")}
            </div>
            <h2 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: isMobile ? 30 : 38, fontWeight: 800, textTransform: 'uppercase', color: WEB.text, letterSpacing: .4, margin: '0 0 20px', lineHeight: 1.05 }}>
              {L('Áreas de Impacto', 'Areas of Impact')}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 36 }}>
              {interests.map(item => (
                <div key={item.id} style={{ background: WEB.card, borderRadius: WEB.radius, padding: '14px 16px', border: `1px solid ${WEB.border}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: WEB.text, textTransform: 'uppercase', letterSpacing: .3 }}>{L(item.es, item.en)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Perks */}
            <div style={{ background: `linear-gradient(135deg, ${WEB.tealDark}, ${WEB.teal})`, borderRadius: WEB.radiusLg, padding: '24px 26px' }}>
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>
                🎁 {L('BENEFICIOS DEL VOLUNTARIO', 'VOLUNTEER PERKS')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  L('Acceso gratuito a eventos LPLA', 'Free access to LPLA events'),
                  L('Equipo y material de aventura', 'Adventure gear & equipment'),
                  L('Certificados de voluntariado', 'Official volunteer certificates'),
                  L('Red de contactos comunitaria', 'Community network connections'),
                  L('Descuentos en tienda LPLA', 'Discounts at the LPLA store'),
                ].map(perk => (
                  <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Nunito,system-ui', fontSize: 14, color: 'rgba(255,255,255,.82)' }}>
                    <span style={{ color: WEB.green, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>✓</span> {perk}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div style={{ background: WEB.card, borderRadius: WEB.radiusLg, boxShadow: WEB.shadowMd, padding: isMobile ? '24px 20px' : '32px 28px', position: isMobile ? 'static' : 'sticky', top: 24 }}>

            {submitting ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>⚙️</div>
                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 22, fontWeight: 800, color: WEB.teal }}>
                  {L('Enviando solicitud…', 'Submitting application…')}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>

                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 22, fontWeight: 800, color: WEB.text, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>
                  {L('Solicitud de Voluntariado', 'Volunteer Application')}
                </div>
                <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: WEB.textMuted, marginBottom: 24 }}>
                  {L('Completa el formulario y te contactaremos.', "Complete the form and we'll reach out.")}
                </div>

                {/* Name */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: WEB.textMuted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 6 }}>{L('Nombre *', 'First Name *')}</label>
                    <input value={form.firstName} onChange={e => setF('firstName', e.target.value)} style={inp(errors.firstName)} placeholder="Maria" />
                    {errMsg(errors.firstName)}
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: WEB.textMuted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 6 }}>{L('Apellido *', 'Last Name *')}</label>
                    <input value={form.lastName} onChange={e => setF('lastName', e.target.value)} style={inp(errors.lastName)} placeholder="Lopez" />
                    {errMsg(errors.lastName)}
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: WEB.textMuted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 6 }}>{L('Correo Electrónico *', 'Email Address *')}</label>
                  <input type="email" value={form.email} onChange={e => setF('email', e.target.value)} style={inp(errors.email)} placeholder="maria@email.com" />
                  {errMsg(errors.email)}
                </div>

                {/* Phone */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: WEB.textMuted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 6 }}>📱 {L('Teléfono *', 'Phone Number *')}</label>
                  <PhoneInput value={form.phone} onChange={v => setF('phone', v)} hasError={errors.phone} />
                  {errMsg(errors.phone)}
                </div>

                {/* Interests */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: WEB.textMuted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 8 }}>
                    {L('Áreas de Interés *', 'Areas of Interest *')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 7 }}>
                    {interests.map(opt => {
                      const checked = form.interests.includes(opt.id);
                      return (
                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: 10, border: `1.5px solid ${checked ? WEB.green : WEB.border}`, background: checked ? WEB.greenPale : '#fff', cursor: 'pointer', transition: 'all .15s' }}>
                          <input type="checkbox" checked={checked} onChange={() => toggleArr('interests', opt.id)} style={{ width: 15, height: 15, accentColor: WEB.green, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 600, color: WEB.text, lineHeight: 1.3 }}>
                            {opt.icon} {L(opt.es, opt.en)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errMsg(errors.interests)}
                </div>

                {/* Availability */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: WEB.textMuted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 8 }}>
                    {L('Disponibilidad', 'Availability')}
                  </label>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {avail.map(opt => {
                      const checked = form.availability.includes(opt.id);
                      return (
                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, border: `1.5px solid ${checked ? WEB.teal : WEB.border}`, background: checked ? 'rgba(27,94,127,.09)' : '#fff', cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                          <input type="checkbox" checked={checked} onChange={() => toggleArr('availability', opt.id)} style={{ width: 13, height: 13, accentColor: WEB.teal, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 600, color: WEB.text }}>{L(opt.es, opt.en)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: WEB.textMuted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 6 }}>
                    {L('Cuéntanos sobre ti', 'Tell us about yourself')}
                  </label>
                  <textarea value={form.message} onChange={e => setF('message', e.target.value)} rows={3}
                    style={{ ...inp(false), height: 'auto', padding: '12px 16px', resize: 'vertical', lineHeight: 1.55 }}
                    placeholder={L('¿Por qué quieres ser voluntario/a? (opcional)', 'Why do you want to volunteer? (optional)')} />
                </div>

                {/* ── Consent block ────────────────────────────────────────── */}
                <div style={{ background: 'rgba(27,94,127,.05)', borderRadius: 14, padding: '16px 18px', border: `1.5px solid rgba(27,94,127,.12)`, marginBottom: 14 }}>
                  <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: WEB.teal, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                    📲 {L('Comunicaciones y Consentimiento', 'Communications & Consent')}
                  </div>

                  {/* SMS consent */}
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 14 }}>
                    <input type="checkbox" checked={form.smsConsent} onChange={e => setF('smsConsent', e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: WEB.green, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: WEB.text, marginBottom: 3 }}>
                        {L('Consentimiento para recibir SMS', 'SMS Text Message Consent')}
                      </div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: WEB.textMuted, lineHeight: 1.55 }}>
                        {L(
                          'Acepto recibir mensajes de texto (SMS/MMS) de Loco Por La Aventura sobre coordinación de voluntariado, actualizaciones de eventos y noticias de la comunidad. Responde STOP para cancelar en cualquier momento. Pueden aplicar tarifas de mensajes y datos.',
                          'I consent to receive text messages (SMS/MMS) from Loco Por La Aventura about volunteer coordination, event updates, and community news. Reply STOP to opt out at any time. Message and data rates may apply.'
                        )}
                      </div>
                    </div>
                  </label>

                  {/* Email consent */}
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.emailConsent} onChange={e => setF('emailConsent', e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: WEB.green, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: WEB.text, marginBottom: 3 }}>
                        {L('Consentimiento para recibir correos', 'Email Marketing Consent')}
                      </div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: WEB.textMuted, lineHeight: 1.55 }}>
                        {L(
                          'Acepto recibir correos electrónicos de Loco Por La Aventura sobre oportunidades de voluntariado, resúmenes de eventos y comunicaciones de la comunidad. Puedo cancelar mi suscripción en cualquier momento.',
                          'I consent to receive emails from Loco Por La Aventura about volunteer opportunities, event recaps, and community updates. I can unsubscribe at any time.'
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Privacy (required) */}
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: errors.privacy ? 4 : 20 }}>
                  <input type="checkbox" checked={form.privacyAccepted} onChange={e => setF('privacyAccepted', e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: WEB.teal, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: WEB.textMuted, lineHeight: 1.5 }}>
                    {L('* He leído y acepto la ', '* I have read and accept the ')}
                    <span style={{ color: WEB.teal, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>{L('Política de Privacidad', 'Privacy Policy')}</span>
                    {L(' y los Términos de Uso.', ' and Terms of Use.')}
                  </span>
                </label>
                {errMsg(errors.privacy)}

                {submitError && <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: '#E74C3C', marginBottom: 14, textAlign: 'center' }}>{submitError}</div>}

                {/* Submit */}
                <button type="submit"
                  style={{ width: '100%', height: 56, borderRadius: 14, border: 'none', cursor: 'pointer', background: WEB.green, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 20, fontWeight: 800, letterSpacing: .5, boxShadow: '0 6px 20px rgba(126,191,46,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'transform .15s, box-shadow .15s', marginTop: 16 }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(126,191,46,.45)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(126,191,46,.35)'; }}>
                  🤝 {L('Enviar Solicitud', 'Submit Application')}
                </button>

                <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: WEB.textLight, textAlign: 'center', lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
                  {L('Datos gestionados según nuestra Política de Privacidad · Comunicaciones vía Klaviyo', 'Data managed per our Privacy Policy · Communications via Klaviyo')}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
