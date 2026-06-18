'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AdmIcon from '@/components/admin/AdmIcon'
import { ADM, CAT_COLORS, CATS_ALL } from '@/lib/tokens'
import DashboardOverview, { OvKpi } from '@/components/admin/Overview'
import AttendeesBookings from '@/components/admin/Attendees'
import AdminCRM from '@/components/admin/Contacts'
import AdminApps from '@/components/admin/Apps'
import AdminUsers from '@/components/admin/Users'
import AdminInstall from '@/components/admin/Launch'

const API = 'https://locoporlaaventura.vercel.app'
const TODAY = new Date().toISOString().slice(0, 10)
const IDLE_TIMEOUT = 30 * 60 * 1000

function getStatus(ev) {
  if (ev.draft) return 'draft'
  if (ev.date < TODAY) return 'past'
  if ((ev.spotsLeft || 0) === 0 && ev.totalSpots > 0) return 'full'
  return 'active'
}
function sold(ev) { return Math.max(0, (ev.totalSpots || 0) - (ev.spotsLeft || 0)) }
function gross(ev) { return ev.isFree ? 0 : sold(ev) * (ev.price || 0) }

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

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '20px 22px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: ADM.light, fontFamily: 'Barlow Condensed,system-ui', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || ADM.text, fontFamily: 'Barlow Condensed,system-ui', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: ADM.muted, fontFamily: 'Nunito,system-ui', marginTop: 2 }}>{sub}</div>}
    </div>
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
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: active ? '#fff' : 'transparent', color: active ? ADM.text : ADM.muted,
            fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: active ? 700 : 500,
            boxShadow: active ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition: 'all .15s',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {t.label}
            {counts[t.id] != null && (
              <span style={{ background: active ? ADM.primary : '#CBD5E1', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {counts[t.id]}
              </span>
            )}
          </button>
        )
      })}
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
        ? <button onClick={onRemove} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${ADM.border}`, background: '#fff', cursor: 'pointer', color: ADM.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AdmIcon name="x" size={14} color={ADM.danger} />
          </button>
        : <div />}
    </div>
  )
}

const EMPTY = {
  titleEn: '', titleEs: '', descEn: '', descEs: '',
  date: '', time: '7:00 AM', location: '', category: 'Escalada',
  image: '', isFree: false, price: 0, totalSpots: 20, draft: false,
  tickets: [{ id: 'general', en: 'General Admission', es: 'Entrada General', price: 0 }],
}

function EventModal({ event, token, onClose, onSaved }) {
  const isEdit = !!event
  const [form, setForm] = useState(isEdit ? {
    titleEn: event.titleEn || '', titleEs: event.titleEs || '',
    descEn: event.descEn || '', descEs: event.descEs || '',
    date: event.date || '', time: event.time || '7:00 AM',
    location: event.location || '', category: event.category || 'Escalada',
    image: event.image || '', isFree: event.isFree || false, price: event.price || 0,
    totalSpots: event.totalSpots || 20, draft: event.draft || false,
    tickets: event.tickets?.length ? event.tickets : EMPTY.tickets,
  } : { ...EMPTY })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function uploadImage(file) {
    if (file.size > 50 * 1024 * 1024) { setUploadError('File exceeds 50 MB limit'); return }
    setUploading(true); setUploadError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setF('image', data.url)
    } catch (err) { setUploadError(err.message) }
    setUploading(false)
  }

  function addTicket() { setForm(f => ({ ...f, tickets: [...f.tickets, { id: `t${Date.now()}`, en: '', es: '', price: 0 }] })) }
  function removeTicket(i) { setForm(f => ({ ...f, tickets: f.tickets.filter((_, j) => j !== i) })) }
  function updateTicket(i, field, val) { setForm(f => ({ ...f, tickets: f.tickets.map((t, j) => j === i ? { ...t, [field]: val } : t) })) }

  function validate() {
    const e = {}
    if (!form.titleEn.trim()) e.titleEn = 'Required'
    if (!form.date) e.date = 'Required'
    if (!form.location.trim()) e.location = 'Required'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const body = { ...form, price: form.isFree ? 0 : Number(form.price), totalSpots: Number(form.totalSpots) }
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

  const inputStyle = { width: '100%', borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, padding: '0 12px', height: 40, fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.text, background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }

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
            {[['titleEn', 'Event Title (English)', true], ['titleEs', 'Título del Evento (Español)', false]].map(([k, l, req]) => (
              <div key={k}>
                <label style={labelStyle}>{l}{req && <span style={{ color: ADM.danger }}> *</span>}</label>
                <input value={form[k]} onChange={e => setF(k, e.target.value)} style={{ ...inputStyle, borderColor: errors[k] ? ADM.danger : ADM.border }} />
                {errors[k] && <div style={{ fontSize: 11, color: ADM.danger, marginTop: 3 }}>{errors[k]}</div>}
              </div>
            ))}

            {[['descEn', 'Description (English)'], ['descEs', 'Descripción (Español)']].map(([k, l]) => (
              <div key={k}>
                <label style={labelStyle}>{l}</label>
                <textarea value={form[k]} onChange={e => setF(k, e.target.value)} rows={3} style={{ ...inputStyle, height: 'auto', padding: '8px 12px', resize: 'vertical' }} />
              </div>
            ))}

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Event Image</label>
              {form.image ? (
                <div style={{ position: 'relative', borderRadius: ADM.radius, overflow: 'hidden', border: `1px solid ${ADM.border}`, maxHeight: 200 }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  <button onClick={() => setF('image', '')} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AdmIcon name="x" size={14} color="#fff" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('event-img-input').click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = ADM.primary; e.currentTarget.style.background = `${ADM.primary}08` }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = ADM.border; e.currentTarget.style.background = 'transparent' }}
                  onDrop={async e => {
                    e.preventDefault(); e.currentTarget.style.borderColor = ADM.border; e.currentTarget.style.background = 'transparent'
                    const file = e.dataTransfer.files[0]; if (file) await uploadImage(file)
                  }}
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
              <input id="event-img-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: 'none' }}
                onChange={async e => { const file = e.target.files[0]; if (file) await uploadImage(file); e.target.value = '' }} />
              {uploadError && <div style={{ fontSize: 12, color: ADM.danger, marginTop: 6 }}>{uploadError}</div>}
            </div>

            <div>
              <label style={labelStyle}>Date{' '}<span style={{ color: ADM.danger }}>*</span></label>
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} style={{ ...inputStyle, borderColor: errors.date ? ADM.danger : ADM.border }} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input value={form.time} onChange={e => setF('time', e.target.value)} placeholder="7:00 AM" style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Location{' '}<span style={{ color: ADM.danger }}>*</span></label>
              <input value={form.location} onChange={e => setF('location', e.target.value)} placeholder="Smith Rock, Terrebonne OR" style={{ ...inputStyle, borderColor: errors.location ? ADM.danger : ADM.border }} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => setF('category', e.target.value)} style={{ ...inputStyle }}>
                {CATS_ALL.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Total Spots</label>
              <input type="number" value={form.totalSpots} onChange={e => setF('totalSpots', e.target.value)} style={inputStyle} />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 24, background: '#F8FAFC', borderRadius: ADM.radius, padding: '14px 16px', border: `1px solid ${ADM.border}` }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isFree} onChange={e => setF('isFree', e.target.checked)} style={{ width: 16, height: 16, accentColor: ADM.success }} />
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

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 10 }}>Ticket Types</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {form.tickets.map((t, i) => (
                  <TicketRow key={t.id || i} ticket={t} onChange={(f, v) => updateTicket(i, f, v)} onRemove={() => removeTicket(i)} canRemove={form.tickets.length > 1} />
                ))}
              </div>
              <button onClick={addTicket} style={{ padding: '7px 16px', borderRadius: ADM.radius, border: `1.5px dashed ${ADM.border}`, background: 'transparent', cursor: 'pointer', color: ADM.primary, fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700 }}>
                + Add Ticket Type
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 28px', borderTop: `1px solid ${ADM.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', color: ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 28px', borderRadius: ADM.radius, border: 'none', background: ADM.primary, color: '#fff', cursor: saving ? 'default' : 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .4, opacity: saving ? .7 : 1 }}>
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

export default function AdminPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePage, setActivePage] = useState('overview')
  const [statusTab, setStatusTab] = useState('upcoming')
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [delTarget, setDelTarget] = useState(null)

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

  async function deleteEvent(ev) {
    await fetch(`${API}/api/events/${ev.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setDelTarget(null)
    loadEvents(token)
  }

  function handlePreview() {
    window.open('https://locoporlaaventura-k1oz3.vercel.app', '_blank')
  }

  const counts = useMemo(() => ({
    upcoming: events.filter(e => !e.draft && e.date >= TODAY).length,
    draft: events.filter(e => e.draft).length,
    past: events.filter(e => !e.draft && e.date < TODAY).length,
    all: events.length,
  }), [events])

  const filtered = events
    .filter(e => statusTab === 'all' ? true : statusTab === 'upcoming' ? (!e.draft && e.date >= TODAY) : statusTab === 'draft' ? e.draft : (!e.draft && e.date < TODAY))
    .filter(e => catFilter === 'all' || e.category === catFilter)
    .filter(e => { const q = search.toLowerCase(); return !q || (e.titleEn || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q) })

  const totalSold = events.reduce((s, e) => s + sold(e), 0)
  const totalGross = events.filter(e => !e.isFree).reduce((s, e) => s + gross(e), 0)

  const STATUS_LABEL = { active: 'Active', past: 'Past', draft: 'Draft', full: 'Full' }
  const STATUS_COLOR = { active: ADM.success, past: ADM.light, draft: ADM.warning, full: ADM.danger }

  const isOwner = currentUser?.role === 'owner'
  const navItems = [
    { id: 'overview',  icon: 'chart',    label: 'Overview' },
    { id: 'events',    icon: 'calendar', label: 'Events', badge: events.length },
    { id: 'attendees', icon: 'people',   label: 'Attendees' },
    { id: 'crm',       icon: 'user',     label: 'Contacts' },
    { id: 'apps',      icon: 'apps',     label: 'Apps' },
    { id: 'users',     icon: 'team',     label: 'Users' },
    { id: 'widget',    icon: 'launch',   label: 'Launch', featured: true },
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
          <div style={{ flex: 1, overflow: ['crm', 'contacts'].includes(activePage) ? 'hidden' : 'auto', padding: ['crm', 'contacts', 'overview', 'attendees', 'apps', 'users', 'widget', 'settings'].includes(activePage) ? 0 : '28px 32px', background: ADM.bg, display: 'flex', flexDirection: 'column' }}>
            {activePage === 'overview' && <DashboardOverview events={events} ADM={ADM} CAT_COLORS={CAT_COLORS} onSelectEvent={ev => { setActivePage('events'); setModal(ev) }} onGoEvents={() => setActivePage('events')} />}
            {activePage === 'attendees' && <AttendeesBookings events={events} ADM={ADM} OvKpi={OvKpi} />}
            {(activePage === 'crm' || activePage === 'contacts') && <AdminCRM events={events} ADM={ADM} OvKpi={OvKpi} />}
            {activePage === 'apps' && <AdminApps ADM={ADM} />}
            {activePage === 'users' && <AdminUsers ADM={ADM} OvKpi={OvKpi} currentUser={currentUser} />}
            {activePage === 'widget' && <AdminInstall onPreview={handlePreview} events={events} />}
            {activePage === 'settings' && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
                <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${ADM.border}`, padding: '48px 56px', textAlign: 'center', maxWidth: 460 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><AdmIcon name="mountain" size={46} color="#94A3B8" strokeWidth={1.5} /></div>
                  <h2 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 26, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .5, margin: '0 0 10px' }}>Profile Settings</h2>
                  <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, lineHeight: 1.6, margin: 0 }}>Personal info, security, and preferences — coming soon.</p>
                </div>
              </div>
            )}

            {activePage === 'events' && <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', letterSpacing: .5 }}>Event Manager</h1>
                  <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>Changes sync instantly to the widget.</p>
                </div>
                <button onClick={() => setModal('create')} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: ADM.radiusMd,
                  border: 'none', background: ADM.primary, color: '#fff',
                  fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .5,
                  cursor: 'pointer', boxShadow: '0 4px 14px rgba(41,65,84,.3)',
                }}>
                  <AdmIcon name="plus" size={16} />
                  Create Event
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                <StatCard label="Total Events" value={events.length} sub={`${counts.upcoming} upcoming`} />
                <StatCard label="Total Sold" value={totalSold} color={ADM.success} />
                <StatCard label="Est. Gross" value={`$${totalGross.toLocaleString()}`} color={ADM.primary} />
                <StatCard label="Drafts" value={counts.draft} color={ADM.warning} />
              </div>

              {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: ADM.radius, padding: '12px 16px', marginBottom: 16, color: ADM.danger, fontSize: 14 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusTabs value={statusTab} onChange={setStatusTab} counts={counts} />
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ height: 38, borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, padding: '0 12px', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, background: '#fff', outline: 'none', cursor: 'pointer' }}>
                  <option value="all">All Categories</option>
                  {CATS_ALL.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: ADM.radius, padding: '0 12px', height: 38, border: `1px solid ${ADM.border}` }}>
                  <AdmIcon name="search" size={14} color="#94A3B8" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
                    style={{ border: 'none', outline: 'none', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, flex: 1, background: 'transparent' }} />
                </div>
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light }}>{filtered.length} events</span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: ADM.muted }}>
                  <span style={{ width: 24, height: 24, border: `3px solid ${ADM.border}`, borderTopColor: ADM.primary, borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
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
                        {filtered.length === 0 ? (
                          <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', fontFamily: 'Nunito,system-ui', fontSize: 15, color: ADM.light }}>
                            {events.length === 0 ? 'No events yet. Click "Create Event" to add your first.' : 'No events match the current filters.'}
                          </td></tr>
                        ) : filtered.map(ev => {
                          const s = getStatus(ev)
                          return (
                            <tr key={ev.id} style={{ background: '#fff', borderBottom: `1px solid ${ADM.border}`, transition: 'background .12s', cursor: 'default' }}
                              onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                              onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, lineHeight: 1.15 }}>{ev.titleEn}</div>
                                <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light, marginTop: 2 }}>{ev.date} · {ev.location}</div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, color: ADM.text }}>{sold(ev)}</div>
                                <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.light }}>of {ev.totalSpots}</div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, color: ev.isFree ? ADM.light : ADM.primary }}>
                                  {ev.isFree ? '—' : `$${gross(ev).toLocaleString()}`}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 16, background: `${STATUS_COLOR[s]}18`, color: STATUS_COLOR[s], fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>
                                  {STATUS_LABEL[s]}
                                </span>
                              </td>
                              <td style={{ padding: '14px 12px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => setModal(ev)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${ADM.primary}30`, background: `${ADM.primary}10`, color: ADM.primary, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = ADM.primary; e.currentTarget.style.color = '#fff' }}
                                    onMouseOut={e => { e.currentTarget.style.background = `${ADM.primary}10`; e.currentTarget.style.color = ADM.primary }}>
                                    Edit
                                  </button>
                                  <button onClick={() => setDelTarget(ev)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${ADM.danger}30`, background: `${ADM.danger}10`, color: ADM.danger, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = ADM.danger; e.currentTarget.style.color = '#fff' }}
                                    onMouseOut={e => { e.currentTarget.style.background = `${ADM.danger}10`; e.currentTarget.style.color = ADM.danger }}>
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>}
          </div>
        </main>

        {modal && <EventModal event={modal === 'create' ? null : modal} token={token} onClose={() => setModal(null)} onSaved={() => loadEvents(token)} />}
        {delTarget && <DeleteConfirm event={delTarget} onConfirm={() => deleteEvent(delTarget)} onCancel={() => setDelTarget(null)} />}
      </div>
    </>
  )
}
