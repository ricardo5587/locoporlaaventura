// lpla-web-tokens — Web design tokens, utilities & event data
import { useState, useEffect } from 'react';

export const WEB = {
  bg:          '#FAFAF8',
  bgAlt:       '#F3EDE3',
  bgDark:      '#0B1E2B',
  card:        '#FFFFFF',
  tealDark:    '#0B1E2B',
  teal:        '#1B5E7F',
  tealLight:   '#2B7A9F',
  sky:         '#4A9EC7',
  green:       '#7EBF2E',
  greenDark:   '#5C8F22',
  greenPale:   'rgba(126,191,46,.1)',
  brown:       '#5E3B1E',
  cream:       '#E8D5B5',
  mountain:    '#4A6E1A',
  mountainDk:  '#2D4D0E',
  text:        '#0F2030',
  textMuted:   '#5A7080',
  textLight:   '#8FA0AE',
  border:      'rgba(0,0,0,0.07)',
  borderMd:    'rgba(0,0,0,0.12)',
  shadow:      '0 2px 14px rgba(0,0,0,0.07)',
  shadowMd:    '0 4px 24px rgba(0,0,0,0.10)',
  shadowLg:    '0 8px 40px rgba(0,0,0,0.14)',
  radius:      16,
  radiusSm:    10,
  radiusLg:    24,
};

// ── Responsive hook ──────────────────────────────────────────────────────────
export function useBreakpoint() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return { isMobile: w < 768, isTablet: w < 1080, w };
}

// ── Date formatter ───────────────────────────────────────────────────────────
export function fmtDate(str, lang) {
  const d = new Date(str + 'T12:00:00');
  if (lang === 'es') {
    const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  }
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
}

export const CAT_ICONS = { Escalada:'🧗', Senderismo:'🥾', Taller:'⚡', Keynote:'🎤', Social:'🎉', Expedición:'🏔️', Voluntario:'🤝', Climbing:'🧗', Hiking:'🥾', Workshop:'⚡' };

// ── 20 Events ────────────────────────────────────────────────────────────────
export const EVENTS = [
  { id:1,  titleEs:'Escalada en Roca · Smith Rock', titleEn:'Rock Climbing · Smith Rock', descEs:'Jornada de escalada en las iconic basalt columns of Smith Rock with a certified guide y equipo incluido. Todos los niveles bienvenidos.', descEn:'A full day of rock climbing on the iconic basalt columns of Smith Rock with a certified guide and equipment included. All levels welcome.', date:'2026-06-21', time:'7:00 AM', duration:'6h', location:'Smith Rock, Terrebonne OR', category:'Escalada', price:15, isFree:false, spotsLeft:8,  totalSpots:20, tickets:[{id:'general',es:'Entrada General',en:'General Admission',price:15,descEs:'Acceso completo + equipo',descEn:'Full access + equipment'},{id:'vip',es:'VIP + Fotos',en:'VIP + Photos',price:35,descEs:'Guía privado + sesión fotográfica',descEn:'Private guide + photo session'}], index:0 },
  { id:2,  titleEs:'Sunday Skills: Rappel Básico', titleEn:'Sunday Skills: Basic Rappel', descEs:'Aprende las técnicas básicas de rappel con nuestros instructores certificados. Equipo y seguro incluidos.', descEn:'Learn basic rappel techniques with our certified instructors. Equipment and insurance included.', date:'2026-06-22', time:'10:00 AM', duration:'3h', location:'LPLA HQ, Portland OR', category:'Taller', price:0, isFree:true, spotsLeft:15, totalSpots:20, tickets:[{id:'free',es:'Entrada Gratuita',en:'Free Entry',price:0,descEs:'Acceso gratuito',descEn:'Free access'}], index:2 },
  { id:3,  titleEs:'Caminata al Amanecer · Mt. Hood', titleEn:'Sunrise Hike · Mt. Hood', descEs:'Despierta con las mejores vistas del Monte Hood. Caminata guiada, salida a las 5:30 AM.', descEn:'Wake up to the best views of Mt. Hood. Guided hike, departure at 5:30 AM.', date:'2026-06-28', time:'5:30 AM', duration:'4h', location:'Mt. Hood, Oregon', category:'Senderismo', price:8, isFree:false, spotsLeft:3,  totalSpots:15, tickets:[{id:'std',es:'Estándar',en:'Standard',price:8,descEs:'Guía incluido',descEn:'Guide included'}], index:1 },
  { id:4,  titleEs:'Keynote: Liderazgo Aventurero', titleEn:'Keynote: Adventurous Leadership', descEs:'Charla inspiradora sobre cómo el deporte de aventura forma líderes en la comunidad latina.', descEn:'Inspiring talk on how adventure sports shape leaders in the Latino community.', date:'2026-06-27', time:'7:00 PM', duration:'2h', location:'Community Center, Portland OR', category:'Keynote', price:0, isFree:true, spotsLeft:50, totalSpots:100, tickets:[{id:'free',es:'Entrada Gratuita',en:'Free Entry',price:0,descEs:'Aforo limitado',descEn:'Limited capacity'}], index:3 },
  { id:5,  titleEs:'Primeros Auxilios en Montaña', titleEn:'Mountain First Aid', descEs:'Taller práctico de primeros auxilios para actividades en mountain. Certificado incluido.', descEn:'Practical first aid workshop for mountain activities. Certificate included.', date:'2026-07-05', time:'9:00 AM', duration:'5h', location:'LPLA HQ, Portland OR', category:'Taller', price:20, isFree:false, spotsLeft:12, totalSpots:16, tickets:[{id:'std',es:'Taller Completo',en:'Full Workshop',price:20,descEs:'Material + certificado',descEn:'Materials + certificate'}], index:4 },
  { id:6,  titleEs:'Escalada Indoor · Portland', titleEn:'Indoor Climbing · Portland', descEs:'Sesión de escalada en el mejor rocódromo de Portland. Material de alquiler incluido.', descEn:"Climbing session at Portland's best indoor climbing wall. Equipment rental included.", date:'2026-07-10', time:'6:00 PM', duration:'2h30', location:'Portland Rock Gym, Portland OR', category:'Escalada', price:18, isFree:false, spotsLeft:10, totalSpots:20, tickets:[{id:'std',es:'Sesión',en:'Session',price:18,descEs:'Material incluido',descEn:'Equipment included'}], index:0 },
  { id:7,  titleEs:'Expedición: Mt. St. Helens', titleEn:'Expedition: Mt. St. Helens', descEs:'Aventura de fin de semana en el volcán icónico del Noroeste del Pacífico. Alojamiento y guía incluidos.', descEn:"Weekend adventure in the iconic stratovolcano of the Pacific Northwest. Accommodation and guide included.", date:'2026-07-12', time:'6:00 AM', duration:'2 días', location:'Mt. St. Helens, Washington', category:'Expedición', price:65, isFree:false, spotsLeft:6,  totalSpots:12, tickets:[{id:'shared',es:'Habitación Compartida',en:'Shared Room',price:65,descEs:'Alojamiento compartido',descEn:'Shared accommodation'},{id:'private',es:'Habitación Individual',en:'Private Room',price:110,descEs:'Habitación privada',descEn:'Private room'}], index:1 },
  { id:8,  titleEs:'Social Night · Tertulia Aventurera', titleEn:'Social Night · Adventure Talk', descEs:'Noche de historias, risas y networking con la comunidad LPLA. Bebidas incluidas.', descEn:'Evening of stories, laughs and networking with the LPLA community. Drinks included.', date:'2026-07-11', time:'8:00 PM', duration:'3h', location:'The Refuge Bar, Portland OR', category:'Social', price:0, isFree:true, spotsLeft:30, totalSpots:50, tickets:[{id:'free',es:'Entrada Gratuita',en:'Free Entry',price:0,descEs:'Bebidas incluidas',descEn:'Drinks included'}], index:2 },
  { id:9,  titleEs:'Fotografía Outdoor · Workshop', titleEn:'Outdoor Photography Workshop', descEs:'Aprende a capturar los mejores momentos en la mountain. Trae tu cámara o smartphone.', descEn:'Learn to capture the best moments in the mountains. Bring your camera or smartphone.', date:'2026-07-19', time:'8:00 AM', duration:'6h', location:'Forest Park, Portland OR', category:'Taller', price:30, isFree:false, spotsLeft:8,  totalSpots:12, tickets:[{id:'std',es:'Workshop',en:'Workshop',price:30,descEs:'Manual impreso incluido',descEn:'Printed manual included'}], index:3 },
  { id:10, titleEs:'Caminata Familiar · Silver Falls', titleEn:'Family Hike · Silver Falls', descEs:'Una caminata fácil y divertida para toda la familia. Perfecta para niños de 5+ años.', descEn:'An easy and fun hike for the whole family. Perfect for children 5+ years old.', date:'2026-07-20', time:'9:00 AM', duration:'3h', location:'Silver Falls State Park, OR', category:'Senderismo', price:0, isFree:true, spotsLeft:25, totalSpots:40, tickets:[{id:'free',es:'Gratuita',en:'Free',price:0,descEs:'Apto para familias',descEn:'Family-friendly'}], index:4 },
  { id:11, titleEs:'Voluntarios: Limpieza de Senderos', titleEn:'Volunteers: Trail Cleanup', descEs:'Únete a nuestra brigada de voluntarios para mantener los senderos limpios y accesibles.', descEn:'Join our volunteer brigade to keep trails clean and accessible for everyone.', date:'2026-07-26', time:'8:00 AM', duration:'4h', location:'Columbia River Gorge, OR', category:'Voluntario', price:0, isFree:true, spotsLeft:20, totalSpots:30, tickets:[{id:'free',es:'Voluntario',en:'Volunteer',price:0,descEs:'Desayuno incluido',descEn:'Breakfast included'}], index:1 },
  { id:12, titleEs:'Escalada Deportiva Avanzada', titleEn:'Advanced Sport Climbing', descEs:'Perfecciona tus técnicas con instructores certificados AMGA. Nivel medio-alto requerido.', descEn:'Perfect your techniques with AMGA-certified instructors. Intermediate-advanced level required.', date:'2026-08-02', time:'7:00 AM', duration:'5h', location:'Smith Rock, Terrebonne OR', category:'Escalada', price:25, isFree:false, spotsLeft:0,  totalSpots:10, tickets:[{id:'std',es:'Estándar',en:'Standard',price:25,descEs:'Equipo incluido',descEn:'Equipment included'}], index:0 },
  { id:13, titleEs:'Keynote: Emprendimiento Aventurero', titleEn:'Keynote: Adventure Entrepreneurship', descEs:'Casos de éxito de emprendedores latinos en la industria del deporte y aventura al aire libre.', descEn:'Success stories from Latino entrepreneurs in the outdoor sports and adventure industry.', date:'2026-08-08', time:'7:00 PM', duration:'2h', location:'Revolution Hall, Portland OR', category:'Keynote', price:0, isFree:true, spotsLeft:80, totalSpots:150, tickets:[{id:'free',es:'Entrada Gratuita',en:'Free Entry',price:0,descEs:'Aforo limitado',descEn:'Limited capacity'}], index:3 },
  { id:14, titleEs:'Via Ferrata · Beacon Rock', titleEn:'Via Ferrata · Beacon Rock', descEs:'Experimenta el vértigo de la vía ferrata en Beacon Rock. Equipos de seguridad y guía incluidos.', descEn:'Experience the thrill of via ferrata at Beacon Rock. Safety equipment and guide included.', date:'2026-08-09', time:'8:00 AM', duration:'4h', location:'Beacon Rock, Columbia Gorge WA', category:'Escalada', price:35, isFree:false, spotsLeft:7,  totalSpots:12, tickets:[{id:'std',es:'Estándar',en:'Standard',price:35,descEs:'Equipo + guía',descEn:'Equipment + guide'}], index:1 },
  { id:15, titleEs:'Orientación y Mapas · Taller', titleEn:'Orientation & Maps Workshop', descEs:'Aprende a leer mapas topográficos y usar brújula. Nunca te pierdas en la mountain.', descEn:'Learn to read topographic maps and use a compass. Never get lost in the mountains.', date:'2026-08-16', time:'10:00 AM', duration:'4h', location:'LPLA HQ, Portland OR', category:'Taller', price:15, isFree:false, spotsLeft:14, totalSpots:16, tickets:[{id:'std',es:'Taller',en:'Workshop',price:15,descEs:'Kit de orientación incluido',descEn:'Orientation kit included'}], index:2 },
  { id:16, titleEs:'Caminata Nocturna · Luna Llena', titleEn:'Night Hike · Full Moon', descEs:'Una experiencia mágica: caminar bajo la luna llena por los trails of the Gorge.', descEn:'A magical experience: hiking under the full moon through the Gorge trails.', date:'2026-08-22', time:'9:00 PM', duration:'3h', location:'Columbia River Gorge, OR', category:'Senderismo', price:12, isFree:false, spotsLeft:5,  totalSpots:20, tickets:[{id:'std',es:'Estándar',en:'Standard',price:12,descEs:'Linterna incluida',descEn:'Headlamp included'}], index:4 },
  { id:17, titleEs:'Sunday Skills: Escalada Artificial', titleEn:'Sunday Skills: Aid Climbing', descEs:'Introducción a técnicas de escalada artificial. Ninguna experiencia previa requerida.', descEn:'Introduction to aid climbing techniques. No prior experience required.', date:'2026-08-23', time:'10:00 AM', duration:'3h', location:'LPLA HQ, Portland OR', category:'Taller', price:0, isFree:true, spotsLeft:12, totalSpots:16, tickets:[{id:'free',es:'Gratuita',en:'Free',price:0,descEs:'Material incluido',descEn:'Equipment included'}], index:2 },
  { id:18, titleEs:'Expedición: Olympic Peninsula', titleEn:'Expedition: Olympic Peninsula', descEs:'3 días de aventura épica. Ruta semi-técnica con alojamiento en refugio de mountain.', descEn:'3 days of epic adventure. Semi-technical route with mountain hut accommodation.', date:'2026-08-29', time:'6:00 AM', duration:'3 días', location:'Olympic Peninsula, Washington', category:'Expedición', price:95, isFree:false, spotsLeft:4,  totalSpots:8,  tickets:[{id:'std',es:'Estándar',en:'Standard',price:95,descEs:'Alojamiento + guía',descEn:'Accommodation + guide'}], index:0 },
  { id:19, titleEs:'BBQ Comunitario LPLA 🎉', titleEn:'LPLA Community BBQ 🎉', descEs:'¡El evento social del año! BBQ, música latina, premios y toda la comunidad LPLA reunida.', descEn:'The social event of the year! BBQ, Latin music, prizes and the entire LPLA community.', date:'2026-09-06', time:'12:00 PM', duration:'5h', location:'Tom McCall Waterfront Park, Portland OR', category:'Social', price:10, isFree:false, spotsLeft:40, totalSpots:100, tickets:[{id:'adult',es:'Adulto',en:'Adult',price:10,descEs:'Comida incluida',descEn:'Food included'},{id:'kid',es:'Niño (5-12)',en:'Child (5-12)',price:5,descEs:'Menú infantil',descEn:"Children's menu"},{id:'infant',es:'Bebé (0-4)',en:'Infant (0-4)',price:0,descEs:'Gratuito',descEn:'Free'}], index:3 },
  { id:20, titleEs:'Supervivencia Básica · Taller', titleEn:'Basic Survival Workshop', descEs:'Aprende habilidades esenciales de supervivencia: refugio, fuego, agua y señalización.', descEn:'Learn essential survival skills: shelter, fire, water and signaling.', date:'2026-09-13', time:'9:00 AM', duration:'6h', location:'Forest Park, Portland OR', category:'Taller', price:25, isFree:false, spotsLeft:10, totalSpots:14, tickets:[{id:'std',es:'Taller Completo',en:'Full Workshop',price:25,descEs:'Kit de supervivencia incluido',descEn:'Survival kit included'}], index:1 },
];
