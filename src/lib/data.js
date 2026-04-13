// Central data store — replace with Supabase/API calls to go live

export const CATEGORIES = [
  { id: 'sand', label: 'Sand & Aggregates', icon: '⛱', color: '#c4943a' },
  { id: 'machinery', label: 'Machinery', icon: '🚜', color: '#1f6feb' },
  { id: 'labor', label: 'Labor', icon: '👷', color: '#8b5cf6' },
  { id: 'chemicals', label: 'Chemicals & Fertilizer', icon: '🌿', color: '#219e62' },
  { id: 'irrigation', label: 'Irrigation', icon: '💧', color: '#0ea5e9' },
  { id: 'equipment', label: 'Equipment Purchase', icon: '🔧', color: '#f97316' },
  { id: 'seed', label: 'Seed & Sod', icon: '🌱', color: '#84cc16' },
  { id: 'fuel', label: 'Fuel', icon: '⛽', color: '#ef4444' },
  { id: 'other', label: 'Other', icon: '📦', color: '#6b7280' },
]

export const USERS = {
  buyer: {
    id: 'buyer-1',
    name: 'James Whitfield',
    role: 'buyer',
    club: 'Pine Valley Country Club',
    location: 'Naples, FL',
    avatar: 'JW',
    avatarColor: '#219e62',
  },
  seller: {
    id: 'seller-1',
    name: 'Carlos Rivera',
    role: 'seller',
    company: 'Gulf Shore Aggregates',
    location: 'Tampa, FL',
    avatar: 'CR',
    avatarColor: '#1f6feb',
    categories: ['sand', 'other'],
    rating: 4.9,
    totalBidsWon: 31,
    totalRevenue: 284000,
    verified: true,
  },
}

export const VENDORS = [
  { id: 'v1', name: 'Gulf Shore Aggregates', location: 'Tampa, FL', categories: ['sand'], rating: 4.9, reviews: 94, bidsWon: 31, avgSavings: 22, verified: true, avatar: 'GS', color: '#219e62' },
  { id: 'v2', name: 'TurfLine Labor Co.', location: 'Orlando, FL', categories: ['labor'], rating: 4.6, reviews: 51, bidsWon: 24, avgSavings: 19, verified: true, avatar: 'TL', color: '#1f6feb' },
  { id: 'v3', name: 'GreenEquip Rentals', location: 'Atlanta, GA', categories: ['machinery'], rating: 4.8, reviews: 67, bidsWon: 18, avgSavings: 17, verified: true, avatar: 'GE', color: '#f97316' },
  { id: 'v4', name: 'Precision Turf Supply', location: 'Nashville, TN', categories: ['chemicals', 'seed'], rating: 4.5, reviews: 38, bidsWon: 15, avgSavings: 21, verified: true, avatar: 'PT', color: '#8b5cf6' },
  { id: 'v5', name: 'Carolina Sand Dist.', location: 'Charlotte, NC', categories: ['sand'], rating: 4.6, reviews: 28, bidsWon: 9, avgSavings: 18, verified: true, avatar: 'CS', color: '#0ea5e9' },
  { id: 'v6', name: 'WaterWise Irrigation', location: 'Jacksonville, FL', categories: ['irrigation'], rating: 4.7, reviews: 42, bidsWon: 12, avgSavings: 16, verified: true, avatar: 'WW', color: '#84cc16' },
  { id: 'v7', name: 'Sunbelt Granite & Sand', location: 'Jacksonville, FL', categories: ['sand'], rating: 4.4, reviews: 19, bidsWon: 6, avgSavings: 14, verified: false, avatar: 'SG', color: '#c4943a' },
  { id: 'v8', name: 'Southeast Fuel Direct', location: 'Miami, FL', categories: ['fuel'], rating: 4.3, reviews: 14, bidsWon: 8, avgSavings: 12, verified: true, avatar: 'SF', color: '#ef4444' },
]

export const REQUESTS = [
  {
    id: 'req-1',
    title: 'Bunker sand — 40 tons, USGA spec',
    category: 'sand',
    description: 'Need 40 tons of USGA-certified bunker sand for fairway bunker renovation. Must be delivered to site. COI required.',
    budget: 8000,
    status: 'bidding',
    closeDate: '2025-12-18',
    createdAt: '2025-12-10',
    location: 'Pine Valley CC, Naples FL',
    bids: [
      { id: 'b1', vendorId: 'v1', vendorName: 'Gulf Shore Aggregates', amount: 5920, deliveryDays: 5, rating: 4.9, notes: 'USGA certified · Free delivery · COI included', status: 'pending' },
      { id: 'b2', vendorId: 'v5', vendorName: 'Carolina Sand Dist.', amount: 6340, deliveryDays: 8, rating: 4.6, notes: 'USGA certified · Delivery +$280', status: 'pending' },
      { id: 'b3', vendorId: 'v7', vendorName: 'Sunbelt Granite & Sand', amount: 6720, deliveryDays: 6, rating: 4.4, notes: 'USGA certified · Delivery +$195', status: 'pending' },
      { id: 'b4', vendorId: 'v4', vendorName: 'Precision Turf Supply', amount: 7100, deliveryDays: 4, rating: 4.5, notes: 'In-stock, fastest delivery', status: 'pending' },
    ],
  },
  {
    id: 'req-2',
    title: 'Fairway mower rental — Toro 4500D, 3 weeks',
    category: 'machinery',
    description: 'Need a Toro 4500D or equivalent fairway mower rental for 3 weeks during turf renovation. Pickup within 50mi preferred.',
    budget: 4500,
    status: 'bidding',
    closeDate: '2025-12-19',
    createdAt: '2025-12-11',
    location: 'Pine Valley CC, Naples FL',
    bids: [
      { id: 'b5', vendorId: 'v3', vendorName: 'GreenEquip Rentals', amount: 3100, deliveryDays: 2, rating: 4.8, notes: 'Toro 4500D available · Delivery included', status: 'pending' },
      { id: 'b6', vendorId: 'v3', vendorName: 'SunState Equipment', amount: 3650, deliveryDays: 3, rating: 4.3, notes: 'Jacobsen LF 3830 equivalent', status: 'pending' },
    ],
  },
  {
    id: 'req-3',
    title: 'Cart path crew — 5 laborers, 2 weeks',
    category: 'labor',
    description: 'Need 5 experienced laborers for cart path repair and general course maintenance. 2-week project starting Jan 6.',
    budget: 6000,
    status: 'bidding',
    closeDate: '2025-12-22',
    createdAt: '2025-12-12',
    location: 'Pine Valley CC, Naples FL',
    bids: [
      { id: 'b7', vendorId: 'v2', vendorName: 'TurfLine Labor Co.', amount: 5200, deliveryDays: 1, rating: 4.6, notes: 'Insured crew · Superintendent references available', status: 'pending' },
    ],
  },
  {
    id: 'req-4',
    title: 'Fertilizer — Greens mix 50 bags',
    category: 'chemicals',
    description: 'LESCO 24-2-11 or equivalent greens fertilizer. 50 x 50lb bags. Delivery required.',
    budget: 4500,
    status: 'awarded',
    closeDate: '2025-12-05',
    createdAt: '2025-12-01',
    location: 'Pine Valley CC, Naples FL',
    awardedVendor: 'Precision Turf Supply',
    awardedAmount: 3260,
    savings: 1240,
    bids: [],
  },
  {
    id: 'req-5',
    title: 'Seasonal labor — 8 staff, 4 months',
    category: 'labor',
    description: '8 grounds crew staff for spring/summer season. April through July. Experience with turf management preferred.',
    budget: 45000,
    status: 'awarded',
    closeDate: '2025-11-20',
    createdAt: '2025-11-10',
    location: 'Pine Valley CC, Naples FL',
    awardedVendor: 'TurfLine Labor Co.',
    awardedAmount: 38200,
    savings: 6800,
    bids: [],
  },
]

export const ORDERS = [
  {
    id: 'po-2025-0041',
    title: 'Fertilizer — Greens mix 50 bags',
    vendor: 'Precision Turf Supply',
    amount: 3260,
    savings: 1240,
    status: 'in_transit',
    deliveryDate: '2025-12-15',
    category: 'chemicals',
  },
  {
    id: 'po-2025-0038',
    title: 'Seasonal labor — 8 staff, 4 months',
    vendor: 'TurfLine Labor Co.',
    amount: 38200,
    savings: 6800,
    status: 'active',
    deliveryDate: '2025-04-01',
    category: 'labor',
  },
  {
    id: 'po-2025-0035',
    title: 'Irrigation heads — 200 units',
    vendor: 'WaterWise Irrigation',
    amount: 4100,
    savings: 900,
    status: 'processing',
    deliveryDate: '2025-12-20',
    category: 'irrigation',
  },
  {
    id: 'po-2025-0029',
    title: 'Pea gravel — drainage project',
    vendor: 'Gulf Shore Aggregates',
    amount: 2840,
    savings: 660,
    status: 'delivered',
    deliveryDate: '2025-11-28',
    category: 'sand',
  },
  {
    id: 'po-2025-0024',
    title: 'Turf seed — overseeding mix',
    vendor: 'Precision Turf Supply',
    amount: 1920,
    savings: 380,
    status: 'delivered',
    deliveryDate: '2025-11-10',
    category: 'seed',
  },
]

export const SAVINGS_DATA = [
  { month: 'Jul', savings: 4200, spend: 18600 },
  { month: 'Aug', savings: 6800, spend: 22400 },
  { month: 'Sep', savings: 5100, spend: 16300 },
  { month: 'Oct', savings: 9200, spend: 31200 },
  { month: 'Nov', savings: 12400, spend: 38700 },
  { month: 'Dec', savings: 8100, spend: 26900 },
]

export const CATEGORY_SAVINGS = [
  { category: 'Labor', prior: 170000, marketplace: 138600, savings: 31400, pct: 18.5 },
  { category: 'Machinery', prior: 95000, marketplace: 69400, savings: 25600, pct: 26.9 },
  { category: 'Sand & Aggregates', prior: 48000, marketplace: 31100, savings: 16900, pct: 35.2 },
  { category: 'Chemicals', prior: 41000, marketplace: 30700, savings: 10300, pct: 25.1 },
]

// Open requests visible to sellers
export const SELLER_OPPORTUNITIES = [
  { id: 'req-1', title: 'Bunker sand — 40 tons, USGA spec', club: 'Pine Valley CC, FL', budget: 8000, distance: 42, closeDate: '2025-12-18', category: 'sand', bids: 4 },
  { id: 'opp-2', title: 'Sand — cart path top dressing, 15 tons', club: 'Pelican Bay CC, FL', budget: 3200, distance: 67, closeDate: '2025-12-21', category: 'sand', bids: 2 },
  { id: 'opp-3', title: 'Pea gravel — drainage install, 25 tons', club: 'Heritage Golf Club, FL', budget: 5500, distance: 88, closeDate: '2025-12-24', category: 'sand', bids: 1 },
  { id: 'opp-4', title: 'Decomposed granite — pathways, 10 tons', club: 'Tiburon Golf Club, FL', budget: 2800, distance: 31, closeDate: '2025-12-26', category: 'sand', bids: 0 },
]
