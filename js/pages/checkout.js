/* The Big Brands — marketplace demo · cart, checkout & order confirmation
   Pages: 'cart' (#/cart) · 'checkout' (#/checkout) · 'success' (#/success)
   Ad inventory used here:
     C1  Cart Add-on Ads          — "Add before checkout" sponsored rail on the cart
     C2  Thank-you Page Ad        — creative banner on the order confirmation
     X1  In-box Flyer / Sample    — partner sample listed in "What's in your box"
   Brand-promotion mechanic: the customer picks complimentary TBB Originals minis BEFORE paying (checkout step 2). */
(() => {
'use strict';
const D = TBB.data, S = TBB.S, H = TBB.h, U = TBB.ui;
const { esc, fmt, icon, art, product, brand, off } = H;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- small helpers ---------- */
const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const giftById = id => D.TBB_GIFTS.find(g => g.id === id);
const firstName = () => (String(S.address.name || '').trim().split(/\s+/)[0]) || 'there';
const inStock = g => S.giftStock[g.id] == null || S.giftStock[g.id] > 0;
const ETA = () => H.deliveryDate(3);
const EXTRA = {
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  bank: '<path d="M3 21h18M4 10h16M12 3 3 8h18z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/>',
  upi: '<path d="m7 4 5 8-5 8"/><path d="m13 4 5 8-5 8"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
};
const ic = (n, cls = '') => EXTRA[n]
  ? `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${EXTRA[n]}</svg>`
  : icon(n, cls);
const logoMark = () => `<span class="logo-mark"><i>tbb</i><span class="logo-stack"><span class="logo-txt">thebigbrands<em>.co.in</em></span><small class="logo-sub">A Shriram Ventures Initiative</small></span></span>`;

/* saved-for-later list — core does not preload this key, so read it here (persisted with TBB.save('later')) */
if (!Array.isArray(S.later)) {
  let v = [];
  try { v = JSON.parse(localStorage.getItem('tbb2_later') || '[]'); } catch (e) { v = []; }
  S.later = Array.isArray(v) ? v.filter(id => product(id)) : [];
}

const PAY = {
  upi:        { label: 'UPI',                 icon: 'upi',  sub: 'Google Pay, PhonePe, Paytm, BHIM & any UPI app', tag: 'Most used' },
  card:       { label: 'Credit / Debit card', icon: 'card', sub: 'Visa, Mastercard, RuPay & Amex',                 tag: 'No-cost EMI' },
  netbanking: { label: 'Net banking',         icon: 'bank', sub: 'All major Indian banks',                          tag: '' },
  cod:        { label: 'Cash on delivery',    icon: 'cash', sub: 'Pay by cash or UPI at your doorstep',             tag: '' },
};
const payLabel = k => (PAY[k] || PAY.upi).label;
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
const SAMPLES = [['plum-gt', 'Plum Green Tea Face Wash'], ['min-niacin', 'Minimalist Niacinamide Serum'], ['cet-moist', 'Cetaphil Moisturising Cream']];
const BOW = '<svg class="co-bow" viewBox="0 0 48 30" aria-hidden="true"><path d="M24 14C18 3 5 1 4 8s10 9 20 6z" fill="#fff"/><path d="M24 14c6-11 19-13 20-6s-10 9-20 6z" fill="#ffe3ea"/><path d="M24 14l-8 13 4.5-1 3.5 3.5zM24 14l8 13-4.5-1-3.5 3.5z" fill="#ffd0dc"/><circle cx="24" cy="14" r="4.2" fill="#fff"/></svg>';
const C1_POOL = ['him-fw', 'lakme-kajal', 'para-aloe', 'gar-bright', 'nivea-men', 'beardo-fw', 'mama-vitc', 'nivea-cream', 'bio-bhring', 'him-shamp', 'para-coco', 'dove-bw'];
const SUGGEST = ['him-fw', 'lakme-kajal', 'mama-onion', 'cet-cl', 'lo-shampoo'];

/* ---------- module state ---------- */
let step = 1;                 // checkout step (1 address · 2 gifts · 3 payment)
let giftErr = false;
let justPicked = null;        // gift id to animate after a pick
let pendingFocus = null;      // selector to re-focus after a re-render
let pendingScroll = 0;        // checkout step to scroll to after a re-render
let meterPulse = false;       // celebrate the gift meter after unlocking a tier
let lastRemoved = null;       // { line, idx } for "Undo"
let upiApp = 'gpay', bank = 'sbi';
let placing = false, placeT = 0, shuffleT = 0;
let sampleOn = true;          // X1 partner sample opted in (customer can remove it in step 2)
let barIO = null;             // mobile cart: shows the sticky checkout bar once the summary CTA scrolls away

/* keep chosen gifts valid: active, in stock, unique, within the allowance */
function cleanGifts(sub = TBB.cart.subtotal()) {
  const allow = TBB.gift.allowance(sub);
  const ok = new Set(TBB.gift.active().filter(inStock).map(g => g.id));
  const next = S.gifts.filter((id, i, a) => ok.has(id) && a.indexOf(id) === i).slice(0, allow);
  if (next.length !== S.gifts.length || next.some((x, i) => x !== S.gifts[i])) { S.gifts = next; TBB.save('gifts'); }
}
const topWorth = n => TBB.gift.active().map(g => g.worth).sort((a, b) => b - a).slice(0, n).reduce((a, b) => a + b, 0);
function totals() {
  const sub = TBB.cart.subtotal(), mrp = TBB.cart.mrp(), ship = TBB.cart.shipping(sub);
  const gifts = S.gifts.map(giftById).filter(Boolean);
  const gw = gifts.reduce((a, g) => a + g.worth, 0);
  return { sub, mrp, ship, total: sub + ship, disc: mrp - sub, gifts, gw, saved: mrp - sub + gw, count: TBB.cart.count(), allow: TBB.gift.allowance(sub), nt: TBB.gift.next(sub) };
}
/* productCard uses the core "add" action (opens the flyout); on these pages we add silently and re-render */
const localAdd = html => html.replace(/data-action="add"/g, 'data-action="co-add"');

/* =========================================================
   CART  (#/cart)
   ========================================================= */
function meter(sub) {
  const tiers = TBB.gift.tiers(); if (!tiers.length) return '';
  const allow = TBB.gift.allowance(sub), nt = TBB.gift.next(sub);
  const pts = tiers[0].min > 0 ? [{ min: 0, origin: true }, ...tiers] : tiers.slice();
  const n = pts.length, pos = i => (n < 2 ? 100 : (i / (n - 1)) * 100);
  let fill = 100;
  for (let i = 0; i < n - 1; i++) {
    if (sub < pts[i + 1].min) { fill = pos(i) + Math.max(0, (sub - pts[i].min) / (pts[i + 1].min - pts[i].min)) * (pos(i + 1) - pos(i)); break; }
  }
  const nodes = pts.map((t, i) => t.origin ? '' : `<span class="co-ms${sub >= t.min ? ' is-on' : ''}" style="left:${pos(i).toFixed(2)}%"><i>${icon(sub >= t.min ? 'check' : 'gift')}</i><small><b>${plural(t.count, 'gift')}</b>${t.min ? fmt(t.min) + '+' : 'Any order'}</small></span>`).join('');
  const gifts = TBB.gift.active();
  const title = allow ? `You’ve unlocked <em>${plural(allow, 'free gift')}</em>` : 'Free gifts with every order';
  const line = nt ? `Add <b>${fmt(nt.min - sub)}</b> more to unlock <b>${plural(nt.count, 'gift')}</b> — you choose them at checkout.`
    : `That’s the maximum on one order — pick your ${plural(allow, 'TBB Original')} at checkout.`;
  return `<section class="co-meter${meterPulse ? ' is-pulse' : ''}" aria-label="Free gift progress">
    <div class="co-meter-ic" aria-hidden="true">${icon('gift')}</div>
    <div class="co-meter-t"><h2>${title}</h2><p>${line}</p></div>
    <div class="co-track" role="progressbar" aria-label="Progress to the next free gift" aria-valuemin="0" aria-valuemax="${tiers[tiers.length - 1].min}" aria-valuenow="${Math.min(sub, tiers[tiers.length - 1].min)}" aria-valuetext="${esc(nt ? `${fmt(nt.min - sub)} away from ${nt.count} gifts` : 'All gift tiers unlocked')}">
      <div class="co-track-in"><div class="co-track-bar"><i style="width:${fill.toFixed(2)}%"></i></div>${nodes}</div>
    </div>
    <div class="co-meter-g">
      <div class="co-meter-minis" aria-hidden="true">${gifts.slice(0, 6).map(g => `<span style="--tint:${g.c1}">${art(g)}</span>`).join('')}</div>
      <small>${gifts.length} TBB Originals · worth up to ${fmt(topWorth(Math.max(allow, 1)))}</small>
    </div>
  </section>`;
}

function lineRow(l) {
  const p = l.p, b = brand(p.brand), disc = p.mrp > p.price;
  return `<article class="co-line" data-id="${p.id}">
    <a class="co-line-art" href="#/p/${p.id}" style="--tint:${p.c1}" tabindex="-1" aria-hidden="true">${art(p)}</a>
    <div class="co-line-info">
      <a class="co-line-brand" href="#/brand/${b.id}">${esc(b.name)}</a>
      <a class="co-line-name" href="#/p/${p.id}">${esc(p.name)}</a>
      <div class="co-line-meta"><span class="co-stock">${icon('check')}In stock</span><span>Size: <b>${esc(p.size)}</b></span>${p.tag ? `<span class="co-line-tag">${esc(p.tag)}</span>` : ''}</div>
      <div class="co-line-del">${icon('truck')}<span>Delivery by <b>${ETA()}</b><span class="co-seller"> · sold by a brand-authorised seller</span></span></div>
    </div>
    <div class="co-line-price">
      ${disc ? `<span class="co-off">${off(p)}% off</span>` : ''}
      <b>${fmt(p.price * l.qty)}</b>
      ${disc ? `<small>M.R.P. <s>${fmt(p.mrp * l.qty)}</s></small>` : ''}
      ${l.qty > 1 ? `<small>${fmt(p.price)} each</small>` : ''}
    </div>
    <div class="co-line-acts">
      <div class="co-qty" role="group" aria-label="Quantity for ${esc(p.name)}">
        <button type="button" data-action="co-qty" data-id="${p.id}" data-d="-1" aria-label="${l.qty === 1 ? 'Remove item' : 'Decrease quantity'}">${icon(l.qty === 1 ? 'trash' : 'minus')}</button>
        <output aria-live="polite" aria-label="Quantity">${l.qty}</output>
        <button type="button" data-action="co-qty" data-id="${p.id}" data-d="1" aria-label="Increase quantity"${l.qty >= 10 ? ' disabled' : ''}>${icon('plus')}</button>
      </div>
      <button type="button" class="co-tb" data-action="co-del" data-id="${p.id}">Delete</button>
      <button type="button" class="co-tb" data-action="co-later" data-id="${p.id}">Save for later</button>
    </div>
  </article>`;
}

function c1Block(sub) {
  if (S.slotOn.C1 === false) return '';
  const inCart = new Set(S.cart.map(l => l.id));
  const nt = TBB.gift.next(sub), gap = nt ? nt.min - sub : 0;
  const shipGap = TBB.cart.shipping(sub) ? 499 - sub : 0;
  let pool = C1_POOL.map(product).filter(p => p && !inCart.has(p.id));
  if (gap > 0 && pool.some(p => p.price >= gap)) {
    pool = [...pool.filter(p => p.price >= gap).sort((a, b) => a.price - b.price), ...pool.filter(p => p.price < gap)];
  }
  pool = pool.slice(0, 6);
  const camp = TBB.ads.list('C1').filter(c => c.custom)[0];
  if (!pool.length && !camp) return '';
  const unlockTxt = p => (gap > 0 && p.price >= gap) ? `${icon('gift')}Unlocks gift ${nt.count}` : (shipGap > 0 && p.price >= shipGap) ? `${icon('truck')}FREE delivery` : '';
  const items = (camp ? `<div class="co-c1-it">${campTile(camp)}</div>` : '') + pool.map(p => {
    const u = unlockTxt(p);
    // the chip sits inside the card's packshot (first </a> closes .pc-img), so it lines up at any card width
    const card = localAdd(U.productCard(p, { sponsored: true, compact: true }));
    return `<div class="co-c1-it">${u ? card.replace('</a>', `<span class="co-unlock">${u}</span></a>`) : card}</div>`;
  }).join('');
  const hint = gap > 0 && pool.some(p => p.price >= gap)
    ? `<p class="co-c1-hint">${icon('gift')}<span>Add any item marked <b>Unlocks gift ${nt.count}</b> and you’ll pick <b>${plural(nt.count, 'free gift')}</b> instead of ${TBB.gift.allowance(sub)}.</span></p>`
    : (shipGap > 0 && pool.some(p => p.price >= shipGap))
      ? `<p class="co-c1-hint">${icon('truck')}<span>You’re <b>${fmt(shipGap)}</b> away from <b>FREE delivery</b> — any item marked below gets you there.</span></p>` : '';
  return U.slot('C1', `<div class="blk co-c1-in">
      <div class="co-sec-h"><div><h2>Add before checkout</h2><p>Quick add-ons under ₹299 — they ship in the same box.</p></div>
        <div class="co-disc">${U.adBadge('Sponsored')}<button type="button" class="co-why" data-action="co-whyc1">${icon('info')}Why these?</button></div></div>
      ${hint}
      ${U.rail(items, { cls: 'co-c1-rail' })}
    </div>`, { cls: 'co-c1' });
}
function campTile(c) {
  const th = c.theme || {};
  return `<a class="co-c1-camp" href="${esc(c.href || '#/brand/' + c.brand)}" style="--bg:${esc(th.bg || '#22103b')};--fg:${esc(th.fg || '#fff')};--ac:${esc(th.accent || '#ffd36b')}">
    ${U.adBadge('Ad')}
    <span class="co-c1-camp-logo">${U.brandLogo(c.brand, { size: 22, color: th.fg || '#fff' })}</span>
    <b>${esc(c.headline)}</b>${c.sub ? `<small>${esc(c.sub)}</small>` : ''}
    <span class="co-c1-camp-cta">${esc(c.cta || 'Shop now')} ${icon('arrow')}</span>
  </a>`;
}

function laterBlock() {
  const items = S.later.map(product).filter(Boolean);
  if (!items.length) return '';
  return `<section class="blk co-later" aria-label="Saved for later">
    <div class="co-sec-h"><div><h2>Saved for later <span>(${items.length})</span></h2><p>Prices can change — move them back when you’re ready.</p></div></div>
    <div class="co-later-grid">${items.map(p => `<div class="co-lt">
      <a class="co-lt-art" href="#/p/${p.id}" style="--tint:${p.c1}" tabindex="-1" aria-hidden="true">${art(p)}</a>
      <div class="co-lt-b">
        <small>${esc(brand(p.brand).name)}</small>
        <a href="#/p/${p.id}">${esc(p.name)}</a>
        <b>${fmt(p.price)}</b>
        <div class="co-lt-acts"><button type="button" class="btn btn-ghost btn-sm" data-action="co-move" data-id="${p.id}">Move to cart</button><button type="button" class="co-tb" data-action="co-later-del" data-id="${p.id}">Delete</button></div>
      </div>
    </div>`).join('')}</div>
  </section>`;
}

function cartSummary(t) {
  const worth = topWorth(t.allow);
  const a = S.address;
  return `<div class="blk co-sum">
    ${t.ship === 0
      ? `<p class="co-ship is-ok">${icon('check')}<span>Your order qualifies for <b>FREE delivery</b></span></p>`
      : `<p class="co-ship">${icon('truck')}<span>Add <b>${fmt(499 - t.sub)}</b> more for <b>FREE delivery</b></span><i style="width:${Math.min(100, t.sub / 499 * 100).toFixed(1)}%"></i></p>`}
    <dl class="co-rows">
      <div><dt>Items (${t.count}) at M.R.P.</dt><dd>${fmt(t.mrp)}</dd></div>
      <div class="is-save"><dt>Savings vs M.R.P.</dt><dd>−${fmt(t.disc)}</dd></div>
      <div><dt>Delivery</dt><dd>${t.ship ? fmt(t.ship) : '<s>₹49</s> <span class="free">FREE</span>'}</dd></div>
      <div class="is-gift"><dt>${icon('gift')}Free gifts × ${t.allow}</dt><dd><span class="free">FREE</span></dd></div>
    </dl>
    <div class="co-sum-total"><span>Subtotal</span><b>${fmt(t.total)}</b></div>
    <p class="co-sum-save">${icon('sparkle')}<span>You save <b>${fmt(t.disc + worth)}</b> — ${fmt(t.disc)} off M.R.P. + gifts worth up to ${fmt(worth)}</span></p>
    <a class="btn btn-cart btn-lg co-sum-cta" href="#/checkout">Proceed to checkout ${icon('arrow')}</a>
    <p class="co-sum-to">${icon('pin')}<span>Delivering to <b>${esc(firstName())}</b> · ${esc(a.city)} ${esc(a.pin)}</span></p>
  </div>
  <ul class="co-trust" aria-label="Why shop with us">
    <li>${ic('lock')}<span><b>Secure payments</b>UPI, cards, COD</span></li>
    <li>${icon('shield')}<span><b>100% authentic</b>From brands & distributors</span></li>
    <li>${icon('ret')}<span><b>Easy returns</b>7-day, no questions</span></li>
  </ul>`;
}

function emptyArt() {
  return `<svg class="co-empty-art" viewBox="0 0 160 140" aria-hidden="true">
    <defs><linearGradient id="co-bag-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3d6e"/><stop offset="1" stop-color="#ff7a45"/></linearGradient></defs>
    <ellipse cx="80" cy="130" rx="56" ry="6" fill="#e6e1ef"/>
    <path d="M58 50V40a22 22 0 0 1 44 0v10" fill="none" stroke="#33195a" stroke-width="5" stroke-linecap="round"/>
    <path d="M34 48h92l-6 72a9 9 0 0 1-9 8H49a9 9 0 0 1-9-8z" fill="url(#co-bag-g)"/>
    <path d="M40 48h86" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
    <rect x="60" y="78" width="40" height="32" rx="4" fill="#fff"/>
    <rect x="77" y="78" width="6" height="32" fill="#ffc94d"/><rect x="60" y="88" width="40" height="6" fill="#ffc94d"/>
    <path d="M80 78c-9-12-21-6-15 0zM80 78c9-12 21-6 15 0z" fill="#ffc94d" stroke="#f0a92a" stroke-width="1.5"/>
    <path d="M128 22l2.4 6.6 6.6 2.4-6.6 2.4-2.4 6.6-2.4-6.6-6.6-2.4 6.6-2.4z" fill="#ffc94d"/>
    <path d="M26 30l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#ff3d6e" opacity=".7"/>
  </svg>`;
}

function emptyCart() {
  const gifts = TBB.gift.active();
  return `<section class="wrap co-page co-empty">
    <div class="blk co-empty-hero">
      ${emptyArt()}
      <div class="co-empty-t">
        <h1>Your cart is empty</h1>
        <p>Shop 50+ brands you already love — and every order comes with a <b>free TBB Originals gift</b> you choose before paying. Up to 3 per order.</p>
        <div class="co-empty-btns"><a class="btn btn-cart btn-lg" href="#/">Start shopping ${icon('arrow')}</a><a class="btn btn-ghost btn-lg" href="#/deals">${icon('zap')} Today’s deals</a></div>
      </div>
      <div class="co-empty-gifts" aria-label="Free gifts you can choose">
        <small>Free with your order</small>
        <div>${gifts.slice(0, 6).map(g => `<span style="--tint:${g.c1}" title="${esc(g.name)}">${art(g)}</span>`).join('')}</div>
      </div>
    </div>
    ${laterBlock()}
    ${emptySuggest()}
  </section>`;
}
/* an empty cart is still C1 inventory: sponsored "start here" picks (plain bestsellers when the admin pauses C1) */
function emptySuggest() {
  const sp = S.slotOn.C1 !== false;
  const html = `<section class="blk co-sugg">
      <div class="co-sec-h"><div><h2>${sp ? 'Popular picks to start with' : 'Bestsellers to start with'}</h2><p>Most-loved by shoppers in ${esc(S.address.city)} this week — each one comes with a free gift.</p></div>
        ${sp ? `<div class="co-disc">${U.adBadge('Sponsored')}<button type="button" class="co-why" data-action="toast" data-icon="info" data-msg="Brands pay to feature these picks — always labelled Sponsored. Your free gift comes with any of them.">${icon('info')}Why these?</button></div>`
          : `<a class="link" href="#/s?sort=best">See all ${icon('chevRight')}</a>`}</div>
      <div class="co-sugg-grid">${SUGGEST.map(id => localAdd(U.productCard(product(id), { sponsored: sp }))).join('')}</div>
    </section>`;
  return sp ? U.slot('C1', html, { cls: 'co-sugg-slot' }) : html;
}

function cartView() {
  cleanGifts();
  const lines = TBB.cart.lines();
  if (!lines.length) return emptyCart();
  const t = totals();
  const html = `<section class="wrap co-page co-cart">
    ${meter(t.sub)}
    <div class="co-cbar" id="co-cbar">
      <div class="co-cbar-t"><small>Subtotal · ${plural(t.count, 'item')}</small><b>${fmt(t.total)}</b></div>
      ${t.allow ? `<span class="co-cbar-g">${icon('gift')}${plural(t.allow, 'gift')} free</span>` : ''}
      <a class="btn btn-cart" href="#/checkout">Checkout ${icon('arrow')}</a>
    </div>
    <div class="co-cart-grid">
      <div class="co-cart-main">
        <div class="blk co-lines">
          <div class="co-lines-h"><h1>Shopping cart <span>${plural(t.count, 'item')}</span></h1><span class="co-lines-ph" aria-hidden="true">Price</span></div>
          ${lines.map(lineRow).join('')}
          <p class="co-lines-sub">Subtotal (${plural(t.count, 'item')}): <b>${fmt(t.sub)}</b></p>
        </div>
        ${c1Block(t.sub)}
        ${laterBlock()}
      </div>
      <aside class="co-cart-side" aria-label="Order summary">${cartSummary(t)}</aside>
    </div>
  </section>`;
  meterPulse = false;
  return html;
}

/* =========================================================
   CHECKOUT  (#/checkout) — focused, chrome-less 3-step flow
   ========================================================= */
function ckHeader(showProgress = true) {
  const labels = ['Address', 'Free gifts', 'Payment'];
  return `<header class="co-mh"><div class="co-mh-in">
    <a class="co-mh-logo" href="#/" aria-label="The Big Brands home">${logoMark()}</a>
    ${showProgress ? `<ol class="co-prog" aria-label="Checkout progress">${labels.map((t, i) => {
      const n = i + 1, st = n < step ? 'done' : n === step ? 'now' : 'todo';
      return `<li class="is-${st}"${st === 'now' ? ' aria-current="step"' : ''}><i>${st === 'done' ? icon('check') : n}</i><span>${t}</span></li>`;
    }).join('')}</ol>` : '<span class="co-prog"></span>'}
    <span class="co-mh-sec">${ic('lock')}<span>Secure checkout</span></span>
  </div></header>`;
}

function stepCard(n, title, { summary = '', todo = '', body = '' } = {}) {
  const st = n < step ? 'done' : n === step ? 'open' : 'todo';
  return `<section class="blk co-sc is-${st}" id="co-s${n}" aria-labelledby="co-s${n}-h">
    <header class="co-sc-h">
      <span class="co-sc-n" aria-hidden="true">${st === 'done' ? icon('check') : n}</span>
      <div class="co-sc-tt"><h2 id="co-s${n}-h" tabindex="-1">${title}</h2>${st === 'done' ? `<div class="co-sc-sum">${summary}</div>` : st === 'todo' ? `<div class="co-sc-sum">${todo}</div>` : ''}</div>
      ${st === 'done' ? `<button type="button" class="co-change" data-action="co-goto" data-step="${n}" aria-label="Change ${esc(title.toLowerCase())}">Change</button>` : ''}
    </header>
    ${st === 'open' ? `<div class="co-sc-b">${body}</div>` : ''}
  </section>`;
}

function field(name, label, val, attrs = '', cls = '', pre = '') {
  const input = `<input id="co-${name}" name="${name}" value="${esc(val || '')}" ${attrs} aria-describedby="co-e-${name}">`;
  return `<div class="co-f ${cls}"><label for="co-${name}">${label}</label>${pre ? `<div class="co-pre"><span aria-hidden="true">${pre}</span>${input}</div>` : input}<small class="co-err" id="co-e-${name}" aria-live="polite"></small></div>`;
}
function addrBody() {
  const a = S.address;
  return `<form id="co-addr-form" class="co-form" novalidate>
    ${field('name', 'Full name', a.name, 'autocomplete="name" required')}
    ${field('phone', 'Mobile number', a.phone, 'type="tel" inputmode="numeric" autocomplete="tel-national" required', '', '+91')}
    ${field('line', 'Flat, house no., building, street', a.line, 'autocomplete="street-address" required', 'co-f-wide')}
    ${field('pin', 'Pincode', a.pin, 'inputmode="numeric" maxlength="6" autocomplete="postal-code" required')}
    ${field('city', 'Town / City', a.city, 'autocomplete="address-level2" required')}
    <div class="co-f"><label for="co-state">State</label><select id="co-state" name="state" autocomplete="address-level1" aria-describedby="co-e-state"><option value="">Select state</option>${STATES.map(s => `<option${s === a.state ? ' selected' : ''}>${s}</option>`).join('')}</select><small class="co-err" id="co-e-state" aria-live="polite"></small></div>
    ${field('email', 'Email <em>(for order updates)</em>', a.email, 'type="email" autocomplete="email"')}
    <p class="co-eta co-f-wide">${icon('truck')}<span>Delivery by <b>${ETA()}</b> to pincode <b class="co-eta-pin">${esc(a.pin)}</b> · Cash on delivery available</span></p>
    <div class="co-sc-foot co-f-wide"><p class="co-foot-note">${icon('shield')}We only use your number for delivery updates.</p><button type="submit" class="btn btn-cart btn-lg">Deliver to this address ${icon('arrow')}</button></div>
  </form>`;
}
function addrSummary() {
  const a = S.address;
  return `<b>${esc(a.name)}</b>, ${esc(a.line)}, ${esc(a.city)}${a.state ? ', ' + esc(a.state) : ''} ${esc(a.pin)} · +91 ${esc(a.phone)}`;
}

function giftBody() {
  const t = totals(), allow = t.allow, nt = t.nt, sel = S.gifts;
  const gifts = TBB.gift.active();
  const slots = [];
  for (let i = 0; i < allow; i++) {
    const g = giftById(sel[i]);
    slots.push(g
      ? `<button type="button" class="co-slot is-full${g.id === justPicked ? ' is-new' : ''}" data-action="co-gift" data-id="${g.id}" style="--tint:${g.c1}" aria-label="Remove ${esc(g.name)} from your gift box"><span class="co-slot-art">${art(g)}</span><span class="co-slot-x">${icon('close')}</span></button>`
      : `<span class="co-slot"><i>${icon('gift')}</i><small>Gift ${i + 1}</small></span>`);
  }
  if (nt) for (let i = allow; i < nt.count; i++) slots.push(`<a class="co-slot is-lock" href="#/s" aria-label="Locked gift — add ${fmt(nt.min - t.sub)} more to unlock"><i>${ic('lock')}</i><small>+${fmt(nt.min - t.sub)}</small></a>`);
  const cards = gifts.map(g => {
    const on = sel.includes(g.id), stock = S.giftStock[g.id], out = !inStock(g), low = !out && stock != null && stock < 60;
    return `<button type="button" class="co-gift${on ? ' is-on' : ''}${g.id === justPicked ? ' is-new' : ''}" data-action="co-gift" data-id="${g.id}" aria-pressed="${on}"${out ? ' disabled' : ''} style="--tint:${g.c1}" aria-label="${esc(`${g.name}, ${g.mini}, worth ${fmt(g.worth)}, free${out ? ', out of stock' : ''}`)}">
      <span class="co-gift-img">${art(g)}<span class="co-gift-free">FREE</span><span class="co-gift-tick">${icon('check')}</span><span class="co-gift-in" aria-hidden="true">${BOW}In your gift box</span></span>
      <span class="co-gift-body">
        <span class="co-gift-n">${esc(g.name)}</span>
        <span class="co-gift-m">${esc(g.mini)} · TBB Originals</span>
        <span class="co-gift-w">worth <s>${fmt(g.worth)}</s> <b>₹0</b></span>
        ${out ? '<span class="co-gift-low">Out of stock</span>' : low ? `<span class="co-gift-low">Only ${stock} left</span>` : ''}
      </span>
    </button>`;
  }).join('');
  const hint = allow === 1 ? 'Tap a different gift to swap your pick.' : `Pick up to ${allow}. Tap a picked gift again to remove it.`;
  const full = allow > 1 && sel.length >= allow;
  return `<div class="co-tray${giftErr ? ' is-err' : ''}" id="co-tray">
      <div class="co-tray-t"><b>Your gift box</b><span><em>${sel.length}</em> of ${allow} picked${t.gw ? ` · worth ${fmt(t.gw)}` : ''}</span></div>
      <div class="co-slots">${slots.join('')}</div>
      <button type="button" class="btn btn-ghost btn-sm co-surprise" data-action="co-surprise">${icon('sparkle')} Surprise me</button>
    </div>
    <p class="co-gerr" role="alert">${giftErr ? `${icon('info')}Pick at least one free gift to continue — it’s on us` : ''}</p>
    <p class="co-ghint">Complimentary minis from <b>TBB Originals</b>, our own label — packed with your order at no cost. ${hint}</p>
    <div class="co-ggrid${full ? ' is-full' : ''}" id="co-ggrid" role="group" aria-label="Choose your free gifts">${cards}</div>
    ${x1Offer()}
    ${nt
      ? `<a class="co-gup" href="#/s">${icon('gift')}<span><b>Add ${fmt(nt.min - t.sub)} more to unlock ${plural(nt.count, 'free gift')}</b><small>Browse add-ons — your cart and gift picks stay saved</small></span><span class="co-gup-go">Shop ${icon('arrow')}</span></a>`
      : `<p class="co-gmax">${icon('sparkle')}<span>You’ve unlocked the maximum <b>${plural(allow, 'free gift')}</b> on this order.</span></p>`}
    <div class="co-sc-foot"><p class="co-foot-note">${icon('gift')}Gifts are packed in the same box and can’t be exchanged for cash.</p><button type="button" class="btn btn-cart btn-lg" data-action="co-gifts-next">Continue to payment ${icon('arrow')}</button></div>`;
}
function giftSummary() {
  const g = S.gifts.map(giftById).filter(Boolean);
  if (!g.length) return 'No gift picked yet';
  const smp = sampleActive();
  return `<span class="co-gchips">${g.map(x => `<span class="co-gchip" style="--tint:${x.c1}"><span>${art(x)}</span>${esc(x.line)} · ${esc(x.mini)}</span>`).join('')}${smp ? `<span class="co-gchip is-x1" style="--tint:${smp.p.c1}"><span>${art(smp.p)}</span>+ ${esc(brand(smp.p.brand).name)} trial</span>` : ''}<span class="free">FREE</span></span>`;
}

/* X1 · in-box partner sample — an opt-in, sponsored extra that rides in the same box (brands pay per box) */
function samplePick(ids) {
  const pick = SAMPLES.find(([id]) => product(id) && !ids.includes(id));
  return pick ? { p: product(pick[0]), name: pick[1] } : null;
}
function sampleActive() {
  if (!sampleOn || S.slotOn.X1 === false) return null;
  return samplePick(S.cart.map(l => l.id));
}
function x1Offer() {
  if (S.slotOn.X1 === false) return '';
  const smp = samplePick(S.cart.map(l => l.id)); if (!smp) return '';
  const p = smp.p, b = brand(p.brand);
  return U.slot('X1', `<div class="co-x1${sampleOn ? ' is-on' : ''}">
      <span class="co-x1-art" style="--tint:${p.c1}">${art(p)}</span>
      <span class="co-x1-t">
        <span class="co-x1-k">${U.adBadge('Sponsored')}<span>Partner sample · also free</span></span>
        <b>${esc(smp.name)} — 10 ml trial</b>
        <small>From ${esc(b.name)} · rides in the same box · doesn’t use a gift slot</small>
      </span>
      <button type="button" class="co-x1-btn" data-action="co-x1" aria-pressed="${sampleOn}" aria-label="${sampleOn ? 'Remove' : 'Add'} the free ${esc(b.name)} trial sample">${sampleOn ? `${icon('check')}Added` : `${icon('plus')}Add`}</button>
    </div>`, { cls: 'co-x1-slot' });
}

function payDetail(k, total) {
  if (k === 'upi') {
    const apps = [['gpay', 'Google Pay', '#4285f4'], ['phonepe', 'PhonePe', '#5f259f'], ['paytm', 'Paytm', '#00b9f1'], ['bhim', 'BHIM', '#f47920']];
    return `<div class="co-apps" role="group" aria-label="UPI app">${apps.map(([id, n, c]) => `<button type="button" class="co-app${upiApp === id ? ' is-on' : ''}" data-action="co-upi-app" data-app="${id}" aria-pressed="${upiApp === id}" style="--c:${c}"><i aria-hidden="true">${n[0]}</i>${n}</button>`).join('')}</div>
      <div class="co-f"><label for="co-upi-id">Or enter your UPI ID</label><div class="co-inrow"><input id="co-upi-id" value="${esc(firstName().toLowerCase())}.sharma@okaxis" autocomplete="off" spellcheck="false"><button type="button" class="btn btn-ghost" data-action="toast" data-msg="UPI ID verified — ${esc(S.address.name)}" data-icon="check">Verify</button></div></div>
      <p class="co-pay-note">You’ll get a payment request for <b>${fmt(total)}</b> in your UPI app.</p>`;
  }
  if (k === 'card') {
    return `<div class="co-cardf">
      <div class="co-f co-f-wide"><label for="co-cn">Card number</label><input id="co-cn" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456"></div>
      <div class="co-f"><label for="co-ce">Expiry</label><input id="co-ce" autocomplete="cc-exp" placeholder="MM / YY"></div>
      <div class="co-f"><label for="co-cv">CVV</label><input id="co-cv" inputmode="numeric" autocomplete="cc-csc" placeholder="•••"></div>
      <div class="co-f co-f-wide"><label for="co-ch">Name on card</label><input id="co-ch" autocomplete="cc-name" value="${esc(S.address.name)}"></div>
    </div><p class="co-pay-note">${icon('shield')}Cards are tokenised as per RBI guidelines — we never store your card number.</p>`;
  }
  if (k === 'netbanking') {
    const banks = [['sbi', 'SBI', '#22409a'], ['hdfc', 'HDFC Bank', '#004c8f'], ['icici', 'ICICI Bank', '#b02a30'], ['axis', 'Axis Bank', '#97144d'], ['kotak', 'Kotak', '#ed1c24']];
    return `<div class="co-banks" role="group" aria-label="Popular banks">${banks.map(([id, n, c]) => `<button type="button" class="co-bank${bank === id ? ' is-on' : ''}" data-action="co-bank" data-bank="${id}" aria-pressed="${bank === id}" style="--c:${c}"><i aria-hidden="true">${n[0]}</i>${n}</button>`).join('')}</div>
      <div class="co-f"><label for="co-ob">Other banks</label><select id="co-ob"><option>Choose another bank</option><option>Bank of Baroda</option><option>Punjab National Bank</option><option>Canara Bank</option><option>Union Bank of India</option><option>IDFC FIRST Bank</option><option>Yes Bank</option></select></div>`;
  }
  return `<p class="co-cod">${icon('home')}<span>Pay <b>${fmt(total)}</b> in cash or by scanning a UPI QR when your order arrives. COD is available for pincode <b>${esc(S.address.pin)}</b>.</span></p>`;
}
function payBody() {
  const t = totals();
  const opts = Object.keys(PAY).map(k => {
    const o = PAY[k], on = S.pay === k;
    return `<div class="co-pay${on ? ' is-on' : ''}">
      <label class="co-pay-h"><input type="radio" name="co-pay" value="${k}"${on ? ' checked' : ''}><span class="co-radio" aria-hidden="true"></span><span class="co-pay-ic">${ic(o.icon)}</span><span class="co-pay-t"><b>${o.label}</b><small>${o.sub}</small></span>${o.tag ? `<span class="co-pay-tag">${o.tag}</span>` : ''}</label>
      ${on ? `<div class="co-pay-d">${payDetail(k, t.total)}</div>` : ''}
    </div>`;
  }).join('');
  return `<fieldset class="co-pays"><legend class="sr-only">Payment method</legend>${opts}</fieldset>
    <p class="co-demo">${icon('info')}<span><b>Demo checkout</b> — no money is charged. Live site uses <b>Razorpay / Cashfree</b> for UPI, cards, net banking and COD.</span></p>
    <div class="co-sc-foot"><p class="co-foot-note">By placing your order you agree to our Conditions of Use. Your ${plural(t.gifts.length, 'free gift')} will be packed in the same box.</p><button type="button" class="btn btn-cart btn-lg" data-action="co-place">Place order · ${fmt(t.total)}</button></div>`;
}

function orderSummary({ mobile = false } = {}) {
  const t = totals(), lines = TBB.cart.lines();
  const items = lines.map(l => `<li class="co-os-it">
      <span class="co-os-art" style="--tint:${l.p.c1}">${art(l.p)}${l.qty > 1 ? `<i>${l.qty}</i>` : ''}</span>
      <span class="co-os-n"><b>${esc(l.p.name)}</b><small>${esc(brand(l.p.brand).name)} · ${esc(l.p.size)}${l.qty > 1 ? ` · Qty ${l.qty}` : ''}</small></span>
      <span class="co-os-p">${fmt(l.p.price * l.qty)}</span>
    </li>`).join('');
  const gifts = t.gifts.length
    ? t.gifts.map(g => `<li class="co-os-it is-gift">
        <span class="co-os-art" style="--tint:${g.c1}">${art(g)}</span>
        <span class="co-os-n"><b>${esc(g.name)}</b><small>${esc(g.mini)} · <span class="free">FREE</span></small></span>
        <span class="co-os-p"><s>${fmt(g.worth)}</s>₹0</span>
      </li>`).join('')
    : `<li class="co-os-gempty">${icon('gift')}<span>Choose ${plural(t.allow, 'free gift')} in step 2</span></li>`;
  return `<div class="co-os-h"><h2>Order summary</h2><a class="link" href="#/cart">Edit cart</a></div>
    <ul class="co-os-items">${items}</ul>
    <div class="co-os-gifts"><p class="co-os-gh">${icon('gift')}<b>Your free gifts</b><small>TBB Originals</small></p><ul>${gifts}</ul>${(() => { const smp = sampleActive(); return smp ? `<p class="co-os-x1">${icon('plus')}<span>${esc(brand(smp.p.brand).name)} 10 ml trial · partner sample</span><b>₹0</b></p>` : ''; })()}</div>
    <dl class="co-rows">
      <div><dt>Items (${t.count}) at M.R.P.</dt><dd>${fmt(t.mrp)}</dd></div>
      <div class="is-save"><dt>Discount on M.R.P.</dt><dd>−${fmt(t.disc)}</dd></div>
      <div><dt>Delivery</dt><dd>${t.ship ? fmt(t.ship) : '<s>₹49</s> <span class="free">FREE</span>'}</dd></div>
      <div class="is-gift"><dt>Free gifts${t.gifts.length ? ` (${t.gifts.length})` : ''}</dt><dd>${t.gw ? `<s>${fmt(t.gw)}</s> ` : ''}<span class="free">₹0</span></dd></div>
    </dl>
    <div class="co-sum-total"><span>Order total</span><b>${fmt(t.total)}</b></div>
    ${t.saved > 0 ? `<p class="co-sum-save">${icon('sparkle')}<span>You save <b>${fmt(t.saved)}</b> on this order${t.gw ? ` — ${fmt(t.disc)} off M.R.P. + ${fmt(t.gw)} in free gifts` : ''}</span></p>` : ''}
    ${!mobile && step === 3 ? `<button type="button" class="btn btn-cart btn-lg co-os-cta" data-action="co-place">Place order · ${fmt(t.total)}</button>` : ''}`;
}

function ckBar(t) {
  const cta = step === 1 ? `<button type="submit" form="co-addr-form" class="btn btn-cart">Continue ${icon('arrow')}</button>`
    : step === 2 ? `<button type="button" class="btn btn-cart" data-action="co-gifts-next">Continue ${icon('arrow')}</button>`
    : `<button type="button" class="btn btn-cart" data-action="co-place">Place order</button>`;
  return `<div class="co-mbar"><div class="co-mbar-t"><b>${fmt(t.total)}</b><small>${t.saved > 0 ? `You save ${fmt(t.saved)}` : 'Incl. all taxes'}</small></div>${cta}</div>`;
}

function checkoutView() {
  const lines = TBB.cart.lines();
  if (!lines.length) {
    return `${ckHeader(false)}<section class="co-ck-empty"><div class="blk co-empty-hero is-mini">
      ${emptyArt()}
      <div class="co-empty-t"><h1>Nothing to check out yet</h1><p>Your cart is empty. Add a few favourites — every order comes with a free TBB Originals gift.</p>
      <div class="co-empty-btns"><a class="btn btn-cart btn-lg" href="#/">Continue shopping ${icon('arrow')}</a>${S.lastOrder ? `<a class="btn btn-ghost btn-lg" href="#/success">View your last order</a>` : ''}</div></div>
    </div></section>`;
  }
  cleanGifts();
  const t = totals();
  return `${ckHeader()}
  <div class="co-ck">
    <div class="co-ck-main">
      <div class="co-ck-top"><h1>Checkout</h1><span>${plural(t.count, 'item')} · ${fmt(t.total)}</span></div>
      <details class="co-os-m"><summary><span>${icon('cart')}Order summary <small>${plural(t.count, 'item')}</small></span><b>${fmt(t.total)}</b>${icon('chevDown')}</summary><div class="co-os co-os-in">${orderSummary({ mobile: true })}</div></details>
      ${stepCard(1, 'Delivery address', { summary: addrSummary(), body: addrBody() })}
      ${stepCard(2, 'Choose your free gift' + (t.allow > 1 ? 's' : ''), { summary: giftSummary(), todo: `Pick ${plural(t.allow, 'complimentary TBB Original')} — free with this order`, body: giftBody() })}
      ${stepCard(3, 'Payment', { todo: 'UPI, cards, net banking or cash on delivery', body: payBody() })}
      <p class="co-ck-help">Need help? Call <b>1800-120-4567</b> (9 am – 9 pm) · <a href="#/cart" class="link">Back to cart</a></p>
    </div>
    <aside class="co-ck-side" aria-label="Order summary"><div class="blk co-os">${orderSummary()}</div>
      <ul class="co-trust is-col"><li>${ic('lock')}<span><b>Secure payments</b>256-bit encryption</span></li><li>${icon('shield')}<span><b>100% authentic</b>Sourced from brands</span></li><li>${icon('ret')}<span><b>Easy returns</b>7-day returns</span></li></ul>
    </aside>
  </div>
  ${ckBar(t)}`;
}

/* =========================================================
   SUCCESS  (#/success)
   ========================================================= */
function c2Ad() {
  const cr = TBB.ads.list('C2')[0];
  if (!cr) return '';
  const house = cr.house === true || cr.brand === 'tbb';
  const th = cr.theme || { bg: 'linear-gradient(120deg,#22103b,#33195a)', fg: '#ffffff', accent: '#ffc94d' };
  const prods = (cr.products || (cr.product ? [cr.product] : [])).map(product).filter(Boolean).slice(0, 3);
  const inner = `<a class="co-c2" href="${esc(cr.href || '#/brand/' + cr.brand)}" style="--bg:${esc(th.bg)};--fg:${esc(th.fg || '#fff')};--ac:${esc(th.accent || '#ffc94d')}">
      <span class="co-c2-top">${U.adBadge(house ? 'The Big Brands' : 'Ad')}<span class="co-c2-logo">${U.brandLogo(cr.brand, { size: 20, color: th.fg || '#fff' })}</span></span>
      ${cr.kicker ? `<span class="co-c2-k">${esc(cr.kicker)}</span>` : ''}
      <b class="co-c2-h">${esc(cr.headline)}</b>
      ${cr.sub ? `<span class="co-c2-s">${esc(cr.sub)}</span>` : ''}
      <span class="co-c2-arts${prods.length ? '' : ' is-logo'}" aria-hidden="true">${prods.length ? prods.map(p => `<span class="co-c2-art">${art(p)}</span>`).join('') : U.brandLogo(cr.brand, { size: 44, color: th.fg || '#fff' })}</span>
      <span class="co-c2-cta">${esc(cr.cta || 'Shop now')} ${icon('arrow')}</span>
    </a>`;
  return `<div class="co-c2-wrap">${U.slot('C2', inner, { cls: 'co-c2-slot' })}<button type="button" class="co-why" data-action="co-whyad">${icon('info')}${house ? 'From The Big Brands' : 'Sponsored'} · Why am I seeing this?</button></div>`;
}

function x1Row(o) {
  if (S.slotOn.X1 === false) return '';
  // o.sample is set at checkout (null = the customer removed the sample); older orders fall back to a pick
  let smp = null;
  if ('sample' in o) { if (!o.sample) return ''; const s = SAMPLES.find(([id]) => id === o.sample); smp = s && product(s[0]) ? { p: product(s[0]), name: s[1] } : null; }
  else smp = samplePick((o.items || []).map(l => l.id));
  if (!smp) return '';
  const p = smp.p;
  return U.slot('X1', `<span class="co-bx-art" style="--tint:${p.c1}">${art(p)}</span>
      <span class="co-bx-n"><b>${esc(smp.name)} — 10 ml trial</b><small>Partner sample from ${esc(brand(p.brand).name)} · packed free in your box</small></span>
      <span class="co-bx-p">${U.adBadge('Sponsored')}<span class="co-bx-free">₹0</span></span>`, { tag: 'li', cls: 'co-bx is-x1' });
}

function successView() {
  const o = S.lastOrder;
  if (!o) {
    return `<section class="wrap co-page co-none"><div class="blk co-empty-hero is-mini">
      ${emptyArt()}
      <div class="co-empty-t"><h1>No recent order to show</h1><p>Once you place an order, its confirmation — and the free gifts you picked — will appear here.</p>
      <div class="co-empty-btns"><a class="btn btn-cart btn-lg" href="#/">Back to home ${icon('arrow')}</a><a class="btn btn-ghost btn-lg" href="#/cart">Go to cart</a></div></div>
    </div></section>`;
  }
  const items = (o.items || []).map(l => ({ ...l, p: product(l.id) })).filter(l => l.p);
  const gifts = (o.gifts || []).map(giftById).filter(Boolean);
  const mrp = items.reduce((a, l) => a + l.p.mrp * l.qty, 0);
  const gw = gifts.reduce((a, g) => a + g.worth, 0);
  const saved = Math.max(0, mrp - (o.subtotal || 0)) + gw;
  const count = items.reduce((a, l) => a + l.qty, 0);
  const a = S.address;
  const cod = o.pay === 'cod';
  const confetti = Array.from({ length: 14 }, (_, i) => `<i style="--a:${i * (360 / 14)}deg;--d:${58 + (i % 3) * 14}px;--c:${['#ff3d6e', '#ffc94d', '#0f9f6e', '#5b35e0', '#ff7a45'][i % 5]}"></i>`).join('');
  const picked = new Set(gifts.map(g => g.id));
  const love = [...gifts, ...TBB.gift.active().filter(g => !picked.has(g.id))].slice(0, 4);
  return `<section class="wrap co-page co-ok">
    <div class="blk co-ok-hero">
      <div class="co-ok-main">
        <div class="co-ok-check" aria-hidden="true"><span class="co-confetti">${confetti}</span><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29"/><path d="M19 33.5l8.5 8.5L45.5 23"/></svg></div>
        <div class="co-ok-t">
          <p class="co-ok-k">Order placed · Thank you!</p>
          <h1>Your order is confirmed, ${esc(firstName())}.</h1>
          <p>Order <b>#${esc(o.id)}</b> — we’ve sent the details to ${a.email ? `<b>${esc(a.email)}</b> and ` : ''}SMS on <b>+91 ${esc(a.phone)}</b>.</p>
        </div>
      </div>
      <dl class="co-ok-facts">
        <div><dt>${icon('truck')}Arriving</dt><dd>${esc(o.eta)}<small>FREE delivery · by 9 pm</small></dd></div>
        <div><dt>${ic(cod ? 'cash' : 'card')}Payment</dt><dd>${esc(payLabel(o.pay))}<small>${cod ? `Pay ${fmt(o.total)} on delivery` : `${fmt(o.total)} paid`}</small></dd></div>
        <div><dt>${icon('pin')}Delivering to</dt><dd>${esc(o.name)}<small>${esc(o.city)}${a.pin ? ' ' + esc(a.pin) : ''}</small></dd></div>
        <div><dt>${icon('gift')}Free gifts</dt><dd>${gifts.length ? plural(gifts.length, 'gift') : 'None'}<small>${gw ? `worth ${fmt(gw)}` : 'TBB Originals'}</small></dd></div>
      </dl>
      <ol class="co-tl" aria-label="Order progress">
        <li class="is-on"><i>${icon('check')}</i><b>Order placed</b><small>Today</small></li>
        <li><i>${icon('box')}</i><b>Packed with your gifts</b><small>${H.deliveryDate(1)}</small></li>
        <li><i>${icon('truck')}</i><b>Shipped</b><small>${H.deliveryDate(2)}</small></li>
        <li><i>${icon('home')}</i><b>Delivered</b><small>${esc(o.eta)}</small></li>
      </ol>
    </div>

    <div class="co-ok-grid">
      <section class="blk co-box" aria-labelledby="co-box-h">
        <div class="co-sec-h"><div><h2 id="co-box-h">What’s in your box</h2><p>${plural(count, 'item')} + ${plural(gifts.length, 'free gift')}, packed together</p></div><button type="button" class="btn btn-ghost btn-sm" data-action="co-track">${icon('truck')} Track order</button></div>
        <ul class="co-bx-list">
          ${items.map(l => `<li class="co-bx">
            <span class="co-bx-art" style="--tint:${l.p.c1}">${art(l.p)}</span>
            <span class="co-bx-n"><b>${esc(l.p.name)}</b><small>${esc(brand(l.p.brand).name)} · ${esc(l.p.size)} · Qty ${l.qty}</small></span>
            <span class="co-bx-p">${fmt(l.p.price * l.qty)}</span>
          </li>`).join('')}
          ${gifts.map(g => `<li class="co-bx is-gift">
            <span class="co-bx-art" style="--tint:${g.c1}">${art(g)}</span>
            <span class="co-bx-n"><b>${esc(g.name)}</b><small>TBB Originals · ${esc(g.mini)} · your free gift</small></span>
            <span class="co-bx-p"><span class="co-freeb">FREE</span><s>${fmt(g.worth)}</s></span>
          </li>`).join('')}
          ${x1Row(o)}
        </ul>
        <div class="co-bx-tot"><span>${cod ? 'To pay on delivery' : 'Paid'} <b>${fmt(o.total)}</b></span>${saved ? `<span class="co-bx-save">${icon('sparkle')}You saved ${fmt(saved)}</span>` : ''}</div>
      </section>
      <aside class="co-ok-side">
        ${c2Ad()}
        <a class="co-admin" href="#/admin/orders">${icon('sliders')}<span><b>See this order in the Admin panel</b><small>#${esc(o.id)} is at the top with its free gifts — gift stock is deducted automatically.</small></span>${icon('arrow')}</a>
      </aside>
    </div>

    <section class="blk co-love" aria-labelledby="co-love-h">
      <div class="co-love-intro">
        <span class="co-house">${icon('sparkle')}The Big Brands · TBB Originals</span>
        <h2 id="co-love-h">Loved your free gift? Get the full size at 20% off</h2>
        <p>Your minis are on the way. When you’re ready for more, use the code below on any TBB Originals full size — valid till 21 Dec.</p>
        <button type="button" class="co-code" data-action="co-copy" data-code="LOVEDIT" aria-label="Copy code LOVEDIT"><b>LOVEDIT</b><span>${icon('scissors')}Copy code</span></button>
      </div>
      <div class="co-love-grid">${love.map(g => `<div class="co-love-it${picked.has(g.id) ? ' is-picked' : ''}"><span class="co-love-tag"><span>${picked.has(g.id) ? `${icon('gift')}In your box` : 'Try next'}</span><span><b>${fmt(Math.round(g.price * 0.8))}</b> with LOVEDIT</span></span>${U.productCard(g, { compact: true })}</div>`).join('')}</div>
    </section>
    <p class="co-ok-more"><a class="btn btn-dark btn-lg" href="#/">Continue shopping ${icon('arrow')}</a></p>
  </section>`;
}

/* =========================================================
   page registration
   ========================================================= */
function applyFocus(root) {
  if (pendingFocus) { const el = root.querySelector(pendingFocus); if (el) el.focus({ preventScroll: true }); pendingFocus = null; }
}

TBB.page('cart', {
  title: 'Your cart',
  render: cartView,
  mount(root) {
    applyFocus(root);
    const cta = root.querySelector('.co-sum-cta'), bar = root.querySelector('#co-cbar');
    if (cta && bar && 'IntersectionObserver' in window) {
      barIO = new IntersectionObserver(([e]) => bar.classList.toggle('is-show', !e.isIntersecting));
      barIO.observe(cta);
    }
  },
  unmount() { if (barIO) { barIO.disconnect(); barIO = null; } },
});

TBB.page('checkout', {
  chrome: false,
  title: 'Secure checkout',
  render: checkoutView,
  mount(root) {
    justPicked = null;
    applyFocus(root);
    if (pendingScroll) {
      const card = root.querySelector('#co-s' + pendingScroll), h = root.querySelector(`#co-s${pendingScroll}-h`);
      if (card) window.scrollTo({ top: Math.max(0, card.getBoundingClientRect().top + window.scrollY - 16), behavior: reduced() ? 'auto' : 'smooth' });
      if (h && !pendingFocus) h.focus({ preventScroll: true });
      pendingScroll = 0;
    }
  },
  unmount() {
    clearTimeout(placeT); clearInterval(shuffleT);
    placing = false; shuffleT = 0;
    // leaving the route (not just a re-render) → next visit starts at step 1
    if (!/^#\/checkout(\?|$)/.test(location.hash)) { step = 1; giftErr = false; pendingScroll = 0; }
  },
});

TBB.page('success', {
  title: 'Order confirmed',
  render: successView,
});

/* =========================================================
   actions & listeners (registered once; delegated globally by core)
   ========================================================= */
function gained(before) {
  const after = TBB.gift.allowance();
  if (after > before) { meterPulse = true; TBB.toast(`You’ve unlocked ${plural(after, 'free gift')}! Pick them at checkout`, { icon: 'gift' }); return true; }
  if (after < before && after > 0) TBB.toast(`Your cart now qualifies for ${plural(after, 'free gift')}`, { icon: 'gift' });
  return false;
}
function removeLine(id) {
  const idx = S.cart.findIndex(x => x.id === id); if (idx < 0) return;
  const p = product(id), before = TBB.gift.allowance();
  lastRemoved = { line: { ...S.cart[idx] }, idx };
  TBB.cart.remove(id);
  TBB.render();
  if (TBB.gift.allowance() >= before || !S.cart.length) TBB.toast(`Removed ${esc(p ? p.name : 'item')} <button type="button" class="co-undo" data-action="co-undo">Undo</button>`, { icon: 'trash' });
  else TBB.toast(`Removed — you now get ${plural(TBB.gift.allowance(), 'free gift')} <button type="button" class="co-undo" data-action="co-undo">Undo</button>`, { icon: 'trash' });
}

TBB.action('co-qty', el => {
  const id = el.dataset.id, d = Number(el.dataset.d) || 0, l = S.cart.find(x => x.id === id);
  if (!l) return;
  if (l.qty + d <= 0) return removeLine(id);
  const before = TBB.gift.allowance();
  TBB.cart.set(id, l.qty + d);
  gained(before);
  pendingFocus = `[data-action="co-qty"][data-id="${id}"][data-d="${d}"]`;
  TBB.render();
});
TBB.action('co-del', el => removeLine(el.dataset.id));
TBB.action('co-undo', () => {
  const t = $('#toast'); if (t) t.classList.remove('show');
  if (!lastRemoved) return;
  const { line, idx } = lastRemoved; lastRemoved = null;
  if (!S.cart.some(x => x.id === line.id)) { S.cart.splice(Math.min(idx, S.cart.length), 0, line); TBB.save('cart'); }
  TBB.render();
});
TBB.action('co-later', el => {
  const id = el.dataset.id;
  S.later = [id, ...S.later.filter(x => x !== id)]; TBB.save('later');
  TBB.cart.remove(id);
  TBB.render();
  TBB.toast('Saved for later — find it below your cart', { icon: 'heart' });
});
TBB.action('co-move', el => {
  const id = el.dataset.id, before = TBB.gift.allowance();
  S.later = S.later.filter(x => x !== id); TBB.save('later');
  TBB.cart.add(id, 1, { silent: true });
  if (!gained(before)) TBB.toast('Moved to your cart', { icon: 'cart' });
  TBB.render();
});
TBB.action('co-later-del', el => {
  S.later = S.later.filter(x => x !== el.dataset.id); TBB.save('later');
  TBB.render();
});
TBB.action('co-add', (el, e) => {
  e.preventDefault();
  const id = el.dataset.id, p = product(id), before = TBB.gift.allowance();
  TBB.cart.add(id, 1, { silent: true });
  if (!gained(before)) TBB.toast(`Added ${esc(p ? p.name : 'item')} to your cart`, { icon: 'cart' });
  TBB.render();
});

/* checkout steps */
function goStep(n) { step = n; pendingScroll = n; TBB.render(); }
TBB.action('co-goto', el => goStep(Number(el.dataset.step) || 1));

function setErr(form, k, msg) {
  const inp = form.querySelector(`[name="${k}"]`); if (!inp) return;
  const f = inp.closest('.co-f'), s = f && f.querySelector('.co-err');
  if (f) f.classList.toggle('is-err', !!msg);
  inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (s) s.innerHTML = msg ? icon('info') + esc(msg) : '';
}
TBB.on('submit', '#co-addr-form', (form, e) => {
  e.preventDefault();
  const v = {};
  ['name', 'phone', 'line', 'pin', 'city', 'state', 'email'].forEach(k => { const el = form.querySelector(`[name="${k}"]`); v[k] = el ? String(el.value).trim().replace(/\s+/g, ' ') : ''; });
  const ph = v.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  const err = {};
  if (v.name.length < 3) err.name = 'Enter the receiver’s full name';
  if (!/^[6-9]\d{9}$/.test(ph)) err.phone = 'Enter a valid 10-digit mobile number';
  if (v.line.length < 5) err.line = 'Add the house number and street';
  if (!/^[1-9]\d{5}$/.test(v.pin)) err.pin = 'Enter a valid 6-digit pincode';
  if (v.city.length < 2) err.city = 'Enter your town or city';
  if (!v.state) err.state = 'Select your state';
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) err.email = 'Enter a valid email, or leave it blank';
  ['name', 'phone', 'line', 'pin', 'city', 'state', 'email'].forEach(k => setErr(form, k, err[k]));
  const bad = Object.keys(err);
  if (bad.length) {
    const el = form.querySelector(`[name="${bad[0]}"]`);
    if (el) { el.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); el.focus({ preventScroll: true }); }
    return;
  }
  S.address = { ...S.address, name: v.name, phone: ph.replace(/(\d{5})(\d{5})/, '$1 $2'), line: v.line, pin: v.pin, city: v.city, state: v.state, email: v.email };
  TBB.save('address');
  goStep(2);
});
TBB.on('input', '#co-addr-form input', el => {
  const form = el.form, f = el.closest('.co-f');
  if (form && f && f.classList.contains('is-err')) setErr(form, el.name, '');
  if (el.name === 'pin') { const t = $('.co-eta-pin'); if (t && /^\d{6}$/.test(el.value.trim())) t.textContent = el.value.trim(); }
});
TBB.on('change', '#co-addr-form select', el => { if (el.form) setErr(el.form, el.name, ''); });

/* gifts */
function shakeTray() {
  const tr = $('#co-tray'); if (!tr || reduced()) return;
  tr.classList.remove('is-shake'); void tr.offsetWidth; tr.classList.add('is-shake');
}
TBB.action('co-gift', el => {
  if (shuffleT) return;
  const id = el.dataset.id, allow = TBB.gift.allowance(), g = giftById(id);
  if (!g || !allow) return;
  let sel = S.gifts.slice();
  if (sel.includes(id)) { sel = sel.filter(x => x !== id); justPicked = null; }
  else if (allow === 1) {
    if (sel.length) TBB.toast(`Swapped to ${esc(g.name)}`, { icon: 'gift' });
    sel = [id]; justPicked = id;
  } else if (sel.length < allow) { sel.push(id); justPicked = id; }
  else {
    shakeTray();
    TBB.toast(`Your box is full — tap ✕ on a gift above to swap in ${esc(g.line)}`, { icon: 'gift' });
    return;
  }
  S.gifts = sel; TBB.save('gifts');
  if (sel.length) giftErr = false;
  pendingFocus = el.classList.contains('co-slot') ? null : `.co-gift[data-id="${id}"]`;
  TBB.render();
});
TBB.action('co-surprise', () => {
  if (shuffleT) return;
  const allow = TBB.gift.allowance();
  const pool = TBB.gift.active().filter(inStock);
  if (!allow || !pool.length) return;
  const pickN = () => {
    const fresh = pool.filter(g => !S.gifts.includes(g.id));
    const src = fresh.length >= allow ? fresh : pool;
    return src.map(g => [Math.random(), g.id]).sort((a, b) => a[0] - b[0]).slice(0, allow).map(x => x[1]);
  };
  const finish = () => {
    clearInterval(shuffleT); shuffleT = 0;
    const pick = pickN();
    S.gifts = pick; TBB.save('gifts'); giftErr = false; justPicked = pick[pick.length - 1];
    TBB.render();
    const names = pick.map(id => giftById(id).line).join(' + ');
    TBB.toast(`Surprise! ${esc(names)} — on the house`, { icon: 'sparkle' });
  };
  if (reduced()) return finish();
  const cards = $$('#co-ggrid .co-gift:not([disabled])');
  let i = 0;
  shuffleT = setInterval(() => {
    cards.forEach(c => c.classList.remove('is-spin'));
    const c = cards[Math.floor(Math.random() * cards.length)];
    if (c) c.classList.add('is-spin');
    if (++i > 9) finish();
  }, 85);
});
TBB.action('co-gifts-next', () => {
  if (!S.gifts.length) {
    giftErr = true;
    if (step !== 2) return goStep(2);
    TBB.render(); shakeTray();
    const tr = $('#co-tray'); if (tr) tr.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
    return;
  }
  goStep(3);
});

/* payment */
TBB.on('change', 'input[name="co-pay"]', el => {
  S.pay = el.value;
  pendingFocus = `input[name="co-pay"][value="${el.value}"]`;
  TBB.render();
});
TBB.action('co-upi-app', el => {
  upiApp = el.dataset.app;
  $$('.co-app').forEach(b => { const on = b === el; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
});
TBB.action('co-bank', el => {
  bank = el.dataset.bank;
  $$('.co-bank').forEach(b => { const on = b === el; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
});
TBB.action('co-place', () => {
  if (placing) return;
  if (!TBB.cart.lines().length) return TBB.go('#/cart');
  cleanGifts();
  if (!S.gifts.length) { giftErr = true; TBB.toast('Pick your free gift first', { icon: 'gift' }); return goStep(2); }
  placing = true;
  $$('[data-action="co-place"]').forEach(b => { b.disabled = true; b.innerHTML = '<span class="co-spin" aria-hidden="true"></span>Placing order…'; });
  const smp = sampleActive();
  placeT = setTimeout(() => {
    placing = false;
    const o = TBB.placeOrder({ pay: S.pay });
    if (o) {
      o.sample = smp ? smp.p.id : null;             // o === S.lastOrder → persist the X1 choice with the order
      TBB.save('lastOrder');
      TBB.go('#/success');
    }
  }, reduced() ? 120 : 900);
});
TBB.action('co-x1', () => {
  sampleOn = !sampleOn;
  pendingFocus = '[data-action="co-x1"]';
  TBB.render();
  TBB.toast(sampleOn ? 'Free trial sample added to your box' : 'Sample removed — your free gifts are unchanged', { icon: sampleOn ? 'gift' : 'check' });
});
TBB.action('co-whyc1', () => TBB.toast('Brands pay to feature these add-ons. We only show items under ₹299 that fit in your box.', { icon: 'info' }));

/* success */
TBB.action('co-copy', el => {
  const code = el.dataset.code || 'LOVEDIT';
  try { if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {}); } catch (e) { /* clipboard unavailable */ }
  el.classList.add('is-copied');
  TBB.toast(`Code <b>${esc(code)}</b> copied — 20% off any TBB Originals full size`, { icon: 'tag' });
});
TBB.action('co-whyad', () => TBB.toast('Ads here are matched to what you shopped — never to your payment details. Brands pay per 1,000 views.', { icon: 'info' }));
TBB.action('co-track', () => TBB.toast('Live tracking with SMS & WhatsApp updates — included in the full build', { icon: 'truck' }));
})();
