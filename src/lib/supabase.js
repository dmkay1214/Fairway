import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Auth ─────────────────────────────────────────────────────

export async function signUp({ email, password, fullName, role, orgName, location, categories }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, org_name: orgName, location, categories },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}

// ─── Profile ──────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Requests ─────────────────────────────────────────────────

export async function getRequests(buyerId) {
  const { data, error } = await supabase
    .from('requests')
    .select('*, bids(count)')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getRequestById(id) {
  const { data, error } = await supabase
    .from('requests')
    .select('*, bids(*, vendor:profiles(*))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createRequest(request) {
  const { data, error } = await supabase
    .from('requests')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getOpenRequests(category) {
  let query = supabase
    .from('requests')
    .select('*, buyer:profiles(org_name, location), bids(count)')
    .eq('status', 'bidding')
    .order('close_date', { ascending: true })
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  return data
}

// ─── Bids ─────────────────────────────────────────────────────

export async function getBidsForRequest(requestId) {
  const { data, error } = await supabase
    .from('bids')
    .select('*, vendor:profiles(*)')
    .eq('request_id', requestId)
    .order('amount', { ascending: true })
  if (error) throw error
  return data
}

export async function createBid(bid) {
  const { data, error } = await supabase
    .from('bids')
    .insert(bid)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function awardBid(bidId, requestId) {
  const { data: bid } = await supabase.from('bids').select('amount').eq('id', bidId).single()
  await supabase.from('bids').update({ status: 'awarded' }).eq('id', bidId)
  await supabase.from('requests').update({ status: 'awarded', awarded_bid_id: bidId, awarded_amount: bid.amount }).eq('id', requestId)
  await supabase.from('orders').insert({ request_id: requestId, bid_id: bidId, status: 'processing' })
}

// ─── Orders ───────────────────────────────────────────────────

export async function getOrders(buyerId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, request:requests(title, category, budget, buyer_id), bid:bids(amount, vendor:profiles(org_name))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data?.filter(o => o.request?.buyer_id === buyerId) || []
}

// ─── Vendors ──────────────────────────────────────────────────

export async function getVendors(category) {
  let query = supabase.from('profiles').select('*').eq('role', 'seller').order('rating', { ascending: false })
  if (category) query = query.contains('categories', [category])
  const { data, error } = await query
  if (error) throw error
  return data
}

// ─── Membership ───────────────────────────────────────────────

export async function getMembership(userId) {
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export async function updateMembership(userId, updates) {
  const { data, error } = await supabase
    .from('memberships')
    .upsert({ user_id: userId, ...updates })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Realtime ─────────────────────────────────────────────────

export function subscribeToBids(requestId, callback) {
  return supabase
    .channel(`bids:${requestId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `request_id=eq.${requestId}` }, callback)
    .subscribe()
}


// ─── Auth helpers ────────────────────────────────────────────────────────────

export async function signUp({ email, password, fullName, role, orgName, location }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role, org_name: orgName, location },
    },
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session))
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Requests ────────────────────────────────────────────────────────────────

export async function getRequests(buyerId) {
  const { data, error } = await supabase
    .from('requests')
    .select(`*, bids(count)`)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getRequestById(id) {
  const { data, error } = await supabase
    .from('requests')
    .select(`*, bids(*, vendor:profiles(*))`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createRequest(request) {
  const { data, error } = await supabase
    .from('requests')
    .insert(request)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateRequest(id, updates) {
  const { data, error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Open requests visible to sellers (not their own, not awarded)
export async function getOpenRequests({ category, radius } = {}) {
  let query = supabase
    .from('requests')
    .select(`*, buyer:profiles(org_name, location), bids(count)`)
    .eq('status', 'bidding')
    .order('close_date', { ascending: true })
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  return data
}

// ─── Bids ─────────────────────────────────────────────────────────────────────

export async function getBidsForRequest(requestId) {
  const { data, error } = await supabase
    .from('bids')
    .select(`*, vendor:profiles(*)`)
    .eq('request_id', requestId)
    .order('amount', { ascending: true })
  if (error) throw error
  return data
}

export async function createBid(bid) {
  const { data, error } = await supabase
    .from('bids')
    .insert(bid)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function awardBid(bidId, requestId) {
  // Mark bid as awarded
  const { error: bidError } = await supabase
    .from('bids')
    .update({ status: 'awarded' })
    .eq('id', bidId)
  if (bidError) throw bidError

  // Get bid amount for savings calc
  const { data: bid } = await supabase.from('bids').select('amount').eq('id', bidId).single()

  // Update request status
  const { error: reqError } = await supabase
    .from('requests')
    .update({ status: 'awarded', awarded_bid_id: bidId, awarded_amount: bid.amount })
    .eq('id', requestId)
  if (reqError) throw reqError

  // Create order
  const { error: orderError } = await supabase
    .from('orders')
    .insert({ request_id: requestId, bid_id: bidId, status: 'processing' })
  if (orderError) throw orderError
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(buyerId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, request:requests(*, category, budget), bid:bids(amount, vendor:profiles(org_name))`)
    .eq('requests.buyer_id', buyerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

export async function getVendors({ category } = {}) {
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'seller')
    .eq('verified', true)
    .order('rating', { ascending: false })
  if (category) query = query.contains('categories', [category])
  const { data, error } = await query
  if (error) throw error
  return data
}

// ─── Savings ─────────────────────────────────────────────────────────────────

export async function getSavingsSummary(buyerId) {
  const { data, error } = await supabase.rpc('get_savings_summary', { p_buyer_id: buyerId })
  if (error) throw error
  return data
}

// ─── Real-time subscriptions ─────────────────────────────────────────────────

export function subscribeToBids(requestId, callback) {
  return supabase
    .channel(`bids:${requestId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'bids',
      filter: `request_id=eq.${requestId}`,
    }, callback)
    .subscribe()
}

export function subscribeToRequests(callback) {
  return supabase
    .channel('requests')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'requests',
    }, callback)
    .subscribe()
}
