import { useState, useMemo } from 'react';
import { WEB, EVENTS } from '../lib/tokens';

export function DatePickerFilter({ selectedDate, setSelectedDate, lang }) {
  const L = (es, en) => lang === 'es' ? es : en;
  const init = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date('2026-06-01');
  const [viewYear,  setViewYear]  = useState(init.getFullYear());
  const [viewMonth, setViewMonth] = useState(init.getMonth());

  const eventDates = useMemo(() => new Set(EVENTS.map(e => e.date)), []);

  const MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTH_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const HEAD_EN  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const HEAD_ES  = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

  function prev() { if (viewMonth === 0) { setViewYear(y=>y-1); setViewMonth(11); } else setViewMonth(m=>m-1); }
  function next() { if (viewMonth === 11) { setViewYear(y=>y+1); setViewMonth(0); } else setViewMonth(m=>m+1); }

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMo = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells    = [...Array(firstDow).fill(null), ...Array.from({length: daysInMo}, (_,i) => i+1)];
  const pad      = n => String(n).padStart(2,'0');
  const toDS     = d => `${viewYear}-${pad(viewMonth+1)}-${pad(d)}`;

  const navBtn = { width:30, height:30, borderRadius:8, border:`1px solid ${WEB.border}`, background:'#fff', cursor:'pointer', fontFamily:'Barlow Condensed,system-ui', fontSize:18, fontWeight:700, color:WEB.teal, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, lineHeight:1 };

  return (
    <div>
      <div style={{ fontFamily:'Barlow Condensed,system-ui', fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:WEB.textLight, marginBottom:8 }}>
        {L('Fecha','Date')}
      </div>
      <div style={{ background:WEB.card, borderRadius:WEB.radius, border:`1px solid ${WEB.border}`, padding:'12px 14px', display:'inline-block', boxShadow:WEB.shadow }}>
        {/* Month / Year nav */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <button onClick={prev} style={navBtn}>‹</button>
          <span style={{ flex:1, textAlign:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:15, fontWeight:800, color:WEB.text, textTransform:'uppercase', letterSpacing:.4, userSelect:'none', minWidth:160 }}>
            {lang==='es' ? MONTH_ES[viewMonth] : MONTH_EN[viewMonth]} {viewYear}
          </span>
          <button onClick={next} style={navBtn}>›</button>
        </div>
        {/* Day-of-week headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 32px)', gap:2, marginBottom:4 }}>
          {(lang==='es' ? HEAD_ES : HEAD_EN).map(h => (
            <div key={h} style={{ textAlign:'center', fontFamily:'Barlow Condensed,system-ui', fontSize:10, fontWeight:700, color:WEB.textLight, textTransform:'uppercase', lineHeight:'20px' }}>{h}</div>
          ))}
        </div>
        {/* Day cells */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 32px)', gap:2 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} style={{ height:32 }} />;
            const ds = toDS(d);
            const hasEvent = eventDates.has(ds);
            const isSel    = selectedDate === ds;
            return (
              <button key={i} onClick={() => hasEvent && setSelectedDate(isSel ? null : ds)}
                style={{ width:32, height:32, borderRadius:8, border:'none', background: isSel ? WEB.teal : hasEvent ? WEB.greenPale : 'transparent', color: isSel ? '#fff' : hasEvent ? WEB.greenDark : WEB.textLight, fontFamily:'Barlow Condensed,system-ui', fontSize:13, fontWeight: hasEvent ? 800 : 400, cursor: hasEvent ? 'pointer' : 'default', position:'relative', transition:'background .15s' }}>
                {d}
                {hasEvent && !isSel && <div style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:WEB.green }} />}
              </button>
            );
          })}
        </div>
        {/* Clear selection */}
        {selectedDate && (
          <button onClick={() => setSelectedDate(null)} style={{ marginTop:10, width:'100%', padding:'5px 10px', borderRadius:8, border:`1px solid ${WEB.border}`, background:'transparent', color:WEB.textMuted, fontFamily:'Nunito,system-ui', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            {L('Ver todas las fechas ×', 'View all dates ×')}
          </button>
        )}
      </div>
    </div>
  );
}
