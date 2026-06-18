'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { ADM, CAT_COLORS, CATS_ALL } from '@/lib/tokens'

const API = 'https://locoporlaaventura.vercel.app'
const TODAY_STR = new Date().toISOString().slice(0, 10)

function pad(n) { return String(n).padStart(2, '0') }
function toDS(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }
function getStatus(ev) {
  if (ev.draft) return 'draft'
  if (ev.date < TODAY_STR) return 'past'
  if (ev.spotsLeft === 0 && ev.totalSpots > 0) return 'full'
  return 'active'
}
function sold(ev) { return Math.max(0, (ev.totalSpots || 0) - (ev.spotsLeft || 0)) }
function gross(ev) { return ev.isFree ? 0 : sold(ev) * (ev.price || 0) }

function getOccurrences(ev, fromDS, toDS_) {
  const dates = []
  const base = new Date(ev.date + 'T12:00:00')
  if (!ev.recurring) {
    if (ev.date >= fromDS && ev.date <= toDS_) dates.push(ev.date)
    return dates
  }
  const { freq, until } = ev.recurring
  const untilD = new Date((until || '2027-12-31') + 'T12:00:00')
  const toD = new Date(toDS_ + 'T12:00:00')
  const endD = untilD < toD ? untilD : toD
  let cur = new Date(base)
  while (cur <= endD) {
    const ds = cur.toISOString().slice(0, 10)
    if (ds >= fromDS && ds <= toDS_) dates.push(ds)
    if (freq === 'weekly') cur.setDate(cur.getDate() + 7)
    else if (freq === 'monthly') cur.setMonth(cur.getMonth() + 1)
    else break
  }
  return dates
}

// ── Shared sub-components ───────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '20px 22px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: ADM.light, fontFamily: 'Barlow Condensed,system-ui', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || ADM.text, fontFamily: 'Barlow Condensed,system-ui', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: ADM.muted, fontFamily: 'Nunito,system-ui', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function AdminInput({ label, value, onChange, onBlur, type = 'text', placeholder = '', required, span2, textarea, select, children, error, hint, busy }) {
  const base = {
    width: '100%', borderRadius: ADM.radius, border: `1px solid ${error ? ADM.danger : ADM.border}`,
    padding: textarea ? '10px 12px' : '0 12px', height: textarea ? 'auto' : 40,
    fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.text, background: '#fff',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
    resize: textarea ? 'vertical' : undefined,
  }
  return (
    <div style={{ gridColumn: span2 ? 'span 2' : undefined }}>
      <label style={{ display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }}>
        {label}{required && <span style={{ color: ADM.danger }}> *</span>}
      </label>
      {select ? (
        <select value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} style={{ ...base, height: 40 }}>{children}</select>
      ) : textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} rows={3} placeholder={placeholder} style={base} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} style={base} required={required} />
      )}
      {busy ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: ADM.lime, marginTop: 5, fontFamily: 'Nunito,system-ui', fontWeight: 700 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', border: `2px solid ${ADM.lime}40`, borderTopColor: ADM.lime, display: 'inline-block', animation: 'spin 1s linear infinite' }} />
          Auto-translating…
        </div>
      ) : error ? (
        <div style={{ fontSize: 11, color: ADM.danger, marginTop: 3 }}>{error}</div>
      ) : hint ? (
        <div style={{ fontSize: 11, color: ADM.light, marginTop: 5, fontFamily: 'Nunito,system-ui' }}>{hint}</div>
      ) : null}
    </div>
  )
}

function TicketRow({ ticket, onChange, onRemove, canRemove }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 32px', gap: 8, alignItems: 'center', background: '#F8FAFC', borderRadius: ADM.radius, padding: '10px 12px', border: `1px solid ${ADM.border}` }}>
      <input value={ticket.en} onChange={e => onChange('en', e.target.value)} placeholder="Ticket name (EN)"
        style={{ borderRadius: 7, border: `1px solid ${ADM.border}`, padding: '0 10px', height: 34, fontFamily: 'Nunito,system-ui', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      <input value={ticket.es} onChange={e => onChange('es', e.target.value)} placeholder="Nombre (ES)"
        style={{ borderRadius: 7, border: `1px solid ${ADM.border}`, padding: '0 10px', height: 34, fontFamily: 'Nunito,system-ui', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: ADM.muted, fontWeight: 700, fontSize: 14 }}>$</span>
        <input type="number" value={ticket.price} onChange={e => onChange('price', parseFloat(e.target.value) || 0)} min="0"
          style={{ width: '100%', borderRadius: 7, border: `1px solid ${ADM.border}`, padding: '0 8px', height: 34, fontFamily: 'Nunito,system-ui', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
      </div>
      {canRemove
        ? <button onClick={onRemove} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${ADM.border}`, background: '#fff', cursor: 'pointer', color: ADM.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
            <AdmIcon name="x" size={14} color={ADM.danger} />
          </button>
        : <div />}
    </div>
  )
}

// ── Event Modal ─────────────────────────────────────────────────────────────
const BLANK = {
  titleEn: '', titleEs: '', descEn: '', descEs: '', date: '', time: '7:00 AM',
  duration: '3h', location: '', category: 'Escalada', image: '',
  isFree: false, price: 0, totalSpots: 20, draft: false, recurring: null,
  tickets: [{ id: 'general', en: 'General Admission', es: 'Entrada General', price: 0 }],
}

function EventModal({ event, token, onClose, onSaved }) {
  const isEdit = !!event
  const [form, setForm] = useState(isEdit ? {
    ...BLANK, ...event,
    tickets: event.tickets?.length ? event.tickets : BLANK.tickets,
  } : { ...BLANK })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [translating, setTranslating] = useState({})
  const [isRecurring, setIsRecurring] = useState(!!(event && event.recurring))
  const [recFreq, setRecFreq] = useState((event && event.recurring && event.recurring.freq) || 'weekly')
  const [recUntil, setRecUntil] = useState((event && event.recurring && event.recurring.until) || '')
  const fileInputRef = useRef(null)

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const anyTranslating = Object.values(translating).some(Boolean)

  async function translatePair(srcField, tgtField, toLang, kind, opts = {}) {
    const text = (form[srcField] || '').trim()
    if (!text) return
    if (!opts.force && (form[tgtField] || '').trim()) return
    setTranslating(s => ({ ...s, [tgtField]: true }))
    try {
      const res = await fetch(`${API}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, toLang, kind }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.translation) setForm(f => ({ ...f, [tgtField]: data.translation }))
      }
    } catch { /* graceful: leave field as-is */ }
    setTranslating(s => ({ ...s, [tgtField]: false }))
  }

  const onBlurTr = (srcField, tgtField, toLang, kind) => () => translatePair(srcField, tgtField, toLang, kind)

  async function syncTranslations() {
    if ((form.titleEn || '').trim()) await translatePair('titleEn', 'titleEs', 'es', 'title', { force: true })
    else if ((form.titleEs || '').trim()) await translatePair('titleEs', 'titleEn', 'en', 'title', { force: true })
    if ((form.descEn || '').trim()) await translatePair('descEn', 'descEs', 'es', 'description', { force: true })
    else if ((form.descEs || '').trim()) await translatePair('descEs', 'descEn', 'en', 'description', { force: true })
  }

  useEffect(() => {
    if (!form.isFree) setForm(f => ({ ...f, tickets: f.tickets.map((t, i) => i === 0 ? { ...t, price: f.price } : t) }))
    else setForm(f => ({ ...f, tickets: f.tickets.map(t => ({ ...t, price: 0 })) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.isFree, form.price])

  async function uploadImage(file) {
    if (file.size > 50 * 1024 * 1024) { setUploadError('File exceeds 50 MB limit'); return }
    setUploading(true); setUploadError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`${API}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setF('image', data.url)
    } catch (err) { setUploadError(err.message) }
    setUploading(false)
  }

  function addTicket() { setForm(f => ({ ...f, tickets: [...f.tickets, { id: `t${Date.now()}`, en: '', es: '', price: f.isFree ? 0 : f.price }] })) }
  function removeTicket(i) { setForm(f => ({ ...f, tickets: f.tickets.filter((_, j) => j !== i) })) }
  function updateTicket(i, field, val) { setForm(f => ({ ...f, tickets: f.tickets.map((t, j) => j === i ? { ...t, [field]: val } : t) })) }

  function validate() {
    const e = {}
    if (!form.titleEn.trim()) e.titleEn = 'Required'
    if (!form.date) e.date = 'Required'
    if (!form.location.trim()) e.location = 'Required'
    if (form.totalSpots < 1) e.totalSpots = 'Must be ≥ 1'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const body = {
        ...form,
        price: form.isFree ? 0 : Number(form.price),
        totalSpots: Number(form.totalSpots),
        recurring: isRecurring ? { freq: recFreq, until: recUntil || '2026-12-31' } : null,
      }
      if (!isEdit) body.spotsLeft = body.totalSpots
      const url = isEdit ? `${API}/api/events/${event.id}` : `${API}/api/events`
      const r = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!r.ok) throw new Error('Save failed')
      onSaved()
      onClose()
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const iOpts = (label, field, opts = {}) => ({ label, value: form[field], onChange: v => setF(field, opts.num ? (parseFloat(v) || 0) : v), error: errors[field], ...opts })

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500, backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 501, background: '#fff', borderRadius: ADM.radiusLg, boxShadow: '0 30px 90px rgba(0,0,0,.25)', width: 'min(740px,96vw)', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: `1px solid ${ADM.border}`, flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 22, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .5 }}>{isEdit ? 'Edit Event' : 'Create New Event'}</div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, marginTop: 2 }}>{isEdit ? 'Update event details below.' : 'Fill in the details to publish a new event.'}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', color: ADM.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AdmIcon name="x" size={16} />
          </button>
        </div>

        <div style={{ overflow: 'auto', flex: 1, padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Auto-translate bar */}
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', background: `${ADM.lime}12`, border: `1px solid ${ADM.lime}3a`, borderRadius: ADM.radius, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: ADM.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AdmIcon name="globe" size={17} color="#fff" />
                </span>
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.text, lineHeight: 1.45 }}>
                  Type the title &amp; description in <strong>one language</strong> — the other fills in automatically.
                </span>
              </div>
              <button type="button" onClick={syncTranslations} disabled={anyTranslating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: ADM.radius, border: 'none', cursor: anyTranslating ? 'not-allowed' : 'pointer', background: anyTranslating ? '#CBD5E1' : ADM.primary, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, letterSpacing: .4, whiteSpace: 'nowrap', transition: 'background .15s' }}>
                {anyTranslating
                  ? <><span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,.45)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Translating…</>
                  : <><AdmIcon name="globe" size={15} color="#fff" /> Re-translate</>}
              </button>
            </div>

            <AdminInput {...iOpts('Event Title (English)', 'titleEn', { required: true })} placeholder="e.g. Rock Climbing · Smith Rock" onBlur={onBlurTr('titleEn', 'titleEs', 'es', 'title')} busy={translating.titleEn} hint="Spanish auto-fills when you finish typing." />
            <AdminInput {...iOpts('Título del Evento (Español)', 'titleEs')} placeholder="ej. Escalada · Smith Rock" onBlur={onBlurTr('titleEs', 'titleEn', 'en', 'title')} busy={translating.titleEs} />
            <AdminInput {...iOpts('Description (English)', 'descEn', { textarea: true, span2: true })} placeholder="Describe the event..." onBlur={onBlurTr('descEn', 'descEs', 'es', 'description')} busy={translating.descEn} />
            <AdminInput {...iOpts('Descripción (Español)', 'descEs', { textarea: true, span2: true })} placeholder="Describe el evento..." onBlur={onBlurTr('descEs', 'descEn', 'en', 'description')} busy={translating.descEs} />

            {/* Event image */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }}>Event Image</label>
              {form.image ? (
                <div style={{ position: 'relative', borderRadius: ADM.radius, overflow: 'hidden', border: `1px solid ${ADM.border}`, maxHeight: 200 }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  <button onClick={() => setF('image', '')} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AdmIcon name="x" size={14} color="#fff" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = ADM.primary; e.currentTarget.style.background = `${ADM.primary}08` }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = ADM.border; e.currentTarget.style.background = 'transparent' }}
                  onDrop={async e => { e.preventDefault(); e.currentTarget.style.borderColor = ADM.border; e.currentTarget.style.background = 'transparent'; const file = e.dataTransfer.files[0]; if (file) await uploadImage(file) }}
                  style={{ border: `2px dashed ${ADM.border}`, borderRadius: ADM.radius, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}>
                  {uploading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ width: 18, height: 18, border: `2.5px solid ${ADM.border}`, borderTopColor: ADM.primary, borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted }}>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, opacity: .4 }}><AdmIcon name="camera" size={28} /></div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, color: ADM.text }}>Drop an image here or click to browse</div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light, marginTop: 4 }}>JPEG, PNG, WebP, GIF — max 50 MB</div>
                    </>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }}
                onChange={async e => { const file = e.target.files[0]; if (file) await uploadImage(file); e.target.value = '' }} />
              {uploadError && <div style={{ fontSize: 12, color: ADM.danger, marginTop: 6 }}>{uploadError}</div>}
            </div>

            <AdminInput {...iOpts('Date', 'date', { type: 'date', required: true })} />
            <AdminInput {...iOpts('Time', 'time')} placeholder="7:00 AM" />
            <AdminInput {...iOpts('Duration', 'duration')} placeholder="3h" />
            <AdminInput {...iOpts('Location', 'location', { required: true })} placeholder="Smith Rock, Terrebonne OR" />
            <AdminInput label="Category" value={form.category} onChange={v => setF('category', v)} select>{CATS_ALL.map(c => <option key={c} value={c}>{c}</option>)}</AdminInput>
            <AdminInput {...iOpts('Total Spots', 'totalSpots', { type: 'number', num: true, required: true })} error={errors.totalSpots} />

            {/* Pricing */}
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 16, background: '#F8FAFC', borderRadius: ADM.radius, padding: '14px 16px', border: `1px solid ${ADM.border}` }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isFree} onChange={e => setF('isFree', e.target.checked)} style={{ width: 16, height: 16, accentColor: ADM.green }} />
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, color: ADM.text }}>Free event</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.draft} onChange={e => setF('draft', e.target.checked)} style={{ width: 16, height: 16, accentColor: ADM.warning }} />
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, color: ADM.text }}>Save as Draft</span>
              </label>
              {!form.isFree && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 700, color: ADM.muted }}>Price $</span>
                  <input type="number" value={form.price} onChange={e => setF('price', parseFloat(e.target.value) || 0)} min="0" step="0.01"
                    style={{ width: 90, borderRadius: 8, border: `1px solid ${ADM.border}`, padding: '0 10px', height: 36, fontFamily: 'Nunito,system-ui', fontSize: 14, outline: 'none' }} />
                </div>
              )}
            </div>

            {/* Recurring */}
            <div style={{ gridColumn: 'span 2', background: '#F8FAFC', borderRadius: ADM.radius, padding: '14px 16px', border: `1px solid ${ADM.border}` }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: isRecurring ? 12 : 0 }}>
                <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} style={{ width: 16, height: 16, accentColor: ADM.primary }} />
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, color: ADM.text }}>Recurring event</span>
              </label>
              {isRecurring && (
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 600, color: ADM.muted, display: 'block', marginBottom: 4 }}>Frequency</label>
                    <select value={recFreq} onChange={e => setRecFreq(e.target.value)} style={{ height: 36, borderRadius: 8, border: `1px solid ${ADM.border}`, padding: '0 10px', fontFamily: 'Nunito,system-ui', fontSize: 13, background: '#fff', outline: 'none' }}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 600, color: ADM.muted, display: 'block', marginBottom: 4 }}>Repeat Until</label>
                    <input type="date" value={recUntil} onChange={e => setRecUntil(e.target.value)} style={{ height: 36, borderRadius: 8, border: `1px solid ${ADM.border}`, padding: '0 10px', fontFamily: 'Nunito,system-ui', fontSize: 13, outline: 'none' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Tickets */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 10 }}>Ticket Types</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {form.tickets.map((t, i) => (
                  <TicketRow key={t.id || i} ticket={t} onChange={(f, v) => updateTicket(i, f, v)} onRemove={() => removeTicket(i)} canRemove={form.tickets.length > 1} />
                ))}
              </div>
              <button onClick={addTicket} style={{ padding: '7px 16px', borderRadius: ADM.radius, border: `1.5px dashed ${ADM.border}`, background: 'transparent', cursor: 'pointer', color: ADM.primary, fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700 }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ADM.primary; e.currentTarget.style.background = 'rgba(41,65,84,.04)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = ADM.border; e.currentTarget.style.background = 'transparent' }}>
                + Add Ticket Type
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 28px', borderTop: `1px solid ${ADM.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', color: ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 28px', borderRadius: ADM.radius, border: 'none', background: ADM.primary, color: '#fff', cursor: saving ? 'default' : 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .4, boxShadow: '0 4px 14px rgba(41,65,84,.3)', opacity: saving ? .7 : 1 }}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </div>
    </>
  )
}

function DeleteConfirm({ event, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 600 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 601, background: '#fff', borderRadius: ADM.radiusMd, boxShadow: '0 20px 60px rgba(0,0,0,.2)', width: 'min(400px,90vw)', padding: '28px' }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 20, fontWeight: 800, color: ADM.text, textAlign: 'center', marginBottom: 8 }}>Delete Event?</div>
        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
          <strong>&quot;{event.titleEn}&quot;</strong> will be permanently removed.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 42, borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, color: ADM.muted }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, height: 42, borderRadius: ADM.radius, border: 'none', background: ADM.danger, color: '#fff', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700 }}>Delete</button>
        </div>
      </div>
    </>
  )
}

function StatusTabs({ value, onChange, counts }) {
  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'draft', label: 'Drafts' },
    { id: 'past', label: 'Past' },
    { id: 'all', label: 'All' },
  ]
  return (
    <div style={{ display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: 10, padding: 3 }}>
      {tabs.map(t => {
        const active = value === t.id
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', background: active ? '#fff' : 'transparent', color: active ? ADM.text : ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: active ? 700 : 500, boxShadow: active ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5 }}>
            {t.label}
            {counts[t.id] != null && (
              <span style={{ background: active ? ADM.primary : '#CBD5E1', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{counts[t.id]}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function ListView({ events, onEdit, onDelete, onSelect, loading }) {
  const STATUS_LABEL = { active: 'Active', past: 'Past', draft: 'Draft', full: 'Full' }
  const STATUS_COLOR = { active: ADM.success, past: ADM.light, draft: ADM.warning, full: ADM.danger }
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${ADM.border}` }}>
              {['Event', 'Sold', 'Gross', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1.2, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center' }}>
                <span style={{ width: 24, height: 24, border: `3px solid ${ADM.border}`, borderTopColor: ADM.primary, borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
              </td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', fontFamily: 'Nunito,system-ui', fontSize: 15, color: ADM.light }}>No events found.</td></tr>
            ) : events.map(ev => {
              const s = getStatus(ev)
              return (
                <tr key={ev.id} style={{ background: '#fff', borderBottom: `1px solid ${ADM.border}`, transition: 'background .12s', cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '14px 16px' }} onClick={() => onSelect(ev)}>
                    <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, lineHeight: 1.15 }}>
                      {ev.titleEn}
                      {ev.recurring && <span style={{ marginLeft: 6, fontSize: 10, background: '#EDE9FE', color: '#7C3AED', borderRadius: 6, padding: '1px 6px', fontFamily: 'Nunito,system-ui', fontWeight: 700 }}>↺ {ev.recurring.freq}</span>}
                    </div>
                    <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light, marginTop: 2 }}>{ev.date} · {ev.location}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }} onClick={() => onSelect(ev)}>
                    <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, color: ADM.text }}>{sold(ev)}</div>
                    <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.light }}>of {ev.totalSpots}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }} onClick={() => onSelect(ev)}>
                    <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, color: ev.isFree ? ADM.light : ADM.primary }}>
                      {ev.isFree ? '—' : `$${gross(ev).toLocaleString()}`}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }} onClick={() => onSelect(ev)}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 16, background: `${STATUS_COLOR[s]}18`, color: STATUS_COLOR[s], fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>{STATUS_LABEL[s]}</span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => onEdit(ev)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${ADM.primary}30`, background: `${ADM.primary}10`, color: ADM.primary, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
                        onMouseOver={e => { e.currentTarget.style.background = ADM.primary; e.currentTarget.style.color = '#fff' }}
                        onMouseOut={e => { e.currentTarget.style.background = `${ADM.primary}10`; e.currentTarget.style.color = ADM.primary }}>Edit</button>
                      <button onClick={() => onDelete(ev)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${ADM.danger}30`, background: `${ADM.danger}10`, color: ADM.danger, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
                        onMouseOver={e => { e.currentTarget.style.background = ADM.danger; e.currentTarget.style.color = '#fff' }}
                        onMouseOut={e => { e.currentTarget.style.background = `${ADM.danger}10`; e.currentTarget.style.color = ADM.danger }}>Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CalendarView({ events, onSelect }) {
  const todayD = new Date()
  const [mode, setMode] = useState('month')
  const [viewDate, setViewDate] = useState(new Date(todayD))
  const [pickerOpen, setPickerOpen] = useState(false)

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function buildMap(fromDS, toDS_) {
    const map = {}
    events.forEach(ev => {
      getOccurrences(ev, fromDS, toDS_).forEach(ds => {
        if (!map[ds]) map[ds] = []
        map[ds].push(ev)
      })
    })
    return map
  }

  const navBtn = { width: 30, height: 30, borderRadius: 8, border: `1px solid ${ADM.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: ADM.primary }

  function MonthView() {
    const y = viewDate.getFullYear(), m = viewDate.getMonth()
    const firstDow = new Date(y, m, 1).getDay()
    const daysInMo = new Date(y, m + 1, 0).getDate()
    const map = buildMap(toDS(y, m, 1), toDS(y, m, daysInMo))
    const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMo }, (_, i) => i + 1)]
    while (cells.length % 7 !== 0) cells.push(null)
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: `1px solid ${ADM.border}` }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: '8px 0', textAlign: 'center', fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} style={{ minHeight: 100, borderRight: `1px solid ${ADM.border}`, borderBottom: `1px solid ${ADM.border}`, background: '#FAFAFA' }} />
            const ds = toDS(y, m, d)
            const isToday = ds === TODAY_STR
            const dayEvs = map[ds] || []
            const shown = dayEvs.slice(0, 2)
            const more = dayEvs.length - shown.length
            return (
              <div key={i} style={{ minHeight: 100, borderRight: `1px solid ${ADM.border}`, borderBottom: `1px solid ${ADM.border}`, padding: '6px 5px', background: isToday ? 'rgba(41,65,84,.04)' : '#fff' }}>
                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: isToday ? 800 : 500, color: isToday ? '#fff' : ADM.muted, background: isToday ? ADM.primary : 'transparent', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>{d}</div>
                {shown.map((ev, j) => {
                  const col = CAT_COLORS[ev.category] || ADM.primary
                  return (
                    <div key={j} onClick={() => onSelect(ev)} style={{ background: `${col}18`, color: col, borderLeft: `3px solid ${col}`, borderRadius: '0 4px 4px 0', padding: '2px 5px', marginBottom: 2, fontFamily: 'Nunito,system-ui', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4, transition: 'background .15s' }}
                      onMouseOver={e => e.currentTarget.style.background = `${col}28`}
                      onMouseOut={e => e.currentTarget.style.background = `${col}18`}>{ev.titleEn}</div>
                  )
                })}
                {more > 0 && <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, color: ADM.muted, paddingLeft: 4 }}>+{more} more</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function WeekView() {
    const dow = viewDate.getDay()
    const weekStart = new Date(viewDate); weekStart.setDate(viewDate.getDate() - dow)
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d })
    const map = buildMap(days[0].toISOString().slice(0, 10), days[6].toISOString().slice(0, 10))
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
        {days.map((d, i) => {
          const ds = d.toISOString().slice(0, 10)
          const isToday = ds === TODAY_STR
          const dayEvs = map[ds] || []
          return (
            <div key={i} style={{ borderRight: `1px solid ${ADM.border}`, minHeight: 320 }}>
              <div style={{ padding: '10px 8px', borderBottom: `1px solid ${ADM.border}`, textAlign: 'center', background: isToday ? `${ADM.primary}08` : '#F8FAFC' }}>
                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 10, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1 }}>{DAYS[i]}</div>
                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 22, fontWeight: 800, color: isToday ? ADM.primary : ADM.text, lineHeight: 1.1 }}>{d.getDate()}</div>
              </div>
              <div style={{ padding: '6px 5px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dayEvs.map((ev, j) => {
                  const col = CAT_COLORS[ev.category] || ADM.primary
                  return (
                    <div key={j} onClick={() => onSelect(ev)} style={{ background: `${col}18`, borderLeft: `3px solid ${col}`, borderRadius: '0 6px 6px 0', padding: '5px 7px', cursor: 'pointer', transition: 'background .15s' }}
                      onMouseOver={e => e.currentTarget.style.background = `${col}28`}
                      onMouseOut={e => e.currentTarget.style.background = `${col}18`}>
                      <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: .3, lineHeight: 1.2 }}>{ev.titleEn}</div>
                      <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 10, color: ADM.muted, marginTop: 1 }}>{ev.time}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  function prevPeriod() { const d = new Date(viewDate); if (mode === 'month') d.setMonth(d.getMonth() - 1); else d.setDate(d.getDate() - 7); setViewDate(d) }
  function nextPeriod() { const d = new Date(viewDate); if (mode === 'month') d.setMonth(d.getMonth() + 1); else d.setDate(d.getDate() + 7); setViewDate(d) }

  const headerLabel = mode === 'month'
    ? `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`
    : `Week of ${viewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${ADM.border}`, flexWrap: 'wrap' }}>
        <button onClick={prevPeriod} style={navBtn}><AdmIcon name="chevronLeft" size={16} color={ADM.primary} /></button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setPickerOpen(p => !p)} style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, color: ADM.text, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            {headerLabel} <AdmIcon name="chevronDown" size={13} color={ADM.muted} />
          </button>
          {pickerOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 50, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,.15)', border: `1px solid ${ADM.border}`, padding: '12px 14px', minWidth: 220 }}>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 8 }}>Jump to month</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {MONTHS.map((mn, mi) => (
                  <button key={mi} onClick={() => { const d = new Date(viewDate); d.setMonth(mi); setViewDate(d); setPickerOpen(false) }}
                    style={{ padding: '5px 6px', borderRadius: 7, border: 'none', cursor: 'pointer', background: viewDate.getMonth() === mi ? ADM.primary : '#F1F5F9', color: viewDate.getMonth() === mi ? '#fff' : ADM.text, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 600, transition: 'all .15s' }}>{mn.slice(0, 3)}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
                <button onClick={() => { const d = new Date(viewDate); d.setFullYear(d.getFullYear() - 1); setViewDate(d) }} style={{ ...navBtn, width: 26, height: 26 }}><AdmIcon name="chevronLeft" size={13} color={ADM.primary} /></button>
                <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, minWidth: 48, textAlign: 'center' }}>{viewDate.getFullYear()}</span>
                <button onClick={() => { const d = new Date(viewDate); d.setFullYear(d.getFullYear() + 1); setViewDate(d) }} style={{ ...navBtn, width: 26, height: 26 }}><AdmIcon name="chevronRight" size={13} color={ADM.primary} /></button>
              </div>
            </div>
          )}
        </div>
        <button onClick={nextPeriod} style={navBtn}><AdmIcon name="chevronRight" size={16} color={ADM.primary} /></button>
        <button onClick={() => setViewDate(new Date(todayD))} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${ADM.border}`, background: '#fff', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: ADM.primary, transition: 'all .15s' }}
          onMouseOver={e => { e.currentTarget.style.background = ADM.primary; e.currentTarget.style.color = '#fff' }}
          onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = ADM.primary }}>Today</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
          {['month', 'week'].map(v => (
            <button key={v} onClick={() => setMode(v)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: mode === v ? '#fff' : 'transparent', color: mode === v ? ADM.text : ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: mode === v ? 700 : 500, boxShadow: mode === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s', textTransform: 'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>
      {mode === 'month' ? <MonthView /> : <WeekView />}
    </div>
  )
}

// ── Event Manager ───────────────────────────────────────────────────────────
export default function EventManager({ events, token, loading, onEventsChange, onSelectEvent, openEditEvent, onEditConsumed }) {
  const [statusTab, setStatusTab] = useState('upcoming')
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list')
  const [modal, setModal] = useState(null)
  const [delTarget, setDelTarget] = useState(null)

  useEffect(() => {
    if (openEditEvent) { setModal(openEditEvent); onEditConsumed && onEditConsumed() }
  }, [openEditEvent, onEditConsumed])

  const counts = useMemo(() => ({
    upcoming: events.filter(e => !e.draft && e.date >= TODAY_STR).length,
    draft: events.filter(e => e.draft).length,
    past: events.filter(e => !e.draft && e.date < TODAY_STR).length,
    all: events.length,
  }), [events])

  const filtered = events
    .filter(e => statusTab === 'all' ? true : statusTab === 'upcoming' ? (!e.draft && e.date >= TODAY_STR) : statusTab === 'draft' ? e.draft : (!e.draft && e.date < TODAY_STR))
    .filter(e => catFilter === 'all' || e.category === catFilter)
    .filter(e => { const q = search.toLowerCase(); return !q || (e.titleEn || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q) })

  async function handleDelete() {
    if (!delTarget) return
    await fetch(`${API}/api/events/${delTarget.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setDelTarget(null)
    onEventsChange()
  }

  const totalSold = events.reduce((s, e) => s + sold(e), 0)
  const totalGross = events.filter(e => !e.isFree).reduce((s, e) => s + gross(e), 0)

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflow: 'auto', background: ADM.bg }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', letterSpacing: .5 }}>Event Manager</h1>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>Changes sync instantly to the widget.</p>
        </div>
        <button onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: ADM.radiusMd, border: 'none', background: ADM.primary, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .5, cursor: 'pointer', boxShadow: '0 4px 14px rgba(41,65,84,.3)', transition: 'all .2s' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseOut={e => { e.currentTarget.style.transform = '' }}>
          <AdmIcon name="plus" size={16} /> Create Event
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Events" value={events.length} sub={`${counts.upcoming} upcoming`} />
        <StatCard label="Total Sold" value={totalSold} color={ADM.success} />
        <StatCard label="Est. Gross" value={`$${totalGross.toLocaleString()}`} color={ADM.primary} />
        <StatCard label="Drafts" value={counts.draft} color={ADM.warning} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <StatusTabs value={statusTab} onChange={setStatusTab} counts={counts} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ height: 38, borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, padding: '0 12px', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, background: '#fff', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {CATS_ALL.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: ADM.radius, padding: '0 12px', height: 38, border: `1px solid ${ADM.border}` }}>
          <AdmIcon name="search" size={14} color="#94A3B8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." style={{ border: 'none', outline: 'none', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, flex: 1, background: 'transparent' }} />
        </div>
        <div style={{ display: 'flex', gap: 2, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
          {[['list', 'List', 'apps'], ['calendar', 'Calendar', 'calendar']].map(([v, l, ic]) => (
            <button key={v} onClick={() => setView(v)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: view === v ? '#fff' : 'transparent', color: view === v ? ADM.text : ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: view === v ? 700 : 500, boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
              <AdmIcon name={ic} size={13} color={view === v ? ADM.text : ADM.muted} /> {l}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light }}>{filtered.length} events</span>
      </div>

      {view === 'list'
        ? <ListView events={filtered} loading={loading} onEdit={e => setModal(e)} onDelete={e => setDelTarget(e)} onSelect={ev => onSelectEvent && onSelectEvent(ev)} />
        : <CalendarView events={filtered} onSelect={ev => onSelectEvent && onSelectEvent(ev)} />
      }

      {modal && <EventModal event={modal === 'create' ? null : modal} token={token} onClose={() => setModal(null)} onSaved={onEventsChange} />}
      {delTarget && <DeleteConfirm event={delTarget} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />}
    </div>
  )
}
