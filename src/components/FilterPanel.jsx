import { useState } from 'react';
import { WEB, CAT_ICONS } from '../lib/tokens';

// ── Helpers ────────────────────────────────────────────────────────────────
export function toDateString(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── Filter trigger button ─────────────────────────────────────────────────────
export function FilterTriggerBtn({ activeCount, onClick, lang, open }) {
  const L = (es, en) => lang === 'es' ? es : en;
  const [hov, setHov] = useState(false);
  const has = activeCount > 0;

  return (
    <button
      onClick={onClick}
      onMouseOver={() => setHov(true)}
      onMouseOut={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 20px', borderRadius: 22,
        border: `1.5px solid ${has ? WEB.teal : hov ? WEB.tealLight : WEB.borderMd}`,
        background: has ? 'rgba(27,94,127,.07)' : '#fff',
        color: has ? WEB.teal : hov ? WEB.tealLight : WEB.textMuted,
        fontFamily: 'Barlow Condensed,system-ui', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', letterSpacing: .6, textTransform: 'uppercase',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: open ? WEB.shadow : hov ? WEB.shadowMd : 'none',
        transition: 'all .2s ease',
      }}>
      <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
        <path d="M0 1.5h15M3 6h9M6 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {L('Filtros', 'Filters')}
      {has && (
        <span style={{ background: WEB.teal, color: '#fff', borderRadius: 12,
          padding: '1px 8px', fontSize: 12, fontWeight: 800, lineHeight: 1.6 }}>
          {activeCount}
        </span>
      )}
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transition:'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>
        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── Active filter chip (dismissible tag) ──────────────────────────────────────
export function ActiveFilterChip({ label, onRemove }) {
  const [hov, setHov] = useState(false);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 8px 4px 12px', borderRadius: 16,
      background: WEB.teal, color: '#fff',
      fontFamily: 'Barlow Condensed,system-ui', fontSize: 12, fontWeight: 700, letterSpacing: .4 }}>
      {label}
      <button
        onClick={onRemove}
        onMouseOver={() => setHov(true)}
        onMouseOut={() => setHov(false)}
        style={{ background: hov ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.18)',
          border: 'none', color: '#fff', cursor: 'pointer',
          width: 18, height: 18, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
          transition: 'background .15s', lineHeight: 1, padding: 0 }}>
        ×
      </button>
    </span>
  );
}

// ── Main filter panel (anchored overlay) ──────────────────────────────────────
export function FilterPanel({ open, onClose, cat, setCat, dateStart, setDateStart, dateEnd, setDateEnd, lang }) {
  const L = (es, en) => lang === 'es' ? es : en;

  const cats = [
    { id:'all',        es:'Todos',       en:'All' },
    { id:'Escalada',   es:'Escalada',    en:'Climbing',   icon:CAT_ICONS.Escalada },
    { id:'Senderismo', es:'Senderismo',  en:'Hiking',     icon:CAT_ICONS.Senderismo },
    { id:'Taller',     es:'Taller',      en:'Workshop',   icon:CAT_ICONS.Taller },
    { id:'Keynote',    es:'Keynote',     en:'Keynote',    icon:CAT_ICONS.Keynote },
    { id:'Social',     es:'Social',      en:'Social',     icon:CAT_ICONS.Social },
    { id:'Expedición', es:'Expedición',  en:'Expedition', icon:CAT_ICONS.Expedición },
    { id:'Voluntario', es:'Voluntario',  en:'Volunteer',  icon:CAT_ICONS.Voluntario },
  ];

  function applyPreset(preset) {
    const now = new Date();
    if (preset === 'week') {
      const end = new Date(now); end.setDate(now.getDate() + 7);
      setDateStart(toDateString(now)); setDateEnd(toDateString(end));
    } else if (preset === 'month') {
      setDateStart(toDateString(new Date(now.getFullYear(), now.getMonth(), 1)));
      setDateEnd(toDateString(new Date(now.getFullYear(), now.getMonth()+1, 0)));
    } else if (preset === 'next') {
      setDateStart(toDateString(new Date(now.getFullYear(), now.getMonth()+1, 1)));
      setDateEnd(toDateString(new Date(now.getFullYear(), now.getMonth()+2, 0)));
    }
  }

  function resetAll() { setCat('all'); setDateStart(''); setDateEnd(''); }

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(11,30,43,.35)', backdropFilter:'blur(3px)' }} />
      <div style={{ position:'absolute', top:'calc(100% + 10px)', left:0, zIndex:201, background:'#fff', borderRadius:WEB.radiusLg, boxShadow:WEB.shadowLg, padding:'24px', width:'min(500px, 92vw)', border:`1px solid ${WEB.border}` }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 2h14M3.5 6h9M6.5 10h3" stroke={WEB.teal} strokeWidth="1.8" strokeLinecap="round" /></svg>
            <span style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:18, fontWeight:800, color:WEB.text, textTransform:'uppercase', letterSpacing:.5 }}>
              {L('Filtros', 'Filters')}
            </span>
          </div>
          <button onClick={onClose}
            style={{ width:30, height:30, borderRadius:8, border:`1px solid ${WEB.border}`, background:'transparent', cursor:'pointer', fontSize:18, color:WEB.textMuted, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
            onMouseOver={e => { e.currentTarget.style.background=WEB.bgAlt; e.currentTarget.style.color=WEB.text; }}
            onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=WEB.textMuted; }}>
            ×
          </button>
        </div>

        {/* Category */}
        <div style={{ marginBottom:22 }}>
          <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:WEB.textLight, marginBottom:12 }}>
            {L('Categoría', 'Category')}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {cats.map(c => {
              const isActive = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(c.id)}
                  style={{ padding:'7px 14px', borderRadius:20, border:`1.5px solid ${isActive ? WEB.green : WEB.border}`, background: isActive ? WEB.green : '#fff', color: isActive ? '#fff' : WEB.textMuted, fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight:700, letterSpacing:.4, cursor:'pointer', transition:'all .2s', textTransform:'uppercase' }}
                  onMouseOver={e => { if (!isActive) { e.currentTarget.style.borderColor=WEB.teal; e.currentTarget.style.color=WEB.teal; e.currentTarget.style.transform='translateY(-1px)'; }}}
                  onMouseOut={e => { if (!isActive) { e.currentTarget.style.borderColor=WEB.border; e.currentTarget.style.color=WEB.textMuted; e.currentTarget.style.transform=''; }}}>
                  {c.icon ? `${c.icon} ` : ''}{L(c.es, c.en)}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height:1, background:WEB.border, marginBottom:22 }} />

        {/* Date Range */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:800, letterSpacing:2, textTransform:'uppercase', color:WEB.textLight, marginBottom:12 }}>
            {L('Rango de Fechas', 'Date Range')}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
            {[
              { id:'week',  es:'Esta semana', en:'This Week'  },
              { id:'month', es:'Este mes',    en:'This Month' },
              { id:'next',  es:'Próximo mes', en:'Next Month' },
            ].map(p => (
              <button key={p.id} onClick={() => applyPreset(p.id)}
                style={{ padding:'6px 14px', borderRadius:16, border:`1.5px solid ${WEB.border}`, background:'#fff', color:WEB.textMuted, fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:700, letterSpacing:.4, cursor:'pointer', transition:'all .2s', textTransform:'uppercase' }}
                onMouseOver={e => { e.currentTarget.style.borderColor=WEB.sky; e.currentTarget.style.color=WEB.teal; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.background='rgba(74,158,199,.06)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor=WEB.border; e.currentTarget.style.color=WEB.textMuted; e.currentTarget.style.transform=''; e.currentTarget.style.background='#fff'; }}>
                {L(p.es, p.en)}
              </button>
            ))}
            {(dateStart || dateEnd) && (
              <button onClick={() => { setDateStart(''); setDateEnd(''); }}
                style={{ padding:'6px 12px', borderRadius:16, border:'1.5px solid rgba(231,76,60,.25)', background:'rgba(231,76,60,.05)', color:'#E74C3C', fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:700, letterSpacing:.4, cursor:'pointer', transition:'all .2s', textTransform:'uppercase' }}
                onMouseOver={e => { e.currentTarget.style.background='rgba(231,76,60,.1)'; e.currentTarget.style.borderColor='rgba(231,76,60,.5)'; }}
                onMouseOut={e => { e.currentTarget.style.background='rgba(231,76,60,.05)'; e.currentTarget.style.borderColor='rgba(231,76,60,.25)'; }}>
                {L('Limpiar fecha ×', 'Clear Date ×')}
              </button>
            )}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontFamily:'Nunito,system-ui', fontSize:11, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>{L('Desde', 'From')}</label>
              <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}
                style={{ height:44, width:'100%', borderRadius:10, border:`1.5px solid ${WEB.borderMd}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:WEB.text, outline:'none', cursor:'pointer', background:'#fff', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ fontFamily:'Nunito,system-ui', fontSize:11, fontWeight:700, color:WEB.textMuted, textTransform:'uppercase', letterSpacing:.8, display:'block', marginBottom:6 }}>{L('Hasta', 'To')}</label>
              <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)}
                style={{ height:44, width:'100%', borderRadius:10, border:`1.5px solid ${WEB.borderMd}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:14, color:WEB.text, outline:'none', cursor:'pointer', background:'#fff', boxSizing:'border-box' }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:16, borderTop:`1px solid ${WEB.border}` }}>
          <button onClick={resetAll}
            style={{ padding:'9px 18px', borderRadius:10, border:`1.5px solid ${WEB.border}`, background:'transparent', color:WEB.textMuted, fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight:700, letterSpacing:.3, cursor:'pointer', transition:'all .2s', textTransform:'uppercase' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='#E74C3C'; e.currentTarget.style.color='#E74C3C'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor=WEB.border; e.currentTarget.style.color=WEB.textMuted; }}>
            {L('Limpiar todo', 'Reset All')}
          </button>
          <button onClick={onClose}
            style={{ padding:'10px 22px', borderRadius:10, border:'none', background:WEB.teal, color:'#fff', fontFamily:'Barlow Condensed,system-ui', fontSize:14, fontWeight:800, letterSpacing:.3, cursor:'pointer', transition:'all .2s', textTransform:'uppercase', boxShadow:'0 4px 14px rgba(27,94,127,.3)' }}
            onMouseOver={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 22px rgba(27,94,127,.45)'; e.currentTarget.style.background=WEB.tealLight; }}
            onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 14px rgba(27,94,127,.3)'; e.currentTarget.style.background=WEB.teal; }}>
            {L('Ver resultados', 'View Results')}
          </button>
        </div>
      </div>
    </>
  );
}
