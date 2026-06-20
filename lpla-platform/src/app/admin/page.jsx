'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdmIcon from '@/components/admin/AdmIcon'
import { ADM } from '@/lib/tokens'
import DashboardOverview from '@/components/admin/Overview'
import AttendeesBookings from '@/components/admin/Attendees'
import AdminCRM from '@/components/admin/Contacts'
import AdminApps from '@/components/admin/Apps'
import AdminUsers from '@/components/admin/Users'
import AdminInstall from '@/components/admin/Launch'
import EventManager from '@/components/admin/Events'
import EventDetailDashboard from '@/components/admin/EventDetail'
import AdminSettings from '@/components/admin/Settings'
import AdminHomepage from '@/components/admin/Homepage'
import AdminKlaviyo from '@/components/admin/Klaviyo'

const API = 'https://locoporlaaventura.vercel.app'
const IDLE_TIMEOUT = 30 * 60 * 1000

function parseJwtPayload(token) {
  try { return JSON.parse(atob(token.split('.')[1])) } catch { return null }
}

function NavItem({ icon, label, active, onClick, badge, featured }) {
  const [hov, setHov] = useState(false)
  if (featured) {
    return (
      <button onClick={onClick}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '10px 16px', borderRadius: 10,
          border: `1px solid ${hov || active ? 'rgba(168,184,74,.5)' : 'rgba(168,184,74,.25)'}`,
          cursor: 'pointer', textAlign: 'left', background: 'transparent',
          color: hov || active ? ADM.navAccent : 'rgba(168,184,74,.6)',
          fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800,
          transition: 'all .18s', marginBottom: 2, marginTop: 6, letterSpacing: .5,
        }}>
        <AdmIcon name={icon} size={17} color={hov || active ? ADM.navAccent : 'rgba(168,184,74,.6)'} />
        <span style={{ flex: 1 }}>{label}</span>
        <AdmIcon name="chevronRight" size={13} color={hov || active ? ADM.navAccent : 'rgba(168,184,74,.4)'} />
      </button>
    )
  }
  return (
    <button onClick={onClick}
      onMouseOver={() => setHov(true)} onMouseOut={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%', padding: '10px 16px', borderRadius: 10,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        background: active ? '#2C3A2E' : hov ? 'rgba(255,255,255,.06)' : 'transparent',
        color: active ? ADM.navAccent : hov ? '#CBD5E1' : '#94A0A0',
        fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: active ? 700 : 500,
        transition: 'all .18s', marginBottom: 2,
      }}>
      <AdmIcon name={icon} size={19} style={{ opacity: active ? 1 : 0.85 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{ background: active ? ADM.navAccent : '#3A4651', color: active ? '#232B1A' : '#94A0A0',
          borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{badge}</span>
      )}
      {active && <div style={{ width: 3, height: 18, borderRadius: 2, background: ADM.navAccent, flexShrink: 0 }} />}
    </button>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePage, setActivePage] = useState('overview')
  const [currentEvent, setCurrentEvent] = useState(null)
  const [openEditEvent, setOpenEditEvent] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('lpla_admin_token')
    if (!t) { router.push('/admin/login'); return }
    setToken(t)
    setCurrentUser(parseJwtPayload(t))
    loadEvents(t)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('lpla_remember') === '1') return

    let timer
    function resetTimer() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        localStorage.removeItem('lpla_admin_token')
        router.push('/admin/login')
      }, IDLE_TIMEOUT)
    }
    const evts = ['mousedown', 'keydown', 'scroll', 'touchstart']
    evts.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      clearTimeout(timer)
      evts.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [router])

  async function loadEvents(t) {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/events`, { headers: { Authorization: `Bearer ${t}` } })
      const data = await r.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch { setError('Failed to load events') }
    setLoading(false)
  }

  function logout() {
    localStorage.removeItem('lpla_admin_token')
    localStorage.removeItem('lpla_remember')
    router.push('/admin/login')
  }

  function handlePreview() {
    window.open('https://locoporlaaventura-k1oz3.vercel.app', '_blank')
  }

  const navItems = [
    { id: 'homepage',  icon: 'camera',   label: 'Homepage' },
    { id: 'overview',  icon: 'chart',    label: 'Overview' },
    { id: 'events',    icon: 'calendar', label: 'Events', badge: events.length },
    { id: 'attendees', icon: 'people',   label: 'Attendees' },
    { id: 'crm',       icon: 'user',     label: 'Contacts' },
    { id: 'apps',      icon: 'apps',     label: 'Apps' },
    { id: 'klaviyo',   icon: 'mail',     label: 'Email' },
    { id: 'users',     icon: 'team',     label: 'Users' },
    { id: 'widget',    icon: 'download',  label: 'Install', featured: true },
  ]

  const avatarLetter = (currentUser?.name || currentUser?.email || 'A').trim().charAt(0).toUpperCase()
  const pageLabel = activePage === 'settings' ? 'Profile Settings' : (navItems.find(n => n.id === activePage) || {}).label || ''

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${ADM.bg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'Nunito,system-ui', background: ADM.bg, overflow: 'hidden' }}>

        {currentEvent ? (
          <EventDetailDashboard
            event={currentEvent}
            onBack={() => setCurrentEvent(null)}
            onEdit={() => { const ev = currentEvent; setCurrentEvent(null); setActivePage('events'); setOpenEditEvent(ev) }}
            onPreview={handlePreview}
          />
        ) : (
        <>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside style={{ position: 'relative', width: 240, flexShrink: 0, background: 'linear-gradient(176deg,#16262F 0%,#0E1A22 60%,#0B151C 100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10 }}>

          {/* Logo lockup */}
          <div style={{ position: 'relative', zIndex: 1, padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <img src="/logo.png" alt="LPLA" style={{ height: 38, width: 'auto', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.45))' }} onError={e => { e.target.style.display = 'none' }} />
              <div>
                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: .4, lineHeight: 1, maxWidth: 132 }}>Loco por la Aventura</div>
                <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9.5, color: '#7E8C7A', fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>Field Station · Admin</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ position: 'relative', zIndex: 1, padding: '16px 12px', flex: 1, overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, paddingLeft: 4 }}>
              <span style={{ width: 12, height: 1.5, background: '#5A6672' }} />
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 10, fontWeight: 800, color: '#6B7A6A', textTransform: 'uppercase', letterSpacing: 2 }}>Modules</div>
            </div>
            {navItems.map(item => (
              <NavItem key={item.id} {...item} active={activePage === item.id} onClick={() => setActivePage(item.id)} />
            ))}
          </nav>

          {/* Footer */}
          <div style={{ position: 'relative', zIndex: 1, padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,.07)' }}>
            {/* Admin user row + gear */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#294154,#546207)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{avatarLetter}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: '#CBD3D3' }}>{currentUser?.name || 'Admin'}</div>
                <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: '#7A8590', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email || ''}</div>
              </div>
              <button onClick={() => setActivePage('settings')} title="Profile settings"
                style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, border: `1px solid ${activePage === 'settings' ? 'rgba(168,184,74,.4)' : 'rgba(255,255,255,.12)'}`, background: activePage === 'settings' ? 'rgba(168,184,74,.18)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.22)' }}
                onMouseOut={e => { e.currentTarget.style.background = activePage === 'settings' ? 'rgba(168,184,74,.18)' : 'transparent'; e.currentTarget.style.borderColor = activePage === 'settings' ? 'rgba(168,184,74,.4)' : 'rgba(255,255,255,.12)' }}>
                <AdmIcon name="settings" size={15} color={activePage === 'settings' ? '#A8B84A' : '#64748B'} />
              </button>
            </div>

            {/* Preview Widget */}
            <div style={{ marginBottom: 6 }}>
              <button onClick={handlePreview}
                style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: '#64748B', fontFamily: 'Nunito,system-ui', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'color .15s' }}
                onMouseOver={e => e.currentTarget.style.color = '#94A3B8'}
                onMouseOut={e => e.currentTarget.style.color = '#64748B'}>
                <AdmIcon name="launch" size={14} /> Preview Widget
              </button>
            </div>

            {/* Log out */}
            <button onClick={logout}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(179,35,23,.25)', background: 'rgba(179,35,23,.08)', color: '#D98A84', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .15s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(179,35,23,.16)'; e.currentTarget.style.color = '#EFA9A3' }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(179,35,23,.08)'; e.currentTarget.style.color = '#D98A84' }}>
              <AdmIcon name="power" size={14} /> Log out
            </button>

            {/* Coordinate readout */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#A8B84A', flexShrink: 0 }} />
              <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 9.5, color: '#566270', letterSpacing: .5 }}>45.52°N 122.68°W · PORTLAND</span>
            </div>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────── */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Topbar */}
          <div style={{ background: '#fff', borderBottom: '1px solid #E3DBCB', padding: '13px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{ width: 9, height: 9, background: '#A8B84A', borderRadius: 2, transform: 'rotate(45deg)', flexShrink: 0 }} />
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, color: '#1B2A38', textTransform: 'uppercase', letterSpacing: .6 }}>
                {pageLabel}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 13px', borderRadius: 20, background: 'rgba(94,122,12,.1)', border: '1px solid rgba(94,122,12,.22)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5E7A0C', boxShadow: '0 0 0 3px rgba(94,122,12,.15)' }} />
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: '#46570F', fontWeight: 700 }}>Trail open · {events.length} events synced</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: ['crm', 'contacts'].includes(activePage) ? 'hidden' : 'auto', padding: ['crm', 'contacts', 'overview', 'attendees', 'apps', 'users', 'widget', 'settings', 'homepage', 'klaviyo'].includes(activePage) ? 0 : '28px 32px', background: ADM.bg, display: 'flex', flexDirection: 'column' }}>
            {activePage === 'homepage' && <AdminHomepage />}
            {activePage === 'overview' && <DashboardOverview events={events} onSelectEvent={() => setActivePage('events')} onGoEvents={() => setActivePage('events')} />}
            {activePage === 'attendees' && <AttendeesBookings events={events} />}
            {(activePage === 'crm' || activePage === 'contacts') && <AdminCRM events={events} />}
            {activePage === 'apps' && <AdminApps />}
            {activePage === 'klaviyo' && <AdminKlaviyo />}
            {activePage === 'users' && <AdminUsers currentUser={currentUser} />}
            {activePage === 'widget' && <AdminInstall onPreview={handlePreview} events={events} />}
            {activePage === 'settings' && <AdminSettings currentUser={currentUser} />}

            {activePage === 'events' && <EventManager events={events} token={token} loading={loading} onEventsChange={() => loadEvents(token)} onSelectEvent={ev => setCurrentEvent(ev)} openEditEvent={openEditEvent} onEditConsumed={() => setOpenEditEvent(null)} />}
          </div>
        </main>

        </>
        )}

      </div>
    </>
  )
}
