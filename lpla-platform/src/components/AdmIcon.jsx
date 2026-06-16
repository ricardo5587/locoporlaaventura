'use client'

const PATHS = {
  chart: <g><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" rx="1" /><rect x="12.5" y="7" width="3" height="10" rx="1" /><rect x="18" y="13" width="3" height="4" rx="1" /></g>,
  calendar: <g><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></g>,
  people: <g><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.2 2.5-5.4 5.5-5.4s5.5 2.2 5.5 5.4" /><path d="M16 5.2a3 3 0 010 5.6M17.5 20c0-2.4-.9-4.3-2.3-5.3" /></g>,
  apps: <g><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></g>,
  settings: <g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></g>,
  launch: <g><path d="M14 4h6v6" /><path d="M20 4l-8.5 8.5" /><path d="M18 13.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h5.5" /></g>,
  pencil: <g><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></g>,
  trash: <g><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /></g>,
  user: <g><circle cx="12" cy="8" r="4" /><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" /></g>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  search: <g><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></g>,
  plus: <path d="M12 5v14M5 12h14" />,
  dollar: <g><path d="M12 2.5v19" /><path d="M16.5 6.8c0-1.8-2-3.3-4.5-3.3s-4.5 1.5-4.5 3.3 2 3.3 4.5 3.3 4.5 1.5 4.5 3.3-2 3.3-4.5 3.3-4.5-1.5-4.5-3.3" /></g>,
  ticket: <g><path d="M3 7.5a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 7.5V10a2 2 0 000 4v2.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5V14a2 2 0 000-4V7.5z" /><path d="M14 6.5v11" strokeDasharray="2 2.4" /></g>,
  globe: <g><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c-2.8 3-4 5.9-4 9s1.2 6 4 9M12 3c2.8 3 4 5.9 4 9s-1.2 6-4 9" /></g>,
};

export default function AdmIcon({ name, size = 18, strokeWidth = 1.7, style = {}, color }) {
  const inner = PATHS[name];
  if (!inner) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}>
      {inner}
    </svg>
  );
}
