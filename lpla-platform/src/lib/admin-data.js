'use client'

function _admMulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function admSold(ev) { return Math.max(0, (ev.totalSpots || 0) - (ev.spotsLeft || 0)); }
export function admGross(ev) { return ev.isFree ? 0 : admSold(ev) * (ev.price || 0); }
export function admMoney(n) { return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
export function admMoneyK(n) {
  if (n >= 10000) return '$' + (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return admMoney(n);
}

const ADM_FIRST = ['María', 'Diego', 'Sofía', 'Carlos', 'Lucía', 'Mateo', 'Valentina', 'Santiago', 'Camila', 'Andrés', 'Gabriela', 'Javier', 'Isabela', 'Luis', 'Daniela', 'Miguel', 'Fernanda', 'Ricardo', 'Paola', 'Alejandro', 'Carolina', 'Eduardo', 'Natalia', 'Felipe', 'Adriana', 'Tomás', 'Mariana', 'Sebastián'];
const ADM_LAST = ['García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Gutiérrez', 'Castillo', 'Vargas', 'Romero', 'Mendoza', 'Aguilar'];
const ADM_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'hotmail.com'];
export const ADM_CHANNELS = ['Website widget', 'Direct link', 'Instagram', 'Box office', 'Walk-in'];

let __admOrders = null;
let __admOrdersSig = null;

export function admBuildOrders(events) {
  const sig = events.map((e) => e.id + ':' + admSold(e)).join('|');
  if (__admOrders && __admOrdersSig === sig) return __admOrders;
  const rng = _admMulberry(0x4c504c41);
  const NOW = Date.now(), DAY = 86400000;
  const orders = [];
  let oid = 1;
  events.forEach((ev) => {
    let remaining = admSold(ev);
    const tickets = ev.tickets && ev.tickets.length ? ev.tickets : [{ id: 'general', en: 'General Admission', es: 'Entrada General', price: ev.price || 0 }];
    while (remaining > 0) {
      const qty = Math.min(remaining, 1 + Math.floor(rng() * 3));
      remaining -= qty;
      const t = tickets[Math.floor(rng() * rng() * tickets.length)] || tickets[0];
      const price = t.price != null ? t.price : ev.price || 0;
      const fn = ADM_FIRST[Math.floor(rng() * ADM_FIRST.length)];
      const ln = ADM_LAST[Math.floor(rng() * ADM_LAST.length)];
      const dom = ADM_DOMAINS[Math.floor(rng() * ADM_DOMAINS.length)];
      const r = rng();
      let status = 'confirmed';
      if (r > 0.96) status = 'refunded';
      else if (r > 0.90) status = 'cancelled';
      else if (r > 0.85) status = 'pending';
      const checkedIn = ev.id === 1 && status === 'confirmed' && rng() > 0.5;
      const createdAt = NOW - Math.floor(rng() * 62) * DAY - Math.floor(rng() * DAY);
      orders.push({
        id: oid++, eventId: ev.id, event: ev,
        firstName: fn, lastName: ln, name: fn + ' ' + ln,
        initials: (fn[0] + ln[0]).toUpperCase(),
        email: (fn + '.' + ln).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') + '@' + dom,
        ticketId: t.id, ticketLabel: t.en || t.es || 'General',
        qty, amount: qty * price,
        channel: ADM_CHANNELS[Math.floor(rng() * rng() * ADM_CHANNELS.length)] || ADM_CHANNELS[0],
        status, checkedIn, createdAt,
      });
    }
  });
  orders.sort((a, b) => b.createdAt - a.createdAt);
  __admOrders = orders;
  __admOrdersSig = sig;
  return orders;
}

export function admWeekly(orders, weeks) {
  const DAY = 86400000, NOW = Date.now();
  const start = NOW - (weeks * 7 - 1) * DAY;
  const buckets = Array.from({ length: weeks }, (_, i) => ({ i, revenue: 0, tickets: 0, ts: start + i * 7 * DAY }));
  orders.forEach((o) => {
    if (o.status === 'cancelled' || o.status === 'refunded') return;
    const wk = Math.floor((o.createdAt - start) / (7 * DAY));
    if (wk >= 0 && wk < weeks) { buckets[wk].revenue += o.amount; buckets[wk].tickets += o.qty; }
  });
  return buckets;
}

export function admTimeAgo(ms) {
  const d = Date.now() - ms, h = d / 3600000;
  if (h < 1) return Math.max(1, Math.round(d / 60000)) + 'm ago';
  if (h < 24) return Math.round(h) + 'h ago';
  const days = Math.round(h / 24);
  if (days < 7) return days + 'd ago';
  return Math.round(days / 7) + 'w ago';
}

export function admDateShort(ms) {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export { _admMulberry };
