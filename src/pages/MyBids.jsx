import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { Card, Badge, PageHeader, EmptyState } from '../components/UI.jsx'
import { CATEGORIES } from '../lib/data.js'

const fmt = n => '$' + Number(n || 0).toLocaleString()

export default function MyBids() {
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('bids')
        .select('*, request:requests(title, budget, close_date, category, status, buyer:profiles(org_name, location))')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
      setBids(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate-400)' }}>Loading...</div>

  const pending = bids.filter(b => b.status === 'pending')
  const awarded = bids.filter(b => b.status === 'awarded')

  return (
    <div className="fade-in">
      <PageHeader title="My Bids" subtitle={bids.length + ' bids submitted'} />

      {bids.length === 0 ? (
        <EmptyState icon="📝" title="No bids yet" description="Browse opportunities and submit your first bid." action={<button onClick={() => navigate('/seller')} style={{ padding: '10px 20px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Browse opportunities</button>} />
      ) : (<>
        {pending.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-500)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pending ({pending.length})</div>
            {pending.map(bid => <BidCard key={bid.id} bid={bid} navigate={navigate} />)}
          </>
        )}
        {awarded.length > 0 && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-500)', marginBottom: 12, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>Awarded ({awarded.length})</div>
            {awarded.map(bid => <BidCard key={bid.id} bid={bid} navigate={navigate} />)}
          </>
        )}
      </>)}
    </div>
  )
}

function BidCard({ bid, navigate }) {
  const cat = CATEGORIES.find(c => c.id === bid.request?.category)
  const isAwarded = bid.status === 'awarded'
  const savings = (bid.request?.budget || 0) - bid.amount

  return (
    <Card style={{ padding: '18px 20px', marginBottom: 12, border: isAwarded ? '2px solid var(--green-400)' : '1px solid var(--slate-100)', cursor: 'pointer' }}
      onClick={() => isAwarded ? navigate('/seller/orders/' + bid.id) : null}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: (cat?.color || '#888') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cat?.icon || '📦'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{bid.request?.title}</div>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 4 }}>{bid.request?.buyer?.org_name} · {bid.request?.buyer?.location}</div>
          {bid.notes && <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{bid.notes}</div>}
          {bid.delivery_days && <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>🗓 {bid.delivery_days} day delivery</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{fmt(bid.amount)}</div>
          {savings > 0 && <div style={{ fontSize: 11, color: 'var(--green-600)', marginBottom: 4 }}>vs ${Number(bid.request?.budget||0).toLocaleString()} budget</div>}
          <Badge variant={isAwarded ? 'success' : 'warning'}>{isAwarded ? '🏆 Awarded' : 'Pending'}</Badge>
          {bid.request?.close_date && !isAwarded && <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>Closes {bid.request.close_date}</div>}
        </div>
      </div>
    </Card>
  )
}
