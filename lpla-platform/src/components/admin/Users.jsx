'use client'
import { useState, useEffect } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'

const API = 'https://locoporlaaventura.vercel.app'

const ROLE_LABELS = { owner: 'Owner', editor: 'Editor', viewer: 'Viewer' }
const ROLE_COLORS = { owner: '#B32317', editor: '#294154', viewer: '#6B7280' }

function RoleBadge({ role, ADM }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 16, background: `${ROLE_COLORS[role]}18`, color: ROLE_COLORS[role], fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>
      {ROLE_LABELS[role]}
    </span>
  )
}

function InviteModal({ ADM, token, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'editor' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.name || !form.email || !form.phone || !form.password) { setError('All fields are required'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setSaving(true); setError('')
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
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const inputStyle = { width: '100%', borderRadius: 10, border: `1px solid ${ADM.border}`, padding: '0 12px', height: 40, fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.text, background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }

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
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', color: '#B32317', fontSize: 13 }}>{error}</div>}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Jane Doe" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="jane@example.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone (for 2FA)</label>
            <input value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+1 555 123 4567" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Temporary Password</label>
            <input type="password" value={form.password} onChange={e => setF('password', e.target.value)} placeholder="Min 8 characters" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select value={form.role} onChange={e => setF('role', e.target.value)} style={inputStyle}>
              <option value="editor">Editor — can manage events &amp; attendees</option>
              <option value="viewer">Viewer — read-only access</option>
              <option value="owner">Owner — full access including user management</option>
            </select>
          </div>
        </div>
        <div style={{ padding: '16px 28px', borderTop: `1px solid ${ADM.border}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 22px', borderRadius: 10, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', color: ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: ADM.primary, color: '#fff', cursor: saving ? 'default' : 'pointer', fontFamily: 'Barlow Condensed,system-ui', fontSize: 16, fontWeight: 800, letterSpacing: .4, opacity: saving ? .7 : 1 }}>
            {saving ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>
    </>
  )
}

function ResetPwModal({ ADM, token, user, onClose, onDone }) {
  const [pw, setPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    if (pw.length < 8) { setError('Password must be at least 8 characters'); return }
    setSaving(true); setError('')
    try {
      const r = await fetch(`${API}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: pw }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error || 'Failed') }
      onDone()
      onClose()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  const inputStyle = { width: '100%', borderRadius: 10, border: `1px solid ${ADM.border}`, padding: '0 12px', height: 40, fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.text, background: '#fff', outline: 'none', boxSizing: 'border-box' }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 501, background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,.2)', width: 'min(400px,90vw)', padding: 28 }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 20, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', marginBottom: 6 }}>Reset Password</div>
        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, marginBottom: 18 }}>Set a new password for <strong>{user.name}</strong></div>
        {error && <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '8px 12px', color: '#B32317', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="New password (min 8 chars)" style={{ ...inputStyle, marginBottom: 18 }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 10, border: `1px solid ${ADM.border}`, background: 'transparent', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 600, color: ADM.muted }}>Cancel</button>
          <button onClick={handleReset} disabled={saving} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: ADM.primary, color: '#fff', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, opacity: saving ? .7 : 1 }}>
            {saving ? 'Saving...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function AdminUsers({ ADM, OvKpi, currentUser }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
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
    await fetch(`${API}/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !user.active }),
    })
    loadUsers()
  }

  async function deleteUser(user) {
    if (!confirm(`Remove ${user.name}? This cannot be undone.`)) return
    await fetch(`${API}/api/users/${user.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    loadUsers()
  }

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        <OvKpi label="Total Users" value={users.length} ADM={ADM} />
        <OvKpi label="Active" value={users.filter(u => u.active).length} color={ADM.success} ADM={ADM} />
        <OvKpi label="Owners" value={users.filter(u => u.role === 'owner').length} color="#B32317" ADM={ADM} />
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: ADM.muted }}>
          <span style={{ width: 24, height: 24, border: `3px solid ${ADM.border}`, borderTopColor: ADM.primary, borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ background: ADM.card, borderRadius: 14, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${ADM.border}` }}>
                {['User', 'Role', 'Status', 'Added', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'Barlow Condensed,system-ui', fontSize: 11, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1.2, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: 'center', fontFamily: 'Nunito,system-ui', fontSize: 15, color: ADM.light }}>No users found. Click "Invite User" to add the first admin.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ background: '#fff', borderBottom: `1px solid ${ADM.border}` }}
                  onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${ROLE_COLORS[u.role]},${ADM.primary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, color: '#fff' }}>{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, color: ADM.text }}>{u.name} {currentUser?.userId === u.id && <span style={{ fontSize: 11, color: ADM.muted }}>(you)</span>}</div>
                        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.muted }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}><RoleBadge role={u.role} ADM={ADM} /></td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 16, background: u.active ? `${ADM.success}18` : '#E5E7EB', color: u.active ? ADM.success : ADM.muted, fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                      {u.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => setResetTarget(u)} title="Reset password"
                        style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${ADM.primary}30`, background: `${ADM.primary}10`, color: ADM.primary, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Reset PW
                      </button>
                      {currentUser?.userId !== u.id && (
                        <>
                          <button onClick={() => toggleActive(u)} title={u.active ? 'Disable' : 'Enable'}
                            style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${ADM.warning}30`, background: `${ADM.warning}10`, color: ADM.warning, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {u.active ? 'Disable' : 'Enable'}
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && <InviteModal ADM={ADM} token={token} onClose={() => setShowInvite(false)} onSaved={loadUsers} />}
      {resetTarget && <ResetPwModal ADM={ADM} token={token} user={resetTarget} onClose={() => setResetTarget(null)} onDone={loadUsers} />}
    </div>
  )
}
