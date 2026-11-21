/* The Big Brands — Home page module (route #/)
   An ADS-FIRST marketplace homepage. Every block is a sellable placement from TBB.data.SLOTS
   (H1–H11), wrapped with TBB.ui.slot() so the "Show ad slots" inspector can price it, plus
   house promos for the client's own label (TBB Originals). Prefix for classes & actions: hm-  */
(() => {
'use strict';
const D = TBB.data, S = TBB.S, UI = TBB.ui;
const { esc, fmt, art, product, brand, icon, stars, shade, lum, off } = TBB.h;

/* ================= small utils ================= */
const uniq = a => [...new Set(a)];
const pad = n => String(n).padStart(2, '0');
const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const isOff = id => S.slotOn[id] === false;
const href = h => (typeof h === 'string' && /^#\//.test(h) ? esc(h) : '#/');
const cssv = s => String(s == null ? '' : s).replace(/[^#a-z0-9(),.%\s-]/gi, '');
const isHex = s => /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(s || ''));
const short = p => p.name.split(/,| for | with /i)[0].trim();
const prodsOf = c => uniq([c.product, ...(c.products || [])].filter(Boolean)).map(product).filter(Boolean);
const isHouse = c => !!(c && (c.house || c.brand === 'tbb'));
const kick = c => (c.kicker && !/^sponsored$/i.test(String(c.kicker).trim())) ? `<span class="hm-kick">${esc(c.kicker)}</span>` : '';
const untilMidnight = () => { const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); return Math.min(86399, Math.max(0, Math.floor((m - n) / 1000))); };
const minPrice = ps => ps.length ? Math.min(...ps.map(p => p.price)) : 0;
const VOL_ON = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';

/* ================= colour + art direction ================= */
function rgb(h) { h = String(h).replace('#', ''); if (h.length < 6) h = h.slice(0, 3).split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16) || 0; return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rel(h) { const c = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function contrast(a, b) { const x = rel(a), y = rel(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

/* resolve a creative's theme into the colours the components need */
function themeOf(c) {
  const t = c.theme || {}, b = brand(c.brand);
  const col = isHex(b.color) ? b.color : '#333333';
  const bg = cssv(t.bg) || `linear-gradient(120deg, ${shade(col, -0.35)}, ${col})`;
  const stops = bg.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) || [col];
  const s0 = stops[0], s1 = stops[1] || s0;
  const fg = isHex(t.fg) ? t.fg : (lum(s0) > 0.6 ? '#151515' : '#ffffff');
  const light = lum(fg) > 0.6;                                    // light text on a dark background
  const ac = isHex(t.accent) ? t.accent : (light ? '#ffd36b' : col);
  const hi = Math.min(contrast(ac, s0), contrast(ac, s1)) >= 3.2 ? ac : fg;
  const cta = light ? (contrast(ac, s0) >= 3 ? ac : '#ffffff') : fg;
  const ctaFg = light ? (lum(s0) > 0.3 ? shade(s0, -0.45) : s0) : '#ffffff';
  return { bg, fg, ac, hi, cta, ctaFg, s0, light };
}
const swash = c => `url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 16" preserveAspectRatio="none"><path d="M4 11C70 4.5 180 3 296 8.5" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`)}')`;
const vars = th => `--hm-bg:${th.bg};--hm-fg:${th.fg};--hm-ac:${th.ac};--hm-hi:${th.hi};--hm-cta:${th.cta};--hm-ctafg:${th.ctaFg};--hm-swash:${swash(th.ac)}`;

/* display typography per brand: [family, weight, tracking, size scale, italic] */
const HF = {
  loreal:     ["'DM Serif Display', serif", 400, '-.015em', 1, false],
  lakme:      ["'Instrument Serif', serif", 400, '-.02em', 1.14, true],
  minimalist: ["'Geist', sans-serif", 300, '-.055em', 1, false],
  mamaearth:  ["'Bricolage Grotesque', sans-serif", 800, '-.045em', 1, false],
  tbb:        ["'Bricolage Grotesque', sans-serif", 800, '-.045em', 1, false],
  nivea:      ["'Bricolage Grotesque', sans-serif", 800, '-.035em', 1, false],
  garnier:    ["'Bricolage Grotesque', sans-serif", 800, '-.04em', 1, false],
  plum:       ["'Bricolage Grotesque', sans-serif", 800, '-.05em', 1, false],
  parachute:  ["'Bricolage Grotesque', sans-serif", 800, '-.04em', 1, false],
  beardo:     ["'Bebas Neue', sans-serif", 400, '.01em', 1.28, false],
  bellavita:  ["'Syne', sans-serif", 700, '-.03em', 0.94, false],
  biotique:   ["'Instrument Serif', serif", 400, '-.01em', 1.16, false],
  himalaya:   ["'Instrument Serif', serif", 400, '-.01em', 1.16, true],
  dove:       ["'Instrument Serif', serif", 400, '-.01em', 1.16, false],
  cetaphil:   ["'Geist', sans-serif", 600, '-.04em', 1, false],
  dermaco:    ["'Geist', sans-serif", 700, '-.04em', 1, false],
};
function hfStyle(id) {
  const f = HF[id] || ["'Bricolage Grotesque', sans-serif", 800, '-.04em', 1, false];
  return `font-family:${f[0]};font-weight:${f[1]};letter-spacing:${f[2]};--hm-fs:${f[3]};${f[4] ? 'font-style:italic;' : ''}`;
}
const wmStyle = b => `font-family:${b.font || 'inherit'};font-weight:${b.weight || 700};text-transform:${b.tt || 'none'};${b.italic ? 'font-style:italic;' : ''}`;

/* headline with the closing phrase underlined by a hand-drawn swash */
function headline(text) {
  const t = String(text || '').trim();
  const m = t.match(/^(.+?[.!?])\s+(\S.*)$/);
  let a, b;
  if (m) { a = m[1]; b = m[2]; }
  else { const w = t.split(/\s+/); const k = w.length > 3 ? 2 : (w.length > 1 ? 1 : 0); a = w.slice(0, w.length - k).join(' '); b = w.slice(w.length - k).join(' '); }
  return `${esc(a)}${b ? ` <span class="hm-hl">${esc(b)}</span>` : ''}`;
}

/* labels */
const houseTag = (t = 'The Big Brands') => `<span class="hm-htag"><i aria-hidden="true">tbb</i>${t}</span>`;
function adTag(c, { compact = false } = {}) {
  if (isHouse(c)) return houseTag();
  return `<span class="hm-adtag">${UI.adBadge()}<span>Sponsored${compact ? '' : `<span class="hm-adtag-by"> by <b>${esc(brand(c.brand).name)}</b></span>`}</span></span>`;
}
const head = (title, { kick = '', sub = '', right = '' } = {}) => `<div class="hm-h"><div class="hm-h-l">${kick ? `<span class="hm-h-k">${kick}</span>` : ''}<h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${right ? `<div class="hm-h-r">${right}</div>` : ''}</div>`;

/* decorative brand motifs for banners */
const LEAF = 'M120 14C64 58 62 160 120 226C178 160 176 58 120 14Z';
function motif(id) {
  const k = { himalaya: 'leaf', biotique: 'leaf', plum: 'leaf', garnier: 'leaf', mamaearth: 'leaf', bellavita: 'frame', loreal: 'frame', lakme: 'frame', beardo: 'stripe' }[id] || 'ring';
  if (k === 'leaf') return `<svg class="hm-motif hm-motif-leaf" viewBox="0 0 240 240" fill="currentColor" aria-hidden="true"><path d="${LEAF}" transform="rotate(-30 120 120)"/><path d="${LEAF}" transform="translate(96 70) scale(.55) rotate(40 120 120)"/><path d="${LEAF}" transform="translate(10 120) scale(.42) rotate(-70 120 120)"/></svg>`;
  return `<span class="hm-motif hm-motif-${k}" aria-hidden="true"></span>`;
}

/* ================= H1 · hero billboard ================= */
function heroSlide(c, k, n) {
  const b = brand(c.brand), th = themeOf(c), h = href(c.href), ps = prodsOf(c).slice(0, 3), house = isHouse(c), main = ps[0];
  const sticker = house
    ? '<span class="hm-sticker" aria-hidden="true"><b>FREE</b><small>with every order</small></span>'
    : main ? `<span class="hm-sticker" aria-hidden="true"><small>Now</small><b>${fmt(main.price)}</b>${off(main) > 0 ? `<small>${off(main)}% off</small>` : ''}</span>` : '';
  const stage = ps.length
    ? `<div class="hm-stage n${ps.length}">
        <span class="hm-halo" aria-hidden="true"></span><span class="hm-ring" aria-hidden="true"></span><span class="hm-ring hm-ring-2" aria-hidden="true"></span>
        ${ps.map((p, j) => `<a class="hm-pk hm-pk-${j + 1}" href="#/p/${esc(p.id)}" aria-label="${esc(brand(p.brand).name + ' ' + p.name)}">${art(p)}</a>`).join('')}
        ${sticker}
      </div>`
    : `<div class="hm-stage hm-stage-mono"><span class="hm-halo" aria-hidden="true"></span><a class="hm-mono" href="${h}" aria-label="${esc(b.name)}">${UI.brandLogo(c.brand, { size: 60, color: th.fg })}</a></div>`;
  return `<div class="hm-slide${k === 0 ? ' is-on' : ''}${th.light ? '' : ' is-lt'}" role="group" aria-roledescription="slide" aria-label="${k + 1} of ${n}: ${esc(house ? 'The Big Brands' : b.name)}" data-fg="${th.fg}" style="${vars(th)}"${k ? ' inert aria-hidden="true"' : ''}>
    <div class="hm-slide-bg" aria-hidden="true"></div>
    <span class="hm-wm" aria-hidden="true" style="${wmStyle(b)};--hm-wmn:${Math.max(4, (house ? 'free gift' : (b.word || b.name)).length)}">${esc(house ? 'free gift' : (b.word || b.name))}</span>
    <div class="wrap hm-slide-in">
      <div class="hm-copy">
        <a class="hm-copy-logo" href="${h}" aria-label="${esc(house ? 'TBB Originals' : b.name)}">${UI.brandLogo(c.brand, { size: 22, color: th.fg })}</a>
        ${kick(c)}
        <h2 class="hm-head" style="${hfStyle(c.brand)}">${headline(c.headline)}</h2>
        ${c.sub ? `<p class="hm-sub">${esc(c.sub)}</p>` : ''}
        <a class="hm-cta" href="${h}">${esc(c.cta || 'Shop now')}${icon('arrow')}</a>
      </div>
      ${stage}
    </div>
    <div class="wrap hm-slide-tag">${adTag(c)}</div>
  </div>`;
}
function heroHtml(list) {
  if (!list.length) return '';
  const n = list.length, fg0 = themeOf(list[0]).fg;
  const label = c => isHouse(c) ? 'Free gifts' : brand(c.brand).name;
  const nav = n > 1 ? `<div class="wrap hm-nav">
      <button class="hm-arrow" data-action="hm-prev" aria-label="Previous offer">${icon('chevLeft')}</button>
      <button class="hm-arrow" data-action="hm-next" aria-label="Next offer">${icon('chevRight')}</button>
      <div class="hm-tabs">${list.map((c, k) => `<button class="hm-tab${k ? '' : ' is-on'}" data-action="hm-go" data-i="${k}" aria-label="Offer ${k + 1} of ${n}: ${esc(label(c))}" aria-current="${k ? 'false' : 'true'}"><span>${esc(label(c))}</span><i class="hm-tab-bar"><b></b></i></button>`).join('')}</div>
      <button class="hm-play" data-action="hm-toggle" aria-label="Pause slideshow">${icon('pause')}</button>
    </div>` : '';
  return UI.slot('H1', `<div class="hm-car" style="--hm-nav:${fg0}">
      <div class="hm-slides" aria-live="off">${list.map((c, k) => heroSlide(c, k, n)).join('')}</div>
      <div class="hm-fade" aria-hidden="true"></div>
      ${nav}
    </div>`, { cls: 'hm-hero', tag: 'section', attrs: 'aria-roledescription="carousel" aria-label="Featured brand offers"' });
}

/* ================= H2 · brand spotlight cards ================= */
function spotCard(c) {
  const b = brand(c.brand), t = c.theme || {}, h = href(c.href), ps = prodsOf(c).slice(0, 3);
  const tint = (t.bg && !c.custom) ? cssv(t.bg) : `color-mix(in srgb, ${isHex(b.accent) ? b.accent : '#e7e4ee'} 45%, #fff)`;
  const ac = isHex(t.accent) && contrast(t.accent, '#ffffff') >= 3 ? t.accent : (isHex(b.color) && contrast(b.color, '#ffffff') >= 3 ? b.color : '#17121f');
  const ink = isHex(t.fg) && contrast(t.fg, '#ffffff') >= 4.5 ? t.fg : '#17121f';
  const pks = ps.length
    ? `<div class="hm-sp-pks n${ps.length}">${ps.map(p => `<a class="hm-sp-pk" href="#/p/${esc(p.id)}"><span class="hm-sp-art">${art(p)}</span><span class="hm-sp-nm">${esc(short(p))}</span><b>${fmt(p.price)}</b></a>`).join('')}</div>`
    : `<a class="hm-sp-pks hm-sp-mono" href="${h}" aria-label="${esc(b.name)} store">${UI.brandLogo(c.brand, { size: 38 })}</a>`;
  return `<article class="hm-sp" style="--sp-tint:${tint};--sp-ac:${ac};--sp-ink:${ink}">
    <div class="hm-sp-top"><a class="hm-sp-logo" href="${h}" aria-label="${esc(b.name)} store">${UI.brandLogo(c.brand, { size: 17 })}</a>${isHouse(c) ? houseTag() : UI.spLabel()}</div>
    <h3 class="hm-sp-h"><a href="${h}">${esc(c.headline)}</a></h3>
    ${c.sub ? `<p class="hm-sp-sub">${esc(c.sub)}</p>` : ''}
    ${pks}
    <a class="hm-sp-cta" href="${h}">${esc(c.cta || 'Shop now')}${icon('arrow')}</a>
  </article>`;
}
function spotHtml(list) {
  if (!list.length) return '';
  return `<div class="wrap hm-spot-wrap">
    <div class="hm-spot">${list.map(c => UI.slot('H2', spotCard(c), { cls: 'hm-spot-slot' })).join('')}</div>
    <p class="hm-adnote">${icon('info')}<span>Sponsored placements from brand partners help keep prices low.</span><a href="#/advertise">Advertise on The Big Brands${icon('arrow')}</a></p>
  </div>`;
}

/* ================= H4 · shop by concern (each tile = a sponsorship) ================= */
const CN_STYLE = {
  hairfall:    ['#f1e8ff', '#d6bfff', '#3b1a66'],
  acne:        ['#def6ef', '#ade6d6', '#0b4a40'],
  dandruff:    ['#e8f2ff', '#c2d9fb', '#12355e'],
  dull:        ['#fff4d6', '#ffd47f', '#573800'],
  tan:         ['#ffeadb', '#ffbb90', '#6b2a00'],
  dry:         ['#e2f6fd', '#ade0f4', '#0b4660'],
  frizz:       ['#ffe7ef', '#ffbcd0', '#6b1030'],
  darkcircles: ['#eeebfa', '#cec6ee', '#2e2659'],
  beard:       ['#f6ece1', '#dfc09e', '#4a2c12'],
};
const CN_IC = {
  hairfall: '<path d="M4 9.5h16v3H4z"/><path d="M6.5 12.5v4M9.5 12.5v5.5M12.5 12.5v4M15.5 12.5v5.5M18 12.5v4"/><path d="M8 3c1.2 2 3 2.3 3.6 5M15.5 3c-.8 1.8-.8 3.2 0 5"/>',
  acne: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.1"/><circle cx="15" cy="14.2" r="1.4"/><circle cx="10" cy="15.6" r=".8"/><circle cx="15.6" cy="8.8" r=".8"/>',
  dandruff: '<path d="M12 2.5v19M4 7l16 10M4 17 20 7"/><path d="m9.2 4.2 2.8 2 2.8-2M9.2 19.8l2.8-2 2.8 2"/>',
  dull: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  tan: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  dry: '<path d="M12 2.8s7 7.2 7 12.2a7 7 0 0 1-14 0c0-5 7-12.2 7-12.2z"/><path d="M9 15.2a3 3 0 0 0 3 3"/>',
  frizz: '<path d="M3 7.5c3-3 5 3 8 0s5 3 8 0M3 12.5c3-3 5 3 8 0s5 3 8 0M3 17.5c3-3 5 3 8 0s5 3 8 0"/>',
  darkcircles: '<path d="M2 11s3.6-5 10-5 10 5 10 5-3.6 5-10 5S2 11 2 11z"/><circle cx="12" cy="11" r="2.5"/><path d="M6 19.2c3.5 1.5 8.5 1.5 12 0"/>',
  beard: '<path d="M5 5v4.5C5 15 8 19.5 12 19.5S19 15 19 9.5V5"/><path d="M8.5 12.5c2-1.3 5-1.3 7 0"/><path d="M12 19.5V22"/>',
};
const cnIcon = id => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${CN_IC[id] || CN_IC.dull}</svg>`;
function concernTile(c, sponsored) {
  const [c1, c2, ink] = CN_STYLE[c.id] || ['#f4f3f8', '#e2def0', '#17121f'];
  const has = x => (x.concerns || []).includes(c.id);
  const p = D.PRODUCTS.find(x => x.brand === c.sponsor && has(x)) || D.PRODUCTS.find(x => !x.own && has(x));
  const from = minPrice(D.PRODUCTS.filter(x => !x.own && has(x)));
  return `<a class="hm-cn" href="#/s?concern=${encodeURIComponent(c.id)}" style="--c1:${c1};--c2:${c2};--ink:${ink}">
    <span class="hm-cn-ic" aria-hidden="true">${cnIcon(c.id)}</span>
    <b class="hm-cn-name">${esc(c.name)}</b>
    <span class="hm-cn-n">${from ? `from ${fmt(from)}` : 'Shop the edit'}${icon('chevRight')}</span>
    ${p ? `<span class="hm-cn-art" aria-hidden="true">${art(p)}</span>` : ''}
    ${sponsored ? `<span class="hm-cn-by"><small>Presented by</small>${UI.brandLogo(c.sponsor, { size: 12 })}</span>` : ''}
  </a>`;
}
function concernsHtml() {
  const paused = isOff('H4');
  const tiles = D.CONCERNS.map(c => paused ? `<div class="hm-cn-cell">${concernTile(c, false)}</div>` : UI.slot('H4', concernTile(c, true), { cls: 'hm-cn-cell' })).join('');
  return `<section class="wrap hm-sec" aria-labelledby="hm-cn-h"><div class="blk hm-blk">
    ${head('<span id="hm-cn-h">Shop by concern</span>', { kick: `${icon('target')}Expert edits`, sub: paused ? 'Pick your goal and shop the edit' : 'Pick your goal — each edit is presented by a partner brand', right: `${paused ? '' : UI.spLabel('Sponsored edits')}<a class="link" href="#/s">All products${icon('chevRight')}</a>` })}
    <div class="hm-cns">${tiles}</div>
  </div></section>`;
}

/* ================= H3 · leaderboard strip ================= */
function leaderHtml(c) {
  const b = brand(c.brand), th = themeOf(c), h = href(c.href), ps = prodsOf(c).slice(0, 3);
  return `<section class="wrap hm-sec hm-lb-sec">${UI.slot('H3', `<div class="hm-lb" style="${vars(th)}">
      <span class="hm-lb-fx" aria-hidden="true"></span>
      <div class="hm-lb-copy">
        <a class="hm-lb-logo" href="${h}" aria-label="${esc(b.name)}">${UI.brandLogo(c.brand, { size: 26, color: th.fg })}</a>
        <div>${c.kicker && !/^sponsored$/i.test(c.kicker) ? `<span class="hm-lb-kick">${esc(c.kicker)}</span>` : ''}<h3 style="${hfStyle(c.brand)}">${esc(c.headline)}</h3>${c.sub ? `<p>${esc(c.sub)}</p>` : ''}</div>
      </div>
      <div class="hm-lb-pks n${ps.length}">${ps.map((p, j) => `<a class="hm-lb-pk hm-lb-pk-${j + 1}" href="#/p/${esc(p.id)}" aria-label="${esc(b.name + ' ' + p.name)}">${art(p)}</a>`).join('')}</div>
      <div class="hm-lb-end">${adTag(c, { compact: true })}<a class="hm-cta" href="${h}">${esc(c.cta || 'Shop now')}${icon('arrow')}</a></div>
    </div>`, { cls: 'hm-lb-slot' })}</section>`;
}

/* ================= H10 · sponsored deal of the day + house gift promo ================= */
function cdUnits(s) {
  const u = [['h', Math.floor(s / 3600), 'hrs'], ['m', Math.floor(s % 3600 / 60), 'min'], ['s', s % 60, 'sec']];
  return u.map(([k, v, l]) => `<span class="hm-cd-u"><b data-u="${k}">${pad(v)}</b><small>${l}</small></span>`).join('<i aria-hidden="true">:</i>');
}
function dealHtml(c) {
  const p = product(c.product) || prodsOf(c)[0]; if (!p) return '';
  const b = brand(c.brand), th = themeOf(c);
  const price = Number(c.dealPrice) > 0 ? Number(c.dealPrice) : Math.round(p.price * 0.85);
  const pct = Math.max(0, Math.round((1 - price / p.mrp) * 100));
  const ink = contrast(th.ac, '#ffffff') >= 3 ? th.ac : (isHex(b.color) && contrast(b.color, '#ffffff') >= 3 ? b.color : '#d6234f');
  const kicker = c.kicker && !/^sponsored$/i.test(c.kicker) ? c.kicker : 'Sponsored Deal of the Day';
  return UI.slot('H10', `<div class="hm-deal" style="${vars(th)};--hm-ink:${ink}">
      <div class="hm-deal-media">
        <span class="hm-deal-rib">${icon('zap')}Deal of the Day</span>
        <span class="hm-deal-burst" aria-hidden="true"><b>${pct}%</b>off</span>
        <span class="hm-deal-pod" aria-hidden="true"></span>
        <a class="hm-deal-pk" href="#/p/${esc(p.id)}" aria-label="${esc(b.name + ' ' + p.name)}">${art(p)}</a>
      </div>
      <div class="hm-deal-body">
        <div class="hm-deal-top"><a href="#/brand/${esc(b.id)}" aria-label="${esc(b.name)} store">${UI.brandLogo(c.brand, { size: 20 })}</a>${adTag(c, { compact: true })}</div>
        <span class="hm-deal-k">${esc(kicker)}</span>
        <h3 class="hm-deal-h"><a href="${href(c.href || '#/p/' + p.id)}">${esc(c.headline)}</a></h3>
        <div class="hm-deal-rate">${stars(p.rating)}<b>${p.rating}</b><span>(${p.reviews.toLocaleString('en-IN')} ratings)</span></div>
        <div class="hm-deal-price"><span class="hm-deal-now"><sup>₹</sup>${price.toLocaleString('en-IN')}</span><span class="hm-deal-mrp">M.R.P: <s>${fmt(p.mrp)}</s></span>${pct ? `<span class="hm-deal-off">${pct}% off</span>` : ''}</div>
        ${c.sub ? `<p class="hm-deal-sub">${icon('tag')}<span>${esc(c.sub)} · <b>+ a free TBB gift</b></span></p>` : ''}
        <p class="hm-deal-del">${icon('truck')}<span>FREE delivery <b>${TBB.h.deliveryDate(3)}</b></span></p>
        <div class="hm-cd" role="timer" aria-label="Deal ends at midnight"><span class="hm-cd-l">${icon('clock')}Ends in</span>${cdUnits(untilMidnight())}</div>
        <div class="hm-claim"><div class="hm-claim-bar"><i style="--w:68%"></i></div><span><b>68%</b> claimed</span></div>
        <div class="hm-deal-btns"><button class="btn btn-cart btn-lg" data-action="add" data-id="${esc(p.id)}">${icon('cart')}Add to cart</button><a class="btn btn-ghost btn-lg" href="#/p/${esc(p.id)}">View deal</a></div>
      </div>
    </div>`, { cls: 'hm-deal-slot' });
}
function giftPromoHtml() {
  const tiers = TBB.gift.tiers(), gifts = TBB.gift.active().slice(0, 6);
  return `<aside class="hm-gift" aria-label="A free gift with every order">
    <span class="hm-gift-fx" aria-hidden="true"></span>
    <div class="hm-gift-a">
      <div class="hm-gift-top">${houseTag()}<span class="hm-gift-k">Only on The Big Brands</span></div>
      <h3>A free gift with <em>every</em> order.</h3>
      <p>Choose your TBB Originals mini before you pay — the bigger the bag, the more you pick.</p>
    </div>
    <div class="hm-gift-b">
      <ol class="hm-tiers">${tiers.map(t => `<li><span class="hm-tier-ic" aria-hidden="true">${icon('gift').repeat(Math.max(1, Math.min(3, t.count)))}</span><b>${t.count} free gift${t.count > 1 ? 's' : ''}</b><small>${t.min > 0 ? `on ${fmt(t.min)}+` : 'on any order'}</small></li>`).join('')}</ol>
      ${gifts.length ? `<div class="hm-minis">${gifts.map(g => `<a class="hm-mini" href="#/gifts" aria-label="${esc(g.name)} mini, worth ${fmt(g.worth)}"><span class="hm-mini-art">${art(g)}</span><small>worth ${fmt(g.worth)}</small></a>`).join('')}</div>` : ''}
      <a class="btn btn-cart btn-lg hm-gift-cta" href="#/gifts">${icon('gift')}Explore the Free Gift Store${icon('arrow')}</a>
    </div>
  </aside>`;
}
function dealRowHtml(c) {
  const deal = c ? dealHtml(c) : '';
  return `<section class="wrap hm-sec hm-dealrow${deal ? '' : ' is-solo'}" aria-label="Deal of the day and free gifts">${deal}${giftPromoHtml()}</section>`;
}

/* ================= H5 · video billboard (simulated muted autoplay) ================= */
function videoHtml(c) {
  const b = brand(c.brand), th = themeOf(c), h = href(c.href), ps = prodsOf(c).slice(0, 2);
  const p1 = ps[0], p2 = ps[1] || ps[0];
  const parts = String(c.sub || '').split(/(?<=[.!?])\s+/).filter(Boolean);
  const l1 = p1 ? short(p1) : (c.kicker || b.name);
  const l2 = parts[1] || (p2 && p2 !== p1 ? short(p2) : (c.sub || c.headline));
  const pk = (p, cls) => p ? `<span class="hm-v-pk ${cls}">${art(p)}</span>` : '';
  const hs = hfStyle(c.brand);
  const scenes = [
    { cc: parts[0] || l1, html: `<div class="hm-kb"></div>${pk(p1, 'r')}<div class="hm-v-txt"><small>${esc(b.name)} presents</small><b style="${hs}">${esc(l1)}</b></div>` },
    { cc: parts[1] || l2, html: `<div class="hm-kb hm-kb-2"></div>${pk(p2, 'l')}<div class="hm-v-txt is-r"><small>${esc(p2 && p2 !== p1 ? short(p2) : 'All day, every day')}</small><b style="${hs}">${esc(l2)}</b></div>` },
    { cc: c.headline, html: `<div class="hm-kb hm-kb-3"></div><div class="hm-v-end">${UI.brandLogo(c.brand, { size: 24, color: th.fg })}<b style="${hs}">${esc(c.headline)}</b><span class="hm-v-pks">${pk(p1, 'a')}${p2 && p2 !== p1 ? pk(p2, 'b') : ''}</span></div>` },
  ];
  const rows = ps.map(p => `<div class="hm-vp">
      <a class="hm-vp-art" href="#/p/${esc(p.id)}" style="--tint:${p.c1}" aria-label="${esc(p.name)}">${art(p)}</a>
      <div class="hm-vp-txt"><a href="#/p/${esc(p.id)}">${esc(p.name)}</a><span>${stars(p.rating)}<small>${p.reviews.toLocaleString('en-IN')}</small></span><b>${fmt(p.price)} <s>${fmt(p.mrp)}</s></b></div>
      <button class="btn btn-sm btn-cart" data-action="add" data-id="${esc(p.id)}" aria-label="Add ${esc(p.name)} to cart">${icon('plus')}Add</button>
    </div>`).join('');
  return `<section class="wrap hm-sec">${UI.slot('H5', `<div class="hm-vid">
      <div class="hm-player" style="${vars(th)}">
        ${scenes.map((s, k) => `<div class="hm-scn${k ? '' : ' is-on'}" data-cc="${esc(s.cc)}">${s.html}</div>`).join('')}
        <span class="hm-bokeh" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <div class="hm-vtop">${adTag(c)}<span class="hm-vlen">${icon('clock')}0:30</span></div>
        <p class="hm-cc" aria-hidden="true">${esc(scenes[0].cc)}</p>
        <button class="hm-vbig" data-action="hm-vplay" aria-label="Play video">${icon('play')}</button>
        <div class="hm-vui">
          <div class="hm-vbar" aria-hidden="true"><i></i></div>
          <div class="hm-vctl">
            <button class="hm-vbtn hm-vpp" data-action="hm-vplay" aria-label="Pause video">${icon('pause')}</button>
            <button class="hm-vbtn" data-action="hm-vmute" aria-label="Unmute video" aria-pressed="false">${icon('volumeOff')}</button>
            <span class="hm-vtime"><b>0:00</b> / 0:30</span>
            <a class="hm-vcta" href="${h}">${esc(c.cta || 'Shop now')}${icon('arrow')}</a>
          </div>
        </div>
      </div>
      <div class="hm-vside">
        <div class="hm-vside-top"><a href="${h}" aria-label="${esc(b.name)}">${UI.brandLogo(c.brand, { size: 22 })}</a>${isHouse(c) ? houseTag() : UI.spLabel('Sponsored video')}</div>
        <span class="hm-h-k">${icon('play')}${esc(c.kicker || 'Watch')}</span>
        <h3>${esc(c.headline)}</h3>
        ${c.sub ? `<p>${esc(c.sub)}</p>` : ''}
        ${rows ? `<div class="hm-vps"><span class="hm-vps-h">In this video</span>${rows}</div>` : ''}
        <p class="hm-vnote">${icon('gift')}<span>Shop the look and pick a <b>free TBB Originals gift</b> at checkout</span></p>
        <a class="btn btn-dark btn-lg hm-vside-cta" href="${h}">${esc(c.cta || 'Shop now')}${icon('arrow')}</a>
      </div>
    </div>`, { cls: 'hm-vid-slot' })}</section>`;
}

/* ================= H6 · sponsored creator reels ================= */
function reelCard(r) {
  const p = product(r.product); if (!p) return '';
  const b = brand(r.brand), cols = (r.colors || []).filter(isHex);
  return `<a class="hm-reel" href="#/p/${esc(p.id)}" style="--a:${cols[0] || '#3a2a55'};--b:${cols[1] || '#140a24'}" aria-label="${esc(r.title)} by ${esc(r.handle)}, ${esc(r.views)} views. Paid partnership with ${esc(b.name)}. Shop ${esc(p.name)}">
    <span class="hm-reel-seg" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="hm-reel-top"><span class="hm-reel-av"><span>${esc((r.creator || r.handle || '?').replace(/^Dr\.\s*/, '').charAt(0))}</span></span><span class="hm-reel-id"><b>${esc(r.handle)}</b><small>Paid partnership with ${esc(b.name)}</small></span></span>
    <span class="hm-reel-art">${art(p)}</span>
    <span class="hm-reel-play" aria-hidden="true">${icon('play')}</span>
    <span class="hm-reel-foot">
      <span class="hm-reel-t">${esc(r.title)}</span>
      <span class="hm-reel-meta">${icon('play')}${esc(r.views)} views</span>
      <span class="hm-reel-shop"><span class="hm-reel-mini">${art(p)}</span><span class="hm-reel-pn"><b>${esc(short(p))}</b><small>${fmt(p.price)}</small></span><em>Shop</em></span>
    </span>
  </a>`;
}
function reelsHtml() {
  if (isOff('H6') || !D.REELS.length) return '';
  return `<section class="wrap hm-sec" aria-labelledby="hm-rl-h"><div class="blk hm-blk">
    ${head('<span id="hm-rl-h">Creator reels you can shop</span>', { kick: `${icon('play')}Shoppable video`, sub: 'Real routines from creators you follow — tap a reel to shop the product', right: UI.spLabel('Paid partnerships') })}
    <div class="hm-reels">${D.REELS.slice(0, 6).map(r => UI.slot('H6', reelCard(r), { cls: 'hm-reel-slot' })).join('')}</div>
  </div></section>`;
}

/* ================= H8 · double billboard ================= */
function bbCard(c) {
  const b = brand(c.brand), th = themeOf(c), h = href(c.href), ps = prodsOf(c).slice(0, 2);
  const art2 = ps.length
    ? ps.map((p, j) => `<a class="hm-bb-pk hm-bb-pk-${j + 1}" href="#/p/${esc(p.id)}" aria-label="${esc(b.name + ' ' + p.name)}">${art(p)}</a>`).join('')
    : `<a class="hm-mono" href="${h}" aria-label="${esc(b.name)}">${UI.brandLogo(c.brand, { size: 44, color: th.fg })}</a>`;
  return `<div class="hm-bb" style="${vars(th)}">
    ${motif(c.brand)}
    <div class="hm-bb-copy">
      <a class="hm-bb-logo" href="${h}" aria-label="${esc(b.name)}">${UI.brandLogo(c.brand, { size: 22, color: th.fg })}</a>
      ${kick(c)}
      <h3 class="hm-bb-h" style="${hfStyle(c.brand)}">${headline(c.headline)}</h3>
      ${c.sub ? `<p>${esc(c.sub)}</p>` : ''}
      <a class="hm-cta" href="${h}">${esc(c.cta || 'Shop now')}${icon('arrow')}</a>
    </div>
    <div class="hm-bb-art n${ps.length}"><span class="hm-halo" aria-hidden="true"></span>${art2}</div>
    <span class="hm-bb-tag">${adTag(c, { compact: true })}</span>
  </div>`;
}
const doubleHtml = list => `<section class="wrap hm-sec" aria-label="Brand offers"><div class="hm-bbs">${list.map(c => UI.slot('H8', bbCard(c), { cls: 'hm-bb-slot' })).join('')}</div></section>`;

/* ================= H9 · brand coupon wall ================= */
/* "30 Nov" → a real date. Parsed by hand (Safari can't parse "30 Nov 2026"); if a sample
   expiry has already passed, it rolls forward by whole weeks so the demo never shows dead coupons. */
const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
function expiry(s) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const m = String(s || '').trim().match(/^(\d{1,2})\s+([a-z]{3})/i);
  const mo = m ? MON[m[2].toLowerCase()] : undefined;
  if (mo === undefined) return { days: 99, label: `Valid till ${esc(s)}` };
  const d = new Date(today.getFullYear(), mo, Number(m[1]));
  if (d - today < -180 * 864e5) d.setFullYear(d.getFullYear() + 1);   // "2 Dec" seen in January → next year
  for (let k = 0; d <= today && k < 60; k++) d.setDate(d.getDate() + 7);
  const days = Math.round((d - today) / 864e5);
  const lbl = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  return { days, label: days <= 0 ? 'Ends today' : days <= 7 ? `${days} day${days > 1 ? 's' : ''} left · till ${lbl}` : `Valid till ${lbl}` };
}
const clipInner = on => on ? `${icon('check')}<span>Clipped ✓</span>` : `${icon('scissors')}<span>Clip coupon</span>`;
function couponHtml(c) {
  const b = brand(c.brand), on = S.clipped.includes(c.id), d = expiry(c.expires);
  return `<div class="hm-cp${on ? ' is-on' : ''}" style="--bc:${isHex(b.color) ? b.color : '#333'};--ba:${isHex(b.accent) ? b.accent : '#f4f3f8'}">
    <a class="hm-cp-stub" href="#/brand/${esc(b.id)}" aria-label="${esc(b.name)} store">${UI.brandLogo(c.brand, { size: 15 })}</a>
    <div class="hm-cp-body">
      <b class="hm-cp-val">${esc(c.value)}</b>
      <span class="hm-cp-min">${esc(c.min)} · ${esc(b.name)}</span>
      <span class="hm-cp-exp${d.days <= 7 ? ' is-soon' : ''}">${icon('clock')}${d.label}</span>
      <button class="hm-cp-btn" data-action="hm-clip" data-id="${esc(c.id)}" aria-pressed="${on}" aria-label="${on ? 'Unclip' : 'Clip'} ${esc(b.name)} ${esc(c.value)} coupon">${clipInner(on)}</button>
    </div>
    <span class="hm-cp-stamp" aria-hidden="true">Clipped</span>
  </div>`;
}
const clipCount = () => S.clipped.filter(id => D.COUPONS.some(c => c.id === id)).length;
function couponsHtml() {
  if (isOff('H9') || !D.COUPONS.length) return '';
  const n = clipCount();
  return `<section class="wrap hm-sec" aria-labelledby="hm-cp-h"><div class="blk hm-blk hm-cpwall">
    ${head('<span id="hm-cp-h">Brand coupon wall</span>', { kick: `${icon('scissors')}Clip &amp; save`, sub: 'Clip a coupon now — it’s applied automatically at checkout', right: `<span class="hm-cp-count${n ? ' is-on' : ''}" aria-live="polite">${icon('tag')}<b>${n}</b>&nbsp;clipped</span>${UI.spLabel('Sponsored coupons')}` })}
    <div class="hm-cps">${D.COUPONS.map(c => UI.slot('H9', couponHtml(c), { cls: 'hm-cp-slot' })).join('')}</div>
  </div></section>`;
}

/* ================= H11 · sponsored brand shelf ================= */
function shelfHtml(c) {
  const b = brand(c.brand), th = themeOf(c), h = href(c.href), ps = prodsOf(c).slice(0, 4);
  const more = ps.length < 4 ? `<a class="hm-shelf-more" href="${h}" style="--ba:${isHex(b.accent) ? b.accent : '#f4f3f8'}">${UI.brandLogo(c.brand, { size: 22 })}<b>Explore the full ${esc(b.name)} store</b><small>Combos, minis &amp; new launches</small><span>${esc(c.cta || 'Visit store')}${icon('arrow')}</span></a>` : '';
  return `<section class="wrap hm-sec">${UI.slot('H11', `<div class="hm-shelf">
      <div class="hm-shelf-hero" style="${vars(th)}">
        ${motif(c.brand)}
        <div class="hm-shelf-top">${isHouse(c) ? houseTag() : UI.spLabel('Sponsored brand')}</div>
        <a href="${h}" aria-label="${esc(b.name)}">${UI.brandLogo(c.brand, { size: 34, color: th.fg })}</a>
        <h3 style="${hfStyle(c.brand)}">${esc(c.headline)}</h3>
        ${c.sub ? `<p>${esc(c.sub)}</p>` : ''}
        <a class="hm-cta" href="${h}">${esc(c.cta || 'Visit store')}${icon('arrow')}</a>
        <div class="hm-shelf-fan" aria-hidden="true">${ps.slice(0, 3).map(p => `<span>${art(p)}</span>`).join('')}</div>
      </div>
      <div class="hm-shelf-grid">${ps.map(p => UI.productCard(p, { compact: true, sponsored: true })).join('')}${more}</div>
    </div>`, { cls: 'hm-shelf-slot' })}</section>`;
}

/* ================= H7 · featured brand stores ================= */
function storeTile(b) {
  const ps = D.PRODUCTS.filter(p => p.brand === b.id);
  const best = ps.length ? Math.max(...ps.map(off)) : 0;
  const wl = String(b.word || b.name).length;
  return `<a class="hm-st" href="#/brand/${esc(b.id)}" style="--ba:${isHex(b.accent) ? b.accent : '#f4f3f8'}">
    <span class="hm-st-top"><span class="hm-st-logo">${UI.brandLogo(b.id, { size: wl >= 12 ? 14 : wl >= 10 ? 16 : 18 })}</span><span class="hm-st-pks" aria-hidden="true">${ps.slice(0, 3).map(p => `<span>${art(p)}</span>`).join('')}</span></span>
    <span class="hm-st-meta"><b>${esc(b.tagline || b.name)}</b><small class="hm-st-ok">${icon('check')}Official store</small>${best > 0 ? `<small class="hm-st-off">Up to ${best}% off</small>` : ''}<em>Visit store${icon('arrow')}</em></span>
  </a>`;
}
function storesHtml() {
  if (isOff('H7')) return '';
  const list = D.BRANDS.filter(b => !b.own).slice(0, 12);
  return `<section class="wrap hm-sec" aria-labelledby="hm-st-h"><div class="blk hm-blk">
    ${head('<span id="hm-st-h">Featured brand stores</span>', { kick: `${icon('store')}Official stores`, sub: 'Shop straight from the brands — 100% authentic, sourced direct', right: `${UI.spLabel('Featured stores · Sponsored')}<a class="link" href="#/brands">All brands${icon('chevRight')}</a>` })}
    <div class="hm-stores">${list.map(b => UI.slot('H7', storeTile(b), { cls: 'hm-st-slot' })).join('')}</div>
  </div></section>`;
}

/* ================= house banner (TBB Originals) + trending searches ================= */
function houseHtml() {
  const g = D.TBB_GIFTS, from = Math.min(...g.map(x => x.price));
  return `<section class="wrap hm-sec" aria-label="TBB Originals">
    <div class="hm-house">
      <span class="hm-house-fx" aria-hidden="true"></span>
      <div class="hm-house-copy">
        ${houseTag('Our own label')}
        <span class="hm-house-logo">TBB <em>Originals</em></span>
        <h3>Loved your free gift? <span>Get the full size.</span></h3>
        <p>The minis you picked at checkout — now in full size, from ${fmt(from)}. Made in India, dermatologically tested.</p>
        <a class="hm-cta" href="#/gifts">Shop TBB Originals${icon('arrow')}</a>
      </div>
      <div class="hm-house-row">
        <span class="hm-house-note" aria-hidden="true">your favourite minis, now full size!<svg viewBox="0 0 60 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6c18 2 34 10 44 26"/><path d="M38 30l10 3 2-11"/></svg></span>
        ${g.map(p => `<a class="hm-house-p" href="#/p/${esc(p.id)}"><span class="hm-house-art">${art(p)}</span><b>${esc(p.line || short(p))}</b><small>${fmt(p.price)} · ${esc(p.size)}</small></a>`).join('')}
      </div>
    </div>
    <div class="hm-trend"><span class="hm-trend-l">${icon('trending')}Trending searches</span><div class="hm-trend-chips">${D.TRENDING.map(t => `<a class="chip" href="#/s?q=${encodeURIComponent(t)}">${icon('search')}${esc(t)}</a>`).join('')}</div></div>
  </section>`;
}

/* ================= page ================= */
function render() {
  const h1 = TBB.ads.list('H1').slice(0, 5);
  const h2 = TBB.ads.list('H2').slice(0, 4);
  const h3 = TBB.ads.list('H3')[0];
  const h5 = TBB.ads.list('H5')[0];
  const h8 = TBB.ads.list('H8').slice(0, 2);
  const h10 = TBB.ads.list('H10')[0];
  const h11 = TBB.ads.list('H11')[0];
  return `<div class="hm${h1.length ? '' : ' hm-nohero'}${h2.length ? '' : ' hm-nospot'}">
    <h1 class="sr-only">The Big Brands — shop 50+ beauty brands, with a free gift in every order</h1>
    ${heroHtml(h1)}
    ${spotHtml(h2)}
    ${concernsHtml()}
    ${h3 ? leaderHtml(h3) : ''}
    ${dealRowHtml(h10)}
    ${h5 ? videoHtml(h5) : ''}
    ${reelsHtml()}
    ${h8.length ? doubleHtml(h8) : ''}
    ${couponsHtml()}
    ${h11 ? shelfHtml(h11) : ''}
    ${storesHtml()}
    ${houseHtml()}
  </div>`;
}

/* ---------- hero carousel controller ---------- */
function mountHero(root) {
  const car = root.querySelector('.hm-car'); if (!car) return null;
  const slides = [...car.querySelectorAll('.hm-slide')], tabs = [...car.querySelectorAll('.hm-tab')];
  const live = car.querySelector('.hm-slides'), playBtn = car.querySelector('.hm-play');
  const n = slides.length, DUR = 6000, offs = [];
  let i = 0, elapsed = 0, last = 0, raf = 0, hover = false, focus = false, stopped = false, inView = true, sx = 0, sy = 0, prevT = 0, io = null;
  const listen = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); offs.push(() => el.removeEventListener(ev, fn, o)); };
  const fill = (k, v) => { const b = tabs[k] && tabs[k].querySelector('.hm-tab-bar b'); if (b) b.style.transform = `scaleX(${v})`; };
  function show(k) {
    if (n < 2) return;
    const old = i;
    fill(old, 0);
    i = (k + n) % n; elapsed = 0;
    slides.forEach((s, j) => {
      const on = j === i;
      s.classList.toggle('is-on', on); s.classList.toggle('is-in', on);
      s.classList.toggle('is-prev', j === old && old !== i);
      s.inert = !on; s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    clearTimeout(prevT); prevT = setTimeout(() => slides.forEach(s => s.classList.remove('is-prev')), 950);
    tabs.forEach((t, j) => { t.classList.toggle('is-on', j === i); t.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    car.style.setProperty('--hm-nav', slides[i].dataset.fg || '#fff');
    fill(i, stopped ? 1 : 0);
  }
  function setStopped(v) {
    stopped = v; car.classList.toggle('is-stopped', v);
    if (playBtn) { playBtn.innerHTML = icon(v ? 'play' : 'pause'); playBtn.setAttribute('aria-label', v ? 'Play slideshow' : 'Pause slideshow'); }
    if (live) live.setAttribute('aria-live', v ? 'polite' : 'off');
  }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(100, t - last) : 0; last = t;
    if (stopped || hover || focus || !inView || n < 2) return;
    elapsed += dt;
    if (elapsed >= DUR) show(i + 1); else fill(i, elapsed / DUR);
  }
  listen(car, 'pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  listen(car, 'pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
  listen(car, 'focusin', e => { try { if (e.target.matches(':focus-visible')) focus = true; } catch (err) { focus = true; } });
  listen(car, 'focusout', e => { if (!car.contains(e.relatedTarget)) focus = false; });
  listen(car, 'keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(i - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(i + 1); }
  });
  listen(car, 'touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  listen(car, 'touchend', e => {
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) show(i + (dx < 0 ? 1 : -1));
  }, { passive: true });
  if ('IntersectionObserver' in window) { io = new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; }, { threshold: 0.2 }); io.observe(car); }
  setStopped(reduced());
  fill(0, stopped ? 1 : 0);
  requestAnimationFrame(() => requestAnimationFrame(() => { if (slides[0]) slides[0].classList.add('is-in'); }));
  raf = requestAnimationFrame(frame);
  return {
    next: () => show(i + 1), prev: () => show(i - 1), go: k => show(k),
    toggle() { setStopped(!stopped); if (!stopped && elapsed === 0) fill(i, 0); },
    destroy() { cancelAnimationFrame(raf); clearTimeout(prevT); offs.forEach(f => f()); if (io) io.disconnect(); },
  };
}

/* ---------- video billboard controller (plays only while ≥50% in view = viewable impression) ---------- */
function mountVideo(root) {
  const pl = root.querySelector('.hm-player'); if (!pl) return null;
  const scenes = [...pl.querySelectorAll('.hm-scn')], bar = pl.querySelector('.hm-vbar i'), tm = pl.querySelector('.hm-vtime b'), cc = pl.querySelector('.hm-cc'), pp = pl.querySelector('.hm-vpp');
  const LEN = 30, STEP = 0.25;
  let t = 0, sc = 0, user = reduced(), inView = !('IntersectionObserver' in window), iv = 0, io = null;
  const mmss = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
  function draw() {
    bar.style.transform = `scaleX(${t / LEN})`;
    tm.textContent = mmss(t);
    const k = Math.min(scenes.length - 1, Math.floor(t / (LEN / scenes.length)));
    if (k !== sc) { sc = k; scenes.forEach((s, j) => s.classList.toggle('is-on', j === k)); cc.textContent = scenes[k].dataset.cc || ''; }
  }
  function step() { t += STEP; if (t >= LEN) t = 0; draw(); }
  function sync() {
    const run = !user && inView && !document.hidden;
    pl.classList.toggle('is-paused', !run);
    pl.classList.toggle('is-user-paused', user);
    if (pp) { pp.innerHTML = icon(user ? 'play' : 'pause'); pp.setAttribute('aria-label', user ? 'Play video' : 'Pause video'); }
    if (run && !iv) iv = setInterval(step, STEP * 1000);
    if (!run && iv) { clearInterval(iv); iv = 0; }
  }
  const onVis = () => sync();
  document.addEventListener('visibilitychange', onVis);
  if (!inView) { io = new IntersectionObserver(es => { const e = es[es.length - 1]; inView = e.isIntersecting && e.intersectionRatio >= 0.5; sync(); }, { threshold: [0, 0.5, 1] }); io.observe(pl); }
  sync();
  return {
    toggle() { user = !user; sync(); },
    destroy() { clearInterval(iv); iv = 0; if (io) io.disconnect(); document.removeEventListener('visibilitychange', onVis); },
  };
}

/* ---------- deal countdown ---------- */
function mountCountdown(root) {
  const el = root.querySelector('.hm-cd'); if (!el) return 0;
  const u = k => el.querySelector(`[data-u="${k}"]`);
  const h = u('h'), m = u('m'), s = u('s');
  const tick = () => { const x = untilMidnight(); h.textContent = pad(Math.floor(x / 3600)); m.textContent = pad(Math.floor(x % 3600 / 60)); s.textContent = pad(x % 60); };
  tick();
  return setInterval(tick, 1000);
}

let hero = null, video = null, cd = 0;
TBB.page('home', {
  render,
  mount(root) {
    hero = mountHero(root);
    video = mountVideo(root);
    cd = mountCountdown(root);
  },
  unmount() {
    if (hero) hero.destroy();
    if (video) video.destroy();
    clearInterval(cd);
    hero = null; video = null; cd = 0;
  },
});

/* ================= actions ================= */
TBB.action('hm-prev', () => { if (hero) hero.prev(); });
TBB.action('hm-next', () => { if (hero) hero.next(); });
TBB.action('hm-go', el => { if (hero) hero.go(Number(el.dataset.i) || 0); });
TBB.action('hm-toggle', () => { if (hero) hero.toggle(); });
TBB.action('hm-vplay', () => { if (video) video.toggle(); });
TBB.action('hm-vmute', el => {
  const on = el.getAttribute('aria-pressed') !== 'true';
  el.setAttribute('aria-pressed', String(on));
  el.setAttribute('aria-label', on ? 'Mute video' : 'Unmute video');
  el.innerHTML = on ? VOL_ON : icon('volumeOff');
  const pl = el.closest('.hm-player'); if (pl) pl.classList.toggle('is-sound', on);
  if (on) TBB.toast('Sound on — captions stay visible in this demo', { icon: 'info' });
});
TBB.action('hm-clip', (el, e) => {
  e.preventDefault();
  const id = el.dataset.id, c = D.COUPONS.find(x => x.id === id); if (!c) return;
  const on = !S.clipped.includes(id);
  S.clipped = on ? [...S.clipped, id] : S.clipped.filter(x => x !== id);
  TBB.save('clipped');
  const b = brand(c.brand), card = el.closest('.hm-cp');
  if (card) card.classList.toggle('is-on', on);
  el.setAttribute('aria-pressed', String(on));
  el.setAttribute('aria-label', `${on ? 'Unclip' : 'Clip'} ${b.name} ${c.value} coupon`);
  el.innerHTML = clipInner(on);
  const cnt = document.querySelector('.hm-cp-count');
  if (cnt) { const n = clipCount(); cnt.querySelector('b').textContent = n; cnt.classList.toggle('is-on', n > 0); }
  TBB.toast(on ? `${esc(b.name)} ${esc(c.value)} clipped — applied automatically at checkout` : `${esc(b.name)} coupon removed`, { icon: on ? 'scissors' : 'info' });
});
})();
