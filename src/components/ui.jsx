import { useState, useEffect } from 'react';
import { WEB, useBreakpoint, fmtDate, CAT_ICONS } from '../lib/tokens';
import { WebBadge, WebMountains, WebImgPlaceholder, WebStarRow, MAX_W } from './shared';

const LOGO = '/logo.png';

export function LangToggleWeb({ lang, setLang }) {
  return (
    <div style={{ display:'flex', background:'rgba(255,255,255,.12)', borderRadius:20, padding:3, gap:2 }}>
      {['ES','EN'].map(l => {
        const active = l.toLowerCase() === lang;
        return (
          <button key={l} onClick={() => setLang(l.toLowerCase())} style={{ padding:'4px 13px', borderRadius:16, border:'none', cursor:'pointer', background: active ? WEB.green : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,.7)', fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight:700, letterSpacing:.5, transition:'all .2s' }}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export function WebNavbar({ lang, setLang, onHome, onBook }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const navLinks = [
    { es:'Eventos', en:'Events', id:'events' },
    { es:'Tienda', en:'Shop', id:'shop' },
    { es:'Voluntario', en:'Volunteer', id:'volunteer' },
    { es:'Nosotros', en:'About', id:'about' },
  ];

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background: scrolled ? 'rgba(11,30,43,.97)' : WEB.tealDark, backdropFilter:'blur(16px)', boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,.25)' : 'none', transition:'all .3s' }}>
      <div style={{ ...MAX_W, display:'flex', alignItems:'center', height:68, gap:32 }}>
        {/* Logo */}
        <img src={LOGO} onClick={onHome} style={{ height:46, width:'auto', cursor:'pointer', filter:'drop-shadow(0 2px 8px rgba(0,0,0,.3))', flexShrink:0 }} />

        {/* Nav links — desktop */}
        {!isMobile && (
          <div style={{ display:'flex', gap:6, flex:1 }}>
            {navLinks.map(link => (
              <button key={link.id} style={{ background:'none', border:'none', cursor:'pointer', padding:'6px 14px', borderRadius:8, color:'rgba(255,255,255,.75)', fontFamily:'Nunito,system-ui', fontSize:15, fontWeight:600, transition:'color .2s' }}
                onMouseOver={e => e.currentTarget.style.color='#fff'}
                onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,.75)'}>
                {L(link.es, link.en)}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          <LangToggleWeb lang={lang} setLang={setLang} />
          {!isMobile && (
            <button onClick={onBook} style={{ padding:'10px 22px', borderRadius:10, border:'none', cursor:'pointer', background:WEB.green, color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, letterSpacing:.5, textTransform:'uppercase' }}>
              {L('Reservar', 'Book Now')}
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMenuOpen(m => !m)} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff', fontSize:24, lineHeight:1 }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{ background:WEB.tealDark, padding:'12px 24px 20px', display:'flex', flexDirection:'column', gap:4 }}>
          {navLinks.map(link => (
            <button key={link.id} style={{ background:'none', border:'none', cursor:'pointer', padding:'10px 4px', textAlign:'left', color:'rgba(255,255,255,.8)', fontFamily:'Nunito,system-ui', fontSize:15, fontWeight:600 }}>
              {L(link.es, link.en)}
            </button>
          ))}
          <button onClick={onBook} style={{ marginTop:8, padding:'12px 22px', borderRadius:10, border:'none', cursor:'pointer', background:WEB.green, color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, letterSpacing:.5, textTransform:'uppercase' }}>
            {L('Reservar', 'Book Now')}
          </button>
        </div>
      )}
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function WebHero({ lang, onScroll, onVolunteer }) {
  const L = (es, en) => lang === 'es' ? es : en;
  const { isMobile } = useBreakpoint();
  return (
    <div style={{ position:'relative', background:`linear-gradient(160deg,${WEB.tealDark} 0%,${WEB.teal} 60%,#0D3820 100%)`, overflow:'hidden', minHeight: isMobile ? 520 : 620 }}>
      {/* Topo lines */}
      <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 1440 620" preserveAspectRatio="none">
        {[.18,.31,.44,.57,.70,.83].map((t,i) => { const y=620*t, amp=30+i*5; return <path key={i} d={`M0 ${y} Q360 ${y-amp} 720 ${y} Q1080 ${y+amp} 1440 ${y}`} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1.5" />; })}
      </svg>
      {/* Radial glow */}
      <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:600, height:400, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(74,158,199,.15) 0%,transparent 70%)', pointerEvents:'none' }} />

      <div style={{ ...MAX_W, position:'relative', zIndex:5, paddingTop: isMobile ? 40 : 70, paddingBottom:60, textAlign:'center' }}>
        <img src={LOGO} style={{ height: isMobile ? 110 : 140, width:'auto', filter:'drop-shadow(0 8px 32px rgba(0,0,0,.5))', marginBottom:28 }} />
        <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 14 : 16, fontWeight:600, letterSpacing:4, textTransform:'uppercase', color:'rgba(255,255,255,.55)', marginBottom:8 }}>
          {L('BIENVENIDOS A', 'WELCOME TO')}
        </div>
        <h1 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 44 : 68, fontWeight:800, textTransform:'uppercase', color:'#fff', letterSpacing:.5, lineHeight:1.02, margin:'0 0 16px', textShadow:'0 4px 24px rgba(0,0,0,.3)' }}>
          LOCO POR<br />LA AVENTURA
        </h1>
        <p style={{ fontFamily:'Nunito,system-ui', fontSize: isMobile ? 16 : 18, color:'rgba(255,255,255,.72)', margin:'0 auto 32px', maxWidth:520, lineHeight:1.6 }}>
          {L('Eventos de aventura al aire libre para la comunidad latina · Portland, OR & el Noroeste del Pacífico', 'Outdoor adventure events for the Latino community · Portland, OR & the Pacific Northwest')}
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={onScroll} style={{ padding:'14px 32px', borderRadius:14, border:'none', cursor:'pointer', background:WEB.green, color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, letterSpacing:.5, boxShadow:'0 8px 28px rgba(126,191,46,.4)', transition:'transform .15s, box-shadow .15s' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(126,191,46,.5)'; }}
            onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 28px rgba(126,191,46,.4)'; }}>
            {L('Ver Próximos Eventos', 'View Upcoming Events')} →
          </button>
          <button onClick={onVolunteer} style={{ padding:'14px 24px', borderRadius:14, border:'1.5px solid rgba(255,255,255,.25)', cursor:'pointer', background:'transparent', color:'rgba(255,255,255,.85)', fontFamily:'Nunito,system-ui', fontSize:16, fontWeight:600 }}>
            🤝 {L('Ser Voluntario', 'Become a Volunteer')}
          </button>
        </div>
        {/* Stats row */}
        <div style={{ display:'flex', gap: isMobile ? 24 : 48, justifyContent:'center', marginTop:40, flexWrap:'wrap' }}>
          {[['500+', L('Aventureros', 'Adventurers')], ['20+', L('Eventos/año', 'Events/year')], ['PNW', L('Región', 'Region')]].map(([n, l]) => (
            <div key={n} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:32, fontWeight:800, color:'#fff', lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.55)', marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <WebMountains height={100} />
    </div>
  );
}

// ── Event Card ────────────────────────────────────────────────────────────────
export function EventCard({ event, lang, onBook }) {
  const L = (es, en) => lang === 'es' ? es : en;
  const [hovered, setHovered] = useState(false);
  const isFull = event.spotsLeft === 0;
  const isLow = event.spotsLeft > 0 && event.spotsLeft <= 4;

  return (
    <div onMouseOver={() => setHovered(true)} onMouseOut={() => setHovered(false)}
      style={{ background:WEB.card, borderRadius:WEB.radius, overflow:'hidden', boxShadow: hovered ? WEB.shadowLg : WEB.shadow, transform: hovered ? 'translateY(-3px)' : 'none', transition:'all .2s', cursor:'pointer', display:'flex', flexDirection:'column' }}
      onClick={() => !isFull && onBook(event)}>

      {/* Image */}
      <div style={{ position:'relative' }}>
        <WebImgPlaceholder height={190} label={`${L(event.titleEs, event.titleEn)} · event photo`} index={event.index} />
        <div style={{ position:'absolute', top:12, left:12 }}>
          <WebBadge bg={WEB.teal}>{CAT_ICONS[event.category]} {event.category}</WebBadge>
        </div>
        {isFull && (
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <WebBadge bg="rgba(0,0,0,.7)" style={{ fontSize:16, padding:'6px 16px' }}>⛔ {L('AGOTADO', 'SOLD OUT')}</WebBadge>
          </div>
        )}
        {isLow && (
          <div style={{ position:'absolute', bottom:10, right:10 }}>
            <WebBadge bg="#E74C3C">⚡ {L(`${event.spotsLeft} plazas`, `${event.spotsLeft} spots`)}</WebBadge>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding:'16px 18px 18px', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:19, fontWeight:800, color:WEB.text, textTransform:'uppercase', letterSpacing:.3, lineHeight:1.2, marginBottom:10 }}>
          {L(event.titleEs, event.titleEn)}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14, flex:1 }}>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:WEB.textMuted, display:'flex', alignItems:'center', gap:5 }}>
            <span>📅</span> {fmtDate(event.date, lang)} · {event.time}
          </span>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:WEB.textMuted, display:'flex', alignItems:'center', gap:5 }}>
            <span>📍</span> {event.location}
          </span>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textLight, display:'flex', alignItems:'center', gap:5 }}>
            <span>⏱️</span> {event.duration}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:`1px solid ${WEB.border}` }}>
          <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:24, fontWeight:800, color: event.isFree ? WEB.green : WEB.teal }}>
            {event.isFree ? L('Gratis', 'Free') : `$${event.price}`}
          </span>
          <button style={{ padding:'8px 18px', borderRadius:10, border:'none', cursor: isFull ? 'not-allowed' : 'pointer', background: isFull ? 'rgba(0,0,0,.08)' : (hovered ? WEB.green : WEB.teal), color: isFull ? WEB.textMuted : '#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:700, letterSpacing:.3, transition:'background .2s' }}>
            {isFull ? L('Agotado', 'Sold Out') : L('Reservar', 'Book')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category filter ───────────────────────────────────────────────────────────
export function CategoryFilter({ active, setActive, lang }) {
  const L = (es, en) => lang === 'es' ? es : en;
  const cats = [L('Todos', 'All'), 'Escalada', 'Senderismo', 'Taller', 'Keynote', 'Social', 'Expedición', 'Voluntario'];
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {cats.map(c => {
        const isActive = c === active || (c === L('Todos', 'All') && active === 'all');
        return (
          <button key={c} onClick={() => setActive(c === L('Todos', 'All') ? 'all' : c)} style={{ padding:'7px 16px', borderRadius:20, border:`1.5px solid ${isActive ? WEB.green : WEB.border}`, background: isActive ? WEB.green : '#fff', color: isActive ? '#fff' : WEB.textMuted, fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight:700, letterSpacing:.4, cursor:'pointer', transition:'all .2s', textTransform:'uppercase' }}>
            {CAT_ICONS[c] ? `${CAT_ICONS[c]} ${c}` : c}
          </button>
        );
      })}
    </div>
  );
}

// ── Newsletter / SMS signup ───────────────────────────────────────────────────
export function NewsletterSection({ lang }) {
  const L = (es, en) => lang === 'es' ? es : en;
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sms, setSms] = useState(false);
  const [mkt, setMkt] = useState(false);
  const [done, setDone] = useState(false);
  const { isMobile } = useBreakpoint();

  function handleSubmit(e) {
    e.preventDefault();
    if (email) setDone(true);
  }

  return (
    <div style={{ background:`linear-gradient(135deg,${WEB.tealDark},${WEB.teal})`, padding: isMobile ? '60px 24px' : '80px 24px', position:'relative', overflow:'hidden' }}>
      <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 1440 300" preserveAspectRatio="none">
        {[.2,.4,.6,.8].map((t,i) => { const y=300*t, a=20+i*6; return <path key={i} d={`M0 ${y} Q360 ${y-a} 720 ${y} Q1080 ${y+a} 1440 ${y}`} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1.5" />; })}
      </svg>
      <div style={{ ...MAX_W, position:'relative', zIndex:5, textAlign:'center' }}>
        <WebStarRow count={4} color="rgba(126,191,46,.7)" size={10} />
        <h2 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 32 : 44, fontWeight:800, textTransform:'uppercase', color:'#fff', letterSpacing:.5, margin:'12px 0 8px' }}>
          {L('NO TE PIERDAS NINGUNA AVENTURA', "DON'T MISS ANY ADVENTURE")}
        </h2>
        <p style={{ fontFamily:'Nunito,system-ui', fontSize:16, color:'rgba(255,255,255,.65)', marginBottom:32, maxWidth:480, margin:'0 auto 32px' }}>
          {L('Recibe notificaciones de nuevos eventos, talleres y ofertas exclusivas.', 'Get notified about new events, workshops and exclusive offers.')}
        </p>
        {done ? (
          <div style={{ background:'rgba(126,191,46,.15)', border:'1.5px solid rgba(126,191,46,.4)', borderRadius:16, padding:'20px 28px', display:'inline-block' }}>
            <div style={{ fontSize:32, marginBottom:8 }}>✅</div>
            <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:22, fontWeight:800, color:'#fff' }}>{L('¡Gracias! Ya estás suscrito.', "Thanks! You're now subscribed.")}</div>
            <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:'rgba(255,255,255,.65)', marginTop:4 }}>
              {L('Te añadiremos a Klaviyo para recibir actualizaciones.', "We'll add you to Klaviyo to receive updates.")}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth:500, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={L('tu@correo.com', 'your@email.com')} style={{ height:50, borderRadius:12, border:'1.5px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.1)', color:'#fff', padding:'0 16px', fontFamily:'Nunito,system-ui', fontSize:16, outline:'none', backdropFilter:'blur(8px)' }} />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder={`📱 ${L('Teléfono para SMS (opcional)', 'Phone for SMS (optional)')}`} style={{ height:50, borderRadius:12, border:'1.5px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.1)', color:'#fff', padding:'0 16px', fontFamily:'Nunito,system-ui', fontSize:15, outline:'none', backdropFilter:'blur(8px)' }} />
            <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer', textAlign:'left' }}>
              <input type="checkbox" checked={sms} onChange={e => setSms(e.target.checked)} style={{ marginTop:3, width:18, height:18, accentColor:WEB.green, flexShrink:0 }} />
              <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.7)', lineHeight:1.5 }}>
                {L('Acepto recibir SMS de LPLA con novedades y eventos. Responde STOP para cancelar.', 'I consent to receive SMS from LPLA with news and events. Reply STOP to unsubscribe.')}
              </span>
            </label>
            <label style={{ display:'flex', gap:10, alignItems:'flex-start', cursor:'pointer', textAlign:'left' }}>
              <input type="checkbox" checked={mkt} onChange={e => setMkt(e.target.checked)} style={{ marginTop:3, width:18, height:18, accentColor:WEB.green, flexShrink:0 }} />
              <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.7)', lineHeight:1.5 }}>
                {L('Acepto recibir correos de marketing de LPLA con próximos eventos y ofertas.', 'I consent to receive marketing emails from LPLA with upcoming events and offers.')}
              </span>
            </label>
            <button type="submit" style={{ height:50, borderRadius:12, border:'none', cursor:'pointer', background:WEB.green, color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:18, fontWeight:800, letterSpacing:.5, boxShadow:'0 6px 20px rgba(126,191,46,.4)', marginTop:4 }}>
              {L('Suscribirse', 'Subscribe')} →
            </button>
            <p style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:'rgba(255,255,255,.4)', margin:0, lineHeight:1.5 }}>
              {L('Powered by Klaviyo · Puedes cancelar en cualquier momento · Política de Privacidad', 'Powered by Klaviyo · Unsubscribe anytime · Privacy Policy')}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function WebFooter({ lang }) {
  const L = (es, en) => lang === 'es' ? es : en;
  return (
    <footer style={{ background:WEB.tealDark, padding:'48px 24px 28px', borderTop:`3px solid ${WEB.green}` }}>
      <div style={{ ...MAX_W }}>
        <div style={{ display:'flex', gap:40, flexWrap:'wrap', marginBottom:40 }}>
          <div style={{ flex:'1 1 240px' }}>
            <img src={LOGO} style={{ height:64, marginBottom:14 }} />
            <p style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:'rgba(255,255,255,.55)', lineHeight:1.6, maxWidth:280 }}>
              {L('Comunidad aventurera latina · Eventos, talleres y expediciones al aire libre en toda España.', 'Latino adventure community · Outdoor events, workshops and expeditions across Spain.')}
            </p>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              {['instagram', 'facebook', 'whatsapp'].map(s => (
                <div key={s} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <span style={{ fontSize:16 }}>{s==='instagram'?'📸':s==='facebook'?'👤':'💬'}</span>
                </div>
              ))}
            </div>
          </div>
          {[
            { title: L('Eventos', 'Events'), items: ['Escalada', 'Senderismo', L('Talleres', 'Workshops'), L('Expediciones', 'Expeditions'), L('Keynotes', 'Keynotes')] },
            { title: L('Comunidad', 'Community'), items: [L('Voluntario', 'Volunteer'), L('Tienda', 'Shop'), L('Blog', 'Blog'), L('Sobre Nosotros', 'About Us'), L('Contacto', 'Contact')] },
            { title: L('Legal', 'Legal'), items: [L('Política de Privacidad', 'Privacy Policy'), L('Términos de Uso', 'Terms of Use'), L('Política de Cookies', 'Cookie Policy'), L('RGPD / GDPR', 'GDPR')] },
          ].map(col => (
            <div key={col.title} style={{ flex:'1 1 140px' }}>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, color:'rgba(255,255,255,.5)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:12 }}>{col.title}</div>
              {col.items.map(item => <div key={item} style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:'rgba(255,255,255,.55)', marginBottom:8, cursor:'pointer' }}>{item}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.35)' }}>
            © 2026 Loco Por La Aventura · locoporlaaventura.com
          </span>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.25)' }}>
            {L('Pagos seguros con', 'Secure payments with')} Clover · SMS/Email {L('por', 'by')} Klaviyo
          </span>
        </div>
      </div>
    </footer>
  );
}
