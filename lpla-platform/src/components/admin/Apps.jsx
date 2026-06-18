'use client'
import { useState, useEffect, useRef } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'

function LogoClover({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#1DA462" />
      <g fill="#fff">
        <circle cx="17.5" cy="17.5" r="7" />
        <circle cx="30.5" cy="17.5" r="7" />
        <circle cx="17.5" cy="30.5" r="7" />
        <circle cx="30.5" cy="30.5" r="7" />
        <circle cx="24" cy="24" r="4.5" fill="#1DA462" />
        <rect x="22" y="36" width="4" height="6" rx="2" />
      </g>
    </svg>
  )
}

function LogoKlaviyo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#191919" />
      <path d="M14 10h6v12.5l10-12.5h7.5l-11 13.5L37.5 38H30l-10-12.8V38h-6V10z" fill="#fff" />
    </svg>
  )
}

function LogoTwilio({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#F22F46" />
      <circle cx="24" cy="24" r="12" fill="#fff" />
      <circle cx="24" cy="24" r="4" fill="#F22F46" />
      <circle cx="24" cy="15" r="2.8" fill="#F22F46" />
      <circle cx="24" cy="33" r="2.8" fill="#F22F46" />
      <circle cx="15" cy="24" r="2.8" fill="#F22F46" />
      <circle cx="33" cy="24" r="2.8" fill="#F22F46" />
    </svg>
  )
}

const APP_DEFS = [
  {
    id: 'clover', name: 'Clover', logo: <LogoClover size={40} />,
    category: 'Payment Processing', brand: '#1DA462',
    tagline: 'Secure card-present & online payments for every booking.',
    description: 'Clover processes all ticket purchases in the booking widget — credit, debit, and digital wallets. Revenue flows directly to your Clover merchant account.',
    handles: ['Payment processing', 'Refunds', 'Offline / box-office sales'],
    docUrl: 'https://www.clover.com',
    fields: [{ id: 'merchant_id', label: 'Merchant ID', placeholder: 'CLVR-XXXXXXXX', secret: false }, { id: 'api_key', label: 'API Key', placeholder: '••••••••••••••••', secret: true }],
  },
  {
    id: 'klaviyo', name: 'Klaviyo', logo: <LogoKlaviyo size={40} />,
    category: 'Email & SMS', brand: '#191919',
    tagline: 'Branded email campaigns and transactional SMS from one platform.',
    description: 'Klaviyo powers all LPLA confirmation emails, event reminders, volunteer onboarding flows and broadcast newsletters. Subscriber data syncs automatically on every booking.',
    handles: ['Booking confirmation email', 'Event reminder emails', 'Volunteer welcome series', 'Cancellation / refund emails', 'SMS reminders (via Klaviyo SMS add-on)'],
    docUrl: 'https://www.klaviyo.com',
    fields: [{ id: 'api_key', label: 'Private API Key', placeholder: 'pk_••••••••••••••••', secret: true }, { id: 'list_id', label: 'Default List ID', placeholder: 'AbCdEf', secret: false }],
  },
  {
    id: 'twilio', name: 'Twilio', logo: <LogoTwilio size={40} />,
    category: 'SMS Notifications', brand: '#F22F46',
    tagline: 'Reliable SMS delivery for time-sensitive event messages.',
    description: 'Twilio sends individual transactional SMS: booking confirmations, 24h reminders, last-minute updates, and volunteer sign-up confirmations — direct to any phone number.',
    handles: ['Booking confirmation SMS', '24-hour event reminder SMS', '2-hour event reminder SMS', 'Volunteer sign-up SMS', 'Cancellation / change alerts'],
    docUrl: 'https://www.twilio.com',
    fields: [{ id: 'account_sid', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxxxxxx', secret: false }, { id: 'auth_token', label: 'Auth Token', placeholder: '••••••••••••••••', secret: true }, { id: 'from_number', label: 'From Number', placeholder: '+1 503 555 0100', secret: false }],
  },
]

const AUTOMATIONS = [
  { id: 'booking_confirmed', trigger: 'Event Booking Confirmed', triggerIcon: 'ticket',
    description: 'Customer completes checkout in the booking widget.',
    actions: [
      { app: 'clover', label: 'Charge card & record payment', timing: 'Immediately' },
      { app: 'klaviyo', label: 'Send booking confirmation email', timing: 'Immediately' },
      { app: 'twilio', label: 'Send confirmation SMS', timing: 'Immediately' },
    ] },
  { id: 'reminder_48h', trigger: 'Event Reminder — 48 hours out', triggerIcon: 'clock',
    description: 'Attendee has a confirmed booking for an event starting in 48 hours.',
    actions: [
      { app: 'klaviyo', label: 'Send reminder email with event details & directions', timing: '48 h before' },
      { app: 'twilio', label: 'Send reminder SMS with event name & time', timing: '48 h before' },
    ] },
  { id: 'reminder_2h', trigger: 'Event Reminder — 2 hours out', triggerIcon: 'clock',
    description: 'Last-minute SMS nudge with meeting point and any last-minute info.',
    actions: [
      { app: 'twilio', label: 'Send last-minute SMS with meeting point', timing: '2 h before' },
    ] },
  { id: 'volunteer_signup', trigger: 'Volunteer Sign-Up Submitted', triggerIcon: 'people',
    description: 'Customer submits the volunteer sign-up form.',
    actions: [
      { app: 'klaviyo', label: 'Send volunteer welcome email + what to expect', timing: 'Immediately' },
      { app: 'klaviyo', label: 'Add to "Volunteers" Klaviyo segment', timing: 'Immediately' },
      { app: 'twilio', label: 'Send volunteer confirmation SMS', timing: 'Immediately' },
    ] },
  { id: 'event_cancelled', trigger: 'Event Cancelled or Postponed', triggerIcon: 'x',
    description: 'Admin cancels or reschedules an event from the Event Manager.',
    actions: [
      { app: 'klaviyo', label: 'Email all confirmed attendees with details + refund info', timing: 'Immediately' },
      { app: 'twilio', label: 'SMS all attendees with cancellation notice', timing: 'Immediately' },
      { app: 'clover', label: 'Trigger bulk refund to original payment method', timing: 'Immediately' },
    ] },
  { id: 'booking_cancelled', trigger: 'Individual Order Cancelled / Refunded', triggerIcon: 'refund',
    description: 'Admin cancels or refunds a single order from Attendees & Bookings.',
    actions: [
      { app: 'clover', label: 'Process refund to original payment method', timing: 'Immediately' },
      { app: 'klaviyo', label: 'Send refund confirmation email with timeline', timing: 'Immediately' },
      { app: 'twilio', label: 'Send cancellation / refund SMS', timing: 'Immediately' },
    ] },
  { id: 'spot_opened', trigger: 'Waitlist — Spot Becomes Available', triggerIcon: 'bolt',
    description: 'A cancellation opens a spot for the next person on the waitlist.',
    actions: [
      { app: 'klaviyo', label: 'Email next waitlist attendee with booking link (24 h window)', timing: 'Immediately' },
      { app: 'twilio', label: 'SMS next waitlist attendee with urgent booking link', timing: 'Immediately' },
    ] },
]

const DEMO_PHONE = '+1 503 ••• 5678'

function TwoFAModal({ appName, appBrand, onVerified, onCancel, ADM }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [sending, setSending] = useState(true)
  const [sent, setSent] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [show, setShow] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r) }, [])
  useEffect(() => {
    const t = setTimeout(() => { setSending(false); setSent(true); inputRefs.current[0]?.focus() }, 1200)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (!sent || countdown <= 0) return
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [sent, countdown])

  function resend() {
    setSending(true); setSent(false); setCountdown(30); setCode(['','','','','','']); setError('')
    setTimeout(() => { setSending(false); setSent(true); inputRefs.current[0]?.focus() }, 1100)
  }

  function onKey(i, e) {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }

  function onInput(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...code]; next[i] = v
    setCode(next); setError('')
    if (v && i < 5) inputRefs.current[i + 1]?.focus()
    if (next.every(d => d) && next.join('').length === 6) verify(next.join(''))
  }

  function onPaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) { setCode(text.split('')); setError(''); setTimeout(() => verify(text), 50) }
  }

  function verify(full) {
    const digits = full || code.join('')
    if (digits.length < 6) { setError('Enter all 6 digits.'); return }
    setVerifying(true); setError('')
    setTimeout(() => { setVerifying(false); onVerified() }, 900)
  }

  function close() { setShow(false); setTimeout(onCancel, 240) }

  return (
    <>
      <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(11,26,40,.55)', zIndex: 800, opacity: show ? 1 : 0, transition: 'opacity .24s' }} />
      <div style={{ position: 'fixed', left: '50%', top: '50%', transform: `translate(-50%, ${show ? '-50%' : '-44%'})`, opacity: show ? 1 : 0, transition: 'transform .26s cubic-bezier(.4,0,.2,1), opacity .24s', zIndex: 801, width: 'min(420px, 92vw)', background: '#fff', borderRadius: ADM.radiusLg, boxShadow: '0 24px 60px rgba(0,0,0,.22)', overflow: 'hidden' }}>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${appBrand}, ${appBrand}99)` }} />
        <div style={{ padding: '28px 32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${appBrand}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AdmIcon name="lock" size={20} color={appBrand} />
            </div>
            <div>
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 20, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .4 }}>Verify your identity</div>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted }}>to connect {appName}</div>
            </div>
          </div>
          <div style={{ background: ADM.bg, borderRadius: ADM.radius, padding: '12px 14px', margin: '16px 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AdmIcon name="phone" size={16} color={ADM.muted} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13.5, color: ADM.text, lineHeight: 1.5 }}>
              {sending
                ? <><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: `2px solid ${ADM.border}`, borderTopColor: ADM.primary, animation: 'spin 1s linear infinite', marginRight: 7, verticalAlign: 'middle' }} />Sending verification code…</>
                : <>A 6-digit code has been sent to <strong>{DEMO_PHONE}</strong>. Enter it below to authorize connecting {appName}.</>
              }
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', margin: '22px 0 8px' }} onPaste={onPaste}>
            {[0,1,2,3,4,5].map(i => (
              <input key={i} ref={el => inputRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={2} value={code[i]}
                onChange={e => onInput(i, e.target.value)}
                onKeyDown={e => onKey(i, e)}
                onPaste={onPaste}
                style={{
                  width: 48, height: 56, borderRadius: 10, textAlign: 'center',
                  fontFamily: 'Barlow Condensed,system-ui', fontSize: 26, fontWeight: 800, color: ADM.text,
                  border: `2px solid ${error ? ADM.danger : code[i] ? appBrand : ADM.border}`,
                  outline: 'none', background: '#fff', transition: 'border-color .15s',
                }} />
            ))}
          </div>
          {error && <div style={{ textAlign: 'center', fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.danger, fontWeight: 700, marginBottom: 8 }}>{error}</div>}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            {countdown > 0
              ? <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.light }}>Resend code in {countdown}s</span>
              : <button onClick={resend} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito,system-ui', fontSize: 12.5, fontWeight: 700, color: ADM.primary, textDecoration: 'underline' }}>Resend code</button>
            }
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => verify('')} disabled={verifying || sending}
              style={{ flex: 1, height: 46, borderRadius: ADM.radius, border: 'none', background: verifying ? `${appBrand}99` : appBrand, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 17, fontWeight: 800, letterSpacing: .4, cursor: verifying || sending ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, transition: 'background .2s' }}>
              {verifying
                ? <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Verifying…</>
                : <><AdmIcon name="lock" size={16} color="#fff" /> Verify &amp; connect</>
              }
            </button>
            <button onClick={close}
              style={{ height: 46, padding: '0 20px', borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, background: '#fff', color: ADM.muted, fontFamily: 'Nunito,system-ui', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 11.5, color: ADM.light, textAlign: 'center', margin: '14px 0 0', lineHeight: 1.5 }}>
            This step protects your account. API keys grant access to payments and customer data — we verify it's really you before saving them.
          </p>
        </div>
      </div>
    </>
  )
}

const SK = 'lpla_apps_v1'
function loadState() { try { return JSON.parse(localStorage.getItem(SK) || '{}') } catch { return {} } }
function saveState(s) { try { localStorage.setItem(SK, JSON.stringify(s)) } catch {} }

function AppCard({ def, connected, onConnect, onDisconnect, ADM }) {
  const [expanded, setExpanded] = useState(false)
  const [fields, setFields] = useState(() => {
    const s = loadState()[def.id] || {}
    return def.fields.reduce((o, f) => ({ ...o, [f.id]: s[f.id] || '' }), {})
  })
  const [saving, setSaving] = useState(false)
  const [show2FA, setShow2FA] = useState(false)

  function handleConnectClick() {
    if (connected) { setExpanded(e => !e) } else { setShow2FA(true) }
  }
  function on2FAVerified() { setShow2FA(false); setExpanded(true) }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      const st = loadState(); st[def.id] = { ...fields, __connected: true }; saveState(st)
      setSaving(false); onConnect(def.id)
    }, 700)
  }

  function handleDisconnect() {
    const st = loadState(); delete st[def.id]; saveState(st)
    onDisconnect(def.id); setExpanded(false)
  }

  return (
    <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${connected ? def.brand + '33' : ADM.border}`, overflow: 'hidden', transition: 'box-shadow .2s' }}>
      <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ flexShrink: 0 }}>{def.logo}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 20, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .4 }}>{def.name}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 12, background: connected ? `${ADM.success}1a` : ADM.border, color: connected ? ADM.success : ADM.muted, fontFamily: 'Barlow Condensed,system-ui', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: connected ? ADM.success : ADM.light }} />
              {connected ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: def.brand, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{def.category}</div>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 13.5, color: ADM.muted, margin: 0, lineHeight: 1.5 }}>{def.tagline}</p>
        </div>
        <button onClick={handleConnectClick}
          style={{ flexShrink: 0, height: 38, padding: '0 16px', borderRadius: ADM.radius, border: `1px solid ${connected ? def.brand + '44' : ADM.border}`, background: connected ? `${def.brand}0e` : '#fff', color: connected ? def.brand : ADM.text, fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all .15s', letterSpacing: .3 }}>
          {connected ? 'Configure' : 'Connect'}
          <AdmIcon name="chevronDown" size={14} color={connected ? def.brand : ADM.muted} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
        </button>
      </div>
      <div style={{ padding: '0 22px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {def.handles.map(h =>
          <span key={h} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 14, background: ADM.bg, border: `1px solid ${ADM.border}`, fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 600, color: ADM.muted }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: def.brand, flexShrink: 0 }} />{h}
          </span>
        )}
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${ADM.border}`, padding: '20px 22px' }}>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>API Credentials</div>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, margin: '0 0 16px', lineHeight: 1.55 }}>{def.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginBottom: 18 }}>
            {def.fields.map(f =>
              <div key={f.id}>
                <label style={{ display: 'block', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, color: ADM.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: .6 }}>{f.label}</label>
                <input type={f.secret && connected ? 'password' : 'text'} value={fields[f.id]} onChange={e => setFields(fv => ({ ...fv, [f.id]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', height: 40, borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, padding: '0 12px', fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, color: ADM.text, background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 22px', borderRadius: ADM.radius, border: 'none', background: saving ? `${def.brand}99` : def.brand, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, cursor: saving ? 'wait' : 'pointer', letterSpacing: .4, transition: 'background .2s' }}>
              {saving
                ? <><span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin 1s linear infinite' }} /> Saving…</>
                : 'Save credentials'}
            </button>
            {connected &&
              <button onClick={handleDisconnect}
                style={{ height: 40, padding: '0 18px', borderRadius: ADM.radius, border: `1px solid ${ADM.border}`, background: '#fff', color: ADM.danger, fontFamily: 'Nunito,system-ui', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
                Disconnect
              </button>
            }
            <a href={def.docUrl} target="_blank" rel="noopener" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: ADM.muted, textDecoration: 'none' }}>
              <AdmIcon name="launch" size={14} color={ADM.muted} /> Docs
            </a>
          </div>
        </div>
      )}
      {show2FA && <TwoFAModal appName={def.name} appBrand={def.brand} onVerified={on2FAVerified} onCancel={() => setShow2FA(false)} ADM={ADM} />}
    </div>
  )
}

const APP_CHIP_STYLES = {
  clover: { bg: '#1DA46214', color: '#1DA462', label: 'Clover' },
  klaviyo: { bg: '#19191914', color: '#555', label: 'Klaviyo' },
  twilio: { bg: '#F22F4614', color: '#F22F46', label: 'Twilio' },
}

function AppChip({ appId }) {
  const s = APP_CHIP_STYLES[appId] || { bg: '#eee', color: '#666', label: appId }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 10, background: s.bg, fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: .5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />{s.label}
    </span>
  )
}

function AutomationRow({ flow, enabled, onToggle, ADM }) {
  const [open, setOpen] = useState(false)
  const uniqueApps = [...new Set(flow.actions.map(a => a.app))]
  return (
    <div style={{ borderBottom: `1px solid ${ADM.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: enabled ? `${ADM.primary}14` : '#F1EFE8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AdmIcon name={flow.triggerIcon} size={18} color={enabled ? ADM.primary : ADM.light} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 15, fontWeight: 800, color: ADM.text, textTransform: 'uppercase', letterSpacing: .3, marginBottom: 3 }}>{flow.trigger}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {uniqueApps.map(a => <AppChip key={a} appId={a} />)}
            <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: ADM.light, alignSelf: 'center' }}>· {flow.actions.length} action{flow.actions.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        <div onClick={e => { e.stopPropagation(); onToggle(flow.id) }}
          style={{ width: 42, height: 24, borderRadius: 12, background: enabled ? ADM.success : '#CBD5E1', position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: enabled ? 21 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
        </div>
        <AdmIcon name="chevronDown" size={15} color={ADM.light} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </div>
      {open && (
        <div style={{ padding: '0 20px 16px 70px' }}>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: ADM.muted, margin: '0 0 14px', lineHeight: 1.5 }}>{flow.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderLeft: `2px solid ${ADM.border}`, marginLeft: 8 }}>
            {flow.actions.map((action, i) => {
              const def = APP_DEFS.find(d => d.id === action.app)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0 10px 16px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -6, top: 14, width: 10, height: 10, borderRadius: '50%', background: def ? def.brand : ADM.border, border: '2px solid #fff', flexShrink: 0 }} />
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: def ? `${def.brand}15` : '#eee', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {def && <svg width="14" height="14" viewBox="0 0 48 48">{def.id === 'clover' ? <><circle cx="17.5" cy="17.5" r="7" fill="#1DA462" /><circle cx="30.5" cy="17.5" r="7" fill="#1DA462" /><circle cx="17.5" cy="30.5" r="7" fill="#1DA462" /><circle cx="30.5" cy="30.5" r="7" fill="#1DA462" /></> : def.id === 'klaviyo' ? <path d="M14 10h6v12.5l10-12.5h7.5l-11 13.5L37.5 38H30l-10-12.8V38h-6V10z" fill="#191919" /> : <><circle cx="24" cy="24" r="12" fill="#F22F46" /><circle cx="24" cy="24" r="4" fill="#fff" /><circle cx="24" cy="16" r="2.5" fill="#fff" /><circle cx="24" cy="32" r="2.5" fill="#fff" /><circle cx="16" cy="24" r="2.5" fill="#fff" /><circle cx="32" cy="24" r="2.5" fill="#fff" /></>}</svg>}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, fontWeight: 700, color: ADM.text }}>{action.label}</div>
                    <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11.5, color: ADM.light, marginTop: 2 }}>{action.timing} · via {def?.name || action.app}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminApps({ ADM }) {
  const SK_CONN = 'lpla_apps_connected_v1'
  const SK_AUTO = 'lpla_apps_auto_v1'
  function loadConn() { try { return JSON.parse(localStorage.getItem(SK_CONN) || '{}') } catch { return {} } }
  function loadAuto() { try { return JSON.parse(localStorage.getItem(SK_AUTO) || '{}') } catch { return {} } }
  const [connected, setConnected] = useState(loadConn)
  const [autoEnabled, setAutoEnabled] = useState(() => {
    const saved = loadAuto()
    return AUTOMATIONS.reduce((o, f) => ({ ...o, [f.id]: saved[f.id] !== false }), {})
  })

  function onConnect(id) {
    const next = { ...connected, [id]: true }; setConnected(next)
    localStorage.setItem(SK_CONN, JSON.stringify(next))
  }
  function onDisconnect(id) {
    const next = { ...connected, [id]: false }; setConnected(next)
    localStorage.setItem(SK_CONN, JSON.stringify(next))
  }
  function onToggle(id) {
    const next = { ...autoEnabled, [id]: !autoEnabled[id] }; setAutoEnabled(next)
    localStorage.setItem(SK_AUTO, JSON.stringify(next))
  }

  const connCount = Object.values(connected).filter(Boolean).length
  const autoCount = Object.values(autoEnabled).filter(Boolean).length

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflow: 'auto', background: ADM.bg }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 28, fontWeight: 800, color: ADM.text, margin: 0, textTransform: 'uppercase', letterSpacing: .5 }}>Apps &amp; Integrations</h1>
          <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: ADM.muted, margin: '4px 0 0' }}>Connect your tools and automate what happens when someone books, signs up, or cancels.</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Apps connected', value: `${connCount} / ${APP_DEFS.length}`, color: connCount === APP_DEFS.length ? ADM.success : ADM.warning },
            { label: 'Automations on', value: `${autoCount} / ${AUTOMATIONS.length}`, color: ADM.primary },
          ].map(s =>
            <div key={s.label} style={{ textAlign: 'center', background: ADM.card, borderRadius: ADM.radius, padding: '10px 20px', border: `1px solid ${ADM.border}` }}>
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 11.5, color: ADM.light, marginTop: 3 }}>{s.label}</div>
            </div>
          )}
        </div>
      </div>

      {connCount === 0 &&
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: `${ADM.warning}12`, border: `1px solid ${ADM.warning}44`, borderRadius: ADM.radius, padding: '14px 18px', marginBottom: 22 }}>
          <AdmIcon name="bolt" size={18} color={ADM.warning} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 13.5, color: ADM.text, lineHeight: 1.55 }}>
            <strong>No apps connected yet.</strong> Connect Clover to start processing payments, then add Klaviyo and Twilio to send automated confirmation and reminder messages.
          </div>
        </div>
      }

      <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Integrations</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
        {APP_DEFS.map(def =>
          <AppCard key={def.id} def={def} connected={!!connected[def.id]} onConnect={onConnect} onDisconnect={onDisconnect} ADM={ADM} />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 800, color: ADM.light, textTransform: 'uppercase', letterSpacing: 1 }}>Automations</div>
        <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12.5, color: ADM.muted }}>Toggle flows on/off · expand to see each action</div>
      </div>
      <div style={{ background: ADM.card, borderRadius: ADM.radiusMd, border: `1px solid ${ADM.border}`, overflow: 'hidden' }}>
        {AUTOMATIONS.map(flow =>
          <AutomationRow key={flow.id} flow={flow} enabled={autoEnabled[flow.id]} onToggle={onToggle} ADM={ADM} />
        )}
      </div>
    </div>
  )
}
