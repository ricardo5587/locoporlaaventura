'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AdmIcon from '@/components/AdmIcon'

const API = 'https://locoporlaaventura.vercel.app'
const TODAY = new Date().toISOString().slice(0, 10)

const ADM = {
  bg: '#F7F6F1', sidebar: '#2B353F', card: '#FFFFFF', border: '#E6E1D5',
  text: '#2B353F', muted: '#6B7280', light: '#A0998C',
  primary: '#294154', navAccent: '#A8B84A',
  success: '#5E7A0C', danger: '#B32317', warning: '#D9831F',
  lime: '#919832',
  radius: 10, radiusMd: 14, radiusLg: 18,
}

const CAT_COLORS = {
  Escalada: '#294154', Senderismo: '#546207', Taller: '#A54399',
  Keynote: '#5E8BBD', Social: '#D9831F', 'Expedición': '#B32317', Voluntario: '#00897A',
}
const CATS = ['Escalada', 'Senderismo', 'Taller', 'Keynote', 'Social', 'Expedición', 'Voluntario']

function getStatus(ev) {
  if (ev.draft) return 'draft'
  if (ev.date < TODAY) return 'past'
  if ((ev.spotsLeft || 0) === 0 && ev.totalSpots > 0) return 'full'
  return 'active'
}
function sold(ev) { return Math.max(0, (ev.totalSpots || 0) - (ev.spotsLeft || 0)) }
function gross(ev) { return ev.isFree ? 0 : sold(ev) * (ev.price || 0) }

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, padding: '20px 22px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: ADM.light, fontFamily: 'Barlow Condensed,system-ui', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || ADM.text, fontFamily: 'Barlow Condensed,system-ui', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: ADM.muted, fontFamily: 'Nunito,system-ui', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── StatusTabs ────────────────────────────────────────────────────────────────
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

// ── TicketRow ─────────────────────────────────────────────────────────────────
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
        ? <button onClick={onRemove} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${ADM.border}`, background: '#fff', cursor: 'pointer', color: ADM.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>&#xd7;</button>
        : <div />}
    </div>
  )
}

// ── Event Modal ───────────────────────────────────────────────────────────────
const EMPTY = {
  titleEn: '', titleEs: '', descEn: '', descEs: '',
  date: '', time: '7:00 AM', location: '', category: 'Escalada',
  isFree: false, price: 0, totalSpots: 20, draft: false,
  tickets: [{ id: 'general', en: 'General Admission', es: 'Entrada General', price: 0 }],
}

function EventModal({ event, token, onClose, onSaved }) {
  const isEdit = !!event
  const [form, setForm] = useState(isEdit ? {
    titleEn: event.titleEn || '', titleEs: event.titleEs || '',
    descEn: event.descEn || '', descEs: event.descEs || '',
    date: event.date || '', time: event.time || '7:00 AM',
    location: event.location || '', category: event.category || 'Escalada',
    isFree: event.isFree || false, price: event.price || 0,
    totalSpots: event.totalSpots || 20, draft: event.draft || false,
    tickets: event.tickets?.length ? event.tickets : EMPTY.tickets,
  } : { ...EMPTY })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', fontSize: 20, color: ADM.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&#xd7;</button>
        </div>

        <div style={{ overflow: 'auto', flex: 1, padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Titles */}
            {[['titleEn', 'Event Title (English)', true], ['titleEs', 'Título del Evento (Español)', false]].map(([k, l, req]) => (
              <div key={k}>
                <label style={labelStyle}>{l}{req && <span style={{ color: ADM.danger }}> *</span>}</label>
                <input value={form[k]} onChange={e => setF(k, e.target.value)} style={{ ...inputStyle, borderColor: errors[k] ? ADM.danger : ADM.border }} />
                {errors[k] && <div style={{ fontSize: 11, color: ADM.danger, marginTop: 3 }}>{errors[k]}</div>}
              </div>
            ))}

            {/* Descriptions */}
            {[['descEn', 'Description (English)'], ['descEs', 'Descripción (Español)']].map(([k, l]) => (
              <div key={k}>
                <label style={labelStyle}>{l}</label>
                <textarea value={form[k]} onChange={e => setF(k, e.target.value)} rows={3} style={{ ...inputStyle, height: 'auto', padding: '8px 12px', resize: 'vertical' }} />
              </div>
            ))}

            {/* Date / Time / Location / Category / Spots */}
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
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Total Spots</label>
              <input type="number" value={form.totalSpots} onChange={e => setF('totalSpots', e.target.value)} style={inputStyle} />
            </div>

            {/* Pricing row */}
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

            {/* Tickets */}
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

// ── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ event, onConfirm, onCancel }) {
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 600 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 601, background: '#fff', borderRadius: ADM.radiusMd, boxShadow: '0 20px 60px rgba(0,0,0,.2)', width: 'min(400px,90vw)', padding: '28px' }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 20, fontWeight: 800, color: ADM.text, textAlign: 'center', marginBottom: 8 }}>Delete Event?</div>
        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
          <strong>"{event.titleEn}"</strong> will be permanently removed.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 42, borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, color: ADM.muted }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, height: 42, borderRadius: ADM.radius, border: 'none', background: ADM.danger, color: '#fff', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700 }}>Delete</button>
        </div>
      </div>
    </>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ activePage, onNav, onLogout, eventCount }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'events', label: 'Events', icon: 'calendar', badge: eventCount },
    { id: 'attendees', label: 'Attendees', icon: 'people' },
    { id: 'contacts', label: 'Contacts', icon: 'user' },
    { id: 'apps', label: 'Apps', icon: 'apps' },
  ]

  return (
    <div style={{ width: 240, background: ADM.sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="LPLA" style={{ height: 34, filter: 'brightness(0) invert(1)' }} onError={e => e.target.style.display = 'none'} />
          <div>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: .5, lineHeight: 1 }}>LPLA</div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflow: 'auto' }}>
        {navItems.map(item => {
          const active = activePage === item.id
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 14px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', border: 'none',
              background: active ? 'rgba(168,184,74,.18)' : 'transparent',
              color: active ? ADM.navAccent : 'rgba(255,255,255,.5)',
              fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, textAlign: 'left',
              transition: 'all .15s',
            }}
              onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
              onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
              {active && <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, borderRadius: 2, background: ADM.navAccent }} />}
              <AdmIcon name={item.icon} size={16} />
              {item.label}
              {item.badge != null && (
                <span style={{ marginLeft: 'auto', background: active ? ADM.navAccent : 'rgba(255,255,255,.15)', color: active ? '#fff' : 'rgba(255,255,255,.6)', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}

        {/* Launch */}
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginTop: 6,
          padding: '9px 14px', borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(168,184,74,.25)',
          background: 'transparent', color: 'rgba(168,184,74,.6)',
          fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, textAlign: 'left',
          transition: 'all .15s',
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(168,184,74,.6)'; e.currentTarget.style.color = '#A8B84A' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(168,184,74,.25)'; e.currentTarget.style.color = 'rgba(168,184,74,.6)' }}>
          <AdmIcon name="launch" size={16} />
          Launch
          <AdmIcon name="chevronRight" size={14} style={{ marginLeft: 'auto' }} />
        </button>
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#294154,#546207)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: '#fff' }}>A</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Admin</div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: 'rgba(255,255,255,.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>ricardo8755@gmail.com</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: '100%', padding: '9px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.12)', background: 'transparent', color: 'rgba(255,255,255,.5)', fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
          Log out
        </button>
      </div>
    </div>
  )
}

// ── Main admin page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activePage, setActivePage] = useState('events')
  const [statusTab, setStatusTab] = useState('upcoming')
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [delTarget, setDelTarget] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('lpla_admin_token')
    if (!t) { router.push('/admin/login'); return }
    setToken(t)
    loadEvents(t)
  }, [])

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
    router.push('/admin/login')
  }

  async function deleteEvent(ev) {
    await fetch(`${API}/api/events/${ev.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setDelTarget(null)
    loadEvents(token)
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Nunito:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${ADM.bg}; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'Nunito,system-ui', background: ADM.bg, overflow: 'hidden' }}>

        <Sidebar activePage={activePage} onNav={setActivePage} onLogout={logout} eventCount={counts.upcoming} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ height: 52, background: ADM.sidebar, borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
            <div>
              <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,.9)' }}>Events</span>
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: 'rgba(255,255,255,.4)', marginLeft: 12 }}>Live &middot; {events.length} events synced</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px', background: ADM.bg }}>
            {/* Page header */}
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

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
              <StatCard label="Total Events" value={events.length} sub={`${counts.upcoming} upcoming`} />
              <StatCard label="Total Sold" value={totalSold} color={ADM.success} />
              <StatCard label="Est. Gross" value={`$${totalGross.toLocaleString()}`} color={ADM.primary} />
              <StatCard label="Drafts" value={counts.draft} color={ADM.warning} />
            </div>

            {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: ADM.radius, padding: '12px 16px', marginBottom: 16, color: ADM.danger, fontSize: 14 }}>{error}</div>}

            {/* Controls */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusTabs value={statusTab} onChange={setStatusTab} counts={counts} />
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ height: 38, borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, padding: '0 12px', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, background: '#fff', outline: 'none', cursor: 'pointer' }}>
                <option value="all">All Categories</option>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: ADM.radius, padding: '0 12px', height: 38, border: `1px solid ${ADM.border}` }}>
                <AdmIcon name="search" size={14} color="#94A3B8" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
                  style={{ border: 'none', outline: 'none', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.text, flex: 1, background: 'transparent' }} />
              </div>
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light }}>{filtered.length} events</span>
            </div>

            {/* Table */}
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
          </div>
        </div>

        {modal && <EventModal event={modal === 'create' ? null : modal} token={token} onClose={() => setModal(null)} onSaved={() => loadEvents(token)} />}
        {delTarget && <DeleteConfirm event={delTarget} onConfirm={() => deleteEvent(delTarget)} onCancel={() => setDelTarget(null)} />}
      </div>
    </>
  )
}
