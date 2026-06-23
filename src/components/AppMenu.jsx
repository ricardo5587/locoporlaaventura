import { useState, useEffect } from 'react';
import { WEB, useBreakpoint } from '../lib/tokens';

const STORE_URL = 'https://locoporlaaventura.com';

function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function AppMenu({ lang, user, onSignIn, onSignOut, onNavigate, bookings = [] }) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const L = (es, en) => lang === 'es' ? es : en;

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const menuWidth = isMobile ? '85vw' : 380;

  const MenuItem = ({ icon, label, subtitle, onClick, href, accent }) => {
    const isLink = !!href;
    const Tag = isLink ? 'a' : 'button';
    const props = isLink
      ? { href, target: '_blank', rel: 'noopener noreferrer' }
      : { onClick: () => { onClick?.(); setOpen(false); } };

    return (
      <Tag {...props} style={{
        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
        padding: '14px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'transparent', textDecoration: 'none', textAlign: 'left',
        transition: 'background .15s', color: WEB.text,
      }}
        onMouseOver={e => e.currentTarget.style.background = WEB.bgAlt}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: accent || 'rgba(27,94,127,.08)', fontSize: 18,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 700,
            color: WEB.text, textTransform: 'uppercase', letterSpacing: .3,
          }}>{label}</div>
          {subtitle && (
            <div style={{
              fontFamily: 'Nunito,system-ui', fontSize: 12, color: WEB.textMuted,
              marginTop: 1, lineHeight: 1.3,
            }}>{subtitle}</div>
          )}
        </div>
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ flexShrink: 0, opacity: .3 }}>
          <path d="M1 1l5 5-5 5" stroke={WEB.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
        background: '#fff',
        boxShadow: open ? '-8px 0 40px rgba(0,0,0,.2)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', WebkitOverflowScrolling: 'touch',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 20px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', borderBottom: `1px solid ${WEB.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" style={{ height: 36 }} alt="LPLA" />
            <span style={{
              fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800,
              color: WEB.teal, textTransform: 'uppercase', letterSpacing: .5,
            }}>Menu</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1px solid ${WEB.border}`, background: 'transparent',
              cursor: 'pointer', fontSize: 18, color: WEB.textMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{'×'}</button>
        </div>

        {/* User section */}
        <div style={{ padding: '16px 20px' }}>
          {user ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 14,
              background: 'rgba(27,94,127,.06)', border: `1.5px solid rgba(27,94,127,.1)`,
            }}>
              {user.picture ? (
                <img src={user.picture} style={{ width: 40, height: 40, borderRadius: '50%' }} alt="" />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: WEB.teal,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: '#fff',
                }}>{(user.name || user.email || '?')[0].toUpperCase()}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 700,
                  color: WEB.text, textTransform: 'uppercase', letterSpacing: .3,
                }}>{user.name || user.email}</div>
                {user.name && user.email && (
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: WEB.textMuted, marginTop: 1 }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onSignIn?.(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '12px 20px', borderRadius: 12,
                border: `1.5px solid ${WEB.border}`, background: '#fff', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,.08)',
                transition: 'box-shadow .15s, transform .15s',
              }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.08)'; e.currentTarget.style.transform = ''; }}
            >
              <GoogleIcon size={20} />
              <span style={{
                fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, color: WEB.text,
              }}>{L('Iniciar sesión con Google', 'Sign in with Google')}</span>
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: WEB.border, margin: '0 20px' }} />

        {/* Menu items */}
        <div style={{ padding: '12px 12px', flex: 1 }}>
          <MenuItem
            icon="🏔️"
            label={L('Próximos Eventos', 'Upcoming Events')}
            subtitle={L('Explora nuestras aventuras', 'Explore our adventures')}
            onClick={() => onNavigate?.('/')}
          />
          <MenuItem
            icon="🤝"
            label={L('Ser Voluntario', 'Become a Volunteer')}
            subtitle={L('Únete al equipo LPLA', 'Join the LPLA team')}
            onClick={() => onNavigate?.('/volunteer')}
          />
          <MenuItem
            icon="🛍️"
            label={L('Tienda', 'Shop')}
            subtitle="locoporlaaventura.com"
            href={STORE_URL}
          />

          {/* My Events — only when signed in */}
          {user && (
            <>
              <div style={{
                height: 1, background: WEB.border, margin: '8px 16px',
              }} />
              <div style={{
                padding: '8px 16px 6px', fontFamily: 'Barlow Condensed,system-ui',
                fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
                color: WEB.textLight,
              }}>
                {L('Mis Eventos', 'My Events')}
              </div>
              {bookings.length === 0 ? (
                <div style={{
                  padding: '12px 16px', fontFamily: 'Nunito,system-ui',
                  fontSize: 13, color: WEB.textMuted, lineHeight: 1.5,
                }}>
                  {L(
                    'Aún no tienes reservas. ¡Explora los eventos y reserva tu primera aventura!',
                    "You haven't booked any events yet. Explore events and book your first adventure!"
                  )}
                </div>
              ) : (
                bookings.map((b, i) => (
                  <MenuItem
                    key={i}
                    icon="🎟️"
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
          padding: '16px 20px', borderTop: `1px solid ${WEB.border}`,
          marginTop: 'auto',
        }}>
          {user && (
            <button
              onClick={() => { onSignOut?.(); setOpen(false); }}
              style={{
                width: '100%', padding: '10px', borderRadius: 10,
                border: `1.5px solid rgba(231,76,60,.2)`, background: 'rgba(231,76,60,.04)',
                cursor: 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 13,
                fontWeight: 700, color: '#E74C3C', textTransform: 'uppercase', letterSpacing: .5,
                marginBottom: 12, transition: 'background .15s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(231,76,60,.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(231,76,60,.04)'}
            >
              {L('Cerrar sesión', 'Sign Out')}
            </button>
          )}
          <div style={{
            fontFamily: 'Nunito,system-ui', fontSize: 11, color: WEB.textLight,
            textAlign: 'center', lineHeight: 1.5,
          }}>
            © 2026 Loco Por La Aventura
          </div>
        </div>
      </div>
    </>
  );
}
