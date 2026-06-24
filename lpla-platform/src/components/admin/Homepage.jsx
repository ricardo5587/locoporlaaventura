'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { ADM } from '@/lib/tokens'
import AdmIcon from '@/components/admin/AdmIcon'

const API = 'https://locoporlaaventura.vercel.app'

const SLIDE_ACCENTS = ['#2D7A4F', '#4A6E1A', '#5C3B1E', '#1B5E7F']
const FIT_OPTIONS = [
  { value: 'cover', label: 'Cover (fill & crop)' },
  { value: 'contain', label: 'Contain (fit inside)' },
  { value: 'fill', label: 'Stretch to fill' },
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

// ─── Live Site Preview (iframe) ───────────────────────────────────
const IPHONE_W = 393
const IPHONE_H = 852
const IPHONE_RADIUS = 55
const IPHONE_BEZEL = 12
const SITE_URL = 'https://book.locoporlaaventura.com'

function LivePreview({ isMobile, refreshKey }) {
  if (isMobile) {
    const outerW = IPHONE_W + IPHONE_BEZEL * 2
    const outerH = IPHONE_H + IPHONE_BEZEL * 2
    const screenW = IPHONE_W
    const screenH = IPHONE_H
    return (
      <div style={{ width: outerW, height: outerH, borderRadius: IPHONE_RADIUS, background: '#1a1a1a', padding: IPHONE_BEZEL, boxShadow: '0 20px 60px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.08) inset', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', right: -2, top: 140, width: 3, height: 80, borderRadius: '0 2px 2px 0', background: '#333' }} />
        <div style={{ position: 'absolute', left: -2, top: 120, width: 3, height: 32, borderRadius: '2px 0 0 2px', background: '#333' }} />
        <div style={{ position: 'absolute', left: -2, top: 162, width: 3, height: 32, borderRadius: '2px 0 0 2px', background: '#333' }} />
        <div style={{ position: 'absolute', left: -2, top: 80, width: 3, height: 18, borderRadius: '2px 0 0 2px', background: '#333' }} />

        <div style={{ width: screenW, height: screenH, borderRadius: IPHONE_RADIUS - IPHONE_BEZEL, overflow: 'hidden', position: 'relative', background: '#000' }}>
          {/* Dynamic Island */}
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 126, height: 36, borderRadius: 20, background: '#000', zIndex: 30 }} />
          {/* Iframe */}
          <iframe
            key={refreshKey}
            src={SITE_URL}
            title="Mobile preview"
            sandbox="allow-scripts allow-same-origin"
            style={{ width: screenW, height: screenH, border: 'none', borderRadius: IPHONE_RADIUS - IPHONE_BEZEL }}
          />
          {/* Home indicator */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.3)', zIndex: 30, pointerEvents: 'none' }} />
        </div>
      </div>
    )
  }

  const deskW = 1280
  const deskH = 800
  const scale = 0.48
  return (
    <div style={{ width: deskW * scale + 2, flexShrink: 0 }}>
      <div style={{ background: '#e8e8e8', borderRadius: '10px 10px 0 0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57', '#FFBD2E', '#28C840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, height: 22, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
          <span style={{ fontFamily: 'system-ui', fontSize: 10, color: '#999' }}>book.locoporlaaventura.com</span>
        </div>
      </div>
      <div style={{ width: deskW * scale, height: deskH * scale, overflow: 'hidden', borderRadius: '0 0 10px 10px', border: `1px solid ${ADM.border}`, borderTop: 'none', background: '#000', position: 'relative' }}>
        <iframe
          key={refreshKey}
          src={SITE_URL}
          title="Desktop preview"
          sandbox="allow-scripts allow-same-origin"
          style={{ width: deskW, height: deskH, border: 'none', transform: `scale(${scale})`, transformOrigin: 'top left' }}
        />
      </div>
    </div>
  )
}

// ─── Position Arrow Controls ──────────────────────────────────────
const POS_V = ['top', 'center', 'bottom']
const POS_H = ['left', 'center', 'right']

function PositionArrows({ position, accent, onChange }) {
  const [v, h] = (position || 'center center').split(' ')
  const vi = POS_V.indexOf(v), hi = POS_H.indexOf(h)

  function move(dv, dh) {
    const nv = POS_V[Math.max(0, Math.min(2, vi + dv))]
    const nh = POS_H[Math.max(0, Math.min(2, hi + dh))]
    onChange(`${nv} ${nh}`)
  }

  const arrowBtn = (label, dv, dh, disabled, style) => (
    <button onClick={e => { e.stopPropagation(); move(dv, dh) }} disabled={disabled}
      style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: disabled ? 'default' : 'pointer', background: disabled ? 'transparent' : ADM.bg, color: disabled ? 'transparent' : ADM.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, opacity: disabled ? 0 : 1, transition: 'all .1s', ...style }}>
      {label}
    </button>
  )

  const posLabel = `${v} ${h}` === 'center center' ? 'Centered' : `${v}, ${h}`

  return (
    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gridTemplateRows: 'repeat(3, 28px)', gap: 2 }}>
        <div />
        {arrowBtn('↑', -1, 0, vi === 0)}
        <div />
        {arrowBtn('←', 0, -1, hi === 0)}
        <div style={{ width: 28, height: 28, borderRadius: 6, background: `${accent}20`, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
        </div>
        {arrowBtn('→', 0, 1, hi === 2)}
        <div />
        {arrowBtn('↓', 1, 0, vi === 2)}
        <div />
      </div>
      <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.muted, fontWeight: 600, textTransform: 'capitalize' }}>{posLabel}</span>
    </div>
  )
}

// ─── Slide Editor Card ────────────────────────────────────────────
function SlideCard({ slide, accent, onUpload, onRemove, onFitChange, onPositionChange, uploading }) {
  const [dragOver, setDragOver] = useState(false)
  const [hov, setHov] = useState(false)
  const inputRef = useRef(null)

  function handleFiles(files) {
    if (files && files.length > 0) onUpload(files[0])
  }

  return (
    <div
      style={{
        background: ADM.card, borderRadius: 14, overflow: 'hidden',
        border: `1px solid ${ADM.border}`,
        transition: 'border-color .15s',
      }}
    >
      {/* Image drop zone */}
      <div style={{ padding: 10 }}>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={e => { e.stopPropagation(); if (!slide.image_url) inputRef.current?.click() }}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            position: 'relative', height: 110, borderRadius: 10,
            border: `2px dashed ${dragOver ? accent : slide.image_url ? 'transparent' : '#D1D5DB'}`,
            background: dragOver ? `${accent}0d` : slide.image_url ? '#000' : '#FAFAF8',
            cursor: uploading ? 'wait' : 'pointer', overflow: 'hidden', transition: 'border-color .15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

          {uploading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 24, border: '3px solid #E0DDD5', borderTopColor: accent, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.muted }}>Uploading…</span>
            </div>
          )}

          {!uploading && !slide.image_url && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <AdmIcon name="camera" size={22} color="#D1D5DB" />
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.muted }}>Drop image</span>
            </div>
          )}

          {!uploading && slide.image_url && (
            <>
              <img src={slide.image_url} alt={`Slide ${slide.id}`} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: slide.object_fit || 'cover',
                objectPosition: slide.object_position || 'center center',
              }} />
              {hov && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <button onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                    style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: 'Nunito,system-ui', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Replace</button>
                  <button onClick={e => { e.stopPropagation(); onRemove() }}
                    style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(179,35,23,.5)', background: 'rgba(179,35,23,.2)', backdropFilter: 'blur(6px)', color: '#FCA5A5', fontFamily: 'Nunito,system-ui', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Slide label + controls */}
      <div style={{ padding: '6px 12px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: `${accent}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 700, color: accent }}>{slide.id}</div>
          <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: '#1E2A35', textTransform: 'uppercase', letterSpacing: .3 }}>Slide {slide.id}</span>
        </div>

        {slide.image_url && (
          <>
            {/* Fit mode */}
            <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 4 }}>Image fit</label>
            <select
              value={slide.object_fit || 'cover'}
              onClick={e => e.stopPropagation()}
              onChange={e => { e.stopPropagation(); onFitChange(e.target.value) }}
              style={{ width: '100%', height: 32, borderRadius: 8, border: `1px solid ${ADM.border}`, padding: '0 8px', fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.text, background: '#fff', outline: 'none', marginBottom: 8, cursor: 'pointer' }}
            >
              {FIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Position (arrow controls) */}
            <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 4 }}>Image position</label>
            <PositionArrows position={slide.object_position || 'center center'} accent={accent} onChange={pos => { onPositionChange(pos) }} />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Homepage Editor ─────────────────────────────────────────
export default function AdminHomepage() {
  const [slides, setSlides] = useState([
    { id: 1, image_url: null, object_fit: 'cover', object_position: 'center center' },
    { id: 2, image_url: null, object_fit: 'cover', object_position: 'center center' },
    { id: 3, image_url: null, object_fit: 'cover', object_position: 'center center' },
    { id: 4, image_url: null, object_fit: 'cover', object_position: 'center center' },
  ])
  const [content, setContent] = useState({
    welcome_en: 'WELCOME TO', welcome_es: 'BIENVENIDOS A',
    title_line1: 'LOCO POR', title_line2: 'LA AVENTURA',
    subtitle_en: 'Outdoor adventure events for the Latino community and beyond · Portland, Oregon',
    subtitle_es: 'Eventos de aventura al aire libre para la comunidad latina y más allá · Portland, Oregón',
  })
  const [previewMode, setPreviewMode] = useState('mobile')
  const [refreshKey, setRefreshKey] = useState(0)
  const [uploading, setUploading] = useState({})
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('lpla_admin_token')
    if (!token) return
    Promise.all([
      fetch(`${API}/api/admin/hero-slides`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API}/api/admin/hero-content`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => null),
    ]).then(([slidesData, contentData]) => {
      if (Array.isArray(slidesData)) setSlides(slidesData.map(s => ({ ...s, object_fit: s.object_fit || 'cover', object_position: s.object_position || 'center center' })))
      if (contentData && !contentData.error) setContent(contentData)
    }).catch(() => {})
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
        setRefreshKey(k => k + 1)
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
      setRefreshKey(k => k + 1)
      setToast(`Slide ${slideId} cleared`)
    } catch { setToast('Remove failed') }
  }, [])

  function updateSlideLocal(slideId, key, value) {
    setSlides(s => s.map(sl => sl.id === slideId ? { ...sl, [key]: value } : sl))
    setDirty(true)
  }

  function updateContent(key, value) {
    setContent(c => ({ ...c, [key]: value }))
    setDirty(true)
  }

  async function handleSave() {
    const token = localStorage.getItem('lpla_admin_token')
    if (!token) return
    setSaving(true)
    try {
      await Promise.all([
        // Save slide fit/position settings
        ...slides.filter(s => s.image_url).map(s =>
          fetch(`${API}/api/admin/hero-slides/${s.id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ object_fit: s.object_fit, object_position: s.object_position }),
          })
        ),
        // Save hero text
        fetch(`${API}/api/admin/hero-content`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(content),
        }),
      ])
      setDirty(false)
      setRefreshKey(k => k + 1)
      setToast('All changes saved')
    } catch (err) { setToast('Save failed: ' + err.message) }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', height: 36, borderRadius: 8, border: `1px solid ${ADM.border}`,
    padding: '0 10px', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text,
    background: '#fff', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: '28px 32px', overflow: 'auto', flex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: '#1E2A35', textTransform: 'uppercase', letterSpacing: .5, margin: 0 }}>Homepage Editor</h1>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>Edit hero images, text, and preview changes before publishing.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => window.open('https://book.locoporlaaventura.com', '_blank')}
            style={{ padding: '9px 16px', borderRadius: 10, border: `1px solid ${ADM.border}`, background: ADM.card, color: ADM.text, fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <AdmIcon name="launch" size={14} /> View live
          </button>
          <button onClick={handleSave} disabled={!dirty || saving}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none', cursor: dirty && !saving ? 'pointer' : 'default',
              background: dirty ? '#1B5E7F' : ADM.bg, color: dirty ? '#fff' : ADM.muted,
              fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, letterSpacing: .5,
              textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: dirty ? '0 4px 12px rgba(27,94,127,.3)' : 'none', transition: 'all .2s',
            }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Main layout: editor controls left, preview right */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* Left — controls */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Slide grid */}
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: ADM.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 1.5, background: ADM.muted }} />
            Hero slides
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
            {slides.map((slide, i) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                accent={SLIDE_ACCENTS[i]}
                uploading={!!uploading[slide.id]}
                onUpload={file => handleUpload(slide.id, file)}
                onRemove={() => handleRemove(slide.id)}
                onFitChange={v => updateSlideLocal(slide.id, 'object_fit', v)}
                onPositionChange={v => updateSlideLocal(slide.id, 'object_position', v)}
              />
            ))}
          </div>

          {/* Hero text editor */}
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: ADM.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 1.5, background: ADM.muted }} />
            Hero text
          </div>
          <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 4 }}>Welcome (EN)</label>
                <input value={content.welcome_en} onChange={e => updateContent('welcome_en', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 4 }}>Welcome (ES)</label>
                <input value={content.welcome_es} onChange={e => updateContent('welcome_es', e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 4 }}>Title line 1</label>
                <input value={content.title_line1} onChange={e => updateContent('title_line1', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 4 }}>Title line 2</label>
                <input value={content.title_line2} onChange={e => updateContent('title_line2', e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 4 }}>Subtitle (EN)</label>
              <textarea value={content.subtitle_en} onChange={e => updateContent('subtitle_en', e.target.value)} rows={2}
                style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .8, display: 'block', marginBottom: 4 }}>Subtitle (ES)</label>
              <textarea value={content.subtitle_es} onChange={e => updateContent('subtitle_es', e.target.value)} rows={2}
                style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Right — live preview */}
        <div style={{ width: previewMode === 'mobile' ? (IPHONE_W + IPHONE_BEZEL * 2 + 16) : 630, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: ADM.muted, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 1.5, background: ADM.muted }} />
              Live preview
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setRefreshKey(k => k + 1)}
              style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${ADM.border}`, background: ADM.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Refresh preview">
              <AdmIcon name="reset" size={14} color={ADM.muted} />
            </button>
            <div style={{ display: 'flex', background: ADM.bg, borderRadius: 8, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
              {[
                { key: 'mobile', icon: 'phone', label: 'Mobile' },
                { key: 'desktop', icon: 'grid', label: 'Desktop' },
              ].map(m => (
                <button key={m.key} onClick={() => setPreviewMode(m.key)}
                  style={{
                    padding: '6px 14px', border: 'none', cursor: 'pointer',
                    background: previewMode === m.key ? ADM.card : 'transparent',
                    boxShadow: previewMode === m.key ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                    fontFamily: 'Nunito,system-ui', fontSize: 11, fontWeight: 700, color: previewMode === m.key ? ADM.text : ADM.muted,
                    display: 'flex', alignItems: 'center', gap: 5, transition: 'all .15s',
                  }}>
                  <AdmIcon name={m.icon} size={13} color={previewMode === m.key ? ADM.text : ADM.muted} />
                  {m.label}
                </button>
              ))}
            </div>
            </div>
          </div>
          <LivePreview
            isMobile={previewMode === 'mobile'}
            refreshKey={refreshKey}
          />
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
