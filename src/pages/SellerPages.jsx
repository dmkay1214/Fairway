import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Btn, PageHeader, EmptyState, MetricCard } from '../components/UI.jsx'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES } from '../lib/data.js'

const fmt = n => '$' + Number(n || 0).toLocaleString()

export function SellerOpportunities() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [myBids, setMyBids] = useState([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: reqs } = await supabase.from('requests').select('*, buyer:profiles(org_name, location), bids(count)').eq('status', 'bidding').order('close_date', { ascending: true })
      setRequests(reqs || [])
      const { data: bids } = await supabase.from('bids').select('request_id').eq('vendor_id', user.id)
      setMyBids((bids || []).map(b => b.request_id))
      setLoading(false)
    }
    load()
  }, [])

  const cats = ['all', ...new Set(requests.map(r => r.category).filter(Boolean))]
  const shown = filter === 'all' ? requests : requests.filter(r => r.category === filter)

  return (
    <div className="fade-in">
      <PageHeader title="Opportunities" subtitle="Open requests from clubs looking for vendors" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {cats.map(c => {
          const cat = CATEGORIES.find(x => x.id === c)
          return <button key={c} onClick={() => setFilter(c)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', borderColor: filter===c?'var(--green-400)':'var(--slate-200)', background: filter===c?'var(--green-50)':'white', color: filter===c?'var(--green-700)':'var(--slate-600)' }}>{c==='all'?'All categories':(cat?.icon+' '+cat?.label)||c}</button>
        })}
      </div>
      {loading ? <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>
      : shown.length === 0 ? <EmptyState icon="🔍" title="No open requests" description="New requests from clubs will appear here. Check back soon!" />
      : shown.map(req => {
        const cat = CATEGORIES.find(c => c.id === req.category)
        const bidCount = req.bids?.[0]?.count || 0
        const alreadyBid = myBids.includes(req.id)
        return (
          <Card key={req.id} style={{padding:'18px 20px',marginBottom:12}}>
            <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
              <div style={{width:44,height:44,borderRadius:10,flexShrink:0,background:(cat?.color||'#888')+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{cat?.icon||'📦'}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <div style={{fontSize:14,fontWeight:600}}>{req.title}</div>
                  {alreadyBid && <Badge variant="success">✓ Bid submitted</Badge>}
                </div>
                <div style={{fontSize:12,color:'var(--slate-500)',marginBottom:4}}>{req.buyer?.org_name} · {req.buyer?.location||req.location}</div>
                {req.description && <div style={{fontSize:12,color:'var(--slate-400)',lineHeight:1.5}}>{req.description}</div>}
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{fmt(req.budget)}</div>
                <div style={{fontSize:11,color:'var(--slate-400)',marginBottom:10}}>{bidCount} bid{bidCount!==1?'s':''} · Closes {req.close_date}</div>
                {!alreadyBid && <Btn variant="primary" size="sm" onClick={() => navigate('/seller/bid/'+req.id)}>Submit bid</Btn>}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function SellerProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ org_name: '', location: '', categories: [] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}}) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({data}) => {
        setForm({ org_name: data?.org_name||'', location: data?.location||'', categories: data?.categories||[] })
        setLoading(false)
      })
    })
  }, [])

  const [connecting, setConnecting] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('connect') === 'success') {
      setStripeConnected(true)
    }
  }, [])

  // Check if already connected on load
  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}}) => {
      if (!user) return
      supabase.from('profiles').select('stripe_account_id').eq('id', user.id).single().then(({data}) => {
        if (data?.stripe_account_id) setStripeConnected(true)
      })
    })
  }, [])

  async function handleConnectStripe() {
    setConnecting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: { userId: user.id, email: user.email }
      })
      if (data?.url && data?.accountId) {
        await supabase.from('profiles').update({ stripe_account_id: data.accountId }).eq('id', user.id)
        window.location.href = data.url
      } else {
        throw new Error(error?.message || 'Failed to create Stripe account')
      }
    } catch(err) {
      alert('Error: ' + err.message)
      setConnecting(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    const {data:{user}} = await supabase.auth.getUser()
    await supabase.from('profiles').update({ org_name: form.org_name, location: form.location, categories: form.categories }).eq('id', user.id)
    setSaving(false)
    alert('Profile saved!')
  }

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>

  return (
    <div className="fade-in">
      <PageHeader title="My Profile" subtitle="How clubs see your business" />
      <Card style={{padding:'24px',maxWidth:600}}>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{fontSize:12,fontWeight:500,color:'var(--slate-500)',display:'block',marginBottom:6}}>Company name</label>
            <input value={form.org_name} onChange={e=>set('org_name',e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1px solid var(--slate-200)',borderRadius:8,fontSize:14,fontFamily:'var(--font-body)',outline:'none'}} placeholder="Gulf Shore Aggregates" />
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:500,color:'var(--slate-500)',display:'block',marginBottom:6}}>Location</label>
            <input value={form.location} onChange={e=>set('location',e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1px solid var(--slate-200)',borderRadius:8,fontSize:14,fontFamily:'var(--font-body)',outline:'none'}} placeholder="Naples, FL" />
          </div>
          <div>
            <label style={{fontSize:12,fontWeight:500,color:'var(--slate-500)',display:'block',marginBottom:8}}>Categories you supply</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {CATEGORIES.map(c => {
                const sel = form.categories.includes(c.id)
                return <button key={c.id} onClick={()=>set('categories',sel?form.categories.filter(x=>x!==c.id):[...form.categories,c.id])} style={{padding:'6px 12px',borderRadius:20,border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'var(--font-body)',borderColor:sel?'var(--green-500)':'var(--slate-200)',background:sel?'var(--green-50)':'white',color:sel?'var(--green-700)':'var(--slate-600)'}}>{c.icon} {c.label}</button>
              })}
            </div>
          </div>
          <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save profile'}</Btn>
          
          <div style={{borderTop:'1px solid var(--slate-100)',paddingTop:16,marginTop:4}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:4}}>Payment setup</div>
            <div style={{fontSize:12,color:'var(--slate-500)',marginBottom:12}}>Connect your bank account to receive payments when you win contracts. Fairway takes a 3% platform fee.</div>
            {stripeConnected ? (
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',background:'#f0fdf4',borderRadius:8,border:'1px solid #bbf7d0'}}>
                <span style={{color:'#16a34a',fontSize:14}}>✓</span>
                <span style={{fontSize:13,color:'#15803d',fontWeight:500}}>Stripe account connected — you can receive payments</span>
              </div>
            ) : (
              <button onClick={handleConnectStripe} disabled={connecting} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',background:connecting?'#94a3b8':'#635bff',color:'white',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:connecting?'not-allowed':'pointer',fontFamily:'var(--font-body)'}}>
                {connecting ? 'Redirecting to Stripe...' : '⚡ Connect Stripe account'}
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
