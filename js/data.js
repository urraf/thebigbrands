/* The Big Brands — marketplace demo · mock data (catalogue, brands, ad inventory, sample ads)
   Everything here is demo data. Ad creatives are sample placements for the pitch. */
window.TBB = window.TBB || {};
TBB.data = (() => {
  'use strict';

  /* ---------- categories ---------- */
  const CATS = [
    { id: 'skin',      name: 'Skincare',        short: 'Skincare' },
    { id: 'face',      name: 'Face Wash',       short: 'Face Wash' },
    { id: 'hair',      name: 'Shampoo & Care',  short: 'Haircare' },
    { id: 'oil',       name: 'Hair Oils',       short: 'Hair Oils' },
    { id: 'makeup',    name: 'Makeup',          short: 'Makeup' },
    { id: 'body',      name: 'Bath & Body',     short: 'Bath & Body' },
    { id: 'men',       name: "Men's Grooming",  short: 'Men' },
    { id: 'fragrance', name: 'Fragrance',       short: 'Fragrance' },
  ];

  /* ---------- brands (logo = styled wordmark) ---------- */
  const BRANDS = [
    { id: 'loreal',     name: "L'Oréal Paris", word: "L'ORÉAL", sub: 'PARIS', color: '#111111', accent: '#c8a96a', font: "'DM Serif Display', serif", weight: 400, tt: 'uppercase', ls: '.1em',  tagline: 'Paris-born beauty science' },
    { id: 'cetaphil',   name: 'Cetaphil',      word: 'Cetaphil',   color: '#1b4f9c', accent: '#e8eef6', font: "'Geist', sans-serif",         weight: 700, tt: 'none',      ls: '-.01em', tagline: 'Dermatologist-recommended skincare' },
    { id: 'minimalist', name: 'Minimalist',    word: 'minimalist', color: '#151515', accent: '#efefef', font: "'Geist', sans-serif",         weight: 500, tt: 'lowercase', ls: '.02em',  tagline: 'Clean formulas, honest labels' },
    { id: 'himalaya',   name: 'Himalaya',      word: 'Himalaya',   color: '#2e7d32', accent: '#e8f5e9', font: "'Instrument Serif', serif",   weight: 400, tt: 'none',      ls: '0',      italic: true, tagline: 'Herbal wellness for every day' },
    { id: 'mamaearth',  name: 'Mamaearth',     word: 'mamaearth',  color: '#1f9e96', accent: '#e3f6f4', font: "'Bricolage Grotesque', sans-serif", weight: 700, tt: 'lowercase', ls: '-.03em', tagline: 'Natural ingredients, modern care' },
    { id: 'parachute',  name: 'Parachute',     word: 'Parachute',  color: '#1565c0', accent: '#e3f0ff', font: "'Bricolage Grotesque', sans-serif", weight: 800, tt: 'none',      ls: '-.02em', tagline: 'Pure coconut hair care' },
    { id: 'dove',       name: 'Dove',          word: 'Dove',       color: '#1d3c78', accent: '#eef3fb', font: "'Instrument Serif', serif",   weight: 400, tt: 'none',      ls: '0',      tagline: 'Gentle, everyday care' },
    { id: 'dermaco',    name: 'The Derma Co',  word: 'THE DERMA CO', color: '#00897b', accent: '#e0f2f1', font: "'Geist', sans-serif",       weight: 700, tt: 'uppercase', ls: '.12em',  tagline: 'Active ingredients that work' },
    { id: 'nivea',      name: 'Nivea',         word: 'NIVEA',      color: '#0a2a8a', accent: '#e6ecfb', font: "'Bricolage Grotesque', sans-serif", weight: 800, tt: 'uppercase', ls: '.02em',  tagline: 'Skin care for everyone' },
    { id: 'lakme',      name: 'Lakmé',         word: 'LAKMÉ',      color: '#111111', accent: '#fde7ef', font: "'DM Serif Display', serif",   weight: 400, tt: 'uppercase', ls: '.16em',  tagline: 'Makeup made for India' },
    { id: 'garnier',    name: 'Garnier',       word: 'Garnier',    color: '#3b8f2a', accent: '#ecf7e8', font: "'Bricolage Grotesque', sans-serif", weight: 700, tt: 'none',      ls: '-.02em', tagline: 'Naturally effective care' },
    { id: 'biotique',   name: 'Biotique',      word: 'Biotique',   color: '#6d4c41', accent: '#f6ede6', font: "'Instrument Serif', serif",   weight: 400, tt: 'none',      ls: '.01em',  tagline: 'Ayurvedic botanical care' },
    { id: 'plum',       name: 'Plum',          word: 'plum',       color: '#6a1b9a', accent: '#f3e5f5', font: "'Bricolage Grotesque', sans-serif", weight: 800, tt: 'lowercase', ls: '-.04em', tagline: 'Vegan, cruelty-free goodness' },
    { id: 'beardo',     name: 'Beardo',        word: 'BEARDO',     color: '#111111', accent: '#d7a86e', font: "'Bebas Neue', sans-serif",    weight: 400, tt: 'uppercase', ls: '.08em',  tagline: 'Grooming for the modern man' },
    { id: 'bellavita',  name: 'Bella Vita',    word: 'BELLA VITA', color: '#1a1a1a', accent: '#c9a45c', font: "'Syne', sans-serif",          weight: 700, tt: 'uppercase', ls: '.14em',  tagline: 'Luxury fragrances, honest prices' },
    { id: 'tbb',        name: 'The Big Brands', word: 'TBB Originals', color: '#ff4d6d', accent: '#fff0f3', font: "'Bricolage Grotesque', sans-serif", weight: 800, tt: 'none', ls: '-.03em', tagline: 'Our own label — the gifts you love', own: true },
  ];

  /* ---------- catalogue ---------- */
  // shape: bottle | tube | dropper | jar | pump | stick  (rendered as SVG packshots)
  const P = [
    // skincare
    { id: 'lo-hyal',      name: 'Revitalift 1.5% Hyaluronic Acid Face Serum', brand: 'loreal',     cat: 'skin', price: 899, mrp: 999,  size: '30 ml',  shape: 'dropper', c1: '#4a58b0', c2: '#e8eaf6', rating: 4.4, reviews: 18420, concerns: ['dry', 'dull'], tag: 'Bestseller' },
    { id: 'min-niacin',   name: '10% Niacinamide Face Serum for Acne Marks',  brand: 'minimalist', cat: 'skin', price: 599, mrp: 649,  size: '30 ml',  shape: 'dropper', c1: '#efefef', c2: '#151515', rating: 4.3, reviews: 38910, concerns: ['acne', 'dull'], tag: "Editor's pick" },
    { id: 'min-spf',      name: 'SPF 50 Lightweight Sunscreen, No White Cast', brand: 'minimalist', cat: 'skin', price: 399, mrp: 449,  size: '50 g',   shape: 'tube',    c1: '#f6f6f6', c2: '#151515', rating: 4.2, reviews: 21300, concerns: ['tan'] },
    { id: 'nivea-cream',  name: 'Soft Light Moisturising Cream with Jojoba Oil', brand: 'nivea',    cat: 'skin', price: 249, mrp: 299,  size: '200 ml', shape: 'jar',     c1: '#0a2a8a', c2: '#ffffff', rating: 4.5, reviews: 59310, concerns: ['dry'] },
    { id: 'lakme-ss',     name: 'Sun Expert SPF 50 PA+++ Ultra Matte Gel',     brand: 'lakme',      cat: 'skin', price: 329, mrp: 399,  size: '100 ml', shape: 'tube',    c1: '#f57c00', c2: '#fff3e0', rating: 4.2, reviews: 13120, concerns: ['tan'] },
    { id: 'cet-moist',    name: 'Moisturising Cream for Dry to Very Dry Skin', brand: 'cetaphil',   cat: 'skin', price: 499, mrp: 575,  size: '80 g',   shape: 'jar',     c1: '#e8eef6', c2: '#1b4f9c', rating: 4.6, reviews: 9870,  concerns: ['dry'], tag: 'Derm pick' },
    { id: 'derma-vitc',   name: '10% Vitamin C Face Serum for Glowing Skin',   brand: 'dermaco',    cat: 'skin', price: 549, mrp: 599,  size: '30 ml',  shape: 'dropper', c1: '#ff9f1c', c2: '#2b1b0e', rating: 4.1, reviews: 7720,  concerns: ['dull', 'darkcircles'] },
    { id: 'gar-bright',   name: 'Bright Complete Vitamin C Serum Cream',       brand: 'garnier',    cat: 'skin', price: 199, mrp: 249,  size: '45 g',   shape: 'tube',    c1: '#f9a825', c2: '#1b5e20', rating: 4.2, reviews: 24410, concerns: ['dull', 'darkcircles'] },
    // face wash
    { id: 'cet-cl',       name: 'Gentle Skin Cleanser for Sensitive Skin',     brand: 'cetaphil',   cat: 'face', price: 399, mrp: 459,  size: '125 ml', shape: 'pump',    c1: '#e8eef6', c2: '#1b4f9c', rating: 4.7, reviews: 51200, concerns: ['dry'], tag: 'Derm pick' },
    { id: 'him-fw',       name: 'Purifying Neem Face Wash for Pimples',        brand: 'himalaya',   cat: 'face', price: 165, mrp: 199,  size: '150 ml', shape: 'tube',    c1: '#2e7d32', c2: '#c8e6c9', rating: 4.3, reviews: 87400, concerns: ['acne'], tag: 'Bestseller' },
    { id: 'derma-sal',    name: '2% Salicylic Acid Foaming Face Wash',         brand: 'dermaco',    cat: 'face', price: 349, mrp: 399,  size: '80 ml',  shape: 'tube',    c1: '#ffffff', c2: '#00897b', rating: 4.3, reviews: 27600, concerns: ['acne'] },
    { id: 'gar-micellar', name: 'Micellar Cleansing Water, Makeup Remover',    brand: 'garnier',    cat: 'face', price: 299, mrp: 349,  size: '400 ml', shape: 'bottle',  c1: '#e91e63', c2: '#fce4ec', rating: 4.5, reviews: 70200, concerns: ['dull'] },
    { id: 'mama-vitc',    name: 'Vitamin C Face Wash with Turmeric',           brand: 'mamaearth',  cat: 'face', price: 249, mrp: 299,  size: '100 ml', shape: 'tube',    c1: '#ff9800', c2: '#fff8e1', rating: 4.2, reviews: 66500, concerns: ['dull', 'tan'] },
    { id: 'plum-gt',      name: 'Green Tea Pore Cleansing Face Wash',          brand: 'plum',       cat: 'face', price: 345, mrp: 399,  size: '120 ml', shape: 'tube',    c1: '#7cb342', c2: '#1b3a0a', rating: 4.3, reviews: 19800, concerns: ['acne'] },
    // hair
    { id: 'lo-shampoo',   name: 'Total Repair 5 Shampoo for Damaged Hair',     brand: 'loreal',     cat: 'hair', price: 349, mrp: 449,  size: '340 ml', shape: 'bottle',  c1: '#b3122e', c2: '#e9c46a', rating: 4.5, reviews: 23100, concerns: ['frizz'], tag: 'Bestseller' },
    { id: 'dove-sh',      name: 'Intense Repair Shampoo for Damaged Hair',     brand: 'dove',       cat: 'hair', price: 299, mrp: 375,  size: '340 ml', shape: 'bottle',  c1: '#f1f4fa', c2: '#1d3c78', rating: 4.4, reviews: 62300, concerns: ['frizz'] },
    { id: 'him-shamp',    name: 'Anti-Dandruff Shampoo with Tea Tree',         brand: 'himalaya',   cat: 'hair', price: 240, mrp: 280,  size: '400 ml', shape: 'bottle',  c1: '#00695c', c2: '#e0f2f1', rating: 4.2, reviews: 33800, concerns: ['dandruff'] },
    { id: 'mama-onion-sh',name: 'Onion Shampoo for Hair Fall Control',         brand: 'mamaearth',  cat: 'hair', price: 349, mrp: 399,  size: '250 ml', shape: 'bottle',  c1: '#6d2c91', c2: '#f1e4ff', rating: 4.1, reviews: 41200, concerns: ['hairfall'] },
    { id: 'lo-cond',      name: 'Total Repair 5 Conditioner',                  brand: 'loreal',     cat: 'hair', price: 249, mrp: 299,  size: '180 ml', shape: 'bottle',  c1: '#8b0f24', c2: '#e9c46a', rating: 4.4, reviews: 11200, concerns: ['frizz'] },
    // oils
    { id: 'mama-onion',   name: 'Onion Hair Oil for Hair Growth',              brand: 'mamaearth',  cat: 'oil',  price: 359, mrp: 449,  size: '150 ml', shape: 'bottle',  c1: '#5b2a86', c2: '#e9d8ff', rating: 4.2, reviews: 44100, concerns: ['hairfall'], tag: 'Bestseller' },
    { id: 'para-coco',    name: '100% Pure Coconut Oil',                       brand: 'parachute',  cat: 'oil',  price: 199, mrp: 230,  size: '500 ml', shape: 'bottle',  c1: '#1565c0', c2: '#ffffff', rating: 4.6, reviews: 120400, concerns: ['dry', 'hairfall'] },
    { id: 'bio-bhring',   name: 'Bhringraj Therapeutic Hair Oil',              brand: 'biotique',   cat: 'oil',  price: 225, mrp: 260,  size: '120 ml', shape: 'bottle',  c1: '#6d4c41', c2: '#ffe0b2', rating: 4.1, reviews: 15400, concerns: ['hairfall'] },
    { id: 'para-aloe',    name: 'Advansed Aloe Vera Enriched Hair Oil',        brand: 'parachute',  cat: 'oil',  price: 155, mrp: 180,  size: '250 ml', shape: 'bottle',  c1: '#2e7d32', c2: '#ffffff', rating: 4.3, reviews: 28800, concerns: ['dry'] },
    // makeup
    { id: 'lakme-lip',    name: '9to5 Primer + Matte Lipstick',                brand: 'lakme',      cat: 'makeup', price: 450, mrp: 500, size: '3.6 g', shape: 'stick',   c1: '#b71c4a', c2: '#222222', rating: 4.3, reviews: 22100 },
    { id: 'lakme-kajal',  name: 'Eyeconic Kajal, Smudge-proof',                brand: 'lakme',      cat: 'makeup', price: 199, mrp: 240, size: '0.35 g', shape: 'stick',  c1: '#151515', c2: '#1a237e', rating: 4.4, reviews: 98700, tag: 'Bestseller' },
    { id: 'lo-found',     name: 'Infallible 24H Fresh Wear Foundation',        brand: 'loreal',     cat: 'makeup', price: 899, mrp: 1099, size: '30 ml', shape: 'pump',   c1: '#e0b48f', c2: '#151515', rating: 4.2, reviews: 8400 },
    // body
    { id: 'dove-bw',      name: 'Deeply Nourishing Body Wash',                 brand: 'dove',       cat: 'body', price: 279, mrp: 325,  size: '250 ml', shape: 'pump',    c1: '#e3eefc', c2: '#0d47a1', rating: 4.5, reviews: 28900, concerns: ['dry'] },
    { id: 'nivea-lotion', name: 'Nourishing Body Lotion for Very Dry Skin',    brand: 'nivea',      cat: 'body', price: 349, mrp: 425,  size: '400 ml', shape: 'pump',    c1: '#0a2a8a', c2: '#ffffff', rating: 4.6, reviews: 56700, concerns: ['dry'] },
    { id: 'him-cocoa',    name: 'Cocoa Butter Intensive Body Lotion',          brand: 'himalaya',   cat: 'body', price: 299, mrp: 350,  size: '400 ml', shape: 'pump',    c1: '#6d4c41', c2: '#ffe0b2', rating: 4.4, reviews: 17600, concerns: ['dry'] },
    // men
    { id: 'beardo-oil',   name: 'Beard & Hair Growth Oil',                     brand: 'beardo',     cat: 'men',  price: 349, mrp: 449,  size: '50 ml',  shape: 'dropper', c1: '#3e2723', c2: '#d7a86e', rating: 4.1, reviews: 31200, concerns: ['beard'] },
    { id: 'beardo-fw',    name: 'De-Tan Face Wash for Men',                    brand: 'beardo',     cat: 'men',  price: 249, mrp: 299,  size: '100 ml', shape: 'tube',    c1: '#212121', c2: '#ff6f00', rating: 4.2, reviews: 18900, concerns: ['tan'] },
    { id: 'nivea-men',    name: 'Men Dark Spot Reduction Face Wash',           brand: 'nivea',      cat: 'men',  price: 219, mrp: 260,  size: '100 ml', shape: 'tube',    c1: '#0a2a8a', c2: '#b0bec5', rating: 4.3, reviews: 40200, concerns: ['tan', 'dull'] },
    // fragrance
    { id: 'bella-oud',    name: 'Organic Oud Eau de Parfum',                   brand: 'bellavita',  cat: 'fragrance', price: 549, mrp: 899, size: '100 ml', shape: 'bottle', c1: '#1a1a1a', c2: '#c9a45c', rating: 4.2, reviews: 14300, tag: 'Hot deal' },
    { id: 'bella-ceo',    name: 'CEO Man Eau de Parfum',                       brand: 'bellavita',  cat: 'fragrance', price: 499, mrp: 799, size: '100 ml', shape: 'bottle', c1: '#0d47a1', c2: '#c0c0c0', rating: 4.1, reviews: 22900 },
  ];

  /* The Big Brands' own line — given free as minis with every order, sold as full size */
  const TBB_GIFTS = [
    { id: 'tbb-vitc',  name: 'Vitamin C Glow Face Wash',      line: 'Vit C Glow', mini: '30 ml mini', worth: 149, price: 299, mrp: 399, size: '100 ml', shape: 'tube',    c1: '#f6b23c', c2: '#2b1b0e', cat: 'face' },
    { id: 'tbb-onion', name: 'Red Onion Hair Growth Oil',     line: 'Red Onion',  mini: '25 ml mini', worth: 129, price: 349, mrp: 449, size: '150 ml', shape: 'dropper', c1: '#7a1f2b', c2: '#f3d9a4', cat: 'oil' },
    { id: 'tbb-aloe',  name: 'Aloe Calm Soothing Gel',        line: 'Aloe Calm',  mini: '30 g mini',  worth: 99,  price: 249, mrp: 299, size: '100 g',  shape: 'jar',     c1: '#9ccc65', c2: '#1f3d1a', cat: 'skin' },
    { id: 'tbb-rice',  name: 'Rice Water Shine Shampoo',      line: 'Rice Water', mini: '50 ml mini', worth: 119, price: 329, mrp: 399, size: '250 ml', shape: 'bottle',  c1: '#f4ece0', c2: '#8b6a3e', cat: 'hair' },
    { id: 'tbb-spf',   name: 'Daily Shield Sunscreen SPF 50', line: 'SPF 50',     mini: '15 ml mini', worth: 149, price: 399, mrp: 499, size: '50 ml',  shape: 'tube',    c1: '#ffffff', c2: '#ff7a59', cat: 'skin' },
    { id: 'tbb-lip',   name: 'Cocoa Butter Lip Balm',         line: 'Cocoa',      mini: '4 g',        worth: 89,  price: 149, mrp: 199, size: '4 g',    shape: 'stick',   c1: '#8d4b2f', c2: '#3a2318', cat: 'makeup' },
  ].map(g => ({ ...g, brand: 'tbb', rating: 4.6, reviews: 6400, own: true, tag: 'TBB Original' }));

  const PRODUCTS = [...P, ...TBB_GIFTS];

  /* ---------- shop by concern (each concern is a sponsorable ad unit) ---------- */
  const CONCERNS = [
    { id: 'hairfall',    name: 'Hair Fall',     sponsor: 'mamaearth',  emoji: '💇' },
    { id: 'acne',        name: 'Acne & Pimples', sponsor: 'dermaco',   emoji: '🫧' },
    { id: 'dandruff',    name: 'Dandruff',      sponsor: 'himalaya',   emoji: '❄️' },
    { id: 'dull',        name: 'Dull Skin',     sponsor: 'minimalist', emoji: '✨' },
    { id: 'tan',         name: 'Sun Tan',       sponsor: 'lakme',      emoji: '☀️' },
    { id: 'dry',         name: 'Dry Skin',      sponsor: 'nivea',      emoji: '💧' },
    { id: 'frizz',       name: 'Frizzy Hair',   sponsor: 'loreal',     emoji: '🌀' },
    { id: 'darkcircles', name: 'Dark Circles',  sponsor: 'garnier',    emoji: '👁️' },
    { id: 'beard',       name: 'Beard Care',    sponsor: 'beardo',     emoji: '🧔' },
  ];

  /* ---------- AD INVENTORY (rate card) ----------
     model: day | week | month | cpm | cpc | clip | box
     rate:  ₹ per unit of model ; units: positions available
     est:   potential monthly revenue at full occupancy (₹) at ~1 lakh visits/month
     fill:  current demo occupancy (0–1) ; mtd: revenue booked this month (₹) */
  const SLOTS = [
    { id: 'H1',  page: 'home',     name: 'Hero Billboard',          format: 'Rotating full-width banner (5 rotations)', size: '1500×420', model: 'day',   rate: 4000, units: 5,  est: 420000, fill: .8,  mtd: 236000, bookable: true },
    { id: 'H2',  page: 'home',     name: 'Brand Spotlight Cards',   format: '4 cards overlapping the billboard',        size: '360×420',  model: 'day',   rate: 1500, units: 4,  est: 126000, fill: .75, mtd: 71000,  bookable: true },
    { id: 'H3',  page: 'home',     name: 'Leaderboard Strip',       format: 'Full-width strip banner',                  size: '1500×120', model: 'day',   rate: 2000, units: 1,  est: 42000,  fill: .9,  mtd: 38000,  bookable: true },
    { id: 'H4',  page: 'home',     name: 'Concern Sponsorship',     format: '“Presented by” on a shop-by-concern tile', size: 'Tile',     model: 'month', rate: 8000, units: 9,  est: 72000,  fill: .67, mtd: 48000 },
    { id: 'H5',  page: 'home',     name: 'Video Billboard',         format: 'Autoplay muted video with CTA',             size: '16:9',     model: 'cpm',   rate: 220,  units: 1,  est: 66000,  fill: .6,  mtd: 31000,  bookable: true },
    { id: 'H6',  page: 'home',     name: 'Sponsored Reels',         format: 'Shoppable creator videos (9:16)',           size: '9:16',     model: 'week',  rate: 2500, units: 6,  est: 65000,  fill: .83, mtd: 50000 },
    { id: 'H7',  page: 'home',     name: 'Featured Brand Stores',   format: 'Brand logo tile linking to brand store',    size: 'Tile',     model: 'month', rate: 5000, units: 12, est: 60000,  fill: .92, mtd: 55000 },
    { id: 'H8',  page: 'home',     name: 'Double Billboard',        format: 'Two half-width banners',                    size: '740×300',  model: 'day',   rate: 1800, units: 2,  est: 75600,  fill: .7,  mtd: 44000,  bookable: true },
    { id: 'H9',  page: 'home',     name: 'Brand Coupon Wall',       format: 'Clip-to-save brand coupons',                size: 'Coupon',   model: 'clip',  rate: 1.5,  units: 8,  est: 36000,  fill: 1,   mtd: 21400 },
    { id: 'H10', page: 'home',     name: 'Sponsored Deal of the Day', format: 'Countdown deal hero',                     size: 'Block',    model: 'day',   rate: 6000, units: 1,  est: 150000, fill: .55, mtd: 66000,  bookable: true },
    { id: 'H11', page: 'home',     name: 'Sponsored Brand Shelf',   format: 'Brand headline + 4 products',               size: 'Shelf',    model: 'cpc',   rate: 6,    units: 2,  est: 48000,  fill: .7,  mtd: 26000 },
    { id: 'S1',  page: 'search',   name: 'Sponsored Search Suggestion', format: 'Top suggestion in the search box',     size: 'Text',     model: 'month', rate: 10000, units: 5, est: 50000,  fill: .8,  mtd: 40000 },
    { id: 'S2',  page: 'search',   name: 'Search Headline Banner',  format: 'Brand banner above search results',         size: 'Banner',   model: 'cpc',   rate: 8,    units: 1,  est: 64000,  fill: .75, mtd: 39000,  bookable: true },
    { id: 'S3',  page: 'search',   name: 'Sponsored Products',      format: 'Top positions inside results',              size: 'Card',     model: 'cpc',   rate: 5,    units: 4,  est: 90000,  fill: .85, mtd: 61000 },
    { id: 'S4',  page: 'search',   name: 'In-grid Native Ad',       format: 'Ad tile inside the product grid',           size: 'Card',     model: 'cpm',   rate: 150,  units: 1,  est: 30000,  fill: .6,  mtd: 14000 },
    { id: 'P1',  page: 'product',  name: 'Related Sponsored Products', format: 'Carousel on product pages',              size: 'Carousel', model: 'cpc',   rate: 5,    units: 8,  est: 70000,  fill: .8,  mtd: 47000 },
    { id: 'P2',  page: 'product',  name: 'Buy-box Brand Ad',        format: 'Banner below the buy box',                  size: '300×250',  model: 'cpm',   rate: 200,  units: 1,  est: 40000,  fill: .65, mtd: 19000 },
    { id: 'C1',  page: 'cart',     name: 'Cart Add-on Ads',         format: '“Add before checkout” sponsored items',     size: 'Card',     model: 'cpc',   rate: 6,    units: 4,  est: 36000,  fill: .7,  mtd: 20000 },
    { id: 'C2',  page: 'success',  name: 'Thank-you Page Ad',       format: 'Banner on order confirmation',              size: 'Banner',   model: 'cpm',   rate: 350,  units: 1,  est: 28000,  fill: .5,  mtd: 11000,  bookable: true },
    { id: 'B1',  page: 'brand',    name: 'Brand Store Subscription', format: 'Branded storefront page',                  size: 'Page',     model: 'month', rate: 5000, units: 15, est: 75000,  fill: .73, mtd: 55000 },
    { id: 'X1',  page: 'offline',  name: 'In-box Flyer / Sample',   format: 'Brand flyer or sample inside every delivery box', size: 'Insert', model: 'box', rate: 4, units: 1, est: 40000, fill: .4,  mtd: 9600 },
  ];

  /* ---------- SAMPLE AD CREATIVES ----------
     Common creative shape (pages must handle all fields being optional except brand/headline):
     { id, slot, brand, headline, sub, cta, href, kicker, product (product id), products [ids],
       theme: { bg, fg, accent }, layout } */
  const ADS = {
    H1: [
      { id: 'ad-h1-1', slot: 'H1', brand: 'loreal', kicker: 'New · Revitalift', headline: 'Hydration you can see in 2 weeks.', sub: '1.5% Hyaluronic Acid Serum — flat 10% off + free gift', cta: 'Shop Revitalift', href: '#/brand/loreal', product: 'lo-hyal', products: ['lo-hyal', 'lo-found'], theme: { bg: 'linear-gradient(120deg,#120d36 0%,#2b2672 55%,#5a66c8 100%)', fg: '#ffffff', accent: '#e8c27a' }, layout: 'split' },
      { id: 'ad-h1-2', slot: 'H1', brand: 'mamaearth', kicker: 'Hair Fall Week', headline: 'Less hair fall. More hair days.', sub: 'Onion oil + shampoo combos — up to 30% off', cta: 'Shop Onion range', href: '#/brand/mamaearth', product: 'mama-onion', products: ['mama-onion', 'mama-onion-sh'], theme: { bg: 'linear-gradient(120deg,#f6edff 0%,#e4ccff 60%,#c9a2ff 100%)', fg: '#2a0f47', accent: '#6d2c91' }, layout: 'split' },
      { id: 'ad-h1-3', slot: 'H1', brand: 'tbb', kicker: 'Only on The Big Brands', headline: 'Every order comes with a free gift.', sub: 'Pick your favourite TBB mini before you pay — up to 3 gifts free', cta: 'See the free gifts', href: '#/gifts', product: 'tbb-vitc', products: ['tbb-vitc', 'tbb-onion', 'tbb-spf'], theme: { bg: 'linear-gradient(120deg,#ff3d6e 0%,#ff6a4d 55%,#ffb347 100%)', fg: '#ffffff', accent: '#fff3c4' }, layout: 'split', house: true },
      { id: 'ad-h1-4', slot: 'H1', brand: 'minimalist', kicker: 'Science, not stories', headline: '10% Niacinamide. Clearer skin, honestly.', sub: 'Dermat-tested actives from ₹399', cta: 'Shop Minimalist', href: '#/brand/minimalist', product: 'min-niacin', products: ['min-niacin', 'min-spf'], theme: { bg: 'linear-gradient(120deg,#f4f4f2 0%,#e9e9e4 100%)', fg: '#151515', accent: '#151515' }, layout: 'split' },
      { id: 'ad-h1-5', slot: 'H1', brand: 'lakme', kicker: 'Summer-proof', headline: 'SPF 50 that feels like nothing.', sub: 'Sun Expert range — buy 2, get 15% off', cta: 'Shop Lakmé', href: '#/brand/lakme', product: 'lakme-ss', products: ['lakme-ss', 'lakme-lip'], theme: { bg: 'linear-gradient(120deg,#ff7a00 0%,#ffa62b 55%,#ffd36b 100%)', fg: '#2b1300', accent: '#ffffff' }, layout: 'split' },
    ],
    H2: [
      { id: 'ad-h2-1', slot: 'H2', brand: 'cetaphil', headline: 'Gentle on sensitive skin', sub: 'Derm favourites from ₹399', cta: 'Explore Cetaphil', href: '#/brand/cetaphil', products: ['cet-cl', 'cet-moist'], theme: { bg: '#eaf1fb', fg: '#0f2f63', accent: '#1b4f9c' } },
      { id: 'ad-h2-2', slot: 'H2', brand: 'himalaya', headline: 'Neem range for clear skin', sub: 'Starting ₹165', cta: 'Shop Himalaya', href: '#/brand/himalaya', products: ['him-fw', 'him-shamp', 'him-cocoa'], theme: { bg: '#eaf5ea', fg: '#1b4d1e', accent: '#2e7d32' } },
      { id: 'ad-h2-3', slot: 'H2', brand: 'dove', headline: 'Winter repair, sorted', sub: 'Up to 25% off Dove', cta: 'Shop Dove', href: '#/brand/dove', products: ['dove-sh', 'dove-bw'], theme: { bg: '#eef3fb', fg: '#14284f', accent: '#1d3c78' } },
      { id: 'ad-h2-4', slot: 'H2', brand: 'garnier', headline: 'Micellar magic', sub: 'Remove makeup in one swipe', cta: 'Shop Garnier', href: '#/brand/garnier', products: ['gar-micellar', 'gar-bright'], theme: { bg: '#fdeef4', fg: '#5c1031', accent: '#e91e63' } },
    ],
    H3: [
      { id: 'ad-h3-1', slot: 'H3', brand: 'nivea', kicker: 'Winter Care Fest', headline: 'Soft skin all winter. Up to 35% off NIVEA.', sub: 'Creams, lotions & lip care', cta: 'Shop now', href: '#/brand/nivea', products: ['nivea-cream', 'nivea-lotion', 'nivea-men'], theme: { bg: 'linear-gradient(90deg,#071e66,#0a2a8a 50%,#1e4fd8)', fg: '#ffffff', accent: '#ffffff' } },
    ],
    H5: [
      { id: 'ad-h5-1', slot: 'H5', brand: 'lakme', kicker: 'Watch · 0:30', headline: 'The 30-second office look', sub: '9to5 Matte Lipstick + Eyeconic Kajal. Long-lasting, smudge-proof.', cta: 'Shop the look', href: '#/brand/lakme', products: ['lakme-lip', 'lakme-kajal'], theme: { bg: 'linear-gradient(135deg,#2a0614,#7a0f33 60%,#c2185b)', fg: '#ffffff', accent: '#ffb3c8' } },
    ],
    H8: [
      { id: 'ad-h8-1', slot: 'H8', brand: 'biotique', kicker: 'Ayurveda for hair', headline: 'Bhringraj for stronger roots', sub: 'Flat 15% off', cta: 'Shop Biotique', href: '#/brand/biotique', product: 'bio-bhring', theme: { bg: 'linear-gradient(120deg,#3e2a20,#6d4c41)', fg: '#fff3e6', accent: '#ffcc80' } },
      { id: 'ad-h8-2', slot: 'H8', brand: 'bellavita', kicker: 'Luxury for less', headline: 'Smell expensive. Pay less.', sub: 'Perfumes from ₹499 — up to 40% off', cta: 'Shop Bella Vita', href: '#/brand/bellavita', product: 'bella-oud', theme: { bg: 'linear-gradient(120deg,#0d0d0d,#2b2b2b)', fg: '#f5ead2', accent: '#c9a45c' } },
    ],
    H10: [
      { id: 'ad-h10-1', slot: 'H10', brand: 'garnier', kicker: 'Sponsored Deal of the Day', headline: 'Micellar Cleansing Water 400 ml', sub: 'Lowest price of the season', cta: 'Grab deal', href: '#/p/gar-micellar', product: 'gar-micellar', dealPrice: 229, theme: { bg: 'linear-gradient(120deg,#fff0f5,#ffe3ee)', fg: '#5c1031', accent: '#e91e63' } },
    ],
    H11: [
      { id: 'ad-h11-1', slot: 'H11', brand: 'himalaya', headline: 'Pure herbs. Real results.', sub: 'Trusted herbal care for skin & hair', cta: 'Visit Himalaya store', href: '#/brand/himalaya', products: ['him-fw', 'him-shamp', 'him-cocoa', 'him-fw'], theme: { bg: '#eef7ee', fg: '#1b4d1e', accent: '#2e7d32' } },
    ],
    S2: [
      { id: 'ad-s2-1', slot: 'S2', brand: 'dermaco', headline: 'Actives that actually work', sub: 'Salicylic, Vitamin C & more — from ₹349', cta: 'Shop The Derma Co', href: '#/brand/dermaco', products: ['derma-sal', 'derma-vitc'], theme: { bg: 'linear-gradient(90deg,#e0f2f1,#ffffff)', fg: '#00483f', accent: '#00897b' } },
    ],
    P2: [
      { id: 'ad-p2-1', slot: 'P2', brand: 'plum', headline: 'Clear pores, naturally', sub: 'Green Tea range — 20% off', cta: 'Shop Plum', href: '#/brand/plum', product: 'plum-gt', theme: { bg: 'linear-gradient(160deg,#f3e5f5,#e1bee7)', fg: '#3a0d52', accent: '#6a1b9a' } },
    ],
    C2: [
      { id: 'ad-c2-1', slot: 'C2', brand: 'beardo', kicker: 'For him', headline: 'Gift him the grooming kit', sub: 'Beard oil + de-tan face wash — save ₹200', cta: 'Shop Beardo', href: '#/brand/beardo', products: ['beardo-oil', 'beardo-fw'], theme: { bg: 'linear-gradient(120deg,#111,#3e2723)', fg: '#f6e6d0', accent: '#d7a86e' } },
    ],
  };

  /* Sponsored reels (H6) — creator names are fictional */
  const REELS = [
    { id: 'r1', creator: 'Riya Malhotra',  handle: '@glowwithriya',   brand: 'minimalist', title: '3-step routine for oily, acne-prone skin', views: '1.2M', product: 'min-niacin',   colors: ['#f6c7dc', '#b48ad8'] },
    { id: 'r2', creator: 'Aman Verma',     handle: '@groomwithaman',  brand: 'beardo',     title: 'Patchy beard? Try this for 30 days',       views: '860K', product: 'beardo-oil',   colors: ['#3e2723', '#a1887f'] },
    { id: 'r3', creator: 'Sana Sheikh',    handle: '@sanasays',       brand: 'mamaearth',  title: 'My hair fall finally reduced — honest review', views: '2.4M', product: 'mama-onion', colors: ['#d1b3ff', '#7e57c2'] },
    { id: 'r4', creator: 'Neha Iyer',      handle: '@nehaiyer.makeup', brand: 'lakme',     title: 'Office-to-party lips in 10 seconds',       views: '540K', product: 'lakme-lip',    colors: ['#ffb3c8', '#c2185b'] },
    { id: 'r5', creator: 'Dr. Kavya Rao',  handle: '@dermkavya',      brand: 'cetaphil',   title: 'Dermatologist’s pick for sensitive skin',  views: '1.8M', product: 'cet-cl',       colors: ['#cfe0f7', '#5b86c9'] },
    { id: 'r6', creator: 'Tara Kapoor',    handle: '@tarakapoor',     brand: 'bellavita',  title: 'Smell like a million rupees under ₹600',   views: '3.1M', product: 'bella-oud',    colors: ['#3a3a3a', '#c9a45c'] },
  ];

  /* Brand coupon wall (H9) */
  const COUPONS = [
    { id: 'cp1', brand: 'dove',      value: '₹50 off',  min: 'on ₹299+',  expires: '30 Nov' },
    { id: 'cp2', brand: 'mamaearth', value: '15% off',  min: 'on ₹499+',  expires: '28 Nov' },
    { id: 'cp3', brand: 'loreal',    value: '₹100 off', min: 'on ₹799+',  expires: '2 Dec' },
    { id: 'cp4', brand: 'himalaya',  value: '10% off',  min: 'no minimum', expires: '30 Nov' },
    { id: 'cp5', brand: 'nivea',     value: '₹75 off',  min: 'on ₹399+',  expires: '5 Dec' },
    { id: 'cp6', brand: 'beardo',    value: 'Buy 1 Get 1', min: 'on beard oils', expires: '27 Nov' },
    { id: 'cp7', brand: 'plum',      value: '20% off',  min: 'on ₹599+',  expires: '1 Dec' },
    { id: 'cp8', brand: 'bellavita', value: '₹150 off', min: 'on ₹999+',  expires: '3 Dec' },
  ];

  /* Sponsored search suggestions (S1) — matched on keywords */
  const SEARCH_ADS = [
    { brand: 'mamaearth',  keywords: ['hair', 'fall', 'onion', 'oil', 'shampoo', 'growth'], text: 'Mamaearth Onion Hair Fall range — up to 30% off', href: '#/brand/mamaearth' },
    { brand: 'dermaco',    keywords: ['acne', 'pimple', 'salicylic', 'face wash', 'oily'],  text: 'The Derma Co 2% Salicylic Face Wash', href: '#/p/derma-sal' },
    { brand: 'minimalist', keywords: ['serum', 'niacinamide', 'vitamin', 'glow', 'dull', 'marks'], text: 'Minimalist 10% Niacinamide Serum', href: '#/p/min-niacin' },
    { brand: 'lakme',      keywords: ['sun', 'spf', 'tan', 'sunscreen', 'lip', 'kajal', 'makeup'], text: 'Lakmé Sun Expert SPF 50', href: '#/p/lakme-ss' },
    { brand: 'loreal',     keywords: [], text: "L'Oréal Revitalift Hyaluronic Serum — 10% off", href: '#/p/lo-hyal' },
  ];

  const TRENDING = ['vitamin c serum', 'onion hair oil', 'sunscreen spf 50', 'salicylic face wash', 'beard oil', 'perfume for men', 'kajal', 'body lotion'];

  return { CATS, BRANDS, PRODUCTS, TBB_GIFTS, CONCERNS, SLOTS, ADS, REELS, COUPONS, SEARCH_ADS, TRENDING };
})();
