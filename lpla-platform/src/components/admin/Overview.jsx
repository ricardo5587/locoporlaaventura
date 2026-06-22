'use client'
import { useState } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { ADM, CAT_COLORS } from '@/lib/tokens'
import { admBuildOrders, admWeekly, admGross, admSold, admMoney, admMoneyK, admDateShort, admTimeAgo } from '@/lib/admin-data'

function OvKpi({ label, value, sub, icon, accent, delta }) {
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <AdmIcon name={icon} size={14} color={accent} />
        <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.4, color: ADM.muted }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 38, fontWeight: 800, color: ADM.text, lineHeight: 1.1, letterSpacing: .5 }}>{value}</span>
        {delta != null &&
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'Nunito,system-ui', fontSize: 12.5, fontWeight: 800, color: delta >= 0 ? ADM.success : ADM.danger }}>
            <AdmIcon name="trend" size={13} color={delta >= 0 ? ADM.success : ADM.danger} style={{ transform: delta >= 0 ? 'none' : 'scaleY(-1)' }} />
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        }
      </div>
      <div style={{ height: 3, width: 32, borderRadius: 2, background: accent, marginTop: 12, opacity: .85 }} />
      {sub && <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted, marginTop: 9 }}>{sub}</div>}
    </div>
  )
}

function OvCard({ title, action, onAction, children, pad = 20, ADM }) {
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: `1px solid ${ADM.border}` }}>
        <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .5 }}>{title}</span>
        {action &&
        <button onClick={onAction} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 12.5, fontWeight: 700, color: ADM.primary, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {action} <AdmIcon name="chevronRight" size={13} color={ADM.primary} />
          </button>
        }
      </div>
      <div style={{ padding: pad, flex: 1 }}>{children}</div>
    </div>
  )
}

function OvSalesChart({ buckets, metric, ADM }) {
  const [hover, setHover] = useState(null)
  const vals = buckets.map(b => metric === 'revenue' ? b.revenue : b.tickets)
  const max = Math.max(1, ...vals)
  const fmt = v => metric === 'revenue' ? admMoneyK(v) : v.toLocaleString()
  return (
    <div>
      <div style={{ position: 'relative', height: 180, display: 'flex', alignItems: 'flex-end', gap: 8, paddingTop: 24 }}>
        {[0, .25, .5, .75, 1].map(g =>
        <div key={g} style={{ position: 'absolute', left: 0, right: 0, bottom: `${g * 100}%`, height: 1, background: g === 0 ? ADM.border : '#F0EEE6' }} />
        )}
        {buckets.map((b, i) => {
          const v = vals[i]
          const h = max ? v / max * 100 : 0
          const on = hover === i
          return (
            <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative', cursor: 'default', zIndex: 2 }}>
              {on &&
              <div style={{ position: 'absolute', bottom: `calc(${h}% + 8px)`, background: ADM.text, color: '#fff', fontFamily: 'Nunito,system-ui', fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap', zIndex: 5 }}>
                  {fmt(v)}
                </div>
              }
              <div style={{ width: '74%', maxWidth: 30, height: `${h}%`, minHeight: v > 0 ? 4 : 0, borderRadius: '5px 5px 0 0', background: on ? ADM.primary : `${ADM.primary}cc`, transition: 'background .15s' }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {buckets.map((b, i) =>
        <div key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'Nunito,system-ui', fontSize: 10, color: ADM.light }}>
            {i % 2 === 0 ? admDateShort(b.ts) : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export { OvKpi }

export default function DashboardOverview({ events, onSelectEvent, onGoEvents }) {
  const [metric, setMetric] = useState('revenue')
  const [range, setRange] = useState(90)

  const orders = admBuildOrders(events)
  const weeks = Math.round(range / 7)
  const buckets = admWeekly(orders, weeks)

  const live = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
  const grossCollected = live.reduce((s, o) => s + o.amount, 0)
  const ticketsSold = live.reduce((s, o) => s + o.qty, 0)
  const capacity = events.reduce((s, e) => s + (e.totalSpots || 0), 0)
  const fillRate = capacity ? Math.round(ticketsSold / capacity * 100) : 0
  const activeEvents = events.filter(e => !e.draft).length

  const b10 = admWeekly(orders, 10)
  const sumRange = (arr, a, b, key) => arr.slice(a, b).reduce((s, x) => s + x[key], 0)
  const revLast = sumRange(b10, 6, 10, 'revenue'), revPrev = sumRange(b10, 2, 6, 'revenue')
  const tkLast = sumRange(b10, 6, 10, 'tickets'), tkPrev = sumRange(b10, 2, 6, 'tickets')
  const pct = (a, b) => b > 0 ? Math.round((a - b) / b * 100) : null

  const cats = (() => {
    const catMap = {}
    events.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + admSold(e) })
    return Object.entries(catMap).sort((a, b) => b[1] - a[1])
  })()
  const catMax = Math.max(1, ...cats.map(c => c[1]))

  const recent = orders.slice(0, 6)
  const topEvents = events.slice().sort((a, b) => admGross(b) - admGross(a) || admSold(b) - admSold(a)).slice(0, 5)
  const attention = events.filter(e => !e.draft && e.spotsLeft <= 5).sort((a, b) => a.spotsLeft - b.spotsLeft).slice(0, 4)

  const periodRev = buckets.reduce((s, b) => s + b.revenue, 0)
  const periodTk = buckets.reduce((s, b) => s + b.tickets, 0)

  const seg = (opts, val, set) =>
    <div style={{ display: 'flex', gap: 2, background: '#F1EFE8', borderRadius: 9, padding: 3 }}>
      {opts.map(o =>
        <button key={o.v} onClick={() => set(o.v)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
          background: val === o.v ? '#fff' : 'transparent', color: val === o.v ? ADM.text : ADM.muted,
          fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: val === o.v ? 700 : 500,
          boxShadow: val === o.v ? '0 1px 3px rgba(0,0,0,.1)' : 'none', transition: 'all .15s' }}>{o.l}</button>
      )}
    </div>

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflow: 'auto', background: ADM.bg }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', letterSpacing: .5 }}>Dashboard Overview</h1>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>Loco Por La Aventura · {events.length} events · Portland, OR</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {seg([{ v: 30, l: '30d' }, { v: 60, l: '60d' }, { v: 90, l: '90d' }], range, setRange)}
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, background: ADM.card, cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: ADM.text }}>
            <AdmIcon name="download" size={15} color={ADM.muted} /> Export
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 16 }}>
        <OvKpi label="Gross Revenue" value={admMoney(grossCollected)} icon="dollar" accent={ADM.success} delta={pct(revLast, revPrev)} sub="Collected to date" ADM={ADM} />
        <OvKpi label="Tickets Sold" value={ticketsSold.toLocaleString()} icon="ticket" accent={ADM.primary} delta={pct(tkLast, tkPrev)} sub={`${orders.length} orders`} ADM={ADM} />
        <OvKpi label="Active Events" value={activeEvents} icon="calendar" accent={ADM.blue} sub={`${cats.length} categories`} ADM={ADM} />
        <OvKpi label="Avg. Fill Rate" value={fillRate + '%'} icon="people" accent={ADM.lime} sub={`${ticketsSold} of ${capacity.toLocaleString()} seats`} ADM={ADM} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>
        <OvCard title="Sales Over Time" ADM={ADM}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 30, fontWeight: 800, color: ADM.text, lineHeight: 1 }}>
                {metric === 'revenue' ? admMoney(periodRev) : periodTk.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted, marginTop: 3 }}>
                {metric === 'revenue' ? 'Revenue' : 'Tickets'} · last {range} days
              </div>
            </div>
            {seg([{ v: 'revenue', l: 'Revenue' }, { v: 'tickets', l: 'Tickets' }], metric, setMetric)}
          </div>
          <OvSalesChart buckets={buckets} metric={metric} ADM={ADM} />
        </OvCard>

        <OvCard title="Recent Bookings" action="All" onAction={onGoEvents} pad={0} ADM={ADM}>
          <div>
            {recent.map((o, i) =>
            <div key={o.id} onClick={() => onSelectEvent && onSelectEvent(o.event)}
            style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 20px', borderTop: i ? `1px solid ${ADM.border}` : 'none', cursor: 'pointer', transition: 'background .12s' }}
            onMouseOver={e => e.currentTarget.style.background = '#FAFAF7'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: `${CAT_COLORS[o.event.category] || ADM.primary}1a`, color: CAT_COLORS[o.event.category] || ADM.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800 }}>{o.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: ADM.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</div>
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11.5, color: ADM.light, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.event.titleEn}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: o.amount ? ADM.text : ADM.light }}>{o.amount ? admMoney(o.amount) : 'Free'}</div>
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 10.5, color: ADM.light }}>{admTimeAgo(o.createdAt)}</div>
                </div>
              </div>
            )}
          </div>
        </OvCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 16, marginBottom: 16 }}>
        <OvCard title="Top Performing Events" action="Manage" onAction={onGoEvents} pad={0} ADM={ADM}>
          <div>
            {topEvents.map((ev, i) => {
              const s = admSold(ev), cap = ev.totalSpots || 1, g = admGross(ev)
              return (
                <div key={ev.id} onClick={() => onSelectEvent && onSelectEvent(ev)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderTop: i ? `1px solid ${ADM.border}` : 'none', cursor: 'pointer', transition: 'background .12s' }}
                onMouseOver={e => e.currentTarget.style.background = '#FAFAF7'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: ADM.light, width: 16, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[ev.category] || ADM.primary, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14.5, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.titleEn}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: '#EFEDE5', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(100, s / cap * 100)}%`, background: CAT_COLORS[ev.category] || ADM.primary }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 70 }}>
                    <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: ev.isFree ? ADM.light : ADM.text }}>{ev.isFree ? 'Free' : admMoney(g)}</div>
                    <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.light }}>{s}/{cap} sold</div>
                  </div>
                </div>
              )
            })}
          </div>
        </OvCard>

        <OvCard title="Sales by Category" ADM={ADM}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cats.map(([cat, n]) =>
            <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: ADM.text }}>{cat}</span>
                  <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: ADM.muted }}>{n}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: '#EFEDE5', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, width: `${n / catMax * 100}%`, background: CAT_COLORS[cat] || ADM.primary, transition: 'width .4s' }} />
                </div>
              </div>
            )}
          </div>
        </OvCard>
      </div>

      {attention.length > 0 &&
      <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AdmIcon name="bolt" size={16} color={ADM.warning} />
            <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .5 }}>Needs Attention</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            {attention.map(ev => {
              const out = ev.spotsLeft === 0
              return (
                <div key={ev.id} onClick={() => onSelectEvent && onSelectEvent(ev)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: ADM.radius, border: `1px solid ${out ? `${ADM.danger}33` : `${ADM.warning}33`}`, background: out ? `${ADM.danger}0a` : `${ADM.warning}0a`, cursor: 'pointer' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: out ? `${ADM.danger}1a` : `${ADM.warning}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AdmIcon name={out ? 'ticket' : 'bolt'} size={18} color={out ? ADM.danger : ADM.warning} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.titleEn}</div>
                    <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: out ? ADM.danger : ADM.warning }}>
                      {out ? 'Sold out · add capacity?' : `Only ${ev.spotsLeft} spot${ev.spotsLeft > 1 ? 's' : ''} left`}
                    </div>
                  </div>
                  <AdmIcon name="chevronRight" size={16} color={ADM.light} />
                </div>
              )
            })}
          </div>
        </div>
      }
    </div>
  )
}
