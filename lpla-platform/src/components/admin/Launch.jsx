'use client'
import { useState } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'

const WIDGET_URL = 'https://locoporlaaventura-k1oz3.vercel.app'
const ORG_ID = 'lpla-001'

const STYLES = [
  {
    id: 'inline',
    icon: 'apps',
    title: 'Inline Embed',
    recommended: true,
    desc: 'Show the full events list right inside one of your web pages. Best for a dedicated "Events" or "Book" page.',
  },
  {
    id: 'popup',
    icon: 'launch',
    title: 'Popup Button',
    desc: 'Add a button anywhere. When clicked, the booking widget opens in a clean popup over your page.',
  },
  {
    id: 'bubble',
    icon: 'chat',
    title: 'Floating Bubble',
    desc: 'A floating "Book now" button sits in the corner of every page on your site. Always one tap away.',
  },
  {
    id: 'link',
    icon: 'globe',
    title: 'Direct Link',
    desc: 'No website? Share a hosted booking page link in your social bio, emails, or texts.',
  },
]

function snippetFor(style) {
  switch (style) {
    case 'inline':
      return `<!-- Loco Por La Aventura · booking widget -->
<div data-lpla-widget data-org="${ORG_ID}"></div>
<script src="${WIDGET_URL}/embed.js" async></script>`
    case 'popup':
      return `<!-- Loco Por La Aventura · popup button -->
<button data-lpla-widget data-org="${ORG_ID}" data-mode="popup">
  Book an Adventure
</button>
<script src="${WIDGET_URL}/embed.js" async></script>`
    case 'bubble':
      return `<!-- Loco Por La Aventura · floating bubble -->
<script src="${WIDGET_URL}/embed.js" data-org="${ORG_ID}" data-mode="bubble" async></script>`
    case 'link':
      return `${WIDGET_URL}/?org=${ORG_ID}`
    default:
      return ''
  }
}

function BrowserChrome({ ADM, url, children }) {
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${ADM.border}`, background: '#F8FAFC' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#CBD5E1' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#CBD5E1' }} />
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#CBD5E1' }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${ADM.border}`, borderRadius: 6, padding: '4px 10px', marginLeft: 6 }}>
          <AdmIcon name="lock" size={11} color={ADM.light} />
          <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light }}>{url}</span>
        </div>
      </div>
      {children}
    </div>
  )
}

function EventTiles({ ADM }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${ADM.border}` }}>
          <div style={{ height: 54, background: ['linear-gradient(135deg,#1B5E7F,#4A6E1A)', 'linear-gradient(135deg,#2D4D0E,#1B5E7F)', 'linear-gradient(135deg,#4A9EC7,#1B5E7F)'][i] }} />
          <div style={{ padding: '8px' }}>
            <div style={{ height: 6, width: '80%', background: '#E2E8F0', borderRadius: 3, marginBottom: 5 }} />
            <div style={{ height: 6, width: '55%', background: '#EDF1F5', borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PageSkeleton({ ADM }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ height: 10, width: '45%', background: '#E2E8F0', borderRadius: 4 }} />
      <div style={{ height: 6, width: '90%', background: '#EDF1F5', borderRadius: 3 }} />
      <div style={{ height: 6, width: '75%', background: '#EDF1F5', borderRadius: 3 }} />
      <div style={{ height: 6, width: '82%', background: '#EDF1F5', borderRadius: 3 }} />
    </div>
  )
}

function PreviewMock({ style, ADM }) {
  if (style === 'inline') {
    return (
      <BrowserChrome ADM={ADM} url="yoursite.com/events">
        <div style={{ padding: '20px', background: '#fff' }}>
          <div style={{ border: `2px dashed ${ADM.navAccent}`, borderRadius: ADM.radius, padding: '16px', background: 'rgba(168,184,74,.04)' }}>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 700, color: ADM.lime, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>↓ LPLA widget embedded here</div>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', marginBottom: 12 }}>Upcoming Adventures</div>
            <EventTiles ADM={ADM} />
          </div>
        </div>
      </BrowserChrome>
    )
  }

  if (style === 'popup') {
    return (
      <BrowserChrome ADM={ADM} url="yoursite.com">
        <div style={{ padding: '20px', background: '#fff', position: 'relative' }}>
          <PageSkeleton ADM={ADM} />
          <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 10px' }}>
            <span style={{ padding: '10px 20px', borderRadius: 10, background: ADM.navAccent, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(168,184,74,.35)' }}>Book an Adventure</span>
          </div>
          {/* dim + popup card */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,30,43,.45)', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ width: '88%', background: '#fff', borderRadius: 12, boxShadow: '0 18px 50px rgba(0,0,0,.3)', overflow: 'hidden' }}>
              <div style={{ height: 4, background: ADM.navAccent }} />
              <div style={{ padding: 14 }}>
                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', marginBottom: 10 }}>Upcoming Adventures</div>
                <EventTiles ADM={ADM} />
              </div>
            </div>
          </div>
        </div>
      </BrowserChrome>
    )
  }

  if (style === 'bubble') {
    return (
      <BrowserChrome ADM={ADM} url="yoursite.com">
        <div style={{ padding: '20px', background: '#fff', position: 'relative', minHeight: 180 }}>
          <PageSkeleton ADM={ADM} />
          <div style={{ marginTop: 14 }}><PageSkeleton ADM={ADM} /></div>
          {/* floating bubble */}
          <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 30, background: ADM.navAccent, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', boxShadow: '0 6px 18px rgba(168,184,74,.45)' }}>
            <AdmIcon name="calendar" size={15} />
            Book Now
          </div>
        </div>
      </BrowserChrome>
    )
  }

  // link
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '24px 20px', background: 'linear-gradient(135deg,#1C2630,#22301F)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 700, color: '#A8B84A', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Share this link anywhere</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '10px 14px' }}>
          <AdmIcon name="globe" size={14} color="#A8B84A" />
          <span style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12.5, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{`${WIDGET_URL}/?org=${ORG_ID}`}</span>
        </div>
      </div>
      <div style={{ padding: '16px 20px', background: '#fff' }}>
        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.muted, lineHeight: 1.5, marginBottom: 12 }}>Drop it in your Instagram bio, WhatsApp, email signature or a text. Opens a full hosted booking page — no website needed.</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Instagram', 'WhatsApp', 'Email'].map(p => (
            <span key={p} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#F1F5F9', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted }}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminLaunch({ ADM }) {
  const [style, setStyle] = useState('inline')
  const [copied, setCopied] = useState(false)

  const snippet = snippetFor(style)

  function copy() {
    navigator.clipboard?.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function openPreview() {
    window.open(WIDGET_URL, '_blank', 'noreferrer')
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1C2630 0%,#2B353F 55%,#22301F 100%)', borderRadius: ADM.radiusLg, padding: '36px 40px', marginBottom: 30, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,184,74,.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, position: 'relative' }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#A8B84A', marginBottom: 10 }}>Add to your website in 2 minutes</div>
            <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 38, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: .5, lineHeight: 1.05, margin: '0 0 14px' }}>It's one line of HTML</h1>
            <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.65, margin: 0 }}>
              Copy a small code snippet and paste it into your website — just like a YouTube video or a Calendly link. The widget loads your live events, takes bookings and payments, and sends everything straight back to this dashboard. No coding or updates required.
            </p>
          </div>
          <button onClick={openPreview} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: ADM.radiusMd, border: '1px solid rgba(168,184,74,.4)', background: 'rgba(168,184,74,.12)', color: '#A8B84A', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .8, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <AdmIcon name="launch" size={18} />
            Live Preview
          </button>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 28, position: 'relative' }}>
          {[
            ['1', 'Pick a style', 'Inline, popup, bubble or link'],
            ['2', 'Copy the snippet', 'One click'],
            ['3', 'Paste & publish', 'On any website builder'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: ADM.radiusMd, padding: '14px 18px' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#A8B84A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: '#1C2630' }}>{n}</div>
              <div>
                <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, color: '#fff' }}>{t}</div>
                <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: choose style */}
      <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: ADM.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>1 · Choose how it appears</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 30 }}>
        {STYLES.map(s => {
          const active = style === s.id
          return (
            <button key={s.id} onClick={() => setStyle(s.id)} style={{
              textAlign: 'left', cursor: 'pointer', background: ADM.card,
              border: `2px solid ${active ? ADM.navAccent : ADM.border}`,
              borderRadius: ADM.radiusMd, padding: '18px 18px 20px', position: 'relative',
              boxShadow: active ? '0 6px 18px rgba(168,184,74,.18)' : 'none', transition: 'all .15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: active ? 'rgba(168,184,74,.16)' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? ADM.lime : ADM.muted }}>
                  <AdmIcon name={s.icon} size={18} />
                </div>
                {s.recommended && (
                  <span style={{ marginLeft: 'auto', background: ADM.navAccent, color: '#fff', borderRadius: 12, padding: '2px 9px', fontFamily: 'Barlow Condensed,system-ui', fontSize: 10, fontWeight: 800, letterSpacing: .6, textTransform: 'uppercase' }}>Recommended</span>
                )}
              </div>
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 18, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, lineHeight: 1.5 }}>{s.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Step 2 + preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Snippet */}
        <div>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: ADM.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>2 · Copy this snippet</div>
          <div style={{ background: '#1C2630', borderRadius: ADM.radiusMd, overflow: 'hidden', border: `1px solid ${ADM.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FF5F56' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#27C93F' }} />
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: 'rgba(255,255,255,.4)', marginLeft: 8 }}>your page</span>
              </div>
              <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 7, border: 'none', background: copied ? ADM.success : 'rgba(168,184,74,.18)', color: copied ? '#fff' : '#A8B84A', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <AdmIcon name={copied ? 'check' : 'note'} size={13} />
                {copied ? 'Copied!' : 'Copy code'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '16px 18px', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, lineHeight: 1.7, color: '#C8D6A8', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{snippet}</pre>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 14, background: '#F1F5F9', borderRadius: ADM.radius, padding: '12px 14px' }}>
            <AdmIcon name="bolt" size={16} color={ADM.warning} />
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.muted, lineHeight: 1.5 }}>
              Paste this into your site builder's "Embed" or "Custom HTML" block (Wix, Squarespace, WordPress, Webflow, etc.). Your events update automatically — you never have to touch the code again.
            </div>
          </div>
        </div>

        {/* Preview mock */}
        <div>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: ADM.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Preview · How it looks</div>
          <PreviewMock style={style} ADM={ADM} />
          <button onClick={openPreview} style={{ width: '100%', marginTop: 14, padding: '11px', borderRadius: ADM.radius, border: `1px solid ${ADM.primary}30`, background: `${ADM.primary}0D`, color: ADM.primary, fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <AdmIcon name="launch" size={15} />
            Open Full Preview
          </button>
        </div>
      </div>
    </div>
  )
}
