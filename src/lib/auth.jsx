import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, getProfile, onAuthChange } from './supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadProfile(data.session.user.id)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthChange((session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    try {
      const p = await getProfile(userId)
      setProfile(p)
    } catch {
      // Profile might not exist yet on first sign-up
      setProfile(null)
    }
  }

  const value = {
    session,
    profile,
    user: session?.user ?? null,
    role: profile?.role ?? 'buyer',
    isLoading: session === undefined,
    isAuthed: !!session,
    refreshProfile: () => session && loadProfile(session.user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// ─── Data hooks ───────────────────────────────────────────────────────────────

import {
  getRequests, getOpenRequests, getRequestById,
  createRequest, updateRequest,
  getBidsForRequest, createBid, awardBid,
  getOrders, getVendors, getSavingsSummary,
  subscribeToBids, subscribeToRequests,
} from './supabase.js'

function useAsync(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      setData(result)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}

export function useRequests() {
  const { user } = useAuth()
  return useAsync(() => user ? getRequests(user.id) : Promise.resolve([]), [user?.id])
}

export function useRequest(id) {
  const hook = useAsync(() => id ? getRequestById(id) : null, [id])

  useEffect(() => {
    if (!id) return
    const channel = subscribeToBids(id, () => hook.refetch())
    return () => supabase.removeChannel(channel)
  }, [id])

  return hook
}

export function useOpenRequests(category) {
  return useAsync(() => getOpenRequests({ category }), [category])
}

export function useBids(requestId) {
  const hook = useAsync(() => requestId ? getBidsForRequest(requestId) : null, [requestId])

  useEffect(() => {
    if (!requestId) return
    const channel = subscribeToBids(requestId, () => hook.refetch())
    return () => supabase.removeChannel(channel)
  }, [requestId])

  return hook
}

export function useOrders() {
  const { user } = useAuth()
  return useAsync(() => user ? getOrders(user.id) : [], [user?.id])
}

export function useVendors(category) {
  return useAsync(() => getVendors({ category }), [category])
}

export function useSavings() {
  const { user } = useAuth()
  return useAsync(() => user ? getSavingsSummary(user.id) : null, [user?.id])
}

export function useCreateRequest() {
  const { user } = useAuth()
  return async (requestData) => {
    return createRequest({ ...requestData, buyer_id: user.id })
  }
}

export function useCreateBid() {
  const { user } = useAuth()
  return async (bidData) => {
    return createBid({ ...bidData, vendor_id: user.id })
  }
}

export function useAwardBid() {
  return awardBid
}
