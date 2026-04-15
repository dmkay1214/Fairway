import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

const fmt = n => '$' + Number(n || 0).toLocaleString()

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid var(--slate-100)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: color || 'var(--slate-900)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [bids, setBids] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: profiles },
        { data: reqs },
        { data: bidsData },
        { data: ordersData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('requests').select('*, buyer:profiles(org_name)').order('created_at', { ascending: false }),
        supabase.from('bids').select('*, vendor:profiles(org_name, full_name)').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, bid:bids(amount)').order('created_at', { ascending: false }),
      ])

      setUsers(profiles || [])
      setRequests(reqs || [])
      setBids(bidsData || [])
      setOrders(ordersData || [])

      const buyers = (profiles || []).filter(p => p.role === 'buyer').length
      const vendors = (profiles || []).filter(p => p.role === 'seller').length
      const totalVolume = (ordersData || []).reduce((sum, o) => sum + (o.bid?.amount || 0), 0)
      const fairwayRevenue = totalVolume * 0.03

      setStats({ buyers, vendors, totalRequests: (reqs || []).length, totalBids: (bidsData || []).length, totalVolume, fairwayRevenue })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate-400)' }}>Loading admin data...</div>

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Dashboard</div>
        <div style={{ fontSize: 13, color: 'var(--slate-400)' }}>Platform overview — Fairway Procurement LLC</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total buyers" value={stats.buyers} sub="Golf clubs" color="var(--green-600)" />
        <StatCard label="Total vendors" value={stats.vendors} sub="Suppliers" color="var(--blue-500)" />
        <StatCard label="Total requests" value={stats.totalRequests} sub="Posted" />
        <StatCard label="Total bids" value={stats.totalBids} sub="Submitted" />
        <StatCard label="Transaction volume" value={fmt(stats.totalVolume)} sub="All time" />
        <StatCard label="Fairway revenue (3%)" value={fmt(stats.fairwayRevenue)} sub="Platform fees" color="var(--green-600)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Buyers */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--slate-100)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-50)', fontSize: 13, fontWeight: 700 }}>Golf Clubs ({users.filter(u => u.role === 'buyer').length})</div>
          <div>
            {users.filter(u => u.role === 'buyer').slice(0, 8).map(u => (
              <div key={u.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--slate-50)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: u.role === 'buyer' ? 'var(--green-100)' : 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: u.role === 'buyer' ? 'var(--green-700)' : 'var(--blue-500)', flexShrink: 0 }}>
                  {u.role === 'buyer' ? 'B' : 'V'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.org_name || u.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{u.role === 'buyer' ? 'Club' : 'Vendor'} · {u.location || 'No location'}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--slate-300)', flexShrink: 0 }}>{new Date(u.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--slate-100)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-50)', fontSize: 13, fontWeight: 700 }}>Vendors ({users.filter(u => u.role === 'seller').length})</div>
          <div>
            {users.filter(u => u.role === 'seller').map(u => (
              <div key={u.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--slate-50)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--blue-500)', flexShrink: 0 }}>V</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.org_name || u.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{u.location || 'No location'} · Joined {new Date(u.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: u.stripe_account_id ? '#dcfce7' : '#fee2e2', color: u.stripe_account_id ? '#16a34a' : '#dc2626', fontWeight: 500, flexShrink: 0 }}>
                  {u.stripe_account_id ? 'Stripe ✓' : 'No Stripe'}
                </div>
              </div>
            ))}
            {users.filter(u => u.role === 'seller').length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--slate-400)', fontSize: 13 }}>No vendors yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent bids */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--slate-100)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-50)', fontSize: 13, fontWeight: 700 }}>Recent bids</div>
        <div>
          {bids.slice(0, 8).map(b => (
            <div key={b.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--slate-50)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{b.vendor?.org_name || b.vendor?.full_name || 'Unknown vendor'}</div>
                <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{new Date(b.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-600)' }}>${Number(b.amount || 0).toLocaleString()}</div>
              <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: b.status === 'awarded' ? '#dcfce7' : '#f1f5f9', color: b.status === 'awarded' ? '#16a34a' : 'var(--slate-500)', fontWeight: 500 }}>{b.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
