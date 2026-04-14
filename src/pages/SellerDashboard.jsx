import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Btn, PageHeader, EmptyState, MetricCard } from '../components/UI.jsx'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES } from '../lib/data.js'

const fmt = n => '$' + Number(n || 0).toLocaleString()

export default function SellerDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [opportunities, setOpportunities] = useState([])
  const [myBids, setMyBids] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      const { data: reqs } = await supabase.from('requests').select('*, buyer:profiles(org_name, location), bids(count)').eq('status', 'bidding').order('created_at', { ascending: false }).limit(5)
      setOpportunities(reqs || [])
      const { data: bids } = await supabase.from('bids').select('*, request:requests(title, category, budget, status, buyer:profiles(org_name))').eq('vendor_id', user.id).order('created_at', { ascending: false }).limit(5)
      setMyBids(bids || [])
      setLoading(false)
    }
    load()
  }, [])

  const wonBids = myBids.filter(b => b.status === 'awarded')
  const totalRevenue = wonBids.reduce((s, b) => s + (b.amount || 0), 0)
  const name = profile?.full_name?.split(' ')[0] || 'there'
  const orgName = profile?.org_name || 'My Company'
  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>

  return (
    <div className="fade-in">
      <PageHeader title={`${greeting}, ${name}`} subtitle={`${orgName} · Vendor Portal`} actions={<Btn variant="primary" onClick={() => navigate('/seller')}>Browse opportunities →</Btn>} />
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        <MetricCard label="Open opportunities" value={opportunities.length} sub="Accepting bids" subColor="var(--blue-500)" />
        <MetricCard label="Bids submitted" value={myBids.length} sub="All time" subColor="var(--slate-400)" />
        <MetricCard label="Contracts won" value={wonBids.length} sub="Awarded bids" subColor="var(--green-600)" />
        <MetricCard label="Total revenue" value={fmt(totalRevenue)} sub="From won contracts" subColor="var(--slate-400)" />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--slate-50)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:13,fontWeight:600}}>New opportunities</div>
            <Btn size="sm" variant="ghost" onClick={() => navigate('/seller')}>View all →</Btn>
          </div>
          {opportunities.length === 0 ? <EmptyState icon="🔍" title="No open requests yet" description="Club requests will appear here." />
          : opportunities.map(req => {
            const cat = CATEGORIES.find(c => c.id === req.category)
            const bidCount = req.bids?.[0]?.count || 0
            return (
              <div key={req.id} onClick={() => navigate('/seller')} style={{display:'flex',gap:12,padding:'14px 20px',borderBottom:'1px solid var(--slate-50)',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='var(--slate-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:36,height:36,borderRadius:8,background:(cat?.color||'#888')+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{cat?.icon||'📦'}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{req.title}</div>
                  <div style={{fontSize:11,color:'var(--slate-400)'}}>{req.buyer?.org_name} · {bidCount} bid{bidCount!==1?'s':''}</div>
                </div>
                <div style={{fontSize:14,fontWeight:700,flexShrink:0}}>{fmt(req.budget)}</div>
              </div>
            )
          })}
        </Card>
        <Card>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--slate-50)'}}>
            <div style={{fontSize:13,fontWeight:600}}>My bids</div>
          </div>
          {myBids.length === 0 ? <EmptyState icon="📝" title="No bids yet" description="Submit your first bid on an open opportunity." action={<Btn variant="primary" size="sm" onClick={() => navigate('/seller')}>Browse opportunities</Btn>} />
          : myBids.map(bid => {
            const cat = CATEGORIES.find(c => c.id === bid.request?.category)
            const isWon = bid.status === 'awarded'
            return (
              <div key={bid.id} style={{display:'flex',gap:12,padding:'14px 20px',borderBottom:'1px solid var(--slate-50)',alignItems:'center'}}>
                <div style={{width:36,height:36,borderRadius:8,background:(cat?.color||'#888')+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{cat?.icon||'📦'}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{bid.request?.title}</div>
                  <div style={{fontSize:11,color:'var(--slate-400)'}}>{bid.request?.buyer?.org_name}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{fmt(bid.amount)}</div>
                  <Badge variant={isWon?'success':'warning'}>{isWon?'✓ Won':'Pending'}</Badge>
                </div>
              </div>
            )
          })}
        </Card>
      </div>
      {(!profile?.categories?.length || !profile?.org_name) && (
        <Card style={{marginTop:20,padding:'16px 20px',background:'#fffbeb',border:'1px solid #fde68a'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#92400e',marginBottom:2}}>Complete your profile</div>
              <div style={{fontSize:12,color:'#b45309'}}>Add your company name and categories so clubs can find you</div>
            </div>
            <Btn size="sm" onClick={() => navigate('/seller/profile')}>Complete profile →</Btn>
          </div>
        </Card>
      )}
    </div>
  )
}
