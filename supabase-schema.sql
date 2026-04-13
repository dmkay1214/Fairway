-- ============================================================
-- FAIRWAY MARKETPLACE — SUPABASE DATABASE SCHEMA
-- Run this entire file in the Supabase SQL Editor:
-- https://app.supabase.com → SQL Editor → New query
-- ============================================================

-- ─── Enable extensions ────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Profiles ─────────────────────────────────────────────────
-- Extends auth.users with app-specific data
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('buyer', 'seller')),
  full_name     text,
  org_name      text,               -- club name (buyers) or company (sellers)
  location      text,
  avatar_url    text,
  categories    text[],             -- seller: categories they supply
  verified      boolean default false,
  rating        numeric(3,2) default 0,
  review_count  int default 0,
  bids_won      int default 0,
  total_revenue numeric(12,2) default 0,
  stripe_account_id text,           -- Stripe Connect account for payouts
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, org_name, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'org_name',
    new.raw_user_meta_data->>'location'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Requests ─────────────────────────────────────────────────
create table public.requests (
  id              uuid primary key default uuid_generate_v4(),
  buyer_id        uuid not null references public.profiles(id),
  title           text not null,
  description     text,
  category        text not null,
  budget          numeric(10,2) not null,
  status          text not null default 'bidding'
                    check (status in ('draft', 'bidding', 'awarded', 'cancelled', 'closed')),
  close_date      date not null,
  location        text,
  notes           text,
  awarded_bid_id  uuid,
  awarded_amount  numeric(10,2),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── Bids ─────────────────────────────────────────────────────
create table public.bids (
  id              uuid primary key default uuid_generate_v4(),
  request_id      uuid not null references public.requests(id) on delete cascade,
  vendor_id       uuid not null references public.profiles(id),
  amount          numeric(10,2) not null,
  delivery_days   int,
  notes           text,
  status          text not null default 'pending'
                    check (status in ('pending', 'awarded', 'rejected', 'withdrawn')),
  created_at      timestamptz default now(),
  unique(request_id, vendor_id)    -- one bid per vendor per request
);

-- Foreign key from requests → bids (set after bids table exists)
alter table public.requests
  add constraint fk_awarded_bid
  foreign key (awarded_bid_id) references public.bids(id);

-- ─── Orders ───────────────────────────────────────────────────
create table public.orders (
  id              uuid primary key default uuid_generate_v4(),
  request_id      uuid not null references public.requests(id),
  bid_id          uuid not null references public.bids(id),
  status          text not null default 'processing'
                    check (status in ('processing', 'in_transit', 'active', 'delivered', 'disputed')),
  est_delivery    date,
  delivered_at    timestamptz,
  stripe_payment_intent text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── Reviews ──────────────────────────────────────────────────
create table public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id),
  reviewer_id uuid not null references public.profiles(id),
  vendor_id   uuid not null references public.profiles(id),
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now(),
  unique(order_id, reviewer_id)
);

-- Update vendor rating when a review is added
create or replace function update_vendor_rating()
returns trigger as $$
begin
  update public.profiles
  set
    rating = (
      select round(avg(rating)::numeric, 2)
      from public.reviews where vendor_id = new.vendor_id
    ),
    review_count = (
      select count(*) from public.reviews where vendor_id = new.vendor_id
    )
  where id = new.vendor_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert on public.reviews
  for each row execute function update_vendor_rating();

-- ─── Savings summary function ─────────────────────────────────
create or replace function get_savings_summary(p_buyer_id uuid)
returns table (
  category      text,
  total_spent   numeric,
  total_savings numeric,
  order_count   int
) as $$
begin
  return query
  select
    r.category,
    sum(b.amount)::numeric                              as total_spent,
    sum(r.budget - b.amount)::numeric                  as total_savings,
    count(*)::int                                       as order_count
  from public.orders o
  join public.bids b on b.id = o.bid_id
  join public.requests r on r.id = o.request_id
  where r.buyer_id = p_buyer_id
    and o.status != 'disputed'
  group by r.category
  order by total_savings desc;
end;
$$ language plpgsql security definer;

-- ─── Row Level Security ───────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.bids     enable row level security;
alter table public.orders   enable row level security;
alter table public.reviews  enable row level security;

-- Profiles: users see/edit only their own
create policy "profiles: own read"    on public.profiles for select using (true);
create policy "profiles: own update"  on public.profiles for update using (auth.uid() = id);

-- Requests: buyers manage their own; sellers see open ones
create policy "requests: buyer manage"  on public.requests for all    using (auth.uid() = buyer_id);
create policy "requests: sellers view"  on public.requests for select using (status = 'bidding');

-- Bids: vendors manage their own; buyers see bids on their requests
create policy "bids: vendor manage"  on public.bids for all    using (auth.uid() = vendor_id);
create policy "bids: buyer view"     on public.bids for select
  using (exists (
    select 1 from public.requests r
    where r.id = request_id and r.buyer_id = auth.uid()
  ));

-- Orders: visible to both buyer and seller
create policy "orders: buyer view" on public.orders for select
  using (exists (
    select 1 from public.requests r where r.id = request_id and r.buyer_id = auth.uid()
  ));
create policy "orders: seller view" on public.orders for select
  using (exists (
    select 1 from public.bids b where b.id = bid_id and b.vendor_id = auth.uid()
  ));

-- Reviews: anyone can read; reviewer manages their own
create policy "reviews: all read"   on public.reviews for select using (true);
create policy "reviews: own write"  on public.reviews for insert using (auth.uid() = reviewer_id);

-- ─── Indexes ──────────────────────────────────────────────────
create index idx_requests_buyer    on public.requests(buyer_id);
create index idx_requests_status   on public.requests(status);
create index idx_requests_category on public.requests(category);
create index idx_bids_request      on public.bids(request_id);
create index idx_bids_vendor       on public.bids(vendor_id);
create index idx_orders_request    on public.orders(request_id);
create index idx_reviews_vendor    on public.reviews(vendor_id);

-- ─── Enable Realtime ──────────────────────────────────────────
-- In Supabase dashboard → Database → Replication → enable for:
-- public.bids, public.requests, public.orders

-- ─── Seed data (optional, for testing) ───────────────────────
-- Uncomment to add sample categories reference data
-- insert into ... (add your own test data after signing up)

-- ============================================================
-- DONE. Now:
-- 1. Copy your Supabase URL + anon key into .env
-- 2. Run: npm run dev
-- 3. Sign up as a buyer or seller
-- ============================================================

-- ─── Memberships ──────────────────────────────────────────────
create table if not exists public.memberships (
  id                        uuid primary key default uuid_generate_v4(),
  user_id                   uuid not null references public.profiles(id) on delete cascade,
  plan_id                   text not null default 'buyer_free',
  status                    text not null default 'active'
                              check (status in ('active', 'cancelled', 'past_due')),
  stripe_subscription_id    text,
  stripe_customer_id        text,
  requests_used_this_month  int default 0,
  bids_used_this_month      int default 0,
  renews_at                 timestamptz,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now(),
  unique(user_id)
);

alter table public.memberships enable row level security;

create policy "memberships: own read"
  on public.memberships for select using (auth.uid() = user_id);

create policy "memberships: own update"
  on public.memberships for update using (auth.uid() = user_id);

create index idx_memberships_user on public.memberships(user_id);

-- Reset usage counts on 1st of each month
create or replace function reset_monthly_usage()
returns void as $$
begin
  update public.memberships
  set requests_used_this_month = 0,
      bids_used_this_month = 0,
      updated_at = now();
end;
$$ language plpgsql security definer;
