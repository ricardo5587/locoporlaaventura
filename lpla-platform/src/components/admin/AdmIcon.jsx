'use client';

const PATHS = {
  chart: <g><path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" rx="1" /><rect x="12.5" y="7" width="3" height="10" rx="1" /><rect x="18" y="13" width="3" height="4" rx="1" /></g>,
  calendar: <g><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></g>,
  people: <g><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.2 2.5-5.4 5.5-5.4s5.5 2.2 5.5 5.4" /><path d="M16 5.2a3 3 0 010 5.6M17.5 20c0-2.4-.9-4.3-2.3-5.3" /></g>,
  plug: <g><path d="M9 2.5v5M15 2.5v5" /><path d="M6.5 7.5h11v3a5.5 5.5 0 01-11 0v-3z" /><path d="M12 16v5.5" /></g>,
  apps: <g><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></g>,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  tag: <path d="M3 3h8l9 9a2 2 0 010 2.83l-5.17 5.17a2 2 0 01-2.83 0L3 11V3zm5.5 5.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  note: <g><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M8 8h8M8 12h8M8 16h5" /></g>,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  settings: <g><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></g>,
  shield: <path d="M12 3l8 3.6V11c0 4.6-3.4 8.9-8 10-4.6-1.1-8-5.4-8-10V6.6L12 3z" />,
  globe: <g><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c-2.8 3-4 5.9-4 9s1.2 6 4 9M12 3c2.8 3 4 5.9 4 9s-1.2 6-4 9" /></g>,
  pencil: <g><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></g>,
  trash: <g><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /></g>,
  externalLink: <g><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></g>,
  arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
  bell: <g><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></g>,
  team: <g><circle cx="9" cy="8" r="3.4" /><path d="M2.5 20c0-3.4 2.7-5.6 6.5-5.6s6.5 2.2 6.5 5.6" /><path d="M16.5 4.4a3.2 3.2 0 010 6.2M17.5 14.6c2.7.5 4 2.6 4 5.4" /></g>,
  key: <g><circle cx="8" cy="8" r="4.5" /><path d="M11.2 11.2L20 20M17 17l2-2M14.5 14.5l2-2" /></g>,
  userPlus: <g><circle cx="9" cy="8" r="3.6" /><path d="M3 20c0-3.4 2.7-5.6 6-5.6s6 2.2 6 5.6" /><path d="M18.5 8.5v5M16 11h5" /></g>,
  ban: <g><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></g>,
  launch: <g><path d="M14 4h6v6" /><path d="M20 4l-8.5 8.5" /><path d="M18 13.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h5.5" /></g>,
  mountain: <g><path d="M2.5 19.5h19" /><path d="M4 19.5l6-12 3.2 6" /><path d="M11.5 19.5l4.5-8 5 8" /><path d="M14.4 14.2l1.6-2.8 1.7 2.9" stroke="none" fill="currentColor" opacity="0.28" /></g>,
  reset: <g><path d="M4 11a8 8 0 0113.3-5.3L20 8" /><path d="M20 3.5V8h-4.5" /><path d="M20 13a8 8 0 01-13.3 5.3L4 16" /><path d="M4 20.5V16h4.5" /></g>,
  power: <g><path d="M12 3v8" /><path d="M7.5 6.3a7 7 0 109 0" /></g>,
  check: <path d="M4 12.5l5 5 11-11" />,
  bolt: <path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z" />,
  bulb: <g><path d="M9 17.5h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 00-3.5 10.9c.6.4.9 1 .9 1.6h5.2c0-.6.3-1.2.9-1.6A6 6 0 0012 3z" /></g>,
  ticket: <g><path d="M3 7.5a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 7.5V10a2 2 0 000 4v2.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5V14a2 2 0 000-4V7.5z" /><path d="M14 6.5v11" strokeDasharray="2 2.4" /></g>,
  grid: <g><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></g>,
  clipboard: <g><rect x="5" y="4.5" width="14" height="17" rx="2" /><path d="M9 4.5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 4.5V6H9V4.5z" /><path d="M8.5 11h7M8.5 15h5" /></g>,
  card: <g><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 9.5h19M6 14.5h4" /></g>,
  megaphone: <g><path d="M4 10v4a1.5 1.5 0 001.5 1.5H7l1 4.5h2.2L9 15.5l8 4.2a1 1 0 001.5-.9V5.2a1 1 0 00-1.5-.9L7 8.5H5.5A1.5 1.5 0 004 10z" /><path d="M20.5 9.5a3 3 0 010 5" /></g>,
  mail: <g><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></g>,
  chat: <path d="M4 5.5h16a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5H9l-4 3.5V16.5H4A1.5 1.5 0 012.5 15V7A1.5 1.5 0 014 5.5z" />,
  camera: <g><path d="M3 8.5A1.5 1.5 0 014.5 7H7l1.3-2h7.4L17 7h2.5A1.5 1.5 0 0121 8.5V18a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18V8.5z" /><circle cx="12" cy="12.5" r="3.3" /></g>,
  phone: <g><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></g>,
  link: <g><path d="M9.5 14.5l5-5" /><path d="M8 11l-2 2a3.2 3.2 0 004.5 4.5l2-2" /><path d="M16 13l2-2a3.2 3.2 0 00-4.5-4.5l-2 2" /></g>,
  lock: <g><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 018 0v2.5" /></g>,
  search: <g><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></g>,
  download: <g><path d="M12 3v12" /><path d="M7.5 10.5L12 15l4.5-4.5" /><path d="M4 20h16" /></g>,
  filter: <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />,
  dollar: <g><path d="M12 2.5v19" /><path d="M16.5 6.8c0-1.8-2-3.3-4.5-3.3s-4.5 1.5-4.5 3.3 2 3.3 4.5 3.3 4.5 1.5 4.5 3.3-2 3.3-4.5 3.3-4.5-1.5-4.5-3.3" /></g>,
  trend: <g><path d="M3 16.5l5.5-5.5 4 4L21 6.5" /><path d="M15.5 6.5H21v5.5" /></g>,
  clock: <g><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></g>,
  pin: <g><path d="M12 21s7-6.4 7-11a7 7 0 10-14 0c0 4.6 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></g>,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  dots: <g><circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" /></g>,
  eye: <g><path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></g>,
  refund: <g><path d="M4 11a8 8 0 0113.3-5.3L20 8" /><path d="M20 3.5V8h-4.5" /><path d="M9.5 15.5h5M12 13v5" /></g>,
  user: <g><circle cx="12" cy="8" r="4" /><path d="M4.5 20c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" /></g>,
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
