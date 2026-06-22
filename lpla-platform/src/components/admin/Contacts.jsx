'use client'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import AdmIcon from '@/components/admin/AdmIcon'
import { OvKpi } from '@/components/admin/Overview'
import { ADM } from '@/lib/tokens'
import { admBuildOrders, admMoney, admDateShort, admTimeAgo, _admMulberry } from '@/lib/admin-data'

const CRM_AREA_CODES = ['503','971','360','541','206']
const CRM_TAG_COLORS = {
  VIP:       { bg:'#FAE04214', color:'#A07800', border:'#FAE04244' },
  Regular:   { bg:'#29415414', color:'#294154', border:'#29415444' },
  Volunteer: { bg:'#00897A14', color:'#00705E', border:'#00897A44' },
  New:       { bg:'#5E8BBD14', color:'#2E5F8A', border:'#5E8BBD44' },
  Lapsed:    { bg:'#6B728014', color:'#4B5563', border:'#6B728044' },
  Climber:   { bg:'#29415414', color:'#294154', border:'#29415444' },
  Hiker:     { bg:'#54620714', color:'#3A4505', border:'#54620744' },
  Speaker:   { bg:'#A5439914', color:'#7A2E75', border:'#A5439944' },
}

function crmTagStyle(tag) {
  return CRM_TAG_COLORS[tag] || { bg:'#F3EDE314', color:'#6B7280', border:'#E5DDD044' }
}

let __crmContacts = null
let __crmSig = null

function crmBuildContacts(orders) {
  const sig = orders.map(o=>o.id).join(',')
  if (__crmContacts && __crmSig === sig) return __crmContacts
  const rng = _admMulberry(0x43524d41)
  const map = {}
  orders.forEach(o => {
    if (!map[o.email]) {
      map[o.email] = {
        id: o.email,
        name: o.name, firstName: o.firstName, lastName: o.lastName,
        initials: o.initials, email: o.email,
        phone: '+1 ' + CRM_AREA_CODES[Math.floor(rng()*CRM_AREA_CODES.length)] + ' ' +
               String(Math.floor(rng()*900+100)) + ' ' + String(Math.floor(rng()*9000+1000)),
        orders: [], totalSpend: 0, bookingCount: 0, checkedIn: 0,
        firstActivity: Infinity, lastActivity: -Infinity,
        categories: new Set(), events: [],
      }
    }
    const c = map[o.email]
    c.orders.push(o)
    if (o.status !== 'cancelled' && o.status !== 'refunded') {
      c.totalSpend += o.amount
      c.bookingCount += o.qty
      if (o.checkedIn) c.checkedIn += o.qty
      c.categories.add(o.event.category)
      c.events.push(o.event.titleEn)
    }
    if (o.createdAt < c.firstActivity) c.firstActivity = o.createdAt
    if (o.createdAt > c.lastActivity)  c.lastActivity  = o.createdAt
  })

  const now = Date.now(), DAY = 86400000
  const contacts = Object.values(map).map(c => {
    c.categories = [...c.categories]
    const daysSince = (now - c.lastActivity) / DAY
    const daysAs    = (now - c.firstActivity) / DAY
    const tags = []
    if (c.totalSpend >= 80)  tags.push('VIP')
    if (c.bookingCount >= 3 && !tags.includes('VIP')) tags.push('Regular')
    if (c.categories.includes('Voluntario')) tags.push('Volunteer')
    if (daysAs <= 45)  tags.push('New')
    if (daysSince > 60 && !tags.includes('New')) tags.push('Lapsed')
    if (c.categories.includes('Escalada'))  tags.push('Climber')
    if (c.categories.includes('Senderismo')) tags.push('Hiker')
    if (c.categories.includes('Keynote'))   tags.push('Speaker')
    const spend  = Math.min(40, c.totalSpend / 5)
    const freq   = Math.min(30, c.bookingCount * 8)
    const recency = Math.max(0, 30 - daysSince / 3)
    c.engagementScore = Math.round(Math.min(100, spend + freq + recency))
    c.segment = tags.includes('VIP') ? 'VIP'
              : tags.includes('Regular') ? 'Regular'
              : tags.includes('New') ? 'New'
              : tags.includes('Lapsed') ? 'Lapsed' : 'Occasional'
    c.tags = tags
    return c
  })
  contacts.sort((a,b) => b.lastActivity - a.lastActivity)
  __crmContacts = contacts
  __crmSig = sig
  return contacts
}

function EngagementBar({ score, size = 'md' }) {
  const color = score >= 70 ? ADM.success : score >= 40 ? ADM.warning : ADM.light
  const h = size === 'sm' ? 5 : 8
  const label = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:h, borderRadius:h, background:'#EFEDE5', overflow:'hidden' }}>
        <div style={{ width:`${score}%`, height:'100%', borderRadius:h, background:color, transition:'width .5s' }} />
      </div>
      {size !== 'sm' && <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight:800, color, minWidth:26 }}>{score}</span>}
      {size !== 'sm' && <span style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:ADM.light }}>{label}</span>}
    </div>
  )
}

function CrmTag({ tag, onRemove }) {
  const s = crmTagStyle(tag)
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:12,
      background:s.bg, border:`1px solid ${s.border}`, color:s.color,
      fontFamily:'Barlow Condensed,system-ui', fontSize:11.5, fontWeight:800, letterSpacing:.4, textTransform:'uppercase' }}>
      {tag}
      {onRemove && <span onClick={()=>onRemove(tag)} style={{ cursor:'pointer', opacity:.7, lineHeight:1, fontSize:13 }}>×</span>}
    </span>
  )
}

function CrmDrawer({ contact: base, allTags, onClose }) {
  const [show, setShow] = useState(false)
  const [tab, setTab] = useState('profile')
  const [tags, setTags] = useState(base.tags)
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lpla_crm_notes_'+base.id)||'[]') } catch { return [] }
  })
  const [noteInput, setNoteInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const noteRef = useRef()

  useEffect(()=>{ const r=requestAnimationFrame(()=>setShow(true)); return ()=>cancelAnimationFrame(r) },[])
  function close(){ setShow(false); setTimeout(onClose, 240) }

  function addNote(){
    const t = noteInput.trim(); if(!t) return
    const n = { text:t, ts: Date.now() }
    const next = [n, ...notes]; setNotes(next); setNoteInput('')
    try { localStorage.setItem('lpla_crm_notes_'+base.id, JSON.stringify(next)) } catch {}
  }

  function addTag(tag){
    if(!tags.includes(tag)){ setTags([...tags,tag]) }
    setTagInput('')
  }
  function removeTag(tag){ setTags(tags.filter(t=>t!==tag)) }

  const c = { ...base, tags }
  const cat = c.categories[0]
  const catColor = { Escalada:'#294154', Senderismo:'#546207', Taller:'#A54399', Keynote:'#5E8BBD', Social:'#D9831F', 'Expedición':'#B32317', Voluntario:'#00897A' }[cat] || ADM.primary

  const isKlaviyo = base.source === 'klaviyo'
  const TABS = [
    { id:'profile',  label:'Profile',  icon:'people' },
    { id:'timeline', label:'Timeline', icon:'clock' },
    { id:'notes',    label:'Notes',    icon:'note'  },
    { id:'tags',     label:'Tags',     icon:'tag'   },
  ]

  const allOrders = c.orders.slice().sort((a,b)=>b.createdAt-a.createdAt)

  return (
    <>
      <div onClick={close} style={{ position:'fixed', inset:0, background:'rgba(20,26,32,.42)', zIndex:700, opacity:show?1:0, transition:'opacity .24s' }} />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:'min(480px,96vw)', background:ADM.card, zIndex:701, display:'flex', flexDirection:'column', boxShadow:'-14px 0 40px rgba(0,0,0,.18)', transform:show?'translateX(0)':'translateX(100%)', transition:'transform .27s cubic-bezier(.4,0,.2,1)' }}>

        <div style={{ height:4, background:`linear-gradient(90deg,${catColor},${catColor}66)`, flexShrink:0 }} />

        <div style={{ padding:'20px 22px 16px', borderBottom:`1px solid ${ADM.border}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', flexShrink:0, background:`${catColor}1a`, color:catColor, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800 }}>{c.initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:22, fontWeight:800, color:ADM.text, textTransform:'uppercase', letterSpacing:.3 }}>{c.name}</div>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.muted, marginTop:2 }}>{c.email}</div>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.muted }}>{c.phone}</div>
            </div>
            <button onClick={close} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${ADM.border}`, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <AdmIcon name="x" size={16} color={ADM.muted} />
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginTop:16 }}>
            {[
              { l:'Total Spend',   v: c.totalSpend ? admMoney(c.totalSpend) : 'Free' },
              { l:'Bookings',      v: c.bookingCount },
              { l:'Checked In',    v: c.checkedIn },
              { l:'Events',        v: [...new Set(c.orders.map(o=>o.eventId))].length },
            ].map(({l,v})=>(
              <div key={l} style={{ textAlign:'center', background:ADM.bg, borderRadius:ADM.radius, padding:'10px 6px' }}>
                <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:22, fontWeight:800, color:ADM.text, lineHeight:1 }}>{v}</div>
                <div style={{ fontFamily:'Nunito,system-ui', fontSize:10.5, color:ADM.light, marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontFamily:'Nunito,system-ui', fontSize:11.5, fontWeight:700, color:ADM.muted, textTransform:'uppercase', letterSpacing:.6 }}>Engagement</span>
              <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:800, color:ADM.light }}>{c.segment}</span>
            </div>
            <EngagementBar score={c.engagementScore} />
          </div>

          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>
            {tags.map(t=><CrmTag key={t} tag={t} />)}
          </div>
        </div>

        <div style={{ display:'flex', borderBottom:`1px solid ${ADM.border}`, flexShrink:0 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:1, padding:'11px 4px', border:'none', borderBottom:`2.5px solid ${tab===t.id?ADM.primary:'transparent'}`, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight:800, color:tab===t.id?ADM.primary:ADM.muted, textTransform:'uppercase', letterSpacing:.4, transition:'color .15s' }}>
              <AdmIcon name={t.icon} size={15} color={tab===t.id?ADM.primary:ADM.muted} />
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflow:'auto', padding:'18px 22px' }}>

          {tab==='profile' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { label:'Email', value:c.email, icon:'mail' },
                { label:'Phone', value:c.phone, icon:'chat' },
                { label:'Location', value:c.locationStr, icon:'pin' },
                { label:'Timezone', value:c.timezone, icon:'clock' },
                { label:'Klaviyo ID', value:c.klaviyoId, icon:'bolt' },
                { label:'Created', value:c.klaviyoCreated ? new Date(c.klaviyoCreated).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : null, icon:'calendar' },
                { label:'Last Updated', value:c.klaviyoUpdated ? new Date(c.klaviyoUpdated).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}) : null, icon:'clock' },
              ].filter(r=>r.value).map(r=>(
                <div key={r.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:ADM.bg, borderRadius:ADM.radius, border:`1px solid ${ADM.border}` }}>
                  <AdmIcon name={r.icon} size={15} color={ADM.light} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:ADM.light, textTransform:'uppercase', letterSpacing:.6, fontWeight:700 }}>{r.label}</div>
                    <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, marginTop:2, wordBreak:'break-all' }}>{r.value}</div>
                  </div>
                </div>
              ))}
              {c.lists && c.lists.length > 0 && (
                <div style={{ padding:'10px 14px', background:ADM.bg, borderRadius:ADM.radius, border:`1px solid ${ADM.border}` }}>
                  <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:ADM.light, textTransform:'uppercase', letterSpacing:.6, fontWeight:700, marginBottom:8 }}>
                    <AdmIcon name="mail" size={13} color={ADM.light} style={{ marginRight:6, verticalAlign:'middle' }} />
                    Klaviyo Lists
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {c.lists.map(l=>(
                      <span key={l.id} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:12, background:`${ADM.primary}14`, border:`1px solid ${ADM.primary}33`, color:ADM.primary, fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:800, letterSpacing:.3, textTransform:'uppercase' }}>
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {!isKlaviyo && (
                <div style={{ padding:'14px', background:'#FFF8E1', borderRadius:ADM.radius, border:'1px solid #FFE082' }}>
                  <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:'#6D4C00', lineHeight:1.5 }}>
                    This contact was created from a booking order. Sync with Klaviyo to see full profile data.
                  </div>
                </div>
              )}
            </div>
          )}

          {tab==='timeline' && (
            <div>
              {allOrders.length === 0 && <p style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.light, textAlign:'center', marginTop:32 }}>No activity yet.</p>}
              <div style={{ position:'relative', paddingLeft:28 }}>
                <div style={{ position:'absolute', left:8, top:0, bottom:0, width:2, background:ADM.border }} />
                {allOrders.map((o)=>{
                  const isActive = o.status!=='cancelled'&&o.status!=='refunded'
                  const color = o.checkedIn ? ADM.blue : isActive ? ADM.success : ADM.light
                  return (
                    <div key={o.id} style={{ position:'relative', marginBottom:18 }}>
                      <div style={{ position:'absolute', left:-20, top:3, width:12, height:12, borderRadius:'50%', background:color, border:'2.5px solid #fff', zIndex:1 }} />
                      <div style={{ background:ADM.bg, borderRadius:ADM.radius, padding:'10px 14px', border:`1px solid ${ADM.border}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:4 }}>
                          <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, color:ADM.text, textTransform:'uppercase', letterSpacing:.3, lineHeight:1.2 }}>{o.event.titleEn}</span>
                          <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, color:isActive?ADM.text:ADM.light, flexShrink:0 }}>{o.amount?admMoney(o.amount):'Free'}</span>
                        </div>
                        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                          <span style={{ fontFamily:'Nunito,system-ui', fontSize:11.5, color:ADM.light }}>{admDateShort(o.createdAt)}</span>
                          <span style={{ width:3, height:3, borderRadius:'50%', background:ADM.border }} />
                          <span style={{ fontFamily:'Nunito,system-ui', fontSize:11.5, color:ADM.light }}>{o.ticketLabel} × {o.qty}</span>
                          <span style={{ width:3, height:3, borderRadius:'50%', background:ADM.border }} />
                          <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:.3, color, padding:'1px 7px', borderRadius:8, background:`${color}1a` }}>
                            {o.checkedIn ? 'Checked in' : o.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab==='notes' && (
            <div>
              <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                <textarea ref={noteRef} value={noteInput} onChange={e=>setNoteInput(e.target.value)}
                  placeholder="Add an internal note about this contact…"
                  onKeyDown={e=>{ if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)) addNote() }}
                  rows={2} style={{ flex:1, borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, padding:'10px 12px', fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.text, resize:'none', outline:'none', lineHeight:1.5 }} />
                <button onClick={addNote} style={{ alignSelf:'flex-end', height:38, padding:'0 16px', borderRadius:ADM.radius, border:'none', background:ADM.primary, color:'#fff', cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, letterSpacing:.3, display:'inline-flex', alignItems:'center', gap:6 }}>
                  <AdmIcon name="send" size={14} color="#fff" /> Add
                </button>
              </div>
              {notes.length===0 && <p style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.light, textAlign:'center', marginTop:24 }}>No notes yet. Add one above.</p>}
              {notes.map((n,i)=>(
                <div key={i} style={{ background:ADM.bg, borderRadius:ADM.radius, padding:'12px 14px', marginBottom:10, border:`1px solid ${ADM.border}` }}>
                  <div style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.text, lineHeight:1.55, marginBottom:6 }}>{n.text}</div>
                  <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:ADM.light }}>
                    {new Date(n.ts).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · You
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==='tags' && (
            <div>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.muted, marginBottom:16, lineHeight:1.5 }}>Tags help you segment contacts for automations and bulk campaigns in Klaviyo.</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                {tags.map(t=><CrmTag key={t} tag={t} onRemove={removeTag} />)}
                {tags.length===0 && <span style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.light }}>No tags assigned.</span>}
              </div>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, color:ADM.light, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>Add a tag</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {allTags.filter(t=>!tags.includes(t)).map(t=>(
                  <button key={t} onClick={()=>addTag(t)}
                    style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:12, border:`1px dashed ${ADM.border}`, background:'transparent', cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:800, color:ADM.muted, letterSpacing:.4, textTransform:'uppercase', transition:'all .15s' }}
                    onMouseOver={e=>{e.currentTarget.style.background=ADM.bg;e.currentTarget.style.color=ADM.text}}
                    onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=ADM.muted}}>
                    <AdmIcon name="plus" size={13} /> {t}
                  </button>
                ))}
              </div>
              <div style={{ marginTop:20 }}>
                <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, color:ADM.light, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Custom tag</div>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)} placeholder="Type a tag…" maxLength={20}
                    onKeyDown={e=>{ if(e.key==='Enter'&&tagInput.trim()) addTag(tagInput.trim()) }}
                    style={{ flex:1, height:36, borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:13, outline:'none' }} />
                  <button onClick={()=>tagInput.trim()&&addTag(tagInput.trim())} style={{ height:36, padding:'0 16px', borderRadius:ADM.radius, border:'none', background:ADM.primary, color:'#fff', cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800 }}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:'14px 22px', borderTop:`1px solid ${ADM.border}`, display:'flex', gap:8, flexShrink:0 }}>
          {[
            { icon:'mail',  label:'Email',   color:ADM.primary },
            { icon:'chat',  label:'SMS',     color:'#25D366'   },
            { icon:'download', label:'Export', color:ADM.muted },
          ].map(({icon,label,color})=>(
            <button key={label} style={{ flex:1, height:42, borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:7, fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, color:ADM.text, letterSpacing:.3, transition:'all .15s' }}
              onMouseOver={e=>{e.currentTarget.style.background=`${color}10`;e.currentTarget.style.borderColor=color;e.currentTarget.style.color=color}}
              onMouseOut={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor=ADM.border;e.currentTarget.style.color=ADM.text}}>
              <AdmIcon name={icon} size={16} color="inherit" /> {label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

const DEFAULT_CRM_SEGMENTS = [
  { id:'all',       label:'All Contacts',  icon:'people'  },
  { id:'VIP',       label:'VIP',           icon:'star'    },
  { id:'Regular',   label:'Regulars',      icon:'check'   },
  { id:'New',       label:'New',           icon:'bolt'    },
  { id:'Lapsed',    label:'Lapsed',        icon:'clock'   },
  { id:'Volunteer', label:'Volunteers',    icon:'people'  },
]

const ALL_TAGS = ['VIP','Regular','Volunteer','New','Lapsed','Climber','Hiker','Speaker']

const CRM_FIELDS = [
  { id:'name',      label:'Full Name' },
  { id:'firstName', label:'First Name' },
  { id:'lastName',  label:'Last Name' },
  { id:'email',     label:'Email Address' },
  { id:'phone',     label:'Phone Number' },
  { id:'tags',      label:'Tags (comma-separated)' },
  { id:'notes',     label:'Notes' },
  { id:'--skip--',  label:'— Skip this column —' },
]

function parseCSV(text) {
  const lines = text.replace(/^﻿/, '').trim().split(/\r?\n/)
  if (lines.length < 2) return { headers:[], rows:[] }
  const parseRow = line => {
    const cols = []; let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') { inQ = !inQ }
      else if (c === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
      else cur += c
    }
    cols.push(cur.trim())
    return cols
  }
  const headers = parseRow(lines[0])
  const rows = lines.slice(1).filter(l => l.trim()).map(parseRow)
  return { headers, rows }
}

function autoMap(headers) {
  const synonyms = {
    email:     /e.?mail/i,
    name:      /^(full.?name|name)$/i,
    firstName: /first.?name|fname|given/i,
    lastName:  /last.?name|lname|surname|family/i,
    phone:     /phone|mobile|cel|tel/i,
    tags:      /tags?|label|segment/i,
    notes:     /note|comment|memo/i,
  }
  return headers.map(h => {
    for (const [field, re] of Object.entries(synonyms)) {
      if (re.test(h)) return field
    }
    return '--skip--'
  })
}

function CrmImportModal({ onClose, onImport }) {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState('upload')
  const [drag, setDrag] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [mapping, setMapping] = useState([])
  const [fileName, setFileName] = useState('')
  const [importedCount, setImportedCount] = useState(0)
  const fileRef = useRef()

  useEffect(() => { const r = requestAnimationFrame(() => setShow(true)); return () => cancelAnimationFrame(r) }, [])
  function close() { setShow(false); setTimeout(onClose, 240) }

  function processFile(file) {
    if (!file || !file.name.endsWith('.csv')) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const p = parseCSV(e.target.result)
      setParsed(p)
      setMapping(autoMap(p.headers))
      setStep('map')
    }
    reader.readAsText(file)
  }

  function onDrop(e) {
    e.preventDefault(); setDrag(false)
    processFile(e.dataTransfer.files[0])
  }

  const preview = useMemo(() => {
    if (!parsed) return []
    return parsed.rows.slice(0, 5).map(row => {
      const obj = {}
      mapping.forEach((field, i) => {
        if (field !== '--skip--' && row[i] !== undefined) obj[field] = row[i]
      })
      if (!obj.name && (obj.firstName || obj.lastName)) obj.name = [obj.firstName, obj.lastName].filter(Boolean).join(' ')
      return obj
    })
  }, [parsed, mapping])

  function doImport() {
    if (!parsed) return
    const contacts = parsed.rows.map(row => {
      const obj = {}
      mapping.forEach((field, i) => {
        if (field !== '--skip--' && row[i] !== undefined) obj[field] = row[i]
      })
      if (!obj.name && (obj.firstName || obj.lastName)) obj.name = [obj.firstName, obj.lastName].filter(Boolean).join(' ')
      if (!obj.firstName && obj.name) obj.firstName = obj.name.split(' ')[0]
      if (!obj.lastName && obj.name) obj.lastName = obj.name.split(' ').slice(1).join(' ')
      return obj
    }).filter(c => c.email || c.name)
    setImportedCount(contacts.length)
    onImport && onImport(contacts)
    setStep('done')
  }

  const selStyle = { height:34, borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, padding:'0 10px', fontFamily:'Nunito,system-ui', fontSize:12.5, color:ADM.text, background:'#fff', outline:'none', width:'100%' }

  return (
    <>
      <div onClick={close} style={{ position:'fixed', inset:0, background:'rgba(11,26,40,.5)', zIndex:800, opacity:show?1:0, transition:'opacity .24s' }} />
      <div style={{ position:'fixed', left:'50%', top:'50%', transform:`translate(-50%,${show?'-50%':'-44%'})`, opacity:show?1:0, transition:'transform .26s cubic-bezier(.4,0,.2,1),opacity .24s', zIndex:801, width:'min(600px,94vw)', background:'#fff', borderRadius:ADM.radiusLg, boxShadow:'0 24px 60px rgba(0,0,0,.2)', overflow:'hidden', display:'flex', flexDirection:'column', maxHeight:'88vh' }}>

        <div style={{ height:4, background:`linear-gradient(90deg,${ADM.primary},${ADM.blue})`, flexShrink:0 }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:`1px solid ${ADM.border}`, flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, color:ADM.text, textTransform:'uppercase', letterSpacing:.4 }}>Import Contacts</div>
            <div style={{ fontFamily:'Nunito,system-ui', fontSize:12.5, color:ADM.muted, marginTop:2 }}>
              {step==='upload' && 'Upload a CSV file to add contacts to your CRM.'}
              {step==='map'    && `${parsed?.rows.length || 0} contacts found in "${fileName}" — map the columns below.`}
              {step==='preview' && 'Review a sample before importing.'}
              {step==='done'   && 'Import complete.'}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {['upload','map','preview'].map((s,i) => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
                {i>0 && <div style={{ width:20, height:1, background:ADM.border }} />}
                <div style={{ width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background: ['map','preview','done'].indexOf(step)>=['upload','map','preview'].indexOf(s) ? ADM.primary : '#F1EFE8',
                  border:`2px solid ${step===s ? ADM.primary : 'transparent'}` }}>
                  <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:800, color: ['map','preview','done'].indexOf(step)>=['upload','map','preview'].indexOf(s) ? '#fff' : ADM.light }}>{i+1}</span>
                </div>
              </div>
            ))}
            <button onClick={close} style={{ width:30, height:30, borderRadius:8, border:`1px solid ${ADM.border}`, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', marginLeft:8 }}>
              <AdmIcon name="x" size={15} color={ADM.muted} />
            </button>
          </div>
        </div>

        <div style={{ flex:1, overflow:'auto', padding:'22px 24px' }}>

          {step==='upload' && (
            <div>
              <div
                onDragOver={e=>{e.preventDefault();setDrag(true)}}
                onDragLeave={()=>setDrag(false)}
                onDrop={onDrop}
                onClick={()=>fileRef.current?.click()}
                style={{ border:`2px dashed ${drag ? ADM.primary : ADM.border}`, borderRadius:ADM.radiusMd, padding:'48px 24px', textAlign:'center', cursor:'pointer', background:drag?`${ADM.primary}06`:'#FAFAF8', transition:'all .2s' }}>
                <AdmIcon name="download" size={32} color={drag ? ADM.primary : ADM.light} style={{ margin:'0 auto 14px', transform:'rotate(180deg)' }} />
                <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:18, fontWeight:800, color:ADM.text, textTransform:'uppercase', letterSpacing:.4, marginBottom:6 }}>
                  {drag ? 'Drop it!' : 'Drag & drop a CSV file'}
                </div>
                <div style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.muted, marginBottom:16 }}>or click to browse your computer</div>
                <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'8px 18px', borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:'#fff', fontFamily:'Nunito,system-ui', fontSize:13, fontWeight:700, color:ADM.text }}>
                  <AdmIcon name="plus" size={14} color={ADM.muted} /> Choose file
                </span>
                <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e=>processFile(e.target.files[0])} />
              </div>
              <div style={{ marginTop:18, padding:'14px 16px', background:'#F4F7FA', borderRadius:ADM.radius, border:`1px solid ${ADM.border}` }}>
                <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:800, color:ADM.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Expected columns (any order)</div>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                  {['Email', 'First Name', 'Last Name', 'Phone', 'Tags', 'Notes'].map(f=>(
                    <span key={f} style={{ padding:'3px 10px', borderRadius:10, background:'#fff', border:`1px solid ${ADM.border}`, fontFamily:'ui-monospace,Menlo,monospace', fontSize:12, color:ADM.text }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step==='map' && parsed && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {parsed.headers.map((h,i) => (
                  <div key={i} style={{ background:ADM.bg, borderRadius:ADM.radius, padding:'12px 14px', border:`1px solid ${ADM.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:8 }}>
                      <span style={{ fontFamily:'ui-monospace,Menlo,monospace', fontSize:12.5, color:ADM.text, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h}</span>
                      <span style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:ADM.light, flexShrink:0 }}>sample: {parsed.rows[0]?.[i] || '—'}</span>
                    </div>
                    <select value={mapping[i]} onChange={e=>{const m=[...mapping];m[i]=e.target.value;setMapping(m)}} style={selStyle}>
                      {CRM_FIELDS.map(f=><option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', background:`${ADM.blue}12`, border:`1px solid ${ADM.blue}44`, borderRadius:ADM.radius, padding:'12px 14px', marginTop:16 }}>
                <AdmIcon name="bolt" size={16} color={ADM.blue} style={{ flexShrink:0, marginTop:1 }} />
                <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.text, lineHeight:1.5 }}>Existing contacts with the same email will be updated, not duplicated.</div>
              </div>
            </div>
          )}

          {step==='preview' && (
            <div>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.muted, marginBottom:14 }}>
                Showing the first {preview.length} of {parsed?.rows.length} contacts.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {preview.map((c,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:ADM.bg, borderRadius:ADM.radius, border:`1px solid ${ADM.border}` }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', flexShrink:0, background:`${ADM.primary}18`, color:ADM.primary, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800 }}>
                      {((c.firstName||c.name||'?')[0]+(c.lastName||'')[0]||'').toUpperCase()||'?'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, fontWeight:700, color:ADM.text }}>{c.name || [c.firstName,c.lastName].filter(Boolean).join(' ') || '—'}</div>
                      <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:ADM.light }}>{c.email || 'No email'}{c.phone ? ' · '+c.phone : ''}</div>
                    </div>
                    {c.tags && <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {c.tags.split(',').map(t=>t.trim()).filter(Boolean).slice(0,3).map(t=><CrmTag key={t} tag={t}/>)}
                    </div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step==='done' && (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:`${ADM.success}18`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <AdmIcon name="check" size={26} color={ADM.success} />
              </div>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:24, fontWeight:800, color:ADM.text, textTransform:'uppercase', letterSpacing:.4, marginBottom:8 }}>
                {importedCount} contact{importedCount!==1?'s':''} imported
              </div>
              <p style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.muted, lineHeight:1.6, maxWidth:360, margin:'0 auto' }}>
                Your contacts have been added to the CRM. Duplicate emails were merged with existing profiles.
              </p>
            </div>
          )}
        </div>

        {step !== 'done' && (
          <div style={{ padding:'14px 24px', borderTop:`1px solid ${ADM.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
            <button onClick={()=>{ if(step==='map') setStep('upload'); else if(step==='preview') setStep('map') }}
              style={{ display:step==='upload'?'none':'inline-flex', alignItems:'center', gap:6, height:38, padding:'0 16px', borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:'transparent', cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:13.5, fontWeight:700, color:ADM.muted }}>
              <AdmIcon name="chevronLeft" size={14} color={ADM.muted} /> Back
            </button>
            <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
              <button onClick={close} style={{ height:38, padding:'0 16px', borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:'transparent', cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:13.5, fontWeight:700, color:ADM.muted }}>Cancel</button>
              {step==='map' && (
                <button onClick={()=>setStep('preview')}
                  style={{ height:38, padding:'0 20px', borderRadius:ADM.radius, border:'none', background:ADM.primary, color:'#fff', cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800, letterSpacing:.3, display:'inline-flex', alignItems:'center', gap:8 }}>
                  Preview <AdmIcon name="chevronRight" size={14} color="#fff" />
                </button>
              )}
              {step==='preview' && (
                <button onClick={doImport}
                  style={{ height:38, padding:'0 20px', borderRadius:ADM.radius, border:'none', background:ADM.success, color:'#fff', cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800, letterSpacing:.3, display:'inline-flex', alignItems:'center', gap:8 }}>
                  <AdmIcon name="download" size={15} color="#fff" style={{ transform:'rotate(180deg)' }} /> Import {parsed?.rows.length} contacts
                </button>
              )}
            </div>
          </div>
        )}
        {step==='done' && (
          <div style={{ padding:'14px 24px', borderTop:`1px solid ${ADM.border}`, display:'flex', justifyContent:'flex-end', flexShrink:0 }}>
            <button onClick={close} style={{ height:38, padding:'0 22px', borderRadius:ADM.radius, border:'none', background:ADM.primary, color:'#fff', cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800 }}>Done</button>
          </div>
        )}
      </div>
    </>
  )
}

function importedToContact(raw) {
  const name = raw.name || [raw.firstName, raw.lastName].filter(Boolean).join(' ') || 'Unknown'
  const firstName = raw.firstName || name.split(' ')[0]
  const lastName = raw.lastName || name.split(' ').slice(1).join(' ')
  const email = raw.email || ''
  const tags = raw.tags ? raw.tags.split(/[,;]/).map(t => t.trim()).filter(Boolean) : []
  const now = Date.now()
  return {
    id: email || name + now,
    name, firstName, lastName,
    initials: ((firstName[0] || '') + (lastName[0] || '')).toUpperCase() || '?',
    email, phone: raw.phone || '',
    orders: [], totalSpend: 0, bookingCount: 0, checkedIn: 0,
    firstActivity: now, lastActivity: now,
    categories: [], events: [],
    engagementScore: 0, segment: tags.includes('VIP') ? 'VIP' : tags.includes('New') ? 'New' : 'Occasional',
    tags,
  }
}

const API = 'https://locoporlaaventura.vercel.app'

function computeKlaviyoEngagement(lists, created, updated) {
  const DAY = 86400000, now = Date.now()
  const listScore = Math.min(30, lists.length * 15)
  const recency = Math.max(0, 30 - (now - updated) / DAY / 3)
  const tenure = Math.min(20, (now - created) / DAY / 15)
  const hasProfile = updated > created ? 20 : 0
  return Math.round(Math.min(100, listScore + recency + tenure + hasProfile))
}

function klaviyoProfileToContact(p) {
  const attr = p.attributes || {}
  const email = attr.email || ''
  const firstName = attr.first_name || ''
  const lastName = attr.last_name || ''
  const name = [firstName, lastName].filter(Boolean).join(' ') || email
  const created = attr.created ? new Date(attr.created).getTime() : Date.now()
  const updated = attr.updated ? new Date(attr.updated).getTime() : created
  const lists = p.lists || []
  const firstListName = lists.length > 0 ? lists[0].name : 'Other'
  const loc = attr.location || {}
  return {
    id: email || p.id,
    klaviyoId: p.id,
    name,
    firstName,
    lastName,
    initials: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || email.charAt(0).toUpperCase(),
    email,
    phone: attr.phone_number || '',
    city: loc.city || '',
    region: loc.region || '',
    country: loc.country || '',
    timezone: loc.timezone || '',
    locationStr: [loc.city, loc.region, loc.country].filter(Boolean).join(', '),
    klaviyoCreated: attr.created || null,
    klaviyoUpdated: attr.updated || null,
    orders: [],
    totalSpend: 0,
    bookingCount: 0,
    checkedIn: 0,
    firstActivity: created,
    lastActivity: updated,
    categories: [],
    events: [],
    engagementScore: computeKlaviyoEngagement(lists, created, updated),
    segment: firstListName,
    tags: lists.length >= 3 ? ['Engaged'] : [],
    lists,
    source: 'klaviyo',
  }
}

export default function AdminCRM({ events }) {
  const orders = admBuildOrders(events)
  const orderContacts = crmBuildContacts(orders)

  const [imported, setImported] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lpla_crm_imported') || '[]') } catch { return [] }
  })
  const [klaviyoContacts, setKlaviyoContacts] = useState([])
  const [klaviyoLoading, setKlaviyoLoading] = useState(true)
  const [lastSynced, setLastSynced] = useState(null)

  const loadKlaviyo = useCallback(async (force = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('lpla_admin_token') : ''
    if (!token) return
    setKlaviyoLoading(true)
    try {
      const url = `${API}/api/klaviyo/profiles${force ? '?refresh=1' : ''}`
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!r.ok) {
        console.error('Klaviyo profiles fetch failed:', r.status, r.statusText)
        return
      }
      const cacheUpdated = r.headers.get('X-Cache-Updated')
      if (cacheUpdated) setLastSynced(new Date(cacheUpdated))
      else if (force) setLastSynced(new Date())
      const data = await r.json()
      const list = Array.isArray(data) ? data : (Array.isArray(data?.profiles) ? data.profiles : [])
      setKlaviyoContacts(list.map(klaviyoProfileToContact))
    } catch (err) {
      console.error('Klaviyo profiles error:', err)
    } finally {
      setKlaviyoLoading(false)
    }
  }, [])

  useEffect(() => { loadKlaviyo(false) }, [loadKlaviyo])

  const allContacts = useMemo(() => {
    const map = {}
    orderContacts.forEach(c => { map[c.id] = { ...c } })
    imported.forEach(c => {
      if (!map[c.id]) map[c.id] = c
    })
    klaviyoContacts.forEach(c => {
      if (map[c.id]) {
        const existing = map[c.id]
        existing.lists = c.lists || []
        existing.klaviyoId = c.klaviyoId
        existing.source = 'merged'
        if (c.phone && !existing.phone?.startsWith('+1 ')) existing.phone = c.phone
        if (c.locationStr) existing.locationStr = c.locationStr
        if (c.city) existing.city = c.city
        if (c.region) existing.region = c.region
        if (c.timezone) existing.timezone = c.timezone
        existing.klaviyoCreated = c.klaviyoCreated
        existing.klaviyoUpdated = c.klaviyoUpdated
      } else {
        map[c.id] = c
      }
    })
    return Object.values(map).sort((a, b) => b.lastActivity - a.lastActivity)
  }, [orderContacts, imported, klaviyoContacts])

  const [segment, setSegment] = useState('all')
  const [showImport, setShowImport] = useState(false)
  const [importBanner, setImportBanner] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key:'lastActivity', dir:-1 })
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(null)
  const PER = 20

  const dynamicSegments = useMemo(() => {
    const listNames = new Set()
    klaviyoContacts.forEach(c => {
      if (c.lists) {
        c.lists.forEach(l => listNames.add(l.name))
      }
    })
    const segments = [
      { id:'all', label:'All Contacts', icon:'people' },
      ...Array.from(listNames).map(name => ({
        id: `list_${name}`,
        label: name,
        icon: 'mail',
        isKlaviyoList: true,
      })),
    ]
    return segments.length > 1 ? segments : DEFAULT_CRM_SEGMENTS
  }, [klaviyoContacts])

  const segCount = id => {
    if (id==='all') return allContacts.length
    if (id.startsWith('list_')) {
      const listName = id.replace('list_', '')
      return allContacts.filter(c=>c.lists && c.lists.some(l=>l.name===listName)).length
    }
    if (id==='Volunteer') return allContacts.filter(c=>c.tags.includes('Volunteer')).length
    return allContacts.filter(c=>c.segment===id).length
  }

  const q = search.trim().toLowerCase()
  const filtered = allContacts.filter(c => {
    if (segment !== 'all') {
      if (segment.startsWith('list_')) {
        const listName = segment.replace('list_', '')
        if (!c.lists || !c.lists.some(l=>l.name===listName)) return false
      } else if (segment === 'Volunteer') {
        if (!c.tags.includes('Volunteer')) return false
      } else if (c.segment !== segment) return false
    }
    if (q && !(c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))) return false
    return true
  }).slice().sort((a,b)=>{
    const av = sort.key==='lastActivity' ? a.lastActivity : sort.key==='totalSpend' ? a.totalSpend : sort.key==='engagementScore' ? a.engagementScore : a.bookingCount
    const bv = sort.key==='lastActivity' ? b.lastActivity : sort.key==='totalSpend' ? b.totalSpend : sort.key==='engagementScore' ? b.engagementScore : b.bookingCount
    return sort.dir * (bv - av)
  })

  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const pg = Math.min(page, pages-1)
  const rows = filtered.slice(pg*PER, pg*PER+PER)
  useEffect(()=>setPage(0), [search,segment])

  function thSort(key) {
    setSort(s => s.key===key ? {...s,dir:s.dir*-1} : {key,dir:-1})
  }
  const ThArr = ({k}) => sort.key===k ? <AdmIcon name="chevronDown" size={11} color={ADM.primary} style={{transform:sort.dir<0?'none':'rotate(180deg)'}} /> : null

  const totalContacts = allContacts.length
  const avgLTV = totalContacts ? Math.round(allContacts.reduce((s,c)=>s+c.totalSpend,0)/totalContacts) : 0
  const vipCount = allContacts.filter(c=>c.segment==='VIP').length
  const avgEngage = totalContacts ? Math.round(allContacts.reduce((s,c)=>s+c.engagementScore,0)/totalContacts) : 0

  const thStyle = { padding:'10px 16px', textAlign:'left', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, color:ADM.light, textTransform:'uppercase', letterSpacing:1.1, whiteSpace:'nowrap', cursor:'pointer', userSelect:'none' }

  if (klaviyoLoading && klaviyoContacts.length === 0) {
    return (
      <div style={{ display:'flex', flex:1, overflow:'hidden', background:ADM.bg, alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:36, height:36, border:`3px solid ${ADM.border}`, borderTopColor:ADM.primary, borderRadius:'50%', animation:'lpla-spin 0.8s linear infinite', margin:'0 auto 16px' }} />
          <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:18, fontWeight:800, color:ADM.text, letterSpacing:.4, textTransform:'uppercase' }}>Loading contacts…</div>
          <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.muted, marginTop:6 }}>Fetching from cache</div>
          <style>{`@keyframes lpla-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:'flex', flex:1, overflow:'hidden', background:ADM.bg }}>

      <div style={{ width:200, flexShrink:0, background:ADM.card, borderRight:`1px solid ${ADM.border}`, display:'flex', flexDirection:'column', overflow:'auto' }}>
        <div style={{ padding:'20px 16px 12px' }}>
          <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, color:ADM.light, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Segments</div>
          {dynamicSegments.map(s=>{
            const cnt = segCount(s.id)
            const active = segment===s.id
            return (
              <button key={s.id} onClick={()=>setSegment(s.id)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:9, padding:'9px 10px', borderRadius:9, border:'none', cursor:'pointer', background:active?`${ADM.navAccent}1e`:'transparent', color:active?ADM.navAccent:ADM.muted, marginBottom:2, transition:'all .15s', textAlign:'left' }}>
                <AdmIcon name={s.icon} size={15} color={active?ADM.navAccent:ADM.light} />
                <span style={{ flex:1, fontFamily:'Nunito,system-ui', fontSize:13, fontWeight:active?700:500 }}>{s.label}</span>
                <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:800, color:active?ADM.navAccent:ADM.light }}>{cnt}</span>
              </button>
            )
          })}
        </div>

        <div style={{ padding:'16px 16px 12px', borderTop:`1px solid ${ADM.border}`, marginTop:'auto' }}>
          <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, color:ADM.light, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Tags</div>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {ALL_TAGS.map(t=>{
              const cnt = allContacts.filter(c=>c.tags.includes(t)).length
              if (!cnt) return null
              const s = crmTagStyle(t)
              return (
                <div key={t} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, color:s.color, textTransform:'uppercase', letterSpacing:.4 }}>
                    <span style={{ width:6,height:6,borderRadius:'50%',background:s.color,flexShrink:0 }} />{t}
                  </span>
                  <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, color:ADM.light }}>{cnt}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', minWidth:0 }}>
        <div style={{ padding:'24px 28px 0', flexShrink:0 }}>

          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:28, fontWeight:800, color:ADM.text, margin:0, textTransform:'uppercase', letterSpacing:.5 }}>Contacts &amp; Profiles</h1>
              <p style={{ fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.muted, margin:'4px 0 0' }}>Every person who has booked, signed up, or attended an LPLA event.</p>
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              {lastSynced && <span style={{ fontFamily:'Nunito,system-ui', fontSize:11.5, color:ADM.light, marginRight:4 }}>Last synced {admTimeAgo(lastSynced.getTime())}</span>}
              <button onClick={() => loadKlaviyo(true)} disabled={klaviyoLoading} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:ADM.card, color:ADM.text, cursor:klaviyoLoading?'default':'pointer', opacity:klaviyoLoading?.6:1, fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800, letterSpacing:.4 }}>
                <AdmIcon name="mail" size={16} color={ADM.muted} /> {klaviyoLoading ? 'Syncing…' : 'Refresh from Klaviyo'}
              </button>
              <button onClick={() => setShowImport(true)} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:ADM.card, color:ADM.text, cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800, letterSpacing:.4 }}>
                <AdmIcon name="download" size={16} color={ADM.muted} style={{ transform:'rotate(180deg)' }} /> Import
              </button>
              <button style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:ADM.radius, border:'none', background:ADM.primary, color:'#fff', cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800, letterSpacing:.4, boxShadow:'0 4px 14px rgba(41,65,84,.22)' }}>
                <AdmIcon name="download" size={16} color="#fff" /> Export contacts
              </button>
            </div>
          </div>

          {importBanner && (
            <div style={{ display:'flex', alignItems:'center', gap:10, background:`${ADM.success}12`, border:`1px solid ${ADM.success}44`, borderRadius:ADM.radius, padding:'10px 16px', marginBottom:14 }}>
              <AdmIcon name="check" size={16} color={ADM.success} />
              <span style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, color:ADM.text, flex:1 }}><strong>{importBanner} contacts</strong> imported successfully.</span>
              <button onClick={()=>setImportBanner(null)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex' }}><AdmIcon name="x" size={14} color={ADM.muted} /></button>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:12, marginBottom:18 }}>
            <OvKpi label="Total Contacts" value={totalContacts} icon="people" accent={ADM.primary} sub="Unique profiles" />
            <OvKpi label="Avg. Lifetime Value" value={admMoney(avgLTV)} icon="dollar" accent={ADM.success} sub="Per contact" />
            <OvKpi label="VIP Contacts" value={vipCount} icon="star" accent="#A07800" sub="Spent $80+" />
            <OvKpi label="Avg. Engagement" value={avgEngage+'/100'} icon="trend" accent={ADM.blue} sub="Across all contacts" />
          </div>

          <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center' }}>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'#fff', borderRadius:ADM.radius, padding:'0 12px', height:38, border:`1px solid ${ADM.border}` }}>
              <AdmIcon name="search" size={15} color="#94A3B8" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email…"
                style={{ border:'none', outline:'none', fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.text, flex:1, background:'transparent' }} />
              {search && <button onClick={()=>setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center' }}><AdmIcon name="x" size={14} color={ADM.light} /></button>}
            </div>
            <span style={{ fontFamily:'Nunito,system-ui', fontSize:12.5, color:ADM.light }}>{filtered.length} contact{filtered.length!==1?'s':''}</span>
          </div>
        </div>

        <div style={{ flex:1, overflow:'auto', padding:'0 28px 24px' }}>
          <div style={{ background:ADM.card, borderRadius:ADM.radiusMd, border:`1px solid ${ADM.border}`, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:780 }}>
                <thead>
                  <tr style={{ background:'#FAFAF7', borderBottom:`1px solid ${ADM.border}` }}>
                    <th style={thStyle}>Contact</th>
                    <th style={{...thStyle}} onClick={()=>thSort('totalSpend')}>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>Spend <ThArr k="totalSpend"/></div>
                    </th>
                    <th style={{...thStyle}} onClick={()=>thSort('bookingCount')}>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>Bookings <ThArr k="bookingCount"/></div>
                    </th>
                    <th style={{...thStyle, minWidth:130}} onClick={()=>thSort('engagementScore')}>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>Engagement <ThArr k="engagementScore"/></div>
                    </th>
                    <th style={thStyle}>Tags</th>
                    <th style={{...thStyle}} onClick={()=>thSort('lastActivity')}>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>Last Activity <ThArr k="lastActivity"/></div>
                    </th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length===0 ? (
                    <tr><td colSpan={7} style={{ padding:48, textAlign:'center', fontFamily:'Nunito,system-ui', fontSize:15, color:ADM.light }}>No contacts found.</td></tr>
                  ) : rows.map(c=>{
                    const cat = c.categories[0]
                    const catColor = {Escalada:'#294154',Senderismo:'#546207',Taller:'#A54399',Keynote:'#5E8BBD',Social:'#D9831F','Expedición':'#B32317',Voluntario:'#00897A'}[cat]||ADM.primary
                    return (
                      <tr key={c.id} onClick={()=>setSelected(c)}
                        style={{ borderBottom:`1px solid ${ADM.border}`, cursor:'pointer', transition:'background .12s' }}
                        onMouseOver={e=>e.currentTarget.style.background='#FAFAF7'}
                        onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, background:`${catColor}1a`, color:catColor, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight:800 }}>{c.initials}</div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ fontFamily:'Nunito,system-ui', fontSize:13.5, fontWeight:700, color:ADM.text }}>{c.name}</div>
                              <div style={{ fontFamily:'Nunito,system-ui', fontSize:11.5, color:ADM.light, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:180 }}>{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:16, fontWeight:800, color:c.totalSpend?ADM.text:ADM.light }}>{c.totalSpend?admMoney(c.totalSpend):'Free'}</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:17, fontWeight:800, color:ADM.text }}>{c.bookingCount}</span>
                        </td>
                        <td style={{ padding:'12px 16px', minWidth:130 }}>
                          <EngagementBar score={c.engagementScore} size="sm" />
                          <span style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:ADM.light }}>{c.engagementScore}/100</span>
                        </td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', gap:5, flexWrap:'wrap', maxWidth:180 }}>
                            {c.tags.slice(0,3).map(t=><CrmTag key={t} tag={t} />)}
                            {c.tags.length>3 && <span style={{ fontFamily:'Nunito,system-ui', fontSize:11.5, color:ADM.light, alignSelf:'center' }}>+{c.tags.length-3}</span>}
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', fontFamily:'Nunito,system-ui', fontSize:12.5, color:ADM.muted, whiteSpace:'nowrap' }}>
                          {admTimeAgo(c.lastActivity)}
                        </td>
                        <td style={{ padding:'12px 12px', textAlign:'right' }}>
                          <AdmIcon name="chevronRight" size={16} color={ADM.light} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:`1px solid ${ADM.border}`, flexWrap:'wrap', gap:10 }}>
              <span style={{ fontFamily:'Nunito,system-ui', fontSize:12.5, color:ADM.muted }}>
                {filtered.length ? `${pg*PER+1}–${Math.min(filtered.length,pg*PER+PER)} of ${filtered.length}` : '0'}
              </span>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={()=>setPage(Math.max(0,pg-1))} disabled={pg===0}
                  style={{ width:32, height:32, borderRadius:8, border:`1px solid ${ADM.border}`, background:'#fff', cursor:pg===0?'not-allowed':'pointer', opacity:pg===0?.45:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <AdmIcon name="chevronLeft" size={15} color={ADM.muted} />
                </button>
                <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, color:ADM.text, minWidth:64, textAlign:'center', lineHeight:'32px' }}>{pg+1} / {pages}</span>
                <button onClick={()=>setPage(Math.min(pages-1,pg+1))} disabled={pg>=pages-1}
                  style={{ width:32, height:32, borderRadius:8, border:`1px solid ${ADM.border}`, background:'#fff', cursor:pg>=pages-1?'not-allowed':'pointer', opacity:pg>=pages-1?.45:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <AdmIcon name="chevronRight" size={15} color={ADM.muted} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selected && <CrmDrawer contact={selected} allTags={ALL_TAGS} onClose={()=>setSelected(null)} />}
      {showImport && <CrmImportModal onClose={()=>setShowImport(false)} onImport={contacts=>{
        const newContacts = contacts.map(importedToContact)
        const next = [...imported, ...newContacts]
        setImported(next)
        try { localStorage.setItem('lpla_crm_imported', JSON.stringify(next)) } catch {}
        setImportBanner(contacts.length)
        setShowImport(false)
      }} />}
    </div>
  )
}
