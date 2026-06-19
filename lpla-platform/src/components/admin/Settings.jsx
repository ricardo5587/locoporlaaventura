'use client'
import { useState, useEffect, useRef, Fragment } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { ADM } from '@/lib/tokens'

const SET_ORG = 'Loco Por La Aventura'

function SettingsBadge({ label = 'Verified', color = ADM.success }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 9px', borderRadius:12,
      background:`${color}18`, border:`1px solid ${color}44`, color,
      fontFamily:'Barlow Condensed,system-ui', fontSize:11.5, fontWeight:800, letterSpacing:.4, textTransform:'uppercase' }}>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="6" fill={color} fillOpacity=".18" />
        <path d="M3 6l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  )
}

function SettingsCard({ title, action, onAction, actionIcon, children, fullWidth, style = {} }) {
  return (
    <div style={{ background:ADM.card, borderRadius:ADM.radiusMd, border:`1px solid ${ADM.border}`,
      overflow:'hidden', gridColumn: fullWidth ? 'span 2' : undefined, ...style }}>
      {title && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 20px', borderBottom:`1px solid ${ADM.border}` }}>
          <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800,
            color:ADM.text, textTransform:'uppercase', letterSpacing:.5 }}>{title}</span>
          {action && (
            <button onClick={onAction} style={{ display:'inline-flex', alignItems:'center', gap:6,
              background:'transparent', border:`1px solid ${ADM.border}`, borderRadius:8, padding:'5px 12px',
              cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:12.5, fontWeight:700, color:ADM.primary }}>
              {actionIcon && <AdmIcon name={actionIcon} size={13} color={ADM.primary} />}
              {action}
            </button>
          )}
        </div>
      )}
      <div style={{ padding:'18px 20px' }}>{children}</div>
    </div>
  )
}

function InfoCallout({ text }) {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', background:'#EEF4FB',
      borderLeft:`3px solid ${ADM.blue}`, borderRadius:`0 ${ADM.radius}px ${ADM.radius}px 0`,
      padding:'10px 14px', marginTop:12 }}>
      <AdmIcon name="bulb" size={15} color={ADM.blue} style={{ flexShrink:0, marginTop:2 }} />
      <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'#3B6EA8', lineHeight:1.5 }}>{text}</span>
    </div>
  )
}

function Row({ label, value, badge, link, onLink, linkLabel = 'Edit', muted }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
      padding:'10px 0', borderTop:`1px solid ${ADM.border}` }}>
      <div style={{ minWidth:0 }}>
        <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:ADM.muted,
          textTransform:'uppercase', letterSpacing:.6, marginBottom:3 }}>{label}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:14, color: muted ? ADM.light : ADM.text,
            wordBreak:'break-all' }}>{value}</span>
          {badge && <SettingsBadge label={badge.label} color={badge.color} />}
        </div>
      </div>
      {link && (
        <button onClick={onLink} style={{ flexShrink:0, display:'inline-flex', alignItems:'center', gap:5,
          background:'transparent', border:'none', cursor:'pointer', fontFamily:'Nunito,system-ui',
          fontSize:12.5, fontWeight:700, color:ADM.primary, padding:'4px 0' }}>
          <AdmIcon name="pencil" size={13} color={ADM.primary} /> {linkLabel}
        </button>
      )}
    </div>
  )
}

function UserAvatar({ initials, size = 64 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0,
      background:`linear-gradient(135deg, ${ADM.primary} 0%, ${ADM.blue} 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:`0 4px 16px ${ADM.primary}44` }}>
      <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:size*.38, fontWeight:800,
        color:'#fff', letterSpacing:1 }}>{initials}</span>
    </div>
  )
}

function Breadcrumb({ steps }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16 }}>
      {steps.map((s, i) => (
        <Fragment key={i}>
          {i > 0 && <AdmIcon name="chevronRight" size={13} color={ADM.light} />}
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color: i === steps.length-1 ? ADM.text : ADM.muted,
            fontWeight: i === steps.length-1 ? 700 : 500 }}>{s}</span>
        </Fragment>
      ))}
    </div>
  )
}

function SettingsOverview({ user }) {
  const [editPersonal, setEditPersonal] = useState(false)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [savedName, setSavedName] = useState(user.firstName + ' ' + user.lastName)
  const [saving, setSaving] = useState(false)

  function handleSave() {
    setSaving(true)
    setTimeout(() => { setSavedName(firstName + ' ' + lastName); setSaving(false); setEditPersonal(false) }, 700)
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:22,
        background:ADM.card, borderRadius:ADM.radiusMd, border:`1px solid ${ADM.border}`, padding:'20px 24px' }}>
        <UserAvatar initials={user.avatar} size={60} />
        <div>
          <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:26, fontWeight:800,
            color:ADM.text, textTransform:'uppercase', letterSpacing:.4, lineHeight:1.1 }}>{savedName}</div>
          <div style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.muted, marginTop:4, lineHeight:1.5 }}>
            View and manage your personal information, security and preferences here.
          </div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10, background:'#EEF4FB',
        border:`1px solid ${ADM.blue}33`, borderRadius:ADM.radius, padding:'11px 16px', marginBottom:20 }}>
        <AdmIcon name="shield" size={16} color={ADM.blue} />
        <span style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:'#3B6EA8', lineHeight:1.4 }}>
          Your user settings is managed by your organization, <strong>{SET_ORG}</strong>.
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ background:ADM.card, borderRadius:ADM.radiusMd, border:`1px solid ${ADM.border}`, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'14px 20px', borderBottom:`1px solid ${ADM.border}` }}>
            <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800,
              color:ADM.text, textTransform:'uppercase', letterSpacing:.5 }}>Personal information</span>
            {!editPersonal && (
              <button onClick={() => setEditPersonal(true)} style={{ display:'inline-flex', alignItems:'center', gap:6,
                background:'transparent', border:`1px solid ${ADM.border}`, borderRadius:8, padding:'5px 12px',
                cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:12.5, fontWeight:700, color:ADM.primary }}>
                <AdmIcon name="pencil" size={13} color={ADM.primary} /> Edit
              </button>
            )}
          </div>
          <div style={{ padding:'18px 20px' }}>
            {editPersonal ? (
              <>
                <Breadcrumb steps={['Overview', 'Personal information']} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  {[['First name', firstName, setFirstName], ['Last name', lastName, setLastName]].map(([lbl, val, set]) => (
                    <div key={lbl}>
                      <label style={{ display:'block', fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700,
                        color:ADM.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:.6 }}>{lbl}</label>
                      <input value={val} onChange={e => set(e.target.value)}
                        style={{ width:'100%', height:38, borderRadius:ADM.radius, border:`1px solid ${ADM.border}`,
                          padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.text,
                          outline:'none', boxSizing:'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:9 }}>
                  <button onClick={handleSave} disabled={saving}
                    style={{ height:36, padding:'0 18px', borderRadius:ADM.radius, border:'none',
                      background:ADM.primary, color:'#fff', cursor:'pointer',
                      fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, letterSpacing:.3,
                      display:'inline-flex', alignItems:'center', gap:7 }}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button onClick={() => { setFirstName(user.firstName); setLastName(user.lastName); setEditPersonal(false) }}
                    style={{ height:36, padding:'0 16px', borderRadius:ADM.radius, border:`1px solid ${ADM.border}`,
                      background:'transparent', cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:13.5,
                      fontWeight:700, color:ADM.muted }}>Reset</button>
                </div>
              </>
            ) : (
              <>
                <Row label="Email address" value={user.email} badge={{ label:'Verified', color:ADM.success }} />
                <Row label="Full name" value={savedName} />
                <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${ADM.border}` }}>
                  <button style={{ display:'inline-flex', alignItems:'center', gap:7, height:36, padding:'0 15px',
                    borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:'transparent',
                    cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:12.5, fontWeight:700, color:ADM.muted }}>
                    <AdmIcon name="pencil" size={13} color={ADM.muted} /> Edit email address
                  </button>
                  <p style={{ fontFamily:'Nunito,system-ui', fontSize:11.5, color:ADM.light, margin:'8px 0 0', lineHeight:1.5 }}>
                    Changing your email requires re-verification via the new address.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <SettingsCard title="Two-factor authentication" action="Edit" actionIcon="pencil">
          <Row label="Phone number" value={user.phone} badge={{ label:'Verified', color:ADM.success }} link onLink={()=>{}} linkLabel="Edit" />
          <Row label="Verification method" value="Text message (SMS)" />
          <Row label="Authenticator app" value="Not enrolled" muted link onLink={()=>{}} linkLabel="Enroll" />
        </SettingsCard>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <SettingsCard title="Password">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <span style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.muted, lineHeight:1.5 }}>
              Reset your password via a secure link sent to your email address.
            </span>
            <button style={{ display:'inline-flex', alignItems:'center', gap:8, height:40, padding:'0 20px',
              borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:'transparent',
              cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800,
              color:ADM.primary, letterSpacing:.3 }}>
              Send reset link <AdmIcon name="arrowRight" size={15} color={ADM.primary} />
            </button>
          </div>
        </SettingsCard>

        <SettingsCard title="Need support?">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <span style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.muted, lineHeight:1.5 }}>
              Browse guides, FAQs and contact our team through the LPLA Help Center.
            </span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:8, height:40, padding:'0 20px',
              borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:'transparent',
              fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800,
              color:ADM.text, letterSpacing:.3, cursor:'pointer' }}>
              Help center <AdmIcon name="launch" size={14} color={ADM.muted} />
            </span>
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}

function SettingsSecurity({ user }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:10 }}>
        <h2 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:26, fontWeight:800, color:ADM.text,
          margin:0, textTransform:'uppercase', letterSpacing:.4 }}>Security</h2>
      </div>

      <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${ADM.border}`, marginBottom:20 }}>
        <button style={{ padding:'10px 20px', border:'none', borderBottom:`2.5px solid ${ADM.primary}`,
          background:'transparent', cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:14,
          fontWeight:700, color:ADM.primary, marginBottom:-1 }}>
          Two-factor authentication
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button style={{ display:'inline-flex', alignItems:'center', gap:8, height:38, padding:'0 16px',
            borderRadius:ADM.radius, border:'none', background:ADM.primary, color:'#fff', cursor:'pointer',
            fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, letterSpacing:.3 }}>
            <AdmIcon name="plus" size={15} color="#fff" /> Add authentication app
          </button>
        </div>

        <SettingsCard title="Phone-based verification">
          <Row label="How do you want to receive your 2FA code?" value="Text message (SMS)"
            link onLink={()=>{}} linkLabel="Edit" />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
            padding:'10px 0', borderTop:`1px solid ${ADM.border}` }}>
            <div>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:700, color:ADM.muted,
                textTransform:'uppercase', letterSpacing:.6, marginBottom:3 }}>Phone number</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text }}>{user.phone}</span>
                <SettingsBadge label="Verified" color={ADM.success} />
              </div>
            </div>
            <button style={{ flexShrink:0, display:'inline-flex', alignItems:'center', gap:5,
              background:'transparent', border:'none', cursor:'pointer', fontFamily:'Nunito,system-ui',
              fontSize:12.5, fontWeight:700, color:ADM.danger }}>
              <AdmIcon name="reset" size={13} color={ADM.danger} /> Reset
            </button>
          </div>
        </SettingsCard>

        <SettingsCard title="Remembered browsers">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <span style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.muted, lineHeight:1.5 }}>
              Remove all trusted browsers. You&apos;ll be asked to verify via 2FA on your next login from any device.
            </span>
            <button style={{ display:'inline-flex', alignItems:'center', gap:8, height:40, padding:'0 16px',
              borderRadius:ADM.radius, border:`1px solid ${ADM.danger}44`, background:`${ADM.danger}0a`,
              cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:13.5, fontWeight:700, color:ADM.danger }}>
              <AdmIcon name="trash" size={15} color={ADM.danger} /> Forget all remembered browsers
            </button>
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}

const TZ_OPTIONS = [
  'America/Los_Angeles','America/Denver','America/Chicago','America/New_York',
  'America/Bogota','America/Lima','America/Caracas','America/Santiago',
  'America/Sao_Paulo','America/Argentina/Buenos_Aires','Pacific/Auckland',
  'Europe/London','Europe/Madrid',
]

function SettingsPreferences() {
  const [tz, setTz] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'America/Los_Angeles' }
  })
  const [tzQuery, setTzQ] = useState('')
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const ref = useRef()

  const filtered = TZ_OPTIONS.filter(t => t.toLowerCase().includes(tzQuery.toLowerCase()))

  function save() { setSaved(true); setOpen(false); setTimeout(() => setSaved(false), 2000) }

  useEffect(() => {
    function click(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', click)
    return () => document.removeEventListener('mousedown', click)
  }, [])

  return (
    <div>
      <h2 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:26, fontWeight:800, color:ADM.text,
        margin:'0 0 20px', textTransform:'uppercase', letterSpacing:.4 }}>Preferences</h2>

      <div style={{ maxWidth: 520 }}>
        <SettingsCard title="Console timezone">
          <p style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.muted, margin:'0 0 14px', lineHeight:1.6 }}>
            Select the timezone used to display dates and times across the dashboard.
          </p>
          <div ref={ref} style={{ position:'relative', marginBottom:14 }}>
            <div onClick={() => setOpen(o => !o)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:40,
                borderRadius:ADM.radius, border:`1.5px solid ${open ? ADM.primary : ADM.border}`,
                padding:'0 12px', background:'#fff', cursor:'pointer', transition:'border-color .15s' }}>
              <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:13, color:ADM.text }}>{tz}</span>
              <AdmIcon name="chevronDown" size={14} color={ADM.muted} style={{ transform: open ? 'rotate(180deg)':'none', transition:'transform .2s' }} />
            </div>
            {open && (
              <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'#fff',
                borderRadius:ADM.radiusMd, border:`1px solid ${ADM.border}`, boxShadow:'0 8px 28px rgba(0,0,0,.12)',
                zIndex:50, overflow:'hidden' }}>
                <div style={{ padding:'8px 10px', borderBottom:`1px solid ${ADM.border}` }}>
                  <input value={tzQuery} onChange={e => setTzQ(e.target.value)} placeholder="Search timezone…" autoFocus
                    style={{ width:'100%', height:34, borderRadius:8, border:`1px solid ${ADM.border}`,
                      padding:'0 10px', fontFamily:'Nunito,system-ui', fontSize:13, outline:'none', boxSizing:'border-box' }} />
                </div>
                <div style={{ maxHeight:200, overflowY:'auto' }}>
                  {filtered.length === 0 && <div style={{ padding:'14px', fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.light }}>No matches.</div>}
                  {filtered.map(t => (
                    <div key={t} onClick={() => { setTz(t); setTzQ(''); setOpen(false) }}
                      style={{ padding:'9px 14px', fontFamily:'ui-monospace,Menlo,monospace', fontSize:13,
                        color: t === tz ? ADM.primary : ADM.text, fontWeight: t === tz ? 700 : 400,
                        background: t === tz ? `${ADM.primary}0c` : 'transparent', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'space-between' }}
                      onMouseOver={e => { e.currentTarget.style.background = `${ADM.primary}0a` }}
                      onMouseOut={e => { e.currentTarget.style.background = t === tz ? `${ADM.primary}0c` : 'transparent' }}>
                      {t}
                      {t === tz && <AdmIcon name="check" size={14} color={ADM.primary} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <InfoCallout text="This setting only affects how dates and times display in the dashboard. It does not affect API responses or the Billing section." />
          <button onClick={save} style={{ marginTop:14, display:'inline-flex', alignItems:'center', gap:8,
            height:38, padding:'0 18px', borderRadius:ADM.radius, border:'none',
            background: saved ? ADM.success : ADM.primary, color:'#fff', cursor:'pointer',
            fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, letterSpacing:.3, transition:'background .2s' }}>
            {saved ? <><AdmIcon name="check" size={15} color="#fff" /> Saved!</> : 'Save timezone'}
          </button>
        </SettingsCard>
      </div>
    </div>
  )
}

const NAV = [
  { id:'overview', label:'Overview', icon:'user' },
  { id:'security', label:'Security', icon:'shield' },
  { id:'preferences', label:'Preferences', icon:'settings' },
]

const SECTION_TITLES = { overview:'Overview', security:'Security', preferences:'Preferences' }

export default function AdminSettings({ currentUser }) {
  const [section, setSection] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)

  const user = {
    firstName: currentUser?.name?.split(' ')[0] || 'User',
    lastName: currentUser?.name?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: '+1 503 ••• 5678',
    avatar: ((currentUser?.name?.[0] || 'U') + (currentUser?.name?.split(' ')[1]?.[0] || '')).toUpperCase(),
  }

  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden', background:ADM.bg }}>
      <div style={{ width: collapsed ? 56 : 200, flexShrink:0, background:ADM.card,
        borderRight:`1px solid ${ADM.border}`, display:'flex', flexDirection:'column',
        transition:'width .22s cubic-bezier(.4,0,.2,1)', overflow:'hidden' }}>

        <div style={{ padding: collapsed ? '18px 14px' : '18px 16px', borderBottom:`1px solid ${ADM.border}`, overflow:'hidden', whiteSpace:'nowrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <AdmIcon name="settings" size={18} color={ADM.primary} style={{ flexShrink:0 }} />
            {!collapsed && <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight:800,
              color:ADM.muted, textTransform:'uppercase', letterSpacing:1 }}>User Settings</span>}
          </div>
        </div>

        <nav style={{ padding:'12px 8px', flex:1 }}>
          {NAV.map(n => {
            const active = section === n.id
            return (
              <button key={n.id} onClick={() => setSection(n.id)} title={collapsed ? n.label : ''}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius:9, border:'none', cursor:'pointer', marginBottom:2, transition:'all .15s', textAlign:'left',
                  background: active ? `${ADM.navAccent}1e` : 'transparent',
                  color: active ? ADM.navAccent : ADM.muted }}>
                <AdmIcon name={n.icon} size={17} color={active ? ADM.navAccent : ADM.light} style={{ flexShrink:0 }} />
                {!collapsed && <span style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, fontWeight: active ? 700 : 500,
                  whiteSpace:'nowrap', overflow:'hidden' }}>{n.label}</span>}
              </button>
            )
          })}
        </nav>

        <button onClick={() => setCollapsed(c => !c)}
          style={{ margin:'8px', padding:'9px', borderRadius:9, border:`1px solid ${ADM.border}`,
            background:'transparent', cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent: collapsed ? 'center' : 'flex-end', gap:6, color:ADM.muted,
            fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:600, transition:'all .15s' }}>
          <AdmIcon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={15} color={ADM.light} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:'28px 36px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.muted }}>Settings</span>
          <AdmIcon name="chevronRight" size={13} color={ADM.light} />
          <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, fontWeight:700, color:ADM.text }}>{SECTION_TITLES[section]}</span>
        </div>

        {section === 'overview' && <SettingsOverview user={user} />}
        {section === 'security' && <SettingsSecurity user={user} />}
        {section === 'preferences' && <SettingsPreferences />}
      </div>
    </div>
  )
}
