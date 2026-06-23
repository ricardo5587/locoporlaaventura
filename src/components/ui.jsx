import { useState, useEffect, useRef, useCallback } from 'react';
import { WEB, useBreakpoint, fmtDate, CAT_ICONS } from '../lib/tokens';
import { WebBadge, WebMountains, WebImgPlaceholder, WebStarRow, MAX_W, PhoneInput } from './shared';

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

// ── Hero Slide Fallback Art ──────────────────────────────────────────────────
const SLIDE_GRADIENTS = [
  ['#0B1E2B', '#1B5E7F', '#0D3820'],
  ['#12291A', '#2D7A4F', '#1B3A2E'],
  ['#1A1510', '#5C3B1E', '#2E1F0E'],
  ['#0E1A22', '#1B5E7F', '#16262F'],
];

function HeroSlideArt({ index }) {
  const g = SLIDE_GRADIENTS[index] || SLIDE_GRADIENTS[0];
  const ridgeY = 320 + index * 20;
  return (
    <svg viewBox="0 0 1440 620" preserveAspectRatio="xMidYMid slice" style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
      <defs>
        <linearGradient id={`hg${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={g[0]} />
          <stop offset="50%" stopColor={g[1]} />
          <stop offset="100%" stopColor={g[2]} />
        </linearGradient>
      </defs>
      <rect width="1440" height="620" fill={`url(#hg${index})`} />
      {[.18,.31,.44,.57,.70,.83].map((t,i) => {
        const y = 620*t, amp = 30+i*5;
        return <path key={i} d={`M0 ${y} Q360 ${y-amp} 720 ${y} Q1080 ${y+amp} 1440 ${y}`} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1.5" />;
      })}
      <path d={`M0 620 L300 ${ridgeY} L600 ${ridgeY+40} L900 ${ridgeY-10} L1200 ${ridgeY+30} L1440 ${ridgeY+50} L1440 620Z`} fill="rgba(255,255,255,.03)" />
      <path d={`M0 620 L200 ${ridgeY+60} L500 ${ridgeY+20} L800 ${ridgeY+70} L1100 ${ridgeY+30} L1440 ${ridgeY+80} L1440 620Z`} fill="rgba(0,0,0,.08)" />
    </svg>
  );
}

// ── Hero Carousel ────────────────────────────────────────────────────────────
const HERO_API = import.meta.env.VITE_API_URL || 'https://locoporlaaventura.vercel.app';

export function WebHero({ lang, onScroll, onVolunteer }) {
  const L = (es, en) => lang === 'es' ? es : en;
  const { isMobile } = useBreakpoint();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slides, setSlides] = useState([null, null, null, null]);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const dotsRef = useRef(null);
  const draggingDots = useRef(false);

  useEffect(() => {
    // Reuse the fetch kicked off in index.html (before React loaded) if present.
    const source = window.__heroSlidesPromise
      || fetch(`${HERO_API}/api/hero-slides`).then(r => r.ok ? r.json() : []);
    Promise.resolve(source)
      .then(data => {
        if (Array.isArray(data) && data.length === 4) {
          setSlides(data.map(s => s.image_url));
        }
      })
      .catch(() => {});
  }, []);

  const advance = useCallback(() => {
    setActive(a => (a + 1) % 4);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(advance, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, advance]);

  useEffect(() => {
    const handler = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const goTo = (i) => {
    setActive(i);
    clearInterval(timerRef.current);
    if (!paused) timerRef.current = setInterval(advance, 5000);
  };

  // Swipe to change slides (touch).
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 40) goTo((active + 3) % 4);
    else if (dx < -40) goTo((active + 1) % 4);
    touchStartX.current = null;
  };

  // Hold-and-slide across the dot bar to scrub between slides.
  const dotFromX = (clientX) => {
    const el = dotsRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = (clientX - r.left) / r.width;
    const i = Math.min(3, Math.max(0, Math.floor(ratio * 4)));
    goTo(i);
  };
  const onDotsDown = (e) => { draggingDots.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); dotFromX(e.clientX); };
  const onDotsMove = (e) => { if (draggingDots.current) dotFromX(e.clientX); };
  const onDotsUp = () => { draggingDots.current = false; };

  return (
    <div
      style={{ position:'relative', background:`linear-gradient(160deg,${WEB.tealDark} 0%,${WEB.teal} 60%,#0D3820 100%)`, overflow:'hidden', minHeight: isMobile ? 440 : 620, touchAction:'pan-y' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={e => { if (e.target.closest('button,a,select,input')) return; const r = e.currentTarget.getBoundingClientRect(); e.clientX > r.left + r.width / 2 ? goTo((active + 1) % 4) : goTo((active + 3) % 4); }}
    >
      {/* Background slides (cross-fade) */}
      {[0,1,2,3].map(i => (
        <div key={i} style={{ position:'absolute', inset:0, opacity: active === i ? 1 : 0, zIndex: active === i ? 2 : 1, transition:'opacity 1.1s ease' }}>
          {slides[i] ? (
            <>
              <img
                src={slides[i]}
                alt={`Slide ${i+1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchpriority={i === 0 ? 'high' : 'low'}
                decoding="async"
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
              />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(11,30,43,.5) 0%, rgba(11,30,43,.25) 40%, rgba(11,30,43,.4) 100%)' }} />
            </>
          ) : (
            <HeroSlideArt index={i} />
          )}
        </div>
      ))}

      {/* Radial glow */}
      <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:600, height:400, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(74,158,199,.15) 0%,transparent 70%)', pointerEvents:'none', zIndex:3 }} />

      {/* Centered content */}
      <div style={{ ...MAX_W, position:'relative', zIndex:5, paddingTop: isMobile ? 32 : 70, paddingBottom: isMobile ? 40 : 60, textAlign:'center' }}>
        <img src={LOGO} style={{ height: isMobile ? 80 : 140, width:'auto', filter:'drop-shadow(0 8px 32px rgba(0,0,0,.5))', marginBottom: isMobile ? 16 : 28 }} />
        <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 12 : 16, fontWeight:600, letterSpacing: isMobile ? 3 : 4, textTransform:'uppercase', color:'rgba(255,255,255,.55)', marginBottom:8 }}>
          {L('BIENVENIDOS A', 'WELCOME TO')}
        </div>
        <h1 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 36 : 68, fontWeight:800, textTransform:'uppercase', color:'#fff', letterSpacing:.5, lineHeight:1.02, margin:'0 0 12px', textShadow:'0 4px 24px rgba(0,0,0,.3)' }}>
          LOCO POR<br />LA AVENTURA
        </h1>
        <p style={{ fontFamily:'Nunito,system-ui', fontSize: isMobile ? 14 : 18, color:'rgba(255,255,255,.72)', margin:'0 auto 24px', maxWidth:520, lineHeight:1.6, padding: isMobile ? '0 8px' : 0 }}>
          {L('Eventos de aventura al aire libre para la comunidad latina y más allá · Portland, Oregón', 'Outdoor adventure events for the Latino community and beyond · Portland, Oregon')}
        </p>
        <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 6 : 12, alignItems:'center' }}>
          {[
            { label: L('Próximos Eventos', 'Upcoming Events'), action: onScroll, bg: 'rgba(126,191,46,.75)', shadow: 'rgba(126,191,46,.35)', hoverBg: 'rgba(126,191,46,.9)' },
            { label: L('Ser Voluntario', 'Become a Volunteer'), action: onVolunteer, bg: 'rgba(27,94,127,.7)', shadow: 'rgba(27,94,127,.35)', hoverBg: 'rgba(27,94,127,.9)' },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{ minWidth: isMobile ? 190 : 230, padding: isMobile ? '10px 24px' : '15px 28px', borderRadius: isMobile ? 10 : 14, border:'1px solid rgba(255,255,255,.15)', cursor:'pointer', background:btn.bg, backdropFilter:'blur(12px)', color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 14 : 19, fontWeight:800, letterSpacing:.5, textTransform:'uppercase', boxShadow:`0 4px 16px ${btn.shadow}, inset 0 1px 0 rgba(255,255,255,.15)`, transition:'transform .15s, box-shadow .15s, background .2s', textAlign:'center', whiteSpace:'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 12px 36px ${btn.shadow}, inset 0 1px 0 rgba(255,255,255,.2)`; e.currentTarget.style.background=btn.hoverBg; }}
              onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 8px 28px ${btn.shadow}, inset 0 1px 0 rgba(255,255,255,.15)`; e.currentTarget.style.background=btn.bg; }}>
              {btn.label}
            </button>
          ))}
        </div>
        {/* Stats row */}
        <div style={{ display:'flex', gap: isMobile ? 20 : 48, justifyContent:'center', marginTop: isMobile ? 24 : 40, flexWrap:'wrap' }}>
          {[['90+', L('Voluntarios', 'Volunteers')], ['64', L('Eventos/año', 'Events/year')]].map(([n, l]) => (
            <div key={n} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 26 : 32, fontWeight:800, color:'#fff', lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize: isMobile ? 11 : 13, color:'rgba(255,255,255,.55)', marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Prev/Next arrows */}
      {!isMobile && (
        <>
          <button onClick={() => goTo((active + 3) % 4)} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', zIndex:6, width:44, height:44, borderRadius:'50%', border:'none', cursor:'pointer', background:'rgba(0,0,0,.35)', backdropFilter:'blur(8px)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => goTo((active + 1) % 4)} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', zIndex:6, width:44, height:44, borderRadius:'50%', border:'none', cursor:'pointer', background:'rgba(0,0,0,.35)', backdropFilter:'blur(8px)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>
      )}

      {/* Dot navigation — hold & slide to scrub */}
      <div
        ref={dotsRef}
        onPointerDown={onDotsDown}
        onPointerMove={onDotsMove}
        onPointerUp={onDotsUp}
        onPointerCancel={onDotsUp}
        style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:6, display:'flex', alignItems:'center', gap:6, padding:'12px 14px', cursor:'pointer', touchAction:'none', userSelect:'none' }}>
        {[0,1,2,3].map(i => (
          <span key={i} style={{ width: active === i ? 26 : 9, height:9, borderRadius:5, background: active === i ? '#7EBF2E' : 'rgba(255,255,255,.45)', transition:'width .3s ease, background .3s ease', pointerEvents:'none', display:'block' }} />
        ))}
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
        <WebImgPlaceholder height={170} label={`${L(event.titleEs, event.titleEn)} · event photo`} index={event.index} image={event.image} style={{ borderRadius:'12px 12px 0 0' }} />
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
          {event.duration && (
            <span style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:WEB.textLight, display:'flex', alignItems:'center', gap:5 }}>
              <span>⏱️</span> {event.duration}
            </span>
          )}
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
  const [phone, setPhone] = useState('+1 ');
  const [sms, setSms] = useState(false);
  const [mkt, setMkt] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const { isMobile } = useBreakpoint();

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError(L('Por favor ingresa un email válido', 'Please enter a valid email'));
      return;
    }
    setError('');
    setDone(true);
  }

  return (
    <div style={{ background:`linear-gradient(135deg,${WEB.tealDark},${WEB.teal})`, padding: isMobile ? '40px 16px' : '80px 24px', position:'relative', overflow:'hidden' }}>
      <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none' }} viewBox="0 0 1440 300" preserveAspectRatio="none">
        {[.2,.4,.6,.8].map((t,i) => { const y=300*t, a=20+i*6; return <path key={i} d={`M0 ${y} Q360 ${y-a} 720 ${y} Q1080 ${y+a} 1440 ${y}`} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1.5" />; })}
      </svg>
      <div style={{ ...MAX_W, position:'relative', zIndex:5, textAlign:'center' }}>
        <WebStarRow count={4} color="rgba(126,191,46,.7)" size={10} />
        <h2 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize: isMobile ? 24 : 44, fontWeight:800, textTransform:'uppercase', color:'#fff', letterSpacing:.5, margin:'12px 0 8px' }}>
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
              {L('Te suscribiremos para recibir actualizaciones.', "We'll subscribe you to receive updates.")}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth:500, margin:'0 auto', display:'flex', flexDirection:'column', gap:12 }}>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (error) setError(''); }} placeholder={L('tu@correo.com', 'your@email.com')} style={{ height:44, borderRadius:10, border:`1.5px solid ${error ? '#E74C3C' : WEB.borderMd}`, background:'#fff', color:WEB.text, padding:'0 16px', fontFamily:'Nunito,system-ui', fontSize:14, outline:'none', boxSizing:'border-box', width:'100%' }} />
            {error && <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:'#E74C3C', marginTop:4 }}>{error}</div>}
            <PhoneInput value={phone} onChange={setPhone} hasError={false} />
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
              {L('Puedes cancelar en cualquier momento · Política de Privacidad', 'Unsubscribe anytime · Privacy Policy')}
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
    <footer style={{ background:WEB.tealDark, padding:'32px 16px 20px', borderTop:`3px solid ${WEB.green}` }}>
      <div style={{ ...MAX_W }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
            <img src={LOGO} style={{ height:52 }} />
            <div style={{ display:'flex', gap:8 }}>
              {[
                { id:'instagram', icon:'📸', href:'https://www.instagram.com/locoporlaaventura/' },
                { id:'facebook', icon:'👤', href:'https://www.facebook.com/locoporlaaventura/' },
                { id:'whatsapp', icon:'💬', href:'https://wa.me/15035551234' },
              ].map(s => (
                <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', textDecoration:'none' }}>
                  <span style={{ fontSize:14 }}>{s.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <p style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.45)', lineHeight:1.5, margin:0 }}>
            {L('Loco por la Aventura es una organización sin fines de lucro 501(c)(3) con sede en Oregon, dedicada a promover la equidad educativa, el acceso al aire libre y la justicia ambiental para la comunidad latina — y más allá.', 'Loco por la Aventura is a 501(c)(3) nonprofit organization based in Oregon, dedicated to advancing educational equity, outdoor access, and environmental justice for the Latino community — and beyond.')}
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:24 }}>
          {[
            { title: L('Eventos', 'Events'), items: [
              { label: 'Escalada', href: '#' },
              { label: 'Senderismo', href: '#' },
              { label: L('Talleres', 'Workshops'), href: '#' },
              { label: L('Expediciones', 'Expeditions'), href: '#' },
              { label: L('Keynotes', 'Keynotes'), href: '#' },
            ] },
            { title: L('Comunidad', 'Community'), items: [
              { label: L('Voluntario', 'Volunteer'), href: '#' },
              { label: L('Tienda', 'Shop'), href: '#' },
              { label: L('Blog', 'Blog'), href: '#' },
              { label: L('Sobre Nosotros', 'About Us'), href: '#' },
              { label: L('Contacto', 'Contact'), href: '#' },
            ] },
            { title: L('Legal', 'Legal'), items: [
              { label: L('Política de Privacidad', 'Privacy Policy'), href: 'https://locoporlaaventura.com/pages/privacy-policy' },
              { label: L('Términos de Servicio', 'Terms of Service'), href: 'https://locoporlaaventura.com/pages/terms-of-service' },
            ] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:800, color:'rgba(255,255,255,.5)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:8 }}>{col.title}</div>
              {col.items.map(item => {
                const label = typeof item === 'string' ? item : item.label
                const href = typeof item === 'string' ? null : item.href
                const isExternal = href && href !== '#';
                return (
                  <a key={label} href={href || '#'} {...(isExternal ? { target:'_blank', rel:'noopener noreferrer' } : {})} style={{ display:'block', fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.55)', marginBottom:5, cursor:'pointer', textDecoration:'none' }}>{label}</a>
                )
              })}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:20, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.35)' }}>
            © 2026 Loco Por La Aventura · locoporlaaventura.com
          </span>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'rgba(255,255,255,.25)' }}>
            {L('Pagos seguros con', 'Secure payments with')} Clover
          </span>
        </div>
      </div>
    </footer>
  );
}
