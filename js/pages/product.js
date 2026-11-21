/* The Big Brands — marketplace demo · product detail page  (#/p/<id>)
   Files: js/pages/product.js + css/pages/product.css · class / action prefix "pd-"
   Ad inventory on this page:
     P1  Related Sponsored Products  — rail of 8 sponsored cards (CPC)
     P2  Buy-box Brand Ad            — 300×250-style banner under the buy box (CPM)
   The free TBB gift (house promotion) runs through the info column, buy box and "in the box" view. */
(() => {
'use strict';
const D = TBB.data, S = TBB.S, H = TBB.h, UI = TBB.ui;
const { esc, fmt, icon, stars, art } = H;

const ZOOM = 2.4;
const VIEWS = ['Front', 'Close-up', 'Angle', 'Texture', 'Ingredients', 'In the box'];

/* ---------------- page state (reset when the product changes) ---------------- */
const st = { id: null, view: 0, qty: 1, pinOpen: false, pinCode: '', pinMsg: '', pinOk: true, helped: {}, mention: null, fbt: [true, true, true] };
function reset(id) { Object.assign(st, { id, view: 0, qty: 1, pinOpen: false, pinCode: '', pinMsg: '', pinOk: true, helped: {}, mention: null, fbt: [true, true, true] }); }
let timer = null, offs = [];

/* ---------------- small helpers ---------------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uniq = arr => arr.filter((x, i) => x && arr.indexOf(x) === i);
function sat(hex) { const h = String(hex).replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16) || 0; const r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; }
/* backdrop tint for packshots: the pack colour, or the label colour for white packs, or a soft lavender for black/white packs */
const tintOf = p => (H.lum(p.c1) <= 0.86 && sat(p.c1) > 0.12 ? p.c1 : sat(p.c2) > 0.25 ? p.c2 : sat(p.c1) > 0.12 ? p.c1 : '#a99bd6');
const catName = p => (H.cat(p.cat) || {}).name || 'Beauty';
const bName = p => (p.own ? 'TBB Originals' : H.brand(p.brand).name);
const concernNames = p => (p.concerns || []).map(id => (D.CONCERNS.find(c => c.id === id) || {}).name).filter(Boolean);
const money2 = n => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function sizeQty(p) { const m = String(p.size).match(/([\d.]+)\s*(ml|g)\b/i); return m ? { q: parseFloat(m[1]), u: m[2].toLowerCase() } : null; }
function unitPrice(p) { const s = sizeQty(p); if (!s || !s.q) return ''; return s.q >= 20 ? `${money2(p.price / s.q * 100)}/100 ${s.u}` : `${money2(p.price / s.q)}/${s.u}`; }
function tomorrow() { const t = new Date(); t.setDate(t.getDate() + 1); return t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
function cutoff() {
  const now = new Date(), end = new Date(now); end.setHours(23, 59, 59, 999);
  const m = Math.max(1, Math.round((end - now) / 60000)), h = Math.floor(m / 60), mm = m % 60;
  return (h ? `${h} hr${h > 1 ? 's' : ''} ` : '') + `${mm} min${mm !== 1 ? 's' : ''}`;
}
function itemForm(p) {
  const n = p.name.toLowerCase();
  if (p.cat === 'fragrance') return 'Spray';
  if (/kajal/.test(n)) return 'Pencil';
  if (/lipstick|lip balm/.test(n)) return 'Stick';
  if (/oil/.test(n)) return 'Oil';
  if (/gel/.test(n)) return 'Gel';
  if (/serum cream/.test(n)) return 'Cream';
  if (/serum/.test(n) || p.shape === 'dropper') return 'Serum';
  if (/foaming/.test(n)) return 'Foam';
  if (/lotion/.test(n)) return 'Lotion';
  if (/conditioner|cream|sunscreen/.test(n) || p.shape === 'jar') return 'Cream';
  return 'Liquid';
}
function suits(p) {
  const c = p.concerns || [];
  if (p.cat === 'hair' || p.cat === 'oil') return c.includes('dandruff') ? 'Dandruff-prone scalp' : c.includes('frizz') ? 'Dry, damaged hair' : 'All hair types';
  if (p.cat === 'fragrance') return /\bman\b|men/i.test(p.name) ? 'Men' : 'Unisex';
  if (p.cat === 'makeup') return 'All Indian skin tones';
  if (p.cat === 'men') return 'Men, all skin types';
  if (c.includes('acne')) return 'Oily, acne-prone skin';
  if (c.includes('dry')) return /sensitive/i.test(p.name) ? 'Sensitive, dry skin' : 'Dry to very dry skin';
  return 'All skin types';
}
function rankIn(p) { const list = D.PRODUCTS.filter(x => x.cat === p.cat && !x.own).sort((a, b) => b.reviews - a.reviews); return list.findIndex(x => x.id === p.id) + 1; }
function lasts(p) { const s = sizeQty(p); if (!s) return 'about 2 months'; return s.q <= 60 ? 'about 1 month' : s.q <= 150 ? 'about 2 months' : 'about 3 months'; }

/* ---------------- ingredients ---------------- */
const ING = [
  { k: /hyaluronic/i, n: 'Hyaluronic Acid', d: 'Deep hydration', c: '#4a90e2' },
  { k: /niacinamide|sensitive/i, n: 'Niacinamide', d: 'Strengthens barrier', c: '#8e7cc3' },
  { k: /vitamin c|vit c/i, n: 'Vitamin C', d: 'Brightens tone', c: '#f5a623' },
  { k: /salicylic/i, n: 'Salicylic Acid', d: 'Unclogs pores', c: '#00a69c' },
  { k: /neem/i, n: 'Neem', d: 'Fights pimples', c: '#3b8f2a' },
  { k: /tea tree/i, n: 'Tea Tree Oil', d: 'Controls dandruff', c: '#2e7d5b' },
  { k: /green tea/i, n: 'Green Tea', d: 'Controls oil', c: '#7cb342' },
  { k: /turmeric/i, n: 'Turmeric', d: 'Evens skin tone', c: '#e6a100' },
  { k: /onion/i, n: 'Red Onion Oil', d: 'Reduces hair fall', c: '#8e3b8f' },
  { k: /growth/i, n: 'Redensyl', d: 'Boosts new growth', c: '#c2185b' },
  { k: /coconut/i, n: 'Coconut Oil', d: 'Deep nourishment', c: '#b08d57' },
  { k: /bhringraj/i, n: 'Bhringraj', d: 'Strengthens roots', c: '#5d7a2a' },
  { k: /aloe/i, n: 'Aloe Vera', d: 'Soothes & cools', c: '#6fbf4a' },
  { k: /cocoa/i, n: 'Cocoa Butter', d: 'Intense moisture', c: '#8d5b3a' },
  { k: /jojoba/i, n: 'Jojoba Oil', d: 'Softens skin', c: '#c9a227' },
  { k: /micellar/i, n: 'Micellar Water', d: 'Lifts makeup', c: '#e91e63' },
  { k: /spf|sun/i, n: 'SPF 50 PA+++', d: 'UVA + UVB shield', c: '#ff8a00' },
  { k: /rice/i, n: 'Rice Water', d: 'Adds shine', c: '#b9a27a' },
  { k: /repair/i, n: 'Keratin + Ceramides', d: 'Repairs damage', c: '#b3122e' },
  { k: /beard/i, n: 'Argan + Almond Oil', d: 'Fuller-looking beard', c: '#8d6e63' },
  { k: /de-tan|dark spot/i, n: 'Licorice Extract', d: 'Reduces tan', c: '#795548' },
  { k: /kajal/i, n: 'Vitamin E + Almond Oil', d: 'Gentle on eyes', c: '#455a64' },
  { k: /lipstick|lip balm/i, n: 'Vitamin E', d: 'Keeps lips soft', c: '#c2185b' },
  { k: /oud/i, n: 'Oud + Amber', d: 'Warm, woody base', c: '#8a6d3b' },
  { k: /\bceo\b/i, n: 'Bergamot + Musk', d: 'Fresh, long-lasting', c: '#4a6fa5' },
  { k: /foundation/i, n: 'Glycerin + SPF 25', d: 'All-day wear', c: '#c48b62' },
];
const ING_DEF = {
  face: [['Glycerin', 'Locks in moisture', '#5aa9e6'], ['Panthenol', 'Calms skin', '#9c7bd1']],
  skin: [['Glycerin', 'Locks in moisture', '#5aa9e6'], ['Ceramides', 'Repairs barrier', '#d4a373']],
  hair: [['Pro-Vitamin B5', 'Smooths strands', '#9c7bd1'], ['Glycerin', 'Adds softness', '#5aa9e6']],
  oil: [['Vitamin E', 'Antioxidant care', '#e0a800'], ['Almond Oil', 'Softens hair', '#c48b62']],
  makeup: [['Vitamin E', 'Comfortable wear', '#e0a800'], ['Jojoba Oil', 'Non-drying', '#c9a227']],
  body: [['Glycerin', '48h moisture', '#5aa9e6'], ['Shea Butter', 'Softens skin', '#c9a227']],
  men: [['Activated Charcoal', 'Deep cleans', '#424242'], ['Glycerin', 'No dryness', '#5aa9e6']],
  fragrance: [['Pink Pepper', 'Spicy top note', '#c2185b'], ['Sandalwood', 'Creamy base', '#a1887f']],
};
function ingredients(p) {
  const out = ING.filter(i => i.k.test(p.name)).map(({ n, d, c }) => ({ n, d, c }));
  (ING_DEF[p.cat] || []).forEach(([n, d, c]) => out.push({ n, d, c }));
  return out.filter((x, i) => out.findIndex(y => y.n === x.n) === i).slice(0, 4);
}

/* ---------------- "About this item" — written per category ---------------- */
function about(p) {
  const b = bName(p), ing = ingredients(p).slice(0, 2).map(i => i.n).join(' and ');
  const cn = concernNames(p).map(s => s.toLowerCase()).join(' and ');
  const n = p.name.toLowerCase();
  const net = ['Net quantity: ' + p.size, p.own ? `Made in India by The Big Brands. Lasts ${lasts(p)} with regular use.` : `100% authentic, sourced directly from ${b} or its authorised distributor. Lasts ${lasts(p)} with regular use.`];
  const A = {
    face: [
      ['Gentle, effective cleansing', 'Lifts away dirt, excess oil, sunscreen and light makeup without stripping your skin’s natural moisture barrier.'],
      ['Powered by ' + ing, 'Leaves skin clean, soft and comfortable — never tight or squeaky after you rinse.'],
      ['Made for ' + suits(p).toLowerCase(), 'Dermatologically tested, soap-free and pH-balanced; gentle enough to use morning and night.'],
      ['How to use', 'Massage a coin-sized amount onto damp skin for 30 seconds, then rinse with lukewarm water. Follow with moisturiser and sunscreen.'],
      net,
    ],
    skin: [
      ['Targets ' + (cn || 'everyday skin concerns'), 'A lightweight formula that sinks in fast and layers well under sunscreen and makeup.'],
      ['Powered by ' + ing, 'Visible results in 2–4 weeks of consistent daily use.'],
      ['Non-greasy & non-comedogenic', 'Dermatologically tested and free from parabens and mineral oil — comfortable in Indian heat and humidity.'],
      ['How to use', p.shape === 'dropper' ? 'Apply 2–3 drops to clean, dry skin morning and night; follow with moisturiser. Use sunscreen during the day.' : /spf|sun/.test(n) ? 'Apply generously 15 minutes before stepping out. Reapply every 2–3 hours when outdoors.' : 'Smooth a pea-sized amount over clean skin, morning and night.'],
      net,
    ],
    hair: [
      ['Cleanses & cares', 'Gently cleanses the scalp while helping with ' + (cn || 'everyday hair care') + ', wash after wash.'],
      ['Enriched with ' + ing, 'Strengthens strands from root to tip and visibly reduces breakage.'],
      ['Safe for regular use', 'Suitable for all hair types, including colour-treated hair. Paraben-free.'],
      ['How to use', /conditioner/.test(n) ? 'After shampooing, apply to lengths and ends, leave on for 2 minutes and rinse well.' : 'Apply to wet hair, massage into a rich lather and rinse thoroughly. Follow with conditioner.'],
      net,
    ],
    oil: [
      ['Root-to-tip nourishment', 'Nourishes the scalp and strengthens roots to help reduce hair fall and breakage.'],
      ['Enriched with ' + ing, 'Lightweight and non-sticky — absorbs easily without weighing hair down.'],
      ['The weekly champi ritual', 'Warm slightly and massage into the scalp 2–3 times a week; leave on for at least an hour or overnight.'],
      ['Clean formula', /pure/.test(n) ? '100% pure, edible-grade oil with no added chemicals or fragrance.' : 'Free from mineral oil and silicones; suitable for all hair types.'],
      net,
    ],
    makeup: [
      ['Long-wearing', 'Rich, transfer-resistant colour that lasts up to 16 hours through work, heat and humidity.'],
      ['Enriched with ' + ing, 'Lightweight, comfortable wear — never cakey or dry.'],
      ['Made for Indian skin tones', 'Shades developed for warm, wheatish and dusky undertones.'],
      ['How to apply', /kajal/.test(n) ? 'Glide along the waterline and lash line; let it set for 30 seconds.' : /lipstick/.test(n) ? 'Swipe the primer end first, then glide the colour from the centre of the lips outwards.' : 'Dot over the face and blend outwards with a damp sponge or brush.'],
      net,
    ],
    body: [
      ['48-hour moisture', 'Deeply moisturises dry skin and keeps it soft all day, even through North Indian winters.'],
      ['Enriched with ' + ing, 'Absorbs quickly with a light, non-greasy finish — dress right after.'],
      ['For the whole family', 'Dermatologically tested and gentle enough for daily use.'],
      ['How to use', /wash/.test(n) ? 'Squeeze onto a loofah or palm, work into a creamy lather and rinse.' : 'Massage onto clean skin after a bath, focusing on dry areas like elbows and knees.'],
      net,
    ],
    men: [
      ['Built for men', 'Targets ' + (cn || 'everyday grooming') + ' with a formula made for Indian weather.'],
      ['Enriched with ' + ing, 'Non-sticky, fast-absorbing and fragrance-light.'],
      ['Visible difference', 'Results in 3–4 weeks of consistent daily use.'],
      ['How to use', /oil/.test(n) ? 'Massage 4–5 drops into the beard and the skin underneath every night.' : 'Massage onto a damp face for 30 seconds and rinse; use twice daily.'],
      net,
    ],
    fragrance: [
      ['Long-lasting eau de parfum', '20% perfume-oil concentration that lasts 7–9 hours on skin.'],
      ['Notes of ' + ing, 'Opens bright and fresh, then settles into a warm, woody trail.'],
      ['Skin-safe & IFRA compliant', 'Cruelty-free formula with no harsh alcohol sting.'],
      ['How to wear', 'Spray on pulse points — wrists, neck and behind the ears. Don’t rub.'],
      ['Net quantity: ' + p.size, 'Arrives in a gift-ready box. 100% authentic, sourced directly from the brand.'],
    ],
  };
  return A[p.cat] || A.skin;
}

/* ---------------- reviews (fictional customers) ---------------- */
const REV = {
  face: {
    say: 'Customers say it cleans thoroughly without leaving skin tight or dry, and suits sensitive and oily skin alike. Many appreciate the gentle, fragrance-free formula and the value for money; a few wish it lathered more.',
    mentions: [['Gentle on skin', 'gentle', 2140], ['No dryness', 'dry', 1310], ['Value for money', 'value', 980], ['Removes makeup', 'makeup', 640], ['Fragrance-free', 'fragrance', 512], ['Fresh feel', 'fresh', 430]],
    reviews: [
      { n: 'Priya Nair', c: 'Bengaluru', r: 5, t: 'Gentle, no tightness at all', b: 'I have sensitive skin that reacts to almost everything. This is so gentle — no stinging, no redness and no dryness, even in winter. It removes light makeup and sunscreen too.', d: '14 November 2026', h: 412 },
      { n: 'Rahul Verma', c: 'Jaipur', r: 4, t: 'Good for my oily T-zone', b: 'Skin feels clean and fresh, not stripped. The lather is low, which took some getting used to, but a small amount lasts long — great value for money.', d: '2 November 2026', h: 188 },
      { n: 'Sneha Kulkarni', c: 'Pune', r: 5, t: 'Third bottle, never switching', b: 'My dermatologist recommended it after my acne treatment. Fragrance-free, gentle and the pack is hygienic. Delivered in two days and I picked the Vitamin C mini as my free gift!', d: '27 October 2026', h: 96 },
    ],
  },
  skin: {
    say: 'Customers say it absorbs quickly, layers well under makeup and shows visible results within a few weeks. Many mention it is non-greasy in Indian weather; a few wanted a bigger pack for the price.',
    mentions: [['Absorbs quickly', 'absorb', 1820], ['Visible results', 'results', 1460], ['Non-greasy', 'greasy', 1210], ['Glow', 'glow', 990], ['Value for money', 'value', 720], ['Under makeup', 'makeup', 410]],
    reviews: [
      { n: 'Ananya Reddy', c: 'Hyderabad', r: 5, t: 'Visible results in three weeks', b: 'Used it every night for three weeks and my marks have visibly faded — real results. It absorbs in seconds, isn’t greasy at all, and my skin has a soft glow in the mornings.', d: '16 November 2026', h: 356 },
      { n: 'Kavya Menon', c: 'Kochi', r: 4, t: 'Lightweight, great for humid weather', b: 'Kochi humidity makes most creams feel heavy, but this one is non-greasy and sits well under makeup. Slightly pricey for the quantity, but worth it.', d: '5 November 2026', h: 142 },
      { n: 'Ishita Bose', c: 'Kolkata', r: 5, t: 'My skin has never looked this even', b: 'Bought it on a friend’s suggestion. No breakouts, and the glow is real. Great value with the bank offer — and I picked the SPF mini as my free gift.', d: '29 October 2026', h: 87 },
    ],
  },
  hair: {
    say: 'Customers say it leaves hair soft, smooth and noticeably less frizzy after a few washes. Many like the fragrance and rich lather; a few with very oily scalps prefer it on alternate days.',
    mentions: [['Soft & smooth', 'soft', 1640], ['Less frizz', 'frizz', 1320], ['Rich lather', 'lather', 870], ['Fragrance', 'fragrance', 760], ['Less breakage', 'breakage', 540], ['Value for money', 'value', 480]],
    reviews: [
      { n: 'Meera Joshi', c: 'Indore', r: 5, t: 'Soft after the very first wash', b: 'My hair is chemically straightened and very dry. After one wash it felt soft and tangle-free, and the frizz is much better after two weeks. Lovely fragrance too.', d: '15 November 2026', h: 298 },
      { n: 'Aditi Sharma', c: 'Delhi', r: 4, t: 'A little goes a long way', b: 'Rich lather with just a coin-sized amount, so the bottle lasts. Breakage has reduced noticeably. Delhi water is hard, so I always follow with conditioner.', d: '6 November 2026', h: 131 },
      { n: 'Farah Siddiqui', c: 'Lucknow', r: 5, t: 'Great value for money', b: 'Cheaper than my local store, great value, and it came with a free TBB Rice Water mini. Hair is soft and shiny — will reorder.', d: '30 October 2026', h: 74 },
    ],
  },
  oil: {
    say: 'Customers say hair fall reduced within 4–6 weeks of regular champi and the oil feels light, not sticky. Many like the mild smell; a few say it needs a thorough wash to rinse out.',
    mentions: [['Less hair fall', 'hair fall', 1980], ['Not sticky', 'sticky', 1240], ['New growth', 'growth', 860], ['Mild smell', 'smell', 640], ['Easy to wash off', 'wash', 520], ['Value for money', 'value', 470]],
    reviews: [
      { n: 'Pooja Patel', c: 'Ahmedabad', r: 5, t: 'Hair fall reduced in a month', b: 'I was losing a lot of hair after my pregnancy. After a month of twice-weekly champi, hair fall has reduced visibly and I can see baby hair growth near my temples.', d: '13 November 2026', h: 521 },
      { n: 'Divya Iyer', c: 'Chennai', r: 4, t: 'Light and not sticky', b: 'Not sticky like the oils my mother uses, and the smell is mild. Needs one good wash to rinse off. I use it overnight twice a week.', d: '4 November 2026', h: 167 },
      { n: 'Neha Gupta', c: 'Noida', r: 4, t: 'Good value with the free gift', b: 'Good value for money, and the free Red Onion mini let me compare two oils. Hair feels stronger and there is less hair fall while combing.', d: '28 October 2026', h: 63 },
    ],
  },
  makeup: {
    say: 'Customers say the colour payoff is rich and it lasts through a full workday without smudging. Many love how it suits Indian skin tones; a few find it slightly drying by evening.',
    mentions: [['Long-lasting', 'lasts', 1730], ['Smudge-proof', 'smudge', 1380], ['Rich colour', 'colour', 1020], ['Suits Indian skin tones', 'skin tone', 690], ['Value for money', 'value', 520], ['Slightly drying', 'drying', 260]],
    reviews: [
      { n: 'Riya Kapoor', c: 'Mumbai', r: 5, t: 'Lasts my whole office day', b: 'I apply it at 8 am before my local train and it lasts till I’m home at 7 pm — no smudge, even after lunch. Rich colour in one swipe.', d: '17 November 2026', h: 384 },
      { n: 'Tanvi Desai', c: 'Surat', r: 4, t: 'Perfect for wheatish skin', b: 'The shade suits my wheatish skin tone perfectly. Slightly drying by evening, so I prep with balm. Value for money at this price.', d: '7 November 2026', h: 152 },
      { n: 'Simran Kaur', c: 'Amritsar', r: 5, t: 'Smudge-proof as promised', b: 'Survived a full Punjabi wedding — dancing, heat and all — without a single smudge. Got the Cocoa lip balm mini free with my order too.', d: '31 October 2026', h: 91 },
    ],
  },
  body: {
    say: 'Customers say it keeps skin moisturised all day through winter without feeling greasy, and absorbs quickly. Many like the light fragrance; a few wanted a pump lock for travel.',
    mentions: [['All-day moisture', 'moisturised', 1690], ['Non-greasy', 'greasy', 1250], ['Absorbs quickly', 'absorbs', 930], ['Light fragrance', 'fragrance', 710], ['Winter care', 'winter', 600], ['Value for money', 'value', 420]],
    reviews: [
      { n: 'Lakshmi Rao', c: 'Mysuru', r: 5, t: 'Perfect winter body care', b: 'My skin gets very dry and flaky in winter. This keeps it moisturised all day and absorbs quickly, so I can dress right after. Not greasy at all.', d: '12 November 2026', h: 276 },
      { n: 'Nikita Agarwal', c: 'Kanpur', r: 4, t: 'Lovely light fragrance', b: 'The fragrance is light and doesn’t clash with my perfume. A little goes a long way. The pump doesn’t lock, so be careful when travelling.', d: '3 November 2026', h: 118 },
      { n: 'Shreya Das', c: 'Guwahati', r: 5, t: 'The whole family uses it', b: 'Great value for money for a family. Delivered in two days, and the free Aloe Calm gel mini is lovely after a day in the sun.', d: '26 October 2026', h: 58 },
    ],
  },
  men: {
    say: 'Customers say it makes a visible difference in 3–4 weeks and suits Indian weather. Many like the masculine fragrance and non-sticky feel; a few wanted a larger pack.',
    mentions: [['Visible difference', 'difference', 1420], ['Non-sticky', 'sticky', 1060], ['Masculine fragrance', 'fragrance', 880], ['Fuller beard', 'beard', 740], ['Reduces tan', 'tan', 610], ['Value for money', 'value', 430]],
    reviews: [
      { n: 'Arjun Singh', c: 'Chandigarh', r: 5, t: 'Visible difference in 4 weeks', b: 'I was sceptical, but after four weeks there’s a visible difference — the patches are filling in and my beard looks fuller. Non-sticky and the fragrance is subtle.', d: '18 November 2026', h: 343 },
      { n: 'Vikram Rathore', c: 'Jodhpur', r: 4, t: 'Works in harsh sun', b: 'The Jodhpur sun is brutal. Daily use has visibly reduced the tan on my face. Good masculine fragrance, nothing overpowering.', d: '8 November 2026', h: 129 },
      { n: 'Karan Malhotra', c: 'Gurugram', r: 4, t: 'Good value with the offers', b: 'Good value for money with the bank offer. It came with a free TBB face wash mini, which my wife claimed immediately.', d: '1 November 2026', h: 66 },
    ],
  },
  fragrance: {
    say: 'Customers say it lasts 7–9 hours on skin, gets compliments and feels far more premium than the price. Many like the gift-ready box; a few find the opening notes strong for daytime.',
    mentions: [['Long-lasting', 'lasts', 1880], ['Compliments', 'compliments', 1290], ['Premium feel', 'premium', 940], ['Gift-ready box', 'gift', 720], ['Value for money', 'value', 650], ['Strong opening', 'strong', 300]],
    reviews: [
      { n: 'Rohan Mehta', c: 'Mumbai', r: 5, t: 'Lasts all day, constant compliments', b: 'Two sprays in the morning and it lasts well past 8 hours. I get compliments at work every time I wear it. Feels very premium for the price.', d: '19 November 2026', h: 402 },
      { n: 'Aisha Khan', c: 'Bhopal', r: 4, t: 'Bought it as a gift — he loved it', b: 'Bought it as a gift for my husband. The box looks premium and gift-ready. The opening notes are strong, but it settles into a warm, woody scent.', d: '9 November 2026', h: 144 },
      { n: 'Siddharth Rao', c: 'Bengaluru', r: 5, t: 'Unbeatable value for money', b: 'Value for money that’s hard to beat — it smells like perfumes four times the price. Fast delivery, and a free TBB mini in the box as well.', d: '2 November 2026', h: 81 },
    ],
  },
};
const revFor = p => REV[p.cat] || REV.skin;
function histogram(r) {
  const k = r - 3.5;
  const p5 = Math.round(25 + k * 42), p4 = Math.round(32 - k * 13), p1 = Math.round(10 - k * 5), p2 = Math.round(7 - k * 4);
  return [p5, p4, Math.max(1, 100 - p5 - p4 - p2 - p1), p2, p1];
}

/* ---------------- recommendations ---------------- */
const FBT = {
  face: ['cet-moist', 'min-spf', 'nivea-cream', 'lakme-ss', 'min-niacin'],
  skin: ['cet-cl', 'min-spf', 'him-fw', 'nivea-cream', 'min-niacin'],
  hair: ['lo-cond', 'para-coco', 'mama-onion', 'dove-sh', 'lo-shampoo'],
  oil: ['mama-onion-sh', 'him-shamp', 'lo-cond', 'dove-sh'],
  makeup: ['gar-micellar', 'lakme-kajal', 'lakme-lip', 'lo-found'],
  body: ['dove-bw', 'nivea-lotion', 'nivea-cream', 'him-cocoa'],
  men: ['beardo-oil', 'beardo-fw', 'bella-ceo', 'nivea-men'],
  fragrance: ['bella-ceo', 'bella-oud', 'nivea-lotion', 'dove-bw'],
};
const RELATED = { face: ['skin'], skin: ['face'], hair: ['oil'], oil: ['hair'], makeup: ['face', 'skin'], body: ['skin'], men: ['face', 'fragrance'], fragrance: ['men', 'body'] };
const pool = p => D.PRODUCTS.filter(x => x.id !== p.id && !x.own);
function fbtFor(p) {
  const picks = (FBT[p.cat] || []).map(H.product).filter(x => x && x.id !== p.id);
  const extra = pool(p).filter(x => x.cat !== p.cat).sort((a, b) => b.reviews - a.reviews);
  return uniq([...picks, ...extra]).slice(0, 2);
}
function similarFor(p) {
  const near = list => list.sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price));
  const same = near(pool(p).filter(x => x.cat === p.cat));
  const rel = near(pool(p).filter(x => (RELATED[p.cat] || []).includes(x.cat)));
  return uniq([...same, ...rel, ...pool(p)]).slice(0, 3);
}
function sponsoredFor(p, exclude) {
  const liveBrands = S.campaigns.filter(c => c.slot === 'P1' && c.status === 'live').map(c => c.brand);
  const pc = p.concerns || [];
  const score = x => (liveBrands.includes(x.brand) ? 1000 : 0) + (x.cat === p.cat ? 120 : 0) + ((RELATED[p.cat] || []).includes(x.cat) ? 40 : 0)
    + ((x.concerns || []).some(c => pc.includes(c)) ? 60 : 0) + (x.brand !== p.brand ? 15 : 0) + x.rating;
  return pool(p).filter(x => !exclude.includes(x.id)).sort((a, b) => score(b) - score(a)).slice(0, 8);
}

/* ---------------- gallery views (all sizes in %, text in container units) ---------------- */
const LABEL_Y = { tube: 0.44, dropper: 0.63, jar: 0.74, pump: 0.62, stick: 0.72, bottle: 0.62 };
const artBox = (p, cls, style = '') => `<span class="pd-a ${cls}"${style ? ` style="${style}"` : ''}>${art(p)}</span>`;
function giftBoxSvg() {
  return `<svg viewBox="0 0 120 112" aria-hidden="true"><ellipse cx="60" cy="106" rx="50" ry="5" fill="rgba(0,0,0,.13)"/><rect x="12" y="46" width="96" height="58" rx="7" fill="#ff3d6e"/><rect x="12" y="46" width="96" height="10" fill="#000" opacity=".08"/><rect x="6" y="32" width="108" height="20" rx="6" fill="#ff5f86"/><rect x="53" y="32" width="14" height="72" fill="#ffc94d"/><path d="M60 33c-6-15-27-23-30-11-2 9 17 12 30 11z" fill="#ffb800"/><path d="M60 33c6-15 27-23 30-11 2 9-17 12-30 11z" fill="#ffb800"/><circle cx="60" cy="32" r="5" fill="#ffd56b"/><text x="32.5" y="84" text-anchor="middle" fill="#fff" style="font:800 13px 'Bricolage Grotesque',sans-serif;letter-spacing:-.04em">tbb</text><text x="87.5" y="84" text-anchor="middle" fill="#fff" opacity=".85" style="font:700 7px Geist,sans-serif;letter-spacing:.08em">GIFT</text></svg>`;
}
function textureSvg(p) {
  const f = itemForm(p), t = tintOf(p);
  const blob = fill => `<path d="M26 150C32 96 104 72 152 98c34 20 28 78-22 86-40 7-110 14-104-34z" fill="${fill}" stroke="rgba(0,0,0,.06)" stroke-width="1.5"/><path d="M56 130c18-24 60-30 84-12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".75"/><circle cx="160" cy="70" r="7" fill="${fill}" stroke="rgba(0,0,0,.06)"/><circle cx="172" cy="92" r="4" fill="${fill}" stroke="rgba(0,0,0,.06)"/><circle cx="157.5" cy="67.5" r="2" fill="#fff" opacity=".8"/>`;
  let inner;
  if (f === 'Stick' || f === 'Pencil') {
    const c = f === 'Pencil' ? '#1b1b22' : p.c1;
    inner = `<path d="M30 176C70 120 118 158 172 96" fill="none" stroke="${c}" stroke-width="30" stroke-linecap="round"/><path d="M44 164C76 126 112 150 160 104" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>`;
  } else if (f === 'Spray') {
    const dots = [[60, 90, 5], [82, 70, 3], [104, 96, 6], [126, 74, 4], [92, 120, 4], [140, 108, 5], [70, 140, 3], [118, 140, 4], [150, 140, 3], [48, 118, 3], [160, 84, 2.5], [100, 160, 3]];
    inner = dots.map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="${H.shade(t, 0.35)}" opacity="${0.18 + (i % 4) * 0.12}"/>`).join('');
  } else if (f === 'Liquid' || f === 'Foam') {
    const bub = [[70, 120, 26], [110, 104, 34], [146, 132, 22], [92, 154, 18], [128, 166, 14], [56, 160, 12], [160, 96, 10]];
    inner = blob('#ffffff') + bub.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${H.shade(t, 0.2)}" stroke-opacity=".35" stroke-width="1.5"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.18}" fill="${H.shade(t, 0.5)}" opacity=".5"/>`).join('');
  } else {
    const fill = f === 'Oil' ? '#eab64a' : f === 'Serum' ? H.shade(p.c1, 0.55) : f === 'Gel' ? H.shade(t, 0.62) : '#fdfaf5';
    inner = blob(fill);
  }
  return `<svg class="pd-tex" viewBox="0 0 200 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
}
const texWord = p => ({ Serum: 'lightweight serum', Gel: 'cooling gel', Cream: 'rich, non-greasy cream', Lotion: 'silky lotion', Oil: 'light, non-sticky oil', Liquid: 'gentle, low-foam liquid', Foam: 'airy foam', Stick: 'creamy matte colour', Pencil: 'intense black', Spray: 'fine mist' }[itemForm(p)] || 'smooth');
function viewHtml(p, v) {
  switch (v) {
    case 1: {
      const top = (50 - 3.6 - (LABEL_Y[p.shape] || 0.62) * 183).toFixed(1);
      return `<div class="pd-v pd-v-close">${artBox(p, 'pd-a-close', `top:${top}%`)}<span class="pd-v-cap">Label close-up</span></div>`;
    }
    case 2: return `<div class="pd-v pd-v-angle">${artBox(p, 'pd-a-back')}${artBox(p, 'pd-a-front')}<span class="pd-v-cap">Side view</span></div>`;
    case 3: return `<div class="pd-v pd-v-tex">${textureSvg(p)}${artBox(p, 'pd-a-mini')}<span class="pd-v-cap">Texture · ${esc(texWord(p))}</span></div>`;
    case 4: return `<div class="pd-v pd-v-ing">${artBox(p, 'pd-a-left')}<ul class="pd-v-list">${ingredients(p).slice(0, 3).map(i => `<li><i style="--c:${i.c}"></i><span><b>${esc(i.n)}</b><small>${esc(i.d)}</small></span></li>`).join('')}</ul><span class="pd-v-cap">Key ingredients</span></div>`;
    case 5: {
      const gifts = TBB.gift.active().length ? TBB.gift.active() : D.TBB_GIFTS;
      const g = gifts.find(x => x.id !== p.id) || D.TBB_GIFTS[0];
      return `<div class="pd-v pd-v-box">${artBox(p, 'pd-a-boxp')}${artBox(g, 'pd-a-gift')}<span class="pd-giftbox">${giftBoxSvg()}</span><span class="pd-v-cap">In the box · ${esc(p.size)} + 1 free TBB mini</span></div>`;
    }
    default: return `<div class="pd-v pd-v-front">${artBox(p, 'pd-a-main')}</div>`;
  }
}

/* ---------------- sections ---------------- */
function crumbs(p) {
  const b = H.brand(p.brand);
  return `<div class="pd-crumbs-row">
    <nav class="pd-crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>${icon('chevRight')}<a href="#/c/${p.cat}">${esc(catName(p))}</a>${icon('chevRight')}<a href="#/brand/${b.id}">${esc(bName(p))}</a><span class="pd-crumbs-cur" aria-current="page">${icon('chevRight')}${esc(p.name)}</span></nav>
    <a class="pd-promise" href="#/gifts">${icon('gift')}<span>Free gift with every order</span></a>
  </div>`;
}

function gallery(p) {
  const wished = S.wish.includes(p.id);
  return `<div class="pd-gal" style="--tint:${tintOf(p)}">
    <div class="pd-thumbs" role="group" aria-label="Product images">
      ${VIEWS.map((v, i) => `<button type="button" class="pd-thumb${i === st.view ? ' on' : ''}" data-action="pd-view" data-i="${i}" aria-label="Show image: ${v}"${i === st.view ? ' aria-current="true"' : ''}><span class="pd-view">${viewHtml(p, i)}</span></button>`).join('')}
    </div>
    <div class="pd-stagecol">
      <div class="pd-stage" id="pd-stage">
        <div class="pd-view" id="pd-view">${viewHtml(p, st.view)}</div>
        ${p.tag ? `<span class="pd-stage-tag">${esc(p.tag)}</span>` : ''}
        <div class="pd-stage-ibs">
          <button type="button" class="pd-ib pd-wish-ib${wished ? ' on' : ''}" data-action="pd-wish" aria-pressed="${wished}" aria-label="${wished ? 'Remove from wishlist' : 'Add to wishlist'}">${icon('heart')}</button>
          <button type="button" class="pd-ib" data-action="pd-share" aria-label="Share this product">${icon('upload')}</button>
        </div>
        <span class="pd-count" aria-hidden="true"><b id="pd-count-n">${st.view + 1}</b> / ${VIEWS.length}</span>
        <span class="pd-lens" aria-hidden="true"></span>
      </div>
      <p class="pd-hint"><span class="pd-hint-d">${icon('search')} Roll over image to zoom in</span><span class="pd-hint-m">Swipe or tap the thumbnails for more views</span></p>
      <div class="pd-zoom" aria-hidden="true"><div class="pd-zoom-in"><div class="pd-view">${viewHtml(p, st.view)}</div></div></div>
    </div>
  </div>`;
}

function offersHtml(p) {
  const b = H.brand(p.brand);
  const cp = D.COUPONS.find(c => c.brand === p.brand);
  const clipped = cp && S.clipped.includes(cp.id);
  const worth = Math.max(...D.TBB_GIFTS.map(g => g.worth));
  const cards = [
    `<div class="pd-of pd-of-gift"><b>${icon('gift')} Free TBB gift</b><p>Pick a complimentary TBB Original at checkout — worth up to ${fmt(worth)}.</p><a class="link" href="#/gifts">See all gifts</a></div>`,
    cp ? `<div class="pd-of pd-of-cp${clipped ? ' on' : ''}" id="pd-of-cp"><b>${icon('scissors')} Coupon</b><p>${esc(cp.value)} ${esc(cp.min)} · ${esc(b.name)} coupon, valid till ${esc(cp.expires)}.</p>${clipped ? `<span class="pd-of-ok">${icon('check')} Applied at checkout</span>` : `<button type="button" class="link" data-action="pd-clip" data-id="${cp.id}">Apply coupon</button>`}</div>` : '',
    `<div class="pd-of"><b>${icon('card')} Bank offer</b><p>10% instant discount up to ₹150 on HDFC Bank credit cards on orders of ₹999+.</p><button type="button" class="link" data-action="toast" data-icon="card" data-msg="Bank offers apply automatically at payment — included in the full build">2 offers ${icon('chevRight')}</button></div>`,
    `<div class="pd-of"><b>${icon('percent')} Cashback</b><p>Flat ₹30 cashback on your first UPI payment on The Big Brands.</p><button type="button" class="link" data-action="toast" data-icon="percent" data-msg="UPI cashback is credited within 48 hours — included in the full build">1 offer ${icon('chevRight')}</button></div>`,
    `<div class="pd-of"><b>${icon('store')} Partner offer</b><p>Get a GST invoice and save up to 18% on business purchases.</p><button type="button" class="link" data-action="toast" data-icon="store" data-msg="GST invoicing for salons & businesses — included in the full build">Details ${icon('chevRight')}</button></div>`,
  ];
  const list = cards.filter(Boolean);
  return `<div class="pd-offers-h">${icon('tag')}<b>Offers</b><span>${list.length} offers on this item</span></div>
    <div class="pd-offers-wrap at-start">
      <button type="button" class="pd-oarr prev" data-action="pd-offers" data-dir="-1" aria-label="Previous offers">${icon('chevLeft')}</button>
      <div class="pd-offers" role="list">${list.map(c => c.replace('<div class="pd-of', '<div role="listitem" class="pd-of')).join('')}</div>
      <button type="button" class="pd-oarr next" data-action="pd-offers" data-dir="1" aria-label="More offers">${icon('chevRight')}</button>
    </div>`;
}

function packsHtml(p) {
  const base = TBB.gift.allowance(p.price);
  return [1, 2, 3].map(n => {
    const price = p.price * n, g = TBB.gift.allowance(price), on = st.qty === n;
    return `<button type="button" class="pd-pack${on ? ' on' : ''}" data-action="pd-pack" data-n="${n}" aria-pressed="${on}">
      <span class="pd-pack-s">${n === 1 ? esc(p.size) : `${esc(p.size)} × ${n}`}</span>
      <b>${fmt(price)}</b>
      <small>${n === 1 ? unitPrice(p) || '&nbsp;' : `Pack of ${n}`}</small>
      ${g > base ? `<em>${icon('gift')}${g} free gifts</em>` : ''}
    </button>`;
  }).join('');
}
const sizeLabel = p => (st.qty > 1 ? `${p.size} × ${st.qty}` : p.size);

function factsList(p) {
  const cn = concernNames(p).join(', ');
  return [['Brand', bName(p)], ['Item form', itemForm(p)], ['Net quantity', p.size], ['Suitable for', suits(p)], cn ? ['Concern', cn] : ['Made in', 'India'], ['Shelf life', '36 months']];
}
/* facts + "About this item" + ingredients. Rendered inside the info column on desktop and as its own card
   after the buy box on tablet/mobile (so price → buy box → P2 ad come first on small screens). */
function details(p, mobile) {
  const inner = `<dl class="pd-facts">${factsList(p).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <hr class="pd-hr">
    <h2 class="pd-h">About this item</h2>
    <ul class="pd-about">${about(p).map(([h, t]) => `<li><b>${esc(h)}:</b> ${esc(t)}</li>`).join('')}</ul>
    <h2 class="pd-h">Key ingredients</h2>
    <ul class="pd-ings">${ingredients(p).map(i => `<li style="--c:${i.c}"><i></i><span><b>${esc(i.n)}</b><small>${esc(i.d)}</small></span></li>`).join('')}</ul>`;
  return mobile
    ? `<section class="pd-details-m blk" aria-label="Product details"><h2 class="pd-h pd-h-lg">Product details</h2>${inner}</section>`
    : `<div class="pd-details-d">${inner}</div>`;
}

function info(p) {
  const b = H.brand(p.brand), rank = rankIn(p), o = H.off(p);
  return `<div class="pd-info">
    <a class="pd-store" href="#/brand/${b.id}">${icon('store')}Visit the ${esc(bName(p))} Store</a>
    <h1 class="pd-title">${esc(bName(p))} ${esc(p.name)}, ${esc(p.size)}</h1>
    <div class="pd-rate-row">
      <span class="pd-rate-n">${p.rating}</span>${stars(p.rating)}
      <button type="button" class="pd-rcount" data-action="pd-to-reviews">${p.reviews.toLocaleString('en-IN')} ratings</button>
      <span class="pd-sep" aria-hidden="true"></span><span class="pd-bought">${H.bought(p)}</span>
    </div>
    <div class="pd-badges">${p.own
      ? `<span class="pd-best pd-best-own">${icon('sparkle')}TBB Original</span><span>Made by The Big Brands</span>`
      : `<span class="pd-best">${rank === 1 ? '#1 Bestseller' : `#${rank} Bestseller`}</span><span>in <a href="#/c/${p.cat}">${esc(catName(p))}</a></span>`}</div>
    ${p.own ? `<div class="pd-own">${icon('gift')}<p><b>This is our own label.</b> Love the free mini? This is the full-size ${esc(p.size)} — and you still get a free gift with this order.</p></div>` : ''}
    <hr class="pd-hr">
    ${o >= 15 ? `<span class="pd-deal">${icon('zap')}Limited time deal</span>` : ''}
    <div class="pd-price">${UI.priceBlock(p, { big: true })}</div>
    <p class="pd-tax">Inclusive of all taxes${unitPrice(p) ? ` · <span>${unitPrice(p)}</span>` : ''}</p>
    ${offersHtml(p)}
    <ul class="pd-svc">
      <li>${icon('truck')}<span>Free delivery</span></li>
      <li>${icon('ret')}<span>7-day returns</span></li>
      <li>${icon('shield')}<span>100% authentic</span></li>
      <li>${icon('card')}<span>Pay on delivery</span></li>
      <li class="pd-svc-gift">${icon('gift')}<span>Free TBB gift</span></li>
    </ul>
    <hr class="pd-hr">
    <div class="pd-size">
      <div class="pd-lbl">Size: <b class="pd-size-v">${esc(sizeLabel(p))}</b></div>
      <div class="pd-packs" role="group" aria-label="Choose size">${packsHtml(p)}</div>
    </div>
    ${details(p, false)}
  </div>`;
}

function tierHtml(p) {
  const tiers = TBB.gift.tiers(), max = Math.max(...tiers.map(t => t.min), 1);
  const inCart = S.cart.some(l => l.id === p.id);
  const sub = TBB.cart.subtotal() + (inCart ? 0 : p.price * st.qty), n = TBB.gift.allowance(sub), nt = TBB.gift.next(sub);
  return `<div class="pd-tier">
    <div class="pd-tier-bar"><i style="width:${clamp(sub / max * 100, 4, 100).toFixed(1)}%"></i>${tiers.filter(t => t.min > 0).map(t => `<span style="left:${(t.min / max * 100).toFixed(1)}%" class="${sub >= t.min ? 'ok' : ''}" title="${fmt(t.min)}: ${t.count} gifts"></span>`).join('')}</div>
    <p>${inCart ? 'Your cart now unlocks' : 'With this in your cart:'} <b>${n} free gift${n === 1 ? '' : 's'}</b>${nt ? ` · add ${fmt(nt.min - sub)} more for ${nt.count}` : ' · maximum unlocked'}</p>
  </div>`;
}

function buyBox(p) {
  const wished = S.wish.includes(p.id);
  const gifts = TBB.gift.active();
  const a = S.address;
  const giftBox = gifts.length ? `<div class="pd-gift">
      <div class="pd-gift-h"><span class="pd-gift-ic">${icon('gift')}</span><div><b>Free gift with this order</b><small>Choose a complimentary TBB Original at checkout — before you pay.</small></div></div>
      <div class="pd-minis">${gifts.slice(0, 5).map(g => `<span class="pd-mini" style="--tint:${g.c1}" title="${esc(g.name)} · ${esc(g.mini)}">${art(g)}</span>`).join('')}${gifts.length > 5 ? `<span class="pd-mini pd-mini-more">+${gifts.length - 5}</span>` : ''}</div>
      <div id="pd-tier">${tierHtml(p)}</div>
    </div>` : '';
  return `<div class="pd-box blk" id="pd-box">
    <div class="pd-box-price">${UI.priceBlock(p)}</div>
    <p class="pd-del"><span class="free">FREE</span> delivery <b>${H.deliveryDate(2)}</b> on this order.</p>
    <p class="pd-fast">Or fastest delivery <b>Tomorrow, ${tomorrow()}</b>. Order within <span class="pd-cd">${cutoff()}</span>.</p>
    <div class="pd-pin">
      <button type="button" class="pd-pin-btn" data-action="pd-pin" aria-expanded="${st.pinOpen}" aria-controls="pd-pin-form">${icon('pin')}<span>Deliver to ${esc(a.name.split(' ')[0])} – ${esc(a.city)} <b id="pd-pin-v">${esc(st.pinCode || a.pin)}</b></span></button>
      <form class="pd-pin-form" id="pd-pin-form"${st.pinOpen ? '' : ' hidden'} novalidate>
        <label class="sr-only" for="pd-pin">Delivery pincode</label>
        <input id="pd-pin" name="pin" inputmode="numeric" autocomplete="postal-code" maxlength="6" placeholder="Enter 6-digit pincode" value="${esc(st.pinCode || '')}">
        <button class="btn btn-dark btn-sm" type="submit">Check</button>
      </form>
      <p class="pd-pin-msg${st.pinOk ? '' : ' err'}" role="status">${st.pinMsg}</p>
    </div>
    <p class="pd-stock">${icon('check')}In stock</p>
    <div class="pd-qty"><label for="pd-qty">Quantity</label><select id="pd-qty">${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}"${st.qty === i + 1 ? ' selected' : ''}>${i + 1}</option>`).join('')}</select></div>
    <button type="button" class="btn btn-cart btn-lg pd-cta" data-action="pd-add">${icon('cart')}Add to cart</button>
    <button type="button" class="btn btn-buy btn-lg pd-cta" data-action="pd-buy">${icon('zap')}Buy now</button>
    ${giftBox}
    <dl class="pd-seller">
      <div><dt>Ships from</dt><dd>The Big Brands</dd></div>
      <div><dt>Sold by</dt><dd>The Big Brands Retail <small>(${p.own ? 'brand owner' : 'authorised seller'})</small></dd></div>
      <div><dt>Returns</dt><dd>7-day easy returns</dd></div>
      <div><dt>Payment</dt><dd>${icon('shield')}Secure transaction</dd></div>
    </dl>
    <button type="button" class="btn btn-ghost pd-wishbtn${wished ? ' on' : ''}" data-action="pd-wish" aria-pressed="${wished}">${icon('heart')}<span>${wished ? 'Saved to wishlist' : 'Add to wishlist'}</span></button>
  </div>`;
}

/* P2 — Buy-box Brand Ad (300×250 style) */
function p2Html() {
  const list = TBB.ads.list('P2');
  if (!list.length) return '';
  const c = list[0], b = H.brand(c.brand), house = c.house || c.brand === 'tbb';
  const th = c.theme || {};
  const col = b.color || '#333';
  const bg = th.bg || `linear-gradient(160deg, ${H.shade(col, 0.88)}, ${H.shade(col, 0.7)})`;
  const fg = th.fg || (H.lum(col) > 0.6 ? '#151515' : H.shade(col, -0.45));
  const ac = th.accent || col, acFg = H.lum(ac) > 0.6 ? '#151515' : '#ffffff';
  const pid = c.product || (c.products || [])[0], cp = pid && H.product(pid);
  const inner = `<a class="pd-p2${cp ? '' : ' pd-p2-noart'}" href="${esc(c.href || '#/brand/' + c.brand)}" style="--p2-bg:${esc(bg)};--p2-fg:${esc(fg)};--p2-ac:${esc(ac)};--p2-acfg:${acFg}">
      <span class="pd-p2-top">${UI.brandLogo(c.brand, { size: 19, color: fg })}${UI.adBadge(house ? 'The Big Brands' : 'Ad')}</span>
      ${c.kicker && c.kicker !== 'Sponsored' ? `<span class="pd-p2-k">${esc(c.kicker)}</span>` : ''}
      <b class="pd-p2-h">${esc(c.headline)}</b>
      ${c.sub ? `<span class="pd-p2-s">${esc(c.sub)}</span>` : ''}
      <span class="pd-p2-cta">${esc(c.cta || 'Shop now')}${icon('arrow')}</span>
      ${cp ? `<span class="pd-p2-art" style="--tint:${cp.c1}">${art(cp)}</span>` : `<span class="pd-p2-mono" aria-hidden="true">${esc((b.word || b.name).slice(0, 1))}</span>`}
    </a>
    <div class="pd-p2-foot"><span>${house ? 'Promoted by The Big Brands' : `Sponsored · ${esc(b.name)}`}</span><button type="button" data-action="pd-adfb">Ad feedback</button></div>`;
  return UI.slot('P2', inner, { cls: 'pd-p2-slot' });
}

/* P1 — Sponsored products related to this item */
function p1Html(p, exclude) {
  if (S.slotOn.P1 === false) return '';
  const items = sponsoredFor(p, exclude);
  const block = `<section class="pd-p1 blk" aria-labelledby="pd-p1-h">
    <div class="pd-sec-h"><div class="pd-sec-t"><h2 id="pd-p1-h">Sponsored products related to this item</h2><button type="button" class="pd-why" data-action="pd-why" aria-label="Why am I seeing these sponsored products?">${UI.spLabel()}</button></div><div class="pd-sec-meta"><span class="pd-p1-pg" aria-live="polite">Page 1 of 2</span><button type="button" data-action="pd-adfb">Ad feedback</button></div></div>
    ${UI.rail(items.map(x => UI.productCard(x, { sponsored: true })).join(''), { cls: 'pd-rail' })}
  </section>`;
  return UI.slot('P1', block, { cls: 'pd-p1-slot' });
}

/* Frequently bought together */
function fbtState(all) {
  const sel = all.filter((_, i) => st.fbt[i]);
  return { n: sel.length, total: sel.reduce((a, x) => a + x.price, 0), mrp: sel.reduce((a, x) => a + x.mrp, 0) };
}
const fbtBtnText = n => (n === 3 ? 'Add all 3 to cart' : n === 2 ? 'Add both to cart' : n === 1 ? 'Add to cart' : 'Select an item');
function fbtGiftText(total) { const g = TBB.gift.allowance(total); return total > 0 ? `Unlocks <b>${g} free gift${g === 1 ? '' : 's'}</b> at checkout` : 'Pick items to see your gifts'; }
const fbtCount = n => `${n} item${n === 1 ? '' : 's'}`;
const fbtSave = s => (s.mrp > s.total ? `You save ${fmt(s.mrp - s.total)} on M.R.P.` : '');
function fbtHtml(p, items) {
  const all = [p, ...items], s = fbtState(all);
  return `<section class="pd-fbt blk" aria-labelledby="pd-fbt-h">
    <div class="pd-sec-h"><div class="pd-sec-t"><h2 id="pd-fbt-h">Frequently bought together</h2><span class="pd-sec-sub">Customers who bought this also added these</span></div></div>
    <div class="pd-fbt-grid">
      <div class="pd-fbt-items" role="list">${all.map((x, i) => `<div role="listitem" class="pd-fbt-it${st.fbt[i] ? '' : ' off'}" data-i="${i}">
        <a class="pd-fbt-img" href="#/p/${x.id}" style="--tint:${tintOf(x)}" tabindex="-1" aria-hidden="true">${art(x)}</a>
        <input type="checkbox" class="pd-fbt-cb" data-i="${i}"${st.fbt[i] ? ' checked' : ''} aria-label="Include ${esc(bName(x) + ' ' + x.name)} in this bundle">
        <div class="pd-fbt-meta">
          <span class="pd-fbt-br">${i === 0 ? '<em class="pd-fbt-this">This item</em>' : ''}${esc(bName(x))}</span>
          <a class="pd-fbt-nm" href="#/p/${x.id}">${esc(x.name)}, ${esc(x.size)}</a>
          <span class="pd-fbt-rt">${stars(x.rating)}<small>${x.reviews.toLocaleString('en-IN')}</small></span>
          <span class="pd-fbt-pr"><b>${fmt(x.price)}</b>${x.mrp > x.price ? `<s>${fmt(x.mrp)}</s>` : ''}</span>
        </div>
      </div>`).join('')}</div>
      <div class="pd-fbt-sum">
        <span class="pd-fbt-lbl">Bundle total · <span class="pd-fbt-n">${fbtCount(s.n)}</span></span>
        <p class="pd-fbt-tp"><b class="pd-fbt-total">${fmt(s.total)}</b><s class="pd-fbt-mrp">${s.mrp > s.total ? fmt(s.mrp) : ''}</s></p>
        <p class="pd-fbt-save">${fbtSave(s)}</p>
        <div class="pd-fbt-stack" aria-hidden="true">${all.map((x, i) => `<span class="pd-fbt-dot${st.fbt[i] ? '' : ' off'}" data-i="${i}" style="--tint:${tintOf(x)}">${art(x)}</span>`).join('')}<span class="pd-fbt-dot pd-fbt-dot-g">${icon('gift')}</span><small>in your box</small></div>
        <p class="pd-fbt-gift">${icon('gift')}<span>${fbtGiftText(s.total)}</span></p>
        <button type="button" class="btn btn-cart btn-lg pd-fbt-add" data-action="pd-fbt-add"${s.n ? '' : ' disabled'}>${fbtBtnText(s.n)}</button>
        <small class="pd-fbt-foot">${icon('truck')}FREE delivery <b>${H.deliveryDate(2)}</b></small>
      </div>
    </div>
  </section>`;
}

/* Compare with similar items */
function cmpHtml(p) {
  const items = [p, ...similarFor(p)];
  const low = Math.min(...items.map(x => x.price)), top = Math.max(...items.map(x => x.rating));
  const cells = fn => items.map((x, i) => `<td${i === 0 ? ' class="pd-cur"' : ''}>${fn(x, i)}</td>`).join('');
  return `<section class="pd-cmp blk" aria-labelledby="pd-cmp-h">
    <div class="pd-sec-h"><div class="pd-sec-t"><h2 id="pd-cmp-h">Compare with similar items</h2></div></div>
    <div class="pd-cmp-scroll" tabindex="0" role="region" aria-labelledby="pd-cmp-h">
      <table class="pd-cmp-t">
        <thead><tr><th scope="col"><span class="sr-only">Feature</span></th>${items.map((x, i) => `<th scope="col"${i === 0 ? ' class="pd-cur"' : ''}>
          <span class="pd-cmp-flag">${i === 0 ? 'This item' : '&nbsp;'}</span>
          <a class="pd-cmp-img" href="#/p/${x.id}" style="--tint:${tintOf(x)}" tabindex="-1" aria-hidden="true">${art(x)}</a>
          <a class="pd-cmp-name" href="#/p/${x.id}">${esc(bName(x))} ${esc(x.name)}</a></th>`).join('')}</tr></thead>
        <tbody>
          <tr class="pd-cmp-cta"><th scope="row"><span class="sr-only">Add to cart</span></th>${cells(x => `<button type="button" class="btn btn-cart btn-sm" data-action="add" data-id="${x.id}">Add to cart</button>`)}</tr>
          <tr><th scope="row">Customer rating</th>${cells(x => `<span class="pd-cmp-rate">${stars(x.rating)}<b>${x.rating}</b><small>(${x.reviews.toLocaleString('en-IN')})</small></span>${x.rating === top ? '<em class="pd-cmp-tag">Highest rated</em>' : ''}`)}</tr>
          <tr><th scope="row">Price</th>${cells(x => `<b class="pd-cmp-pr">${fmt(x.price)}</b>${x.mrp > x.price ? ` <s>${fmt(x.mrp)}</s>` : ''}${x.price === low ? '<em class="pd-cmp-tag pd-cmp-tag-g">Lowest price</em>' : ''}`)}</tr>
          <tr><th scope="row">Size</th>${cells(x => esc(x.size))}</tr>
          <tr><th scope="row">Best for</th>${cells(x => esc(concernNames(x).join(', ') || suits(x)))}</tr>
          <tr><th scope="row">Item form</th>${cells(x => esc(itemForm(x)))}</tr>
          <tr><th scope="row">Free TBB gift</th>${cells(() => `<span class="pd-yes">${icon('check')}Included</span>`)}</tr>
          <tr><th scope="row">Sold by</th>${cells(() => 'The Big Brands Retail')}</tr>
        </tbody>
      </table>
    </div>
  </section>`;
}

/* Ratings & reviews */
const AV = ['#5b35e0', '#0f9f6e', '#d6234f', '#e07a00', '#1b6fb3', '#8e3b8f'];
function reviewsList(p) {
  const R = revFor(p), m = st.mention != null ? R.mentions[st.mention] : null;
  const test = m ? new RegExp(escRe(m[1]), 'i') : null, rep = m ? new RegExp('(' + escRe(m[1]) + ')', 'ig') : null;
  const note = m ? `<p class="pd-ment-note">Showing reviews that mention “${esc(m[0].toLowerCase())}” · <button type="button" class="link" data-action="pd-mention" data-i="${st.mention}">Clear</button></p>` : '';
  return note + R.reviews.map((r, i) => {
    const id = p.id + '-' + i, hit = !test || test.test(r.b + ' ' + r.t);
    const hl = s => (rep ? esc(s).replace(rep, '<mark>$1</mark>') : esc(s));
    const ini = r.n.split(' ').map(s => s[0]).join('');
    const helped = st.helped[id];
    return `<article class="pd-rv${hit ? '' : ' dim'}">
      <div class="pd-rv-who"><span class="pd-av" style="--c:${AV[(r.n.length + i) % AV.length]}" aria-hidden="true">${esc(ini)}</span><b>${esc(r.n)}</b></div>
      <div class="pd-rv-head">${stars(r.r)}<h4>${hl(r.t)}</h4></div>
      <p class="pd-rv-meta">Reviewed in India on ${esc(r.d)} · ${esc(r.c)}</p>
      <p class="pd-rv-tags">Size: ${esc(p.size)}<span class="pd-sep" aria-hidden="true"></span><span class="pd-vp">${icon('check')}Verified Purchase</span></p>
      <p class="pd-rv-b">${hl(r.b)}</p>
      <div class="pd-rv-act"><span class="pd-rv-h">${(r.h + (helped ? 1 : 0)).toLocaleString('en-IN')} people found this helpful</span>${helped
        ? `<span class="pd-rv-thx">${icon('check')}Thank you for your feedback</span>`
        : `<button type="button" class="btn btn-ghost btn-sm" data-action="pd-helpful" data-id="${id}">Helpful</button>`}<span class="pd-sep" aria-hidden="true"></span><button type="button" class="pd-rv-rep" data-action="toast" data-icon="info" data-msg="Thanks — our team will review this report">Report</button></div>
    </article>`;
  }).join('');
}
function reviewsHtml(p) {
  const R = revFor(p), hist = histogram(p.rating);
  return `<section class="pd-rev blk" id="pd-reviews" aria-labelledby="pd-rev-h" tabindex="-1">
    <div class="pd-rev-grid">
      <div class="pd-rev-sum">
        <h2 id="pd-rev-h">Customer reviews</h2>
        <div class="pd-rev-avg">${stars(p.rating)}<b>${p.rating} out of 5</b></div>
        <p class="pd-rev-tot">${p.reviews.toLocaleString('en-IN')} global ratings</p>
        <ul class="pd-hist">${hist.map((v, i) => `<li><span>${5 - i} star</span><span class="pd-bar" role="img" aria-label="${v}% of reviews have ${5 - i} stars"><i style="width:${v}%"></i></span><span>${v}%</span></li>`).join('')}</ul>
        <div class="pd-rev-write">
          <h3>Review this product</h3>
          <p>Share your thoughts with other customers</p>
          <button type="button" class="btn btn-ghost" data-action="toast" data-icon="star" data-msg="Verified-buyer reviews with photos — included in the full build">Write a product review</button>
        </div>
      </div>
      <div class="pd-rev-main">
        <h3>Customers say</h3>
        <p class="pd-say">${esc(R.say)}</p>
        <p class="pd-say-ai">${icon('sparkle')}AI-generated from the text of customer reviews</p>
        <div class="pd-ments" role="group" aria-label="Filter reviews by mention">${R.mentions.map(([l, , c], i) => `<button type="button" class="pd-ment${st.mention === i ? ' on' : ''}" data-action="pd-mention" data-i="${i}" aria-pressed="${st.mention === i}">${icon('check')}${esc(l)}<small>${H.kfmt(c)}</small></button>`).join('')}</div>
        <h3 class="pd-rv-title">Top reviews from India</h3>
        <div class="pd-rv-list" id="pd-rv-list">${reviewsList(p)}</div>
        <button type="button" class="link pd-more" data-action="toast" data-icon="star" data-msg="All ${p.reviews.toLocaleString('en-IN')} reviews with filters — included in the full build">See more reviews ${icon('arrow')}</button>
      </div>
    </div>
  </section>`;
}

function stickyBar(p) {
  return `<div class="pd-sticky" role="region" aria-label="Quick buy">
    <div class="pd-sticky-p"><b class="pd-sticky-v">${fmt(p.price * st.qty)}</b><small>${st.qty > 1 ? `Qty ${st.qty} · ` : ''}FREE delivery ${H.deliveryDate(2)}</small></div>
    <button type="button" class="btn btn-cart" data-action="pd-add">Add to cart</button>
    <button type="button" class="btn btn-buy" data-action="pd-buy">Buy now</button>
  </div>`;
}

/* desktop quick-buy bar: slides in at the top once the buy box has scrolled out of view */
function topBar(p) {
  const rank = rankIn(p);
  return `<div class="pd-topbar" role="region" aria-label="Quick buy">
    <div class="wrap pd-tb-in">
      <span class="pd-tb-img" style="--tint:${tintOf(p)}">${art(p)}</span>
      <div class="pd-tb-t">
        <b>${esc(bName(p))} ${esc(p.name)}, ${esc(p.size)}</b>
        <span>${stars(p.rating)}<em>${p.rating}</em><span class="pd-tb-rc">(${p.reviews.toLocaleString('en-IN')})</span>${p.own ? '<span class="pd-tb-rank">TBB Original</span>' : `<span class="pd-tb-rank">#${rank} Bestseller in ${esc(catName(p))}</span>`}</span>
      </div>
      <div class="pd-tb-p">${UI.priceBlock(p)}<small><span class="pd-tb-q">${st.qty > 1 ? `Qty ${st.qty} · ` : ''}</span>FREE delivery <b>${H.deliveryDate(2)}</b></small></div>
      <span class="pd-tb-gift">${icon('gift')}<span>Free TBB gift<small>picked at checkout</small></span></span>
      <button type="button" class="btn btn-cart" data-action="pd-add">${icon('cart')}Add to cart</button>
      <button type="button" class="btn btn-buy" data-action="pd-buy">Buy now</button>
    </div>
  </div>`;
}

function notFound(id) {
  const best = D.PRODUCTS.filter(x => !x.own).sort((a, b) => b.reviews - a.reviews).slice(0, 8);
  return `<div class="pd-page pd-nf wrap">
    <section class="blk pd-nf-card">
      <svg class="pd-nf-art" viewBox="0 0 220 160" aria-hidden="true">
        <ellipse cx="110" cy="146" rx="78" ry="7" fill="rgba(20,10,36,.08)"/>
        <path d="M44 70l66-24 66 24v58l-66 22-66-22z" fill="#f2eefb"/><path d="M110 46v104" stroke="#d8d0ec" stroke-width="2"/>
        <path d="M44 70l66 24 66-24" fill="none" stroke="#d8d0ec" stroke-width="2"/>
        <path d="M44 70l-18 22 66 24 18-22z" fill="#e6def7"/><path d="M176 70l18 22-66 24-18-22z" fill="#ece6f9"/>
        <circle cx="150" cy="44" r="22" fill="#fff" stroke="#ff3d6e" stroke-width="6"/><path d="M166 60l16 16" stroke="#ff3d6e" stroke-width="8" stroke-linecap="round"/>
        <text x="150" y="51" text-anchor="middle" fill="#ff3d6e" style="font:800 20px 'Bricolage Grotesque',sans-serif">?</text>
        <path d="M30 34l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#ffc94d"/><circle cx="196" cy="110" r="4" fill="#ffb347"/>
      </svg>
      <h1>We couldn’t find this product</h1>
      <p class="muted">${id ? `“${esc(id)}” isn’t in our catalogue — the link may be old or the product is no longer sold here.` : 'This link doesn’t point to a product.'} Here’s where you can go next:</p>
      <div class="pd-nf-links">
        <a class="btn btn-cart" href="#/">${icon('home')}Back to home</a>
        <a class="btn btn-ghost" href="#/s?sort=best">${icon('trending')}Bestsellers</a>
        <a class="btn btn-ghost" href="#/deals">${icon('zap')}Today’s deals</a>
        <a class="btn btn-ghost" href="#/gifts">${icon('gift')}Free Gift Store</a>
      </div>
      <div class="pd-nf-q"><span>Popular searches</span>${D.TRENDING.slice(0, 6).map(t => `<a class="chip" href="#/s?q=${encodeURIComponent(t)}">${icon('search')}${esc(t)}</a>`).join('')}</div>
    </section>
    <section class="blk pd-nf-best" aria-labelledby="pd-nf-h">
      <div class="pd-sec-h"><div class="pd-sec-t"><h2 id="pd-nf-h">Bestsellers you might like</h2></div><a class="link" href="#/s?sort=best">See all ${icon('arrow')}</a></div>
      ${UI.rail(best.map(x => UI.productCard(x)).join(''), { cls: 'pd-rail' })}
    </section>
  </div>`;
}

/* ---------------- page ---------------- */
TBB.page('product', {
  title: r => { const p = H.product(r.seg[1]); return p ? `${bName(p)} ${p.name}` : 'Product not found'; },
  render(r) {
    const p = H.product(r.seg[1]);
    if (!p) return notFound(r.seg[1]);
    if (st.id !== p.id) reset(p.id);
    const fbt = fbtFor(p);
    return `<div class="pd-page" data-id="${p.id}">
      <div class="wrap">
        ${crumbs(p)}
        <section class="pd-top">
          <div class="pd-main blk">${gallery(p)}${info(p)}</div>
          <aside class="pd-side" aria-label="Buy box">${buyBox(p)}${p2Html()}</aside>
          ${details(p, true)}
        </section>
        ${p1Html(p, fbt.map(x => x.id))}
        ${fbtHtml(p, fbt)}
        ${cmpHtml(p)}
        ${reviewsHtml(p)}
      </div>
      ${stickyBar(p)}
      ${topBar(p)}
    </div>`;
  },
  mount(root) {
    const p = H.product(st.id);
    if (!p || !root.querySelector('.pd-top')) return;
    /* hover zoom: lens over the image + magnified pane over the info column (desktop, fine pointer) */
    const stage = root.querySelector('#pd-stage'), lens = root.querySelector('.pd-lens');
    const pane = root.querySelector('.pd-zoom'), zin = root.querySelector('.pd-zoom-in');
    const fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
    let box = null;
    const enter = () => {
      if (window.innerWidth <= 1180) return;
      const r = stage.getBoundingClientRect();
      box = { w: r.width, h: r.height };
      lens.style.width = (box.w / ZOOM) + 'px'; lens.style.height = (box.h / ZOOM) + 'px';
      pane.style.width = box.w + 'px'; pane.style.height = box.h + 'px';
      zin.style.width = (box.w * ZOOM) + 'px'; zin.style.height = (box.h * ZOOM) + 'px';
      stage.classList.add('zooming'); pane.classList.add('on');
    };
    const move = e => {
      if (!box) return;
      const r = stage.getBoundingClientRect(), lw = box.w / ZOOM, lh = box.h / ZOOM;
      const x = clamp(e.clientX - r.left - lw / 2, 0, box.w - lw), y = clamp(e.clientY - r.top - lh / 2, 0, box.h - lh);
      lens.style.transform = `translate(${x}px, ${y}px)`;
      zin.style.transform = `translate(${-x * ZOOM}px, ${-y * ZOOM}px)`;
    };
    const leave = () => { box = null; stage.classList.remove('zooming'); pane.classList.remove('on'); };
    if (fine && stage) {
      stage.addEventListener('mouseenter', enter); stage.addEventListener('mousemove', move); stage.addEventListener('mouseleave', leave);
      offs.push(() => { stage.removeEventListener('mouseenter', enter); stage.removeEventListener('mousemove', move); stage.removeEventListener('mouseleave', leave); });
    }
    /* swipe between views on touch screens */
    let sx = null, sy = null;
    const ts = e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; };
    const te = e => {
      if (sx == null) return;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) setView((st.view + (dx < 0 ? 1 : -1) + VIEWS.length) % VIEWS.length);
    };
    if (stage) {
      stage.addEventListener('touchstart', ts, { passive: true }); stage.addEventListener('touchend', te);
      offs.push(() => { stage.removeEventListener('touchstart', ts); stage.removeEventListener('touchend', te); });
    }
    /* offers scroller: show/hide arrows + edge fades */
    const ow = root.querySelector('.pd-offers-wrap'), ot = ow && ow.querySelector('.pd-offers');
    const updOffers = () => {
      if (!ot) return;
      const max = ot.scrollWidth - ot.clientWidth;
      ow.classList.toggle('at-start', ot.scrollLeft <= 4);
      ow.classList.toggle('at-end', ot.scrollLeft >= max - 4);
    };
    /* P1 rail: live "Page x of y" */
    const tr = root.querySelector('.pd-p1 .rail-track'), pg = root.querySelector('.pd-p1-pg');
    const updPage = () => {
      if (!tr || !pg) return;
      const w = tr.clientWidth || 1, pages = Math.max(1, Math.ceil((tr.scrollWidth - 4) / w));
      let n = Math.min(pages, Math.round(tr.scrollLeft / w) + 1);
      if (tr.scrollLeft + w >= tr.scrollWidth - 4) n = pages;
      const t = `Page ${n} of ${pages}`; if (pg.textContent !== t) pg.textContent = t;
    };
    const onResize = () => { updOffers(); updPage(); };
    if (ot) ot.addEventListener('scroll', updOffers, { passive: true });
    if (tr) tr.addEventListener('scroll', updPage, { passive: true });
    window.addEventListener('resize', onResize);
    offs.push(() => { if (ot) ot.removeEventListener('scroll', updOffers); if (tr) tr.removeEventListener('scroll', updPage); window.removeEventListener('resize', onResize); });
    onResize();
    /* desktop quick-buy bar: on once the buy box's "Buy now" has scrolled above the viewport */
    const cta = root.querySelector('.pd-box [data-action="pd-buy"]');
    if (cta && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => {
        document.body.classList.toggle('pd-bar-on', !en.isIntersecting && en.boundingClientRect.top < 0);
      });
      io.observe(cta);
      offs.push(() => io.disconnect());
    }
    /* live "order within" countdown */
    timer = setInterval(() => { const el = document.querySelector('.pd-cd'); if (el) el.textContent = cutoff(); }, 30000);
  },
  unmount() {
    clearInterval(timer); timer = null;
    offs.forEach(f => f()); offs = [];
    document.body.classList.remove('pd-bar-on');
  },
});

/* ---------------- interactions ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const cur = () => H.product(st.id);

function setView(i) {
  const p = cur(); if (!p || i === st.view) return;
  st.view = i;
  const v = $('#pd-view'); if (v) v.innerHTML = viewHtml(p, i);
  const z = $('.pd-zoom-in .pd-view'); if (z) z.innerHTML = viewHtml(p, i);
  const n = $('#pd-count-n'); if (n) n.textContent = i + 1;
  $$('.pd-thumb').forEach((t, k) => { t.classList.toggle('on', k === i); if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
}
TBB.action('pd-view', el => setView(Number(el.dataset.i) || 0));
TBB.on('mouseover', '.pd-thumb', el => { if (window.matchMedia && matchMedia('(hover: hover)').matches) setView(Number(el.dataset.i) || 0); });

function syncQty() {
  const p = cur(); if (!p) return;
  const sel = $('#pd-qty'); if (sel) sel.value = String(st.qty);
  $$('.pd-pack').forEach(b => { const on = Number(b.dataset.n) === st.qty; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  const sv = $('.pd-size-v'); if (sv) sv.textContent = sizeLabel(p);
  const t = $('#pd-tier'); if (t) t.innerHTML = tierHtml(p);
  const sb = $('.pd-sticky-v'); if (sb) sb.textContent = fmt(p.price * st.qty);
  const ss = $('.pd-sticky-p small'); if (ss) ss.textContent = `${st.qty > 1 ? `Qty ${st.qty} · ` : ''}FREE delivery ${H.deliveryDate(2)}`;
  const tq = $('.pd-tb-q'); if (tq) tq.textContent = st.qty > 1 ? `Qty ${st.qty} · ` : '';
}
TBB.action('pd-pack', el => { st.qty = Number(el.dataset.n) || 1; syncQty(); });
TBB.on('change', '#pd-qty', el => { st.qty = clamp(Number(el.value) || 1, 1, 10); syncQty(); });

TBB.action('pd-add', (el, e) => {
  e.preventDefault();
  const p = cur(); if (!p) return;
  TBB.cart.add(p.id, st.qty);
  const t = $('#pd-tier'); if (t) t.innerHTML = tierHtml(p);
});
TBB.action('pd-buy', (el, e) => {
  e.preventDefault();
  const p = cur(); if (!p) return;
  TBB.cart.add(p.id, st.qty, { silent: true });
  TBB.go('#/checkout');
});

function syncWish() {
  const p = cur(); if (!p) return;
  const on = S.wish.includes(p.id);
  $$('.pd-wish-ib').forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist'); });
  $$('.pd-wishbtn').forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); const s = b.querySelector('span'); if (s) s.textContent = on ? 'Saved to wishlist' : 'Add to wishlist'; });
}
TBB.action('pd-wish', (el, e) => {
  e.preventDefault();
  const p = cur(); if (!p) return;
  const on = S.wish.includes(p.id);
  S.wish = on ? S.wish.filter(x => x !== p.id) : [...S.wish, p.id]; TBB.save('wish');
  syncWish();
  TBB.toast(on ? 'Removed from your wishlist' : 'Saved to your wishlist', { icon: 'heart' });
});
TBB.action('pd-share', () => {
  try { if (navigator.clipboard) navigator.clipboard.writeText(location.href).catch(() => {}); } catch (e) { /* ignore */ }
  TBB.toast('Link copied — share it on WhatsApp or Instagram', { icon: 'upload' });
});
TBB.action('pd-to-reviews', () => {
  const t = $('#pd-reviews'); if (!t) return;
  t.scrollIntoView({ behavior: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  t.focus({ preventScroll: true });
});

/* delivery pincode check */
TBB.action('pd-pin', el => {
  st.pinOpen = !st.pinOpen;
  el.setAttribute('aria-expanded', String(st.pinOpen));
  const f = $('#pd-pin-form'); if (!f) return;
  f.hidden = !st.pinOpen;
  if (st.pinOpen) { const i = $('#pd-pin'); if (i) i.focus(); }
});
TBB.on('input', '#pd-pin', el => { const v = el.value.replace(/\D/g, '').slice(0, 6); if (v !== el.value) el.value = v; });
TBB.on('submit', '#pd-pin-form', (el, e) => {
  e.preventDefault();
  const v = ($('#pd-pin') || {}).value || '', msg = $('.pd-pin-msg');
  if (!/^[1-9]\d{5}$/.test(v)) { st.pinOk = false; st.pinMsg = 'Please enter a valid 6-digit pincode.'; }
  else {
    st.pinOk = true; st.pinCode = v;
    const metro = /^(11|40|56|60|70|50|41|12|20)/.test(v);
    st.pinMsg = `${icon('check')}Delivers to ${v} by <b>${H.deliveryDate(metro ? 2 : 4)}</b> · Pay on delivery available`;
    const pv = $('#pd-pin-v'); if (pv) pv.textContent = v;
    st.pinOpen = false; el.hidden = true;
    const btn = $('.pd-pin-btn'); if (btn) { btn.setAttribute('aria-expanded', 'false'); }
  }
  if (msg) { msg.innerHTML = st.pinMsg; msg.classList.toggle('err', !st.pinOk); }
});

/* coupon */
TBB.action('pd-clip', el => {
  const id = el.dataset.id; if (!id) return;
  if (!S.clipped.includes(id)) { S.clipped = [...S.clipped, id]; TBB.save('clipped'); }
  const card = $('#pd-of-cp');
  if (card) { card.classList.add('on'); el.outerHTML = `<span class="pd-of-ok">${icon('check')} Applied at checkout</span>`; }
  TBB.toast('Coupon applied — the discount shows at checkout', { icon: 'scissors' });
});

/* frequently bought together */
function syncFbt() {
  const p = cur(); if (!p) return;
  const all = [p, ...fbtFor(p)], s = fbtState(all);
  $$('.pd-fbt-it, .pd-fbt-dot[data-i]').forEach(t => t.classList.toggle('off', !st.fbt[Number(t.dataset.i)]));
  const tot = $('.pd-fbt-total'); if (tot) tot.textContent = fmt(s.total);
  const m = $('.pd-fbt-mrp'); if (m) m.textContent = s.mrp > s.total ? fmt(s.mrp) : '';
  const n = $('.pd-fbt-n'); if (n) n.textContent = fbtCount(s.n);
  const sv = $('.pd-fbt-save'); if (sv) sv.textContent = fbtSave(s);
  const b = $('.pd-fbt-add'); if (b) { b.textContent = fbtBtnText(s.n); b.disabled = !s.n; }
  const g = $('.pd-fbt-gift span'); if (g) g.innerHTML = fbtGiftText(s.total);
}
TBB.on('change', '.pd-fbt-cb', el => { st.fbt[Number(el.dataset.i)] = el.checked; syncFbt(); });
TBB.action('pd-fbt-add', () => {
  const p = cur(); if (!p) return;
  const sel = [p, ...fbtFor(p)].filter((_, i) => st.fbt[i]);
  sel.forEach((x, i) => TBB.cart.add(x.id, 1, { silent: i < sel.length - 1 }));
  const t = $('#pd-tier'); if (t) t.innerHTML = tierHtml(p);
});

/* reviews */
TBB.action('pd-helpful', el => {
  const id = el.dataset.id; if (!id) return;
  st.helped[id] = true;
  const p = cur(), list = $('#pd-rv-list'); if (p && list) list.innerHTML = reviewsList(p);
});
TBB.action('pd-mention', el => {
  const i = Number(el.dataset.i), p = cur(); if (!p) return;
  st.mention = st.mention === i ? null : i;
  $$('.pd-ment').forEach((b, k) => { const on = st.mention === k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  const list = $('#pd-rv-list'); if (list) list.innerHTML = reviewsList(p);
});

/* offers scroller arrows */
TBB.action('pd-offers', el => {
  const t = el.parentElement && el.parentElement.querySelector('.pd-offers'); if (!t) return;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  t.scrollBy({ left: Number(el.dataset.dir) * Math.max(190, t.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' });
});

/* ads */
TBB.action('pd-why', () => TBB.toast('Why these ads? Brands bid to appear next to products like this one and pay only when you click (CPC).', { icon: 'info' }));
TBB.action('pd-adfb', () => TBB.toast('Thanks — your ad feedback helps us keep sponsored placements relevant', { icon: 'megaphone' }));
})();
