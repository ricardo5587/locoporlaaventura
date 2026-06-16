'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://locoporlaaventura.vercel.app';

const ADM = {
  bg:'#F7F6F1', sidebar:'#2B353F', card:'#FFFFFF', border:'#E6E1D5',
  text:'#2B353F', muted:'#6B7280', light:'#A0998C',
  primary:'#294154', navAccent:'#A8B84A',
  success:'#5E7A0C', danger:'#B32317', warning:'#D9831F',
  radius:10, radiusMd:14, radiusLg:18,
};

const CAT_COLORS = {
  'Escalada':'#294154','Senderismo':'#546207','Taller':'#A54399',
  'Keynote':'#5E8BBD','Social':'#D9831F','Expedición':'#B32317','Voluntario':'#00897A',
};

const CATEGORIES = ['Escalada','Senderismo','Taller','Keynote','Social','Expedición','Voluntario'];

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}

const EMPTY_EVENT = {
  titleEn:'', titleEs:'', descEn:'', descEs:'',
  date:'', time:'', location:'', category:'Escalada',
  price:0, isFree:false, totalSpots:20, draft:false,
  tickets:[{ id:'general', en:'General Admission', es:'Entrada General', price:0 }],
};

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_EVENT);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('lpla_admin_token');
    if (!t) { router.push('/admin/login'); return; }
    setToken(t);
    loadEvents(t);
  }, []);

  async function loadEvents(t) {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/events`, { headers:{ Authorization:`Bearer ${t}` } });
      const data = await r.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch { setError('Failed to load events'); }
    setLoading(false);
  }

  function logout() {
    localStorage.removeItem('lpla_admin_token');
    router.push('/admin/login');
  }

  function openCreate() {
    setEditEvent(null);
    setForm(EMPTY_EVENT);
    setModalOpen(true);
  }

  function openEdit(ev) {
    setEditEvent(ev);
    setForm({
      titleEn:ev.titleEn||'', titleEs:ev.titleEs||'',
      descEn:ev.descEn||'', descEs:ev.descEs||'',
      date:ev.date||'', time:ev.time||'',
      location:ev.location||'', category:ev.category||'Escalada',
      price:ev.price||0, isFree:ev.isFree||false,
      totalSpots:ev.totalSpots||20, draft:ev.draft||false,
      tickets:ev.tickets?.length ? ev.tickets : EMPTY_EVENT.tickets,
    });
    setModalOpen(true);
  }

  async function saveEvent() {
    setSaving(true);
    try {
      const body = {
        ...form,
        price: form.isFree ? 0 : Number(form.price),
        totalSpots: Number(form.totalSpots),
      };
      const url = editEvent ? `${API}/api/events/${editEvent.id}` : `${API}/api/events`;
      const method = editEvent ? 'PATCH' : 'POST';
      if (!editEvent) body.spotsLeft = body.totalSpots;
      const r = await fetch(url, {
        method,
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('Save failed');
      setModalOpen(false);
      loadEvents(token);
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function deleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    await fetch(`${API}/api/events/${id}`, {
      method:'DELETE',
      headers:{ Authorization:`Bearer ${token}` },
    });
    loadEvents(token);
  }

  function setTicket(i, field, val) {
    setForm(f => {
      const tickets = [...f.tickets];
      tickets[i] = { ...tickets[i], [field]: val };
      return { ...f, tickets };
    });
  }

  function addTicket() {
    setForm(f => ({ ...f, tickets:[...f.tickets,{ id:`t${Date.now()}`, en:'', es:'', price:0 }] }));
  }

  function removeTicket(i) {
    setForm(f => ({ ...f, tickets:f.tickets.filter((_,j)=>j!==i) }));
  }

  const navItems = [
    { label:'Overview', active:false },
    { label:'Events', active:true },
    { label:'Attendees', active:false },
    { label:'Contacts', active:false },
    { label:'Apps', active:false },
  ];

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:'Nunito,system-ui', background:ADM.bg }}>

      {/* Sidebar */}
      <div style={{ width:240, background:ADM.sidebar, display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ padding:'20px 20px 12px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src="/logo.png" alt="LPLA" style={{ height:32, filter:'brightness(0) invert(1)' }} onError={e=>e.target.style.display='none'} />
            <div>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:16, fontWeight:800, color:'#fff', textTransform:'uppercase', letterSpacing:.5, lineHeight:1 }}>LPLA</div>
              <div style={{ fontFamily:'Nunito,system-ui', fontSize:11, color:'rgba(255,255,255,.4)', marginTop:2 }}>Admin</div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'12px 10px' }}>
          {navItems.map(item => (
            <div key={item.label} style={{
              position:'relative', display:'flex', alignItems:'center', gap:10,
              padding:'9px 14px', borderRadius:8, marginBottom:2, cursor: item.active ? 'default' : 'not-allowed',
              background: item.active ? 'rgba(168,184,74,.18)' : 'transparent',
              color: item.active ? ADM.navAccent : 'rgba(255,255,255,.35)',
              fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600,
            }}>
              {item.active && <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:3, height:20, borderRadius:2, background:ADM.navAccent }} />}
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,.08)' }}>
          <button onClick={logout} style={{ width:'100%', padding:'9px 14px', borderRadius:8, border:'1px solid rgba(255,255,255,.12)', background:'transparent', color:'rgba(255,255,255,.5)', fontFamily:'Nunito,system-ui', fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'left' }}>
            Log out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Top bar */}
        <div style={{ height:52, background:ADM.sidebar, borderBottom:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', flexShrink:0 }}>
          <div>
            <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'rgba(255,255,255,.9)' }}>Events</span>
            <span style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:'rgba(255,255,255,.4)', marginLeft:12 }}>Live &middot; {events.length} events synced</span>
          </div>
          <button onClick={openCreate} style={{ padding:'8px 18px', borderRadius:ADM.radius, border:'none', background:ADM.navAccent, color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', cursor:'pointer' }}>
            + Create Event
          </button>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflow:'auto', padding:24 }}>
          {error && <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:ADM.radius, padding:'12px 16px', marginBottom:16, color:ADM.danger, fontSize:14 }}>{error}</div>}

          {loading ? (
            <div style={{ textAlign:'center', padding:60, color:ADM.muted }}>Loading events...</div>
          ) : (
            <div style={{ background:ADM.card, borderRadius:ADM.radiusMd, border:`1px solid ${ADM.border}`, overflow:'hidden' }}>
              {/* Table header */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 120px 110px 80px 110px 90px 80px', padding:'10px 16px', borderBottom:`1px solid ${ADM.border}`, background:'#FAFAF8' }}>
                {['Title','Category','Date','Price','Sold/Cap','Status','Actions'].map(h => (
                  <div key={h} style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.light }}>{h}</div>
                ))}
              </div>

              {events.length === 0 && (
                <div style={{ padding:'40px 16px', textAlign:'center', color:ADM.muted, fontSize:14 }}>
                  No events yet. Click "+ Create Event" to add your first event.
                </div>
              )}

              {events.map((ev, i) => (
                <div key={ev.id} style={{ display:'grid', gridTemplateColumns:'1fr 120px 110px 80px 110px 90px 80px', padding:'12px 16px', borderBottom: i < events.length-1 ? `1px solid ${ADM.border}` : 'none', alignItems:'center' }}>
                  <div>
                    <div style={{ fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:700, color:ADM.text }}>{ev.titleEn}</div>
                    <div style={{ fontFamily:'Nunito,system-ui', fontSize:12, color:ADM.muted }}>{ev.titleEs}</div>
                  </div>
                  <div>
                    <span style={{ display:'inline-flex', padding:'3px 9px', borderRadius:6, background:CAT_COLORS[ev.category]||ADM.muted, color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:.6, textTransform:'uppercase' }}>
                      {ev.category}
                    </span>
                  </div>
                  <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.muted }}>{fmtDate(ev.date)}</div>
                  <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:700, color:ev.isFree?ADM.success:ADM.text }}>{ev.isFree||ev.price===0?'Free':`$${ev.price}`}</div>
                  <div style={{ fontFamily:'Nunito,system-ui', fontSize:13, color:ADM.muted }}>{ev.spotsLeft}/{ev.totalSpots}</div>
                  <div>
                    <span style={{ display:'inline-flex', padding:'3px 9px', borderRadius:6, background:ev.draft?'rgba(107,114,128,.12)':'rgba(94,122,12,.12)', color:ev.draft?ADM.muted:ADM.success, fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:.6, textTransform:'uppercase' }}>
                      {ev.draft?'Draft':'Published'}
                    </span>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => openEdit(ev)} style={{ width:28, height:28, borderRadius:6, border:`1px solid ${ADM.border}`, background:'#fff', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }} title="Edit">{'✏️'}</button>
                    <button onClick={() => deleteEvent(ev.id)} style={{ width:28, height:28, borderRadius:6, border:`1px solid rgba(179,35,23,.3)`, background:'rgba(179,35,23,.06)', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }} title="Delete">{'🗑️'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div style={{ background:'#fff', borderRadius:ADM.radiusLg, width:'100%', maxWidth:760, maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 80px rgba(0,0,0,.25)' }}>
            <div style={{ padding:'20px 24px', borderBottom:`1px solid ${ADM.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:20, fontWeight:800, color:ADM.text, textTransform:'uppercase', letterSpacing:.5 }}>
                {editEvent ? 'Edit Event' : 'Create Event'}
              </div>
              <button onClick={() => setModalOpen(false)} style={{ border:'none', background:'transparent', fontSize:20, cursor:'pointer', color:ADM.muted, lineHeight:1 }}>&times;</button>
            </div>

            <div style={{ padding:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                {[['titleEn','Title (English)'],['titleEs','Title (Spanish)']].map(([k,l]) => (
                  <div key={k}>
                    <label style={{ display:'block', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted, marginBottom:6 }}>{l}</label>
                    <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:'100%', height:40, borderRadius:8, border:`1px solid ${ADM.border}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, boxSizing:'border-box', outline:'none' }} />
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                {[['descEn','Description (English)'],['descEs','Description (Spanish)']].map(([k,l]) => (
                  <div key={k}>
                    <label style={{ display:'block', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted, marginBottom:6 }}>{l}</label>
                    <textarea value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} rows={3} style={{ width:'100%', borderRadius:8, border:`1px solid ${ADM.border}`, padding:'8px 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, boxSizing:'border-box', resize:'vertical', outline:'none' }} />
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted, marginBottom:6 }}>Date</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ width:'100%', height:40, borderRadius:8, border:`1px solid ${ADM.border}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, boxSizing:'border-box', outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted, marginBottom:6 }}>Time</label>
                  <input value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} placeholder="9:00 AM" style={{ width:'100%', height:40, borderRadius:8, border:`1px solid ${ADM.border}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, boxSizing:'border-box', outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted, marginBottom:6 }}>Category</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{ width:'100%', height:40, borderRadius:8, border:`1px solid ${ADM.border}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, boxSizing:'border-box', background:'#fff', outline:'none' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted, marginBottom:6 }}>Total Spots</label>
                  <input type="number" value={form.totalSpots} onChange={e=>setForm(f=>({...f,totalSpots:e.target.value}))} style={{ width:'100%', height:40, borderRadius:8, border:`1px solid ${ADM.border}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, boxSizing:'border-box', outline:'none' }} />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted, marginBottom:6 }}>Location</label>
                  <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} style={{ width:'100%', height:40, borderRadius:8, border:`1px solid ${ADM.border}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, boxSizing:'border-box', outline:'none' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted, marginBottom:6 }}>Price ($)</label>
                  <input type="number" value={form.price} disabled={form.isFree} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={{ width:'100%', height:40, borderRadius:8, border:`1px solid ${ADM.border}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, boxSizing:'border-box', outline:'none', opacity:form.isFree?.5:1 }} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', paddingBottom:2 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text }}>
                    <input type="checkbox" checked={form.isFree} onChange={e=>setForm(f=>({...f,isFree:e.target.checked,price:e.target.checked?0:f.price}))} style={{ accentColor:ADM.success, width:16, height:16 }} />
                    Free event
                  </label>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:14, color:ADM.text, marginTop:8 }}>
                    <input type="checkbox" checked={form.draft} onChange={e=>setForm(f=>({...f,draft:e.target.checked}))} style={{ accentColor:ADM.muted, width:16, height:16 }} />
                    Save as draft
                  </label>
                </div>
              </div>

              {/* Tickets */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <label style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:ADM.muted }}>Ticket Types</label>
                  <button onClick={addTicket} style={{ padding:'4px 12px', borderRadius:6, border:`1px solid ${ADM.border}`, background:'#fff', cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:600, color:ADM.primary }}>+ Add ticket</button>
                </div>
                {form.tickets.map((t,i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 80px 32px', gap:8, marginBottom:8 }}>
                    <input value={t.en} onChange={e=>setTicket(i,'en',e.target.value)} placeholder="Label (EN)" style={{ height:36, borderRadius:6, border:`1px solid ${ADM.border}`, padding:'0 10px', fontFamily:'Nunito,system-ui', fontSize:13, outline:'none' }} />
                    <input value={t.es} onChange={e=>setTicket(i,'es',e.target.value)} placeholder="Label (ES)" style={{ height:36, borderRadius:6, border:`1px solid ${ADM.border}`, padding:'0 10px', fontFamily:'Nunito,system-ui', fontSize:13, outline:'none' }} />
                    <input type="number" value={t.price} onChange={e=>setTicket(i,'price',Number(e.target.value))} placeholder="Price" style={{ height:36, borderRadius:6, border:`1px solid ${ADM.border}`, padding:'0 10px', fontFamily:'Nunito,system-ui', fontSize:13, outline:'none' }} />
                    <button onClick={()=>removeTicket(i)} disabled={form.tickets.length===1} style={{ height:36, borderRadius:6, border:`1px solid rgba(179,35,23,.3)`, background:'rgba(179,35,23,.06)', cursor:'pointer', color:ADM.danger, fontSize:14, opacity:form.tickets.length===1?.4:1 }}>&times;</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding:'16px 24px', borderTop:`1px solid ${ADM.border}`, display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={()=>setModalOpen(false)} style={{ padding:'9px 20px', borderRadius:ADM.radius, border:`1px solid ${ADM.border}`, background:'#fff', cursor:'pointer', fontFamily:'Nunito,system-ui', fontSize:14, fontWeight:600, color:ADM.muted }}>Cancel</button>
              <button onClick={saveEvent} disabled={saving} style={{ padding:'9px 24px', borderRadius:ADM.radius, border:'none', background:ADM.navAccent, cursor:saving?'default':'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:700, letterSpacing:.5, textTransform:'uppercase', color:'#fff', opacity:saving?.7:1 }}>
                {saving ? 'Saving...' : editEvent ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
