/* The Big Brands — marketplace demo · core
   Public API (used by page modules in js/pages/*.js):
     TBB.page(name, { render(route) -> html, mount?(root, route), unmount?(), chrome?: true|false, title? })
     TBB.action(name, fn(el, event))           click handler for [data-action="name"]
     TBB.on(type, selector, fn(el, event))     delegated listener (change / input / submit / keydown …)
     TBB.render()                              re-render current page (keeps scroll)
     TBB.go(hash)                              navigate
     TBB.S                                     app state (persisted keys via TBB.save('key', …))
     TBB.h                                     helpers: esc, fmt, kfmt, off, icon, stars, art, product, brand, …
     TBB.ui                                    shared components: productCard, brandLogo, slot, adBadge, spLabel, rail, priceBlock
     TBB.cart / TBB.gift / TBB.ads / TBB.placeOrder / TBB.toast
*/
(() => {
'use strict';
const D = TBB.data;

/* ================= storage ================= */
const store = {
  get(k, d) { try { const v = localStorage.getItem('tbb2_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('tbb2_' + k, JSON.stringify(v)); } catch (e) {} },
};

/* ================= state ================= */
const S = TBB.S = {
  cart:      store.get('cart', []),
  wish:      store.get('wish', []),
  gifts:     store.get('gifts', []),            // selected complimentary gift ids (checkout)
  pay:       'upi',
  address:   store.get('address', { name: 'Priya Sharma', phone: '98765 43210', email: 'priya@example.com', pin: '110017', line: 'C-42, Second Floor, Malviya Nagar', city: 'New Delhi', state: 'Delhi' }),
  tiers:     store.get('tiers', [{ min: 0, count: 1 }, { min: 999, count: 2 }, { min: 1999, count: 3 }]),
  giftOn:    store.get('giftOn', Object.fromEntries(D.TBB_GIFTS.map(g => [g.id, true]))),
  giftStock: store.get('giftStock', { 'tbb-vitc': 420, 'tbb-onion': 312, 'tbb-aloe': 38, 'tbb-rice': 586, 'tbb-spf': 207, 'tbb-lip': 640 }),
  orders:    store.get('orders', [
    { id: 'TBB240871', name: 'Ananya Iyer',  city: 'Pune',     items: 3, gifts: ['tbb-vitc', 'tbb-onion'], amount: 1247, status: 'Packed',    date: '21 Nov' },
    { id: 'TBB240870', name: 'Rohit Mehra',  city: 'Gurugram', items: 1, gifts: ['tbb-rice'],              amount: 349,  status: 'Shipped',   date: '21 Nov' },
    { id: 'TBB240869', name: 'Sneha Kapoor', city: 'Mumbai',   items: 5, gifts: ['tbb-spf', 'tbb-aloe', 'tbb-lip'], amount: 2318, status: 'Delivered', date: '20 Nov' },
    { id: 'TBB240868', name: 'Arjun Nair',   city: 'Kochi',    items: 2, gifts: ['tbb-onion'],             amount: 558,  status: 'Delivered', date: '20 Nov' },
    { id: 'TBB240867', name: 'Fatima Khan',  city: 'Lucknow',  items: 2, gifts: ['tbb-vitc'],              amount: 764,  status: 'Shipped',   date: '19 Nov' },
  ]),
  lastOrder: store.get('lastOrder', null),
  // advertiser campaigns (created on #/advertise, approved in #/admin → appear in their slot)
  campaigns: store.get('campaigns', [
    { id: 'CMP-1042', brand: 'plum', advertiser: 'Plum Goodness Pvt Ltd', slot: 'H3', headline: 'Plum Green Tea — clear skin, naturally', sub: 'Flat 20% off this week', cta: 'Shop Plum', color: '#6a1b9a', start: '2026-11-24', end: '2026-11-30', budget: 14000, status: 'pending', created: '21 Nov' },
    { id: 'CMP-1039', brand: 'beardo', advertiser: 'Beardo (Marico)', slot: 'H8', headline: 'No-shave November is here', sub: 'Beard oils from ₹349', cta: 'Shop Beardo', color: '#3e2723', start: '2026-11-01', end: '2026-11-30', budget: 54000, status: 'live', created: '29 Oct' },
  ]),
  slotOn:    store.get('slotOn', {}),           // admin can pause a slot: slotOn[id] === false
  inspect:   store.get('inspect', false),       // "show ad slots" demo overlay
  clipped:   store.get('clipped', []),          // clipped coupon ids
  recent:    store.get('recent', ['vitamin c serum', 'onion hair oil']),
  scat:      'all',                              // search category dropdown
};
const save = TBB.save = (...keys) => keys.forEach(k => store.set(k, S[k]));

/* ================= helpers ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
const kfmt = n => n >= 100000 ? (n / 100000).toFixed(1).replace(/\.0$/, '') + 'L' : n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n);
const off = p => Math.round((1 - p.price / p.mrp) * 100);
const product = id => D.PRODUCTS.find(p => p.id === id);
const brand = id => D.BRANDS.find(b => b.id === id) || { id, name: id, word: id, color: '#333', font: 'inherit' };
const cat = id => D.CATS.find(c => c.id === id);
const slotDef = id => D.SLOTS.find(s => s.id === id);
const deliveryDate = (d = 2) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); };
const bought = p => { const n = Math.max(100, Math.round(p.reviews / 12 / 100) * 100); return (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K' : n) + '+ bought in past month'; };
function hexRgb(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function shade(h, a) { const f = v => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a))); return '#' + hexRgb(h).map(f).map(v => v.toString(16).padStart(2, '0')).join(''); }
function lum(h) { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
function rateText(s) {
  return { day: `${fmt(s.rate)}/day`, week: `${fmt(s.rate)}/week`, month: `${fmt(s.rate)}/month`, cpm: `${fmt(s.rate)} CPM`, cpc: `${fmt(s.rate)} CPC`, clip: `₹${s.rate}/clip`, box: `₹${s.rate}/box` }[s.model] || fmt(s.rate);
}

/* ================= icons ================= */
const IC = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.8a1.5 1.5 0 0 0 1.5-1.2L21 7H6.2"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  chevDown: '<path d="m6 9 6 6 6-6"/>',
  chevRight: '<path d="m9 18 6-6-6-6"/>',
  chevLeft: '<path d="m15 18-6-6 6-6"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  gift: '<path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  truck: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M17.9 17.9A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/>',
  play: '<path d="M6 4l14 8-14 8z"/>',
  pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
  volumeOff: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6M17 9l6 6"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  trending: '<path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  box: '<path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
  store: '<path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  ret: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  card: '<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  sparkle: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;
const starPath = 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z';
const stars = r => `<span class="stars" style="--r:${(r / 5) * 100}%" role="img" aria-label="${r} out of 5 stars">${`<svg viewBox="0 0 24 24"><path d="${starPath}"/></svg>`.repeat(5)}</span>`;

/* ================= product packshot (SVG) ================= */
function art(p) {
  if (!p) return '';
  const { c1, c2 } = p;
  const darkBody = lum(c1) < 0.55;
  const lbl = darkBody ? 'rgba(255,255,255,.93)' : c2;
  const ink = darkBody ? shade(c1, -0.25) : (lum(c2) < 0.6 ? '#ffffff' : '#222222');
  const b = brand(p.brand);
  const brandTxt = p.own ? 'TBB' : (b.word || b.name).replace(' PARIS', '').toUpperCase();
  const line = (p.line || p.name.split(' ').slice(0, 2).join(' ')).toUpperCase();
  const edge = 'stroke="rgba(0,0,0,.07)" stroke-width="1"';
  let body = '', L, shadow = 44;
  switch (p.shape) {
    case 'tube':
      body = `<rect x="58" y="20" width="84" height="14" rx="2" fill="${shade(c1, -0.14)}"/><path d="M60 32H140L126 182Q100 188 74 182Z" fill="${c1}" ${edge}/><rect x="76" y="178" width="48" height="44" rx="8" fill="${c2}"/><path d="M70 40 L80 40 L80 170 L76 170Z" fill="#fff" opacity=".22"/>`;
      L = { x: 72, y: 70, w: 56, h: 70 }; shadow = 34; break;
    case 'dropper':
      body = `<rect x="89" y="14" width="22" height="42" rx="11" fill="${shade(c2, -0.1)}"/><rect x="80" y="50" width="40" height="26" rx="5" fill="${c2}"/><rect x="62" y="74" width="76" height="148" rx="14" fill="${c1}" ${edge}/><rect x="70" y="84" width="8" height="128" rx="4" fill="#fff" opacity=".25"/>`;
      L = { x: 72, y: 118, w: 56, h: 68 }; shadow = 40; break;
    case 'jar':
      body = `<rect x="44" y="104" width="112" height="34" rx="8" fill="${c2}"/><rect x="44" y="104" width="112" height="8" rx="4" fill="#fff" opacity=".18"/><rect x="50" y="134" width="100" height="88" rx="16" fill="${c1}" ${edge}/><rect x="58" y="142" width="8" height="70" rx="4" fill="#fff" opacity=".22"/>`;
      L = { x: 68, y: 150, w: 72, h: 54 }; shadow = 56; break;
    case 'pump':
      body = `<rect x="64" y="16" width="44" height="10" rx="5" fill="${c2}"/><rect x="94" y="16" width="12" height="26" rx="3" fill="${c2}"/><rect x="82" y="38" width="36" height="22" rx="5" fill="${shade(c2, -0.12)}"/><rect x="58" y="58" width="84" height="164" rx="22" fill="${c1}" ${edge}/><rect x="67" y="70" width="9" height="140" rx="4.5" fill="#fff" opacity=".24"/>`;
      L = { x: 72, y: 110, w: 62, h: 76 }; break;
    case 'stick':
      body = `<path d="M86 46Q86 30 114 22V98H86Z" fill="${c1}"/><rect x="82" y="94" width="36" height="30" rx="3" fill="#d4af37"/><rect x="82" y="94" width="36" height="6" fill="#fff" opacity=".3"/><rect x="74" y="120" width="52" height="102" rx="8" fill="${c2}"/><rect x="80" y="128" width="6" height="86" rx="3" fill="#fff" opacity=".18"/>`;
      L = { x: 84, y: 150, w: 36, h: 46 }; shadow = 32; break;
    default:
      body = `<rect x="80" y="26" width="40" height="28" rx="6" fill="${c2}"/><rect x="76" y="48" width="48" height="10" rx="3" fill="${shade(c2, -0.15)}"/><rect x="56" y="56" width="88" height="166" rx="26" fill="${c1}" ${edge}/><rect x="66" y="68" width="9" height="146" rx="4.5" fill="#fff" opacity=".22"/>`;
      L = { x: 74, y: 112, w: 62, h: 74 };
  }
  const fs1 = Math.max(5.5, Math.min(14, L.w / (brandTxt.length * 0.66)));
  const fs2 = Math.max(4.6, Math.min(8.5, L.w / (line.length * 0.66)));
  const cx = L.x + L.w / 2;
  return `<svg class="art" viewBox="0 0 200 240" role="img" aria-label="${esc(b.name + ' ' + p.name)}"><ellipse cx="100" cy="226" rx="${shadow}" ry="5" fill="rgba(0,0,0,.14)"/>${body}<rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="5" fill="${lbl}"/><text x="${cx}" y="${L.y + L.h * 0.44}" text-anchor="middle" fill="${ink}" style="font:700 ${fs1.toFixed(1)}px Geist, sans-serif;letter-spacing:.04em">${esc(brandTxt)}</text><rect x="${cx - 8}" y="${L.y + L.h * 0.54}" width="16" height="1.2" fill="${ink}" opacity=".5"/><text x="${cx}" y="${L.y + L.h * 0.75}" text-anchor="middle" fill="${ink}" opacity=".85" style="font:600 ${fs2.toFixed(1)}px Geist, sans-serif;letter-spacing:.06em">${esc(line)}</text></svg>`;
}

TBB.h = { $, $$, esc, fmt, kfmt, off, product, brand, cat, slotDef, deliveryDate, bought, shade, lum, rateText, icon, stars, art, save };

/* ================= cart & gifts ================= */
const cart = TBB.cart = {
  lines: () => S.cart.map(l => ({ ...l, p: product(l.id) })).filter(l => l.p),
  count: () => S.cart.reduce((a, l) => a + l.qty, 0),
  subtotal: () => cart.lines().reduce((a, l) => a + l.p.price * l.qty, 0),
  mrp: () => cart.lines().reduce((a, l) => a + l.p.mrp * l.qty, 0),
  shipping: sub => (sub === 0 || sub >= 499) ? 0 : 49,
  add(id, qty = 1, { silent = false } = {}) {
    const l = S.cart.find(x => x.id === id);
    if (l) l.qty = Math.min(10, l.qty + qty); else S.cart.push({ id, qty });
    save('cart'); updateCounts();
    if (!silent) showAdded(id);
  },
  set(id, qty) {
    const l = S.cart.find(x => x.id === id); if (!l) return;
    l.qty = Math.max(0, Math.min(10, qty));
    if (!l.qty) S.cart = S.cart.filter(x => x.id !== id);
    save('cart'); updateCounts();
  },
  remove(id) { S.cart = S.cart.filter(x => x.id !== id); save('cart'); updateCounts(); },
  clear() { S.cart = []; save('cart'); updateCounts(); },
};
const gift = TBB.gift = {
  tiers: () => [...S.tiers].sort((a, b) => a.min - b.min),
  allowance(sub = cart.subtotal()) { if (sub <= 0) return 0; let c = 0; gift.tiers().forEach(t => { if (sub >= t.min) c = Math.max(c, t.count); }); return c; },
  next(sub = cart.subtotal()) { return gift.tiers().find(t => t.min > sub && t.count > gift.allowance(sub)); },
  active: () => D.TBB_GIFTS.filter(g => S.giftOn[g.id] !== false),
};
TBB.placeOrder = ({ pay = S.pay } = {}) => {
  const sub = cart.subtotal(), total = sub + cart.shipping(sub);
  const o = {
    id: 'TBB' + (240872 + Math.floor(Math.random() * 900)), name: S.address.name, city: S.address.city,
    items: S.cart.map(l => ({ ...l })), gifts: [...S.gifts], subtotal: sub, total, pay, eta: deliveryDate(3),
  };
  S.lastOrder = o;
  S.orders.unshift({ id: o.id, name: o.name, city: o.city, items: cart.count(), gifts: o.gifts, amount: total, status: 'New', fresh: true, date: 'Today' });
  o.gifts.forEach(g => { S.giftStock[g] = Math.max(0, (S.giftStock[g] || 0) - 1); });
  S.cart = []; S.gifts = [];
  save('lastOrder', 'orders', 'giftStock', 'cart', 'gifts');
  updateCounts();
  return o;
};

/* ================= ads ================= */
const ads = TBB.ads = {
  /* creatives for a slot: approved (live) advertiser campaigns first, then sample creatives */
  list(slot) {
    if (S.slotOn[slot] === false) return [];
    const live = S.campaigns.filter(c => c.slot === slot && c.status === 'live').map(ads.fromCampaign);
    return [...live, ...(D.ADS[slot] || [])];
  },
  fromCampaign(c) {
    const p = D.PRODUCTS.find(x => x.brand === c.brand);
    const col = c.color || brand(c.brand).color || '#333';
    return {
      id: c.id, slot: c.slot, brand: c.brand, kicker: 'Sponsored', headline: c.headline, sub: c.sub, cta: c.cta || 'Shop now',
      href: '#/brand/' + c.brand, product: p && p.id, products: D.PRODUCTS.filter(x => x.brand === c.brand).slice(0, 4).map(x => x.id),
      theme: { bg: `linear-gradient(120deg, ${shade(col, -0.35)}, ${col} 60%, ${shade(col, 0.25)})`, fg: lum(col) > 0.6 ? '#151515' : '#ffffff', accent: '#ffd36b' },
      layout: 'split', custom: true, campaign: c.id,
    };
  },
  book(c) {
    const id = 'CMP-' + (1043 + S.campaigns.length);
    const rec = { id, status: 'pending', created: 'Today', ...c };
    S.campaigns.unshift(rec); save('campaigns');
    return rec;
  },
  setStatus(id, status) { const c = S.campaigns.find(x => x.id === id); if (c) { c.status = status; save('campaigns'); } return c; },
  slots: page => D.SLOTS.filter(s => !page || s.page === page),
};

/* ================= shared UI components ================= */
const ui = TBB.ui = {
  /* brand wordmark logo */
  brandLogo(id, { size = 18, color, cls = '' } = {}) {
    const b = brand(id);
    const style = `font-family:${b.font};font-weight:${b.weight || 700};text-transform:${b.tt || 'none'};letter-spacing:${b.ls || 0};font-size:${size}px;color:${color || b.color};${b.italic ? 'font-style:italic;' : ''}`;
    return `<span class="blogo ${cls}" style="${style}">${esc(b.word || b.name)}${b.sub ? `<small style="font-size:.42em;letter-spacing:.3em;display:block;line-height:1;margin-top:2px">${esc(b.sub)}</small>` : ''}</span>`;
  },
  adBadge: (t = 'Ad') => `<span class="pz-badge">${t}</span>`,
  spLabel: (t = 'Sponsored') => `<span class="sp-label">${t}${icon('info')}</span>`,
  /* wraps an ad placement; shows slot info when the "Show ad slots" inspector is on.
     Returns '' when the admin has paused the slot. */
  slot(id, inner, { cls = '', tag = 'div', attrs = '' } = {}) {
    const s = slotDef(id);
    if (!s) return inner;
    if (S.slotOn[id] === false) return '';
    return `<${tag} class="pz-slot ${cls}" data-slot="${id}" ${attrs}>${inner}<span class="slot-tag" aria-hidden="true"><b>${id}</b>${esc(s.name)}<i>${esc(s.size)} · ${rateText(s)}</i></span></${tag}>`;
  },
  priceBlock(p, { big = false } = {}) {
    return `<div class="price${big ? ' price-big' : ''}"><span class="pr"><sup>₹</sup>${Math.round(p.price).toLocaleString('en-IN')}</span>${p.mrp > p.price ? `<span class="mrp">M.R.P: <s>${fmt(p.mrp)}</s></span><span class="off">(${off(p)}% off)</span>` : ''}</div>`;
  },
  /* product card — opts: { sponsored, compact, slot } */
  productCard(p, { sponsored = false, compact = false, slot = null } = {}) {
    if (!p) return '';
    const b = brand(p.brand);
    const wished = S.wish.includes(p.id);
    const html = `<article class="pc${sponsored ? ' is-sp' : ''}${compact ? ' pc-compact' : ''}">
      <a class="pc-img" href="#/p/${p.id}" style="--tint:${p.c1}">${art(p)}${p.tag ? `<span class="pc-badge">${esc(p.tag)}</span>` : ''}</a>
      <button class="pc-wish${wished ? ' on' : ''}" data-action="wish" data-id="${p.id}" aria-label="Save to wishlist">${icon('heart')}</button>
      <div class="pc-body">
        ${sponsored ? ui.spLabel() : ''}
        <a class="pc-brand" href="#/brand/${b.id}">${esc(b.name)}</a>
        <a class="pc-name" href="#/p/${p.id}">${esc(p.name)}, ${esc(p.size)}</a>
        <div class="pc-rate">${stars(p.rating)}<span>${p.rating}</span><span class="cnt">(${p.reviews.toLocaleString('en-IN')})</span></div>
        ${compact ? '' : `<div class="pc-bought">${bought(p)}</div>`}
        ${ui.priceBlock(p)}
        ${compact ? '' : `<div class="pc-del">FREE delivery <b>${deliveryDate(2)}</b></div><div class="pc-gift">${icon('gift')} + free TBB gift with order</div>`}
        <button class="btn btn-cart" data-action="add" data-id="${p.id}">Add to cart</button>
      </div>
    </article>`;
    return slot ? ui.slot(slot, html, { cls: 'slot-card' }) : html;
  },
  /* horizontal scroller with arrow buttons */
  rail(items, { cls = '' } = {}) {
    return `<div class="rail ${cls}"><button class="rail-btn prev" data-action="rail" data-dir="-1" aria-label="Scroll left">${icon('chevLeft')}</button><div class="rail-track">${items}</div><button class="rail-btn next" data-action="rail" data-dir="1" aria-label="Scroll right">${icon('chevRight')}</button></div>`;
  },
};

/* ================= toast & added-to-cart flyout ================= */
function toast(msg, { icon: ic = 'check' } = {}) {
  const t = $('#toast'); if (!t) return;
  t.innerHTML = `${icon(ic)}<span>${msg}</span>`;
  t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2800);
}
TBB.toast = toast;

function showAdded(id) {
  const p = product(id), el = $('#added'); if (!p || !el) return;
  const sub = cart.subtotal(), allow = gift.allowance(sub), nt = gift.next(sub);
  el.innerHTML = `<div class="af-in">
    <div class="af-top"><span class="ok">${icon('check')}</span><b>Added to cart</b><button class="ib-sm" data-action="added-close" aria-label="Close">${icon('close')}</button></div>
    <div class="af-item"><span class="af-art" style="--tint:${p.c1}">${art(p)}</span><div><b>${esc(p.name)}</b><small>${fmt(p.price)} · ${esc(p.size)}</small></div></div>
    <div class="af-gift">${icon('gift')}<span>You’ve unlocked <b>${allow} free gift${allow > 1 ? 's' : ''}</b>${nt ? ` · add ${fmt(nt.min - sub)} more for ${nt.count}` : ''}</span></div>
    <div class="af-sub"><span>Cart subtotal (${cart.count()} item${cart.count() > 1 ? 's' : ''})</span><b>${fmt(sub)}</b></div>
    <div class="af-btns"><a href="#/cart" class="btn btn-ghost" data-action="added-close">Go to cart</a><a href="#/checkout" class="btn btn-cart" data-action="added-close">Checkout</a></div>
  </div>`;
  el.classList.add('show');
  clearTimeout(showAdded._t); showAdded._t = setTimeout(() => el.classList.remove('show'), 4500);
}

function updateCounts() {
  const c = cart.count();
  $$('[data-count="cart"]').forEach(e => { e.textContent = c; e.classList.toggle('zero', !c); });
}

/* ================= chrome: header / subnav / footer / tabbar / menu ================= */
function logoMark() {
  return `<span class="logo-mark"><i>tbb</i><span class="logo-stack"><span class="logo-txt">thebigbrands<em>.co.in</em></span><small class="logo-sub">A Shriram Ventures Initiative</small></span></span>`;
}

function header() {
  const a = S.address;
  return `<div class="hdr-main"><div class="wrap hdr-row">
      <button class="hdr-burger" data-action="menu-open" aria-label="Open menu">${icon('menu')}</button>
      <a class="logo" href="#/" aria-label="The Big Brands home">${logoMark()}</a>
      <button class="hdr-loc" data-action="loc">${icon('pin')}<span><small>Deliver to ${esc(a.name.split(' ')[0])}</small><b>${esc(a.city)} ${esc(a.pin)}</b></span></button>
      <form class="search" id="searchForm" role="search" autocomplete="off">
        <label class="s-cat"><span class="s-cat-l">${S.scat === 'all' ? 'All' : esc(cat(S.scat).short)}</span>${icon('chevDown')}
          <select id="scat" aria-label="Search category"><option value="all">All categories</option>${D.CATS.map(c => `<option value="${c.id}"${S.scat === c.id ? ' selected' : ''}>${c.name}</option>`).join('')}</select></label>
        <input id="q" name="q" type="search" placeholder="Search 50+ brands, products & concerns — try “hair fall”" aria-label="Search The Big Brands" aria-autocomplete="list" aria-controls="sdrop">
        <button type="button" class="s-ico" data-action="visual-search" title="Search with a photo" aria-label="Search with a photo">${icon('camera')}</button>
        <button type="button" class="s-ico" data-action="voice-search" title="Search by voice" aria-label="Search by voice">${icon('mic')}</button>
        <button class="s-go" type="submit" aria-label="Search">${icon('search')}</button>
        <div class="s-drop" id="sdrop" role="listbox"></div>
      </form>
      <button class="hdr-lang" data-action="lang">${icon('globe')}<b>EN</b>${icon('chevDown')}</button>
      <a class="hdr-acc" href="#/admin"><small>Hello, ${esc(a.name.split(' ')[0])}</small><b>Account &amp; Admin ${icon('chevDown')}</b></a>
      <a class="hdr-cart" href="#/cart" aria-label="Cart">${icon('cart')}<span class="cart-n" data-count="cart">${cart.count()}</span><b>Cart</b></a>
    </div></div>
    <nav class="subnav" aria-label="Shop navigation"><div class="wrap subnav-row">
      <button class="sn-all" data-action="menu-open">${icon('menu')}<span>All</span></button>
      <a href="#/deals" class="sn-deal">${icon('zap')}Today’s Deals</a>
      <a href="#/gifts" class="sn-gift">${icon('gift')}Free Gift Store</a>
      <a href="#/brands">Brand Stores</a>
      <a href="#/c/skin">Skincare</a>
      <a href="#/c/hair">Haircare</a>
      <a href="#/c/oil">Hair Oils</a>
      <a href="#/c/makeup">Makeup</a>
      <a href="#/c/men">Men</a>
      <a href="#/c/fragrance">Fragrance</a>
      <a href="#/s?sort=best">Bestsellers</a>
      <a href="#/advertise" class="sn-grow">${icon('megaphone')}Advertise with us</a>
    </div></nav>
    <div class="hdr-locbar"><div class="wrap">${icon('pin')} Delivering to ${esc(a.name.split(' ')[0])} — ${esc(a.city)} ${esc(a.pin)} · <b>FREE delivery over ₹499</b></div></div>`;
}

function footer() {
  return `<button class="ft-top" data-action="to-top">Back to top</button>
    <div class="ft-grow"><div class="wrap ft-grow-in">
      <div class="ft-grow-ic">${icon('megaphone')}</div>
      <div><b>Grow your brand on The Big Brands</b><span>Billboards, sponsored products, reels & in-box sampling — reach India’s beauty shoppers.</span></div>
      <a href="#/advertise" class="btn btn-light">Start advertising ${icon('arrow')}</a>
    </div></div>
    <div class="ft-main"><div class="wrap ft-grid">
      <div><h4>Get to know us</h4><a href="#/">About The Big Brands</a><a href="#/">Authenticity promise</a><a href="#/">Careers</a><a href="#/">Press</a></div>
      <div><h4>Make money with us</h4><a href="#/advertise">Advertise your brand</a><a href="#/advertise">Sell on The Big Brands</a><a href="#/advertise">Brand store subscription</a><a href="#/advertise">In-box sampling</a></div>
      <div><h4>Let us help you</h4><a href="#/cart">Your cart</a><a href="#/">Track your order</a><a href="#/">Returns & refunds</a><a href="#/">Help centre</a></div>
      <div class="ft-app"><h4>Shop on the app</h4><p>Exclusive app-only deals & faster checkout.</p><div class="app-btns"><span class="app-btn">${icon('phone')}<span><small>Get it on</small>Android</span></span><span class="app-btn">${icon('phone')}<span><small>Download for</small>iPhone</span></span></div></div>
    </div></div>
    <div class="ft-bottom"><div class="wrap ft-bottom-in">
      <a href="#/" class="logo">${logoMark()}</a>
      <span class="ft-chips"><button class="chip-d" data-action="lang">${icon('globe')} English</button><span class="chip-d">₹ INR</span><span class="chip-d">🇮🇳 India</span></span>
      <span class="ft-copy">© 2026 The Big Brands. 100% authentic products, sourced from brands & authorised distributors.</span>
    </div></div>`;
}

function tabbar() {
  return `<a href="#/" data-tab="home">${icon('home')}<span>Home</span></a>
    <button data-action="menu-open">${icon('grid')}<span>Categories</span></button>
    <a href="#/deals" data-tab="deals">${icon('zap')}<span>Deals</span></a>
    <a href="#/gifts" data-tab="gifts">${icon('gift')}<span>Free gifts</span></a>
    <a href="#/cart" data-tab="cart" class="tb-cart">${icon('cart')}<span class="cart-n" data-count="cart">${cart.count()}</span><span>Cart</span></a>`;
}

function menu() {
  const a = S.address;
  return `<div class="mn-head"><span class="mn-av">${icon('user')}</span><b>Hello, ${esc(a.name.split(' ')[0])}</b><button class="ib-sm" data-action="menu-close" aria-label="Close menu">${icon('close')}</button></div>
    <div class="mn-body">
      <h5>Trending</h5><a href="#/s?sort=best">Bestsellers</a><a href="#/deals">Today’s Deals</a><a href="#/s?sort=new">New launches</a><a href="#/gifts">${icon('gift')} Free Gift Store</a>
      <h5>Shop by category</h5>${D.CATS.map(c => `<a href="#/c/${c.id}">${c.name}${icon('chevRight')}</a>`).join('')}
      <h5>Shop by concern</h5>${D.CONCERNS.map(c => `<a href="#/s?concern=${c.id}">${c.emoji} ${c.name}</a>`).join('')}
      <h5>Top brands</h5>${D.BRANDS.filter(b => !b.own).slice(0, 8).map(b => `<a href="#/brand/${b.id}">${esc(b.name)}</a>`).join('')}<a href="#/brands">See all brand stores</a>
      <h5>For brands</h5><a href="#/advertise">${icon('megaphone')} Advertise with us</a><a href="#/advertise">Sell on The Big Brands</a>
      <h5>Demo</h5><a href="#/admin">${icon('sliders')} Admin panel</a><button data-action="inspect">${icon('eye')} ${S.inspect ? 'Hide' : 'Show'} ad slots</button>
    </div>`;
}

/* ---------- search suggestions (with sponsored suggestion, slot S1) ---------- */
function renderDrop(q) {
  const box = $('#sdrop'); if (!box) return;
  const ql = q.trim().toLowerCase();
  const sp = D.SEARCH_ADS.find(a => a.keywords.some(k => ql && (ql.includes(k) || k.includes(ql)))) || D.SEARCH_ADS[D.SEARCH_ADS.length - 1];
  const spHtml = S.slotOn.S1 === false ? '' : `<a class="sd-sp pz-slot" data-slot="S1" href="${sp.href}">${ui.adBadge()}<span class="sd-sp-logo">${ui.brandLogo(sp.brand, { size: 13 })}</span><span class="sd-sp-t">${esc(sp.text)}</span>${icon('arrow')}<span class="slot-tag" aria-hidden="true"><b>S1</b>Sponsored Search Suggestion<i>Text · ${rateText(slotDef('S1'))}</i></span></a>`;
  let html = spHtml;
  if (ql) {
    const hits = D.PRODUCTS.filter(p => (p.name + ' ' + brand(p.brand).name + ' ' + (cat(p.cat) || {}).name).toLowerCase().includes(ql)).slice(0, 5);
    const bHits = D.BRANDS.filter(b => b.name.toLowerCase().includes(ql)).slice(0, 2);
    const cHits = D.CONCERNS.filter(c => c.name.toLowerCase().includes(ql)).slice(0, 2);
    const hl = s => esc(s).replace(new RegExp('(' + ql.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
    html += `<a class="sd-row sd-q" href="#/s?q=${encodeURIComponent(q.trim())}">${icon('search')}<span>Search for “<b>${esc(q.trim())}</b>”</span></a>`;
    html += cHits.map(c => `<a class="sd-row" href="#/s?concern=${c.id}">${icon('target')}<span>${hl(c.name)} <small>Shop by concern</small></span></a>`).join('');
    html += bHits.map(b => `<a class="sd-row" href="#/brand/${b.id}">${icon('store')}<span>${hl(b.name)} <small>Brand store</small></span></a>`).join('');
    html += hits.map(p => `<a class="sd-row sd-prod" href="#/p/${p.id}"><span class="sd-art" style="--tint:${p.c1}">${art(p)}</span><span>${hl(brand(p.brand).name + ' ' + p.name)}</span><b>${fmt(p.price)}</b></a>`).join('');
    if (!hits.length && !bHits.length && !cHits.length) html += `<p class="sd-empty">No exact matches — press Enter to search everything.</p>`;
  } else {
    html += `<div class="sd-h">Recent searches</div>${S.recent.slice(0, 4).map(r => `<a class="sd-row" href="#/s?q=${encodeURIComponent(r)}">${icon('clock')}<span>${esc(r)}</span></a>`).join('')}
      <div class="sd-h">Trending now</div><div class="sd-chips">${D.TRENDING.map(t => `<a class="sd-chip" href="#/s?q=${encodeURIComponent(t)}">${icon('trending')}${esc(t)}</a>`).join('')}</div>`;
  }
  box.innerHTML = html;
  box.classList.add('open');
}
function closeDrop() { const b = $('#sdrop'); if (b) b.classList.remove('open'); }
function doSearch(q) {
  q = (q || '').trim();
  if (q) { S.recent = [q, ...S.recent.filter(r => r !== q)].slice(0, 6); save('recent'); }
  closeDrop();
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (S.scat !== 'all') params.set('cat', S.scat);
  go('#/s?' + params.toString());
}

/* ================= pz-slot inspector (demo overlay) ================= */
function renderInspector() {
  const el = $('#inspector'); if (!el) return;
  const ids = [...new Set($$('#main [data-slot], #hdr [data-slot]').map(e => e.dataset.slot))];
  const slots = ids.map(slotDef).filter(Boolean);
  const pageEst = slots.reduce((a, s) => a + s.est, 0);
  const siteEst = D.SLOTS.reduce((a, s) => a + s.est, 0);
  el.innerHTML = `<div class="ins-panel">
      <div class="ins-h"><b>${icon('megaphone')} Ad inventory on this page</b><button class="ib-sm" data-action="inspect" aria-label="Hide ad slots">${icon('close')}</button></div>
      ${slots.length ? `<ul>${slots.map(s => `<li data-action="ins-jump" data-id="${s.id}"><b>${s.id}</b><span>${esc(s.name)}<small>${esc(s.format)}</small></span><em>${rateText(s)}</em></li>`).join('')}</ul>` : '<p class="ins-empty">No ad slots on this page.</p>'}
      <div class="ins-sum"><div><small>This page · potential / month</small><b>${fmt(pageEst)}</b></div><div><small>All ${D.SLOTS.length} slots · site-wide</small><b>${fmt(siteEst)}</b></div></div>
      <a href="#/advertise" class="ins-link">See full rate card ${icon('arrow')}</a>
    </div>
    <button class="ins-btn${S.inspect ? ' on' : ''}" data-action="inspect">${icon(S.inspect ? 'eyeOff' : 'eye')}<span>${S.inspect ? 'Hide' : 'Show'} ad slots</span>${ids.length ? `<i>${ids.length}</i>` : ''}</button>`;
  document.body.classList.toggle('inspect', !!S.inspect);
}

/* ================= router ================= */
const pages = {};
TBB.page = (name, def) => { pages[name] = def; };
const ROUTES = { '': 'home', s: 'search', c: 'search', deals: 'search', gifts: 'search', brands: 'brands', brand: 'brand', p: 'product', cart: 'cart', checkout: 'checkout', success: 'success', advertise: 'advertise', admin: 'admin' };
function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const seg = path.split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch (e) { return s; } });
  const key = seg[0] || '';
  return { key, name: ROUTES[key] || 'notfound', seg, q: new URLSearchParams(qs), raw };
}
let route = parseRoute();
let current = null;
TBB.route = () => route;

function renderChrome() {
  $('#hdr').innerHTML = header();
  $('#ftr').innerHTML = footer();
  $('#tabbar').innerHTML = tabbar();
  $('#menu').innerHTML = menu();
  $$('#tabbar [data-tab]').forEach(a => a.classList.toggle('on', a.dataset.tab === (route.key || 'home')));
  $$('#hdr .subnav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + route.raw));
}

function render() {
  const def = pages[route.name];
  if (current && current.unmount) { try { current.unmount(); } catch (e) { console.error(e); } }
  current = def || null;
  const chromeOn = !def || def.chrome !== false;
  document.body.classList.toggle('chrome-off', !chromeOn);
  document.body.dataset.page = route.name;
  let html;
  try {
    html = def ? def.render(route) : `<section class="wrap pg-missing"><div class="blk center"><h1>Page coming soon</h1><p class="muted">This section is part of the full build.</p><a class="btn btn-cart" href="#/">Back to home</a></div></section>`;
  } catch (e) {
    console.error(e);
    html = `<section class="wrap pg-missing"><div class="blk center"><h1>Something went wrong</h1><p class="muted">${esc(e.message)}</p><a class="btn btn-cart" href="#/">Back to home</a></div></section>`;
  }
  const main = $('#main');
  main.innerHTML = html;
  if (def && def.mount) { try { def.mount(main, route); } catch (e) { console.error(e); } }
  document.title = (def && def.title ? (typeof def.title === 'function' ? def.title(route) : def.title) + ' · ' : '') + 'The Big Brands — Beauty marketplace';
  updateCounts();
  renderInspector();
}
TBB.render = render;
const go = TBB.go = hash => { if (location.hash === hash) render(); else location.hash = hash; };

window.addEventListener('hashchange', () => {
  route = parseRoute();
  document.body.classList.remove('menu-open');
  closeDrop();
  renderChrome();
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
});

/* ================= events ================= */
const actions = {};
TBB.action = (name, fn) => { actions[name] = fn; };
TBB.on = (type, selector, fn) => document.addEventListener(type, e => { const el = e.target.closest && e.target.closest(selector); if (el) fn(el, e); });

document.addEventListener('click', e => {
  if (!e.target.closest('#searchForm')) closeDrop();
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const fn = actions[el.dataset.action];
  if (fn) fn(el, e);
});

/* core actions */
TBB.action('add', (el, e) => { e.preventDefault(); cart.add(el.dataset.id, Number(el.dataset.qty) || 1); });
TBB.action('wish', (el, e) => {
  e.preventDefault();
  const id = el.dataset.id, on = S.wish.includes(id);
  S.wish = on ? S.wish.filter(x => x !== id) : [...S.wish, id]; save('wish');
  el.classList.toggle('on', !on);
  toast(on ? 'Removed from your wishlist' : 'Saved to your wishlist', { icon: 'heart' });
});
TBB.action('menu-open', () => { $('#menu').innerHTML = menu(); document.body.classList.add('menu-open'); });
TBB.action('menu-close', () => document.body.classList.remove('menu-open'));
TBB.action('added-close', () => $('#added').classList.remove('show'));
TBB.action('to-top', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
TBB.action('toast', el => toast(el.dataset.msg || 'Included in the full build', { icon: el.dataset.icon || 'info' }));
TBB.action('loc', () => toast('Pincode-based delivery & COD check — included in the full build', { icon: 'pin' }));
TBB.action('lang', () => toast('Hindi & regional languages — included in the full build', { icon: 'globe' }));
TBB.action('visual-search', () => toast('Search by photo — snap a product to find it (app feature)', { icon: 'camera' }));
TBB.action('voice-search', () => {
  const q = $('#q'); if (!q) return;
  q.value = ''; q.placeholder = '🎙️ Listening…'; q.classList.add('listening');
  setTimeout(() => { q.classList.remove('listening'); q.value = 'onion hair oil'; renderDrop(q.value); q.focus(); }, 1400);
});
TBB.action('inspect', () => {
  S.inspect = !S.inspect; save('inspect'); renderInspector();
  document.body.classList.remove('menu-open');
  toast(S.inspect ? 'Showing every ad slot with its rate — this is how the client earns' : 'Ad slot overlay hidden', { icon: 'megaphone' });
});
TBB.action('ins-jump', el => { const t = $(`#main [data-slot="${el.dataset.id}"], #hdr [data-slot="${el.dataset.id}"]`); if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('slot-flash'); setTimeout(() => t.classList.remove('slot-flash'), 1600); } });
TBB.action('rail', el => { const track = el.parentElement.querySelector('.rail-track'); if (track) track.scrollBy({ left: Number(el.dataset.dir) * track.clientWidth * 0.85, behavior: 'smooth' }); });

/* search box */
TBB.on('focusin', '#q', el => renderDrop(el.value));
TBB.on('input', '#q', el => renderDrop(el.value));
TBB.on('submit', '#searchForm', (el, e) => { e.preventDefault(); doSearch($('#q').value); });
TBB.on('change', '#scat', el => { S.scat = el.value; const l = $('.s-cat-l'); if (l) l.textContent = el.value === 'all' ? 'All' : cat(el.value).short; });
TBB.on('keydown', '#q', (el, e) => {
  const rows = $$('#sdrop a'); if (!rows.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); rows[0].focus(); }
  if (e.key === 'Escape') closeDrop();
});
TBB.on('keydown', '#sdrop a', (el, e) => {
  const rows = $$('#sdrop a'); const i = rows.indexOf(el);
  if (e.key === 'ArrowDown') { e.preventDefault(); (rows[i + 1] || rows[0]).focus(); }
  if (e.key === 'ArrowUp') { e.preventDefault(); i <= 0 ? $('#q').focus() : rows[i - 1].focus(); }
  if (e.key === 'Escape') { closeDrop(); $('#q').focus(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { document.body.classList.remove('menu-open'); $('#added') && $('#added').classList.remove('show'); } });

/* ================= boot ================= */
TBB.start = () => {
  renderChrome();
  render();
};
})();
