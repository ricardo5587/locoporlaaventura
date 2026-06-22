'use client'
import { useState, useEffect, useCallback } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { OvKpi } from '@/components/admin/Overview'
import { ADM } from '@/lib/tokens'

const API = 'https://locoporlaaventura.vercel.app'

const ROLE_LABELS = { owner: 'Owner', editor: 'Editor', viewer: 'Viewer' }
const ROLE_COLORS = {
  owner:  { color: '#B32317', bg: 'rgba(179,35,23,.1)',   border: 'rgba(179,35,23,.28)' },
  editor: { color: '#3F6CA8', bg: 'rgba(94,139,189,.13)', border: 'rgba(94,139,189,.3)' },
  viewer: { color: '#6B7280', bg: 'rgba(107,114,128,.12)', border: 'rgba(107,114,128,.28)' },
}
const STATUS_COLORS = {
  active:    { color: '#5E7A0C', bg: 'rgba(94,122,12,.13)' },
  pending:   { color: '#D9831F', bg: 'rgba(217,131,31,.13)' },
  suspended: { color: '#8A8578', bg: 'rgba(138,133,120,.16)' },
}
const AVATAR_COLORS = ['#294154','#546207','#5E8BBD','#A54399','#00897A','#695136','#B32317']

function generatePassword(len = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => chars[b % chars.length]).join('')
}

function RoleBadge({ role }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.viewer;
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 16, background: c.bg, border: `1px solid ${c.border}`, color: c.color, fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>
      {ROLE_LABELS[role]}
    </span>
  )
}

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

function InviteModal({ ADM, token, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: generatePassword(), role: 'editor' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPw, setShowPw] = useState(true)

  const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  async function handleSave() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (!form.password) errs.password = 'Required'
    else if (form.password.length < 8) errs.password = 'Min 8 characters'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true); setErrors({})
    try {
      const r = await fetch(`${API}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed to create user')
      onSaved()
      onClose()
    } catch (e) { setErrors({ _form: e.message }) }
    setSaving(false)
  }

  const inputStyle = (field) => ({ width: '100%', borderRadius: 10, border: `1px solid ${errors[field] ? ADM.danger : ADM.border}`, padding: '0 12px', height: 40, fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.text, background: '#fff', outline: 'none', boxSizing: 'border-box' })
  const labelStyle = { display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }
  const errStyle = { fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.danger, marginTop: 4 }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500, backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 501, background: '#fff', borderRadius: 18, boxShadow: '0 30px 90px rgba(0,0,0,.25)', width: 'min(480px,94vw)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: `1px solid ${ADM.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 22, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .5 }}>Invite User</div>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, marginTop: 2 }}>Add a new team member to the platform.</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', fontSize: 20, color: ADM.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
        </div>
        <form autoComplete="off" onSubmit={e => { e.preventDefault(); handleSave() }} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errors._form && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', color: '#B32317', fontSize: 13 }}>{errors._form}</div>}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input name="lpla_invite_name" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Jane Doe" autoComplete="off" style={inputStyle('name')} />
            {errors.name && <div style={errStyle}>{errors.name}</div>}
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" name="lpla_invite_email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="jane@example.com" autoComplete="off" style={inputStyle('email')} />
            {errors.email && <div style={errStyle}>{errors.email}</div>}
          </div>
          <div>
            <label style={labelStyle}>Phone (for 2FA)</label>
            <input name="lpla_invite_phone" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+1 555 123 4567" autoComplete="off" style={inputStyle('phone')} />
            {errors.phone && <div style={errStyle}>{errors.phone}</div>}
          </div>
          <div>
            <label style={labelStyle}>Temporary Password</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input type={showPw ? 'text' : 'password'} name="lpla_invite_pw" value={form.password} onChange={e => setF('password', e.target.value)} autoComplete="new-password" style={inputStyle('password')} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: ADM.muted, fontSize: 12, fontFamily: 'Nunito,system-ui', fontWeight: 600 }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <button type="button" onClick={() => setF('password', generatePassword())} style={{ padding: '0 12px', borderRadius: 10, border: `1px solid ${ADM.border}`, background: '#F8FAFC', cursor: 'pointer', color: ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                Generate
              </button>
            </div>
            {errors.password && <div style={errStyle}>{errors.password}</div>}
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11, color: ADM.light, marginTop: 4 }}>Share this password securely with the user. They can change it after signing in.</div>
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select value={form.role} onChange={e => setF('role', e.target.value)} style={inputStyle('role')}>
              <option value="editor">Editor — can manage events &amp; attendees</option>
              <option value="viewer">Viewer — read-only access</option>
              <option value="owner">Owner — full access including user management</option>
            </select>
          </div>
        </form>
        <div style={{ padding: '16px 28px', borderTop: `1px solid ${ADM.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', color: ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: ADM.primary, color: '#fff', cursor: saving ? 'default' : 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .4, opacity: saving ? .7 : 1 }}>
            {saving ? 'Sending...' : 'Invite User'}
          </button>
        </div>
      </div>
    </>
  )
}

function ResetPwModal({ ADM, token, user, onClose, onDone }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tempPw, setTempPw] = useState(null)

  async function handleReset() {
    setSaving(true); setError('')
    try {
      const newPw = generatePassword()
      const r = await fetch(`${API}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: newPw }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Failed') }
      setTempPw(newPw)
      onDone()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  function copyPw() {
    if (tempPw) navigator.clipboard?.writeText(tempPw)
  }

  return (
    <>
      <div onClick={tempPw ? undefined : onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 501, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.2)', width: 'min(440px,90vw)', padding: 28 }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 20, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', marginBottom: 6 }}>Reset Password</div>
        {error && <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '8px 12px', color: '#B32317', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {tempPw ? (
          <>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, marginBottom: 14 }}>
              A new temporary password was generated for <strong>{user.name}</strong>. Copy it now — it won't be shown again.
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#F1F5F9', borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
              <code style={{ flex: 1, fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 14, color: ADM.text, wordBreak: 'break-all' }}>{tempPw}</code>
              <button onClick={copyPw} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${ADM.border}`, background: '#fff', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, whiteSpace: 'nowrap' }}>Copy</button>
            </div>
            <button onClick={onClose} style={{ width: '100%', height: 42, borderRadius: 10, border: 'none', background: ADM.primary, color: '#fff', cursor: 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, letterSpacing: .4 }}>Done</button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, marginBottom: 18 }}>
              This will generate a new temporary password for <strong>{user.name}</strong>. You'll need to share it with them securely.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, color: ADM.muted }}>Cancel</button>
              <button onClick={handleReset} disabled={saving} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: '#B32317', color: '#fff', cursor: 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, letterSpacing: .4, opacity: saving ? .7 : 1 }}>
                {saving ? 'Generating...' : 'Generate New Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default function AdminUsers({ currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('lpla_admin_token') : ''

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setUsers(await r.json())
    } catch {}
    setLoading(false)
  }

  async function toggleActive(user) {
    const action = user.active ? 'suspend' : 'reactivate'
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}? ${user.active ? 'They will lose access immediately.' : ''}`)) return
    try {
      const r = await fetch(`${API}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !user.active }),
      })
      if (!r.ok) { const d = await r.json(); setToast(d.error || 'Failed'); return }
      setToast(user.active ? `${user.name} suspended` : `${user.name} reactivated`)
      loadUsers()
    } catch { setToast('Action failed') }
  }

  async function deleteUser(user) {
    if (!confirm(`Remove ${user.name}? This cannot be undone.`)) return
    try {
      const r = await fetch(`${API}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!r.ok) { const d = await r.json(); setToast(d.error || 'Failed'); return }
      setToast(`${user.name} removed`)
      loadUsers()
    } catch { setToast('Action failed') }
  }

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', letterSpacing: .5 }}>User Management</h1>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>Manage team access, roles and passwords.</p>
        </div>
        <button onClick={() => setShowInvite(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 14,
          border: 'none', background: ADM.primary, color: '#fff',
          fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .5,
          cursor: 'pointer', boxShadow: '0 4px 14px rgba(41,65,84,.3)',
        }}>
          <AdmIcon name="plus" size={16} />
          Invite User
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <OvKpi label="Total Users" value={users.length} icon="team" accent="#294154" sub="Across the team" />
        <OvKpi label="Active" value={users.filter(u => u.active).length} icon="check" accent="#5E7A0C" sub="Currently enabled" />
        <OvKpi label="Owners" value={users.filter(u => u.role === 'owner').length} icon="key" accent="#B32317" sub="Full-access admins" />
        <OvKpi label="Pending Invites" value={users.filter(u => !u.active).length} icon="mail" accent="#D9831F" sub="Awaiting sign-up" />
      </div>

      {/* Roles legend */}
      <div style={{ background: ADM.card, borderRadius: 10, border: `1px solid ${ADM.border}`, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 800, color: ADM.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Role Permissions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            ['Owner', 'Full access: events, attendees, contacts, apps, user management'],
            ['Editor', 'Can manage events, attendees, and contacts'],
            ['Viewer', 'Read-only access to all sections'],
          ].map(([r, desc]) => (
            <div key={r} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <RoleBadge role={r.toLowerCase()} ADM={ADM} />
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted, lineHeight: 1.4 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search + role filter */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <AdmIcon name="search" size={15} color={ADM.muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            style={{ width: '100%', height: 38, borderRadius: 10, border: `1px solid ${ADM.border}`, padding: '0 12px 0 36px', fontFamily: 'Nunito,system-ui', fontSize: 13.5, color: ADM.text, background: ADM.card, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['all', 'All'], ['owner', 'Owners'], ['editor', 'Editors'], ['viewer', 'Viewers']].map(([val, label]) => (
            <button key={val} onClick={() => setRoleFilter(val)}
              style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${roleFilter === val ? ADM.primary : ADM.border}`, background: roleFilter === val ? `${ADM.primary}12` : 'transparent', color: roleFilter === val ? ADM.primary : ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: ADM.muted }}>
          <span style={{ width: 24, height: 24, border: `3px solid ${ADM.border}`, borderTopColor: ADM.primary, borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${ADM.border}` }}>
                {['User', 'Role', 'Status', 'Added', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1.2, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', fontFamily: 'Nunito,system-ui', fontSize: 15, color: ADM.light }}>{users.length === 0 ? 'No users found. Click "Invite User" to add the first admin.' : 'No users match your filters.'}</td></tr>
              ) : filtered.map(u => {
                const statusKey = u.active ? 'active' : 'pending';
                const sc = STATUS_COLORS[statusKey];
                const avColor = AVATAR_COLORS[(u.id || 0) % 7];
                return (
                <tr key={u.id} style={{ background: '#fff', borderBottom: `1px solid ${ADM.border}`, opacity: u.active ? 1 : .7 }}
                  onMouseOver={e => e.currentTarget.style.background = '#FAFAF7'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: avColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: '#fff' }}>{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, color: ADM.text }}>
                          {u.name}
                          {currentUser?.userId === u.id && <span style={{ marginLeft: 6, fontSize: 11, color: ADM.muted, fontWeight: 600 }}>(you)</span>}
                        </div>
                        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}><RoleBadge role={u.role} /></td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 16, background: sc.bg, color: sc.color, fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.color }} />
                      {u.active ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted }}>
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setResetTarget(u)} title="Reset password"
                        style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${ADM.primary}30`, background: `${ADM.primary}10`, color: ADM.primary, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Reset PW
                      </button>
                      {currentUser?.userId !== u.id && (
                        <>
                          <button onClick={() => toggleActive(u)} title={u.active ? 'Suspend' : 'Reactivate'}
                            style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${ADM.warning}30`, background: `${ADM.warning}10`, color: ADM.warning, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {u.active ? 'Suspend' : 'Reactivate'}
                          </button>
                          <button onClick={() => deleteUser(u)} title="Remove user"
                            style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${ADM.danger}30`, background: `${ADM.danger}10`, color: ADM.danger, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            Remove
                          </button>
                        </>
                      )}
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

      {showInvite && <InviteModal ADM={ADM} token={token} onClose={() => setShowInvite(false)} onSaved={() => { loadUsers(); setToast('Invitation sent') }} />}
      {resetTarget && <ResetPwModal ADM={ADM} token={token} user={resetTarget} onClose={() => setResetTarget(null)} onDone={() => { loadUsers(); setToast('Password reset') }} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
