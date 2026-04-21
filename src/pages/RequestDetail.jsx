import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { Card, Badge, Btn } from '../components/UI.jsx'
import { CATEGORIES } from '../lib/data.js'

const fmt = n => '$' + Number(n || 0).toLocaleString()

export default function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [awarding, setAwarding] = useState(null)
  const [view, setView] = useState('cards')

  useEffect(() => {
    async function load() {
      const { data: req } = await supabase.from('requests').select('*').eq('id', id).single()
      const { data: bidsData } = await supabase.from('bids').select('*, vendor_id, vendor:profiles(org_name, full_name, location, categories)').eq('request_id', id).order('amount', { ascending: true })
      setRequest(req)
      setBids(bidsData || [])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleAward(bid) {
    setAwarding(bid.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.functions.invoke('create-payment-intent', {
        body: { bidId: bid.id, requestId: id, buyerEmail: user.email }
      })
      if (data?.url) {
        await supabase.from('bids').update({ status: 'awarded' }).eq('id', bid.id)
        await supabase.from('requests').update({ status: 'awarded', awarded_bid_id: bid.id, awarded_amount: bid.amount }).eq('id', id)
        await supabase.from('orders').insert({ request_id: id, bid_id: bid.id, status: 'processing' })
        await supabase.functions.invoke('send-email', { body: { type: 'bid_awarded', bidId: bid.id, requestId: id } })
        window.location.href = data.url
      } else {
        await supabase.from('bids').update({ status: 'awarded' }).eq('id', bid.id)
        await supabase.from('requests').update({ status: 'awarded', awarded_bid_id: bid.id, awarded_amount: bid.amount }).eq('id', id)
        await supabase.from('orders').insert({ request_id: id, bid_id: bid.id, status: 'processing' })
        await supabase.functions.invoke('send-email', { body: { type: 'bid_awarded', bidId: bid.id, requestId: id } })
        alert('Bid awarded! Note: vendor has not connected their payment account yet.')
        navigate('/requests')
      }
    } catch(err) {
      alert('Error: ' + err.message)
    }
    setAwarding(null)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate-400)' }}>Loading...</div>
  if (!request) return <div style={{ padding: 40, textAlign: 'center' }}>Request not found</div>

  const cat = CATEGORIES.find(c => c.id === request.category)
  const lowestBid = bids.length > 0 ? Math.min(...bids.map(b => b.amount)) : null

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <button onClick={() => navigate('/requests')} style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>Back to requests</button>

      <Card style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: (cat?.color || '#888') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{cat?.icon || '📦'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{request.title}</div>
            <div style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 8 }}>{cat?.label || request.category} · Closes {request.close_date}</div>
            {request.description && <div style={{ fontSize: 13, color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: 12 }}>{request.description}</div>}
            <div style={{ display: 'flex', gap: 20 }}>
              <div><div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Budget</div><div style={{ fontSize: 16, fontWeight: 700 }}>{fmt(request.budget)}</div></div>
              <div><div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Bids received</div><div style={{ fontSize: 16, fontWeight: 700 }}>{bids.length}</div></div>
              {lowestBid && <div><div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Lowest bid</div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-600)' }}>{fmt(lowestBid)}</div></div>}
              <div><div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Status</div><Badge variant={request.status === 'bidding' ? 'warning' : 'success'}>{request.status}</Badge></div>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          {bids.length === 0 ? 'No bids yet' : bids.length + ' bid' + (bids.length > 1 ? 's' : '') + ' received'}
        </div>
        {bids.length > 1 && (
          <div style={{ display: 'flex', gap: 4, background: 'var(--slate-100)', borderRadius: 8, padding: 4 }}>
            <button onClick={() => setView('cards')} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: view === 'cards' ? 'white' : 'transparent', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cards</button>
            <button onClick={() => setView('compare')} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: view === 'compare' ? 'white' : 'transparent', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Compare</button>
          </div>
        )}
      </div>

      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'none' }}>
        {bids.length === 0 ? 'No bids yet' : bids.length + ' bid' + (bids.length > 1 ? 's' : '') + ' received'}
      </div>

      {view === 'compare' && bids.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: 20 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--slate-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Vendor</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--slate-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Bid Amount</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--slate-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Savings</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--slate-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Delivery</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--slate-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Location</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--slate-500)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid, i) => {
                const isLowest = bid.amount === lowestBid
                const savings = request.budget - bid.amount
                const isAwarded = bid.status === 'awarded'
                return (
                  <tr key={bid.id} style={{ borderBottom: '1px solid var(--slate-100)', background: isLowest ? 'var(--green-50)' : 'white' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span onClick={() => navigate('/vendor/'+bid.vendor_id)} style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--green-700)', textDecoration: 'underline' }}>{bid.vendor?.org_name || 'Vendor'}</span>
                        {isLowest && <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--green-100)', color: 'var(--green-700)', borderRadius: 10, fontWeight: 600 }}>LOWEST</span>}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: 15 }}>{fmt(bid.amount)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: savings > 0 ? 'var(--green-600)' : 'var(--slate-400)', fontWeight: 500 }}>{savings > 0 ? fmt(savings) : '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--slate-500)' }}>{bid.delivery_days ? bid.delivery_days + ' days' : '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--slate-500)' }}>{bid.vendor?.location || '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {!isAwarded && request.status === 'bidding' && (
                        <Btn variant={isLowest ? 'primary' : 'default'} size="sm" disabled={awarding === bid.id} onClick={() => handleAward(bid)}>
                          {awarding === bid.id ? '...' : 'Award'}
                        </Btn>
                      )}
                      {isAwarded && <span style={{ fontSize: 12, color: 'var(--green-600)', fontWeight: 600 }}>✓ Awarded</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {bids.length === 0 ? (
        <Card style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Waiting for bids</div>
          <div style={{ fontSize: 13, color: 'var(--slate-400)' }}>Vendors will submit bids before the close date.</div>
        </Card>
      ) : bids.map((bid) => {
        const isLowest = bid.amount === lowestBid
        const savings = request.budget - bid.amount
        const initials = (bid.vendor?.org_name || 'V').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        const isAwarded = bid.status === 'awarded'
        return (
          <Card key={bid.id} style={{ padding: '18px 20px', marginBottom: 12, border: isLowest ? '2px solid var(--green-400)' : '1px solid var(--slate-100)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <div onClick={() => navigate('/vendor/'+bid.vendor_id)} style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--green-700)', textDecoration: 'underline' }}>{bid.vendor?.org_name || 'Vendor'}</div>
                  {isLowest && <Badge variant="success">Lowest bid</Badge>}
                  {isAwarded && <Badge variant="success">Awarded</Badge>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 4 }}>{bid.vendor?.location}</div>
                {bid.notes && <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{bid.notes}</div>}
                {bid.delivery_days && <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>🗓 {bid.delivery_days} day delivery</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{fmt(bid.amount)}</div>
                {savings > 0 && <div style={{ fontSize: 11, color: 'var(--green-600)', marginBottom: 8 }}>Save {fmt(savings)}</div>}
                {!isAwarded && request.status === 'bidding' && (
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--slate-400)', marginBottom: 4, textAlign: 'right', lineHeight: 1.4 }}>Contact info revealed after transaction</div>
                    <Btn variant={isLowest ? 'primary' : 'default'} size="sm" disabled={awarding === bid.id} onClick={() => handleAward(bid)}>
                      {awarding === bid.id ? 'Awarding...' : 'Award bid'}
                    </Btn>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
