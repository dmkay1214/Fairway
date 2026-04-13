# ⛳ Fairway — Golf Procurement Marketplace

A full-stack marketplace where country clubs and golf courses source sand, machinery,
labor, chemicals, and supplies from competing vendors — at prices that deliver hard savings.

---

## What's built

| Screen | Description |
|---|---|
| Landing page | Marketing page with sign-up / log-in |
| Dashboard | Savings metrics, active requests, charts, top vendors |
| My Requests | Post and manage procurement RFQs |
| Live Bids | Real-time bid comparison with award workflow |
| Orders | Track all active and delivered orders |
| Savings Report | Category-level savings vs prior contracts |
| Vendor Directory | Browse and filter verified vendors |
| Seller Portal | Vendors browse open requests and submit bids |
| Seller Profile | Ratings, reviews, and stats |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Backend / DB | Supabase (Postgres + Auth + Realtime) |
| Payments | Stripe Connect |
| Email | Resend |
| Hosting | Vercel |

---

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Run dev server
npm run dev
# → http://localhost:5173
```

The app ships with full mock data so you can explore every screen
without connecting a database. Click "Enter as Buyer" or "Enter as Vendor"
on the landing page.

---

## Go-live: step-by-step

### Step 1 — Set up Supabase (15 min)

1. Go to [supabase.com](https://supabase.com) → New project
2. Open **SQL Editor** → paste contents of `supabase-schema.sql` → Run
3. Go to **Settings → API** → copy your Project URL and anon key
4. Paste them into your `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJh...
   ```
5. In Supabase → **Database → Replication** → enable realtime for:
   - `public.bids`
   - `public.requests`
   - `public.orders`

### Step 2 — Set up Stripe (20 min)

1. Go to [stripe.com](https://stripe.com) → Create account
2. Enable **Stripe Connect** in the Dashboard
3. Copy your publishable key into `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Deploy the `create-payment-intent` Edge Function (see `src/lib/stripe.js`)
5. Set your platform fee in `.env`:
   ```
   VITE_PLATFORM_FEE_PCT=3
   ```

### Step 3 — Set up email notifications (10 min)

1. Go to [resend.com](https://resend.com) → Create account (free tier: 3K emails/month)
2. Add your domain and verify DNS
3. Get your API key and set it in Supabase secrets:
   ```
   supabase secrets set RESEND_API_KEY=re_...
   ```
4. In Supabase → **Database → Webhooks** → create webhooks for:
   - `bids INSERT` → your notification edge function
   - `requests INSERT` → vendor notification function
5. See `src/lib/emails.js` for all email templates

### Step 4 — Deploy to Vercel (5 min)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables (from your `.env`) in Vercel project settings
4. Click **Deploy**
5. Your app is live at `https://your-project.vercel.app`

To use a custom domain:
- Vercel → Domains → Add → point your DNS

---

## Database schema overview

```
profiles          Users (buyers + sellers), extends auth.users
requests          RFQs posted by buyers
bids              Vendor bids on requests (one per vendor per request)
orders            Created when a bid is awarded
reviews           Post-delivery ratings left by buyers
```

Row Level Security ensures:
- Buyers only see their own requests and bids on them
- Sellers only see open requests and their own bids
- Orders are visible to both parties

---

## Monetization

The platform charges a **3% fee** (configurable) on each awarded transaction,
taken automatically by Stripe Connect at payment time.

Example: $10,000 sand order → vendor receives $9,700 → platform keeps $300

Change the fee in `.env`:
```
VITE_PLATFORM_FEE_PCT=3
```

---

## Roadmap / next features

- [ ] Buyer subscription tier (premium analytics, unlimited requests)
- [ ] Vendor verification workflow (license upload, COI check)
- [ ] In-app messaging between buyer and vendor
- [ ] Repeat order / bulk contract discounts
- [ ] Multi-club accounts (management companies)
- [ ] Mobile app (React Native — the components are fully portable)
- [ ] AI-powered vendor matching based on historical win rates

---

## Project structure

```
fairway/
├── src/
│   ├── App.jsx                  Main app + routing
│   ├── index.css                Global design tokens
│   ├── components/
│   │   ├── Sidebar.jsx          Navigation
│   │   ├── UI.jsx               Shared components (Button, Card, Modal…)
│   │   └── NewRequestModal.jsx  Post RFQ modal
│   ├── pages/
│   │   ├── Landing.jsx          Marketing + auth
│   │   ├── Dashboard.jsx        Buyer dashboard
│   │   ├── Requests.jsx         RFQ management
│   │   ├── Bids.jsx             Live bid comparison
│   │   ├── BuyerPages.jsx       Orders, Savings, Vendors
│   │   └── SellerPages.jsx      Seller portal + profile
│   └── lib/
│       ├── data.js              Mock data (replace with Supabase calls)
│       ├── supabase.js          Supabase client + all DB queries
│       ├── auth.jsx             Auth context + data hooks
│       ├── stripe.js            Stripe Connect integration
│       └── emails.js            Email notification templates
├── supabase-schema.sql          Full DB schema — run this first
├── vercel.json                  Deployment config
├── .env.example                 Environment variable template
└── README.md                    This file
```

---

## Support

Built with React + Supabase + Stripe. All three have excellent free tiers
to get you to your first $10K in GMV at zero infrastructure cost.

Questions? The key files to look at are:
- `src/lib/supabase.js` — all database queries
- `supabase-schema.sql` — the full database definition
- `src/lib/stripe.js` — payment flow comments
