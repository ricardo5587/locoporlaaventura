import { useState } from 'react';
import { WEB } from '../lib/tokens';

const COUNTRY_CODES = [
  { code:'+1',  flag:'🇺🇸', label:'US +1' },
  { code:'+1',  flag:'🇨🇦', label:'CA +1' },
  { code:'+52', flag:'🇲🇽', label:'MX +52' },
  { code:'+44', flag:'🇬🇧', label:'UK +44' },
  { code:'+34', flag:'🇪🇸', label:'ES +34' },
  { code:'+57', flag:'🇨🇴', label:'CO +57' },
  { code:'+51', flag:'🇵🇪', label:'PE +51' },
  { code:'+56', flag:'🇨🇱', label:'CL +56' },
  { code:'+54', flag:'🇦🇷', label:'AR +54' },
  { code:'+503',flag:'🇸🇻', label:'SV +503' },
  { code:'+502',flag:'🇬🇹', label:'GT +502' },
  { code:'+504',flag:'🇭🇳', label:'HN +504' },
];

export function PhoneInput({ value, onChange, style = {}, hasError }) {
  const [codeIdx, setCodeIdx] = useState(0);
  const selected = COUNTRY_CODES[codeIdx];
  const number = value.startsWith('+') ? value.replace(/^\+\d{1,3}\s*/, '') : value;

  function handleCodeChange(e) {
    const idx = Number(e.target.value);
    setCodeIdx(idx);
    onChange(COUNTRY_CODES[idx].code + ' ' + number);
  }

  function handleNumberChange(e) {
    onChange(selected.code + ' ' + e.target.value);
  }

  return (
    <div style={{ display:'flex', gap:0, ...style }}>
      <select value={codeIdx} onChange={handleCodeChange}
        style={{ width:80, height:44, borderRadius:'10px 0 0 10px', border:`1.5px solid ${hasError ? '#E74C3C' : WEB.borderMd}`, borderRight:'none', padding:'0 4px 0 8px', fontFamily:'Nunito,system-ui', fontSize:16, color:WEB.text, outline:'none', cursor:'pointer', background:'#fff', boxSizing:'border-box', appearance:'auto' }}>
        {COUNTRY_CODES.map((c, i) => (
          <option key={i} value={i}>{c.flag} {c.code}</option>
        ))}
      </select>
      <input type="tel" value={number} onChange={handleNumberChange}
        placeholder="(555) 000-0000"
        style={{ flex:1, height:44, borderRadius:'0 10px 10px 0', border:`1.5px solid ${hasError ? '#E74C3C' : WEB.borderMd}`, padding:'0 12px', fontFamily:'Nunito,system-ui', fontSize:16, color:WEB.text, outline:'none', background:'#fff', boxSizing:'border-box' }} />
    </div>
  );
}

export function WebBadge({ children, bg = WEB.green, color = '#fff', style = {} }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, background:bg, color, fontFamily:'Barlow Condensed,system-ui', fontSize:12, fontWeight:700, letterSpacing:.6, textTransform:'uppercase', whiteSpace:'nowrap', ...style }}>
      {children}
    </span>
  );
}

export function WebMountains({ height = 140, style = {} }) {
  return (
    <svg width="100%" height={height} viewBox="0 0 1440 140" preserveAspectRatio="none" style={{ display:'block', ...style }}>
      <path d="M0 140 L0 75 L80 48 L160 80 L260 20 L360 60 L440 30 L540 70 L640 8 L740 50 L840 22 L940 65 L1040 35 L1140 72 L1240 40 L1360 68 L1440 48 L1440 140 Z" fill={WEB.mountain} opacity={0.7} />
      <path d="M0 140 L0 100 L90 80 L180 105 L280 70 L380 95 L480 72 L580 98 L680 62 L780 88 L880 70 L980 100 L1080 78 L1180 105 L1280 82 L1380 100 L1440 85 L1440 140 Z" fill={WEB.mountainDk} />
    </svg>
  );
}

export function WebImgPlaceholder({ height = 220, label = '', index = 0, style = {}, image }) {
  const grads = [
    'linear-gradient(135deg,#1B5E7F 0%,#4A6E1A 100%)',
    'linear-gradient(135deg,#2D4D0E 0%,#1B5E7F 100%)',
    'linear-gradient(135deg,#4A9EC7 0%,#1B5E7F 100%)',
    'linear-gradient(135deg,#5E3B1E 0%,#4A6E1A 100%)',
    'linear-gradient(135deg,#0B1E2B 0%,#2B7A9F 100%)',
    'linear-gradient(135deg,#1B5E7F 0%,#5C3B1E 100%)',
  ];
  if (image) {
    return (
      <div style={{ height, position:'relative', overflow:'hidden', ...style }}>
        <img src={image} alt={label} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
      </div>
    );
  }
  return (
    <div style={{ height, position:'relative', overflow:'hidden', ...style }}>
      <div style={{ position:'absolute', inset:0, background:grads[index % 6] }} />
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
        <path d="M60 190 L160 90 L210 125 L270 55 L360 190" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="270,55 258,80 282,80" fill="rgba(255,255,255,.35)" />
        <circle cx="80" cy="72" r="18" fill="rgba(255,255,255,.18)" />
      </svg>
      {label && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,.45)', textAlign:'center', padding:16, lineHeight:1.5 }}>{label}</div>}
    </div>
  );
}

export function WebStarRow({ count = 3, color = WEB.green, size = 9 }) {
  return (
    <div style={{ display:'flex', gap:5, alignItems:'center' }}>
      {Array.from({ length:count }).map((_,i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 10 10">
          <polygon points="5,.5 6.16,3.54 9.51,3.54 6.86,5.73 7.94,8.79 5,6.64 2.06,8.79 3.14,5.73 .49,3.54 3.84,3.54" fill={color} />
        </svg>
      ))}
    </div>
  );
}

export const MAX_W = { maxWidth:1200, margin:'0 auto', padding:'0 24px' };
