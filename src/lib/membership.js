// ─── Plan definitions ─────────────────────────────────────────
export const BUYER_PLANS = [
  {
    id: 'buyer_free',
    name: 'Starter',
    price: 0,
    interval: 'month',
    description: 'Get started with Fairway',
    color: '#6b7280',
    limits: {
      requestsPerMonth: 3,
      savingsReport: false,
      multiCourse: false,
      prioritySupport: false,
      vendorFilters: false,
    },
    features: [
      'Up to 3 requests per month',
      'Basic bid comparison',
      'Standard vendor directory',
      'Email support',
    ],
    missing: [
      'Savings report',
      'Advanced vendor filters',
      'Multi-course management',
      'Priority support',
    ],
  },
  {
    id: 'buyer_pro',
    name: 'Pro Club',
    price: 1000,
    interval: 'month',
    description: 'For active clubs serious about saving',
    color: '#1a8250',
    popular: true,
    stripePriceId: 'price_1TLoZpKSFMa1JWApWkk7Crnk', // replace with real Stripe price ID
    limits: {
      requestsPerMonth: Infinity,
      savingsReport: true,
      multiCourse: false,
      prioritySupport: true,
      vendorFilters: true,
    },
    features: [
      'Unlimited requests per month',
      'Full savings report & analytics',
      'Advanced vendor filters',
      'Priority email & phone support',
      'Bid history & insights',
      'CSV export',
    ],
    missing: [
      'Multi-course management',
      'Dedicated account manager',
    ],
  },
]

export const VENDOR_PLANS = [
  {
    id: 'vendor_free',
    name: 'Starter',
    price: 0,
    interval: 'month',
    description: 'Start bidding on jobs',
    color: '#6b7280',
    limits: {
      bidsPerMonth: 5,
      featuredListing: false,
      verifiedBadge: false,
      analytics: false,
    },
    features: [
      'Up to 5 bids per month',
      'Standard listing',
      'Basic profile page',
    ],
    missing: [
      'Unlimited bids',
      'Featured listing',
      'Verified badge',
      'Bid analytics',
    ],
  },
  {
    id: 'vendor_pro',
    name: 'Pro Vendor',
    price: 1000,
    interval: 'month',
    description: 'For vendors serious about growing',
    color: '#1a8250',
    popular: true,
    stripePriceId: 'price_1TLodfKSFMa1JWApkOIPigvv',
    limits: {
      bidsPerMonth: Infinity,
      featuredListing: true,
      verifiedBadge: true,
      analytics: true,
    },
    features: [
      'Unlimited bids per month',
      'Featured listing (shown first)',
      'Verified vendor badge',
      'Bid win rate analytics',
      'Instant new request alerts',
      'Priority in search results',
    ],
    missing: [],
  },
]

// ─── Mock current user plan (replace with Supabase data) ──────
export const MOCK_MEMBERSHIP = {
  buyer: {
    planId: 'buyer_free',
    requestsUsedThisMonth: 3,
    renewsAt: null,
    status: 'active',
  },
  seller: {
    planId: 'vendor_free',
    bidsUsedThisMonth: 4,
    renewsAt: null,
    status: 'active',
  },
}

// ─── Helpers ──────────────────────────────────────────────────
export function getPlan(planId, role = 'buyer') {
  const plans = role === 'buyer' ? BUYER_PLANS : VENDOR_PLANS
  return plans.find(p => p.id === planId) || plans[0]
}

export function canPostRequest(membership) {
  const plan = getPlan(membership.planId, 'buyer')
  if (plan.limits.requestsPerMonth === Infinity) return true
  return membership.requestsUsedThisMonth < plan.limits.requestsPerMonth
}

export function canPlaceBid(membership) {
  const plan = getPlan(membership.planId, 'vendor')
  if (plan.limits.bidsPerMonth === Infinity) return true
  return membership.bidsUsedThisMonth < plan.limits.bidsPerMonth
}

export function requestsRemaining(membership) {
  const plan = getPlan(membership.planId, 'buyer')
  if (plan.limits.requestsPerMonth === Infinity) return Infinity
  return Math.max(0, plan.limits.requestsPerMonth - membership.requestsUsedThisMonth)
}
