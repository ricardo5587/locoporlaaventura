'use client'
import { useState, useEffect, useMemo } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { OvKpi } from '@/components/admin/Overview'
import { ADM } from '@/lib/tokens'
import { admBuildOrders, admMoney, admDateShort, admTimeAgo } from '@/lib/admin-data'

const ATT_STATUS = {
  confirmed: { label: 'Confirmed', color: '#5E7A0C', bg: 'rgba(94,122,12,.13)' },
  'checked-in': { label: 'Checked in', color: '#3F6CA8', bg: 'rgba(94,139,189,.16)' },
  pending: { label: 'Pending', color: '#B07A12', bg: 'rgba(217,131,31,.15)' },
  cancelled: { label: 'Cancelled', color: '#8A8578', bg: 'rgba(138,133,120,.16)' },
  refunded: { label: 'Refunded', color: '#B32317', bg: 'rgba(179,35,23,.12)' },
}

function attKey(o) { return o.checkedIn ? 'checked-in' : o.status }

function AttBadge({ o }) {
  const m = ATT_STATUS[attKey(o)] || ATT_STATUS.confirmed
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 16, background: m.bg, color: m.color, fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .4 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color }} />{m.label}
    </span>
  )
}

const ATT_CAT = { Escalada: '#294154', Senderismo: '#546207', Taller: '#A54399', Keynote: '#5E8BBD', Social: '#D9831F', 'Expedición': '#B32317', Voluntario: '#00897A' }

function attExportCSV(rows) {
  const head = ['Name', 'Email', 'Event', 'Date', 'Ticket', 'Qty', 'Amount', 'Channel', 'Status', 'Order ID', 'Ordered']
  const lines = [head.join(',')]
  rows.forEach(o => {
    const f = [o.name, o.email, o.event.titleEn, o.event.date, o.ticketLabel, o.qty, o.amount, o.channel, ATT_STATUS[attKey(o)].label, 'LPLA-' + String(o.id).padStart(5, '0'), new Date(o.createdAt).toISOString().slice(0, 10)]
    lines.push(f.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(','))
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'lpla-attendees.csv'; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function OrderDrawer({ order, onClose, onAction }) {
  const [show, setShow] = useState(false)
  useEffect(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r) }, [])
  function close() { setShow(false); setTimeout(onClose, 240) }
  if (!order) return null
  const o = order
  const cat = ATT_CAT[o.event.category] || ADM.primary
  const isActive = o.status !== 'cancelled' && o.status !== 'refunded'
  const Row = ({ k, v }) =>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderTop: `1px solid ${ADM.border}` }}>
      <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted }}>{k}</span>
      <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: ADM.text, textAlign: 'right' }}>{v}</span>
    </div>
  return (
    <>
      <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,32,.4)', zIndex: 700, opacity: show ? 1 : 0, transition: 'opacity .24s' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px,94vw)', background: ADM.card, zIndex: 701, boxShadow: '-12px 0 40px rgba(0,0,0,.18)', display: 'flex', flexDirection: 'column', transform: show ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .26s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ padding: '20px 22px', borderBottom: `1px solid ${ADM.border}`, display: 'flex', alignItems: 'flex-start', gap: 13 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, background: `${cat}1a`, color: cat, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800 }}>{o.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 21, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, lineHeight: 1.1 }}>{o.name}</div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, marginTop: 2 }}>{o.email}</div>
            <div style={{ marginTop: 8 }}><AttBadge o={o} /></div>
          </div>
          <button onClick={close} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AdmIcon name="x" size={16} color={ADM.muted} />
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: ADM.bg, borderRadius: ADM.radius, padding: '12px 14px', marginBottom: 16 }}>
            <span style={{ width: 8, height: 38, borderRadius: 4, background: cat, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.event.titleEn}</div>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted, marginTop: 1 }}>{o.event.date} · {o.event.time} · {o.event.location}</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Order Summary</div>
          <Row k="Order ID" v={'LPLA-' + String(o.id).padStart(5, '0')} />
          <Row k="Ticket type" v={o.ticketLabel} />
          <Row k="Quantity" v={o.qty + ' × ' + (o.amount ? admMoney(o.amount / o.qty) : 'Free')} />
          <Row k="Total paid" v={o.amount ? admMoney(o.amount) : 'Free'} />
          <Row k="Sales channel" v={o.channel} />
          <Row k="Ordered" v={new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
          <div style={{ marginTop: 18, fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Communications</div>
          {[['mail', 'Confirmation email sent'], ['chat', 'SMS reminder scheduled 24h prior']].map(([ic, t]) =>
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0' }}>
              <AdmIcon name={ic} size={15} color={ADM.success} />
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.text }}>{t}</span>
              <AdmIcon name="check" size={14} color={ADM.success} style={{ marginLeft: 'auto' }} />
            </div>
          )}
        </div>
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${ADM.border}`, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isActive && !o.checkedIn &&
          <button onClick={() => onAction(o.id, 'checkin')} style={{ flex: 1, minWidth: 130, height: 44, borderRadius: ADM.radius, border: 'none', cursor: 'pointer', background: ADM.primary, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <AdmIcon name="check" size={16} color="#fff" /> Check in
            </button>
          }
          {isActive && o.checkedIn &&
          <button onClick={() => onAction(o.id, 'undo-checkin')} style={{ flex: 1, minWidth: 130, height: 44, borderRadius: ADM.radius, border: `1px solid ${ADM.blue}`, cursor: 'pointer', background: `${ADM.blue}12`, color: ADM.blue, fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <AdmIcon name="check" size={16} color={ADM.blue} /> Checked in · undo
            </button>
          }
          {isActive &&
          <button onClick={() => onAction(o.id, o.amount ? 'refund' : 'cancel')} style={{ flexShrink: 0, height: 44, padding: '0 18px', borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, cursor: 'pointer', background: ADM.card, color: ADM.danger, fontFamily: 'Nunito,system-ui', fontSize: 13.5, fontWeight: 700 }}>
              {o.amount ? 'Refund' : 'Cancel'}
            </button>
          }
          {!isActive &&
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, padding: '12px 0' }}>
              This order was {ATT_STATUS[o.status].label.toLowerCase()}.
            </div>
          }
        </div>
      </div>
    </>
  )
}

export default function AttendeesBookings({ events }) {
  const base = admBuildOrders(events)
  const [overrides, setOverrides] = useState({})
  const [search, setSearch] = useState('')
  const [evFilter, setEvFilter] = useState('all')
  const [stFilter, setStFilter] = useState('all')
  const [page, setPage] = useState(0)
  const [menuId, setMenuId] = useState(null)
  const [selected, setSelected] = useState(null)
  const PER = 25

  const orders = useMemo(() => base.map(o => overrides[o.id] ? { ...o, ...overrides[o.id] } : o), [base, overrides])

  function act(id, action) {
    setOverrides(ov => {
      const cur = { ...ov[id] }
      if (action === 'checkin') { cur.checkedIn = true; cur.status = 'confirmed' }
      else if (action === 'undo-checkin') cur.checkedIn = false
      else if (action === 'cancel') { cur.status = 'cancelled'; cur.checkedIn = false }
      else if (action === 'refund') { cur.status = 'refunded'; cur.checkedIn = false }
      return { ...ov, [id]: cur }
    })
    setMenuId(null)
    if (selected && selected.id === id) {
      setSelected(s => ({ ...s, ...(action === 'checkin' ? { checkedIn: true, status: 'confirmed' } : action === 'undo-checkin' ? { checkedIn: false } : action === 'cancel' ? { status: 'cancelled', checkedIn: false } : { status: 'refunded', checkedIn: false }) }))
    }
  }

  const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
  const attendees = activeOrders.reduce((s, o) => s + o.qty, 0)
  const revenue = activeOrders.reduce((s, o) => s + o.amount, 0)
  const checkedIn = orders.filter(o => o.checkedIn).reduce((s, o) => s + o.qty, 0)
  const cancelled = orders.filter(o => o.status === 'cancelled' || o.status === 'refunded').length

  const q = search.trim().toLowerCase()
  const filtered = orders.filter(o => {
    if (evFilter !== 'all' && o.eventId !== +evFilter) return false
    if (stFilter !== 'all' && attKey(o) !== stFilter) return false
    if (q && !(o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.event.titleEn.toLowerCase().includes(q))) return false
    return true
  })
  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const pg = Math.min(page, pages - 1)
  const rows = filtered.slice(pg * PER, pg * PER + PER)

  useEffect(() => { setPage(0) }, [search, evFilter, stFilter])

  const evOptions = events.slice().sort((a, b) => a.date.localeCompare(b.date))
  const selStyle = { height: 38, borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, padding: '0 30px 0 12px', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'><path d='M5 9l7 7 7-7'/></svg>\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflow: 'auto', background: ADM.bg }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', letterSpacing: .5 }}>Attendees &amp; Bookings</h1>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>{orders.length} orders across {events.length} events · synced from the widget</p>
        </div>
        <button onClick={() => attExportCSV(filtered)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: ADM.radius, border: 'none', background: ADM.primary, color: '#fff', cursor: 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, letterSpacing: .4, boxShadow: '0 4px 14px rgba(41,65,84,.28)' }}>
          <AdmIcon name="download" size={16} color="#fff" /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 18 }}>
        <OvKpi label="Total Attendees" value={attendees.toLocaleString()} icon="people" accent={ADM.primary} sub={`${activeOrders.length} active orders`} />
        <OvKpi label="Checked In" value={checkedIn.toLocaleString()} icon="check" accent={ADM.blue} sub={attendees ? `${Math.round(checkedIn / attendees * 100)}% of attendees` : '—'} />
        <OvKpi label="Revenue Collected" value={admMoney(revenue)} icon="dollar" accent={ADM.success} sub="Net of refunds" />
        <OvKpi label="Cancelled / Refunded" value={cancelled} icon="refund" accent={ADM.danger} sub="Across all events" />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: ADM.radius, padding: '0 12px', height: 38, border: `1px solid ${ADM.border}` }}>
          <AdmIcon name="search" size={15} color="#94A3B8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email or event…"
          style={{ border: 'none', outline: 'none', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, flex: 1, background: 'transparent' }} />
        </div>
        <select value={evFilter} onChange={e => setEvFilter(e.target.value)} style={{ ...selStyle, maxWidth: 230 }}>
          <option value="all">All events</option>
          {evOptions.map(e => <option key={e.id} value={e.id}>{e.titleEn}</option>)}
        </select>
        <select value={stFilter} onChange={e => setStFilter(e.target.value)} style={selStyle}>
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked-in">Checked in</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.light, marginLeft: 'auto' }}>{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
      </div>

      <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, overflow: 'visible' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
            <thead>
              <tr style={{ background: '#FAFAF7', borderBottom: `1px solid ${ADM.border}` }}>
                {['Attendee', 'Event', 'Ticket', 'Qty', 'Amount', 'Channel', 'Status', ''].map(h =>
                <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Qty' || h === 'Amount' ? 'right' : 'left', fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1.1, whiteSpace: 'nowrap' }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ?
              <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', fontFamily: 'Nunito,system-ui', fontSize: 15, color: ADM.light }}>No matching attendees.</td></tr> :
              rows.map(o => {
                const cat = ATT_CAT[o.event.category] || ADM.primary
                const isActive = o.status !== 'cancelled' && o.status !== 'refunded'
                return (
                  <tr key={o.id}
                  style={{ borderBottom: `1px solid ${ADM.border}`, cursor: 'pointer', transition: 'background .12s', opacity: isActive ? 1 : .62 }}
                  onClick={() => setSelected(o)}
                  onMouseOver={e => e.currentTarget.style.background = '#FAFAF7'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: `${cat}1a`, color: cat, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800 }}>{o.initials}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13.5, fontWeight: 700, color: ADM.text, whiteSpace: 'nowrap' }}>{o.name}</div>
                          <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11.5, color: ADM.light, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>{o.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', maxWidth: 200 }}>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 600, color: ADM.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.event.titleEn}</div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.light }}>{admDateShort(new Date(o.event.date + 'T12:00').getTime())}</div>
                    </td>
                    <td style={{ padding: '11px 16px', fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.muted, whiteSpace: 'nowrap' }}>{o.ticketLabel}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: ADM.text }}>{o.qty}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: o.amount ? ADM.text : ADM.light }}>{o.amount ? admMoney(o.amount) : 'Free'}</td>
                    <td style={{ padding: '11px 16px', fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted, whiteSpace: 'nowrap' }}>{o.channel}</td>
                    <td style={{ padding: '11px 16px' }}><AttBadge o={o} /></td>
                    <td style={{ padding: '11px 12px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, position: 'relative' }}>
                        {isActive && !o.checkedIn &&
                        <button onClick={() => act(o.id, 'checkin')} title="Check in"
                        style={{ padding: '5px 11px', borderRadius: 7, border: `1px solid ${ADM.primary}33`, background: `${ADM.primary}0d`, color: ADM.primary, cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}
                        onMouseOver={e => { e.currentTarget.style.background = ADM.primary; e.currentTarget.style.color = '#fff' }}
                        onMouseOut={e => { e.currentTarget.style.background = `${ADM.primary}0d`; e.currentTarget.style.color = ADM.primary }}>Check in</button>
                        }
                        {isActive && o.checkedIn &&
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', color: ADM.blue, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700 }}>
                            <AdmIcon name="check" size={13} color={ADM.blue} /> In
                          </span>
                        }
                        <button onClick={() => setMenuId(menuId === o.id ? null : o.id)} title="More"
                        style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${ADM.border}`, background: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AdmIcon name="dots" size={16} color={ADM.muted} />
                        </button>
                        {menuId === o.id &&
                        <>
                            <div onClick={() => setMenuId(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 50, background: '#fff', borderRadius: 10, border: `1px solid ${ADM.border}`, boxShadow: '0 8px 28px rgba(0,0,0,.14)', minWidth: 170, overflow: 'hidden', textAlign: 'left' }}>
                              {[
                            { l: 'View details', a: () => { setSelected(o); setMenuId(null) } },
                            { l: 'Resend confirmation', a: () => setMenuId(null) },
                            isActive && { l: o.amount ? 'Issue refund' : 'Cancel order', a: () => act(o.id, o.amount ? 'refund' : 'cancel'), danger: true }].filter(Boolean).map(m =>
                            <button key={m.l} onClick={m.a} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 600, color: m.danger ? ADM.danger : ADM.text }}
                            onMouseOver={e => e.currentTarget.style.background = '#F7F6F1'}
                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>{m.l}</button>
                            )}
                            </div>
                          </>
                        }
                      </div>
                    </td>
                  </tr>
                )
              })
              }
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: `1px solid ${ADM.border}`, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.muted }}>
            {filtered.length ? `${pg * PER + 1}–${Math.min(filtered.length, pg * PER + PER)} of ${filtered.length}` : '0 results'}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(Math.max(0, pg - 1))} disabled={pg === 0}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${ADM.border}`, background: '#fff', cursor: pg === 0 ? 'not-allowed' : 'pointer', opacity: pg === 0 ? .45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AdmIcon name="chevronLeft" size={15} color={ADM.muted} />
            </button>
            <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: ADM.text, minWidth: 64, textAlign: 'center', lineHeight: '32px' }}>{pg + 1} / {pages}</span>
            <button onClick={() => setPage(Math.min(pages - 1, pg + 1))} disabled={pg >= pages - 1}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${ADM.border}`, background: '#fff', cursor: pg >= pages - 1 ? 'not-allowed' : 'pointer', opacity: pg >= pages - 1 ? .45 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AdmIcon name="chevronRight" size={15} color={ADM.muted} />
            </button>
          </div>
        </div>
      </div>

      {selected && <OrderDrawer order={selected} onClose={() => setSelected(null)} onAction={act} />}
    </div>
  )
}
