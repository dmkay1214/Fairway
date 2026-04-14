import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Badge, Btn, PageHeader, EmptyState } from '../components/UI.jsx'
import { supabase } from '../lib/supabase.js'

const fmt = n => '$' + Number(n||0).toLocaleString()

export default function Bids() {
  const [params] = useSearchParams()
  const [requests, setRequests] = useState([])
  const [selectedId, setSelectedId] = useState(params.get('req'))
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [awarding, setAwarding] = useState(null)
  const [awarded, setAwarded] = useState({})

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}}) => {
      if (!user) return
      supabase.from('requests').select('*').eq('buyer_id', user.id).eq('status','bidding').order('created_at',{ascending:false}).then(({data}) => {
        setRequests(data||[])
        if (data?.length > 0) setSelectedId(s => s || data[0].id)
        setLoading(false)
      })
    })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    supabase.from('bids').select('*, vendor:profiles(org_name,location,rating)').eq('request_id',selectedId).order('amount',{ascending:true}).then(({data}) => setBids(data||[]))
  }, [selectedId])

  const req = requests.find(r => r.id === selectedId)

  async function handleAward(bid) {
    if (req === undefined || req === null) { alert('No request selected'); return }
    setAwarding(bid.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      // Try to create payment session
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { bidId: bid.id, requestId: req.id, buyerEmail: user.email }
      })
      if (data?.url) {
        // Update records first
        await supabase.from('bids').update({status:'awarded'}).eq('id', bid.id)
        await supabase.from('requests').update({status:'awarded',awarded_bid_id:bid.id,awarded_amount:bid.amount}).eq('id', req.id)
        await supabase.from('orders').insert({request_id:req.id,bid_id:bid.id,status:'processing'})
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        // Vendor not connected to Stripe yet - award without payment
        await supabase.from('bids').update({status:'awarded'}).eq('id', bid.id)
        await supabase.from('requests').update({status:'awarded',awarded_bid_id:bid.id,awarded_amount:bid.amount}).eq('id', req.id)
        await supabase.from('orders').insert({request_id:req.id,bid_id:bid.id,status:'processing'})
        setAwarded(a => ({...a,[req.id]:bid.id}))
        setRequests(rs => rs.filter(r => r.id !== req.id))
        alert('Bid awarded! Note: vendor has not connected their payment account yet.')
      }
    } catch(err) {
      alert('Error: ' + err.message)
    }
    setAwarding(null)
  }

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>

  if (requests.length === 0) return (
    <div className="fade-in">
      <PageHeader title="Live Bids" subtitle="Compare vendor bids and award contracts" />
      <EmptyState icon="⚡" title="No active requests" description="Post a request to start receiving bids from vendors." />
    </div>
  )

  return (
    <div className="fade-in">
      <PageHeader title="Live Bids" subtitle="Compare vendor bids and award contracts" />
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        {requests.map(r => (
          <button key={r.id} onClick={() => setSelectedId(r.id)} style={{padding:'9px 14px',border:'1.5px solid',borderColor:selectedId===r.id?'var(--green-500)':'var(--slate-200)',background:selectedId===r.id?'var(--green-50)':'white',borderRadius:'var(--radius-md)',cursor:'pointer',fontSize:13,fontFamily:'var(--font-body)',fontWeight:selectedId===r.id?600:400,color:selectedId===r.id?'var(--green-700)':'var(--slate-600)'}}>
            {r.title}
          </button>
        ))}
      </div>
      {req && (
        <Card style={{padding:'16px 20px',marginBottom:20}}>
          <div style={{display:'flex',gap:20,alignItems:'center'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>{req.title}</div>
              <div style={{fontSize:12,color:'var(--slate-400)'}}>{req.description}</div>
            </div>
            <div style={{display:'flex',gap:20}}>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--slate-400)',marginBottom:2}}>Budget</div><div style={{fontSize:16,fontWeight:600}}>{fmt(req.budget)}</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--slate-400)',marginBottom:2}}>Bids</div><div style={{fontSize:16,fontWeight:600}}>{bids.length}</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,color:'var(--slate-400)',marginBottom:2}}>Closes</div><div style={{fontSize:14,fontWeight:500}}>{req.close_date}</div></div>
            </div>
          </div>
        </Card>
      )}
      {bids.length === 0 ? (
        <EmptyState icon="⏳" title="No bids yet" description="Vendors will submit bids here. Most requests get their first bid within 2 hours." />
      ) : bids.map((bid, i) => {
        const isLowest = i === 0
        const savings = (req?.budget||0) - bid.amount
        const isAwarded = awarded[req?.id] === bid.id
        const initials = (bid.vendor?.org_name||'V').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
        return (
          <Card key={bid.id} style={{padding:'18px 20px',marginBottom:12,border:isLowest?'2px solid var(--green-400)':'1px solid var(--slate-100)'}}>
            <div style={{display:'flex',gap:14,alignItems:'center'}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'var(--green-100)',color:'var(--green-700)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,flexShrink:0}}>{initials}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                  <div style={{fontSize:14,fontWeight:600}}>{bid.vendor?.org_name||'Vendor'}</div>
                  {isLowest && <Badge variant="success">Lowest bid</Badge>}
                  {isAwarded && <Badge variant="success">Awarded</Badge>}
                </div>
                <div style={{fontSize:12,color:'var(--slate-500)'}}>{bid.vendor?.location}</div>
                {bid.notes && <div style={{fontSize:12,color:'var(--slate-500)',marginTop:2}}>{bid.notes}</div>}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:24,fontWeight:700}}>{fmt(bid.amount)}</div>
                {savings > 0 && <div style={{fontSize:12,color:'var(--green-600)',marginBottom:8}}>Save {fmt(savings)}</div>}
                {!isAwarded && !awarded[req?.id] && (
                  <Btn variant={isLowest?'primary':'default'} size="sm" disabled={awarding===bid.id} onClick={() => handleAward(bid)}>
                    {awarding===bid.id?'Awarding...':'Award bid'}
                  </Btn>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
