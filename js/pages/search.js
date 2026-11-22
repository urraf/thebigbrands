/* The Big Brands — marketplace demo · search, category, deals, free-gift store, brand directory & brand stores
   Pages registered here:
     'search'  → #/s?q=…  #/c/<cat>  #/deals  #/gifts
     'brands'  → #/brands
     'brand'   → #/brand/<id>
   Ad placements used: S2 headline banner, S3 sponsored products, S4 in-grid native tile,
   B1 brand store, H7 similar-brand tiles, H9 brand coupon, X1 partner sample (gift store). */
(() => {
'use strict';
const D = TBB.data, S = TBB.S, H = TBB.h, UI = TBB.ui;
const { esc, fmt, kfmt, off, icon, art, brand, cat, shade, lum } = H;

/* ---------- tiny per-viewer storage (follow list) ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('tbb2_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('tbb2_' + k, JSON.stringify(v)); } catch (e) {} },
};
let follows = LS.get('srFollow', []);

/* ---------- constants ---------- */
const PER = 24;
const SORTS = [['rel', 'Featured'], ['best', 'Bestsellers'], ['new', 'Newest arrivals'], ['low', 'Price: Low to High'], ['high', 'Price: High to Low'], ['rating', 'Avg. customer review'], ['discount', 'Discount: High to Low']];
const PRICES = [
  { min: 0, max: 249, l: 'Under ₹250' },
  { min: 250, max: 499, l: '₹250 – ₹499' },
  { min: 500, max: 999, l: '₹500 – ₹999' },
  { min: 1000, max: 0, l: '₹1,000 & above' },
];
const RATINGS = [4.5, 4];
const DISCS = [10, 15, 20, 30];
/* demo CPC bids (₹) — drive which advertiser wins sponsored positions */
const BID = { mamaearth: 7.8, loreal: 7.4, minimalist: 7.1, dermaco: 6.9, lakme: 6.6, nivea: 6.2, himalaya: 6, cetaphil: 5.8, plum: 5.6, garnier: 5.4, dove: 5.2, beardo: 5, bellavita: 4.8, parachute: 4.6, biotique: 4.2 };
/* sample creative copy for brands without a booked creative in this slot */
const COPY = {
  mamaearth:  { h: 'Less hair fall. More hair days.', s: 'Onion range with Redensyl — up to 30% off',
                by: { face: { h: 'Glow up with Vitamin C & turmeric', s: 'Brightening face wash — 17% off this week' } } },
  loreal:     { h: 'Salon-strong repair. At home.', s: 'Total Repair 5 & Revitalift — 10% off + free gift',
                by: { skin: { h: 'Hydration you can see in 2 weeks', s: 'Revitalift 1.5% Hyaluronic serum — 10% off' }, makeup: { h: 'Flawless for 24 hours', s: 'Infallible Fresh Wear foundation — 18% off' } } },
  minimalist: { h: 'Science, not stories.', s: 'Niacinamide & SPF 50 — dermat-tested, from ₹399' },
  dermaco:    { h: 'Actives that actually work', s: 'Salicylic, Vitamin C & more — from ₹349' },
  lakme:      { h: 'Made for Indian skin & weather', s: 'Sun Expert & 9to5 — buy 2, get 15% off',
                by: { makeup: { h: 'Office-to-party in 10 seconds', s: '9to5 matte lipstick & Eyeconic kajal — from ₹199' }, skin: { h: 'SPF 50 that feels like nothing', s: 'Sun Expert ultra-matte gel — 18% off' } } },
  nivea:      { h: 'Soft skin all winter long', s: 'Creams & lotions — up to 35% off',
                by: { men: { h: 'Men’s care that works as hard as you', s: 'Dark-spot reduction face wash — from ₹219' } } },
  himalaya:   { h: 'Pure herbs. Real results.', s: 'Neem, tea tree & cocoa butter — from ₹165',
                by: { face: { h: 'Neem for clear, pimple-free skin', s: 'India’s No.1 herbal face wash — from ₹165' }, hair: { h: 'Bye-bye dandruff, the herbal way', s: 'Tea tree anti-dandruff shampoo — 14% off' } } },
  cetaphil:   { h: 'Gentle enough for sensitive skin', s: 'Dermatologist-recommended — from ₹399' },
  plum:       { h: 'Clear pores, naturally', s: 'Green Tea range — 20% off this week' },
  garnier:    { h: 'Micellar magic in one swipe', s: 'Cleansing water & Vitamin C — from ₹199',
                by: { skin: { h: 'Brighter skin in 3 days', s: 'Vitamin C serum cream — just ₹199' } } },
  dove:       { h: 'Winter repair, sorted.', s: 'Intense Repair range — up to 25% off',
                by: { body: { h: 'Nourishment you can feel', s: 'Deeply Nourishing body wash — 14% off' } } },
  beardo:     { h: 'Grow it. Groom it. Own it.', s: 'Beard oils from ₹349 — No-Shave November' },
  bellavita:  { h: 'Smell expensive. Pay less.', s: 'Luxury perfumes from ₹499 — up to 40% off' },
  parachute:  { h: '100% pure coconut. Zero compromise.', s: 'India’s most-trusted hair oil — from ₹155' },
  biotique:   { h: 'Bhringraj for stronger roots', s: 'Ayurvedic hair oil — flat 15% off' },
};
const STOP = new Set(['for', 'with', 'and', 'the', 'of', 'in', 'to', 'a', 'an', 'on', 'by', 'best', 'buy', 'online', 'product', 'products', 'rs']);
const SYN = {
  sunscreen: ['spf', 'sun'], sunblock: ['spf', 'sun'], spf: ['sunscreen'], sun: ['spf'],
  pimple: ['acne', 'salicylic', 'neem'], acne: ['pimple', 'salicylic'], oily: ['acne', 'pore', 'salicylic'],
  perfume: ['parfum', 'fragrance', 'eau'], scent: ['parfum', 'fragrance'], deo: ['fragrance', 'parfum'], fragrance: ['parfum'],
  moisturiser: ['moisturising', 'cream', 'lotion'], moisturizer: ['moisturising', 'cream', 'lotion'], moisturizing: ['moisturising'],
  cleanser: ['face wash', 'cleansing'], facewash: ['face wash'], hairfall: ['hair fall'], dandruf: ['dandruff'],
  lipstick: ['lip', 'matte'], lip: ['lipstick', 'balm'], kohl: ['kajal'], eyeliner: ['kajal'], kajol: ['kajal'],
  men: ['man', 'beard'], man: ['men'], him: ['men', 'man'], mens: ['men'],
  glow: ['glowing', 'bright', 'vitamin'], tan: ['de tan', 'sun'], vitc: ['vitamin c'], growth: ['hair growth'],
  dry: ['moisturising', 'nourishing'], lotion: ['body lotion'], gift: ['tbb', 'originals'], free: ['tbb', 'originals'],
};
const BGROUPS = [['all', 'All brands', []], ['skin', 'Skincare', ['skin', 'face']], ['hair', 'Haircare', ['hair', 'oil']], ['makeup', 'Makeup', ['makeup']], ['body', 'Bath & Body', ['body']], ['men', 'Men', ['men']], ['fragrance', 'Fragrance', ['fragrance']]];
const FEATURED = ['loreal', 'mamaearth', 'himalaya'];

/* ---------- small helpers ---------- */
const pop = p => p.reviews * p.rating;
const hashStr = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const claimed = p => 34 + hashStr(p.id) % 58;
const ORDER = Object.fromEntries(D.PRODUCTS.map((p, i) => [p.id, i]));
const concern = id => D.CONCERNS.find(c => c.id === id);
const brandProducts = id => D.PRODUCTS.filter(p => p.brand === id);
const isSheet = () => window.matchMedia('(max-width: 960px)').matches;
const labelFor = cr => (cr && (cr.house || cr.brand === 'tbb')) ? UI.adBadge('The Big Brands') : UI.adBadge();
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
function brandStats(id) {
  const ps = brandProducts(id);
  const reviews = ps.reduce((a, p) => a + p.reviews, 0);
  const avg = ps.length ? ps.reduce((a, p) => a + p.rating, 0) / ps.length : 0;
  return { ps, n: ps.length, avg: avg ? avg.toFixed(1) : '–', reviews, followers: Math.round(reviews * 1.9 / 100) * 100 };
}

/* ================= text matching ================= */
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9%]+/g, ' ').trim();
const stem = w => (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) ? w.slice(0, -1) : w;
const IDX = D.PRODUCTS.map(p => {
  const b = brand(p.brand), c = cat(p.cat) || {};
  const conc = (p.concerns || []).map(concern).filter(Boolean);
  const fields = [
    [p.name + ' ' + (p.line || ''), 3],
    [b.name + ' ' + (b.word || '') + ' ' + p.brand + (p.own ? ' tbb originals big brands' : ''), 3],
    [(c.name || '') + ' ' + (c.short || ''), 2],
    [conc.map(x => x.name + ' ' + x.id).join(' '), 1.6],
    [(p.tag || '') + ' ' + p.size + ' ' + (b.tagline || ''), 0.6],
  ].map(([s, w]) => { const n = norm(s); return { s: n, w, words: n.split(' ') }; });
  return { p, fields, name: norm(b.name + ' ' + p.name) };
});
function fieldHit(f, t) {
  if (t.includes(' ')) return (' ' + f.s + ' ').includes(' ' + t + ' ') || f.s.includes(t);
  const st = stem(t);
  return f.words.some(w => w === t || w.startsWith(t) || stem(w) === st || (t.length >= 4 && w.includes(t)));
}
function tokenScore(e, t) {
  const alts = [t, ...(SYN[t] || SYN[stem(t)] || [])];
  let best = 0;
  e.fields.forEach(f => alts.forEach((a, i) => { if (fieldHit(f, a)) best = Math.max(best, f.w * (i ? 0.8 : 1)); }));
  return best;
}
const tokens = q => norm(q).split(' ').filter(t => t && !STOP.has(t) && (t.length >= 2 || /\d/.test(t)));
function scoreQuery(q) {
  const toks = tokens(q), nq = norm(q);
  const map = new Map();
  if (!toks.length) return { toks, map, loose: false, none: true };
  const run = strict => IDX.forEach(e => {
    let sum = 0, hits = 0;
    toks.forEach(t => { const s = tokenScore(e, t); if (s) { sum += s; hits++; } });
    if (strict ? hits === toks.length : hits > 0) map.set(e.p.id, sum + (e.name.includes(nq) ? 3 : 0) + (strict ? 0 : hits));
  });
  run(true);
  let loose = false;
  if (!map.size && toks.length > 1) { run(false); loose = map.size > 0; }
  return { toks, map, loose };
}

/* ================= state ⇄ url ================= */
const csv = v => (v || '').split(',').map(s => s.trim()).filter(Boolean);
let cur = null;           // parsed state of the rendered results page
let keepY = null;         // scroll position to restore after an in-page navigation
let timer = null;         // deals countdown
let lastFocus = null;     // focus to restore when the filter sheet closes
let brandsOpen = false;   // "see all brands" expanded in the sidebar
let dirQ = '', dirG = 'all';  // brand directory filters

function readState(route) {
  const q = route.q, mode = route.key === 'c' ? 'c' : route.key === 'deals' ? 'deals' : 's';
  const catId = mode === 'c' ? (route.seg[1] || '') : (q.get('cat') || '');
  const sort = q.get('sort') || 'rel';
  let min = Math.max(0, Number(q.get('min')) || 0), max = Math.max(0, Number(q.get('max')) || 0);
  if (min && max && min > max) [min, max] = [max, min];
  return {
    mode, q: (q.get('q') || '').trim().slice(0, 80),
    cat: cat(catId) ? catId : '',
    brands: csv(q.get('brand')).filter(id => D.BRANDS.some(b => b.id === id)),
    concerns: csv(q.get('concern')).filter(concern),
    min, max,
    rating: Number(q.get('rating')) || 0, disc: Number(q.get('disc')) || 0,
    gift: q.get('gift') === '1',
    sort: SORTS.some(s => s[0] === sort) ? sort : 'rel',
    pg: Math.max(1, parseInt(q.get('pg'), 10) || 1),
  };
}
function buildHash(st) {
  const p = new URLSearchParams();
  let base = '#/s';
  if (st.mode === 'deals') base = '#/deals';
  else if (st.cat && !st.q) base = '#/c/' + st.cat;
  if (st.q) p.set('q', st.q);
  if (st.cat && base.indexOf('#/c/') !== 0) p.set('cat', st.cat);
  if (st.brands.length) p.set('brand', st.brands.join(','));
  if (st.concerns.length) p.set('concern', st.concerns.join(','));
  if (st.min) p.set('min', st.min);
  if (st.max) p.set('max', st.max);
  if (st.rating) p.set('rating', st.rating);
  if (st.disc) p.set('disc', st.disc);
  if (st.gift) p.set('gift', '1');
  if (st.sort && st.sort !== 'rel') p.set('sort', st.sort);
  if (st.pg > 1) p.set('pg', st.pg);
  const s = p.toString().replace(/%2C/g, ',');
  return base + (s ? '?' + s : '');
}
/* navigate but keep the reader near where they were (results top at most) */
function navKeep(hash) {
  const a = document.querySelector('[data-sr-anchor]');
  const lim = a ? a.getBoundingClientRect().top + window.scrollY - 12 : 0;
  keepY = Math.max(0, Math.min(window.scrollY, lim));
  TBB.go(hash);
}
function restoreScroll() {
  if (keepY == null) return;
  const y = keepY; keepY = null;
  window.scrollTo(0, y);
  requestAnimationFrame(() => window.scrollTo(0, y));
}
const apply = st => navKeep(buildHash(st));

/* ================= filtering ================= */
function priceIn(p, min, max) { return (!min || p.price >= min) && (!max || p.price <= max); }
function applyFilters(items, st, except) {
  return items.filter(({ p }) =>
    (except === 'cat' || !st.cat || p.cat === st.cat) &&
    (except === 'brand' || !st.brands.length || st.brands.includes(p.brand)) &&
    (except === 'concern' || !st.concerns.length || st.concerns.some(c => (p.concerns || []).includes(c))) &&
    (except === 'price' || priceIn(p, st.min, st.max)) &&
    (except === 'rating' || !st.rating || p.rating >= st.rating) &&
    (except === 'disc' || !st.disc || off(p) >= st.disc));
}
function compute(st) {
  const qs = st.q ? scoreQuery(st.q) : null;
  let base = D.PRODUCTS.map(p => ({ p, score: qs ? (qs.map.get(p.id) || 0) : 0 }));
  if (qs && !qs.none) base = base.filter(x => qs.map.has(x.p.id));
  if (st.mode === 'deals') base = base.filter(x => off(x.p) >= 15);
  return { qs, base, items: applyFilters(base, st) };
}
function facets(base, st) {
  const tally = (arr, fn) => { const m = {}; arr.forEach(x => fn(x.p).forEach(k => { m[k] = (m[k] || 0) + 1; })); return m; };
  const g = k => applyFilters(base, st, k);
  const pr = g('price'), rt = g('rating'), ds = g('disc');
  return {
    cat: tally(g('cat'), p => [p.cat]),
    brand: tally(g('brand'), p => [p.brand]),
    concern: tally(g('concern'), p => p.concerns || []),
    price: PRICES.map(r => pr.filter(x => priceIn(x.p, r.min, r.max)).length),
    rating: RATINGS.map(r => rt.filter(x => x.p.rating >= r).length),
    disc: DISCS.map(d => ds.filter(x => off(x.p) >= d).length),
  };
}
function sortItems(items, st) {
  const hasQ = !!st.q;
  const cmp = {
    rel: (a, b) => st.mode === 'deals' && !st.q ? (off(b.p) - off(a.p)) || (pop(b.p) - pop(a.p)) : hasQ ? (b.score - a.score) || (pop(b.p) - pop(a.p)) : pop(b.p) - pop(a.p),
    best: (a, b) => pop(b.p) - pop(a.p),
    new: (a, b) => ORDER[b.p.id] - ORDER[a.p.id],
    low: (a, b) => a.p.price - b.p.price,
    high: (a, b) => b.p.price - a.p.price,
    rating: (a, b) => (b.p.rating - a.p.rating) || (b.p.reviews - a.p.reviews),
    discount: (a, b) => (off(b.p) - off(a.p)) || (pop(b.p) - pop(a.p)),
  }[st.sort];
  return [...items].sort(cmp);
}

/* ================= ad decisioning ================= */
function pickSponsored(items, st, n) {
  if (!n || S.slotOn.S3 === false) return [];
  const boost = new Set(TBB.ads.list('S3').filter(c => c.custom).map(c => c.brand));
  const maxS = Math.max(1, ...items.map(x => x.score));
  const ranked = items.filter(x => !x.p.own && BID[x.p.brand])
    .map(x => ({ x, r: BID[x.p.brand] * (boost.has(x.p.brand) ? 3 : 1) * (0.55 + (st.q ? x.score / maxS : 0.45)) * x.p.rating }))
    .sort((a, b) => b.r - a.r).map(o => o.x);
  const out = [], used = new Set();
  ranked.forEach(x => { if (out.length < n && !used.has(x.p.brand)) { out.push(x); used.add(x.p.brand); } });
  ranked.forEach(x => { if (out.length < n && !out.includes(x)) out.push(x); });
  return out;
}
function relevantBrand(st, R) {
  if (st.brands.length === 1) return st.brands[0] === 'tbb' ? null : st.brands[0];
  if (!(st.q || st.cat || st.concerns.length || st.mode === 'deals')) return null;
  const pool = R.items.length ? R.items : R.base;
  const agg = {};
  pool.forEach(x => { if (x.p.own || !BID[x.p.brand]) return; agg[x.p.brand] = (agg[x.p.brand] || 0) + (st.q ? x.score : 1) * x.p.rating; });
  const best = Object.entries(agg).map(([b, v]) => [b, v * BID[b]]).sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : null;
}
function lightTheme(b) {
  const c = b.color, dark = lum(c) < 0.15;
  const tint = dark ? (lum(b.accent || '#eee') > 0.9 ? '#efece6' : shade(b.accent, 0.55)) : shade(c, 0.86);
  return { bg: `linear-gradient(100deg, ${tint} 0%, ${shade(tint, 0.55)} 48%, #ffffff 100%)`, fg: dark ? '#151515' : shade(c, -0.5), accent: dark ? '#151515' : c };
}
function darkTheme(b) {
  const c = b.color;
  if (lum(c) < 0.15) {
    const ac = b.accent && lum(b.accent) < 0.85 ? b.accent : '#ffffff';
    return { bg: `radial-gradient(90% 55% at 50% 60%, ${ac}38, transparent 70%), linear-gradient(165deg, #0c0c0e, #2a2a30)`, fg: '#ffffff', accent: ac };
  }
  return { bg: `radial-gradient(90% 55% at 50% 60%, rgba(255,255,255,.24), transparent 70%), linear-gradient(165deg, ${shade(c, -0.5)}, ${c} 72%, ${shade(c, 0.16)})`, fg: '#ffffff', accent: '#ffffff' };
}
function makeCreative(bid, slot, pool) {
  const b = brand(bid), base = COPY[bid] || { h: b.tagline || b.name, s: 'Shop the official brand store' };
  const inResP = (pool || []).filter(x => x.p.brand === bid).sort((a, c) => (c.score - a.score) || (pop(c.p) - pop(a.p))).map(x => x.p);
  const mainCat = inResP.length ? inResP[0].cat : null;
  const cp = (mainCat && base.by && (base.by[mainCat] || (mainCat === 'oil' && base.by.hair))) || base;
  const inRes = inResP.map(p => p.id);
  const all = brandProducts(bid).sort((a, c) => pop(c) - pop(a));
  /* relevant products first, then same-category bestsellers; only if that leaves fewer than 2 tiles,
     top up with the brand's other bestsellers (a one-tile banner looks empty) */
  const sameCat = inRes.length ? all.filter(p => p.cat === mainCat).map(p => p.id) : all.map(p => p.id);
  let products = [...new Set([...inRes, ...sameCat])];
  if (products.length < 2) products = [...new Set([...products, ...all.map(p => p.id)])];
  products = products.slice(0, 3);
  return { id: `sr-${slot}-${bid}`, slot, brand: bid, headline: cp.h, sub: cp.s, cta: `Shop ${b.name}`, href: '#/brand/' + bid, products, product: products[0], theme: slot === 'S2' ? lightTheme(b) : darkTheme(b), gen: true };
}
function chooseS2(st, R) {
  const list = TBB.ads.list('S2');
  if (!list.length) return null;
  let cr = list[0];
  if (!cr.custom) {
    const rb = relevantBrand(st, R);
    if (rb && rb !== cr.brand) cr = makeCreative(rb, 'S2', R.items.length ? R.items : R.base);
  }
  return cr;
}
function chooseS4(st, R, avoid) {
  if (S.slotOn.S4 === false) return null;
  const live = TBB.ads.list('S4');
  if (live.length) return live[0];
  const inRes = [...new Set(R.items.map(x => x.p.brand))].filter(b => BID[b] && !avoid.has(b)).sort((a, b) => BID[b] - BID[a]);
  const any = Object.keys(BID).filter(b => !avoid.has(b)).sort((a, b) => BID[b] - BID[a]);
  const pick = inRes[0] || any[(hashStr(st.q + st.cat) % 4)] || any[0];
  return pick ? makeCreative(pick, 'S4', R.items) : null;
}

/* ================= ad renderers ================= */
function s2Html(cr) {
  if (!cr) return '';
  const b = brand(cr.brand), th = cr.theme || lightTheme(b);
  const dark = lum(th.fg || '#000') > 0.6;
  const logoColor = dark ? th.fg : (lum(b.color) < 0.8 ? b.color : th.fg);
  const prods = (cr.products && cr.products.length ? cr.products : cr.product ? [cr.product] : []).map(H.product).filter(Boolean).slice(0, 3);
  const ac = th.accent || b.color, acFg = lum(ac) > 0.62 ? '#151515' : '#ffffff';
  const href = esc(cr.href || '#/brand/' + cr.brand);
  return UI.slot('S2', `<section class="sr-s2${dark ? ' is-dark' : ''}${prods.length ? '' : ' no-prods'}" style="--s2-bg:${th.bg};--s2-fg:${th.fg};--s2-ac:${ac};--s2-acfg:${acFg}" aria-label="Sponsored: ${esc(b.name)}">
      <div class="sr-s2-id"><a class="sr-s2-logo" href="${href}" aria-label="${esc(b.name)} store">${UI.brandLogo(cr.brand, { size: 30, color: logoColor })}</a><span class="sr-s2-tl">${esc(b.tagline || '')}</span></div>
      <div class="sr-s2-copy">
        <div class="sr-s2-lbl">${labelFor(cr)}<span>Sponsored by ${esc(b.name)}</span></div>
        <h2>${esc(cr.headline)}</h2>${cr.sub ? `<p>${esc(cr.sub)}</p>` : ''}
        <a class="sr-s2-cta" href="${href}">${esc(cr.cta || 'Shop now')}${icon('arrow')}</a>
      </div>
      ${prods.length ? `<div class="sr-s2-prods">${prods.map(p => `<a class="sr-s2-p" href="#/p/${p.id}"><span class="sr-s2-art" style="--tint:${p.c1}">${art(p)}</span><span class="sr-s2-pn">${esc(p.name)}</span><span class="sr-s2-pr"><b>${fmt(p.price)}</b><span>${icon('star')}${p.rating}</span></span></a>`).join('')}</div>`
        : `<div class="sr-s2-mark" aria-hidden="true">${UI.brandLogo(cr.brand, { size: 46, color: logoColor })}</div>`}
    </section>`, { cls: 'sr-s2-slot' });
}
function s4Html(cr) {
  if (!cr) return '';
  const b = brand(cr.brand), th = cr.theme || darkTheme(b);
  const p = H.product(cr.product || (cr.products || [])[0]);
  const dark = lum(th.fg || '#fff') > 0.6;
  const ac = th.accent || '#ffffff', acFg = lum(ac) > 0.62 ? '#151515' : '#ffffff';
  const href = esc(cr.href || '#/brand/' + cr.brand);
  return UI.slot('S4', `<article class="sr-s4${dark ? ' is-dark' : ''}" style="--s4-bg:${th.bg};--s4-fg:${th.fg};--s4-ac:${ac};--s4-acfg:${acFg}" aria-label="Sponsored: ${esc(b.name)}">
      <div class="sr-s4-top">${labelFor(cr)}<a href="${href}" class="sr-s4-logo" aria-label="${esc(b.name)} store">${UI.brandLogo(cr.brand, { size: 17, color: dark ? th.fg : b.color })}</a></div>
      <h3>${esc(cr.headline)}</h3>${cr.sub ? `<p>${esc(cr.sub)}</p>` : ''}
      ${p ? `<a class="sr-s4-art" href="#/p/${p.id}" aria-label="${esc(b.name + ' ' + p.name)}">${art(p)}<span class="sr-s4-price">from <b>${fmt(Math.min(...brandProducts(cr.brand).map(x => x.price)))}</b></span></a>`
        : `<div class="sr-s4-mark" aria-hidden="true">${UI.brandLogo(cr.brand, { size: 34, color: dark ? th.fg : b.color })}</div>`}
      <a class="sr-s4-cta" href="${href}">${esc(cr.cta || 'Shop now')}${icon('arrow')}</a>
    </article>`, { cls: 'sr-s4-slot' });
}
function dealCard(p, sp) {
  let h = UI.productCard(p, sp ? { sponsored: true, slot: 'S3' } : {});
  const c = claimed(p);
  h = h.replace('<div class="pc-body">', `<div class="pc-body"><div class="sr-dtag"><span class="sr-dtag-o">${off(p)}% off</span><span class="sr-dtag-l">Limited time deal</span></div>`);
  h = h.replace('<button class="btn btn-cart"', `<div class="sr-claim" role="img" aria-label="${c}% claimed"><span style="width:${c}%"></span></div><div class="sr-claim-t">${c}% claimed${c > 80 ? ' · almost gone' : ''}</div><button class="btn btn-cart"`);
  return h;
}

/* ================= results page pieces ================= */
function priceLabel(st) {
  const o = PRICES.find(r => r.min === st.min && r.max === st.max);
  if (o) return o.l;
  if (st.min && st.max) return `${fmt(st.min)} – ${fmt(st.max)}`;
  return st.max ? `Up to ${fmt(st.max)}` : `${fmt(st.min)} & above`;
}
function activeChips(st) {
  const c = [];
  if (st.cat && (st.q || st.mode === 'deals')) c.push(['cat', '', cat(st.cat).name]);
  st.brands.forEach(id => c.push(['brand', id, brand(id).id === 'tbb' ? 'TBB Originals' : brand(id).name]));
  st.concerns.forEach(id => c.push(['concern', id, concern(id).name]));
  if (st.min || st.max) c.push(['price', '', priceLabel(st)]);
  if (st.rating) c.push(['rating', '', `${st.rating}★ & up`]);
  if (st.disc) c.push(['disc', '', `${st.disc}% off or more`]);
  if (st.gift) c.push(['gift', '', 'Free gift eligible']);
  return c;
}
function removeFilter(st, k, v) {
  const n = { ...st, pg: 1, brands: [...st.brands], concerns: [...st.concerns] };
  if (k === 'brand') n.brands = v ? n.brands.filter(x => x !== v) : [];
  if (k === 'concern') n.concerns = v ? n.concerns.filter(x => x !== v) : [];
  if (k === 'price') { n.min = 0; n.max = 0; }
  if (k === 'rating') n.rating = 0;
  if (k === 'disc') n.disc = 0;
  if (k === 'gift') n.gift = false;
  if (k === 'cat') n.cat = '';
  if (k === 'q') n.q = '';
  return n;
}
function relatedSearches(st, R) {
  if (!st.q) return [];
  const nq = norm(st.q), toks = tokens(st.q).map(stem);
  const out = [];
  const add = s => { s = s.toLowerCase(); if (norm(s) !== nq && !out.includes(s)) out.push(s); };
  D.TRENDING.forEach(t => { if (toks.some(k => k.length > 2 && norm(t).includes(k))) add(t); });
  const counts = {};
  R.base.forEach(x => (x.p.concerns || []).forEach(c => { counts[c] = (counts[c] || 0) + 1; }));
  Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 2).forEach(([c]) => add(concern(c).name));
  const bc = {};
  R.base.forEach(x => { if (!x.p.own) bc[x.p.brand] = (bc[x.p.brand] || 0) + 1; });
  Object.entries(bc).sort((a, b) => b[1] - a[1]).slice(0, 2).forEach(([b]) => add(brand(b).name + ' ' + st.q));
  return out.slice(0, 6);
}

const optRow = (type, name, value, label, count, checked) => `<label class="sr-opt${type === 'radio' ? ' is-radio' : ''}${count === 0 && !checked ? ' is-zero' : ''}">
  <input type="${type}" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}><span class="sr-box" aria-hidden="true">${icon('check')}</span><span class="sr-opt-l">${label}</span>${count != null ? `<span class="sr-opt-n">${count}</span>` : ''}</label>`;
const group = (id, title, body, active) => `<fieldset class="sr-g" data-g="${id}"><legend class="sr-g-h"><span>${title}</span></legend>${active ? `<button type="button" class="sr-g-clear" data-action="sr-gclear" data-k="${id}">Clear</button>` : ''}${body}</fieldset>`;

function sidebar(st, R, F, N) {
  const catIds = D.CATS.filter(c => F.cat[c.id] || st.cat === c.id);
  const catBody = optRow('radio', 'cat', '', 'All categories', null, !st.cat) + catIds.map(c => optRow('radio', 'cat', c.id, esc(c.name), F.cat[c.id] || 0, st.cat === c.id)).join('');
  const brandIds = Object.keys(F.brand).concat(st.brands.filter(b => !F.brand[b])).filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => (st.brands.includes(b) - st.brands.includes(a)) || ((F.brand[b] || 0) - (F.brand[a] || 0)) || brand(a).name.localeCompare(brand(b).name));
  const shown = 6;
  const brandBody = brandIds.map((id, i) => {
    const row = optRow('checkbox', 'brand', id, esc(id === 'tbb' ? 'TBB Originals' : brand(id).name) + (id === 'tbb' ? ' <em class="sr-own">Our label</em>' : ''), F.brand[id] || 0, st.brands.includes(id));
    return i >= shown ? row.replace('class="sr-opt', 'class="sr-more-row sr-opt') : row;
  }).join('') + (brandIds.length > shown ? `<button type="button" class="sr-morebtn" data-action="sr-more" aria-expanded="${brandsOpen}">${icon('chevDown')}<span>${brandsOpen ? 'Show fewer' : `See all ${brandIds.length} brands`}</span></button>` : '');
  const concIds = D.CONCERNS.filter(c => F.concern[c.id] || st.concerns.includes(c.id));
  const concBody = `<div class="sr-pills">${concIds.map(c => `<label class="sr-pill"><input type="checkbox" name="concern" value="${c.id}"${st.concerns.includes(c.id) ? ' checked' : ''}><span>${c.emoji} ${esc(c.name)}<i>${F.concern[c.id] || 0}</i></span></label>`).join('')}</div>`;
  const priceSel = PRICES.findIndex(r => r.min === st.min && r.max === st.max);
  const priceBody = PRICES.map((r, i) => optRow('radio', 'price', `${r.min}-${r.max || ''}`, r.l, F.price[i], priceSel === i)).join('') +
    `<div class="sr-price-c"><label class="sr-only" for="sr-min">Minimum price</label><input id="sr-min" name="min" type="number" inputmode="numeric" min="0" placeholder="₹ Min" value="${st.min || ''}"><span aria-hidden="true">–</span><label class="sr-only" for="sr-max">Maximum price</label><input id="sr-max" name="max" type="number" inputmode="numeric" min="0" placeholder="₹ Max" value="${st.max || ''}"><button type="submit" class="sr-go">Go</button></div>`;
  const rateBody = RATINGS.map((r, i) => optRow('radio', 'rating', r, `${H.stars(r)}<span>${r} & up</span>`, F.rating[i], st.rating === r)).join('');
  const discBody = DISCS.map((d, i) => optRow('radio', 'disc', d, `${d}% off or more`, F.disc[i], st.disc === d)).join('');
  return `<aside class="sr-side" id="sr-side" aria-label="Filters">
      <div class="sr-sheet-h"><b>Filters</b><span class="sr-sheet-sub">${plural(N, 'result')}</span><button type="button" class="ib-sm" data-action="sr-sheet-close" aria-label="Close filters">${icon('close')}</button></div>
      <form id="sr-filters" class="sr-form${brandsOpen ? ' brands-open' : ''}" novalidate>
        <label class="sr-giftsw">
          <span class="sr-giftsw-ic">${icon('gift')}</span>
          <span class="sr-giftsw-t"><b>Free gift eligible</b><small>Every item qualifies — choose a TBB mini before you pay</small></span>
          <input type="checkbox" name="gift" value="1" role="switch"${st.gift ? ' checked' : ''}><span class="sr-switch" aria-hidden="true"></span>
        </label>
        ${group('cat', 'Category', catBody, st.cat && st.mode !== 'c')}
        ${concIds.length ? group('concern', 'Shop by concern', concBody, st.concerns.length) : ''}
        ${group('brand', 'Brand', brandBody, st.brands.length)}
        ${group('price', 'Price', priceBody, st.min || st.max)}
        ${group('rating', 'Customer rating', rateBody, st.rating)}
        ${group('disc', 'Discount', discBody, st.disc)}
      </form>
      <div class="sr-sheet-f"><button type="button" class="btn btn-ghost" data-action="sr-sheet-reset">Clear all</button><button type="button" class="btn btn-cart" data-action="sr-apply"><span>Show <b id="sr-apply-n">${N}</b> results</span></button></div>
    </aside>`;
}

function catHead(st, R) {
  const c = cat(st.cat);
  const ps = D.PRODUCTS.filter(p => p.cat === st.cat);
  const brands = [...new Set(ps.map(p => p.brand))];
  const arts = ps.slice().sort((a, b) => pop(b) - pop(a)).slice(0, 3);
  const concs = D.CONCERNS.filter(cn => ps.some(p => (p.concerns || []).includes(cn.id)));
  return `<section class="wrap"><div class="sr-cathead">
      <div class="sr-cathead-copy">
        <nav class="sr-crumb" aria-label="Breadcrumb"><a href="#/">Home</a>${icon('chevRight')}<span aria-current="page">${esc(c.name)}</span></nav>
        <h1>${esc(c.name)}</h1>
        <p>${plural(ps.length, 'product')} from ${plural(brands.length, 'brand')} · every order ships with a free TBB mini</p>
        ${concs.length ? `<div class="sr-cathead-chips">${concs.map(cn => `<a class="sr-cchip${st.concerns.includes(cn.id) ? ' on' : ''}" href="#/c/${st.cat}?concern=${cn.id}">${cn.emoji} ${esc(cn.name)}</a>`).join('')}</div>` : ''}
      </div>
      <div class="sr-cathead-brands" aria-label="Brands in ${esc(c.name)}">${brands.slice(0, 6).map(b => `<a href="#/brand/${b}" class="sr-cbrand">${UI.brandLogo(b, { size: 14 })}</a>`).join('')}</div>
      <div class="sr-cathead-art" aria-hidden="true">${arts.map((p, i) => `<span class="a${i}" style="--tint:${p.c1}">${art(p)}</span>`).join('')}</div>
    </div></section>`;
}
/* concern landing (#/s?concern=acne): the concern sponsor gets a "Presented by" credit (H4) */
function concernHead(st) {
  const cn = concern(st.concerns[0]);
  const ps = D.PRODUCTS.filter(p => (p.concerns || []).includes(cn.id));
  const nBrands = new Set(ps.map(p => p.brand)).size;
  const arts = ps.slice().sort((a, b) => pop(b) - pop(a)).slice(0, 3);
  const sp = cn.sponsor && D.BRANDS.find(b => b.id === cn.sponsor);
  const presented = sp ? UI.slot('H4', `<a class="sr-presented" href="#/brand/${sp.id}" aria-label="Presented by ${esc(sp.name)} — advertisement">
      ${UI.adBadge()}<span class="sr-presented-t">Presented by</span><span class="sr-presented-l">${UI.brandLogo(sp.id, { size: 16 })}</span>${icon('chevRight')}
    </a>`, { cls: 'sr-presented-slot' }) : '';
  return `<section class="wrap"><div class="sr-cathead sr-conhead">
      <div class="sr-cathead-copy">
        <nav class="sr-crumb" aria-label="Breadcrumb"><a href="#/">Home</a>${icon('chevRight')}<span>Shop by concern</span>${icon('chevRight')}<span aria-current="page">${esc(cn.name)}</span></nav>
        <div class="sr-conhead-t"><span class="sr-con-emo" aria-hidden="true">${cn.emoji}</span><h1>${esc(cn.name)}</h1>${presented}</div>
        <p>${plural(ps.length, 'product')} from ${plural(nBrands, 'brand')}, hand-picked for ${esc(cn.name.toLowerCase())} · a free TBB mini in every order</p>
        <div class="sr-cathead-chips" aria-label="Other concerns">${D.CONCERNS.filter(c => c.id !== cn.id).map(c => `<a class="sr-cchip" href="#/s?concern=${c.id}">${c.emoji} ${esc(c.name)}</a>`).join('')}</div>
      </div>
      <div class="sr-cathead-art" data-n="${arts.length}" aria-hidden="true">${arts.map((p, i) => `<span class="a${i}" style="--tint:${p.c1}">${art(p)}</span>`).join('')}</div>
    </div></section>`;
}
function cdParts() {
  const n = new Date(), e = new Date(n); e.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((e - n) / 1000));
  return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(v => String(v).padStart(2, '0'));
}
function dealHead(st, R) {
  const all = D.PRODUCTS.filter(p => off(p) >= 15);
  const maxOff = Math.max(...all.map(off));
  const [h, m, s] = cdParts();
  const chips = [
    ['All deals', '#/deals', !st.cat && !st.max && !st.disc && !st.brands.length],
    ['Under ₹299', '#/deals?max=299', st.max === 299 && !st.cat],
    ['25% off & more', '#/deals?disc=25', st.disc === 25],
    ['Skincare', '#/deals?cat=skin', st.cat === 'skin'],
    ['Haircare', '#/deals?cat=hair', st.cat === 'hair'],
    ['Hair Oils', '#/deals?cat=oil', st.cat === 'oil'],
    ['Makeup', '#/deals?cat=makeup', st.cat === 'makeup'],
    ['Men', '#/deals?cat=men', st.cat === 'men'],
    ['Fragrance', '#/deals?cat=fragrance', st.cat === 'fragrance'],
    ['TBB Originals', '#/deals?brand=tbb', st.brands.length === 1 && st.brands[0] === 'tbb'],
  ];
  const hero = all.slice().sort((a, b) => off(b) - off(a)).slice(0, 3);
  return `<section class="wrap"><div class="sr-dealhero">
      <div class="sr-dh-copy">
        <span class="sr-dh-k">${icon('zap')} Today’s Deals</span>
        <h1>Up to ${maxOff}% off India’s favourite beauty brands</h1>
        <p>${plural(all.length, 'deal')} live now · new deals drop at midnight · a free TBB gift in every box</p>
      </div>
      <div class="sr-dh-cd" role="timer" aria-label="Deals end in">
        <small>Deals end in</small>
        <div class="sr-cd"><span><b data-cd="0">${h}</b><i>hrs</i></span><em>:</em><span><b data-cd="1">${m}</b><i>min</i></span><em>:</em><span><b data-cd="2">${s}</b><i>sec</i></span></div>
      </div>
      <div class="sr-dh-art" aria-hidden="true">${hero.map((p, i) => `<span class="a${i}" style="--tint:${p.c1}">${art(p)}<em>-${off(p)}%</em></span>`).join('')}</div>
      <nav class="sr-dchips" aria-label="Deal types">${chips.map(([l, href, on]) => `<a class="sr-dchip${on ? ' on' : ''}" href="${href}"${on ? ' aria-current="true"' : ''}>${esc(l)}</a>`).join('')}</nav>
    </div></section>`;
}

function emptyHtml(st, R) {
  if (R.base.length) {
    return `<div class="sr-empty blk"><div class="sr-empty-ic">${icon('filter')}</div><h2>No products match these filters</h2><p>There are ${plural(R.base.length, 'result')} without them — try removing a filter or two.</p><button class="btn btn-cart" data-action="sr-clear">Clear all filters</button></div>`;
  }
  const spPicks = S.slotOn.S3 === false ? [] : D.PRODUCTS.filter(p => !p.own && BID[p.brand]).sort((a, b) => BID[b.brand] * pop(b) - BID[a.brand] * pop(a)).filter((p, i, a) => a.findIndex(x => x.brand === p.brand) === i).slice(0, 4);
  return `<div class="sr-empty blk">
      <svg class="sr-empty-art" viewBox="0 0 160 120" aria-hidden="true"><circle cx="70" cy="56" r="34" fill="#fff0f3" stroke="#ff3d6e" stroke-width="6"/><path d="M95 82l26 26" stroke="#140a24" stroke-width="10" stroke-linecap="round"/><path d="M58 50h24M58 62h16" stroke="#ffb3c4" stroke-width="5" stroke-linecap="round"/><path d="M128 22l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#ffb347"/><path d="M24 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#5b35e0"/></svg>
      <h2>No results for “${esc(st.q)}”</h2>
      <p>Check the spelling, try a more general word — or start with what India is searching for:</p>
      <div class="sr-empty-chips">${D.TRENDING.map(t => `<a class="chip" href="#/s?q=${encodeURIComponent(t)}">${icon('trending')}${esc(t)}</a>`).join('')}</div>
      <div class="sr-empty-cats">${D.CATS.map(c => { const p = D.PRODUCTS.filter(x => x.cat === c.id).sort((a, b) => pop(b) - pop(a))[0]; return `<a href="#/c/${c.id}"><span class="sr-ec-art" style="--tint:${p ? p.c1 : '#ddd'}">${p ? art(p) : ''}</span><span>${esc(c.short)}</span></a>`; }).join('')}</div>
    </div>
    ${spPicks.length ? `<section class="blk sr-empty-sp"><div class="blk-h"><h2>Popular right now</h2>${UI.spLabel('Sponsored')}</div><div class="sr-grid sr-grid-4">${spPicks.map(p => UI.productCard(p, { sponsored: true, slot: 'S3' })).join('')}</div></section>` : ''}`;
}

/* small result sets: monetise the empty space with related sponsored products (S3).
   s4 (optional) = the in-grid native ad, moved here so it never sits alone on a half-empty row. */
function alsoConsidered(R, s4) {
  if (!R.items.length || R.items.length >= 8) return '';
  const ids = new Set(R.items.map(x => x.p.id));
  const cats = new Set(R.items.map(x => x.p.cat));
  const n = s4 ? 3 : 4;
  const picks = S.slotOn.S3 === false ? [] : D.PRODUCTS.filter(p => !ids.has(p.id) && !p.own && BID[p.brand] && cats.has(p.cat) && (!s4 || p.brand !== s4.brand))
    .sort((a, b) => BID[b.brand] * pop(b) - BID[a.brand] * pop(a))
    .filter((p, i, a) => a.findIndex(x => x.brand === p.brand) === i).slice(0, n);
  if (!picks.length) return '';
  const tiles = (s4 ? [s4Html(s4)] : []).concat(picks.map(p => UI.productCard(p, { sponsored: true, slot: 'S3', compact: true })));
  return `<section class="blk sr-also"><div class="blk-h"><h2>Customers also considered</h2>${UI.spLabel('Sponsored')}</div><div class="sr-grid sr-grid-4">${tiles.join('')}</div></section>`;
}

function renderResults(route) {
  const st = cur = readState(route);
  const R = compute(st);
  const N = R.items.length;
  const F = facets(R.base, st);
  const nSp = N >= 16 ? 4 : N >= 8 ? 3 : N >= 4 ? 2 : 0;
  const sp = pickSponsored(R.items, st, nSp);
  const spIds = new Set(sp.map(x => x.p.id));
  const ordered = [...sp.map(x => ({ ...x, sp: true })), ...sortItems(R.items, st).filter(x => !spIds.has(x.p.id))];
  const pages = Math.max(1, Math.ceil(N / PER));
  const pg = Math.min(st.pg, pages);
  const slice = ordered.slice((pg - 1) * PER, pg * PER);
  const from = N ? (pg - 1) * PER + 1 : 0, to = Math.min(N, pg * PER);
  const s2 = N || R.base.length ? chooseS2(st, R) : null;
  const avoid = new Set([s2 && s2.brand, ...sp.map(x => x.p.brand), 'tbb'].filter(Boolean));
  const noun = st.mode === 'deals' ? (N === 1 ? 'deal' : 'deals') : (N === 1 ? 'result' : 'results');
  const sortName = { best: 'Bestsellers', new: 'New launches' }[st.sort];
  const ctx = st.q ? `for <q>${esc(st.q)}</q>` : st.mode === 'c' && st.cat ? `in <b>${esc(cat(st.cat).name)}</b>` : st.mode === 'deals' ? (st.cat ? `in <b>${esc(cat(st.cat).name)}</b>` : 'live today') : sortName ? `in <b>${sortName}</b>` : st.concerns.length === 1 ? `for <b>${esc(concern(st.concerns[0]).name)}</b>` : st.brands.length === 1 ? `from <b>${esc(brand(st.brands[0]).name)}</b>` : 'across all brands';
  const countHtml = N ? `<b>${from}–${to}</b> of <b>${N}</b> ${noun} ${ctx}` : `<b>0</b> ${noun} ${ctx}`;
  const chips = activeChips(st);
  const nActive = chips.length;
  const rel = relatedSearches(st, R);
  const showSide = R.base.length > 0;
  const sortSel = (id) => `<select class="sr-sort" id="${id}" aria-label="Sort results">${SORTS.map(([v, l]) => `<option value="${v}"${st.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;

  let cards = slice.map(x => st.mode === 'deals' ? dealCard(x.p, x.sp) : UI.productCard(x.p, x.sp ? { sponsored: true, slot: 'S3' } : {}));
  /* S4 native tile: 7th position in a full grid; on small result sets it leads the
     "Customers also considered" row instead of sitting alone on a half-empty row */
  const s4cr = pg === 1 && N ? chooseS4(st, R, avoid) : null;
  let also;
  if (s4cr && cards.length >= 7) { cards.splice(6, 0, s4Html(s4cr)); also = alsoConsidered(R, null); }
  else {
    also = alsoConsidered(R, s4cr);
    if (s4cr && !also && cards.length >= 3) cards.push(s4Html(s4cr));   // fallback when S3 is paused
  }
  const conHead = st.mode === 's' && !st.q && !st.cat && !st.brands.length && st.concerns.length === 1 ? concernHead(st) : '';
  const countTag = st.mode === 's' && !conHead ? 'h1' : 'p';
  const pager = pages > 1 ? `<nav class="sr-pager" aria-label="Results pages">
      <button type="button" data-action="sr-pg" data-pg="${pg - 1}"${pg === 1 ? ' disabled' : ''}>${icon('chevLeft')}<span>Previous</span></button>
      ${Array.from({ length: pages }, (_, i) => `<button type="button" data-action="sr-pg" data-pg="${i + 1}"${i + 1 === pg ? ' aria-current="page"' : ''} aria-label="Page ${i + 1}">${i + 1}</button>`).join('')}
      <button type="button" data-action="sr-pg" data-pg="${pg + 1}"${pg === pages ? ' disabled' : ''}><span>Next</span>${icon('chevRight')}</button>
    </nav>` : '';

  return `<div class="sr-page sr-results sr-mode-${st.mode}">
    ${st.mode === 'c' && st.cat ? catHead(st, R) : ''}
    ${st.mode === 'deals' ? dealHead(st, R) : ''}
    ${conHead}
    <div class="wrap">
      <div class="sr-bar">
        <div class="sr-bar-t"><${countTag} class="sr-count">${countHtml}</${countTag}>${R.qs && R.qs.loose ? `<p class="sr-loose">No exact match for all the words — showing the closest results.</p>` : ''}</div>
        ${rel.length ? `<nav class="sr-rel" aria-label="Related searches"><span>Related:</span>${rel.map(r => `<a href="#/s?q=${encodeURIComponent(r)}">${esc(r)}</a>`).join('')}</nav>` : '<span class="sr-bar-sp"></span>'}
        ${N ? `<label class="sr-sortw" for="sr-sort-d"><span>Sort by</span>${sortSel('sr-sort-d')}${icon('chevDown')}</label>` : ''}
      </div>
      ${showSide ? `<div class="sr-mctl">
        <button type="button" class="sr-fbtn" data-action="sr-sheet" aria-controls="sr-side" aria-haspopup="dialog">${icon('sliders')}<span>Filters</span>${nActive ? `<i>${nActive}</i>` : ''}</button>
        <label class="sr-msort" for="sr-sort-m"><span class="sr-only">Sort by</span>${icon('chart')}${sortSel('sr-sort-m')}${icon('chevDown')}</label>
      </div>` : ''}
      <div class="sr-layout${showSide ? '' : ' no-side'}" data-sr-anchor>
        ${showSide ? sidebar(st, R, F, N) : ''}
        <div class="sr-main">
          ${s2Html(s2)}
          ${nActive ? `<div class="sr-active" aria-label="Active filters">${chips.map(([k, v, l]) => `<button type="button" class="sr-chip" data-action="sr-rm" data-k="${k}" data-v="${esc(v)}" aria-label="Remove filter ${esc(l)}">${esc(l)}${icon('close')}</button>`).join('')}<button type="button" class="sr-clearall" data-action="sr-clear">Clear all</button></div>` : ''}
          ${st.gift && N ? `<div class="sr-giftnote">${icon('gift')}<span><b>All ${plural(N, 'result')} qualify for a free TBB mini.</b> Pick it at checkout, before you pay — ${TBB.gift.tiers().filter(t => t.min > 0).map(t => `${t.count} gifts on ${fmt(t.min)}+`).join(', ')}.</span><a class="link" href="#/gifts">See gifts</a></div>` : ''}
          ${N ? `<div class="sr-gh"><h2>${st.mode === 'deals' ? 'Deals' : 'Results'}</h2><span>Prices include GST · ${st.mode === 'deals' ? 'while stocks last' : 'sponsored listings are marked'}</span></div>
          <div class="sr-grid">${cards.join('')}</div>${pager}${also}` : emptyHtml(st, R)}
        </div>
      </div>
    </div>
    <div class="sr-scrim" data-action="sr-sheet-close"></div>
  </div>`;
}

/* ================= free gift store ================= */
function giftStatus() {
  const sub = TBB.cart.subtotal(), allow = TBB.gift.allowance(sub), nt = TBB.gift.next(sub), tiers = TBB.gift.tiers();
  const top = Math.max(1, ...tiers.map(t => t.min));
  const pct = Math.min(100, sub / top * 100);
  const msg = !sub ? 'Your cart is empty — add any product to unlock your first free gift.'
    : nt ? `You’ve unlocked <b>${plural(allow, 'free gift')}</b>. Add <b>${fmt(nt.min - sub)}</b> more to unlock ${nt.count}.`
    : `Brilliant — you’ve unlocked the maximum <b>${plural(allow, 'free gift')}</b>.`;
  return `<div class="sr-gstat" id="sr-gstat" aria-live="polite">
      <div class="sr-gstat-t">${icon('gift')}<span>${msg}</span>${sub ? `<a href="#/cart" class="sr-gstat-l">Cart · ${fmt(sub)}</a>` : ''}</div>
      <div class="sr-gbar"><span style="width:${pct}%"></span>${tiers.filter(t => t.min > 0).map(t => `<i style="left:${t.min / top * 100}%" class="${sub >= t.min ? 'on' : ''}"><em>${fmt(t.min)}</em></i>`).join('')}</div>
    </div>`;
}
function giftBox(gifts) {
  return `<div class="sr-gbox" aria-hidden="true">
      <div class="sr-gbox-glow"></div>
      ${gifts.map((g, i) => `<span class="sr-gbox-m m${i}" style="--tint:${g.c1}">${art(g)}</span>`).join('')}
      <div class="sr-gbox-lid"><i></i></div>
      <div class="sr-gbox-body"><i></i><span>FREE</span></div>
      <div class="sr-gbox-tag"><small>with every order</small><b>Your pick</b></div>
    </div>`;
}
function renderGifts() {
  const tiers = TBB.gift.tiers();
  const gifts = D.TBB_GIFTS;
  const active = new Set(TBB.gift.active().map(g => g.id));
  const maxCount = Math.max(1, ...tiers.map(t => t.count));
  const worthMax = gifts.filter(g => active.has(g.id)).map(g => g.worth).sort((a, b) => b - a).slice(0, maxCount).reduce((a, b) => a + b, 0);
  const allow = TBB.gift.allowance();
  const tierTxt = t => t.min <= 0 ? 'On every order' : `On orders of ${fmt(t.min)}+`;
  const brandsN = D.BRANDS.filter(b => !b.own).length;
  const x1d = H.slotDef('X1');
  const plum = H.product('plum-gt'), mini = H.product('tbb-vitc');
  const x1 = UI.slot('X1', `<div class="sr-x1">
      <div class="sr-x1-art" aria-hidden="true"><span class="sr-x1-box"></span><span class="sr-x1-p">${art(plum)}</span><span class="sr-x1-g">${art(mini)}</span></div>
      <div class="sr-x1-copy">
        <div class="sr-x1-lbl">${UI.adBadge()}<span>Partner sample · this week</span></div>
        <h3>A Plum Green Tea mini rides along in every box over ₹499</h3>
        <p>On top of your free TBB gift — courtesy of Plum. No code, no catch.</p>
        <a class="btn btn-dark" href="#/brand/plum">Shop Plum ${icon('arrow')}</a>
      </div>
    </div>`, { cls: 'sr-x1-slot' });
  return `<div class="sr-page sr-gifts">
    <section class="wrap"><div class="sr-ghero">
      <div class="sr-ghero-copy">
        <span class="sr-kicker">${icon('sparkle')} Only on The Big Brands</span>
        <h1>The <em>Free Gift</em> Store</h1>
        <p class="sr-lede">Shop any of our ${brandsN} brands and pick a <b>TBB Originals</b> mini before you pay. It ships in the same box — on us.</p>
        <div class="sr-ghero-cta"><a class="btn btn-cart btn-lg" href="#/s?sort=best">Start shopping ${icon('arrow')}</a><button type="button" class="btn btn-ghost btn-lg" data-action="sr-jump" data-to="sr-how">How it works</button></div>
        <ul class="sr-ghero-pts"><li>${icon('check')}No coupon needed</li><li>${icon('check')}Up to ${plural(maxCount, 'gift')} per order</li><li>${icon('check')}Worth up to ${fmt(worthMax)}</li></ul>
      </div>
      ${giftBox(gifts)}
    </div></section>

    <section class="wrap sr-sec"><div class="sr-tiers">
      <div class="sr-tiers-h"><span class="sr-kicker sr-kicker-d">${icon('layers')} Gift tiers</span><h2>The more you shop, the more you pick</h2><p>Tiers apply automatically to your cart total.</p></div>
      <ol class="sr-tierlist">${tiers.map((t, i) => `<li class="${allow >= t.count ? 'is-on' : ''}"><span class="sr-tier-n">${t.count}</span><div><b>${plural(t.count, 'free gift')}</b><small>${tierTxt(t)}</small></div>${i < tiers.length - 1 ? `<span class="sr-tier-arrow" aria-hidden="true">${icon('chevRight')}</span>` : ''}</li>`).join('')}</ol>
      ${giftStatus()}
    </div></section>

    <section class="wrap sr-sec" id="sr-how"><div class="sr-steps">
      ${[['bag', 'Shop any brand', `Add anything from ${brandsN} brands — every product, every order qualifies.`],
        ['gift', 'Pick your free mini', 'At checkout, choose your TBB Originals gift before you pay. Swap it any time.'],
        ['truck', 'Unbox both together', `Your gift travels in the same box — arriving by ${H.deliveryDate(3)}.`]]
        .map(([ic, t, d], i) => `<div class="sr-step"><span class="sr-step-n">0${i + 1}</span><span class="sr-step-ic">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}
    </div></section>

    <section class="wrap sr-sec"><div class="blk">
      <div class="blk-h"><h2>Choose from ${gifts.length} TBB Originals minis</h2><span class="sr-blk-sub">Live stock · refreshed every Monday</span></div>
      <div class="sr-minis">${gifts.map(g => {
        const on = active.has(g.id), stock = S.giftStock[g.id] || 0, low = stock < 60;
        return `<article class="sr-mini${on ? '' : ' is-off'}">
          <a class="sr-mini-img" href="#/p/${g.id}" style="--tint:${g.c1}">${art(g)}<span class="sr-mini-free">${on ? 'FREE' : 'Back soon'}</span></a>
          <div class="sr-mini-b">
            <b>${esc(g.name)}</b>
            <span class="sr-mini-sz">${esc(g.mini)}</span>
            <span class="sr-mini-pr"><em>₹0</em><span>worth <s>${fmt(g.worth)}</s></span></span>
            <span class="sr-mini-st${low && on ? ' low' : ''}"><span style="width:${Math.min(100, stock / 7)}%"></span></span>
            <small class="sr-mini-stt">${on ? (low ? `Only ${stock} left this week` : `${stock} left this week`) : 'Paused by the store'}</small>
            <a class="sr-mini-full" href="#/p/${g.id}">Full size ${fmt(g.price)}${icon('chevRight')}</a>
          </div>
        </article>`; }).join('')}</div>
    </div></section>

    <section class="wrap sr-sec"><div class="blk">
      <div class="blk-h"><h2>Loved your mini? Get the full size</h2><a class="link" href="#/brand/tbb">Visit TBB Originals ${icon('arrow')}</a></div>
      <div class="sr-grid sr-grid-6">${gifts.map(g => UI.productCard(H.product(g.id), { compact: true })).join('')}</div>
    </div></section>

    <section class="wrap sr-sec sr-x1row">
      ${x1}
      <div class="sr-pitch">
        <span class="sr-pitch-ic">${icon('box')}</span>
        <h3>Brands: get inside thousands of boxes</h3>
        <p>Put your sample or flyer in every delivery — the beauty ad customers actually open. From ${x1d ? H.rateText(x1d) : '₹4/box'}.</p>
        <a class="link" href="#/advertise">See in-box sampling ${icon('arrow')}</a>
      </div>
    </section>

    <section class="wrap sr-sec"><div class="blk sr-faq">
      <h2>Good to know</h2>
      ${[['Is the gift really free?', 'Yes. Your mini is added at ₹0 — no coupon code, and your first gift has no minimum order value.'],
        ['When do I choose my gift?', 'On the checkout page, just before payment. You can change your pick until you pay.'],
        ['Can I get more than one?', tiers.map(t => `${plural(t.count, 'gift')} ${t.min ? `on orders of ${fmt(t.min)} or more` : 'on every order'}`).join(' · ') + '.'],
        ['What if I return my order?', 'Keep the gift — it’s yours. Returns of other items are not affected.']]
        .map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}${icon('chevDown')}</summary><p>${a}</p></details>`).join('')}
    </div></section>

    <section class="wrap sr-sec"><div class="sr-cta">
      <div><h2>Your free gift is one order away</h2><p>Add anything to your cart — we’ll take care of the rest.</p></div>
      <div class="sr-cta-b"><a class="btn btn-light btn-lg" href="#/deals">${icon('zap')} Today’s Deals</a><a class="btn btn-lg sr-btn-line" href="#/brands">Brand stores ${icon('arrow')}</a></div>
    </div></section>
  </div>`;
}

/* ================= brand directory ================= */
function brandGroups(id) {
  const cats = new Set(brandProducts(id).map(p => p.cat));
  return BGROUPS.filter(([g, , cs]) => g !== 'all' && cs.some(c => cats.has(c))).map(([g]) => g);
}
function dirMatch(b) {
  const q = norm(dirQ);
  return (!q || norm(b.name + ' ' + b.word + ' ' + b.tagline).includes(q)) && (dirG === 'all' || brandGroups(b.id).includes(dirG));
}
function renderBrands() {
  const all = D.BRANDS.slice().sort((a, b) => (b.own ? 1 : 0) - (a.own ? 1 : 0) || a.name.localeCompare(b.name));
  const b1 = H.slotDef('B1');
  const taken = b1 ? Math.round(b1.units * b1.fill) : 11;
  const tile = b => {
    const st = brandStats(b.id);
    const arts = st.ps.slice().sort((x, y) => pop(y) - pop(x)).slice(0, 3);
    const hidden = !dirMatch(b);
    return `<a class="sr-bt${b.own ? ' is-own' : ''}" href="#/brand/${b.id}" data-name="${esc(norm(b.name + ' ' + b.word + ' ' + b.tagline))}" data-groups="${brandGroups(b.id).join(' ')}"${hidden ? ' hidden' : ''}>
        <span class="sr-bt-top" style="--ba:${b.own ? '#fff0f3' : b.accent || '#f4f3f8'}">
          <span class="sr-bt-logo">${UI.brandLogo(b.id, { size: b.word && b.word.length > 10 ? 17 : 22 })}</span>
          <span class="sr-bt-arts" aria-hidden="true">${arts.map(p => `<span>${art(p)}</span>`).join('')}</span>
          ${b.own ? '<span class="sr-bt-own">Free-gift label</span>' : ''}
        </span>
        <span class="sr-bt-b">
          <b>${esc(b.own ? 'TBB Originals' : b.name)}<span class="sr-verified" title="Official store">${icon('check')}</span></b>
          <small>${esc(b.tagline || '')}</small>
          <span class="sr-bt-meta"><span>${plural(st.n, 'product')}</span><span>${icon('star')}${st.avg}</span><span>${kfmt(st.followers)} followers</span></span>
        </span>
        <span class="sr-bt-go">Visit store ${icon('arrow')}</span>
      </a>`;
  };
  /* H7 = "Featured Brand Stores" (brand tile linking to the store); B1 is the store page itself */
  const feat = UI.slot('H7', `<div class="sr-feat">${FEATURED.map(id => {
      const b = brand(id), th = darkTheme(b), cp = COPY[id] || {}, st = brandStats(id);
      const arts = st.ps.slice().sort((x, y) => pop(y) - pop(x)).slice(0, 3);
      return `<a class="sr-fc" href="#/brand/${id}" style="--fc-bg:${th.bg}">
        <span class="sr-fc-top">${UI.adBadge()}<span>${icon('star')}${st.avg} · ${plural(st.n, 'product')}</span></span>
        <span class="sr-fc-logo">${UI.brandLogo(id, { size: 30, color: '#fff' })}</span>
        <span class="sr-fc-h">${esc(cp.h || b.tagline)}</span>
        <span class="sr-fc-arts" aria-hidden="true">${arts.map(p => `<span>${art(p)}</span>`).join('')}</span>
        <span class="sr-fc-go">Visit store ${icon('arrow')}</span>
      </a>`; }).join('')}</div>`, { cls: 'sr-feat-slot' });
  return `<div class="sr-page sr-brands">
    <section class="wrap"><div class="sr-dirhead">
      <div class="sr-dirhead-copy">
        <nav class="sr-crumb" aria-label="Breadcrumb"><a href="#/">Home</a>${icon('chevRight')}<span aria-current="page">Brand stores</span></nav>
        <h1>Brand Stores</h1>
        <p>Official stores of ${D.BRANDS.length} beauty brands — 100% authentic, sourced direct, and every order ships with a free gift.</p>
      </div>
      <div class="sr-dirtools">
        <label class="sr-find">${icon('search')}<span class="sr-only">Find a brand</span><input id="sr-bfind" type="search" placeholder="Find a brand…" value="${esc(dirQ)}" autocomplete="off"></label>
        <div class="sr-bgroups" role="group" aria-label="Filter brands by category">${BGROUPS.map(([g, l]) => `<button type="button" class="chip${dirG === g ? ' on' : ''}" data-action="sr-bgrp" data-g="${g}" aria-pressed="${dirG === g}">${l}</button>`).join('')}</div>
      </div>
    </div></section>
    ${feat ? `<section class="wrap sr-sec"><div class="sr-sech"><h2>Featured stores</h2>${UI.spLabel('Sponsored')}</div>${feat}</section>` : ''}
    <section class="wrap sr-sec">
      <div class="sr-sech"><h2>All brands <span class="sr-count-n" id="sr-bcount">${all.filter(dirMatch).length}</span></h2></div>
      <div class="sr-bgrid" id="sr-bgrid">${all.map(tile).join('')}</div>
      <div class="sr-bnone blk" id="sr-bnone"${all.some(dirMatch) ? ' hidden' : ''}><b>No brands match “<span id="sr-bnone-q">${esc(dirQ)}</span>”</b><p class="muted">Try another name, or <button type="button" class="link" data-action="sr-bgrp" data-g="all" data-reset="1">see all brands</button>.</p></div>
    </section>
    <section class="wrap sr-sec"><div class="sr-bpromo">
      <div class="sr-bp-copy">
        <span class="sr-kicker sr-kicker-d">${icon('megaphone')} For brands</span>
        <h2>Get your own brand store</h2>
        <p>Your banner, wordmark, coupons and full catalogue on one page you control — plus a spot in “Similar brands” across the site.</p>
        <ul><li>${icon('check')}Custom hero banner in your brand colours</li><li>${icon('check')}Followers, coupons & store analytics</li><li>${icon('check')}Listed in this directory and in search</li></ul>
        <div class="sr-bp-buy"><div class="sr-bp-price"><b>${b1 ? fmt(b1.rate) : '₹5,000'}</b><span>/month<br>B1 · Brand Store</span></div><a class="btn btn-cart btn-lg" href="#/advertise">Book a brand store ${icon('arrow')}</a></div>
        <small class="sr-bp-scar">${icon('zap')} ${taken} of ${b1 ? b1.units : 15} stores taken this month</small>
      </div>
      <div class="sr-bp-mock" aria-hidden="true">
        <div class="sr-bp-win"><i></i><i></i><i></i><span>thebigbrands.co.in/brand/your-brand</span></div>
        <div class="sr-bp-hero"><b>YOUR BRAND</b><small>Your tagline here</small><span class="sr-bp-fol">${icon('plus')} Follow</span></div>
        <div class="sr-bp-tabs"><span class="on">All</span><span>Bestsellers</span><span>Offers</span></div>
        <div class="sr-bp-grid">${['lo-hyal', 'cet-moist', 'him-fw', 'nivea-cream'].map(id => `<span>${art(H.product(id))}</span>`).join('')}</div>
      </div>
    </div></section>
  </div>`;
}
function filterDir() {
  let n = 0;
  document.querySelectorAll('#sr-bgrid .sr-bt').forEach(el => {
    const q = norm(dirQ);
    const ok = (!q || el.dataset.name.includes(q)) && (dirG === 'all' || el.dataset.groups.split(' ').includes(dirG));
    el.hidden = !ok; if (ok) n++;
  });
  const c = document.getElementById('sr-bcount'); if (c) c.textContent = n;
  const none = document.getElementById('sr-bnone'); if (none) none.hidden = n > 0;
  const nq = document.getElementById('sr-bnone-q'); if (nq) nq.textContent = dirQ || 'this category';
}

/* ================= brand store ================= */
function brandHeroTheme(b) {
  if (b.own) return { bg: 'radial-gradient(60% 90% at 85% 30%, rgba(255,243,196,.55), transparent 60%), linear-gradient(120deg, #e8245a 0%, #ff3d6e 40%, #ff7a45 100%)', ac: '#fff3c4' };
  const c = b.color;
  if (lum(c) < 0.15) {
    const ac = b.accent && lum(b.accent) < 0.85 ? b.accent : '#d9d9de';
    return { bg: `radial-gradient(55% 90% at 82% 35%, ${ac}55, transparent 62%), linear-gradient(120deg, #0a0a0c 0%, #1c1c21 55%, #2c2c33 100%)`, ac };
  }
  return { bg: `radial-gradient(55% 90% at 82% 35%, rgba(255,255,255,.28), transparent 62%), linear-gradient(120deg, ${shade(c, -0.55)} 0%, ${shade(c, -0.15)} 50%, ${c} 100%)`, ac: shade(c, 0.8) };
}
function similarBrands(b) {
  const cats = new Set(brandProducts(b.id).map(p => p.cat));
  return D.BRANDS.filter(x => x.id !== b.id && !x.own)
    .map(x => ({ x, s: brandProducts(x.id).filter(p => cats.has(p.cat)).length * 10 + (BID[x.id] || 0) }))
    .sort((a, c) => c.s - a.s).slice(0, 8).map(o => o.x);
}
function renderBrand(route) {
  const id = route.seg[1] || '';
  const b = D.BRANDS.find(x => x.id === id);
  if (!b) {
    const sug = D.BRANDS.filter(x => !x.own).sort((a, c) => (BID[c.id] || 0) - (BID[a.id] || 0)).slice(0, 6);
    return `<div class="sr-page"><section class="wrap"><div class="blk sr-nf">
        <span class="sr-nf-ic">${icon('store')}</span>
        <h1>We couldn’t find that brand store</h1>
        <p class="muted">${id ? `“${esc(id)}” isn’t on The Big Brands yet.` : 'No brand was selected.'} Here are a few stores shoppers love:</p>
        <div class="sr-nf-brands">${sug.map(x => `<a href="#/brand/${x.id}" style="--ba:${x.accent}">${UI.brandLogo(x.id, { size: 18 })}</a>`).join('')}</div>
        <div class="sr-nf-cta"><a class="btn btn-cart" href="#/brands">See all brand stores</a><a class="btn btn-ghost" href="#/s?q=${encodeURIComponent(id)}">Search “${esc(id)}”</a></div>
      </div></section></div>`;
  }
  const own = !!b.own;
  const st = brandStats(b.id);
  const tab = ['all', 'best', 'low'].includes(route.q.get('tab')) ? route.q.get('tab') : 'all';
  const th = brandHeroTheme(b);
  const name = own ? 'TBB Originals' : b.name;
  const following = follows.includes(b.id);
  const cp = D.COUPONS.find(c => c.brand === b.id);
  const clipped = cp && S.clipped.includes(cp.id);
  const heroArts = st.ps.slice().sort((x, y) => pop(y) - pop(x)).slice(0, 3);
  const concs = D.CONCERNS.filter(c => st.ps.some(p => (p.concerns || []).includes(c.id)));
  const byRev = st.ps.slice().sort((x, y) => y.reviews - x.reviews);
  const list = tab === 'low' ? st.ps.slice().sort((x, y) => x.price - y.price) : tab === 'best' ? byRev : st.ps.slice().sort((x, y) => pop(y) - pop(x));
  const cards = list.map(p => {
    let h = UI.productCard(p);
    const r = byRev.indexOf(p);
    if (tab === 'best' && r < 3) h = h.replace('<div class="pc-body">', `<div class="pc-body"><span class="sr-rank">#${r + 1} Bestseller in ${esc(name)}</span>`);
    return h;
  }).join('');
  const hero = `<section class="sr-bh${own ? ' is-own' : ''}" style="--bh-bg:${th.bg};--bh-ac:${th.ac}">
      <div class="sr-bh-lbl">${own ? UI.adBadge('The Big Brands') : `${UI.adBadge()}<span>Sponsored brand store</span>`}</div>
      <div class="sr-bh-copy">
        <nav class="sr-crumb sr-crumb-l" aria-label="Breadcrumb"><a href="#/">Home</a>${icon('chevRight')}<a href="#/brands">Brand stores</a>${icon('chevRight')}<span aria-current="page">${esc(name)}</span></nav>
        <h1 class="sr-bh-word">${UI.brandLogo(b.id, { size: own ? 54 : 62, color: '#ffffff' })}<span class="sr-only">${esc(name)}</span></h1>
        <p class="sr-bh-tl">${esc(b.tagline || '')}</p>
        <div class="sr-bh-ver">${icon('shield')}<span>${own ? 'Made by The Big Brands · free in every order' : 'Official store · 100% authentic · sourced direct'}</span></div>
        <div class="sr-bh-act">
          <button type="button" class="sr-follow${following ? ' on' : ''}" data-action="sr-follow" data-id="${b.id}" aria-pressed="${following}">${icon(following ? 'check' : 'plus')}<span>${following ? 'Following' : 'Follow'}</span></button>
          <dl class="sr-bh-stats">
            <div><dt>Avg rating</dt><dd>${icon('star')}${st.avg}</dd></div>
            <div><dt>Products</dt><dd>${st.n}</dd></div>
            <div><dt>Followers</dt><dd data-fol>${kfmt(st.followers + (following ? 1 : 0))}</dd></div>
          </dl>
        </div>
      </div>
      <div class="sr-bh-art" data-n="${heroArts.length}" aria-hidden="true">${heroArts.map((p, i) => `<span class="a${i}" style="--tint:${p.c1}">${art(p)}</span>`).join('')}</div>
    </section>`;
  const sims = similarBrands(b);
  const simRail = sims.length ? UI.slot('H7', `<section class="blk sr-sim">
      <div class="blk-h"><h2>Similar brands you may like</h2>${UI.spLabel('Sponsored')}</div>
      ${UI.rail(sims.map(x => {
        const xs = brandStats(x.id), arts = xs.ps.slice().sort((p1, p2) => pop(p2) - pop(p1)).slice(0, 2);
        return `<a class="sr-simt" href="#/brand/${x.id}">
          <span class="sr-simt-top" style="--ba:${x.accent || '#f4f3f8'}">${UI.adBadge()}<span class="sr-simt-logo">${UI.brandLogo(x.id, { size: x.word && x.word.length > 10 ? 15 : 19 })}</span><span class="sr-simt-arts" aria-hidden="true">${arts.map(p => `<span>${art(p)}</span>`).join('')}</span></span>
          <span class="sr-simt-b"><small>${esc(x.tagline || '')}</small><span>${icon('star')}${xs.avg} · ${plural(xs.n, 'product')}</span><b>Visit store ${icon('arrow')}</b></span>
        </a>`; }).join(''), { cls: 'sr-simrail' })}
    </section>`, { cls: 'sr-sim-slot' }) : '';
  const coupon = cp ? UI.slot('H9', `<div class="sr-coupon">
      <div class="sr-cp-v"><b>${esc(cp.value)}</b><small>${esc(cp.min)}</small></div>
      <div class="sr-cp-m"><span class="sr-cp-lbl">${UI.adBadge()}<span>Brand coupon</span></span><b>${esc(b.name)} store coupon</b><small>Valid till ${esc(cp.expires)} · applied automatically at checkout</small></div>
      <button type="button" class="btn btn-sm ${clipped ? 'btn-ghost' : 'btn-cart'} sr-clip" data-action="sr-clip" data-id="${cp.id}" aria-pressed="${!!clipped}">${icon(clipped ? 'check' : 'scissors')}<span>${clipped ? 'Clipped' : 'Clip coupon'}</span></button>
    </div>`, { cls: 'sr-cp-slot' }) : '';
  const ownNote = own ? `<div class="sr-ownnote">
      <span class="sr-ownnote-ic">${icon('gift')}</span>
      <div><b>Try any of these free first.</b><span>Every order on The Big Brands includes a TBB Originals mini — you pick it at checkout, before payment.</span></div>
      <a class="btn btn-cart btn-sm" href="#/gifts">How free gifts work ${icon('arrow')}</a>
    </div>` : '';
  return `<div class="sr-page sr-brand">
    <div class="wrap">
      ${UI.slot('B1', hero, { cls: 'sr-bh-slot' }) || `<section class="sr-bbasic">
        <span class="sr-bbasic-logo" style="--ba:${b.accent || '#f4f3f8'}">${UI.brandLogo(b.id, { size: 22 })}</span>
        <div class="sr-bbasic-t"><h1>${esc(name)}</h1><p>${esc(b.tagline || '')} · ${icon('star')}${st.avg} · ${plural(st.n, 'product')}</p></div>
        <button type="button" class="sr-follow sr-follow-d${following ? ' on' : ''}" data-action="sr-follow" data-id="${b.id}" aria-pressed="${following}">${icon(following ? 'check' : 'plus')}<span>${following ? 'Following' : 'Follow'}</span></button>
      </section>`}
      <div class="sr-snav" data-sr-anchor>
        <div class="sr-tabs" role="tablist" aria-label="${esc(name)} products">${[['all', 'All products'], ['best', 'Bestsellers'], ['low', 'Price: low → high']].map(([k, l]) => `<button type="button" role="tab" class="sr-tab${tab === k ? ' on' : ''}" aria-selected="${tab === k}" data-action="sr-tab" data-id="${b.id}" data-tab="${k}">${l}</button>`).join('')}</div>
        ${own ? '' : `<a class="sr-claim-store" href="#/advertise">${icon('store')}Is this your brand? Manage this store</a>`}
      </div>
      ${ownNote}
      ${coupon || concs.length ? `<div class="sr-binfo">${coupon}${concs.length ? `<div class="sr-bconc"><b>Shop ${esc(name)} by concern</b><div>${concs.map(c => `<a class="sr-cchip" href="#/s?brand=${b.id}&concern=${c.id}">${c.emoji} ${esc(c.name)}</a>`).join('')}</div></div>` : ''}</div>` : ''}
      <section class="sr-sec">
        <div class="sr-sech"><h2>${tab === 'best' ? 'Bestsellers' : tab === 'low' ? 'Price: low to high' : 'All products'} <span class="sr-count-n">${st.n}</span></h2></div>
        <div class="sr-grid ${st.n <= 4 ? 'sr-grid-4 sr-grid-few' : st.n === 6 ? 'sr-grid-6' : 'sr-grid-5'}">${cards}</div>
      </section>
      <div class="sr-sec">${simRail}</div>
    </div>
  </div>`;
}

/* ================= sheet (mobile filters) ================= */
function updateSheetCount(st) {
  const n = compute(st).items.length;
  const el = document.getElementById('sr-apply-n'); if (el) el.textContent = n;
  const sub = document.querySelector('.sr-sheet-sub'); if (sub) sub.textContent = plural(n, 'result');
}
function stateFromForm(form) {
  const fd = new FormData(form);
  const st = { ...cur, pg: 1 };
  const c = fd.get('cat');
  if (c != null) st.cat = c;
  st.brands = fd.getAll('brand');
  st.concerns = fd.getAll('concern');
  let mn = Math.max(0, Number(fd.get('min')) || 0), mx = Math.max(0, Number(fd.get('max')) || 0);
  if (mn && mx && mn > mx) [mn, mx] = [mx, mn];
  st.min = mn; st.max = mx;
  st.rating = Number(fd.get('rating')) || 0;
  st.disc = Number(fd.get('disc')) || 0;
  st.gift = fd.get('gift') === '1';
  return st;
}
function openSheet() {
  const side = document.getElementById('sr-side'); if (!side) return;
  lastFocus = document.activeElement;
  document.body.classList.add('sr-sheet-open');
  side.setAttribute('role', 'dialog'); side.setAttribute('aria-modal', 'true');
  const form = document.getElementById('sr-filters'); if (form) updateSheetCount(stateFromForm(form));
  setTimeout(() => { const btn = side.querySelector('.sr-sheet-h button'); if (btn) btn.focus(); }, 60);
}
function closeSheet(restore = true) {
  if (!document.body.classList.contains('sr-sheet-open')) return;
  document.body.classList.remove('sr-sheet-open');
  const side = document.getElementById('sr-side');
  if (side) { side.removeAttribute('role'); side.removeAttribute('aria-modal'); }
  const form = document.getElementById('sr-filters'); if (form && restore) form.reset();
  if (restore && lastFocus && lastFocus.focus) lastFocus.focus();
}
function onKey(e) { if (e.key === 'Escape') closeSheet(); }
function onResize() { if (!isSheet()) closeSheet(); }

/* ================= events ================= */
TBB.on('change', '#sr-filters', (form, e) => {
  const t = e.target;
  if (t.name === 'price') {
    const [mn, mx] = (t.value || '-').split('-');
    form.elements.min.value = mn && mn !== '0' ? mn : '';
    form.elements.max.value = mx || '';
  }
  if (t.name === 'min' || t.name === 'max') {
    form.querySelectorAll('input[name="price"]').forEach(r => { r.checked = false; });
    if (isSheet()) updateSheetCount(stateFromForm(form));
    return;   // desktop: applied with the Go button
  }
  const st = stateFromForm(form);
  if (isSheet()) { updateSheetCount(st); return; }
  apply(st);
});
TBB.on('submit', '#sr-filters', (form, e) => {
  e.preventDefault();
  const st = stateFromForm(form);
  if (isSheet()) { updateSheetCount(st); return; }
  apply(st);
});
TBB.on('change', '.sr-sort', el => { closeSheet(false); apply({ ...cur, sort: el.value, pg: 1 }); });
TBB.on('input', '#sr-bfind', el => { dirQ = el.value; filterDir(); });

TBB.action('sr-sheet', () => openSheet());
TBB.action('sr-sheet-close', () => closeSheet());
TBB.action('sr-apply', () => { const f = document.getElementById('sr-filters'); if (!f) return; const st = stateFromForm(f); closeSheet(false); apply(st); });
TBB.action('sr-sheet-reset', () => {
  const f = document.getElementById('sr-filters'); if (!f) return;
  f.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => { i.checked = false; });
  const all = f.querySelector(`input[name="cat"][value="${cur.mode === 'c' ? cur.cat : ''}"]`); if (all) all.checked = true;
  f.elements.min.value = ''; f.elements.max.value = '';
  updateSheetCount(stateFromForm(f));
});
TBB.action('sr-gclear', el => {
  const k = el.dataset.k, f = document.getElementById('sr-filters');
  if (isSheet() && f) {
    const fs = el.closest('.sr-g');
    fs.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(i => { i.checked = false; });
    if (k === 'cat') { const a = fs.querySelector('input[value=""]'); if (a) a.checked = true; }
    if (k === 'price') { f.elements.min.value = ''; f.elements.max.value = ''; }
    updateSheetCount(stateFromForm(f));
    return;
  }
  apply(removeFilter(cur, k, ''));
});
TBB.action('sr-rm', el => apply(removeFilter(cur, el.dataset.k, el.dataset.v)));
TBB.action('sr-clear', () => apply({ ...cur, pg: 1, cat: cur.mode === 'c' ? cur.cat : '', brands: [], concerns: [], min: 0, max: 0, rating: 0, disc: 0, gift: false }));
TBB.action('sr-pg', el => { const n = Number(el.dataset.pg); if (n >= 1) apply({ ...cur, pg: n }); });
TBB.action('sr-more', el => {
  brandsOpen = !brandsOpen;
  const f = document.getElementById('sr-filters'); if (f) f.classList.toggle('brands-open', brandsOpen);
  el.setAttribute('aria-expanded', brandsOpen);
  const s = el.querySelector('span'); if (s) s.textContent = brandsOpen ? 'Show fewer' : `See all ${f ? f.querySelectorAll('input[name="brand"]').length : ''} brands`;
});
TBB.action('sr-jump', el => { const t = document.getElementById(el.dataset.to); if (t) t.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });
TBB.action('sr-bgrp', el => {
  dirG = el.dataset.g;
  if (el.dataset.reset) { dirQ = ''; const i = document.getElementById('sr-bfind'); if (i) i.value = ''; }
  document.querySelectorAll('[data-action="sr-bgrp"].chip').forEach(c => { const on = c.dataset.g === dirG; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
  filterDir();
});
TBB.action('sr-tab', el => navKeep(`#/brand/${el.dataset.id}${el.dataset.tab !== 'all' ? '?tab=' + el.dataset.tab : ''}`));
TBB.action('sr-follow', el => {
  const id = el.dataset.id, on = follows.includes(id);
  follows = on ? follows.filter(x => x !== id) : [...follows, id];
  LS.set('srFollow', follows);
  el.classList.toggle('on', !on);
  el.setAttribute('aria-pressed', !on);
  el.innerHTML = `${icon(on ? 'plus' : 'check')}<span>${on ? 'Follow' : 'Following'}</span>`;
  const st = brandStats(id), fol = document.querySelector('[data-fol]');
  if (fol) fol.textContent = kfmt(st.followers + (on ? 0 : 1));
  const nm = id === 'tbb' ? 'TBB Originals' : brand(id).name;
  TBB.toast(on ? `You’ve unfollowed ${esc(nm)}` : `Following ${esc(nm)} — you’ll hear about new drops & coupons first`, { icon: on ? 'info' : 'heart' });
});
TBB.action('sr-clip', el => {
  const id = el.dataset.id, on = S.clipped.includes(id);
  S.clipped = on ? S.clipped.filter(x => x !== id) : [...S.clipped, id];
  TBB.save('clipped');
  el.classList.toggle('btn-cart', on); el.classList.toggle('btn-ghost', !on);
  el.setAttribute('aria-pressed', !on);
  el.innerHTML = `${icon(on ? 'scissors' : 'check')}<span>${on ? 'Clip coupon' : 'Clipped'}</span>`;
  const cp = D.COUPONS.find(c => c.id === id);
  TBB.toast(on ? 'Coupon removed' : `Coupon clipped — ${esc(cp ? cp.value : '')} applies automatically at checkout`, { icon: 'scissors' });
});

/* gift store: refresh the cart progress after an add-to-cart */
function onGiftClick(e) {
  if (!e.target.closest('[data-action="add"]')) return;
  setTimeout(() => {
    const el = document.getElementById('sr-gstat'); if (el) el.outerHTML = giftStatus();
    const allow = TBB.gift.allowance(), tiers = TBB.gift.tiers();
    document.querySelectorAll('.sr-tierlist li').forEach((li, i) => li.classList.toggle('is-on', !!tiers[i] && allow >= tiers[i].count));
  }, 0);
}
function tick(root) {
  const parts = cdParts();
  root.querySelectorAll('[data-cd]').forEach(b => { b.textContent = parts[b.dataset.cd]; });
}

/* ================= page registration ================= */
TBB.page('search', {
  title: route => {
    if (route.key === 'gifts') return 'Free Gift Store';
    if (route.key === 'deals') return 'Today’s Deals';
    if (route.key === 'c') { const c = cat(route.seg[1]); return c ? c.name : 'All products'; }
    const q = (route.q.get('q') || '').trim();
    return q ? `“${q}”` : 'Search';
  },
  render(route) {
    return route.key === 'gifts' ? renderGifts() : renderResults(route);
  },
  mount(root, route) {
    if (route.key === 's') { const qi = document.getElementById('q'); if (qi && cur && cur.q) qi.value = cur.q; }
    restoreScroll();
    if (route.key === 'deals') { tick(root); timer = setInterval(() => tick(root), 1000); }
    if (route.key === 'gifts') document.addEventListener('click', onGiftClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
  },
  unmount() {
    clearInterval(timer); timer = null;
    closeSheet(false);
    document.removeEventListener('click', onGiftClick);
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
  },
});
TBB.page('brands', {
  title: 'Brand Stores',
  render: renderBrands,
  mount() { restoreScroll(); },
});
TBB.page('brand', {
  title: route => { const b = D.BRANDS.find(x => x.id === route.seg[1]); return b ? (b.own ? 'TBB Originals' : b.name) + ' Store' : 'Brand not found'; },
  render: renderBrand,
  mount() { restoreScroll(); },
});
})();
