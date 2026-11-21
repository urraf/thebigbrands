/* The Big Brands — "Advertise with us" (#/advertise)
   B2B landing page + self-serve campaign booking for brands.
   Every audience / reach / ROAS number on this page is a SAMPLE figure for the demo. */
(() => {
'use strict';
const D = TBB.data;
const H = TBB.h, UI = TBB.ui, S = TBB.S;
const { esc, fmt, kfmt, icon, art, brand, slotDef, rateText, shade, lum } = H;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ================= sample audience & reach model ================= */
const AOV = 742, GST = 0.18;
const AUDIENCE = [
  { to: 8.4, dec: 1, suf: 'L', label: 'Monthly shoppers', ic: 'users' },
  { to: 42000, suf: '+', label: 'Orders every month', ic: 'box' },
  { to: 742, pre: '₹', label: 'Average order value', ic: 'bag' },
  { to: 64, suf: '%', label: 'Women aged 18–34', ic: 'heart' },
  { to: 1200, suf: '+', label: 'Cities & towns served', ic: 'pin' },
];
/* per slot, for ONE advertiser position: daily impressions, click-through, click→order conversion */
const M = {
  H1: { imp: 14000, ctr: .018, cvr: .04 },
  H2: { imp: 24000, ctr: .009, cvr: .035 },
  H3: { imp: 17000, ctr: .011, cvr: .035 },
  H4: { imp: 2500, ctr: .02, cvr: .035 },
  H5: { imp: 15000, ctr: .012, cvr: .03, impL: 'Video views' },
  H6: { imp: 2000, ctr: .03, cvr: .035, impL: 'Reel views' },
  H7: { imp: 3000, ctr: .015, cvr: .03 },
  H8: { imp: 16000, ctr: .013, cvr: .035 },
  H9: { imp: 9000, ctr: .03, cvr: .02, clkL: 'Coupon clips', ctrL: 'Clip rate' },
  H10: { imp: 26000, ctr: .045, cvr: .035 },
  H11: { imp: 18000, ctr: .022, cvr: .035 },
  S1: { imp: 1500, ctr: .05, cvr: .04, impL: 'Keyword searches' },
  S2: { imp: 9000, ctr: .032, cvr: .05 },
  S3: { imp: 20000, ctr: .026, cvr: .035 },
  S4: { imp: 12000, ctr: .014, cvr: .04 },
  P1: { imp: 15000, ctr: .02, cvr: .03 },
  P2: { imp: 10000, ctr: .009, cvr: .04 },
  C1: { imp: 3500, ctr: .055, cvr: .045 },
  C2: { imp: 1400, ctr: .03, cvr: .05, impL: 'Order confirmations' },
  B1: { imp: 600, ctr: .25, cvr: .012, impL: 'Store visits', clkL: 'Product clicks', ctrL: 'Click rate' },
  X1: { imp: 1400, ctr: .06, cvr: .2, impL: 'Boxes delivered', clkL: 'QR scans', ctrL: 'Scan rate' },
};
const MODEL_S = { day: 'Per day', week: 'Per week', month: 'Per month', cpm: 'CPM', cpc: 'CPC', clip: 'Per clip', box: 'Per box' };
const MODEL = { day: 'Fixed · per day', week: 'Fixed · per week', month: 'Fixed · per month', cpm: 'CPM · per 1,000 views', cpc: 'CPC · per click', clip: 'Per coupon clip', box: 'Per delivery box' };
const GROUPS = [
  { id: 'home', name: 'Homepage', ic: 'home', desc: 'The most-viewed page — billboards, video, reels and coupons' },
  { id: 'search', name: 'Search', ic: 'search', desc: 'Show up the moment shoppers type what they want' },
  { id: 'product', name: 'Product page', ic: 'tag', desc: 'Win the comparison on related product pages' },
  { id: 'checkout', name: 'Cart & checkout', ic: 'cart', desc: 'The highest-intent moments of the visit' },
  { id: 'brand', name: 'Brand store', ic: 'store', desc: 'Your storefront inside the marketplace' },
  { id: 'offline', name: 'Offline · in-box', ic: 'box', desc: 'A flyer or sample in every delivery box' },
];
const HOT = { H1: 'Most booked', H2: 'Best value', C1: 'Highest intent', S2: 'Top CTR', X1: 'Only on TBB' };
/* festive / sale windows sold as premium packages (sample occupancy) */
const FEST = [
  { n: 'Black Friday Beauty Week', d: '27 Nov – 1 Dec', p: 92, s: '92% booked' },
  { n: 'Christmas & New Year Glow', d: '20 Dec – 1 Jan', p: 64, s: '64% booked' },
  { n: 'Republic Day Sale', d: '23 – 26 Jan', p: 18, s: 'Opens 1 Dec' },
  { n: 'Valentine’s Week', d: '7 – 14 Feb', p: 8, s: 'Open' },
];
const grpOf = s => (s.page === 'cart' || s.page === 'success') ? 'checkout' : s.page;
const pageName = s => (GROUPS.find(g => g.id === grpOf(s)) || {}).name || s.page;

function econ(s) {
  const m = M[s.id] || { imp: 5000, ctr: .01, cvr: .03 };
  const clicks = m.imp * m.ctr;
  const perDay = { day: s.rate, week: s.rate / 7, month: s.rate / 30, cpm: m.imp / 1000 * s.rate, cpc: clicks * s.rate, clip: clicks * s.rate, box: m.imp * s.rate }[s.model] || s.rate;
  const timeBased = ['day', 'week', 'month'].includes(s.model);
  return { ...m, impL: m.impL || 'Impressions', clkL: m.clkL || 'Clicks', ctrL: m.ctrL || 'CTR', clicks, perDay, timeBased, unitDays: { day: 1, week: 7, month: 30 }[s.model] || 1, ecpm: perDay / m.imp * 1000 };
}
function quote(s, days) {
  const e = econ(s);
  let units = null, run = days, gross;
  if (e.timeBased) { units = Math.max(1, Math.ceil(days / e.unitDays - 1e-9)); run = units * e.unitDays; gross = units * s.rate; }
  else gross = e.perDay * days;
  const disc = s.model === 'day' ? (run >= 30 ? .15 : run >= 14 ? .1 : 0) : 0;
  gross = Math.round(gross);
  const discount = Math.round(gross * disc), net = gross - discount, gst = Math.round(net * GST);
  const imp = e.imp * run, clicks = imp * e.ctr, orders = clicks * e.cvr, sales = orders * AOV;
  return { s, e, days, run, units, gross, disc, discount, net, gst, total: net + gst, imp, clicks, orders, sales, roas: net ? sales / net : 0, ecpm: imp ? net / imp * 1000 : 0 };
}
const nf = n => kfmt(Math.round(n));
const pct = n => (n * 100).toFixed(n < .1 ? 1 : 0) + '%';
const numFmt = (v, a) => (a.pre || '') + (a.dec ? v.toFixed(a.dec) : Math.round(v).toLocaleString('en-IN')) + (a.suf || '');

/* ================= dates ================= */
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const addDays = (d, n) => { const t = new Date(d); t.setDate(t.getDate() + n); return t; };
const today = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
const minStart = () => iso(addDays(today(), 2));
const dLabel = s => parse(s).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(parse(s));
const span = (a, b) => (validDate(a) && validDate(b)) ? Math.round((parse(b) - parse(a)) / 864e5) + 1 : 0;

/* ================= module state ================= */
let F = null;                 // booking form
let done = null;              // submitted campaign (success state)
const E = { slot: 'H1', mode: 'days', days: 7, budget: 50000 };   // estimator
let fmtFilter = 'all';
let timers = [], rafs = [], io = null, onResize = null, swapT = 0;

const BOOKABLE = () => D.SLOTS.filter(s => s.bookable);
const ADV_NAME = { plum: 'Plum Goodness Pvt Ltd', beardo: 'Beardo (Marico)' };
function brandDefaults(id) {
  const b = brand(id);
  return { advertiser: ADV_NAME[id] || `${b.name} India Pvt Ltd`, headline: b.tagline || `New from ${b.name}`, sub: 'Flat 20% off this week + a free gift with every order', cta: `Shop ${b.name}`.slice(0, 22), color: b.color || '#333333' };
}
function applyDefaults(f) { const d = brandDefaults(f.brand); Object.keys(d).forEach(k => { if (!f.touched[k]) f[k] = d[k]; }); }
function freshForm(keep = {}) {
  const st = addDays(today(), 3);
  const f = { brand: 'mamaearth', slot: 'H1', start: iso(st), end: iso(addDays(st, 6)), agree: false, view: window.innerWidth < 640 ? 'mobile' : 'desktop', touched: {}, errors: {}, ...keep };
  applyDefaults(f);
  return f;
}

/* ================= small building blocks ================= */
const sh = (eyebrow, title, lead, extra = '') => `<header class="av-sh"><div><span class="av-eyebrow">${eyebrow}</span><h2>${title}</h2>${lead ? `<p>${lead}</p>` : ''}</div>${extra}</header>`;
const label = a => (a.house || a.brand === 'tbb') ? '<span class="pz-badge av-house">The Big Brands</span>' : UI.adBadge();
function spark(vals, w, h, cls = '') {
  const max = Math.max(...vals), min = Math.min(...vals);
  const pts = vals.map((v, i) => [i / (vals.length - 1) * w, h - 4 - (v - min) / (max - min || 1) * (h - 10)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg class="av-spark ${cls}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${line} L${w} ${h} L0 ${h} Z" class="av-spark-a"/><path d="${line}" class="av-spark-l"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="3.5" class="av-spark-d"/></svg>`;
}

/* ---------- mini page schematics (where a placement sits) ---------- */
const R = (h, ...k) => ({ t: 'r', h, k });
const RO = (h, ...k) => ({ t: 'r', h, k, on: true });
const C = (f, ...k) => ({ t: 'c', f, k });
const CO = (f, ...k) => ({ t: 'c', f, k, on: true });
const b = (f = 1, cls = '') => ({ t: 'b', f, cls });
const o = (f = 1, cls = '') => ({ t: 'b', f, cls, on: true });
const ps = n => Array.from({ length: n }, () => b(1, 'p'));
function sxNode(n) {
  if (n.t === 'r') return `<div class="av-sx-r${n.on ? ' on' : ''}" style="${n.h ? `height:${n.h}px;flex:none` : 'flex:1'}">${n.k.map(sxNode).join('')}</div>`;
  if (n.t === 'c') return `<div class="av-sx-c${n.on ? ' on' : ''}" style="flex:${n.f}">${n.k.map(sxNode).join('')}</div>`;
  return `<i class="av-sx-b ${n.cls}${n.on ? ' on' : ''}" style="flex:${n.f}"></i>`;
}
const SX = {
  H1: [RO(52, o(1, 'hero')), R(24, ...ps(4)), R(0, b(), b())],
  H2: [R(46, b(1, 'hero')), R(36, o(1, 'card'), o(1, 'card'), o(1, 'card'), o(1, 'card')), R(0, b())],
  H3: [R(36, b(1, 'hero')), RO(16, o()), R(0, ...ps(4))],
  H4: [R(30, b(1, 'hero')), R(6, b(.4, 't'), b(1.6, 'x')), R(0, o(1, 'tile'), b(1, 'tile'), b(1, 'tile'), b(1, 'tile'), b(1, 'tile'))],
  H5: [R(24, b(1, 'hero')), R(0, o(2, 'video'), C(1, b(), b(), b()))],
  H6: [R(22, b(1, 'hero')), R(0, o(1, 'reel'), o(1, 'reel'), o(1, 'reel'), o(1, 'reel'), b(1, 'reel'))],
  H7: [R(26, b(1, 'hero')), R(0, b(1, 'logo'), o(1, 'logo'), b(1, 'logo'), b(1, 'logo'), o(1, 'logo'), b(1, 'logo')), R(0, b(1, 'logo'), b(1, 'logo'), o(1, 'logo'), b(1, 'logo'), b(1, 'logo'), b(1, 'logo'))],
  H8: [R(24, b(1, 'hero')), R(0, o(1, 'ban'), o(1, 'ban')), R(22, ...ps(4))],
  H9: [R(26, b(1, 'hero')), R(0, o(1, 'cp'), o(1, 'cp'), o(1, 'cp'), o(1, 'cp')), R(0, o(1, 'cp'), o(1, 'cp'), o(1, 'cp'), o(1, 'cp'))],
  H10: [R(22, b(1, 'hero')), RO(0, o(1.1, 'p'), o(2.2, 'deal'), o(.9, 'timer')), R(22, ...ps(4))],
  H11: [R(22, b(1, 'hero')), RO(0, o(1.3, 'shelf'), o(1, 'p'), o(1, 'p'), o(1, 'p'), o(1, 'p'))],
  S1: [R(0, b(.5, 'x'), CO(2, o(1, 't')), b(.5, 'x')), R(0, C(.8, b(1, 'f')), C(3, R(0, ...ps(4))))],
  S2: [R(0, C(.8, b(1, 'f')), C(3, RO(26, o(1, 'ban')), R(0, ...ps(4))))],
  S3: [R(0, C(.8, b(1, 'f')), C(3, R(0, o(1, 'p'), o(1, 'p'), b(1, 'p'), b(1, 'p')), R(0, ...ps(4))))],
  S4: [R(0, C(.8, b(1, 'f')), C(3, R(0, b(1, 'p'), b(1, 'p'), o(1, 'native'), b(1, 'p')), R(0, ...ps(4))))],
  P1: [R(0, b(1.1, 'img'), C(1.4, b(.5, 't'), b(1, 't'), b(1, 't')), C(.9, b(1, 'buy'))), RO(36, o(1, 'p'), o(1, 'p'), o(1, 'p'), o(1, 'p'), o(1, 'p'))],
  P2: [R(0, b(1.1, 'img'), C(1.4, b(.5, 't'), b(1, 't'), b(1, 't'), b(1, 't')), C(.9, b(1, 'buy'), o(1.1, 'ban'))), R(26, ...ps(5))],
  C1: [R(0, C(2, b(1, 'line'), b(1, 'line'), RO(0, o(1, 'p'), o(1, 'p'), o(1, 'p'))), C(1, b(1, 'buy')))],
  C2: [R(28, b(1, 'okb')), RO(0, o(1, 'ban')), R(22, b(), b())],
  B1: [CO(1, R(40, o(1, 'bhero')), R(0, o(1, 'p'), o(1, 'p'), o(1, 'p'), o(1, 'p')))],
};
function boxArt(cls = '') {
  return `<svg class="av-boxart ${cls}" viewBox="0 0 280 220" aria-hidden="true">
    <defs><linearGradient id="avBoxG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3d6e"/><stop offset="1" stop-color="#ff7a45"/></linearGradient></defs>
    <ellipse cx="140" cy="202" rx="112" ry="10" fill="rgba(90,40,20,.16)"/>
    <path d="M40 92 L140 64 L126 20 L28 48 Z" fill="#e7b880"/><path d="M140 64 L240 92 L256 50 L154 22 Z" fill="#d9a468"/>
    <path d="M40 92 L140 64 L240 92 L140 120 Z" fill="#8c5a32"/>
    <g transform="rotate(-10 96 64)"><rect x="64" y="14" width="64" height="88" rx="6" fill="#fff"/><rect x="64" y="14" width="64" height="88" rx="6" fill="none" stroke="#ff3d6e" stroke-width="2.2" stroke-dasharray="6 4"/><rect x="71" y="21" width="50" height="24" rx="4" fill="url(#avBoxG)"/><text x="96" y="37" text-anchor="middle" fill="#fff" style="font:800 10px 'Bricolage Grotesque',sans-serif;letter-spacing:.06em">YOUR</text><rect x="71" y="51" width="44" height="5" rx="2.5" fill="#e4dfee"/><rect x="71" y="61" width="34" height="5" rx="2.5" fill="#e4dfee"/><rect x="71" y="74" width="22" height="20" rx="3" fill="#f2eff8"/><rect x="74" y="77" width="16" height="14" fill="#140a24" opacity=".7"/></g>
    <g transform="rotate(5 140 74)"><rect x="124" y="44" width="34" height="50" rx="5" fill="#1f9e96"/><rect x="124" y="44" width="34" height="9" rx="4" fill="#fff" opacity=".35"/><text x="141" y="73" text-anchor="middle" fill="#fff" style="font:700 7px Geist,sans-serif">SAMPLE</text></g>
    <g transform="rotate(14 182 64)"><rect x="168" y="18" width="20" height="12" rx="2" fill="#ffe1e8"/><path d="M164 28 H192 L188 104 Q178 108 168 104 Z" fill="#ff4d6d"/><text x="178" y="64" text-anchor="middle" fill="#fff" style="font:800 8px 'Bricolage Grotesque',sans-serif">TBB</text></g>
    <path d="M40 92 L140 120 L140 196 L40 166 Z" fill="#dda76c"/><path d="M140 120 L240 92 L240 166 L140 196 Z" fill="#c68d52"/>
    <path d="M40 92 L140 120 L140 131 L40 103 Z" fill="#fff" opacity=".16"/><path d="M140 120 L240 92 L240 103 L140 131 Z" fill="#fff" opacity=".1"/>
    <path d="M164 140 L222 124 L222 150 L164 166 Z" fill="#fff" opacity=".95"/><path d="M170 144 L182 141 L182 153 L170 156 Z" fill="url(#avBoxG)"/><path d="M186 145 L214 137 L214 141 L186 149 Z" fill="#cfc8db"/><path d="M186 152 L206 146 L206 150 L186 156 Z" fill="#e2dcea"/>
  </svg>`;
}
function schematic(s) {
  if (s.id === 'X1') return `<div class="av-sx av-sx-box">${boxArt()}</div>`;
  const spec = SX[s.id] || [R(0, o())];
  return `<div class="av-sx" aria-hidden="true"><div class="av-sx-hd${s.id === 'S1' ? ' s1' : ''}"><i></i><b></b><u></u></div><div class="av-sx-nv"></div><div class="av-sx-bd">${spec.map(sxNode).join('')}</div></div>`;
}

/* ================= sections ================= */
const NAV = [['av-top', 'Overview'], ['av-why', 'Why us'], ['av-formats', 'Ad formats'], ['av-ratecard', 'Rate card'], ['av-est', 'Estimator'], ['av-book', 'Book a campaign'], ['av-stories', 'Results'], ['av-faq', 'FAQ']];
function navBar() {
  return `<nav class="av-nav" aria-label="Advertise with us — sections"><div class="wrap av-nav-in">
    <span class="av-nav-brand"><i>${icon('megaphone')}</i>TBB&nbsp;Ads</span>
    <div class="av-nav-links">${NAV.map(([id, l], i) => `<button type="button" data-action="av-jump" data-target="${id}" class="${i === 0 ? 'on' : ''}">${l}</button>`).join('')}</div>
    <button type="button" class="btn btn-cart btn-sm av-nav-cta" data-action="av-jump" data-target="av-book">Book a campaign</button>
  </div></nav>`;
}

function heroVisual() {
  const slides = (D.ADS.H1 || []).map((a, i) => {
    const t = a.theme || {}, p = H.product(a.product);
    const ctaInk = lum(t.fg || '#fff') > .5 ? '#140a24' : '#ffffff';
    return `<div class="av-hv-slide${i === 0 ? ' on' : ''}" style="background:${t.bg};color:${t.fg}">
      <div class="av-hv-sc"><small>${esc(a.kicker || '')}</small><b>${esc(a.headline)}</b><span class="av-hv-cta" style="background:${t.fg};color:${ctaInk}">${esc(a.cta || 'Shop now')}</span></div>
      <div class="av-hv-art">${p ? art(p) : ''}</div>${label(a)}</div>`;
  }).join('');
  const cards = (D.ADS.H2 || []).slice(0, 4).map(a => {
    const t = a.theme || {}, p = H.product((a.products || [])[0]);
    return `<div class="av-hv-card" style="background:${t.bg};color:${t.fg}">${UI.brandLogo(a.brand, { size: 9, color: t.accent })}<em>${esc(a.headline)}</em><i>${p ? art(p) : ''}</i></div>`;
  }).join('');
  const st = (D.ADS.H3 || [])[0];
  const row = (id, sp) => { const p = H.product(id); return `<div class="av-hv-pr"><span class="av-hv-pa" style="--tint:${p.c1}">${art(p)}</span><span class="av-hv-pt"><i></i><i></i><b>${fmt(p.price)}</b></span>${sp ? '<em>Sponsored</em>' : ''}</div>`; };
  return `<div class="av-hv">
    <div class="av-hv-win">
      <div class="av-hv-bar"><i></i><i></i><i></i><span>${icon('shield')}thebigbrands.in</span></div>
      <div class="av-hv-hdr"><b>tbb</b><span>${icon('search')}Search 50+ brands…</span><u></u></div>
      <div class="av-hv-nav"><i></i><i></i><i></i><i></i><i></i><i class="hl"></i></div>
      <div class="av-hv-page">
        <div class="av-hv-bill">${slides}<span class="av-hv-dots">${(D.ADS.H1 || []).map((a, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</span></div>
        <div class="av-hv-cards">${cards}</div>
        ${st ? `<div class="av-hv-strip" style="background:${st.theme.bg};color:${st.theme.fg}">${UI.brandLogo(st.brand, { size: 9, color: '#fff' })}<span>${esc(st.headline)}</span>${UI.adBadge()}</div>` : ''}
      </div>
    </div>
    <div class="av-hv-phone"><div class="av-hv-scr">
      <div class="av-hv-ph-h"><span>${icon('search')}vitamin c serum</span></div>
      <div class="av-hv-ph-ban">${UI.adBadge()}${UI.brandLogo('dermaco', { size: 7.5 })}<b>Actives that actually work</b><small>From ₹349 · Shop now ›</small></div>
      ${row('derma-vitc', true)}${row('min-niacin', true)}${row('gar-bright', false)}
    </div></div>
    <span class="av-hv-tag av-t1"><b>H1</b>Hero Billboard<em>${rateText(slotDef('H1'))}</em></span>
    <span class="av-hv-tag av-t2"><b>H2</b>Spotlight cards<em>${rateText(slotDef('H2'))}</em></span>
    <span class="av-hv-tag av-t3"><b>S2</b>Search banner<em>${rateText(slotDef('S2'))}</em></span>
    <div class="av-hv-kpi">
      <div class="av-hv-kpi-h"><span class="av-live"><i></i>Live</span>Campaign report</div>
      <div class="av-hv-kpi-n"><b id="av-kpi-imp">14,212</b><small>impressions today</small></div>
      <div class="av-hv-kpi-g"><span><b>2.1%</b><small>CTR</small></span><span><b id="av-kpi-ord">38</b><small>orders</small></span><span><b>3.4×</b><small>ROAS</small></span></div>
      ${spark([12, 18, 15, 24, 22, 31, 28, 36, 34, 41, 39, 48], 200, 34)}
    </div>
    <div class="av-hv-booked" id="av-hv-booked">${bookedChip(0)}</div>
  </div>`;
}
function bookedChip(i) {
  const list = S.campaigns.length ? S.campaigns : [];
  if (!list.length) return '';
  const c = list[i % list.length], s = slotDef(c.slot) || { name: c.slot };
  const when = validDate(c.start) ? `${parse(c.start).getDate()}–${validDate(c.end) ? dLabel(c.end).replace(/^\w+,\s*/, '') : ''}` : '';
  const st = { live: 'Live', pending: 'In review', paused: 'Paused', rejected: 'Declined' }[c.status] || c.status;
  return `<span class="av-hb-ic">${icon('zap')}</span><span class="av-hb-t"><b>${esc(brand(c.brand).name)}</b> booked <b>${esc(s.name)}</b><small>${esc(when)} · <i class="av-st-${esc(c.status)}">${esc(st)}</i></small></span>`;
}

function hero() {
  return `<section class="av-hero av-anchor" id="av-top">
    <div class="wrap av-hero-in">
      <div class="av-hero-copy">
        <span class="av-pill"><b>New</b>Self-serve ads · live within 24 hours</span>
        <h1>Put your brand in front of <em>India’s beauty shoppers</em></h1>
        <p class="av-lead">Billboards, sponsored search, shoppable reels — and a sample in every delivery box. Book in minutes, we approve within a day, and you track every impression, click and order live.</p>
        <div class="av-ctas">
          <button type="button" class="btn btn-cart btn-lg" data-action="av-jump" data-target="av-book">Book a campaign ${icon('arrow')}</button>
          <button type="button" class="btn btn-lg av-btn-o" data-action="av-jump" data-target="av-ratecard">${icon('tag')}See rate card</button>
        </div>
        <ul class="av-ticks"><li>${icon('check')}No minimum spend</li><li>${icon('check')}Pay after approval</li><li>${icon('check')}GST invoice</li></ul>
        <div class="av-proof"><span>Brands on The Big Brands</span><div class="av-proof-l">${['loreal', 'mamaearth', 'himalaya', 'minimalist', 'plum', 'beardo', 'nivea'].map(id => UI.brandLogo(id, { size: 15, color: 'rgba(255,255,255,.78)' })).join('')}</div></div>
      </div>
      <div class="av-hv-wrap" aria-hidden="true">${heroVisual()}</div>
    </div>
  </section>`;
}

function stats() {
  return `<div class="av-stats">
    <ul class="av-stats-l">${AUDIENCE.map(a => `<li class="av-stat"><span class="av-stat-ic">${icon(a.ic)}</span><b data-av-count="${a.to}" data-dec="${a.dec || 0}" data-pre="${a.pre || ''}" data-suf="${a.suf || ''}">${numFmt(a.to, a)}</b><span>${a.label}</span></li>`).join('')}</ul>
    <p class="av-stats-note">${icon('info')}Sample audience figures for this demo — replaced by live analytics at launch</p>
  </div>`;
}

function why() {
  return `<section class="av-sec av-anchor" id="av-why">
    ${sh('Why The Big Brands', 'Ads that sit exactly where beauty shoppers decide', 'Shoppers come here to buy, not to scroll. Every placement is next to a buying decision — and every order ships in a box people can’t wait to open.')}
    <div class="av-why">
      <article class="av-w av-w-intent">
        <span class="av-w-ic">${icon('target')}</span>
        <h3>High-intent shoppers</h3>
        <p>Your ad appears when someone searches “vitamin c serum”, not while they scroll a feed.</p>
        <div class="av-iv" aria-hidden="true">
          <div class="av-iv-q">${icon('search')}<span>vitamin c serum</span><i class="av-caret"></i></div>
          <div class="av-iv-dd">
            <div class="av-iv-sp">${UI.adBadge()}${UI.brandLogo('minimalist', { size: 12 })}<span>10% Niacinamide Serum</span></div>
            <div class="av-iv-row">${icon('search')}vitamin c serum for glowing skin</div>
            <div class="av-iv-row">${icon('search')}vitamin c face wash</div>
          </div>
        </div>
        <div class="av-w-stat"><b>71%</b><span>of visits start with a search for a product or skin concern</span></div>
      </article>
      <article class="av-w av-w-box">
        <div class="av-wb-copy">
          <span class="av-only">${icon('sparkle')}Only on The Big Brands</span>
          <h3>Every delivery box is a sampling channel</h3>
          <p>Every order ships with a free TBB gift, so customers open the box with excitement. Put your flyer or a mini sample right next to it — delivered to a verified beauty buyer, at home.</p>
          <div class="av-wb-stats"><div><b>42K</b><small>boxes / month</small></div><div><b>~100%</b><small>opened at home</small></div><div><b>₹4</b><small>per box, all-in</small></div></div>
          <button type="button" class="link" data-action="av-est-slot" data-sid="X1">Estimate an in-box campaign ${icon('arrow')}</button>
        </div>
        <div class="av-wb-art">${boxArt('av-boxart-lg')}<span class="av-call av-call-1">Your flyer or sample</span><span class="av-call av-call-2">Free TBB gift inside</span></div>
      </article>
      <article class="av-w av-w-funnel">
        <span class="av-w-ic">${icon('layers')}</span>
        <h3>Full-funnel formats</h3>
        <p>Build awareness on the homepage, win consideration on search and product pages, and close the sale in the cart.</p>
        <div class="av-fun">
          <div class="av-fun-r" style="--w:100%;--c1:#5b35e0;--c2:#8b66ff"><span class="av-fun-l"><b>Awareness</b><small>Be seen</small></span><div class="av-fun-bar"><span>Hero Billboard</span><span>Video</span><span>Reels</span><span>In-box sample</span></div></div>
          <div class="av-fun-r" style="--w:86%;--c1:#d6246b;--c2:#ff3d6e"><span class="av-fun-l"><b>Consideration</b><small>Be chosen</small></span><div class="av-fun-bar"><span>Search banner</span><span>Spotlight cards</span><span>Brand store</span></div></div>
          <div class="av-fun-r" style="--w:72%;--c1:#ff6a3d;--c2:#ffa53d"><span class="av-fun-l"><b>Conversion</b><small>Be bought</small></span><div class="av-fun-bar"><span>Sponsored products</span><span>Cart add-ons</span><span>Coupons</span></div></div>
        </div>
      </article>
      <article class="av-w av-w-report">
        <span class="av-w-ic">${icon('chart')}</span>
        <h3>Transparent reporting</h3>
        <p>Impressions, clicks, orders and ROAS, updated every hour. No black box.</p>
        <div class="av-rep" aria-hidden="true">
          <div class="av-rep-k"><span><small>Impressions</small><b>1.4L</b></span><span><small>CTR</small><b>2.3%</b></span><span><small>ROAS</small><b>3.6×</b></span></div>
          ${spark([30, 36, 33, 42, 40, 51, 47, 56, 54, 62, 60, 71, 68, 79], 260, 64, 'av-spark-lg')}
          <div class="av-rep-f"><span>${icon('clock')}Updated hourly</span><span>${icon('check')}GST invoice</span></div>
        </div>
      </article>
    </div>
  </section>`;
}

function formatCard(s) {
  const e = econ(s), hot = HOT[s.id];
  const fillPct = Math.round(s.fill * 100);
  const sold = s.fill >= 1;
  return `<article class="av-fc">
    <div class="av-fc-sx">${schematic(s)}</div>
    <div class="av-fc-body">
      <div class="av-fc-top"><span class="av-id">${s.id}</span>${s.bookable ? `<span class="av-tag av-tag-ss">${icon('zap')}Self-serve</span>` : '<span class="av-tag av-tag-mg">Managed</span>'}${hot ? `<span class="av-hot">${icon('star')}${hot}</span>` : ''}</div>
      <h4>${esc(s.name)}</h4>
      <p>${esc(s.format)}</p>
      <dl class="av-fc-meta">
        <div><dt>Size</dt><dd>${esc(s.size)}</dd></div>
        <div><dt>Pricing</dt><dd>${MODEL_S[s.model] || esc(s.model)}</dd></div>
        <div><dt>Reach</dt><dd>~${nf(e.imp)}<small>/day</small></dd></div>
      </dl>
      <div class="av-fill${sold ? ' sold' : ''}" title="${sold ? 'Fully booked this month' : fillPct + '% booked this month'}"><i style="width:${Math.min(100, fillPct)}%"></i><span>${sold ? 'Sold out this month · join waitlist' : `${fillPct}% booked this month`}</span></div>
      <div class="av-fc-foot">
        <b class="av-fc-rate">${rateText(s)}</b>
        <span class="av-fc-btns">
          <button type="button" class="btn btn-ghost btn-sm" data-action="av-est-slot" data-sid="${s.id}" aria-label="Estimate ${esc(s.name)}">Estimate</button>
          ${s.bookable ? `<button type="button" class="btn btn-dark btn-sm" data-action="av-pick" data-sid="${s.id}" aria-label="Book ${esc(s.name)}">Book</button>` : `<button type="button" class="btn btn-ghost btn-sm" data-action="av-sales" aria-label="Contact sales about ${esc(s.name)}">Contact</button>`}
        </span>
      </div>
    </div>
  </article>`;
}
function formats() {
  const by = id => D.SLOTS.filter(s => grpOf(s) === id);
  const chips = [['all', 'All formats', D.SLOTS.length], ...GROUPS.map(g => [g.id, g.name, by(g.id).length])];
  const groups = GROUPS.map(g => {
    const list = by(g.id); if (!list.length) return '';
    const n = list.length;
    const extra = g.id === 'home' && n % 4 ? `<article class="av-fc av-fc-pitch"><span class="av-w-ic">${icon('sparkle')}</span><h4>Homepage takeover</h4><p>Own the Hero Billboard, Spotlight cards, Leaderboard and Deal of the Day for one big launch day.</p><b class="av-fc-rate">from ₹40,000/day</b><button type="button" class="btn btn-light btn-sm" data-action="av-sales">Talk to partnerships ${icon('arrow')}</button></article>` : '';
    return `<div class="av-grp" data-grp="${g.id}" data-n="${Math.min(4, n + (extra ? 1 : 0))}" ${fmtFilter !== 'all' && fmtFilter !== g.id ? 'hidden' : ''}>
      <div class="av-grp-h"><span class="av-grp-ic">${icon(g.ic)}</span><div><h3>${g.name}<small>${n} placement${n > 1 ? 's' : ''}</small></h3><p>${g.desc}</p></div></div>
      <div class="av-cards">${list.map(formatCard).join('')}${extra}</div>
    </div>`;
  }).join('');
  return `<section class="av-sec av-anchor" id="av-formats">
    ${sh('Ad formats', `${D.SLOTS.length} placements across the whole shopping journey`, 'From the first search to the unboxing. The highlighted block in each mock shows exactly where your ad appears.', `<p class="av-legend"><span class="av-lg-i"><span class="av-tag av-tag-ss">${icon('zap')}Self-serve</span>book instantly below</span><span class="av-lg-i"><span class="av-tag av-tag-mg">Managed</span>set up by our partnerships team</span></p>`)}
    <div class="av-filter" role="group" aria-label="Filter ad formats by page">${chips.map(([id, l, n]) => `<button type="button" class="chip${fmtFilter === id ? ' on' : ''}" data-action="av-filter" data-f="${id}" aria-pressed="${fmtFilter === id}">${l}<span>${n}</span></button>`).join('')}</div>
    <div class="av-groups" data-f="${fmtFilter}">${groups}<div class="av-grp av-grp-cta" data-n="2" ${fmtFilter !== 'all' ? 'hidden' : ''}>
      <div class="av-cta-card">
        <div><span class="av-eyebrow">Custom campaigns</span><h3>Planning a festive sale or a big launch?</h3><p>Bundle any placements into one plan: a single GST invoice, reserved dates and a dedicated campaign manager.</p></div>
        <div class="av-fest" aria-label="Upcoming festive ad windows">
          <span class="av-fest-h">${icon('calendar')}Upcoming sale windows · premium inventory</span>
          <ul>${FEST.map(w => `<li class="${w.p >= 85 ? 'hot' : ''}"><b>${esc(w.n)}</b><small>${esc(w.d)}</small><span class="av-fest-bar"><i style="width:${w.p}%"></i></span><em>${esc(w.s)}</em></li>`).join('')}</ul>
        </div>
        <div class="av-cta-b"><button type="button" class="btn btn-cart" data-action="av-sales">Plan with our team ${icon('arrow')}</button><button type="button" class="btn av-btn-o" data-action="av-jump" data-target="av-est">${icon('sliders')}Try the estimator</button></div>
      </div>
    </div></div>
  </section>`;
}

function rates() {
  const rows = GROUPS.map(g => {
    const list = D.SLOTS.filter(s => grpOf(s) === g.id); if (!list.length) return '';
    return `<tr class="av-tg"><th colspan="8" scope="colgroup"><span>${icon(g.ic)}${g.name}</span><small>${list.length} placement${list.length > 1 ? 's' : ''}</small></th></tr>` + list.map(s => {
      const e = econ(s), f = Math.round(s.fill * 100), sold = f >= 100;
      return `<tr>
        <th scope="row"><div class="av-rc-p"><span class="av-id">${s.id}</span><span class="av-rc-pt"><b>${esc(s.name)}</b><small class="av-rc-m">${esc(s.format)} · ${esc(s.size)}</small><span class="av-rc-mr"><b>${rateText(s)}</b><span>~${nf(e.imp)} ${esc(e.impL.toLowerCase().replace('impressions', 'views'))}/day</span>${sold ? '<em class="sold">Sold out</em>' : f >= 85 ? `<em>${f}% booked</em>` : ''}</span></span></div></th>
        <td>${esc(s.format)}<small>${esc(s.size)}</small></td>
        <td>${MODEL[s.model] || s.model}</td>
        <td class="r"><b class="av-rate">${rateText(s)}</b></td>
        <td class="r">~${nf(e.imp)}<small>${e.impL.toLowerCase()}</small></td>
        <td class="r">${s.model === 'box' ? `₹${s.rate}/box` : fmt(e.ecpm)}</td>
        <td class="av-rc-fill"><span class="av-mini${sold ? ' sold' : ''}"><i style="width:${Math.min(100, f)}%"></i></span><small class="av-mini-t">${sold ? 'Sold out' : f + '%'}</small></td>
        <td class="r">${s.bookable ? `<button type="button" class="btn btn-cart btn-sm" data-action="av-pick" data-sid="${s.id}" aria-label="Book ${esc(s.name)}">Book</button>` : `<button type="button" class="btn btn-ghost btn-sm" data-action="av-sales" aria-label="Contact sales about ${esc(s.name)}">Sales</button>`}</td>
      </tr>`;
    }).join('');
  }).join('');
  const pk = [
    { n: 'Starter', t: 'Get discovered', price: 21600, was: 24000, items: ['Leaderboard Strip · 7 days', 'Search Headline Banner · ₹10,000 of clicks', 'Weekly performance report'], slot: 'H3', days: 7 },
    { n: 'Launch', t: 'New product blitz', price: 46000, was: 54000, items: ['Hero Billboard · 7 days', 'Sponsored Deal of the Day · 1 day', 'In-box flyer · 5,000 boxes'], slot: 'H1', days: 7, hot: true },
    { n: 'Always-on', t: 'Own a skin concern', price: 25000, was: 28000, per: '/month', items: ['Concern Sponsorship · “Presented by”', 'Brand Store subscription', 'Sponsored Products · ₹15,000 wallet'], sales: true },
  ];
  return `<section class="av-sec av-anchor" id="av-ratecard">
    ${sh('Rate card · November 2026', 'Simple, published prices. No haggling.', 'Fixed-price placements are billed per day, week or month. Performance formats are billed only on delivery: per 1,000 views (CPM) or per click (CPC).', `<button type="button" class="btn btn-ghost av-sh-btn" data-action="toast" data-icon="upload" data-msg="Rate card PDF download is part of the full build">${icon('upload')}Download PDF</button>`)}
    <div class="blk av-rc">
      <div class="av-rc-scroll" tabindex="0" role="region" aria-label="Rate card table, scrolls sideways">
        <table class="av-table" id="av-rates">
          <caption class="sr-only">The Big Brands advertising rate card</caption>
          <thead><tr><th scope="col">Placement</th><th scope="col">Format &amp; size</th><th scope="col">Pricing model</th><th scope="col" class="r">Rate</th><th scope="col" class="r">Est. reach / day</th><th scope="col" class="r">Effective CPM</th><th scope="col">Booked (Nov)</th><th scope="col" class="r"><span class="sr-only">Action</span></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <ul class="av-rc-notes">
        <li>${icon('percent')}<span><b>Volume discount</b> on per-day placements: 10% off 14+ days, 15% off 30+ days</span></li>
        <li>${icon('info')}<span>All prices exclude <b>18% GST</b>. Reach figures are sample estimates.</span></li>
        <li>${icon('calendar')}<span><b>Festive weeks</b> (Diwali, End of Season Sale) are priced separately, so book early</span></li>
      </ul>
    </div>
    <div class="av-pk">${pk.map(p => `<article class="av-pk-c${p.hot ? ' hot' : ''}">
      ${p.hot ? '<span class="av-pk-hot">Most booked</span>' : ''}
      <span class="av-pk-n">${p.n}</span><h3>${p.t}</h3>
      <div class="av-pk-p"><b>${fmt(p.price)}</b><small>${p.per || ''} + GST</small><s>${fmt(p.was)}</s></div>
      <ul>${p.items.map(i => `<li>${icon('check')}${i}</li>`).join('')}</ul>
      ${p.sales ? `<button type="button" class="btn ${p.hot ? 'btn-cart' : 'btn-ghost'}" data-action="av-sales">Talk to partnerships</button>` : `<button type="button" class="btn ${p.hot ? 'btn-cart' : 'btn-ghost'}" data-action="av-pick" data-sid="${p.slot}" data-days="${p.days}">Start with ${esc(slotDef(p.slot).name)}</button>`}
    </article>`).join('')}</div>
  </section>`;
}

/* ---------- estimator ---------- */
function estimate(sid = E.slot) {
  const s = slotDef(sid) || D.SLOTS[0], e = econ(s);
  if (E.mode === 'days') return { s, e, q: quote(s, E.days) };
  const B = E.budget;
  if (e.timeBased) {
    let best = null;
    for (let u = 1; u * e.unitDays <= 90; u++) { const q = quote(s, u * e.unitDays); if (q.net <= B) best = q; }
    return best ? { s, e, q: best, budget: B } : { s, e, short: true, min: quote(s, e.unitDays).net, budget: B };
  }
  return { s, e, q: quote(s, B / e.perDay), budget: B };
}
function estInfo() {
  const s = slotDef(E.slot), e = econ(s);
  return `<span class="av-id">${s.id}</span><span><b>${esc(s.name)}</b><small>${esc(pageName(s))} · ${esc(s.format)}</small></span><span class="av-e-r"><b>${rateText(s)}</b><small>~${nf(e.imp)} ${e.impL.toLowerCase()}/day</small></span>`;
}
function estCtl() {
  if (E.mode === 'days') {
    return `<div class="av-range"><div class="av-range-h"><label for="av-e-range">Campaign length</label><b id="av-e-val">${E.days} day${E.days > 1 ? 's' : ''}</b></div>
      <input type="range" id="av-e-range" min="1" max="60" step="1" value="${E.days}" style="--p:${(E.days - 1) / 59 * 100}%">
      <div class="av-chips">${[3, 7, 14, 30].map(d => `<button type="button" class="chip${E.days === d ? ' on' : ''}" data-action="av-eset" data-v="${d}">${d} days</button>`).join('')}</div></div>`;
  }
  return `<div class="av-range"><div class="av-range-h"><label for="av-e-range">Total budget</label><b id="av-e-val">${fmt(E.budget)}</b></div>
    <input type="range" id="av-e-range" min="5000" max="500000" step="5000" value="${E.budget}" style="--p:${(E.budget - 5000) / 495000 * 100}%">
    <div class="av-chips">${[[10000, '₹10K'], [25000, '₹25K'], [50000, '₹50K'], [100000, '₹1L'], [250000, '₹2.5L']].map(([v, l]) => `<button type="button" class="chip${E.budget === v ? ' on' : ''}" data-action="av-eset" data-v="${v}">${l}</button>`).join('')}</div></div>`;
}
function estCompare() {
  const base = E.mode === 'days' ? `${E.days} day${E.days > 1 ? 's' : ''}` : `a ${fmt(E.budget)} budget`;
  const list = D.SLOTS.filter(s => s.id !== E.slot).map(s => { const r = estimate(s.id); return r.short ? null : r; }).filter(Boolean)
    .sort((a, b) => b.q.orders - a.q.orders).slice(0, 4);
  return `<div class="av-cmp-h"><b>Compare at ${base}</b><small>Most orders for the same ${E.mode === 'days' ? 'duration' : 'budget'}</small></div>
    ${list.map(({ s, q }) => `<button type="button" class="av-cmp-r" data-action="av-ecmp" data-sid="${s.id}" aria-label="Estimate ${esc(s.name)} instead"><span class="av-id">${s.id}</span><span class="av-cmp-n"><b>${esc(s.name)}</b><small>~${nf(q.orders)} orders · ${fmt(q.net)}</small></span><em>${q.roas.toFixed(1)}× <small>ROAS</small></em>${icon('chevRight')}</button>`).join('')}`;
}
function estOut() {
  const r = estimate(), s = r.s, e = r.e;
  if (r.short) {
    return `<div class="av-eo-top"><span>Estimated cost</span><b>${fmt(r.min)}</b><small>Minimum booking for ${esc(s.name)} is one ${s.model} (${rateText(s)}). Raise your budget to start.</small></div>
      <div class="av-eo-empty">${icon('info')}Your ${fmt(r.budget)} budget is below the minimum for this placement.</div>`;
  }
  const q = r.q, run = q.run;
  let sub;
  if (E.mode === 'days') {
    sub = e.timeBased
      ? `${q.units} ${s.model}${q.units > 1 ? 's' : ''} × ${fmt(s.rate)}${s.model !== 'day' ? ` · runs ${run} days` : ''}${q.disc ? ` · incl. ${q.disc * 100}% volume discount` : ''}`
      : `${E.days} days × ~${fmt(e.perDay)}/day · billed on delivery`;
  } else {
    sub = e.timeBased
      ? `Your ${fmt(r.budget)} books <b>${run} days</b>${q.disc ? ` with ${q.disc * 100}% volume discount` : ''}${r.budget - q.net > 0 ? ` · ${fmt(r.budget - q.net)} left over` : ''}`
      : `Runs ≈ <b>${Math.max(1, Math.round(run))} day${Math.round(run) > 1 ? 's' : ''}</b> at full delivery · ${rateText(s)}`;
  }
  const n = Math.max(1, Math.min(30, Math.ceil(run - 1e-9)));
  const st = parse(F ? F.start : iso(addDays(today(), 3)));
  const days = Array.from({ length: n }, (_, i) => {
    const d = addDays(st, i), w = d.getDay();
    const k = (w === 0 || w === 6) ? 1.22 : w === 5 ? 1.08 : .94 + ((i * 7) % 5) / 100;
    const frac = (i === n - 1 && run % 1) ? run % 1 : 1;
    return { d, v: e.imp * k * frac };
  });
  const max = Math.max(...days.map(x => x.v));
  const kp = [
    [e.impL, nf(q.imp)], [e.clkL, nf(q.clicks)], [e.ctrL, pct(e.ctr)],
    ['Est. orders', nf(q.orders)], ['Effective CPM', s.model === 'box' ? `₹${s.rate}/box` : fmt(q.ecpm)], ['Est. ROAS', q.roas.toFixed(1) + '×'],
  ];
  return `<div class="av-eo-top"><span>Estimated cost <i>excl. GST</i></span><b>${fmt(q.net)}</b><small>${sub}</small></div>
    <dl class="av-eo-kpis">${kp.map(([l, v], i) => `<div class="${i === 5 ? 'av-roas' : ''}"><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <div class="av-eo-ch">
      <div class="av-eo-ch-h"><span>Projected daily ${e.impL.toLowerCase()}</span><small>${run > 30 ? `first 30 of ${Math.round(run)} days` : `${n} day${n > 1 ? 's' : ''} from ${dLabel(iso(st))}`}</small></div>
      <div class="av-bars" role="img" aria-label="Bar chart of projected daily ${e.impL.toLowerCase()}, peaking at about ${nf(max)} on weekends">${days.map(x => `<span class="av-bar${(x.d.getDay() === 0 || x.d.getDay() === 6) ? ' we' : ''}" style="height:${Math.max(4, x.v / max * 100)}%" data-tip="${dLabel(iso(x.d))} · ${nf(x.v)}"></span>`).join('')}</div>
      <div class="av-bars-x"><span>${dLabel(iso(days[0].d))}</span><span>${n > 1 ? dLabel(iso(days[n - 1].d)) : ''}</span></div>
    </div>
    <div class="av-eo-foot">
      <p>${icon('info')}Based on sample traffic: ${pct(e.cvr)} click-to-order rate and ${fmt(AOV)} average order value.</p>
      ${s.bookable ? `<button type="button" class="btn btn-cart" data-action="av-pick" data-sid="${s.id}" ${E.mode === 'days' && e.timeBased ? `data-days="${run}"` : ''}>Book this placement ${icon('arrow')}</button>` : `<button type="button" class="btn btn-light" data-action="av-sales">Talk to partnerships ${icon('arrow')}</button>`}
    </div>`;
}
function estimator() {
  const opts = GROUPS.map(g => {
    const list = D.SLOTS.filter(s => grpOf(s) === g.id); if (!list.length) return '';
    return `<optgroup label="${g.name}">${list.map(s => `<option value="${s.id}"${E.slot === s.id ? ' selected' : ''}>${s.id} · ${esc(s.name)} — ${rateText(s)}</option>`).join('')}</optgroup>`;
  }).join('');
  return `<section class="av-sec av-anchor" id="av-est">
    ${sh('Campaign estimator', 'See what your budget buys before you spend a rupee', 'Pick a placement, then set a duration or a budget. Estimates update as you go.')}
    <div class="av-est">
      <div class="av-est-in">
        <label class="av-fld"><span>Placement</span><select id="av-e-slot">${opts}</select></label>
        <div class="av-e-info" id="av-e-info">${estInfo()}</div>
        <div class="av-seg" role="radiogroup" aria-label="Estimate by">
          <button type="button" role="radio" aria-checked="${E.mode === 'days'}" data-action="av-mode" data-mode="days">${icon('calendar')}By duration</button>
          <button type="button" role="radio" aria-checked="${E.mode === 'budget'}" data-action="av-mode" data-mode="budget">${icon('target')}By budget</button>
        </div>
        <div id="av-e-ctl">${estCtl()}</div>
        <div class="av-cmp" id="av-e-cmp">${estCompare()}</div>
      </div>
      <div class="av-est-out" id="av-e-out" aria-live="polite">${estOut()}</div>
    </div>
  </section>`;
}

/* ---------- live creative preview ---------- */
function creative(sid, f, m) {
  const col = /^#[0-9a-f]{6}$/i.test(f.color || '') ? f.color : brand(f.brand).color;
  const c = TBB.ads.fromCampaign({ id: 'PREVIEW', brand: f.brand, slot: sid, headline: f.headline, sub: f.sub, cta: f.cta, color: col });
  const t = c.theme;
  const hl = esc((f.headline || '').trim() || 'Your headline goes here');
  const sub = esc((f.sub || '').trim());
  const cta = esc((f.cta || '').trim() || 'Shop now');
  const prods = (c.products || []).map(H.product).filter(Boolean);
  const darkBg = lum(col) <= .6;
  const ctaSt = `background:${t.fg};color:${darkBg ? shade(col, -.35) : '#ffffff'}`;
  const light = shade(col, .9), ink = lum(col) > .75 ? '#1b1b1b' : shade(col, -.55);
  const logo = (size, color = t.fg) => `<span class="av-cr-logo">${UI.brandLogo(f.brand, { size, color })}</span>`;
  const arts = (n, cls = '') => `<div class="av-cr-arts ${cls}">${prods.slice(0, n).map(p => `<span class="av-cr-art">${art(p)}</span>`).join('')}</div>`;
  const badge = UI.adBadge();
  const copy = (extra = '') => `<div class="av-cr-copy">${logo(m ? 11 : 13)}<b class="av-cr-h">${hl}</b>${sub ? `<span class="av-cr-s">${sub}</span>` : ''}${extra}<span class="av-cr-cta" style="${ctaSt}">${cta} ›</span></div>`;
  switch (sid) {
    case 'H2':
      return `<div class="av-cr-row av-cr-row-3"><div class="av-cr av-cr-card" style="background:${light};color:${ink}">${badge}${logo(12, ink)}<b class="av-cr-h">${hl}</b>${sub ? `<span class="av-cr-s">${sub}</span>` : ''}${arts(2)}<span class="av-cr-link" style="color:${shade(col, lum(col) > .6 ? -.5 : 0)}">${cta} ›</span></div><div class="av-ghost av-ghost-card"></div><div class="av-ghost av-ghost-card"></div></div>`;
    case 'H3':
      return `<div class="av-cr av-cr-strip" style="background:${t.bg};color:${t.fg}">${badge}${logo(m ? 11 : 14)}<div class="av-cr-sc"><b class="av-cr-h">${hl}</b>${sub ? `<span class="av-cr-s">${sub}</span>` : ''}</div>${m ? '' : arts(3)}<span class="av-cr-cta" style="${ctaSt}">${cta} ›</span></div>`;
    case 'H5':
      return `<div class="av-cr av-cr-video" style="background:radial-gradient(120% 90% at 80% 30%, ${shade(col, -.05)} 0%, ${shade(col, -.55)} 55%, #0b0612 100%);color:#fff">${badge}<span class="av-cr-time">${icon('play')}Watch · 0:15</span>${arts(2)}<span class="av-cr-play">${icon('play')}</span><div class="av-cr-vb">${logo(m ? 10 : 12, '#fff')}<b class="av-cr-h">${hl}</b><span class="av-cr-cta" style="background:#fff;color:${shade(col, -.4)}">${cta} ›</span></div><span class="av-cr-prog"><i></i></span><span class="av-cr-mute">${icon('volumeOff')}</span></div>`;
    case 'H8':
      return `<div class="av-cr-row av-cr-row-2"><div class="av-cr av-cr-half" style="background:${t.bg};color:${t.fg}">${badge}${copy()}${arts(1)}</div>${m ? '' : '<div class="av-ghost av-ghost-half"></div>'}</div>`;
    case 'H10': {
      const p = prods[0], deal = p ? Math.round(p.price * .8) : 0;
      return `<div class="av-cr av-cr-deal" style="background:${light};color:${ink}">${badge}${p ? `<div class="av-cr-dart" style="background:${shade(col, .78)}">${art(p)}</div>` : ''}<div class="av-cr-copy"><span class="av-cr-k">Sponsored · Deal of the Day</span><b class="av-cr-h">${hl}</b>${sub ? `<span class="av-cr-s">${sub}</span>` : ''}${p ? `<span class="av-cr-price"><b>${fmt(deal)}</b><s>${fmt(p.mrp)}</s><em>${Math.round((1 - deal / p.mrp) * 100)}% off</em></span>` : ''}</div><div class="av-cr-timer"><small>Ends in</small><b>08:42:10</b><span class="av-cr-cta" style="background:${shade(col, lum(col) > .6 ? -.5 : 0)};color:#fff">${cta} ›</span></div></div>`;
    }
    case 'S2':
      return `<div class="av-cr-ctx">${icon('search')}<span>1–48 of 230 results for “<b>${esc(brand(f.brand).name.toLowerCase())}</b>”</span></div>
        <div class="av-cr av-cr-search" style="background:${light};color:${ink}">${badge}<div class="av-cr-copy">${logo(m ? 11 : 13, ink)}<b class="av-cr-h">${hl}</b>${sub ? `<span class="av-cr-s">${sub}</span>` : ''}<span class="av-cr-link" style="color:${shade(col, lum(col) > .6 ? -.5 : 0)}">${cta} ›</span></div><div class="av-cr-sp">${prods.slice(0, m ? 2 : 3).map(p => `<span class="av-cr-spc"><i style="background:${shade(p.c1, .85)}">${art(p)}</i><b>${fmt(p.price)}</b></span>`).join('')}</div></div>
        <div class="av-ghost-grid"><i></i><i></i><i></i><i></i></div>`;
    case 'C2':
      return `<div class="av-cr-ctx ok">${icon('check')}<span>Order placed — thank you, ${esc(S.address.name.split(' ')[0])}! Arriving ${H.deliveryDate(3)}</span></div>
        <div class="av-cr av-cr-thanks" style="background:${t.bg};color:${t.fg}">${badge}${copy('<span class="av-cr-k">Picked for your next order</span>')}${arts(2)}</div>`;
    default: /* H1 hero billboard */
      return `<div class="av-cr av-cr-bill" style="background:${t.bg};color:${t.fg}">${badge}${copy()}${arts(2)}<span class="av-cr-dots"><i class="on"></i><i></i><i></i><i></i><i></i></span></div>`;
  }
}
const PV_NOTE = { H1: 'rotation 1 of 5 at the top of the homepage', H2: 'one of 4 cards overlapping the hero billboard', H3: 'full-width strip between homepage sections', H5: 'autoplay, muted, with sound on tap', H8: 'one of two half-width banners on the homepage', H10: 'the countdown deal block on the homepage', S2: 'above search results for your brand & category keywords', C2: 'on the order confirmation page' };
function stageHTML() {
  return `<div class="av-dev${F.view === 'mobile' ? ' is-m' : ''}"><div class="av-dev-in">${creative(F.slot, F, F.view === 'mobile')}</div></div>`;
}

/* ---------- booking ---------- */
function dur() { return span(F.start, F.end); }
function summaryHTML() {
  const s = slotDef(F.slot), days = dur();
  if (days < 1) return `<div class="av-sum-h"><b>Cost summary</b></div><p class="av-sum-bad">${icon('info')}Choose an end date on or after the start date.</p>`;
  const q = quote(s, days), e = q.e;
  const perf = !e.timeBased;
  return `<div class="av-sum-h"><b>Cost summary</b><span class="av-id">${s.id}</span></div>
    <dl class="av-sum-l">
      <div><dt>Placement</dt><dd>${esc(s.name)}</dd></div>
      <div><dt>Dates</dt><dd>${dLabel(F.start)} → ${dLabel(F.end)}<small>${days} day${days > 1 ? 's' : ''}</small></dd></div>
      <div><dt>Rate</dt><dd>${rateText(s)}</dd></div>
      <div><dt>${perf ? `Est. media budget <small>${days} × ~${fmt(e.perDay)}/day</small>` : `Media cost <small>${q.units} ${s.model}${q.units > 1 ? 's' : ''} × ${fmt(s.rate)}</small>`}</dt><dd>${fmt(q.gross)}</dd></div>
      ${q.discount ? `<div class="av-sum-disc"><dt>Volume discount (${q.disc * 100}%)</dt><dd>−${fmt(q.discount)}</dd></div>` : (s.model === 'day' && days < 14 ? `<div class="av-sum-tip"><dt>${icon('percent')}Book ${14 - days} more day${14 - days > 1 ? 's' : ''} to save 10%</dt><dd></dd></div>` : '')}
      <div><dt>GST @ 18%</dt><dd>${fmt(q.gst)}</dd></div>
      <div class="av-sum-t"><dt>Total payable</dt><dd>${fmt(q.total)}</dd></div>
    </dl>
    <p class="av-sum-est">${icon('trending')}<span>Est. <b>~${nf(q.imp)}</b> ${e.impL.toLowerCase()} · <b>~${nf(q.clicks)}</b> ${e.clkL.toLowerCase()} · <b>~${nf(q.orders)}</b> orders</span></p>
    ${perf ? `<p class="av-sum-note">${icon('info')}Billed on actual delivery, capped at this budget.</p>` : ''}
    ${S.slotOn[s.id] === false ? `<p class="av-sum-note warn">${icon('info')}This slot is paused right now. Your campaign starts once it’s switched back on.</p>` : ''}`;
}
function availHTML() {
  const s = slotDef(F.slot), st = parse(minStart());
  const sel0 = validDate(F.start) ? parse(F.start) : null, sel1 = validDate(F.end) ? parse(F.end) : null;
  const cells = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(st, i), id = iso(d), w = d.getDay(), we = w === 0 || w === 6;
    const h = (s.id.charCodeAt(0) * 7 + s.id.length * 13 + i * 11) % 10 / 10;
    let left = s.units > 1 ? Math.max(1, Math.round(s.units * (1 - s.fill) + (h - .5) * 2 - (we ? 1 : 0))) : null;
    if (left != null) left = Math.min(left, s.units);
    const hot = s.units > 1 ? left <= 1 : (we || h > .7);
    const inR = sel0 && sel1 && d >= sel0 && d <= sel1;
    const txt = s.units > 1 ? `${left}/${s.units} left` : hot ? 'High demand' : 'Open';
    return `<button type="button" id="av-day-${id}" class="av-day${hot ? ' hot' : ''}${inR ? ' in' : ''}${sel0 && +d === +sel0 ? ' s0' : ''}${sel1 && +d === +sel1 ? ' s1' : ''}" data-action="av-day" data-date="${id}" aria-label="Start on ${dLabel(id)}, ${txt}" aria-pressed="${!!inR}"><small>${d.toLocaleDateString('en-IN', { weekday: 'short' })}</small><b>${d.getDate()}</b><i>${s.units > 1 ? `${left} left` : hot ? 'Hot' : 'Open'}</i></button>`;
  }).join('');
  return `<div class="av-av-h"><span>Availability · next 14 days</span><span class="av-av-k"><i class="k-open"></i>Open <i class="k-hot"></i>Filling fast</span></div><div class="av-av-g">${cells}</div>`;
}
function err(k) { return `<span class="av-err" id="av-err-${k}" role="alert">${F.errors[k] ? icon('info') + esc(F.errors[k]) : ''}</span>`; }
const inv = k => F.errors[k] ? ' aria-invalid="true"' : '';
function counter(k, max) { return `<em class="av-cnt" id="av-cnt-${k}">${(F[k] || '').length}/${max}</em>`; }
function formHTML() {
  const brands = D.BRANDS.filter(x => x.id !== 'tbb');
  const days = dur();
  const sw = [...new Set([brand(F.brand).color, brand(F.brand).accent && lum(brand(F.brand).accent) < .7 ? brand(F.brand).accent : null, '#ff3d6e', '#5b35e0', '#0f9f6e', '#140a24', '#f59e0b'].filter(Boolean).map(c => c.toLowerCase()))].slice(0, 6);
  const s = slotDef(F.slot);
  return `<form id="av-form" class="av-bk-grid" novalidate aria-label="Book a campaign">
    <div class="av-bk-f">
      <fieldset class="av-step">
        <legend><i>1</i>Advertiser</legend>
        <div class="av-row2">
          <label class="av-fld"><span>Brand</span><span class="av-sel-wrap"><select id="av-f-brand" data-av-f="brand"${inv('brand')}>${brands.map(x => `<option value="${x.id}"${F.brand === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></span>${err('brand')}</label>
          <label class="av-fld"><span>Advertiser company</span><input id="av-f-company" data-av-f="advertiser" type="text" autocomplete="organization" maxlength="60" value="${esc(F.advertiser)}" placeholder="e.g. Himalaya Wellness Pvt Ltd" aria-describedby="av-err-advertiser"${inv('advertiser')}>${err('advertiser')}</label>
        </div>
      </fieldset>
      <fieldset class="av-step">
        <legend><i>2</i>Placement &amp; dates</legend>
        <div class="av-slots" role="radiogroup" aria-label="Placement">${BOOKABLE().map(x => `<label class="av-st${F.slot === x.id ? ' on' : ''}"><input type="radio" id="av-st-${x.id}" name="av-slot" value="${x.id}" data-av-f="slot"${F.slot === x.id ? ' checked' : ''}><span class="av-st-in"><span class="av-id">${x.id}</span><span class="av-st-t"><b>${esc(x.name)}</b><small>${esc(pageName(x))} · ${esc(x.size)}</small></span><em>${rateText(x)}</em></span></label>`).join('')}</div>
        <div class="av-row2 av-dates">
          <label class="av-fld"><span>Start date</span><input id="av-f-start" data-av-f="start" type="date" min="${minStart()}" value="${esc(F.start)}" aria-describedby="av-err-start"${inv('start')}>${err('start')}</label>
          <label class="av-fld"><span>End date</span><input id="av-f-end" data-av-f="end" type="date" min="${esc(validDate(F.start) ? F.start : minStart())}" value="${esc(F.end)}" aria-describedby="av-err-end"${inv('end')}>${err('end')}</label>
        </div>
        <div class="av-durs" role="group" aria-label="Quick duration">${[3, 7, 14, 30].map(d => `<button type="button" id="av-dur-${d}" class="chip${days === d ? ' on' : ''}" data-action="av-dur" data-d="${d}" aria-pressed="${days === d}">${d} days${d >= 14 && s.model === 'day' ? `<small>−${d >= 30 ? 15 : 10}%</small>` : ''}</button>`).join('')}</div>
        <div class="av-avail" id="av-avail">${availHTML()}</div>
      </fieldset>
      <fieldset class="av-step">
        <legend><i>3</i>Creative</legend>
        <label class="av-fld"><span>Headline ${counter('headline', 48)}</span><input id="av-f-headline" data-av-f="headline" type="text" maxlength="48" value="${esc(F.headline)}" aria-describedby="av-err-headline"${inv('headline')}>${err('headline')}</label>
        <label class="av-fld"><span>Sub-line ${counter('sub', 70)}</span><input id="av-f-sub" data-av-f="sub" type="text" maxlength="70" value="${esc(F.sub)}" placeholder="Offer or proof point, e.g. Flat 20% off this week"></label>
        <div class="av-row2">
          <label class="av-fld"><span>Button text ${counter('cta', 22)}</span><input id="av-f-cta" data-av-f="cta" type="text" maxlength="22" value="${esc(F.cta)}" aria-describedby="av-err-cta"${inv('cta')}>${err('cta')}</label>
          <div class="av-fld"><span id="av-col-l">Brand colour</span><div class="av-colors" role="group" aria-labelledby="av-col-l">
            <label class="av-col-pick" title="Pick any colour"><input id="av-f-color" data-av-f="color" type="color" value="${esc(F.color)}" aria-label="Pick a custom brand colour"><span style="background:${esc(F.color)}"></span></label>
            ${sw.map((c, i) => `<button type="button" id="av-sw-${i}" class="av-sw${c === (F.color || '').toLowerCase() ? ' on' : ''}" style="background:${c}" data-action="av-swatch" data-c="${c}" aria-label="Use colour ${c}" aria-pressed="${c === (F.color || '').toLowerCase()}"></button>`).join('')}
            <code id="av-f-hex">${esc((F.color || '').toUpperCase())}</code>
          </div></div>
        </div>
        <button type="button" class="av-upload" data-action="toast" data-icon="upload" data-msg="Uploading your own banner (JPG/PNG/MP4) is part of the full build">${icon('upload')}<span><b>Have a finished banner?</b> Upload a JPG, PNG or MP4 at ${esc(s.size)} instead</span></button>
      </fieldset>
    </div>
    <aside class="av-bk-side">
      <div class="av-pv">
        <div class="av-pv-h"><b>${icon('eye')}Live preview</b>
          <div class="av-seg av-seg-sm" role="radiogroup" aria-label="Preview device">
            <button type="button" id="av-view-desktop" role="radio" aria-checked="${F.view !== 'mobile'}" data-action="av-view" data-view="desktop">Desktop</button>
            <button type="button" id="av-view-mobile" role="radio" aria-checked="${F.view === 'mobile'}" data-action="av-view" data-view="mobile">${icon('phone')}Mobile</button>
          </div>
        </div>
        <div class="av-stage" id="av-stage">${stageHTML()}</div>
        <div class="av-pv-note" id="av-pv-note"><span class="av-pv-sx">${schematic(s)}</span><span>Appears in <b>${s.id} · ${esc(s.name)}</b>: ${PV_NOTE[s.id] || esc(s.format)}.</span></div>
      </div>
      <div class="av-sum" id="av-sum">${summaryHTML()}</div>
      <label class="av-agree"><input type="checkbox" id="av-f-agree" data-av-f="agree"${F.agree ? ' checked' : ''} aria-describedby="av-err-agree"${inv('agree')}><span>I confirm this ad follows The Big Brands ad guidelines: ASCI-compliant, no unverified medical claims, and the products are listed on the store.</span></label>
      ${err('agree')}
      <button type="submit" class="btn btn-cart btn-lg av-submit">Submit for approval ${icon('arrow')}</button>
      <p class="av-pay">${icon('shield')}No payment now. Pay after approval by UPI, net banking or NEFT against a GST invoice.</p>
    </aside>
  </form>`;
}
function successHTML() {
  const { c, q } = done, s = slotDef(c.slot);
  return `<div class="av-ok" role="status">
    <div class="av-ok-main">
      <span class="av-ok-ic">${icon('check')}</span>
      <span class="av-eyebrow">Campaign submitted</span>
      <h3>Submitted for review — <span class="av-ok-id">${esc(c.id)}</span></h3>
      <p>The Big Brands team approves it in Ads Manager; once approved it goes live in slot <b>${esc(c.slot)}</b>.</p>
      <ol class="av-ok-steps">
        <li class="done"><i>${icon('check')}</i><b>Submitted</b><small>Today</small></li>
        <li class="now"><i>${icon('clock')}</i><b>Creative review</b><small>within 24 hours</small></li>
        <li><i>${icon('zap')}</i><b>Goes live</b><small>${dLabel(c.start)}</small></li>
        <li><i>${icon('chart')}</i><b>Live reporting</b><small>updated hourly</small></li>
      </ol>
      <div class="av-ok-btns">
        <a class="btn btn-cart btn-lg" href="#/admin/campaigns">${icon('sliders')}Open Ads Manager</a>
        <a class="btn btn-ghost btn-lg" href="#/">Back to the store</a>
        <button type="button" class="btn btn-ghost btn-lg" data-action="av-again">${icon('plus')}Book another</button>
      </div>
      <p class="av-ok-demo">${icon('info')}Demo tip: approve ${esc(c.id)} in Ads Manager and it appears in slot ${esc(c.slot)} on the store.</p>
    </div>
    <div class="av-ok-card">
      <div class="av-ok-pv">${creative(c.slot, { brand: c.brand, headline: c.headline, sub: c.sub, cta: c.cta, color: c.color }, false)}</div>
      <dl class="av-sum-l">
        <div><dt>Advertiser</dt><dd>${esc(c.advertiser)}</dd></div>
        <div><dt>Placement</dt><dd>${esc(s.id)} · ${esc(s.name)}</dd></div>
        <div><dt>Dates</dt><dd>${dLabel(c.start)} → ${dLabel(c.end)}</dd></div>
        <div><dt>Budget (excl. GST)</dt><dd>${fmt(c.budget)}</dd></div>
        <div class="av-sum-t"><dt>Total incl. GST</dt><dd>${fmt(q.total)}</dd></div>
      </dl>
    </div>
  </div>`;
}
function booking() {
  return `<section class="av-sec av-anchor" id="av-book">
    ${sh('Self-serve booking', 'Book a campaign in five minutes', 'Choose a placement and dates, write your ad, and watch the preview update. We review every ad within 24 hours.', `<ol class="av-how"><li><b>1</b>Book</li><li><b>2</b>We approve</li><li><b>3</b>You go live</li></ol>`)}
    <div class="blk av-bk" id="av-bk">${done ? successHTML() : formHTML()}</div>
  </section>`;
}

function stories() {
  const q = [
    { brand: 'Glowlab Skincare', font: "'Syne', sans-serif", col: '#0f6a63', who: 'Arjun Malhotra', role: 'Performance Marketing Lead', quote: 'Our search banner on “vitamin c serum” beats every marketplace we run on. The hourly report means we tweak our bids every morning.', big: '4.1%', bigL: 'click-through on “vitamin c serum”', camp: 'S2 · Search Headline Banner · always-on', init: 'AM', g: 'linear-gradient(135deg,#0f9f6e,#5b35e0)' },
    { brand: 'URBAN ROOTS', font: "'Bebas Neue', sans-serif", col: '#1b1b1b', who: 'Kabir Sethi', role: 'Growth Manager', quote: 'We booked the Deal of the Day ourselves in ten minutes. It was approved the next morning and our whole stock was gone by lunch.', big: '6 hrs', bigL: 'to sell out 1,200 units', camp: 'H10 · Sponsored Deal of the Day · 1 day', init: 'KS', g: 'linear-gradient(135deg,#ff7a45,#ff3d6e)' },
  ];
  return `<section class="av-sec av-anchor" id="av-stories">
    ${sh('Results', 'Brands that grew with The Big Brands', '', `<span class="av-sample">${icon('info')}Sample case study &amp; quotes: fictional brands for this demo</span>`)}
    <div class="av-stg">
      <article class="av-case">
        <div class="av-case-h"><span class="av-case-logo">Kesar <i>&amp;</i> Co.</span><span class="av-case-tag">Ayurvedic haircare · D2C</span></div>
        <h3>Launch week: Hero Billboard + 5,000 in-box samples</h3>
        <p>“The box sampling alone brought us 900 first-time buyers. People tried the sachet the day it arrived and came back for the full bottle.”</p>
        <span class="av-case-who"><i>MP</i><span><b>Meera Pillai</b><small>Head of Brand Marketing</small></span></span>
        <div class="av-case-k"><div><b>3.4×</b><small>ROAS</small></div><div><b>900+</b><small>first-time buyers</small></div><div><b>18%</b><small>repeat in 30 days</small></div></div>
        <div class="av-case-bar"><span>Spend ₹46,000</span><i><b style="width:29%"></b></i><span>Sales ₹1.56L</span></div>
      </article>
      ${q.map(x => `<figure class="av-q">
        <span class="av-q-logo" style="font-family:${x.font};color:${x.col}">${esc(x.brand)}</span>
        <div class="av-q-big"><b>${esc(x.big)}</b><span>${icon('trending')}${esc(x.bigL)}</span></div>
        <blockquote>“${esc(x.quote)}”</blockquote>
        <div class="av-q-f"><span class="av-q-camp">${icon('megaphone')}${esc(x.camp)}</span></div>
        <figcaption><i style="background:${x.g}">${x.init}</i><span><b>${esc(x.who)}</b><small>${esc(x.role)}, ${esc(x.brand.replace('URBAN ROOTS', 'Urban Roots Men'))}</small></span></figcaption>
      </figure>`).join('')}
    </div>
  </section>`;
}

function faq() {
  const items = [
    ['How do I pay?', 'Nothing is charged when you book. Once your campaign is approved you get a GST invoice and can pay by UPI, net banking or NEFT/RTGS. Performance formats (CPM/CPC) run from a prepaid wallet and are billed only on actual delivery. Brands and agencies with a credit agreement can pay within 30 days.'],
    ['How long does approval take?', 'Within 24 working hours. Our team checks your creative and landing page in Ads Manager, then you get an email and a WhatsApp message when the campaign is approved and again when it goes live. Most campaigns booked before 4 pm are approved the same day.'],
    ['What are the creative guidelines?', 'Headlines up to 48 characters and sub-lines up to 70. Ads must follow ASCI guidelines: no unverified medical or “cures” claims, no before/after images without proof, and no comparisons with named competitors. Advertised products must be listed on The Big Brands. Prefer to design it yourself? Upload a finished banner at the size shown for each placement.'],
    ['What reporting do I get?', 'A live dashboard with impressions, clicks, CTR, add-to-carts, orders, revenue and ROAS, updated hourly. You also get a weekly PDF summary, and in-box sampling campaigns include QR-scan and redemption tracking.'],
    ['Can I target specific shoppers?', 'Search formats target by keyword and skin or hair concern. CPM formats can target by category, city tier and new vs returning shoppers. Custom audiences (for example, people who bought from your brand before) are part of the full platform.'],
    ['Can I pause or cancel a campaign?', 'Performance campaigns can be paused at any time. For fixed-price placements, cancel at least 48 hours before the start date for a full credit to your wallet. After that, unused days are credited at 50%.'],
    ['How does in-box sampling work?', 'Send your flyers or mini samples to our fulfilment centre. We add them to boxes that match the category you choose, for example every haircare order in Maharashtra. The ₹4 per box price includes insertion and reporting.'],
  ];
  return `<section class="av-sec av-anchor" id="av-faq">
    <div class="av-faq">
      <div class="av-faq-l">
        ${sh('FAQ', 'Questions brands ask us', 'Everything about payment, approval, creatives and reporting.')}
        <div class="av-contact">
          <span class="av-contact-ic">${icon('users')}</span>
          <b>Prefer to talk to someone?</b>
          <p>Our partnerships team plans festive, launch and always-on campaigns with you.</p>
          <a class="av-mail" href="mailto:ads@thebigbrands.in">ads@thebigbrands.in</a>
          <small>Mon–Sat · 10 am – 7 pm IST</small>
          <div class="av-contact-b">
            <button type="button" class="btn btn-light btn-sm" data-action="av-sales">${icon('phone')}Request a call back</button>
            <button type="button" class="btn btn-sm av-btn-o" data-action="toast" data-icon="upload" data-msg="Media kit PDF is part of the full build">${icon('upload')}Media kit</button>
          </div>
        </div>
      </div>
      <div class="av-faq-r">${items.map(([qq, a], i) => `<details class="av-qa"${i === 0 ? ' open' : ''}><summary><span>${qq}</span><i aria-hidden="true">${icon('plus')}</i></summary><p>${a}</p></details>`).join('')}</div>
    </div>
  </section>`;
}

/* ================= page ================= */
function render(route) {
  if (!F) F = freshForm();
  const qs = route.q.get('slot');
  if (qs && slotDef(qs)) { E.slot = qs; if (slotDef(qs).bookable) F.slot = qs; }
  return `<div class="av">
    ${navBar()}
    ${hero()}
    <div class="wrap av-body">
      ${stats()}
      ${why()}
      ${formats()}
      ${rates()}
      ${estimator()}
      ${booking()}
      ${stories()}
      ${faq()}
    </div>
  </div>`;
}

function scrollToId(id, block = 'start') {
  const el = document.getElementById(id); if (!el) return;
  el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block });
}
function fitHero() {
  const w = $('.av-hv-wrap'), v = $('.av-hv'); if (!w || !v) return;
  v.style.zoom = String(Math.min(1.1, Math.max(.4, w.clientWidth / 620)));
}
function countUp(root) {
  const els = $$('[data-av-count]', root);
  if (reduceMotion()) return;
  const t0 = performance.now(), dur0 = 1300;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur0), ease = 1 - Math.pow(1 - k, 3);
    els.forEach(el => { const a = { pre: el.dataset.pre, suf: el.dataset.suf, dec: Number(el.dataset.dec) }; el.textContent = numFmt(Number(el.dataset.avCount) * ease, a); });
    if (k < 1) rafs.push(requestAnimationFrame(step));
  };
  rafs.push(requestAnimationFrame(step));
}

function mount(root, route) {
  fitHero();
  onResize = () => fitHero();
  window.addEventListener('resize', onResize);
  countUp(root);
  if (!reduceMotion()) {
    let si = 0, bi = 0, imp = 14212, ord = 38;
    timers.push(setInterval(() => {
      const sl = $$('.av-hv-slide', root), dots = $$('.av-hv-dots i', root); if (!sl.length) return;
      si = (si + 1) % sl.length;
      sl.forEach((x, i) => x.classList.toggle('on', i === si)); dots.forEach((x, i) => x.classList.toggle('on', i === si));
    }, 3400));
    timers.push(setInterval(() => {
      imp += 4 + Math.floor(Math.random() * 18); if (Math.random() < .3) ord += 1;
      const a = $('#av-kpi-imp', root), b2 = $('#av-kpi-ord', root);
      if (a) a.textContent = imp.toLocaleString('en-IN'); if (b2) b2.textContent = ord;
    }, 1600));
    timers.push(setInterval(() => {
      const el = $('#av-hv-booked', root); if (!el || S.campaigns.length < 2) return;
      el.classList.add('out');
      clearTimeout(swapT); swapT = setTimeout(() => { bi += 1; el.innerHTML = bookedChip(bi); el.classList.remove('out'); }, 320);
    }, 4600));
  }
  /* active section in the sticky nav */
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(ents => {
      ents.forEach(en => { if (en.isIntersecting) setNav(en.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
  /* deep links: #/advertise?rates=1 · ?book=1 · ?slot=H3 */
  const wantRates = route.q.has('rates') || /rates/.test(route.raw);
  const wantBook = route.q.has('book') || (route.q.get('slot') && slotDef(route.q.get('slot')) && slotDef(route.q.get('slot')).bookable);
  const wantEst = route.q.get('slot') && slotDef(route.q.get('slot')) && !slotDef(route.q.get('slot')).bookable;
  if (wantRates || wantBook || wantEst) {
    timers.push(setTimeout(() => {
      if (wantRates) { const t = document.getElementById('av-rates'); if (t) t.closest('section').scrollIntoView({ behavior: 'auto', block: 'start' }); }
      else scrollToId(wantBook ? 'av-book' : 'av-est');
    }, 90));
  }
}
function unmount() {
  timers.forEach(t => { clearInterval(t); clearTimeout(t); }); timers = []; clearTimeout(swapT);
  rafs.forEach(cancelAnimationFrame); rafs = [];
  if (io) { io.disconnect(); io = null; }
  if (onResize) { window.removeEventListener('resize', onResize); onResize = null; }
  done = null;
}
function setNav(id) {
  $$('.av-nav-links button').forEach(x => { const on = x.dataset.target === id; x.classList.toggle('on', on); if (on) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
  const on = $('.av-nav-links button.on');
  if (on && on.parentElement.scrollWidth > on.parentElement.clientWidth) {
    /* centre the active pill inside the scrolling strip (offsetLeft is relative to the sticky nav, not the strip) */
    const p = on.parentElement, pr = p.getBoundingClientRect(), r = on.getBoundingClientRect();
    const left = p.scrollLeft + (r.left - pr.left) - (pr.width - r.width) / 2;
    p.scrollTo({ left: Math.max(0, left), behavior: reduceMotion() ? 'auto' : 'smooth' });
  }
}

TBB.page('advertise', { render, mount, unmount, title: 'Advertise with us' });

/* ================= interactions ================= */
function renderBook(focusId) {
  const box = $('#av-bk'); if (!box) return;
  const active = focusId || (document.activeElement && box.contains(document.activeElement) ? document.activeElement.id : '');
  box.innerHTML = done ? successHTML() : formHTML();
  if (active) { const el = document.getElementById(active); if (el) el.focus({ preventScroll: true }); }
}
function refreshEst(ctl = false) {
  const info = $('#av-e-info'), out = $('#av-e-out'), c = $('#av-e-ctl'), cmp = $('#av-e-cmp');
  if (info) info.innerHTML = estInfo();
  if (out) out.innerHTML = estOut();
  if (cmp) cmp.innerHTML = estCompare();
  if (ctl && c) c.innerHTML = estCtl();
}
function refreshLive(k) {
  if (['headline', 'sub', 'cta', 'color'].includes(k)) {
    const st = $('#av-stage'); if (st) st.innerHTML = stageHTML();
    const cn = $('#av-cnt-' + k); if (cn) cn.textContent = `${(F[k] || '').length}/${{ headline: 48, sub: 70, cta: 22 }[k]}`;
  }
  if (k === 'color') {
    const hx = $('#av-f-hex'); if (hx) hx.textContent = (F.color || '').toUpperCase();
    const pk = $('.av-col-pick span'); if (pk) pk.style.background = F.color;
    $$('.av-sw').forEach(x => { const on = x.dataset.c === (F.color || '').toLowerCase(); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  }
  const sum = $('#av-sum'); if (sum) sum.innerHTML = summaryHTML();
}
function clearErr(k) {
  if (!F.errors[k]) return;
  delete F.errors[k];
  const e = $('#av-err-' + k); if (e) e.innerHTML = '';
  const f = $(`#av-form [data-av-f="${k}"]`); if (f) f.removeAttribute('aria-invalid');
}
function onField(el, ev) {
  if (!F || done) return;
  const k = el.dataset.avF;
  const tag = el.tagName, type = el.type;
  const discrete = tag === 'SELECT' || type === 'radio' || type === 'checkbox' || type === 'date';
  if (ev.type === 'input' && discrete) return;          // handled on change
  if (ev.type === 'change' && !discrete && type !== 'color') return;
  if (type === 'radio' && !el.checked) return;
  const prevDays = dur(), prevBrand = F.brand;
  F[k] = type === 'checkbox' ? el.checked : el.value;
  F.touched[k] = true;
  clearErr(k);
  if (k === 'brand') { const old = brandDefaults(prevBrand); ['advertiser', 'headline', 'sub', 'cta', 'color'].forEach(x => { if (F.touched[x] && String(F[x]).toLowerCase() === String(old[x]).toLowerCase()) delete F.touched[x]; }); applyDefaults(F); ['advertiser', 'headline', 'cta'].forEach(x => delete F.errors[x]); renderBook('av-f-brand'); return; }
  if (k === 'slot') { renderBook('av-st-' + F.slot); return; }
  if (k === 'start') {
    if (validDate(F.start) && prevDays > 0) F.end = iso(addDays(parse(F.start), prevDays - 1));
    else if (validDate(F.start) && (!validDate(F.end) || parse(F.end) < parse(F.start))) F.end = F.start;
    clearErr('end');
    renderBook('av-f-start'); return;
  }
  if (k === 'end') { renderBook('av-f-end'); return; }
  if (k === 'agree') return;
  refreshLive(k);
}
TBB.on('input', '#av-form [data-av-f]', onField);
TBB.on('change', '#av-form [data-av-f]', onField);
TBB.on('submit', '#av-form', (el, e) => { e.preventDefault(); submit(); });

function validate() {
  const er = {};
  if (!F.brand || !brand(F.brand) || F.brand === 'tbb') er.brand = 'Choose your brand';
  if ((F.advertiser || '').trim().length < 2) er.advertiser = 'Enter the company that will be invoiced';
  if ((F.headline || '').trim().length < 3) er.headline = 'Write a headline (at least 3 characters)';
  if ((F.cta || '').trim().length < 2) er.cta = 'Add button text, e.g. “Shop now”';
  if (!validDate(F.start)) er.start = 'Choose a start date';
  else if (F.start < minStart()) er.start = `Earliest start is ${dLabel(minStart())} (we need a day to review)`;
  if (!validDate(F.end)) er.end = 'Choose an end date';
  else if (validDate(F.start) && F.end < F.start) er.end = 'End date must be on or after the start date';
  else if (dur() > 90) er.end = 'Campaigns can run up to 90 days. Contact us for longer';
  if (!F.agree) er.agree = 'Please confirm the ad follows our guidelines';
  return er;
}
function submit() {
  if (!F || done) return;
  F.errors = validate();
  const keys = Object.keys(F.errors);
  if (keys.length) {
    renderBook();
    const first = { brand: 'av-f-brand', advertiser: 'av-f-company', start: 'av-f-start', end: 'av-f-end', headline: 'av-f-headline', cta: 'av-f-cta', agree: 'av-f-agree' };
    const k = ['brand', 'advertiser', 'start', 'end', 'headline', 'cta', 'agree'].find(x => F.errors[x]);
    const el = k && document.getElementById(first[k]);
    if (el) { el.focus({ preventScroll: true }); el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'center' }); }
    TBB.toast(keys.length === 1 ? F.errors[keys[0]] : `Please fix ${keys.length} highlighted fields`, { icon: 'info' });
    return;
  }
  const s = slotDef(F.slot), q = quote(s, dur());
  const c = TBB.ads.book({ brand: F.brand, advertiser: F.advertiser.trim(), slot: F.slot, headline: F.headline.trim(), sub: (F.sub || '').trim(), cta: F.cta.trim(), color: F.color, start: F.start, end: F.end, budget: q.net });
  done = { c, q };
  renderBook();
  const bk = $('#av-book'); if (bk) bk.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  const hb = $('#av-hv-booked'); if (hb) hb.innerHTML = bookedChip(0);
  TBB.toast(`Submitted for review — ${c.id}`, { icon: 'megaphone' });
}

function pickSlot(id, days) {
  const s = slotDef(id); if (!s) return;
  if (done) { done = null; F = freshForm({ brand: F.brand, advertiser: F.advertiser, touched: { advertiser: !!F.touched.advertiser } }); }
  if (!F) F = freshForm();
  if (s.bookable) {
    F.slot = id;
    if (days && validDate(F.start)) F.end = iso(addDays(parse(F.start), Math.min(90, Number(days)) - 1));
    renderBook();
    scrollToId('av-book');
    const st = $('#av-stage'); if (st) { st.classList.remove('av-flash'); void st.offsetWidth; st.classList.add('av-flash'); }
    TBB.toast(`${s.name} selected. Write your ad and preview it live`, { icon: 'megaphone' });
  } else {
    E.slot = id; const sel = $('#av-e-slot'); if (sel) sel.value = id; refreshEst();
    scrollToId('av-est');
  }
}

TBB.action('av-jump', el => { const id = el.dataset.target; setNav(id); scrollToId(id); });
TBB.action('av-filter', el => {
  fmtFilter = el.dataset.f || 'all';
  $$('.av-filter .chip').forEach(x => { const on = x.dataset.f === fmtFilter; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  const g = $('.av-groups'); if (g) g.dataset.f = fmtFilter;
  $$('.av-grp').forEach(x => { x.hidden = !(fmtFilter === 'all' || x.dataset.grp === fmtFilter); });
  const cta = $('.av-grp-cta'); if (cta) cta.hidden = fmtFilter !== 'all';
});
TBB.action('av-pick', el => pickSlot(el.dataset.sid, el.dataset.days));
TBB.action('av-est-slot', el => {
  E.slot = el.dataset.sid; const sel = $('#av-e-slot'); if (sel) sel.value = E.slot;
  refreshEst(); scrollToId('av-est');
  const out = $('#av-e-out'); if (out) { out.classList.remove('av-flash'); void out.offsetWidth; out.classList.add('av-flash'); }
});
TBB.action('av-sales', () => TBB.toast('Thanks! Our partnerships team will call you within 1 working day (demo)', { icon: 'users' }));
TBB.action('av-mode', el => {
  E.mode = el.dataset.mode === 'budget' ? 'budget' : 'days';
  $$('.av-est .av-seg button').forEach(x => x.setAttribute('aria-checked', x.dataset.mode === E.mode));
  refreshEst(true);
});
TBB.action('av-eset', el => {
  const v = Number(el.dataset.v);
  if (E.mode === 'days') E.days = v; else E.budget = v;
  refreshEst(true);
});
TBB.action('av-ecmp', el => {
  E.slot = el.dataset.sid; const sel = $('#av-e-slot'); if (sel) sel.value = E.slot;
  refreshEst();
  const out = $('#av-e-out'); if (out) { out.classList.remove('av-flash'); void out.offsetWidth; out.classList.add('av-flash'); }
});
TBB.on('change', '#av-e-slot', el => { E.slot = el.value; refreshEst(); });
TBB.on('input', '#av-e-range', el => {
  const v = Number(el.value);
  if (E.mode === 'days') { E.days = v; el.style.setProperty('--p', `${(v - 1) / 59 * 100}%`); }
  else { E.budget = v; el.style.setProperty('--p', `${(v - 5000) / 495000 * 100}%`); }
  const lbl = $('#av-e-val'); if (lbl) lbl.textContent = E.mode === 'days' ? `${v} day${v > 1 ? 's' : ''}` : fmt(v);
  $$('#av-e-ctl .chip').forEach(x => x.classList.toggle('on', Number(x.dataset.v) === v));
  const out = $('#av-e-out'); if (out) out.innerHTML = estOut();
  const cmp = $('#av-e-cmp'); if (cmp) cmp.innerHTML = estCompare();
});
TBB.action('av-dur', el => {
  if (!F) return;
  const d = Number(el.dataset.d);
  if (!validDate(F.start)) F.start = iso(addDays(today(), 3));
  F.end = iso(addDays(parse(F.start), d - 1));
  clearErr('end');
  renderBook('av-dur-' + d);
});
TBB.action('av-day', el => {
  if (!F) return;
  const days = Math.max(1, dur() || 7);
  F.start = el.dataset.date; F.end = iso(addDays(parse(F.start), days - 1));
  clearErr('start'); clearErr('end');
  renderBook('av-day-' + F.start);
});
TBB.action('av-swatch', el => {
  if (!F) return;
  F.color = el.dataset.c; F.touched.color = true;
  const inp = $('#av-f-color'); if (inp) inp.value = F.color;
  refreshLive('color');
});
TBB.action('av-view', el => {
  if (!F) return;
  F.view = el.dataset.view === 'mobile' ? 'mobile' : 'desktop';
  $$('.av-pv .av-seg button').forEach(x => x.setAttribute('aria-checked', x.dataset.view === F.view));
  const st = $('#av-stage'); if (st) st.innerHTML = stageHTML();
});
TBB.action('av-again', () => {
  done = null;
  F = freshForm({ brand: F.brand, advertiser: F.advertiser, touched: { advertiser: !!F.touched.advertiser } });
  renderBook();
  scrollToId('av-book');
});
})();
