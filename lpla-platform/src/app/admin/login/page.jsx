'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API = 'https://locoporlaaventura.vercel.app'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const digitRefs = useRef([])
  const countdownRef = useRef(null)

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
          if (prev <= 1) {
            clearInterval(countdownRef.current)
            setCanResend(true)
            return 0
          }
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
      if (!res.ok) throw new Error(data.message || data.error || 'Login failed')
      setShow2FA(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDigitChange(i, val) {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 5) digitRefs.current[i + 1]?.focus()
  }

  function handleDigitKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      digitRefs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = ['', '', '', '', '', '']
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setDigits(next)
    const focusIdx = Math.min(text.length, 5)
    digitRefs.current[focusIdx]?.focus()
  }

  async function handleVerify() {
    const code = digits.join('')
    if (code.length !== 6) { setVerifyError('Enter all 6 digits'); return }
    setVerifyError('')
    setVerifying(true)
    try {
      const res = await fetch(`${API}/api/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=Nunito:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #222B33; font-family: 'Nunito', system-ui, sans-serif; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #2B353F inset !important; -webkit-text-fill-color: #fff !important; }
      `}</style>
      <div style={{ display:'flex', minHeight:'100vh', background:'#222B33' }}>
        {/* Left panel */}
        <div style={{
          flex:'0 0 50%', position:'relative', overflow:'hidden',
          background:'linear-gradient(160deg,#1A2530 0%,#222B33 50%,#1C2A24 100%)',
          display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 56px',
        }} className="left-panel">
          <style>{`
            @media(max-width:880px){.left-panel{display:none!important}}
          `}</style>
          {/* Topo SVG background */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.5, pointerEvents:'none' }} viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice">
            {[1,2,3,4,5,6].map(i => (
              <ellipse key={i} cx={300} cy={400} rx={80+i*70} ry={50+i*60} fill="none" stroke="#A8B84A" strokeWidth="0.8" opacity={0.3}/>
            ))}
            {[1,2,3].map(i => (
              <path key={i} d={`M${100+i*40},${200+i*30} Q${300},${150+i*20} ${500-i*30},${220+i*25} T${580},${350+i*40}`} fill="none" stroke="#A8B84A" strokeWidth="0.6" opacity={0.2}/>
            ))}
          </svg>
          {/* Radial glow */}
          <div style={{ position:'absolute', top:-80, right:-80, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(145,152,50,0.15) 0%, transparent 70%)', pointerEvents:'none' }}/>
          {/* Logo */}
          <div style={{ position:'absolute', top:28, left:40 }}>
            <img src="/logo.png" alt="LPLA" style={{ height:46, objectFit:'contain' }} onError={e => { e.target.style.display='none' }}/>
          </div>
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:11, fontFamily:'Barlow Condensed, sans-serif', fontWeight:700, letterSpacing:'0.18em', color:'#919832', textTransform:'uppercase', marginBottom:16 }}>Admin Dashboard</div>
            <h1 style={{ fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:42, color:'#fff', textTransform:'uppercase', lineHeight:1.1, marginBottom:14 }}>Run every<br/>adventure.</h1>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.55)', lineHeight:1.6, maxWidth:320, marginBottom:48 }}>
              Manage events, track attendance, and keep every expedition running smoothly — all from one place.
            </p>
            <div style={{ display:'flex', gap:36 }}>
              {[['20+','Active events'],['500+','Adventurers'],['98%','Attendance']].map(([val,label]) => (
                <div key={label}>
                  <div style={{ fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:28, color:'#fff' }}>{val}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position:'absolute', bottom:32, left:40, fontSize:12, color:'rgba(255,255,255,0.25)', fontFamily:'Barlow Condensed, sans-serif', letterSpacing:'0.1em' }}>
            Loco Por La Aventura · Management Platform
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
          <div style={{ width:'100%', maxWidth:380 }}>
            <h2 style={{ fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:30, color:'#fff', textTransform:'uppercase', marginBottom:8 }}>Sign in</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', marginBottom:32 }}>Access your event management panel.</p>

            {error && (
              <div style={{ background:'rgba(179,35,23,0.15)', border:'1px solid rgba(179,35,23,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:20, color:'#ff6b5b', fontSize:14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Email */}
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, pointerEvents:'none' }}>✉️</span>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  style={{ width:'100%', padding:'14px 14px 14px 42px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#fff', fontSize:15, fontFamily:'Nunito, sans-serif', outline:'none' }}
                />
              </div>
              {/* Password */}
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, pointerEvents:'none' }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{ width:'100%', padding:'14px 44px 14px 42px', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.12)', borderRadius:10, color:'#fff', fontSize:15, fontFamily:'Nunito, sans-serif', outline:'none' }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.45)', fontSize:13, fontFamily:'Nunito, sans-serif' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {/* Remember */}
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor:'#919832', width:16, height:16 }}/>
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>Keep me signed in</span>
              </label>
              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ padding:'15px', background:loading?'rgba(145,152,50,0.5)':'linear-gradient(135deg,#A8B84A,#919832)', border:'none', borderRadius:10, color:'#fff', fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:19, cursor:loading?'not-allowed':'pointer', letterSpacing:'0.04em', marginTop:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                {loading ? (
                  <>
                    <span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
                    Signing in…
                  </>
                ) : 'Enter dashboard →'}
              </button>
            </form>
          </div>
        </div>

        {/* 2FA Modal */}
        {show2FA && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
            <div style={{ width:'min(420px, 92vw)', background:'#2B353F', borderRadius:18, overflow:'hidden', boxShadow:'0 24px 80px rgba(0,0,0,0.5)' }}>
              <div style={{ height:4, background:'#919832' }}/>
              <div style={{ padding:'32px 32px 28px' }}>
                <div style={{ fontSize:32, textAlign:'center', marginBottom:12 }}>🔐</div>
                <h3 style={{ fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:22, color:'#fff', textAlign:'center', marginBottom:8 }}>Verify your identity</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:28 }}>A 6-digit code has been sent to +1 407 ••• 7361</p>

                {verifyError && (
                  <div style={{ background:'rgba(179,35,23,0.15)', border:'1px solid rgba(179,35,23,0.4)', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'#ff6b5b', fontSize:13, textAlign:'center' }}>
                    {verifyError}
                  </div>
                )}

                <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:24 }} onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input key={i} ref={el => { digitRefs.current[i] = el }}
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleDigitKeyDown(i, e)}
                      style={{ width:44, height:54, textAlign:'center', background:'rgba(255,255,255,0.04)', border:'2px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#fff', fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:24, outline:'none' }}
                    />
                  ))}
                </div>

                <button onClick={handleVerify} disabled={verifying}
                  style={{ width:'100%', padding:'14px', background:verifying?'rgba(145,152,50,0.5)':'linear-gradient(135deg,#A8B84A,#919832)', border:'none', borderRadius:10, color:'#fff', fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:17, cursor:verifying?'not-allowed':'pointer', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {verifying ? (
                    <>
                      <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }}/>
                      Verifying…
                    </>
                  ) : 'Verify & connect'}
                </button>

                <button onClick={() => { setShow2FA(false); setDigits(['','','','','','']); setVerifyError('') }}
                  style={{ width:'100%', padding:'12px', background:'none', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:10, color:'rgba(255,255,255,0.6)', fontFamily:'Nunito, sans-serif', fontSize:14, cursor:'pointer' }}>
                  Cancel
                </button>

                <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'rgba(255,255,255,0.35)' }}>
                  {canResend ? (
                    <button onClick={() => { setShow2FA(false); setTimeout(() => handleLogin({ preventDefault: () => {} }), 50) }}
                      style={{ background:'none', border:'none', color:'#A8B84A', cursor:'pointer', fontSize:13, fontFamily:'Nunito, sans-serif', textDecoration:'underline' }}>
                      Resend code
                    </button>
                  ) : `Resend code in ${countdown}s`}
                </p>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          input::placeholder { color: rgba(255,255,255,0.3); }
        `}</style>
      </div>
    </>
  )
}
