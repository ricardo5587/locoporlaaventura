import { useState, useEffect } from 'react';
import { WEB, useBreakpoint } from '../lib/tokens';

const STORE_URL = 'https://locoporlaaventura.com';

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <path d="M4 42 L17 21 L30 42" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.42)" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 42 L28 8 L42 42" fill="rgba(255,255,255,.12)"/>
      <path d="M14 42 L28 8 L42 42" stroke="white" strokeWidth="2.6" strokeLinejoin="round" fill="none"/>
      <path d="M24 13 L28 8 L32 13" fill="white"/>
      <circle cx="40.5" cy="10.5" r="4.5" fill="white" opacity=".9"/>
      <path d="M40.5 4.5 V3 M46.5 6.5 L47.5 5.5 M48 10.5 H46.5" stroke="rgba(255,255,255,.6)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function VolunteerIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="10.5" cy="15" r="5.5" fill="rgba(255,255,255,.55)"/>
      <path d="M3 42 Q3 28 10.5 28 Q18 28 18 42" fill="rgba(255,255,255,.55)"/>
      <circle cx="24" cy="11.5" r="7" fill="white"/>
      <path d="M14 42 Q14 26 24 26 Q34 26 34 42" fill="white"/>
      <circle cx="37.5" cy="15" r="5.5" fill="rgba(255,255,255,.55)"/>
      <path d="M30 42 Q30 28 37.5 28 Q45 28 45 42" fill="rgba(255,255,255,.55)"/>
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <path d="M15.5 21 Q9 27 9 36" stroke="rgba(255,255,255,.58)" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M32.5 21 Q39 27 39 36" stroke="rgba(255,255,255,.58)" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M15 18 Q15 9 24 9 Q33 9 33 18" fill="rgba(255,255,255,.48)"/>
      <path d="M21 9.5 Q24 5.5 27 9.5" stroke="rgba(255,255,255,.78)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <rect x="12" y="16" width="24" height="28" rx="7" fill="rgba(255,255,255,.92)"/>
      <rect x="17" y="31" width="14" height="10" rx="4" fill="rgba(94,59,30,.14)"/>
      <path d="M19.5 35.5 H28.5" stroke="rgba(255,255,255,.82)" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M17 24 H31" stroke="rgba(94,59,30,.08)" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

function HeaderMountains() {
  return (
    <svg width="100%" height="54" viewBox="0 0 387 54" preserveAspectRatio="none" style={{ display: 'block', marginTop: 10, position: 'relative', zIndex: 2 }}>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4A9EC7" stopOpacity=".12"/>
          <stop offset="50%" stopColor="#4A9EC7" stopOpacity=".22"/>
          <stop offset="100%" stopColor="#4A9EC7" stopOpacity=".08"/>
        </linearGradient>
      </defs>
      <rect width="387" height="54" fill="url(#skyGrad)"/>
      <path d="M0 54 L0 32 L48 18 L88 28 L138 7 L178 22 L224 4 L268 21 L314 10 L358 20 L387 14 L387 54 Z" fill="rgba(74,158,199,.2)"/>
      <path d="M138 7 L154 23 L122 23 Z" fill="rgba(126,191,46,.28)"/>
      <path d="M224 4 L242 20 L206 20 Z" fill="rgba(126,191,46,.22)"/>
      <path d="M0 54 L0 40 L44 26 L84 37 L133 19 L173 33 L219 17 L263 32 L309 22 L353 32 L387 25 L387 54 Z" fill="#0B1E2B"/>
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M1 1 L7 7 L1 13" stroke="#C6BFB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function AppMenu({ lang, user, onSignIn, onSignOut, onNavigate, bookings = [] }) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const menuWidth = isMobile ? 'min(76vw, 320px)' : 380;

  const NavItem = ({ icon, label, subtitle, onClick, href }) => {
    const isLink = !!href;
    const Tag = isLink ? 'a' : 'button';
    const props = isLink
      ? { href, target: '_blank', rel: 'noopener noreferrer' }
      : { onClick: () => { onClick?.(); setOpen(false); } };

    return (
      <Tag {...props} style={{
        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
        padding: '11px 10px', borderRadius: 18, border: 'none', cursor: 'pointer',
        background: 'transparent', textDecoration: 'none', textAlign: 'left',
        transition: 'background .13s', color: '#0F2030', marginTop: 4,
      }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,.045)'}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          width: 56, height: 56, borderRadius: 16, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: '#1B5E7F', boxShadow: '0 3px 12px rgba(0,0,0,.18)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800,
            color: '#0F2030', textTransform: 'uppercase', letterSpacing: .3, lineHeight: 1.1,
          }}>{label}</div>
          <div style={{
            fontFamily: 'Nunito,system-ui', fontSize: 12.5, fontWeight: 500,
            color: '#7A8899', marginTop: 2,
          }}>{subtitle}</div>
        </div>
        <Chevron />
      </Tag>
    );
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 600,
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(11,30,43,.6)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,.12)',
          cursor: 'pointer', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 5,
          boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          transition: 'transform .15s, background .15s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(11,30,43,.85)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(11,30,43,.6)'; e.currentTarget.style.transform = ''; }}
      >
        <span style={{ width: 20, height: 2, background: '#fff', borderRadius: 1, display: 'block' }} />
        <span style={{ width: 20, height: 2, background: '#fff', borderRadius: 1, display: 'block' }} />
        <span style={{ width: 14, height: 2, background: 'rgba(255,255,255,.6)', borderRadius: 1, display: 'block' }} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 700,
            background: 'rgba(11,30,43,.45)', backdropFilter: 'blur(3px)',
            transition: 'opacity .25s', opacity: 1,
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 800,
        width: menuWidth, maxWidth: '100vw',
        background: '#FAF8F4',
        boxShadow: open ? '-8px 0 40px rgba(0,0,0,.2)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', WebkitOverflowScrolling: 'touch',
      }}>

        {/* Dark header */}
        <div style={{
          background: '#0B1E2B', flexShrink: 0, position: 'relative', overflow: 'hidden',
        }}>
          {/* Topo texture overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(-22deg, transparent, transparent 30px, rgba(255,255,255,.022) 30px, rgba(255,255,255,.022) 31px)',
          }} />
          {/* Sky glow */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 220, height: 110, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 80% 20%, rgba(74,158,199,.18) 0%, transparent 70%)',
          }} />

          {/* Logo + Label + Close */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '20px 22px 18px', position: 'relative', zIndex: 3,
          }}>
            <img src="/logo.png" alt="LPLA" style={{ height: 40, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.4))' }} />
            <span style={{
              fontFamily: 'Barlow Condensed,system-ui', fontSize: 24, fontWeight: 900,
              color: '#fff', textTransform: 'uppercase', letterSpacing: 2.5, flex: 1,
            }}>{L('Menú', 'Menu')}</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.15)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background .15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.18)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1.5 1.5 L11.5 11.5 M11.5 1.5 L1.5 11.5" stroke="rgba(255,255,255,.85)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Mountain silhouette */}
          <HeaderMountains />

          {/* Green accent bar */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, #4A6E1A, #7EBF2E 50%, #4A6E1A)', flexShrink: 0 }} />
        </div>

        {/* Sign-in / User section */}
        <div style={{ padding: '20px 18px 0', flexShrink: 0 }}>
          {user ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 14,
              background: 'rgba(27,94,127,.06)', border: '1.5px solid rgba(27,94,127,.1)',
            }}>
              {user.picture ? (
                <img src={user.picture} style={{ width: 40, height: 40, borderRadius: '50%' }} alt="" />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: '#1B5E7F',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: '#fff',
                }}>{(user.name || user.email || '?')[0].toUpperCase()}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 700,
                  color: '#0F2030', textTransform: 'uppercase', letterSpacing: .3,
                }}>{user.name || user.email}</div>
                {user.name && user.email && (
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: '#7A8899', marginTop: 1 }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onSignIn?.(); }}
              style={{
                width: '100%', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '0 20px', borderRadius: 14,
                border: '1.5px solid #DDD9D0', background: '#fff', cursor: 'pointer',
                boxShadow: '0 1px 6px rgba(0,0,0,.07)',
                transition: 'box-shadow .15s, transform .12s',
              }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,.07)'; e.currentTarget.style.transform = ''; }}
            >
              <GoogleIcon size={20} />
              <span style={{
                fontFamily: 'Nunito,system-ui', fontSize: 15, fontWeight: 700, color: '#1F1F1F',
              }}>{L('Iniciar sesión con Google', 'Log in with Google')}</span>
            </button>
          )}
        </div>

        {/* Navigate divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '18px 18px 12px', flexShrink: 0,
        }}>
          <div style={{ flex: 1, height: 1, background: '#E8E3DC' }} />
          <span style={{
            fontFamily: 'Barlow Condensed,system-ui', fontSize: 9.5, fontWeight: 800,
            letterSpacing: 2.4, textTransform: 'uppercase', color: '#AEA69C',
          }}>{L('Navegar', 'Navigate')}</span>
          <div style={{ flex: 1, height: 1, background: '#E8E3DC' }} />
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: '0 10px' }}>
          <NavItem
            icon={<MountainIcon />}
            label={L('Próximos Eventos', 'Upcoming Events')}
            subtitle={L('Explora nuestras aventuras', 'Explore our adventures')}
            onClick={() => onNavigate?.('/')}
          />
          <NavItem
            icon={<VolunteerIcon />}
            label={L('Ser Voluntario', 'Become a Volunteer')}
            subtitle={L('Únete al equipo LPLA', 'Join the LPLA team')}
            onClick={() => onNavigate?.('/volunteer')}
          />
          <NavItem
            icon={<ShopIcon />}
            label={L('Tienda', 'Shop')}
            subtitle="locoporlaaventura.com"
            href={STORE_URL}
          />

          {/* My Events — only when signed in */}
          {user && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 10px 8px',
              }}>
                <div style={{ flex: 1, height: 1, background: '#E8E3DC' }} />
                <span style={{
                  fontFamily: 'Barlow Condensed,system-ui', fontSize: 9.5, fontWeight: 800,
                  letterSpacing: 2.4, textTransform: 'uppercase', color: '#AEA69C',
                }}>{L('Mis Eventos', 'My Events')}</span>
                <div style={{ flex: 1, height: 1, background: '#E8E3DC' }} />
              </div>
              {bookings.length === 0 ? (
                <div style={{
                  padding: '12px 16px', fontFamily: 'Nunito,system-ui',
                  fontSize: 13, color: '#7A8899', lineHeight: 1.5,
                }}>
                  {L(
                    'Aún no tienes reservas. ¡Explora los eventos y reserva tu primera aventura!',
                    "You haven't booked any events yet. Explore events and book your first adventure!"
                  )}
                </div>
              ) : (
                bookings.map((b, i) => (
                  <NavItem
                    key={i}
                    icon={<MountainIcon />}
                    label={b.title}
                    subtitle={b.date}
                    onClick={() => onNavigate?.(`/events/${b.slug}`)}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '18px 20px 30px', borderTop: '1px solid #EBE7DF',
          flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          marginTop: 'auto',
        }}>
          {user && (
            <button
              onClick={() => { onSignOut?.(); setOpen(false); }}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                border: '1.5px solid rgba(231,76,60,.2)', background: 'rgba(231,76,60,.04)',
                cursor: 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 13,
                fontWeight: 700, color: '#E74C3C', textTransform: 'uppercase', letterSpacing: .5,
                marginBottom: 6, transition: 'background .15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(231,76,60,.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(231,76,60,.04)'}
            >
              {L('Cerrar sesión', 'Sign Out')}
            </button>
          )}
          {/* Star row */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
              <svg key={i} width="7" height="7" viewBox="0 0 10 10">
                <polygon points="5,.5 6.16,3.54 9.51,3.54 6.86,5.73 7.94,8.79 5,6.64 2.06,8.79 3.14,5.73 .49,3.54 3.84,3.54" fill="#C8C0B5"/>
              </svg>
            ))}
          </div>
          <div style={{
            fontFamily: 'Nunito,system-ui', fontSize: 11, fontWeight: 500, color: '#B5ADA4',
          }}>
            © 2026 Loco Por La Aventura
          </div>
        </div>
      </div>
    </>
  );
}
