'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://locoporlaaventura.vercel.app'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focus, setFocus] = useState('')

  const [show2FA, setShow2FA] = useState(false)
  const [pendingToken, setPendingToken] = useState('')
  const [digits, setDigits] = useState(['','','','','',''])
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const digitRefs = useRef([])
  const countdownRef = useRef(null)

  const [showForgot, setShowForgot] = useState(false)
  const [forgotStep, setForgotStep] = useState('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [resetDigits, setResetDigits] = useState(['','','','','',''])
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const resetDigitRefs = useRef([])

  useEffect(() => {
    const token = localStorage.getItem('lpla_admin_token')
    if (token) router.replace('/admin')
  }, [router])

  useEffect(() => {
    if (show2FA) {
      setCountdown(30)
      setCanResend(false)
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(countdownRef.current); setCanResend(true); return 0 }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(countdownRef.current)
  }, [show2FA])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Invalid credentials')
      setPendingToken(data.pendingToken)
      setShow2FA(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDigitChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = v; setDigits(next)
    if (v && i < 5) digitRefs.current[i + 1]?.focus()
  }

  function handleDigitKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) digitRefs.current[i - 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = ['','','','','','']
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setDigits(next)
    digitRefs.current[Math.min(text.length, 5)]?.focus()
  }

  async function handleVerify() {
    const code = digits.join('')
    if (code.length !== 6) { setVerifyError('Enter all 6 digits'); return }
    setVerifyError(''); setVerifying(true)
    try {
      const res = await fetch(`${API}/api/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, pendingToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || data.error || 'Verification failed')
      const token = data.token || data.accessToken || data.jwt
      if (!token) throw new Error('No token returned')
      localStorage.setItem('lpla_admin_token', token)
      router.replace('/admin')
    } catch (err) {
      setVerifyError(err.message)
    } finally {
      setVerifying(false)
    }
  }

  async function handleResend() {
    try {
      await fetch(`${API}/api/auth/2fa/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingToken }),
      })
      setShow2FA(false)
      setTimeout(() => setShow2FA(true), 50)
    } catch {}
  }

  async function handleForgotSubmit() {
    setForgotError(''); setForgotLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.resetToken) setResetToken(data.resetToken)
      setForgotStep('code')
    } catch (err) { setForgotError(err.message) }
    setForgotLoading(false)
  }

  async function handleResetPassword() {
    const code = resetDigits.join('')
    if (code.length !== 6) { setForgotError('Enter all 6 digits'); return }
    if (newPw.length < 8) { setForgotError('Password must be at least 8 characters'); return }
    if (newPw !== confirmPw) { setForgotError('Passwords do not match'); return }
    setForgotError(''); setForgotLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, resetToken, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed')
      setForgotStep('done')
    } catch (err) { setForgotError(err.message) }
    setForgotLoading(false)
  }

  function handleResetDigitChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...resetDigits]; next[i] = v; setResetDigits(next)
    if (v && i < 5) resetDigitRefs.current[i + 1]?.focus()
  }

  function closeForgot() {
    setShowForgot(false); setForgotStep('email'); setForgotEmail(''); setForgotError('')
    setResetDigits(['','','','','','']); setNewPw(''); setConfirmPw('')
  }

  const fieldWrap = (name) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(255,255,255,.04)',
    border: `1px solid ${focus === name ? 'rgba(145,152,50,.7)' : 'rgba(255,255,255,.10)'}`,
    boxShadow: focus === name ? '0 0 0 3px rgba(145,152,50,.15)' : 'none',
    borderRadius: 12, padding: '0 14px', height: 50, transition: 'all .18s',
  })
  const inputStyle = {
    flex: 1, border: 'none', outline: 'none', background: 'transparent',
    color: '#EEF2F0', fontFamily: 'Nunito,system-ui', fontSize: 15, height: '100%',
  }
  const labelStyle = {
    display: 'block', fontFamily: 'Barlow Condensed,system-ui', fontSize: 12,
    fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
    color: '#8B97A0', marginBottom: 7,
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Nunito:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #222B33; }
        @keyframes admspin { to { transform: rotate(360deg); } }
        @media (max-width: 880px) { .adm-login-brand { display: none !important; } }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #2B353F inset !important; -webkit-text-fill-color: #EEF2F0 !important; }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', background: '#222B33', position: 'relative', overflow: 'hidden' }}>

        {/* Left brand panel */}
        <div className="adm-login-brand" style={{
          flex: '1 1 50%', position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(160deg,#2B353F 0%,#1C242B 60%,#161D22 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 30,
          padding: '96px 56px 48px',
        }}>
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 760, height: 540, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(145,152,50,.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .5, pointerEvents: 'none' }} viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice">
            {[.16,.27,.38,.49,.60,.71,.82].map((t, i) => {
              const y = 900 * t, amp = 40 + i * 6
              return <path key={i} d={`M0 ${y} Q200 ${y - amp} 400 ${y} Q600 ${y + amp} 800 ${y}`} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1.5" />
            })}
          </svg>

          <div style={{ position: 'absolute', top: 44, left: 56, zIndex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="LPLA" style={{ height: 46, width: 'auto', filter: 'drop-shadow(0 3px 10px rgba(0,0,0,.5))' }} />
            <div>
              <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 19, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: .5, lineHeight: 1 }}>Loco Por La Aventura</div>
              <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: '#7C8893', fontWeight: 600, letterSpacing: .4, marginTop: 2 }}>Management Platform</div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 440 }}>
            <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#919832', marginBottom: 14 }}>Admin Dashboard</div>
            <h1 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 42, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: .5, lineHeight: 1.04, margin: '0 0 18px' }}>
              Run every<br />adventure.
            </h1>
            <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.65, margin: 0 }}>
              Events, bookings, attendees and your site widget — all from one place.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 40 }}>
            {[['20+','Active events'],['500+','Adventurers'],['98%','Attendance']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 30, fontWeight: 800, color: '#A8B84A', lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', position: 'relative' }}>
          <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 380 }}>
            <h2 style={{ fontFamily: 'Barlow Condensed,system-ui', fontSize: 30, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: .5, margin: '0 0 6px' }}>Sign in</h2>
            <p style={{ fontFamily: 'Nunito,system-ui', fontSize: 14, color: '#8B97A0', margin: '0 0 30px' }}>Access your event management panel.</p>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(179,35,23,.14)', border: '1px solid rgba(179,35,23,.4)', borderRadius: 10, padding: '11px 14px', marginBottom: 18 }}>
                <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: '#F0A8A2', fontWeight: 600 }}>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email</label>
              <div style={fieldWrap('email')}>
                <span style={{ fontSize: 15, opacity: .6 }}>&#x2709;&#xfe0f;</span>
                <input type="email" value={email} autoComplete="username"
                  onFocus={() => setFocus('email')} onBlur={() => setFocus('')}
                  onChange={e => setEmail(e.target.value)} placeholder="admin@lpla.com" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label style={labelStyle}>Password</label>
                <button type="button" onClick={() => { setForgotEmail(email); setShowForgot(true) }} style={{ fontFamily: 'Nunito,system-ui', fontSize: 12, color: '#919832', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Forgot?</button>
              </div>
              <div style={fieldWrap('password')}>
                <span style={{ fontSize: 15, opacity: .6 }}>&#x1f512;</span>
                <input type={showPw ? 'text' : 'password'} value={password} autoComplete="current-password"
                  onFocus={() => setFocus('password')} onBlur={() => setFocus('')}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8B97A0', fontFamily: 'Nunito,system-ui', fontSize: 12, fontWeight: 700, padding: 4 }}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', marginBottom: 24, userSelect: 'none' }}>
              <span onClick={() => setRemember(r => !r)} style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: `1.5px solid ${remember ? '#919832' : 'rgba(255,255,255,.2)'}`,
                background: remember ? '#919832' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 800, transition: 'all .15s',
              }}>{remember ? '✓' : ''}</span>
              <span style={{ fontFamily: 'Nunito,system-ui', fontSize: 13, color: '#9AA5AE' }}>Keep me signed in</span>
            </label>

            <button type="submit" disabled={loading} style={{
              width: '100%', height: 50, borderRadius: 12, border: 'none',
              cursor: loading ? 'default' : 'pointer',
              background: loading ? '#6F7726' : 'linear-gradient(180deg,#A0AB3E,#919832)',
              color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontSize: 19, fontWeight: 800,
              letterSpacing: .8, textTransform: 'uppercase',
              boxShadow: '0 8px 22px rgba(145,152,50,.32)', transition: 'transform .12s, box-shadow .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'admspin .7s linear infinite', display:'inline-block' }} />Signing in...</>
                : 'Enter dashboard →'}
            </button>
          </form>
        </div>

        {/* 2FA Modal */}
        {show2FA && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
            <div style={{ width: 'min(420px,92vw)', background: '#2B353F', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.5)' }}>
              <div style={{ height: 4, background: '#919832' }} />
              <div style={{ padding: '32px 32px 28px' }}>
                <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>&#x1f510;</div>
                <h3 style={{ fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Verify your identity</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginBottom: 28 }}>A 6-digit code has been sent to your registered phone.</p>

                {verifyError && (
                  <div style={{ background: 'rgba(179,35,23,.15)', border: '1px solid rgba(179,35,23,.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ff6b5b', fontSize: 13, textAlign: 'center' }}>
                    {verifyError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }} onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input key={i} ref={el => { digitRefs.current[i] = el }}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleDigitKeyDown(i, e)}
                      style={{ width: 44, height: 54, textAlign: 'center', background: 'rgba(255,255,255,.04)', border: '2px solid rgba(255,255,255,.12)', borderRadius: 8, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 24, outline: 'none' }}
                    />
                  ))}
                </div>

                <button onClick={handleVerify} disabled={verifying} style={{ width: '100%', padding: '14px', background: verifying ? 'rgba(145,152,50,.5)' : 'linear-gradient(135deg,#A8B84A,#919832)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 17, cursor: verifying ? 'not-allowed' : 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {verifying ? <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'admspin .8s linear infinite' }} />
                    Verifying...
                  </> : 'Verify & connect'}
                </button>

                <button onClick={() => { setShow2FA(false); setDigits(['','','','','','']); setVerifyError('') }}
                  style={{ width: '100%', padding: '12px', background: 'none', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 10, color: 'rgba(255,255,255,.6)', fontFamily: 'Nunito,system-ui', fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,.35)' }}>
                  {canResend
                    ? <button onClick={handleResend}
                        style={{ background: 'none', border: 'none', color: '#A8B84A', cursor: 'pointer', fontSize: 13, fontFamily: 'Nunito,system-ui', textDecoration: 'underline' }}>
                        Resend code
                      </button>
                    : `Resend code in ${countdown}s`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgot && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
            <div style={{ width: 'min(420px,92vw)', background: '#2B353F', borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.5)' }}>
              <div style={{ height: 4, background: '#919832' }} />
              <div style={{ padding: '32px 32px 28px' }}>

                {forgotStep === 'email' && <>
                  <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>&#x1f4f1;</div>
                  <h3 style={{ fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Reset Password</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginBottom: 24 }}>Enter your email and we'll send a verification code to your registered phone via SMS.</p>

                  {forgotError && <div style={{ background: 'rgba(179,35,23,.15)', border: '1px solid rgba(179,35,23,.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ff6b5b', fontSize: 13, textAlign: 'center' }}>{forgotError}</div>}

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Email</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 12, padding: '0 14px', height: 50 }}>
                      <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
                    </div>
                  </div>

                  <button onClick={handleForgotSubmit} disabled={forgotLoading} style={{ width: '100%', padding: '14px', background: forgotLoading ? 'rgba(145,152,50,.5)' : 'linear-gradient(135deg,#A8B84A,#919832)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 17, cursor: forgotLoading ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
                    {forgotLoading ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </>}

                {forgotStep === 'code' && <>
                  <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>&#x1f510;</div>
                  <h3 style={{ fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Verify & Reset</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginBottom: 24 }}>Enter the 6-digit code sent to your phone and choose a new password.</p>

                  {forgotError && <div style={{ background: 'rgba(179,35,23,.15)', border: '1px solid rgba(179,35,23,.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ff6b5b', fontSize: 13, textAlign: 'center' }}>{forgotError}</div>}

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                    {resetDigits.map((d, i) => (
                      <input key={i} ref={el => { resetDigitRefs.current[i] = el }}
                        type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleResetDigitChange(i, e.target.value)}
                        onKeyDown={e => { if (e.key === 'Backspace' && !resetDigits[i] && i > 0) resetDigitRefs.current[i - 1]?.focus() }}
                        style={{ width: 44, height: 54, textAlign: 'center', background: 'rgba(255,255,255,.04)', border: '2px solid rgba(255,255,255,.12)', borderRadius: 8, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 24, outline: 'none' }}
                      />
                    ))}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 12, padding: '0 14px', height: 50 }}>
                      <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 12, padding: '0 14px', height: 50 }}>
                      <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Re-enter password" style={inputStyle} />
                    </div>
                  </div>

                  <button onClick={handleResetPassword} disabled={forgotLoading} style={{ width: '100%', padding: '14px', background: forgotLoading ? 'rgba(145,152,50,.5)' : 'linear-gradient(135deg,#A8B84A,#919832)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 17, cursor: forgotLoading ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </>}

                {forgotStep === 'done' && <>
                  <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>&#x2705;</div>
                  <h3 style={{ fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 8 }}>Password Reset!</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginBottom: 24 }}>Your password has been updated. You can now sign in with your new password.</p>
                  <button onClick={closeForgot} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#A8B84A,#919832)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Barlow Condensed,system-ui', fontWeight: 800, fontSize: 17, cursor: 'pointer' }}>
                    Back to Sign In
                  </button>
                </>}

                {forgotStep !== 'done' && (
                  <button onClick={closeForgot}
                    style={{ width: '100%', padding: '12px', background: 'none', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 10, color: 'rgba(255,255,255,.6)', fontFamily: 'Nunito,system-ui', fontSize: 14, cursor: 'pointer', marginTop: forgotStep === 'email' ? 0 : 0 }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
