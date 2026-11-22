/* The Big Brands — Admin console  (#/admin, #/admin/<tab>)
   The client's back office: ad revenue, ad inventory, campaign approvals, orders,
   free-gift engine and catalogue. The same controls ship in the Android / iOS admin app.
   CSS + action prefix: "am-" */
(() => {
'use strict';
const D = TBB.data, S = TBB.S, H = TBB.h, UI = TBB.ui;
const { esc, fmt, icon } = H;

/* ---------------- admin-only icons ---------------- */
const AIC = {
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  rupee: '<path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a5 5 0 0 0 0-10"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 10v10"/>',
};
const ic = (n, cls = '') => AIC[n]
  ? `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AIC[n]}</svg>`
  : icon(n, cls);

/* ---------------- tabs ---------------- */
const TABS = [
  { id: 'dashboard', path: '',          label: 'Dashboard',   ic: 'grid',      group: 'Overview' },
  { id: 'ads',       path: 'ads',       label: 'Ads Manager', ic: 'megaphone', group: 'Monetisation' },
  { id: 'campaigns', path: 'campaigns', label: 'Campaigns',   ic: 'layers',    group: 'Monetisation' },
  { id: 'orders',    path: 'orders',    label: 'Orders',      ic: 'box',       group: 'Store' },
  { id: 'gifts',     path: 'gifts',     label: 'Free Gifts',  ic: 'gift',      group: 'Store' },
  { id: 'products',  path: 'products',  label: 'Products',    ic: 'tag',       group: 'Store' },
  { id: 'settings',  path: 'settings',  label: 'Settings',    ic: 'sliders',   group: 'Account' },
];
const tabOf = r => TABS.find(t => t.path && t.path === r.seg[1]) || TABS[0];
const tabHref = t => '#/admin' + (t.path ? '/' + t.path : '');

/* where each slot lives on the storefront */
const PAGES = {
  home:    { name: 'Homepage',           href: '#/' },
  search:  { name: 'Search results',     href: '#/s?q=serum' },
  product: { name: 'Product pages',      href: '#/p/cet-cl' },
  cart:    { name: 'Cart',               href: '#/cart' },
  success: { name: 'Order confirmation', href: '#/success' },
  brand:   { name: 'Brand stores',       href: '#/brand/loreal' },
  offline: { name: 'Delivery box',       href: '' },
};
const pg = id => PAGES[id] || { name: id || '—', href: '' };

/* page wireframes for the "where it runs" placement map (top → bottom, matches the storefront order) */
const MAPS = {
  home:    ['H1:hero', 'H2:cards', 'H4:tiles', 'H3:strip', 'H10:block', 'H5:video', 'H6:reels', 'H8:halves', 'H9:tiles', 'H11:block', 'H7:tiles'],
  search:  ['S1:sugg', 'S2:strip', 'S3:cards', 'S4:grid', '-:grid'],
  product: ['-:pdp', 'P2:box', 'P1:cards'],
  cart:    ['-:list', 'C1:cards', '-:list'],
  success: ['-:block', 'C2:strip', '-:list'],
  brand:   ['B1:hero', '-:cards', '-:grid'],
};
const ord = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');
function placeMap(id) {
  const s = H.slotDef(id); if (!s || !MAPS[s.page]) return null;
  const rows = MAPS[s.page].map(x => x.split(':'));
  const idx = rows.findIndex(r => r[0] === id); if (idx < 0) return null;
  const kids = { cards: 4, reels: 4, halves: 2, pdp: 2 };
  const html = `<div class="am-map" aria-hidden="true"><i class="am-map-top"></i>${rows.map(([k, t]) => `<i class="am-map-r am-map-${t}${k === id ? ' on' : ''}">${'<b></b>'.repeat(kids[t] || 0)}</i>`).join('')}</div>`;
  const pos = rows[idx][1] === 'sugg' ? 'Inside the search-box suggestions'
    : idx === 0 ? 'Top of the page — the first thing shoppers see'
    : `${ord(idx + 1)} section from the top`;
  return { html, pos };
}

/* "View on site": open the storefront page, then scroll to the exact slot and flash it */
const MISS = {
  C1: 'Slot C1 shows in the cart once it has items — add any product to see it',
  C2: 'Slot C2 shows on the order confirmation page — place a test order to see it',
};
let seekT = 0;
function goSlot(id, href) {
  const s = H.slotDef(id);
  if (!href) return;
  clearTimeout(seekT);
  TBB.go(href);
  if (!s) return;
  if (S.slotOn[id] === false) { seekT = setTimeout(() => TBB.toast(`Slot ${esc(id)} is paused — resume it in Ads Manager to show it here`, { icon: 'pause' }), 200); return; }
  let tries = 0;
  const seek = () => {
    if (id === 'S1' && !tries) { const q = document.getElementById('q'); if (q) q.focus(); }
    const el = document.querySelector(`#main [data-slot="${id}"], #hdr [data-slot="${id}"]`);
    if (el && el.getClientRects().length) {
      el.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
      el.classList.remove('slot-flash'); void el.offsetWidth; el.classList.add('slot-flash');
      seekT = setTimeout(() => el.classList.remove('slot-flash'), 1800);
      TBB.toast(`This is slot ${esc(id)} · ${esc(s.name)} — ${esc(H.rateText(s))}`, { icon: 'megaphone' });
      return;
    }
    if (++tries < 12) { seekT = setTimeout(seek, 150); return; }
    TBB.toast(MISS[id] || `Slot ${esc(id)} isn’t showing on this page right now`, { icon: 'info' });
  };
  seekT = setTimeout(seek, 180);
}
const viewLink = (id, label, aria) => { const s = H.slotDef(id), p = pg(s && s.page); return p.href ? `<a class="am-viewl" href="${p.href}" data-action="am-goslot" data-slot="${esc(id)}"${aria ? ` aria-label="${esc(aria)}"` : ''}>${label} ${icon('arrow')}</a>` : ''; };

/* ---------------- helpers ---------------- */
const sum = (a, f) => a.reduce((t, x) => t + (f ? f(x) : x), 0);
const L = n => {           // ₹ in lakh / crore, the way Indian founders read revenue
  n = Math.round(Number(n) || 0);
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + 'Cr';
  if (n >= 1e6) return '₹' + (n / 1e5).toFixed(1) + 'L';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + 'L';
  return fmt(n);
};
const pct = (x, d = 0) => (x * 100).toFixed(d) + '%';
const hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const parseD = s => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const dlabel = s => { const d = parseD(s); return d ? d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : (s ? esc(s) : '—'); };
const TODAY = new Date(2026, 10, 21);
/* compact flight for tables: "24–30 Nov", "20 Oct – 2 Nov" */
const drange = (s, e) => {
  const a = parseD(s), b = parseD(e); if (!a || !b) return `${dlabel(s)} → ${dlabel(e)}`;
  const m = d => d.toLocaleDateString('en-IN', { month: 'short' });
  return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${m(b)}` : `${a.getDate()} ${m(a)} – ${b.getDate()} ${m(b)}`;
};
const flightDays = c => { const a = parseD(c.start), b = parseD(c.end); return a && b ? Math.max(1, Math.round((b - a) / 864e5) + 1) : 0; };
const initials = n => String(n || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const AV = ['#ffe3ea', '#e9e4fb', '#e3f2ff', '#e3f6ee', '#fff1d6', '#f3e5f5'];
const gift = id => D.TBB_GIFTS.find(g => g.id === id);
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sw = (on, action, id, label) => `<button type="button" class="am-sw" role="switch" aria-checked="${on}" data-action="${action}" data-id="${esc(id)}" aria-label="${esc(label)}"><i></i></button>`;
const pill = (txt, key) => `<span class="am-pill am-pill-${key}"><i></i>${esc(txt)}</span>`;
const find = (...parts) => esc(parts.join(' ').toLowerCase());
const noResult = cols => `<tr class="am-noresult" hidden><td colspan="${cols}"></td></tr>`;

/* ---------------- demo numbers ---------------- */
const AD_MTD = sum(D.SLOTS, s => s.mtd);                 // booked ad revenue, 1–21 Nov
const AD_POT = sum(D.SLOTS, s => s.est);                 // full-occupancy potential / month
const AD_PROJ = Math.round(AD_MTD / 21 * 30);            // run-rate for November
const REV = [
  { m: 'Jun', full: 'June 2026',                 ad: 412000, sales: 2180000 },
  { m: 'Jul', full: 'July 2026',                 ad: 498000, sales: 2364000 },
  { m: 'Aug', full: 'August 2026',               ad: 615000, sales: 2512000 },
  { m: 'Sep', full: 'September 2026',            ad: 742000, sales: 2690000 },
  { m: 'Oct', full: 'October 2026',              ad: 886000, sales: 3120000 },
  { m: 'Nov', full: 'November 2026 · 1–21 Nov',  ad: AD_MTD, sales: 3380000, mtd: true },
];
const GIFT_META = {
  'tbb-vitc':  { chosen: .31, conv: .224, given: 712 },
  'tbb-onion': { chosen: .24, conv: .191, given: 548 },
  'tbb-aloe':  { chosen: .14, conv: .152, given: 318 },
  'tbb-rice':  { chosen: .12, conv: .168, given: 274 },
  'tbb-spf':   { chosen: .11, conv: .217, given: 251 },
  'tbb-lip':   { chosen: .08, conv: .123, given: 182 },
};
const NEXT = { New: 'Packed', Packed: 'Shipped', Shipped: 'Delivered' };
/* older orders shown below the live ones (demo history, not persisted) */
const HISTORY = [
  { id: 'TBB240866', name: 'Kavya Reddy',     city: 'Hyderabad',  items: 4, gifts: ['tbb-spf', 'tbb-vitc'],            amount: 1689, status: 'Shipped',   date: '19 Nov' },
  { id: 'TBB240865', name: 'Harpreet Singh',  city: 'Ludhiana',   items: 1, gifts: ['tbb-onion'],                     amount: 359,  status: 'Delivered', date: '19 Nov' },
  { id: 'TBB240864', name: 'Meera Joshi',     city: 'Ahmedabad',  items: 6, gifts: ['tbb-rice', 'tbb-aloe', 'tbb-lip'], amount: 2645, status: 'Delivered', date: '18 Nov' },
  { id: 'TBB240863', name: 'Siddharth Rao',   city: 'Bengaluru',  items: 2, gifts: ['tbb-vitc'],                      amount: 798,  status: 'Delivered', date: '18 Nov' },
  { id: 'TBB240862', name: 'Pooja Banerjee',  city: 'Kolkata',    items: 3, gifts: ['tbb-onion', 'tbb-rice'],          amount: 1134, status: 'Delivered', date: '18 Nov' },
  { id: 'TBB240861', name: 'Vikram Choudhary', city: 'Jaipur',    items: 2, gifts: ['tbb-spf'],                       amount: 648,  status: 'Delivered', date: '17 Nov' },
];
const statusKey = s => ({ New: 'new', Packed: 'packed', Shipped: 'shipped', Delivered: 'delivered', Cancelled: 'rejected' }[s] || 'ended');
const PAST = [   // display-only history
  { id: 'CMP-1031', brand: 'nivea', advertiser: 'Nivea India Pvt Ltd', slot: 'H3', headline: 'Winter Care Fest', start: '2026-10-20', end: '2026-10-31', budget: 24000, status: 'ended', impr: 412000, ctr: .021 },
  { id: 'CMP-1027', brand: 'lakme', advertiser: 'Lakmé (HUL)', slot: 'H5', headline: 'The 30-second office look', start: '2026-10-01', end: '2026-10-31', budget: 38000, status: 'ended', impr: 655000, ctr: .017 },
];
/* products featured in sample ad creatives / reels → slot ids */
const PROMO = (() => {
  const m = {};
  const add = (pid, slot) => { if (!pid) return; (m[pid] = m[pid] || new Set()).add(slot); };
  Object.entries(D.ADS).forEach(([slot, list]) => list.forEach(a => { add(a.product, slot); (a.products || []).forEach(p => add(p, slot)); }));
  D.REELS.forEach(r => add(r.product, 'H6'));
  return m;
})();
const STOCK_FIX = { 'lo-cond': 0, 'lo-found': 0, 'mama-onion-sh': 9, 'cet-moist': 14, 'bella-ceo': 22 };
const stockOf = p => (p.id in STOCK_FIX ? STOCK_FIX[p.id] : 60 + hash(p.id) % 440);

/* ---------------- module state ---------------- */
let amPage = 'all';         // Ads Manager page filter
let amOrd = 'all';          // Orders status filter
let amView = 'chart';       // revenue chart | table
let amQ = '';               // top-bar search
let amHint = null;          // last approved campaign id (success hint)
let amFlash = false;        // scroll hint into view once
let amDraft = null;         // gift tier rules draft
let amLastTab = null;
let ro = null, offs = [];

/* ================= shell ================= */
function shell(tab, body, sub) {
  const pend = S.campaigns.filter(c => c.status === 'pending').length;
  const fresh = S.orders.filter(o => o.fresh).length;
  let lastGroup = '';
  const nav = TABS.map(t => {
    const head = t.group !== lastGroup ? `<span class="am-nav-h">${t.group}</span>` : '';
    lastGroup = t.group;
    const badge = t.id === 'campaigns' && pend ? `<span class="am-badge" aria-label="${pend} pending">${pend}</span>`
      : t.id === 'orders' && fresh ? `<span class="am-badge am-badge-new" aria-label="${fresh} new">${fresh} new</span>` : '';
    const on = t.id === tab.id;
    return `${head}<a href="${tabHref(t)}" class="${on ? 'on' : ''}"${on ? ' aria-current="page"' : ''}>${ic(t.ic)}<span>${t.label}</span>${badge}</a>`;
  }).join('');
  return `<div class="am">
    <aside class="am-side">
      <div class="am-side-top">
        <a class="am-logo" href="#/admin" aria-label="The Big Brands admin home"><span class="logo-mark"><i>tbb</i></span><span class="am-logo-t"><b>thebigbrands<em>.co.in</em></b><small>Admin console</small></span></a>
        <a class="am-store am-store-m" href="#/" aria-label="View store">${ic('store')}<span>Store</span></a>
      </div>
      <nav class="am-nav" aria-label="Admin sections">${nav}</nav>
      <div class="am-app">
        <span class="am-app-ic">${ic('phone')}</span>
        <b>Admin app on Android &amp; iOS</b>
        <p>Approve campaigns, pause ad slots and track orders from your phone — same controls as here.</p>
        <div class="am-app-b"><span>Android</span><span>iOS</span></div>
      </div>
      <a class="am-store am-store-d" href="#/">${ic('store')}<span>View store</span>${ic('ext')}</a>
    </aside>
    <div class="am-main">
      <header class="am-top">
        <div class="am-top-t"><h1>${tab.id === 'dashboard' ? 'Good afternoon, Rahul' : esc(tab.label)}</h1><p>${sub}</p></div>
        <form class="am-search" id="am-search" role="search" autocomplete="off">${ic('search')}<input id="am-q" type="search" value="${esc(amQ)}" placeholder="Search orders, products, ad slots…" aria-label="Search the admin console"></form>
        <button type="button" class="am-bell" data-action="toast" data-icon="bell" data-msg="Push alerts for new orders, campaigns &amp; low gift stock — admin app" aria-label="Notifications">${ic('bell')}<i></i></button>
        <button type="button" class="am-me" data-action="toast" data-icon="user" data-msg="Team roles &amp; permissions — included in the full build"><span class="am-av">RB</span><span class="am-me-t"><b>Rahul Bansal</b><small>Owner</small></span></button>
      </header>
      <div class="am-body am-tab-${tab.id}">${body}</div>
    </div>
    <div class="am-tip" role="tooltip" hidden></div>
  </div>`;
}

/* ================= dashboard ================= */
function revSvg(w) {
  w = Math.max(300, Math.round(w || 760));
  const narrow = w < 520;
  const padL = narrow ? 42 : 54, padR = 6, padT = 26, padB = 30, plotH = narrow ? 200 : 262;
  const h = padT + plotH + padB, base = padT + plotH;
  const max = 5000000, ticks = [0, 1e6, 2e6, 3e6, 4e6, 5e6];
  const plotW = w - padL - padR, band = plotW / REV.length, bw = Math.min(24, band * 0.5);
  const y = v => +(base - v / max * plotH).toFixed(1);
  let g = ticks.map(t => `<line x1="${padL}" x2="${w - padR}" y1="${y(t)}" y2="${y(t)}" class="${t ? 'gl' : 'bl'}"/><text x="${padL - 10}" y="${y(t) + 4}" text-anchor="end" class="tk">${t ? '₹' + t / 1e5 + 'L' : '₹0'}</text>`).join('');
  g += REV.map((r, i) => {
    const bx = padL + band * i, cx = bx + band / 2, x = +(cx - bw / 2).toFixed(1);
    const adH = r.ad / max * plotH, sH = r.sales / max * plotH;
    const adY = +(base - adH).toFixed(1), sY = +(adY - 2 - sH).toFixed(1), sB = +(adY - 2).toFixed(1), rr = Math.min(4, sH);
    const total = r.ad + r.sales;
    const rows = `Total revenue|${L(total)}|;Ad revenue|${L(r.ad)}|a;Product sales|${L(r.sales)}|s;Ad share|${pct(r.ad / total, 1)}|`;
    return `<g class="am-col">
      <rect class="am-band" x="${bx.toFixed(1)}" y="${padT - 18}" width="${band.toFixed(1)}" height="${plotH + 18}" rx="8"/>
      <rect class="a" x="${x}" y="${adY}" width="${bw}" height="${adH.toFixed(1)}"/>
      <path class="s" d="M${x},${sB}V${(sY + rr).toFixed(1)}Q${x},${sY} ${(x + rr).toFixed(1)},${sY}H${(x + bw - rr).toFixed(1)}Q${(x + bw).toFixed(1)},${sY} ${(x + bw).toFixed(1)},${(sY + rr).toFixed(1)}V${sB}Z"/>
      <text x="${cx.toFixed(1)}" y="${(sY - 8).toFixed(1)}" text-anchor="middle" class="cap">${L(total)}</text>
      <text x="${cx.toFixed(1)}" y="${base + 20}" text-anchor="middle" class="xl${r.mtd ? ' now' : ''}">${r.m}${r.mtd ? (narrow ? '*' : ' · MTD') : ''}</text>
      <rect class="am-hit" x="${bx.toFixed(1)}" y="0" width="${band.toFixed(1)}" height="${h}" tabindex="0" role="img" aria-label="${esc(r.full)}: total ${L(total)}, ad revenue ${L(r.ad)}, product sales ${L(r.sales)}" data-am-tip="${esc(r.full)}" data-am-rows="${esc(rows)}"/>
    </g>`;
  }).join('');
  return `<svg class="am-rev-svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group" aria-label="Revenue by month, June to November 2026, split into ad revenue and product sales">${g}</svg>`;
}

function revTable() {
  return `<div class="am-tscroll"><table class="am-table am-table-sm"><thead><tr><th>Month</th><th class="r">Ad revenue</th><th class="r">Product sales</th><th class="r">Total revenue</th><th class="r">Ad share</th></tr></thead><tbody>
    ${REV.map(r => `<tr><td>${esc(r.full)}</td><td class="r num">${fmt(r.ad)}</td><td class="r num">${fmt(r.sales)}</td><td class="r num"><b>${fmt(r.ad + r.sales)}</b></td><td class="r num">${pct(r.ad / (r.ad + r.sales), 1)}</td></tr>`).join('')}
  </tbody></table></div>`;
}

function custCell(o) {
  return `<div class="am-cust"><span class="am-cav" style="background:${AV[hash(o.name) % AV.length]}">${esc(initials(o.name))}</span><span><b>${esc(o.name)}</b><small>${esc(o.city || '')}</small></span></div>`;
}
function giftChips(ids, { compact = false } = {}) {
  const gs = (ids || []).map(gift).filter(Boolean);
  if (!gs.length) return '<span class="muted">—</span>';
  return `<div class="am-gchips">${gs.map(g => `<span class="am-gchip" title="${esc(g.name)}"><span class="am-gchip-art" style="--tint:${g.c1}">${H.art(g)}</span>${esc(compact ? g.line : g.name)}</span>`).join('')}</div>`;
}

function vDashboard() {
  const cur = REV[REV.length - 1], prev = REV[REV.length - 2];
  const total = cur.ad + cur.sales, prevTotal = prev.ad + prev.sales;
  const pend = S.campaigns.filter(c => c.status === 'pending');
  const pendBudget = sum(pend, c => Number(c.budget) || 0);
  const todays = S.orders.filter(o => o.date === 'Today').length;
  const fresh = S.orders.filter(o => o.fresh).length;
  const ordersToday = 214 + todays;
  const projShare = AD_PROJ / AD_POT;
  const growth = cur.ad / REV[0].ad;

  /* ranked slots */
  const top = [...D.SLOTS].sort((a, b) => b.mtd - a.mtd).slice(0, 7);
  const topMax = top[0].mtd;

  /* needs attention */
  const att = [];
  if (pend.length) att.push({ ic: 'layers', tone: 'coral', t: `${pend.length} campaign${pend.length > 1 ? 's' : ''} awaiting approval`, s: `${fmt(pendBudget)} in bookings · ${esc(pend.map(c => H.brand(c.brand).name).join(', '))}`, href: '#/admin/campaigns', cta: 'Review' });
  if (fresh) att.push({ ic: 'box', tone: 'violet', t: `${fresh} new order${fresh > 1 ? 's' : ''} from the storefront`, s: 'Pack today to ship by tomorrow', href: '#/admin/orders', cta: 'Open' });
  D.TBB_GIFTS.filter(g => (S.giftStock[g.id] || 0) < 50).forEach(g => {
    const left = S.giftStock[g.id] || 0, perDay = (GIFT_META[g.id] || { given: 210 }).given / 21;
    att.push({ ic: 'alert', tone: 'crit', t: `${esc(g.line)} gift is running low`, s: `${left} minis left · about ${Math.max(1, Math.round(left / perDay))} days of orders`, href: '#/admin/gifts', cta: 'Restock' });
  });
  const unsold = [...D.SLOTS].filter(s => s.bookable).sort((a, b) => b.est * (1 - b.fill) - a.est * (1 - a.fill))[0];
  att.push({ ic: 'rupee', tone: 'gold', t: `${esc(unsold.name)} has unsold space`, s: `${fmt(unsold.est * (1 - unsold.fill))}/month still available to brands`, href: '#/advertise', cta: 'Rate card' });
  const paused = D.SLOTS.filter(s => S.slotOn[s.id] === false);
  if (paused.length) att.push({ ic: 'pause', tone: 'muted', t: `${paused.length} ad slot${paused.length > 1 ? 's' : ''} paused`, s: `${fmt(sum(paused, s => s.est))}/month of potential is switched off`, href: '#/admin/ads', cta: 'Manage' });

  const recent = S.orders.slice(0, 6);

  return `
  <section class="am-kpis" aria-label="Key numbers">
    <article class="am-kpi am-kpi-hero">
      <div class="am-kpi-l">Total revenue · November so far</div>
      <div class="am-hero-v">${L(total)}</div>
      <div class="am-delta"><b>${ic('up')}${pct(total / prevTotal - 1, 1)}</b><span>vs all of October, with 9 days still to go</span></div>
      <div class="am-seg" role="img" aria-label="Product sales ${L(cur.sales)} (${pct(cur.sales / total)}), ad revenue ${L(cur.ad)} (${pct(cur.ad / total)})"><i class="s" style="flex:${cur.sales}"></i><i class="a" style="flex:${cur.ad}"></i></div>
      <ul class="am-seg-lg"><li><i class="s"></i>Product sales <b>${L(cur.sales)}</b></li><li><i class="a"></i>Ad revenue <b>${L(cur.ad)}</b></li></ul>
    </article>
    <article class="am-kpi">
      <div class="am-kpi-l">Ad revenue this month</div>
      <div class="am-kpi-v">${L(AD_MTD)}</div>
      <div class="am-delta"><b>${ic('up')}${pct(cur.ad / prev.ad - 1)}</b><span>vs October</span></div>
      <div class="am-meter am-meter-pz" role="img" aria-label="Projected ${L(AD_PROJ)}, ${pct(projShare)} of ${L(AD_POT)} potential" style="--p:${projShare.toFixed(3)}"><i></i></div>
      <small class="am-kpi-s">On track for ${L(AD_PROJ)} · ${pct(projShare)} of ${L(AD_POT)} potential</small>
    </article>
    <article class="am-kpi">
      <div class="am-kpi-l">Orders today</div>
      <div class="am-kpi-v">${ordersToday}</div>
      <div class="am-delta"><b>${ic('up')}12%</b><span>vs last Saturday</span></div>
      <small class="am-kpi-s">${fresh ? `<span class="am-new">NEW</span> ${fresh} just placed on the storefront` : 'Avg. order value ₹742 · 1.6 gifts per order'}</small>
    </article>
    <article class="am-kpi">
      <div class="am-kpi-l">Gift → full-size conversion</div>
      <div class="am-kpi-v">18.6%</div>
      <div class="am-delta"><b>${ic('up')}2.4 pts</b><span>vs October</span></div>
      <small class="am-kpi-s">Tried a free TBB mini, then bought the full size</small>
    </article>
    <a class="am-kpi am-kpi-link" href="#/admin/campaigns">
      <div class="am-kpi-l">Pending campaigns</div>
      <div class="am-kpi-v">${pend.length}</div>
      ${pend.length ? `<div class="am-kpi-logos">${[...new Set(pend.map(c => c.brand))].slice(0, 3).map(b => `<span>${UI.brandLogo(b, { size: 12 })}</span>`).join('')}</div>` : ''}
      <small class="am-kpi-s">${pend.length ? `${fmt(pendBudget)} waiting for your approval` : 'All caught up'}</small>
      <span class="am-kpi-go">${pend.length ? 'Review now' : 'View campaigns'} ${icon('arrow')}</span>
    </a>
  </section>

  <div class="am-grid">
    <section class="blk am-card am-span8 am-rev" aria-labelledby="am-rev-h">
      <header class="am-card-h">
        <div><h2 id="am-rev-h">Revenue, last 6 months</h2><p class="am-insight">Ad revenue is up <b>${growth.toFixed(1)}×</b> since June and November has already beaten October.</p></div>
        <div class="am-segctl" role="group" aria-label="Show revenue as">
          <button type="button" data-action="am-view" data-v="chart" aria-pressed="${amView === 'chart'}">${icon('chart')}Chart</button>
          <button type="button" data-action="am-view" data-v="table" aria-pressed="${amView === 'table'}">${ic('table')}Table</button>
        </div>
      </header>
      <ul class="am-legend"${amView === 'table' ? ' hidden' : ''} aria-label="Legend"><li><i class="a"></i>Ad revenue</li><li><i class="s"></i>Product sales</li><li class="am-legend-note">Column label = total revenue</li></ul>
      ${amView === 'chart' ? `<div class="am-chart-box" id="am-rev">${revSvg(760)}</div>` : revTable()}
      <dl class="am-rev-foot">
        <div><dt>Ad share of revenue</dt><dd>${pct(REV[0].ad / (REV[0].ad + REV[0].sales), 1)} <span>→</span> ${pct(cur.ad / total, 1)}</dd><small>June → November</small></div>
        <div><dt>Ad revenue growth</dt><dd>+${pct(Math.pow(cur.ad / REV[0].ad, 1 / 5) - 1)}</dd><small>a month, on average</small></div>
        <div><dt>November projection</dt><dd>${L(total / 21 * 30)}</dd><small>at the current daily run-rate</small></div>
      </dl>
    </section>

    <section class="blk am-card am-span4" aria-labelledby="am-top-h">
      <header class="am-card-h"><div><h2 id="am-top-h">Top ad slots</h2><p>Booked revenue, 1–21 Nov</p></div><a class="link" href="#/admin/ads">Ads Manager ${icon('chevRight')}</a></header>
      <ol class="am-rank">
        ${top.map(s => `<li tabindex="0" data-am-tip="${esc(s.id + ' · ' + s.name)}" data-am-rows="${esc(`Booked this month|${fmt(s.mtd)}|a;Fill rate|${pct(s.fill)}|;Rate|${H.rateText(s)}|;Lives on|${pg(s.page).name}|`)}" aria-label="${esc(s.id + ' ' + s.name + ': ' + fmt(s.mtd) + ' booked this month')}">
          <span class="am-rank-n"><b class="am-sid">${s.id}</b>${esc(s.name)}${S.slotOn[s.id] === false ? ' <em class="am-paused-t">Paused</em>' : ''}</span>
          <span class="am-rank-bar"><i style="--p:${(s.mtd / topMax).toFixed(3)}"></i><em>${L(s.mtd)}</em></span>
        </li>`).join('')}
      </ol>
      <p class="am-card-foot">${D.SLOTS.length} slots booked <b>${L(AD_MTD)}</b> so far this month</p>
    </section>

    <section class="blk am-card am-span8" aria-labelledby="am-ro-h">
      <header class="am-card-h"><div><h2 id="am-ro-h">Recent orders</h2><p>Every order ships with the free TBB gifts the customer picked</p></div><a class="link" href="#/admin/orders">All orders ${icon('chevRight')}</a></header>
      <div class="am-tscroll am-tstack"><table class="am-table am-table-sm am-stack am-stack-ord">
        <thead><tr><th>Order</th><th>Customer</th><th>Free gifts chosen</th><th class="r">Amount</th><th>Status</th></tr></thead>
        <tbody>${recent.map(o => `<tr class="${o.fresh ? 'is-fresh' : ''}" data-am-find="${find(o.id, o.name, o.city, o.status)}">
          <td class="nowrap am-x-id"><b class="am-oid">${esc(o.id)}</b>${o.fresh ? ' <span class="am-new">NEW</span>' : ''}<small class="am-sub">${esc(o.date)}</small></td>
          <td class="am-x-cust">${custCell(o)}</td><td class="am-x-gift">${giftChips(o.gifts, { compact: true })}</td>
          <td class="r num am-x-amt"><b>${fmt(o.amount)}</b></td><td class="am-x-st">${pill(o.status, statusKey(o.status))}</td></tr>`).join('')}${noResult(5)}</tbody>
      </table></div>
    </section>

    <section class="blk am-card am-span4 am-att-card" aria-labelledby="am-att-h">
      <header class="am-card-h"><div><h2 id="am-att-h">Needs your attention</h2><p>${att.length} item${att.length > 1 ? 's' : ''}</p></div></header>
      <ul class="am-att">${att.map(a => `<li class="am-att-${a.tone}"><span class="am-att-ic">${ic(a.ic)}</span><span class="am-att-t"><b>${a.t}</b><small>${a.s}</small></span><a class="btn btn-ghost btn-sm" href="${a.href}">${a.cta}</a></li>`).join('')}</ul>
    </section>
  </div>`;
}

/* ================= ads manager ================= */
function vAds() {
  const all = D.SLOTS;
  const counts = all.reduce((m, s) => (m[s.page] = (m[s.page] || 0) + 1, m), {});
  const rows = all.filter(s => amPage === 'all' || s.page === amPage);
  const liveN = all.filter(s => S.slotOn[s.id] !== false).length;
  const wFill = sum(all, s => s.fill * s.est) / AD_POT;
  const unsold = sum(all, s => s.est * (1 - s.fill));
  const camps = S.campaigns.filter(c => c.status === 'live');
  const chip = (id, label, n) => `<button type="button" class="chip${amPage === id ? ' on' : ''}" data-action="am-page" data-page="${id}" aria-pressed="${amPage === id}">${label}<span class="am-chip-n">${n}</span></button>`;
  const tMtd = sum(rows, s => s.mtd), tEst = sum(rows, s => s.est), tFill = tEst ? sum(rows, s => s.fill * s.est) / tEst : 0;
  const tLive = rows.filter(s => S.slotOn[s.id] !== false).length;

  return `
  <section class="am-stats" aria-label="Ad inventory summary">
    <div class="am-stat"><small>Booked this month</small><b>${L(AD_MTD)}</b><span>1–21 Nov, all ${all.length} slots</span></div>
    <div class="am-stat"><small>Monthly potential</small><b>${L(AD_POT)}</b><span>at full occupancy, ~1 lakh visits/month</span></div>
    <div class="am-stat"><small>Fill rate</small><b>${pct(wFill)}</b><div class="am-meter" style="--p:${wFill.toFixed(3)}" role="img" aria-label="Fill rate ${pct(wFill)}"><i></i></div></div>
    <div class="am-stat am-stat-cta"><small>Unsold inventory</small><b>${L(unsold)}<em>/mo</em></b><a class="link" href="#/advertise">Share rate card with brands ${icon('arrow')}</a></div>
  </section>

  <section class="blk am-card" aria-labelledby="am-inv-h">
    <header class="am-card-h">
      <div><h2 id="am-inv-h">Ad inventory</h2><p>Pause a slot and it disappears from the website &amp; app instantly. <b>${liveN} of ${all.length}</b> slots are live.</p></div>
      <button type="button" class="btn btn-ghost btn-sm" data-action="toast" data-icon="download" data-msg="Monthly ad revenue report (CSV / PDF) — included in the full build">${ic('download')}Export</button>
    </header>
    <div class="am-chips" role="group" aria-label="Filter by page">
      ${chip('all', 'All pages', all.length)}${Object.keys(PAGES).filter(p => counts[p]).map(p => chip(p, PAGES[p].name, counts[p])).join('')}
    </div>
    <div class="am-tscroll am-tstack"><table class="am-table am-slots am-stack am-stack-slots">
      <thead><tr><th>Slot</th><th>Page · size</th><th class="r">Rate</th><th>Fill</th><th class="r">Booked MTD</th><th class="r">Potential / mo</th><th>Status</th><th><span class="sr-only">Open on site</span></th></tr></thead>
      <tbody>${rows.map(s => {
        const on = S.slotOn[s.id] !== false, p = pg(s.page);
        const live = camps.filter(c => c.slot === s.id);
        return `<tr class="${on ? '' : 'is-off'}" data-am-find="${find(s.id, s.name, s.format, p.name, s.size)}">
          <td class="am-x-slot"><div class="am-slotn"><b class="am-sid">${s.id}</b><span><strong>${esc(s.name)}</strong><small>${esc(s.format)}</small>${live.length ? `<small class="am-slot-camp">${ic('megaphone')}${esc(live.map(c => H.brand(c.brand).name).join(', '))} campaign live</small>` : ''}</span></div></td>
          <td class="nowrap am-x-pg"><span class="am-pg">${esc(p.name)}</span><span class="am-size">${esc(s.size)}</span></td>
          <td class="r nowrap num am-x-rate" data-l="Rate">${H.rateText(s)}</td>
          <td class="am-x-fill" data-l="Fill rate"><div class="am-fill"><div class="am-meter" style="--p:${s.fill}"><i></i></div><span class="num">${pct(s.fill)}</span></div></td>
          <td class="r num am-x-mtd" data-l="Booked this month"><b>${fmt(s.mtd)}</b></td>
          <td class="r num am-muted am-x-est">${fmt(s.est)}</td>
          <td class="am-x-st"><div class="am-st">${sw(on, 'am-slot', s.id, `${s.id} ${s.name}: ${on ? 'live, press to pause' : 'paused, press to resume'}`)}<span class="${on ? 'on' : ''}">${on ? 'Live' : 'Paused'}</span></div></td>
          <td class="am-x-view">${p.href ? viewLink(s.id, 'View', `View ${s.name} on the ${p.name}`) : '<span class="am-muted am-viewl-x" title="Printed insert in every delivery box">In box</span>'}</td>
        </tr>`;
      }).join('')}${noResult(8)}</tbody>
      <tfoot><tr><td class="am-x-tot">Total · ${rows.length} slot${rows.length > 1 ? 's' : ''}</td><td></td><td></td><td class="am-x-tfill"><div class="am-fill"><div class="am-meter" style="--p:${tFill.toFixed(3)}"><i></i></div><span class="num">${pct(tFill)}</span></div></td><td class="r num" data-l="Booked">${fmt(tMtd)}</td><td class="r num" data-l="Potential">${fmt(tEst)}</td><td data-l="Status">${tLive} live</td><td></td></tr></tfoot>
    </table></div>
  </section>`;
}

/* ================= campaigns ================= */
/* wide, short placements (leaderboards, search / thank-you banners) preview as a strip */
const isStrip = s => { if (!s) return false; const m = /(\d+)×(\d+)/.exec(s.size); return m ? m[1] / m[2] >= 5 : /banner/i.test(s.size); };
function creative(c) {
  const col = /^#[0-9a-f]{3,6}$/i.test(c.color || '') ? c.color : (H.brand(c.brand).color || '#333333');
  const dark = H.lum(col) < 0.6;
  const fg = dark ? '#ffffff' : '#151515';
  const bg = `linear-gradient(120deg, ${H.shade(col, -0.35)}, ${col} 60%, ${H.shade(col, 0.25)})`;
  const p = D.PRODUCTS.find(x => x.brand === c.brand);
  return `<div class="am-cre${isStrip(H.slotDef(c.slot)) ? ' is-strip' : ''}" style="background:${bg};color:${fg}">
    <div class="am-cre-tx">
      <div class="am-cre-top">${UI.brandLogo(c.brand, { size: 15, color: fg })}${UI.adBadge()}</div>
      <b class="am-cre-h">${esc(c.headline || 'Untitled campaign')}</b>
      ${c.sub ? `<span class="am-cre-s">${esc(c.sub)}</span>` : ''}
      <span class="am-cre-cta" style="background:${dark ? '#ffffff' : '#151515'};color:${dark ? H.shade(col, -0.2) : '#ffffff'}">${esc(c.cta || 'Shop now')} ${icon('arrow')}</span>
    </div>
    ${p ? `<div class="am-cre-art">${H.art(p)}</div>` : `<div class="am-cre-mono" style="border-color:${fg}">${esc(initials(H.brand(c.brand).name))}</div>`}
  </div>`;
}

function vCampaigns() {
  const pend = S.campaigns.filter(c => c.status === 'pending');
  const live = S.campaigns.filter(c => c.status === 'live');
  const past = [...S.campaigns.filter(c => c.status !== 'pending' && c.status !== 'live'), ...PAST];
  const hc = amHint && S.campaigns.find(c => c.id === amHint && c.status === 'live');
  const slotLine = c => { const s = H.slotDef(c.slot); return s ? `<span class="am-slotc"><b class="am-sid">${s.id}</b><span>${esc(s.name)}<small>${esc(pg(s.page).name)}</small></span></span>` : esc(c.slot || '—'); };

  const hint = hc ? (() => {
    const s = H.slotDef(hc.slot) || { id: hc.slot, name: '', page: '' }, p = pg(s.page);
    const paused = S.slotOn[s.id] === false;
    return `<div class="am-hint" role="status">
      <span class="am-hint-ic">${icon('check')}</span>
      <div class="am-hint-t"><b>${paused ? `Approved for slot ${esc(s.id)} — resume the slot to show it` : `Now live in slot ${esc(s.id)} on the ${esc(p.name)}`}</b><span>${esc(H.brand(hc.brand).name)} · “${esc(hc.headline || '')}” is showing in ${esc(s.name)} for shoppers on the website &amp; app. ${hc.budget ? fmt(hc.budget) + ' added to booked ad revenue.' : ''}</span></div>
      ${p.href ? `<a class="btn btn-sm btn-light" href="${p.href}" data-action="am-goslot" data-slot="${esc(s.id)}">View on site ${icon('arrow')}</a>` : ''}
      <button type="button" class="ib-sm" data-action="am-hint-x" aria-label="Dismiss">${icon('close')}</button>
    </div>`;
  })() : '';

  const card = c => {
    const s = H.slotDef(c.slot), days = flightDays(c), budget = Number(c.budget) || 0;
    const perDay = days ? budget / days : 0;
    const map = placeMap(c.slot);
    return `<article class="blk am-camp" data-am-find="${find(c.id, c.advertiser, H.brand(c.brand).name, c.headline, c.slot)}">
      <div class="am-camp-prev">
        <small class="am-prev-l">${ic('eye')}Shopper preview${s ? ` · ${esc(s.size)}` : ''}</small>
        ${creative(c)}
        ${s ? `<div class="am-where">${map ? map.html : ''}<div class="am-where-t"><small>Where it runs</small><b><span class="am-sid">${esc(s.id)}</span>${esc(s.name)}</b><span>${esc(pg(s.page).name)} · ${esc(map ? map.pos : s.format)}</span><span>${esc(s.format)} · ${esc(H.rateText(s))}</span></div></div>` : ''}
      </div>
      <div class="am-camp-info">
        <div class="am-camp-meta">${pill('Awaiting approval', 'pending')}<span>${esc(c.id)} · submitted ${esc(c.created || 'today')}</span></div>
        <h3>${esc(c.advertiser || H.brand(c.brand).name)}</h3>
        <dl class="am-dl">
          <div><dt>Ad slot</dt><dd>${slotLine(c)}</dd></div>
          <div><dt>Dates</dt><dd>${dlabel(c.start)} → ${dlabel(c.end)}${days ? ` <small>· ${days} day${days > 1 ? 's' : ''}</small>` : ''}</dd></div>
          <div><dt>Budget</dt><dd><b>${fmt(budget)}</b>${perDay ? ` <small>· ${fmt(perDay)}/day</small>` : ''}</dd></div>
          <div><dt>Est. reach</dt><dd>~${H.kfmt(Math.round(budget / 0.065))} impressions</dd></div>
        </dl>
        <ul class="am-checks"><li>${icon('check')}Creative fits ${s && /\d/.test(s.size) ? esc(s.size) : 'the slot format'}</li>${S.slotOn[c.slot] === false ? `<li class="am-warn">${ic('alert')}Slot ${esc(c.slot)} is paused — <a href="#/admin/ads">resume it</a> to show this ad</li>` : `<li>${icon('check')}Slot free on these dates</li>`}<li>${icon('check')}Brand verified</li></ul>
        <div class="am-camp-act">
          <button type="button" class="btn btn-cart" data-action="am-approve" data-id="${esc(c.id)}">${icon('check')}Approve &amp; go live</button>
          <button type="button" class="btn btn-ghost" data-action="am-reject" data-id="${esc(c.id)}">Reject</button>
        </div>
      </div>
    </article>`;
  };

  const liveRow = c => {
    const days = flightDays(c), a = parseD(c.start);
    const el = a ? Math.min(days, Math.max(0, Math.round((TODAY - a) / 864e5) + 1)) : 0;
    const prog = days ? el / days : 0;
    const budget = Number(c.budget) || 0;
    const impr = Math.round(budget * prog / 0.065), ctr = 0.012 + (hash(c.id) % 14) / 1000;
    return `<tr data-am-find="${find(c.id, c.advertiser, H.brand(c.brand).name, c.headline, c.slot)}">
      <td class="am-x-camp"><div class="am-cname"><span class="am-cname-l">${UI.brandLogo(c.brand, { size: 13 })}</span><span><b>${esc(c.headline || '—')}</b><small>${esc(c.advertiser || '')} · ${esc(c.id)}</small></span></div></td>
      <td class="am-x-slot">${slotLine(c)}</td>
      <td class="nowrap am-x-dates" data-l="Dates" title="${esc(dlabel(c.start) + ' → ' + dlabel(c.end))}">${drange(c.start, c.end)}${days ? `<small class="am-sub">${days} day${days === 1 ? '' : 's'}</small>` : ''}</td>
      <td class="r num am-x-bud" data-l="Budget"><b>${fmt(budget)}</b></td>
      <td class="am-x-del" data-l="Delivery"><div class="am-fill"><div class="am-meter" style="--p:${Math.max(prog, 0.02).toFixed(3)}"><i></i></div><span class="num">${prog ? `Day ${el}/${days}` : 'Just went live'}</span></div></td>
      <td class="r num nowrap am-x-res" data-l="Results">${impr ? `<b>${H.kfmt(impr)}</b> impr.<small class="am-sub">${pct(ctr, 1)} CTR</small>` : '<span class="am-muted">First stats<small class="am-sub">in ~1 hour</small></span>'}</td>
      <td class="am-x-view">${viewLink(c.slot, 'View on site')}</td>
    </tr>`;
  };

  return `
  <section class="am-stats" aria-label="Campaign summary">
    <div class="am-stat"><small>Awaiting approval</small><b>${pend.length}</b><span>${fmt(sum(pend, c => Number(c.budget) || 0))} in bookings</span></div>
    <div class="am-stat"><small>Live now</small><b>${live.length}</b><span>${fmt(sum(live, c => Number(c.budget) || 0))} booked</span></div>
    <div class="am-stat"><small>Self-serve bookings · Nov</small><b>${L(318000 + sum(live, c => Number(c.budget) || 0))}</b><span>brands booking from the Advertise page</span></div>
    <div class="am-stat am-stat-cta"><small>Average approval time</small><b>3h 20m</b><a class="link" href="#/advertise">See what advertisers see ${icon('arrow')}</a></div>
  </section>
  ${hint}
  <section aria-labelledby="am-q-h" class="am-sec">
    <div class="am-sec-h"><h2 id="am-q-h">Approval queue</h2><span class="am-count">${pend.length}</span><p>Brands booked these slots from the Advertise page. Approve to put the creative live in its slot instantly.</p></div>
    ${pend.length ? `<div class="am-camps">${pend.map(card).join('')}</div>` : `<div class="blk am-empty">${icon('check')}<b>All caught up</b><p>No campaigns are waiting. New bookings from the <a class="link" href="#/advertise">Advertise page</a> land here for approval.</p></div>`}
  </section>
  <section class="blk am-card" aria-labelledby="am-live-h">
    <header class="am-card-h"><div><h2 id="am-live-h">Live campaigns</h2><p>Running in their slots on the website &amp; app right now</p></div></header>
    ${live.length ? `<div class="am-tscroll am-tstack"><table class="am-table am-stack am-stack-live">
      <thead><tr><th>Campaign</th><th>Ad slot</th><th>Dates</th><th class="r">Budget</th><th>Delivery</th><th class="r">Results</th><th><span class="sr-only">Open on site</span></th></tr></thead>
      <tbody>${live.map(liveRow).join('')}${noResult(7)}</tbody></table></div>` : '<p class="am-muted am-pad">No live campaigns yet — approve one from the queue above.</p>'}
  </section>
  <section class="blk am-card" aria-labelledby="am-past-h">
    <header class="am-card-h"><div><h2 id="am-past-h">Past &amp; rejected</h2><p>History of finished and declined bookings</p></div></header>
    <div class="am-tscroll am-tstack"><table class="am-table am-table-sm am-stack am-stack-past">
      <thead><tr><th>Campaign</th><th>Ad slot</th><th>Dates</th><th class="r">Budget</th><th class="r">Results</th><th>Status</th></tr></thead>
      <tbody>${past.map(c => `<tr data-am-find="${find(c.id, c.advertiser, H.brand(c.brand).name, c.headline, c.slot)}">
        <td class="am-x-camp"><div class="am-cname"><span class="am-cname-l">${UI.brandLogo(c.brand, { size: 13 })}</span><span><b>${esc(c.headline || '—')}</b><small>${esc(c.advertiser || '')} · ${esc(c.id)}</small></span></div></td>
        <td class="am-x-slot">${slotLine(c)}</td><td class="nowrap am-x-dates" data-l="Dates" title="${esc(dlabel(c.start) + ' → ' + dlabel(c.end))}">${drange(c.start, c.end)}</td>
        <td class="r num am-x-bud" data-l="Budget">${fmt(c.budget)}</td>
        <td class="r num am-x-res" data-l="Results">${c.impr ? `${H.kfmt(c.impr)} impr. · ${pct(c.ctr, 1)} CTR` : '<span class="am-muted">—</span>'}</td>
        <td class="am-x-st">${c.status === 'rejected' ? pill('Rejected', 'rejected') : pill('Ended', 'ended')}</td></tr>`).join('')}${noResult(6)}</tbody>
    </table></div>
  </section>`;
}

/* ================= orders ================= */
function vOrders() {
  const all = [...S.orders, ...HISTORY.filter(h => !S.orders.some(o => o.id === h.id))];
  const n = st => all.filter(o => o.status === st).length;
  const rows = all.filter(o => amOrd === 'all' || o.status === amOrd);
  const ordersToday = 214 + all.filter(o => o.date === 'Today').length;
  const chip = (id, label, c) => `<button type="button" class="chip${amOrd === id ? ' on' : ''}" data-action="am-ord" data-st="${id}" aria-pressed="${amOrd === id}">${label}<span class="am-chip-n">${c}</span></button>`;
  return `
  <section class="am-stats" aria-label="Order summary">
    <div class="am-stat"><small>Orders today</small><b>${ordersToday}</b><span>${ic('up', 'am-up')} 12% vs last Saturday</span></div>
    <div class="am-stat"><small>Awaiting dispatch</small><b>${n('New') + n('Packed') + 38}</b><span>Ship-by cut-off 6:00 pm today</span></div>
    <div class="am-stat"><small>Free gifts packed today</small><b>${Math.round(ordersToday * 1.6)}</b><span>1.6 TBB minis per order</span></div>
    <div class="am-stat"><small>Average order value</small><b>₹742</b><span>${ic('up', 'am-up')} ₹96 since tier rules launched</span></div>
  </section>
  <section class="blk am-card" aria-labelledby="am-ord-h">
    <header class="am-card-h"><div><h2 id="am-ord-h">Orders</h2><p>Orders placed on the website appear here instantly, with the free gifts the customer chose before paying.</p></div>
      <button type="button" class="btn btn-ghost btn-sm" data-action="toast" data-icon="truck" data-msg="Bulk shipping labels via Shiprocket — included in the full build">${icon('truck')}Print labels</button></header>
    <div class="am-chips" role="group" aria-label="Filter by status">
      ${chip('all', 'All', all.length)}${['New', 'Packed', 'Shipped', 'Delivered'].map(s => chip(s, s, n(s))).join('')}
    </div>
    <div class="am-tscroll am-tstack"><table class="am-table am-orders am-stack am-stack-ord">
      <thead><tr><th>Order</th><th>Customer</th><th class="r">Items</th><th>Free gifts chosen</th><th class="r">Amount</th><th>Status</th><th><span class="sr-only">Next step</span></th></tr></thead>
      <tbody>${rows.length ? rows.map(o => { const n = Number(o.items) || 0; return `<tr class="${o.fresh ? 'is-fresh' : ''}" data-am-find="${find(o.id, o.name, o.city, o.status, ...(o.gifts || []).map(g => (gift(g) || {}).name || ''))}">
        <td class="nowrap am-x-id"><b class="am-oid">${esc(o.id)}</b>${o.fresh ? ' <span class="am-new">NEW</span>' : ''}<small class="am-sub">${esc(o.date)}${o.fresh ? ' · from the storefront' : ''}<span class="am-m"> · ${n} item${n === 1 ? '' : 's'}</span></small></td>
        <td class="am-x-cust">${custCell(o)}</td>
        <td class="r num am-x-items">${n}</td>
        <td class="am-x-gift">${giftChips(o.gifts)}</td>
        <td class="r num am-x-amt"><b>${fmt(o.amount)}</b></td>
        <td class="am-x-st">${pill(o.status, statusKey(o.status))}</td>
        <td class="r am-x-act${NEXT[o.status] ? '' : ' am-x-done'}">${NEXT[o.status] ? `<button type="button" class="btn btn-ghost btn-sm" data-action="am-order" data-id="${esc(o.id)}">Mark ${NEXT[o.status].toLowerCase()}</button>` : `<span class="am-done">${icon('check')}Done</span>`}</td>
      </tr>`; }).join('') : `<tr><td colspan="7" class="am-pad am-muted am-x-full">No ${esc(amOrd.toLowerCase())} orders right now.</td></tr>`}${noResult(7)}</tbody>
    </table></div>
  </section>`;
}

/* ================= free gifts ================= */
const sortTiers = t => [...t].map(x => ({ min: Math.max(0, Math.round(Number(x.min) || 0)), count: Math.max(1, Math.min(5, Math.round(Number(x.count) || 1))) })).sort((a, b) => a.min - b.min);
const tiersDirty = () => amDraft && JSON.stringify(amDraft) !== JSON.stringify(sortTiers(S.tiers));
function tierPreview(t) {
  return t.map((x, i) => `<li><span>${i === 0 && !x.min ? 'Every order' : `Orders ${fmt(x.min)}+`}</span>${icon('arrow')}<b>${x.count} free gift${x.count > 1 ? 's' : ''}</b></li>`).join('');
}

function vGifts() {
  if (!amDraft) amDraft = sortTiers(S.tiers);
  const activeN = D.TBB_GIFTS.filter(g => S.giftOn[g.id] !== false).length;
  const given = sum(Object.values(GIFT_META), m => m.given);
  const dirty = tiersDirty();
  return `
  <section class="am-gift-hero">
    <div class="am-gift-hero-t">
      <span class="am-eyebrow">${icon('gift')}Your brand-promotion engine</span>
      <h2>Every order ships with a free TBB Originals mini — chosen by the customer before payment.</h2>
      <p>Customers try your own label alongside the big brands. ${pct(0.186, 1)} of them come back and buy the full size.</p>
    </div>
    <div class="am-funnel" aria-label="Gift funnel this month">
      <div><small>Gifts given · Nov</small><b>${given.toLocaleString('en-IN')}</b></div>
      <span class="am-funnel-ar">${icon('arrow')}</span>
      <div><small>Bought full size</small><b>${Math.round(given * 0.186).toLocaleString('en-IN')}</b></div>
      <span class="am-funnel-ar">${icon('arrow')}</span>
      <div><small>Full-size revenue</small><b>${L(Math.round(given * 0.186) * 318)}</b></div>
    </div>
  </section>

  <section class="am-sec" aria-labelledby="am-gi-h">
    <div class="am-sec-h"><h2 id="am-gi-h">Gift inventory</h2><span class="am-count">${activeN} of ${D.TBB_GIFTS.length} shown at checkout</span><p>Switch a gift off and it disappears from checkout on the website &amp; app.</p></div>
    <div class="am-gifts">${D.TBB_GIFTS.map(g => {
      const on = S.giftOn[g.id] !== false, stock = S.giftStock[g.id] || 0, low = stock < 50, m = GIFT_META[g.id] || { chosen: 0, conv: 0, given: 0 };
      return `<article class="blk am-gift${on ? '' : ' is-off'}${low ? ' is-low' : ''}" data-am-find="${find(g.name, g.line, g.id)}">
        <div class="am-gift-art" style="--tint:${g.c1}">${H.art(g)}</div>
        <div class="am-gift-b">
          <div class="am-gift-top"><div><b>${esc(g.name)}</b><small>${esc(g.mini)} · worth ${fmt(g.worth)}</small></div>${sw(on, 'am-gift', g.id, `${g.name}: ${on ? 'shown at checkout, press to hide' : 'hidden, press to show at checkout'}`)}</div>
          <div class="am-stock"><div class="am-stock-n"><b class="num">${stock}</b> minis in stock ${low ? `<span class="am-low">${ic('alert')}Low stock</span>` : `<span class="am-ok">${icon('check')}In stock</span>`}</div>
            <div class="am-meter am-meter-stock${low ? ' crit' : ''}" style="--p:${Math.min(1, stock / 700).toFixed(3)}"><i></i></div></div>
          <ul class="am-gift-m"><li><b>${pct(m.chosen)}</b><span>pick this gift</span></li><li><b>${pct(m.conv, 1)}</b><span>buy full size</span></li><li><b>${fmt(g.price)}</b><span>full size</span></li></ul>
          ${low ? `<button type="button" class="btn btn-sm btn-dark am-restock" data-action="am-restock" data-id="${g.id}">${ic('refresh')}Restock +500 minis</button>` : ''}
        </div>
      </article>`;
    }).join('')}</div>
  </section>

  <section class="blk am-card am-tiers-card" aria-labelledby="am-ti-h">
    <header class="am-card-h"><div><h2 id="am-ti-h">Gift tier rules</h2><p>How many free gifts a customer can choose, by cart value. Bigger carts, more gifts — it lifts average order value.</p></div>
      <span class="am-tier-state${dirty ? ' dirty' : ''}" id="am-tier-state">${dirty ? 'Unpublished changes' : `${icon('check')}Live on website &amp; app`}</span></header>
    <div class="am-tiers-grid">
      <div>
        <div class="am-tiers" role="list">${amDraft.map((t, i) => `<div class="am-tier" role="listitem">
          <span class="am-tier-n">${i + 1}</span>
          <label class="am-tier-f"><span>${i === 0 ? 'Applies to' : 'Cart value from'}</span>${i === 0 ? '<b class="am-tier-all">Every order (₹0+)</b>' : `<span class="am-rs"><i>₹</i><input class="am-tier-in" type="number" inputmode="numeric" min="1" step="50" value="${t.min}" data-i="${i}" aria-label="Tier ${i + 1} starts at cart value in rupees"></span>`}</label>
          <span class="am-tier-ar">${icon('arrow')}</span>
          <div class="am-tier-f am-tier-c"><span>Free gifts</span><div class="am-step" role="group" aria-label="Tier ${i + 1} free gifts">
            <button type="button" data-action="am-tier-step" data-i="${i}" data-d="-1" aria-label="One gift fewer"${t.count <= 1 ? ' disabled' : ''}>${icon('minus')}</button>
            <output aria-live="polite">${t.count}</output>
            <button type="button" data-action="am-tier-step" data-i="${i}" data-d="1" aria-label="One gift more"${t.count >= 5 ? ' disabled' : ''}>${icon('plus')}</button></div></div>
          ${i === 0 ? '<span class="am-tier-x" aria-hidden="true"></span>' : `<button type="button" class="ib-sm am-tier-x" data-action="am-tier-del" data-i="${i}" aria-label="Remove tier ${i + 1}">${icon('trash')}</button>`}
        </div>`).join('')}</div>
        <div class="am-tier-act">
          <button type="button" class="btn btn-ghost btn-sm" data-action="am-tier-add"${amDraft.length >= 5 ? ' disabled' : ''}>${icon('plus')}Add tier</button>
          ${dirty ? `<button type="button" class="btn btn-ghost btn-sm" data-action="am-tier-reset">Discard changes</button>` : ''}
        </div>
      </div>
      <aside class="am-tier-prev">
        <small>What shoppers see at checkout</small>
        <ul id="am-tier-prev">${tierPreview(sortTiers(amDraft))}</ul>
        <p class="am-tier-err" id="am-tier-err" role="alert" hidden></p>
        <button type="button" class="btn btn-cart btn-lg" data-action="am-tier-pub">${icon('upload')}Publish to website &amp; app</button>
        <p>Goes live for every shopper within a minute — no app update needed.</p>
      </aside>
    </div>
  </section>`;
}

/* ================= products ================= */
function vProducts() {
  const list = D.PRODUCTS.slice(0, 20);
  const low = D.PRODUCTS.filter(p => { const s = stockOf(p); return s > 0 && s < 25; }).length;
  const out = D.PRODUCTS.filter(p => stockOf(p) === 0).length;
  const promoted = list.filter(p => PROMO[p.id]).length;
  return `
  <section class="am-stats" aria-label="Catalogue summary">
    <div class="am-stat"><small>Live listings</small><b>${D.PRODUCTS.length}</b><span>${D.BRANDS.length} brands incl. TBB Originals</span></div>
    <div class="am-stat"><small>Promoted by ads</small><b>${Object.keys(PROMO).length}</b><span>products featured in paid placements</span></div>
    <div class="am-stat"><small>Low stock</small><b>${low}</b><span>under 25 units</span></div>
    <div class="am-stat"><small>Out of stock</small><b>${out}</b><span>hidden from search automatically</span></div>
  </section>
  <section class="blk am-card" aria-labelledby="am-pr-h">
    <header class="am-card-h"><div><h2 id="am-pr-h">Products</h2><p>Showing ${list.length} of ${D.PRODUCTS.length} · ${promoted} on this page are featured in ad placements</p></div>
      <div class="am-hbtns"><button type="button" class="btn btn-ghost btn-sm" data-action="toast" data-icon="upload" data-msg="Bulk catalogue upload via CSV / brand feed — included in the full build">${icon('upload')}Bulk upload</button><button type="button" class="btn btn-dark btn-sm" data-action="toast" data-icon="plus" data-msg="Add product form — included in the full build">${icon('plus')}Add product</button></div></header>
    <div class="am-tscroll am-tstack"><table class="am-table am-products am-stack am-stack-prod">
      <thead><tr><th>Product</th><th>Brand</th><th>Category</th><th class="r">Price</th><th class="r">MRP</th><th class="r">Stock</th><th>Ad placements</th><th>Status</th></tr></thead>
      <tbody>${list.map(p => {
        const b = H.brand(p.brand), c = H.cat(p.cat) || { name: p.cat }, st = stockOf(p);
        const promo = PROMO[p.id] ? [...PROMO[p.id]] : [];
        const status = st === 0 ? pill('Out of stock', 'rejected') : st < 25 ? pill('Low stock', 'pending') : pill('Active', 'live');
        return `<tr data-am-find="${find(p.name, b.name, c.name, p.id)}">
          <td class="am-x-prod"><div class="am-prod"><a class="am-thumb" href="#/p/${p.id}" style="--tint:${p.c1}" aria-label="Open ${esc(p.name)} on the store">${H.art(p)}</a><span><b>${esc(p.name)}</b><small>SKU ${esc(p.id.toUpperCase())} · ${esc(p.size)}</small></span></div></td>
          <td class="am-blogo am-x-brand">${UI.brandLogo(p.brand, { size: 13 })}</td>
          <td class="nowrap am-x-cat">${esc(c.name)}</td>
          <td class="r num am-x-price" data-l="Price"><b>${fmt(p.price)}</b></td>
          <td class="r num am-muted am-x-mrp">${fmt(p.mrp)}<small class="am-off">${H.off(p)}% off</small></td>
          <td class="r num am-x-stock${st < 25 ? ' am-crit-t' : ''}" data-l="Stock">${st}</td>
          <td class="am-x-pz">${promo.length ? `<div class="am-adchips">${promo.map(id => { const s = H.slotDef(id); return `<span class="am-adchip" title="${esc(s ? s.name : id)}">${esc(id)}</span>`; }).join('')}</div>` : '<span class="am-muted">—</span>'}</td>
          <td class="am-x-st">${status}</td>
        </tr>`;
      }).join('')}${noResult(8)}</tbody>
    </table></div>
    <div class="am-pager"><span>Showing 1–${list.length} of ${D.PRODUCTS.length}</span><div><button type="button" class="btn btn-ghost btn-sm" disabled>${icon('chevLeft')}Previous</button><button type="button" class="btn btn-ghost btn-sm" data-action="toast" data-icon="tag" data-msg="Full catalogue paging, filters &amp; bulk edit — included in the full build">Next${icon('chevRight')}</button></div></div>
  </section>`;
}

/* ================= settings ================= */
function vSettings() {
  const row = (k, v) => `<div class="am-kv"><dt>${k}</dt><dd>${v}</dd></div>`;
  const toggle = (label, sub, on) => `<li><span><b>${label}</b><small>${sub}</small></span>${sw(on, 'am-fake-sw', label, label)}</li>`;
  const edit = what => `<button type="button" class="btn btn-ghost btn-sm" data-action="toast" data-icon="sliders" data-msg="Editing ${what} — included in the full build">Edit</button>`;
  return `<div class="am-set">
    <section class="blk am-card"><header class="am-card-h"><div><h2>Store details</h2><p>Shown on invoices and the website footer</p></div>${edit('store details')}</header>
      <dl class="am-kvs">${row('Store name', 'The Big Brands')}${row('Legal entity', 'TBB Retail Pvt Ltd')}${row('GSTIN', '07AAKCT4821M1Z5')}${row('Support', 'care@thebigbrands.co.in · 1800 120 4455')}${row('Warehouse', 'Okhla Phase II, New Delhi 110020')}</dl></section>
    <section class="blk am-card"><header class="am-card-h"><div><h2>Payment gateway</h2><p>UPI, cards, net banking, wallets &amp; COD</p></div>${pill('Connected', 'live')}</header>
      <dl class="am-kvs">${row('Provider', 'Razorpay')}${row('Methods', 'UPI · Cards · Net banking · Wallets · COD')}${row('Settlement', 'T+2 days to HDFC Bank ••••4821')}${row('COD limit', 'Up to ₹3,000 per order')}</dl></section>
    <section class="blk am-card"><header class="am-card-h"><div><h2>Shipping partner</h2><p>Pan-India delivery to 19,000+ pincodes</p></div>${pill('Connected', 'live')}</header>
      <dl class="am-kvs">${row('Aggregator', 'Shiprocket')}${row('Couriers', 'Delhivery · Blue Dart · Xpressbees')}${row('Free shipping', 'Orders above ₹499')}${row('Pickup', 'Daily, 5:00 pm from Okhla')}</dl></section>
    <section class="blk am-card"><header class="am-card-h"><div><h2>Ad policy</h2><p>Rules that keep the storefront premium while it earns</p></div></header>
      <ul class="am-toggles">${toggle('Auto-approve verified brands', 'Campaigns from brands with 3+ approved bookings go live without review', false)}${toggle('Show house ads in unsold slots', 'Promote TBB Originals &amp; the free gift when a slot has no booking', true)}${toggle('Cap ads at 40% of the homepage', 'Keeps the homepage browsable, not cluttered', true)}</ul></section>
    <section class="blk am-card"><header class="am-card-h"><div><h2>Notifications</h2><p>Sent to the admin app &amp; WhatsApp</p></div></header>
      <ul class="am-toggles">${toggle('New order placed', 'Push + WhatsApp to the packing team', true)}${toggle('New campaign submitted', 'Push to owner for approval', true)}${toggle('Gift stock below 50', 'Daily alert until restocked', true)}${toggle('Daily ad revenue summary', 'Every morning at 9:00 am', false)}</ul></section>
    <section class="blk am-card"><header class="am-card-h"><div><h2>Team</h2><p>Who can use this console &amp; the admin app</p></div><button type="button" class="btn btn-ghost btn-sm" data-action="toast" data-icon="users" data-msg="Invite team members with roles — included in the full build">${icon('plus')}Invite</button></header>
      <ul class="am-team">${[['Rahul Bansal', 'Owner · full access'], ['Megha Arora', 'Ads & partnerships'], ['Imran Qureshi', 'Warehouse & orders']].map(([n, r]) => `<li><span class="am-cav" style="background:${AV[hash(n) % AV.length]}">${initials(n)}</span><span><b>${n}</b><small>${r}</small></span></li>`).join('')}</ul></section>
  </div>`;
}

/* ================= tooltip ================= */
function buildTip(tip, t) {
  tip.textContent = '';
  const h = document.createElement('div'); h.className = 'am-tip-t'; h.textContent = t.dataset.amTip || ''; tip.appendChild(h);
  (t.dataset.amRows || '').split(';').filter(Boolean).forEach(r => {
    const [label, value, key] = r.split('|');
    const row = document.createElement('div'); row.className = 'am-tip-r';
    const k = document.createElement('span'); k.className = 'am-tip-k' + (key ? ' ' + key : '');
    const v = document.createElement('b'); v.textContent = value || '';
    const l = document.createElement('span'); l.className = 'am-tip-l'; l.textContent = label || '';
    row.append(k, v, l); tip.appendChild(row);
  });
}
function placeTip(tip, x, y) {
  tip.hidden = false;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2));
  let top = y - h - 14;
  if (top < 8) top = y + 18;
  tip.style.left = left + 'px'; tip.style.top = top + 'px';
}

/* ================= search filter ================= */
function applyFind(root) {
  if (!root) return;
  const q = amQ.trim().toLowerCase();
  root.querySelectorAll('tbody, .am-camps, .am-gifts').forEach(box => {
    const items = [...box.querySelectorAll(':scope > [data-am-find]')];
    if (!items.length) return;
    let shown = 0;
    items.forEach(r => { const ok = !q || r.dataset.amFind.includes(q); r.hidden = !ok; if (ok) shown++; });
    const nr = box.querySelector(':scope > .am-noresult');
    if (nr) { nr.hidden = !(q && !shown); if (q && !shown) nr.firstElementChild.textContent = `No matches for “${amQ.trim()}”`; }
  });
}

/* ================= page ================= */
TBB.page('admin', {
  chrome: false,
  title: r => 'Admin · ' + tabOf(r).label,
  render(route) {
    const tab = tabOf(route);
    if (tab.id !== amLastTab) { if (amLastTab !== null) amDraft = null; amLastTab = tab.id; }
    const pend = S.campaigns.filter(c => c.status === 'pending').length;
    const views = {
      dashboard: [vDashboard, 'Saturday, 21 November 2026 · here’s how the store and your ad business are doing'],
      ads:       [vAds, `${D.SLOTS.length} paid placements across the website, app and delivery box`],
      campaigns: [vCampaigns, pend ? `${pend} brand campaign${pend > 1 ? 's' : ''} waiting for your approval` : 'Brand campaigns booked from the Advertise page'],
      orders:    [vOrders, 'Every order includes the free TBB gifts chosen at checkout'],
      gifts:     [vGifts, 'TBB Originals minis, stock and the tier rules shoppers see'],
      products:  [vProducts, 'Your marketplace catalogue across all brands'],
      settings:  [vSettings, 'Store, payments, shipping, ad policy and team'],
    };
    const [fn, sub] = views[tab.id];
    return shell(tab, fn(), sub);
  },
  mount(root) {
    const tip = root.querySelector('.am-tip');
    let curT = null;
    const hide = () => { if (tip) tip.hidden = true; curT = null; };
    const onMove = e => {
      const t = e.target.closest && e.target.closest('[data-am-tip]');
      if (!t || !tip) return hide();
      if (t !== curT) { buildTip(tip, t); curT = t; }
      placeTip(tip, e.clientX, e.clientY);
    };
    const onFocus = e => {
      const t = e.target.closest && e.target.closest('[data-am-tip]');
      if (!t || !tip) return;
      buildTip(tip, t); curT = t;
      const r = t.getBoundingClientRect();
      placeTip(tip, r.left + r.width / 2, r.top + Math.min(40, r.height / 2));
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', hide);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', hide);
    window.addEventListener('scroll', hide, { passive: true });
    offs.push(() => {
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', hide);
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('focusout', hide);
      window.removeEventListener('scroll', hide);
    });

    const box = root.querySelector('#am-rev');
    if (box && 'ResizeObserver' in window) {
      let lastW = 0;
      ro = new ResizeObserver(ents => {
        const w = Math.round(ents[0].contentRect.width);
        if (w > 0 && Math.abs(w - lastW) > 2) { lastW = w; box.innerHTML = revSvg(w); }
      });
      ro.observe(box);
    }
    applyFind(root);
    const nav = root.querySelector('.am-nav'), onLink = nav && nav.querySelector('a.on');
    if (nav && onLink && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, onLink.offsetLeft - 12);
    if (amFlash) {
      amFlash = false;
      const hEl = root.querySelector('.am-hint');
      if (hEl) hEl.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
  },
  unmount() {
    offs.forEach(f => f()); offs = [];
    if (ro) { ro.disconnect(); ro = null; }
  },
});

/* ================= actions ================= */
TBB.action('am-view', el => { amView = el.dataset.v === 'table' ? 'table' : 'chart'; TBB.render(); });
TBB.action('am-page', el => { amPage = el.dataset.page || 'all'; TBB.render(); });
TBB.action('am-ord', el => { amOrd = el.dataset.st || 'all'; TBB.render(); });

TBB.action('am-slot', el => {
  const id = el.dataset.id, s = H.slotDef(id); if (!s) return;
  const on = S.slotOn[id] !== false;
  if (on) S.slotOn[id] = false; else delete S.slotOn[id];
  TBB.save('slotOn'); TBB.render();
  const p = pg(s.page).name;
  TBB.toast(on ? `${id} ${esc(s.name)} paused — removed from the ${esc(p)} instantly` : `${id} ${esc(s.name)} is live again on the ${esc(p)}`, { icon: on ? 'pause' : 'play' });
});

TBB.action('am-approve', el => {
  const c = TBB.ads.setStatus(el.dataset.id, 'live'); if (!c) return;
  amHint = c.id; amFlash = true;
  TBB.render();
  const s = H.slotDef(c.slot);
  TBB.toast(`Approved — now live in slot ${esc(c.slot)}${s ? ' on the ' + esc(pg(s.page).name) : ''}`, { icon: 'check' });
});
TBB.action('am-reject', el => {
  const c = TBB.ads.setStatus(el.dataset.id, 'rejected'); if (!c) return;
  if (amHint === c.id) amHint = null;
  TBB.render();
  TBB.toast(`Campaign rejected — ${esc(c.advertiser || H.brand(c.brand).name)} has been notified by email`, { icon: 'info' });
});
TBB.action('am-hint-x', () => { amHint = null; TBB.render(); });

TBB.action('am-order', el => {
  const o = S.orders.find(x => x.id === el.dataset.id) || HISTORY.find(x => x.id === el.dataset.id); if (!o || !NEXT[o.status]) return;
  o.status = NEXT[o.status]; o.fresh = false;
  if (S.orders.includes(o)) TBB.save('orders');
  TBB.render();
  TBB.toast(`${esc(o.id)} marked ${o.status.toLowerCase()} — ${esc(o.name.split(' ')[0])} notified on WhatsApp`, { icon: o.status === 'Shipped' ? 'truck' : 'check' });
});

TBB.action('am-gift', el => {
  const id = el.dataset.id, g = gift(id); if (!g) return;
  const on = S.giftOn[id] !== false;
  if (on && D.TBB_GIFTS.filter(x => S.giftOn[x.id] !== false).length <= 1) {
    TBB.toast('Keep at least one gift on — every order includes a free gift', { icon: 'gift' });
    return;
  }
  S.giftOn[id] = !on; TBB.save('giftOn'); TBB.render();
  TBB.toast(on ? `${esc(g.line)} hidden from checkout` : `${esc(g.line)} is back at checkout`, { icon: 'gift' });
});
TBB.action('am-restock', el => {
  const g = gift(el.dataset.id); if (!g) return;
  S.giftStock[g.id] = (S.giftStock[g.id] || 0) + 500; TBB.save('giftStock'); TBB.render();
  TBB.toast(`Restock raised — 500 ${esc(g.line)} minis arriving Tue, 24 Nov`, { icon: 'box' });
});

TBB.action('am-tier-step', el => {
  const i = +el.dataset.i, d = +el.dataset.d; if (!amDraft || !amDraft[i]) return;
  amDraft[i].count = Math.max(1, Math.min(5, amDraft[i].count + d)); TBB.render();
});
TBB.action('am-tier-add', () => {
  if (!amDraft) amDraft = sortTiers(S.tiers);
  if (amDraft.length >= 5) return;
  const last = amDraft[amDraft.length - 1];
  amDraft.push({ min: last.min + 1000, count: Math.min(5, last.count + 1) }); TBB.render();
});
TBB.action('am-tier-del', el => { const i = +el.dataset.i; if (amDraft && i > 0) { amDraft.splice(i, 1); TBB.render(); } });
TBB.action('am-tier-reset', () => { amDraft = null; TBB.render(); });
function tierError(msg, bad) {
  const box = document.getElementById('am-tier-err');
  document.querySelectorAll('.am-tier.is-bad').forEach(r => r.classList.remove('is-bad'));
  if (box) { box.hidden = !msg; box.innerHTML = msg ? `${ic('alert')}<span>${esc(msg)}</span>` : ''; }
  (bad || []).forEach(i => { const r = document.querySelectorAll('.am-tier')[i]; if (r) r.classList.add('is-bad'); });
  if (msg) TBB.toast(esc(msg), { icon: 'info' });
}
TBB.action('am-tier-pub', () => {
  if (!amDraft) amDraft = sortTiers(S.tiers);
  const t = amDraft.map((x, i) => ({ min: i === 0 ? 0 : Math.round(Number(x.min) || 0), count: x.count, i }));
  const zero = t.slice(1).filter(x => x.min <= 0).map(x => x.i);
  if (zero.length) return tierError('Each extra tier needs a cart value above ₹0.', zero);
  const sorted = [...t].sort((a, b) => a.min - b.min);
  const dup = sorted.filter((x, k) => sorted.some((y, j) => j !== k && y.min === x.min)).map(x => x.i);
  if (dup.length) return tierError('Two tiers start at the same cart value — make each one different.', dup);
  const low = sorted.filter((x, k) => k && x.count <= sorted[k - 1].count).map(x => x.i);
  if (low.length) return tierError('A higher cart value must unlock more gifts than the tier before it.', low);
  S.tiers = sortTiers(t); TBB.save('tiers'); amDraft = null; TBB.render();
  TBB.toast('Gift rules published — live on the website &amp; app now', { icon: 'upload' });
});
TBB.action('am-goslot', (el, e) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;   // let "open in new tab" work
  e.preventDefault();
  goSlot(el.dataset.slot, el.getAttribute('href'));
});
TBB.on('input', '.am-tier-in', el => {
  const i = +el.dataset.i; if (!amDraft || !amDraft[i]) return;
  amDraft[i].min = Math.max(0, Math.round(Number(el.value) || 0));
  tierError('');
  const prev = document.getElementById('am-tier-prev');
  if (prev) prev.innerHTML = tierPreview(sortTiers(amDraft));
  const st = document.getElementById('am-tier-state');
  if (st) { const d = JSON.stringify(sortTiers(amDraft)) !== JSON.stringify(sortTiers(S.tiers)); st.classList.toggle('dirty', d); st.innerHTML = d ? 'Unpublished changes' : `${icon('check')}Live on website &amp; app`; }
});

TBB.action('am-fake-sw', el => {
  const on = el.getAttribute('aria-checked') !== 'true';
  el.setAttribute('aria-checked', String(on));
  TBB.toast(`${esc(el.dataset.id)} — ${on ? 'on' : 'off'} (demo setting)`, { icon: 'sliders' });
});

/* top-bar search filters the rows of the current tab */
TBB.on('input', '#am-q', el => { amQ = el.value; applyFind(document.getElementById('main')); });
TBB.on('submit', '#am-search', (el, e) => {
  e.preventDefault();
  const main = document.getElementById('main');
  if (amQ.trim() && main && !main.querySelector('[data-am-find]')) TBB.go('#/admin/products');
  else applyFind(main);
});
})();
