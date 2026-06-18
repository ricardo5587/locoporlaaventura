'use client'
import { useState } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { ADM, CAT_COLORS } from '@/lib/tokens'

const TODAY_STR = new Date().toISOString().slice(0, 10)

function soldN(ev) { return Math.max(0, (ev.totalSpots || 0) - (ev.spotsLeft || 0)) }
function mockViews(ev) { return 120 + ((ev.id || 0) % 17) * 43 + soldN(ev) * 4 }

function NavIconBtn({ label, icon, onClick, badge, dot }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseOver={() => setHov(true)} onMouseOut={() => setHov(false)} title={label}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: 'none', background: hov ? '#F1F5F9' : 'transparent', cursor: 'pointer', color: hov ? ADM.text : ADM.muted, transition: 'all .15s', flexShrink: 0 }}>
      <AdmIcon name={icon} size={16} color={hov ? ADM.text : ADM.muted} />
      {badge && <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700 }}>{badge}</span>}
      {dot && <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: ADM.danger, border: '2px solid #fff' }} />}
    </button>
  )
}

function EventDetailNav({ event, onBack, onEdit, onPreview }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  return (
    <div style={{ height: 56, background: '#fff', borderBottom: `1px solid ${ADM.border}`, display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative', zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderRight: `1px solid ${ADM.border}`, height: '100%', minWidth: 220 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: ADM.muted, padding: '4px 6px', borderRadius: 6, transition: 'color .15s' }}
          onMouseOver={e => e.currentTarget.style.color = ADM.text}
          onMouseOut={e => e.currentTarget.style.color = ADM.muted}>
          <AdmIcon name="chevronLeft" size={16} />
          <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5 }}>Events</span>
        </button>
      </div>

      <div style={{ flex: 1, padding: '0 20px', overflow: 'hidden' }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.titleEn}</div>
        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.light }}>{event.date} · {event.location}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 16px' }}>
        <NavIconBtn label="Updates" icon="clock" />
        <NavIconBtn label="View Event" icon="externalLink" badge="View" onClick={onPreview} />
        <div style={{ position: 'relative' }}>
          <NavIconBtn label="More" onClick={() => setMoreOpen(o => !o)} icon="dots" />
          {moreOpen && (
            <>
              <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 50, background: '#fff', borderRadius: 10, boxShadow: '0 8px 28px rgba(0,0,0,.14)', border: `1px solid ${ADM.border}`, minWidth: 160, overflow: 'hidden', marginTop: 4 }}>
                {[['Edit event', onEdit], ['Copy event'], ['Duplicate'], ['Archive'], ['Delete']].map(([item, fn]) => (
                  <button key={item} onClick={() => { setMoreOpen(false); fn && fn() }}
                    style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', textAlign: 'left', fontFamily: 'Nunito,system-ui', fontSize: 13, color: item === 'Delete' ? ADM.danger : ADM.text, cursor: 'pointer', fontWeight: 600, transition: 'background .12s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>{item}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <NavIconBtn label="Notifications" onClick={() => setNotifOpen(o => !o)} dot icon="bell" />
          {notifOpen && (
            <>
              <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50, background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,.14)', border: `1px solid ${ADM.border}`, width: 280, padding: '14px 0', overflow: 'hidden' }}>
                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1, padding: '0 16px 10px' }}>Notifications</div>
                {[
                  { icon: 'ticket', color: ADM.primary, msg: '2 new orders in the last hour', time: '5m ago' },
                  { icon: 'bolt', color: ADM.warning, msg: 'Only 3 spots left for this event', time: '1h ago' },
                  { icon: 'check', color: ADM.success, msg: 'Event published successfully', time: '2h ago' },
                ].map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 16px', borderTop: i > 0 ? `1px solid ${ADM.border}` : 'none', cursor: 'pointer', transition: 'background .12s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: `${n.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AdmIcon name={n.icon} size={16} color={n.color} /></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, fontWeight: 600, lineHeight: 1.4 }}>{n.msg}</div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.light, marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ width: 34, height: 34, borderRadius: '50%', marginLeft: 6, background: `linear-gradient(135deg,${ADM.primary},${ADM.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: '#fff' }}>A</div>
      </div>
    </div>
  )
}

function ProgressSteps({ steps }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${ADM.border}` }}>
      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, fontWeight: 700, color: ADM.light, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 10 }}>Progress</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: s.done ? ADM.success : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.done
                ? <AdmIcon name="check" size={11} color="#fff" strokeWidth={2.2} />
                : <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1' }} />}
            </div>
            <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: s.done ? 700 : 500, color: s.done ? ADM.text : ADM.muted, lineHeight: 1.3 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SidebarNav({ activeSection, setActiveSection }) {
  const [expanded, setExpanded] = useState(['Dashboard', 'Attendees'])
  const toggle = id => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])
  const nav = [
    { id: 'Dashboard', icon: 'grid', children: [] },
    { id: 'Order Options', icon: 'clipboard', children: ['Form', 'Confirmation'] },
    { id: 'Finances', icon: 'card', children: ['Payouts', 'Offline', 'Refunds', 'Tax'] },
    { id: 'Marketing', icon: 'megaphone', children: ['Overview', 'Tracking Links', 'Pixels'] },
    { id: 'Attendees', icon: 'people', children: ['Orders', 'Guest Lists', 'Add / Email', 'Full List', 'Check-in'] },
    { id: 'Reporting', icon: 'chart', children: [] },
  ]
  return (
    <div style={{ padding: '8px 0' }}>
      {nav.map(item => {
        const isExp = expanded.includes(item.id)
        const isActive = activeSection === item.id || item.children.includes(activeSection)
        const hasChildren = item.children.length > 0
        return (
          <div key={item.id}>
            <button onClick={() => { hasChildren ? toggle(item.id) : setActiveSection(item.id) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 16px', border: 'none', background: (!hasChildren && isActive) ? 'rgba(41,65,84,.08)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background .12s', borderLeft: isActive && !hasChildren ? `3px solid ${ADM.primary}` : '3px solid transparent' }}>
              <AdmIcon name={item.icon} size={16} color={isActive ? ADM.text : ADM.muted} />
              <span style={{ flex: 1, fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? ADM.text : ADM.muted }}>{item.id}</span>
              {hasChildren && <AdmIcon name="chevronDown" size={12} color={ADM.light} style={{ transition: 'transform .2s', transform: isExp ? 'rotate(180deg)' : 'none' }} />}
            </button>
            {hasChildren && isExp && (
              <div style={{ paddingLeft: 16 }}>
                {item.children.map(child => {
                  const childActive = activeSection === child
                  return (
                    <button key={child} onClick={() => setActiveSection(child)}
                      style={{ display: 'block', width: '100%', padding: '7px 16px', border: 'none', borderLeft: childActive ? `2px solid ${ADM.primary}` : '2px solid transparent', background: childActive ? 'rgba(41,65,84,.07)' : 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: childActive ? 700 : 400, color: childActive ? ADM.primary : ADM.muted, transition: 'all .12s' }}
                      onMouseOver={e => { if (!childActive) e.currentTarget.style.color = ADM.text }}
                      onMouseOut={e => { if (!childActive) e.currentTarget.style.color = ADM.muted }}>{child}</button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SalesTable({ event }) {
  const tickets = event.tickets?.length ? event.tickets : [{ id: 'general', en: 'General Admission', price: event.price || 0 }]
  const totalSold = soldN(event)
  const perTicket = tickets.length > 1 ? Math.floor(totalSold / tickets.length) : totalSold
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: `1px solid ${ADM.border}` }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .4 }}>Sales by Ticket Type</div>
        <button style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.primary, background: 'transparent', border: 'none', cursor: 'pointer' }}>Full report →</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {['Ticket Type', 'Sold', 'Price', 'Status'].map(h => (
              <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${ADM.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map((t, i) => {
            const s = i === 0 ? perTicket + (totalSold - perTicket * tickets.length) : perTicket
            const isSoldOut = event.spotsLeft === 0
            return (
              <tr key={t.id || i} style={{ borderBottom: i < tickets.length - 1 ? `1px solid ${ADM.border}` : 'none' }}
                onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 18px', fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, color: ADM.text }}>{t.en}</td>
                <td style={{ padding: '12px 18px', fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, color: ADM.text }}>{s}</td>
                <td style={{ padding: '12px 18px', fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, color: t.price === 0 ? ADM.light : ADM.primary }}>{t.price === 0 ? 'Free' : `$${t.price}`}</td>
                <td style={{ padding: '12px 18px' }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 16, fontSize: 11, fontWeight: 700, fontFamily: 'Barlow Condensed,system-ui', textTransform: 'uppercase', letterSpacing: .4, background: isSoldOut ? `${ADM.danger}18` : `${ADM.success}18`, color: isSoldOut ? ADM.danger : ADM.success }}>{isSoldOut ? 'Sold Out' : 'On Sale'}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EventDashboardMain({ event, activeSection }) {
  const totalSold = soldN(event)
  const paidSold = event.isFree ? 0 : totalSold
  const freeSold = event.isFree ? totalSold : 0
  const views = mockViews(event)
  const eventUrl = `https://lpla.org/events/${(event.titleEn || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const [copied, setCopied] = useState(false)
  function copyUrl() { navigator.clipboard?.writeText(eventUrl); setCopied(true); setTimeout(() => setCopied(false), 1800) }

  if (activeSection !== 'Dashboard') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, background: ADM.bg }}>
        <div style={{ background: ADM.card, borderRadius: ADM.radiusLg, border: `1px solid ${ADM.border}`, padding: '48px 56px', textAlign: 'center', maxWidth: 420 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><AdmIcon name="mountain" size={42} color={ADM.light} strokeWidth={1.5} /></div>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 22, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>{activeSection}</div>
          <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, lineHeight: 1.6 }}>This module is coming soon. Your event data is already wired in — build the UI here.</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', background: ADM.bg }}>
      {/* Event Link */}
      <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Event Link</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, background: '#F8FAFC', borderRadius: 8, border: `1px solid ${ADM.border}`, padding: '9px 14px', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{eventUrl}</div>
          <button onClick={copyUrl} style={{ padding: '9px 16px', borderRadius: 8, border: `1px solid ${copied ? ADM.green : ADM.border}`, background: copied ? ADM.green : '#fff', color: copied ? '#fff' : ADM.text, fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>{copied ? 'Copied!' : 'Copy'}</button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '20px 22px', gridColumn: 'span 2' }}>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Tickets Sold</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 48, fontWeight: 800, color: ADM.text, lineHeight: 1 }}>{totalSold}</div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted }}>of {event.totalSpots} capacity</div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: '#E2E8F0', marginBottom: 14 }}>
            <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(100, (totalSold / Math.max(1, event.totalSpots)) * 100)}%`, background: event.spotsLeft === 0 ? ADM.danger : ADM.success, transition: 'width .4s' }} />
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['primary', paidSold, 'paid'], ['green', freeSold, 'free'], ['#E2E8F0', event.spotsLeft, 'remaining']].map(([c, v, l], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: ADM[c] || c, flexShrink: 0 }} />
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted }}><strong style={{ color: ADM.text }}>{v}</strong> {l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Page Views</div>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 48, fontWeight: 800, color: ADM.text, lineHeight: 1, marginBottom: 6 }}>{views.toLocaleString()}</div>
          <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light }}>{totalSold > 0 ? `${((totalSold / views) * 100).toFixed(1)}% conversion` : 'No conversions yet'}</div>
          <svg viewBox="0 0 100 30" style={{ width: '100%', height: 36, marginTop: 10 }}>
            <polyline points="0,25 15,20 30,22 45,15 60,18 75,10 85,8 100,5" fill="none" stroke={ADM.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="0,25 15,20 30,22 45,15 60,18 75,10 85,8 100,5 100,30 0,30" fill={`${ADM.primary}12`} />
          </svg>
        </div>
      </div>

      {/* Recommendation + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: `linear-gradient(135deg,${ADM.primary}12,${ADM.green}10)`, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.primary}20`, padding: '18px 20px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: ADM.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AdmIcon name="bulb" size={22} color="#fff" /></div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 4 }}>
                {event.spotsLeft <= 5 && event.spotsLeft > 0 ? 'Almost Sold Out!' : totalSold === 0 ? 'Boost Visibility' : 'View Check-ins'}
              </div>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, lineHeight: 1.5, marginBottom: 12 }}>
                {event.spotsLeft <= 5 && event.spotsLeft > 0
                  ? `Only ${event.spotsLeft} spot${event.spotsLeft > 1 ? 's' : ''} left. Share now to fill the event!`
                  : totalSold === 0 ? 'No tickets sold yet. Share the event link or run a promotion.'
                  : `${totalSold} attendees registered. Start managing check-ins before the event.`}
              </div>
              <button style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: ADM.primary, color: '#fff', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(41,65,84,.25)', transition: 'transform .15s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.currentTarget.style.transform = ''}>
                {event.spotsLeft <= 5 && event.spotsLeft > 0 ? 'Share Event' : totalSold === 0 ? 'Marketing Overview' : 'View Check-ins'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '18px 20px' }}>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Attendees Report', icon: 'people', desc: 'Full list with contact info' },
              { label: 'Order Form Responses', icon: 'clipboard', desc: 'View all form submissions' },
            ].map(action => (
              <button key={action.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, border: `1px solid ${ADM.border}`, background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = ADM.primary }}
                onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = ADM.border }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: `${ADM.primary}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AdmIcon name={action.icon} size={18} color={ADM.primary} /></span>
                <div>
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: ADM.text }}>{action.label}</div>
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.light }}>{action.desc}</div>
                </div>
                <AdmIcon name="chevronRight" size={15} color={ADM.muted} style={{ marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <SalesTable event={event} />
    </div>
  )
}

export default function EventDetailDashboard({ event, onBack, onEdit, onPreview }) {
  const [activeSection, setActiveSection] = useState('Dashboard')
  const STATUS_COLOR = { active: ADM.success, past: ADM.light, draft: ADM.warning, full: ADM.danger }
  const statusKey = event.draft ? 'draft' : event.date < TODAY_STR ? 'past' : event.spotsLeft === 0 ? 'full' : 'active'
  const statusLabel = { active: 'Active', past: 'Past', draft: 'Draft', full: 'Sold Out' }
  const catColor = CAT_COLORS[event.category] || ADM.primary

  const progressSteps = [
    { label: 'Build page', done: true },
    { label: 'Add tickets', done: (event.tickets || []).length > 0 },
    { label: 'Publish', done: !event.draft },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <EventDetailNav event={event} onBack={onBack} onEdit={onEdit} onPreview={onPreview} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside style={{ width: 230, flexShrink: 0, background: '#fff', borderRight: `1px solid ${ADM.border}`, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div style={{ padding: '16px', borderBottom: `1px solid ${ADM.border}` }}>
            <div style={{ height: 90, borderRadius: 10, marginBottom: 12, overflow: 'hidden', background: event.image ? undefined : `linear-gradient(135deg,${catColor}22,${catColor}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${catColor}30` }}>
              {event.image
                ? <img src={event.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: catColor, textTransform: 'uppercase', letterSpacing: .5, textAlign: 'center', padding: '0 10px' }}>{event.category}</div>}
            </div>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, lineHeight: 1.2, marginBottom: 5 }}>{event.titleEn}</div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.muted, marginBottom: 8, lineHeight: 1.5 }}>{event.date} · {event.time}<br />{event.location}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 12, background: `${STATUS_COLOR[statusKey]}18`, color: STATUS_COLOR[statusKey], fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5 }}>{statusLabel[statusKey]}</span>
            </div>
            <button onClick={onEdit} style={{ width: '100%', padding: '7px 0', borderRadius: 8, border: `1px solid ${ADM.primary}`, background: 'transparent', color: ADM.primary, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
              onMouseOver={e => { e.currentTarget.style.background = ADM.primary; e.currentTarget.style.color = '#fff' }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = ADM.primary }}>Edit Event</button>
          </div>
          <ProgressSteps steps={progressSteps} />
          <SidebarNav activeSection={activeSection} setActiveSection={setActiveSection} />
        </aside>
        <EventDashboardMain event={event} activeSection={activeSection} />
      </div>
    </div>
  )
}
