'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ADM } from '@/lib/tokens'
import AdmIcon from '@/components/admin/AdmIcon'

const API = 'https://locoporlaaventura.vercel.app'

const SLIDE_ACCENTS = ['#2D7A4F', '#4A6E1A', '#5C3B1E', '#1B5E7F']

const SLIDE_HINTS = [
  'Any adventure photo works great here — climbing, hiking, landscapes. Use a wide landscape shot at 1600×900px or larger for best quality.',
  'Trails, summits, sunrise views, or action shots from your events.',
  'Community moments, group shots, socials — show the people of LPLA.',
  'Big landscapes, multi-day expeditions, or your most dramatic scenery.',
]

const TIPS = [
  { icon: 'camera', title: 'Go landscape', body: 'Wide, horizontal photos fill the hero without awkward cropping.' },
  { icon: 'people', title: 'Show real adventures', body: 'Authentic shots of your events and community outperform stock photos.' },
  { icon: 'eye', title: 'Mind the center', body: 'Keep key subjects off-center — the logo and title sit over the middle.' },
  { icon: 'check', title: 'High resolution', body: 'Use sharp, well-lit images at least 1600px wide so they stay crisp.' },
]

function Toast({ message, onDone }) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVis(true))
    const t = setTimeout(() => { setVis(false); setTimeout(onDone, 200) }, 2600)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${vis ? 0 : 8}px)`, opacity: vis ? 1 : 0, background: '#1E2A35', color: '#fff', fontFamily: 'Nunito,system-ui', fontSize: 13.5, fontWeight: 600, padding: '11px 20px', borderRadius: 24, boxShadow: '0 8px 28px rgba(0,0,0,.24)', display: 'flex', alignItems: 'center', gap: 8, zIndex: 9999, transition: 'opacity .2s ease, transform .2s ease', whiteSpace: 'nowrap' }}>
      <AdmIcon name="check" size={15} color="#7EBF2E" />
      {message}
    </div>
  )
}

function HeroSlotCard({ slide, accent, hint, onUpload, onRemove, uploading }) {
  const [dragOver, setDragOver] = useState(false)
  const [hov, setHov] = useState(false)
  const inputRef = useRef(null)
  const n = slide.id

  function handleFiles(files) {
    if (files && files.length > 0) onUpload(files[0])
  }

  return (
    <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${ADM.border}` }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: `${accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 700, color: accent }}>{n}</div>
        <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: '#1E2A35', textTransform: 'uppercase', letterSpacing: .3, flex: 1 }}>Slide {n}</span>
        <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 11.5, color: ADM.muted }}>Slide {n}</span>
      </div>

      {/* Drop zone */}
      <div style={{ padding: 14 }}>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => !slide.image_url && inputRef.current?.click()}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{ position: 'relative', height: 168, borderRadius: 10, border: `2px dashed ${dragOver ? accent : slide.image_url ? 'transparent' : '#D1D5DB'}`, background: dragOver ? `${accent}0d` : slide.image_url ? '#000' : '#FAFAF8', cursor: uploading ? 'wait' : 'pointer', overflow: 'hidden', transition: 'border-color .15s, background .15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

          {uploading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, border: '3px solid #E0DDD5', borderTopColor: accent, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted }}>Uploading…</span>
            </div>
          )}

          {!uploading && !slide.image_url && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <AdmIcon name="camera" size={28} color="#D1D5DB" />
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted }}>Drop a Slide {n} photo</span>
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light }}>or <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>browse files</span></span>
            </div>
          )}

          {!uploading && slide.image_url && (
            <>
              <img src={slide.image_url} alt={`Slide ${n}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              {hov && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <button onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                    style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: 'Nunito,system-ui', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Replace</button>
                  <button onClick={e => { e.stopPropagation(); onRemove() }}
                    style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid rgba(179,35,23,.5)`, background: 'rgba(179,35,23,.2)', backdropFilter: 'blur(6px)', color: '#FCA5A5', fontFamily: 'Nunito,system-ui', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Hint */}
        <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted, lineHeight: 1.5, marginTop: 12 }}>
          💡 {hint}
        </p>
      </div>
    </div>
  )
}

export default function AdminHomepage() {
  const [slides, setSlides] = useState([
    { id: 1, image_url: null }, { id: 2, image_url: null },
    { id: 3, image_url: null }, { id: 4, image_url: null },
  ])
  const [uploading, setUploading] = useState({})
  const [toast, setToast] = useState(null)
  const [tipsOpen, setTipsOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('lpla_admin_token')
    if (!token) return
    fetch(`${API}/api/admin/hero-slides`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSlides(data) })
      .catch(() => {})
  }, [])

  const handleUpload = useCallback(async (slideId, file) => {
    const token = localStorage.getItem('lpla_admin_token')
    if (!token) return
    setUploading(u => ({ ...u, [slideId]: true }))
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch(`${API}/api/admin/hero-slides/${slideId}/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      })
      const data = await r.json()
      if (!r.ok) {
        setToast(data.error || 'Upload failed')
      } else if (data.imageUrl) {
        setSlides(s => s.map(sl => sl.id === slideId ? { ...sl, image_url: data.imageUrl } : sl))
        setToast(`Slide ${slideId} updated`)
      }
    } catch (err) { setToast('Upload failed: ' + err.message) }
    setUploading(u => ({ ...u, [slideId]: false }))
  }, [])

  const handleRemove = useCallback(async (slideId) => {
    const token = localStorage.getItem('lpla_admin_token')
    if (!token) return
    try {
      await fetch(`${API}/api/admin/hero-slides/${slideId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      setSlides(s => s.map(sl => sl.id === slideId ? { ...sl, image_url: null } : sl))
      setToast(`Slide ${slideId} cleared`)
    } catch { setToast('Remove failed') }
  }, [])

  return (
    <div style={{ padding: '28px 32px', overflow: 'auto', flex: 1 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: '#1E2A35', textTransform: 'uppercase', letterSpacing: .5, margin: 0 }}>Homepage</h1>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>Customize the photos in your public booking-page hero carousel.</p>
        </div>
        <button onClick={() => window.open('https://locoporlaaventura-k1oz3.vercel.app', '_blank')}
          style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${ADM.border}`, background: ADM.card, color: ADM.text, fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
          <AdmIcon name="launch" size={14} /> View live homepage
        </button>
      </div>

      {/* Info banner */}
      <div style={{ background: 'rgba(74,136,192,.10)', border: '1px solid rgba(74,136,192,.33)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(74,136,192,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AdmIcon name="camera" size={18} color="#4A88C0" />
        </div>
        <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 13.5, color: ADM.text, lineHeight: 1.55, margin: 0 }}>
          <strong>Drag a photo onto any slide</strong> (or click to browse). Changes save automatically and appear on your live homepage right away. Until you add your own, each slide shows an on-brand illustrated placeholder. For best results use <strong>landscape photos, 1600×900px or larger</strong>.
        </p>
      </div>

      {/* Section label */}
      <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: ADM.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 12, height: 1.5, background: ADM.muted }} />
        Hero carousel · 4 slides
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
        {slides.map((slide, i) => (
          <HeroSlotCard
            key={slide.id}
            slide={slide}
            accent={SLIDE_ACCENTS[i]}
            hint={SLIDE_HINTS[i]}
            uploading={!!uploading[slide.id]}
            onUpload={file => handleUpload(slide.id, file)}
            onRemove={() => handleRemove(slide.id)}
          />
        ))}
      </div>

      {/* Photo tips */}
      <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
        <button onClick={() => setTipsOpen(o => !o)}
          style={{ width: '100%', padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
          <AdmIcon name="camera" size={17} color={ADM.muted} />
          <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .5, flex: 1 }}>Photo tips</span>
          <AdmIcon name="chevronRight" size={14} color={ADM.muted} style={{ transform: tipsOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
        </button>
        {tipsOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, padding: '0 18px 18px' }}>
            {TIPS.map(tip => (
              <div key={tip.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${ADM.blue}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AdmIcon name={tip.icon} size={16} color={ADM.blue} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 700, color: ADM.text, marginBottom: 2 }}>{tip.title}</div>
                  <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.muted, lineHeight: 1.45 }}>{tip.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
