import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Btn, PageHeader, EmptyState, MetricCard } from '../components/UI.jsx'
import { supabase } from '../lib/supabase.js'

const fmtMoney = n => '$' + Number(n || 0).toLocaleString()

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard({ onNewRequest }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      const { data: reqs } = await supabase.from('requests').select('*, bids(count)').eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(5)
      setRequests(reqs || [])
      setLoading(false)
    }
    load()
  }, [])

  const active = requests.filter(r => r.status === 'bidding')
  const name = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const orgName = profile?.org_name || user?.user_metadata?.org_name || ''
  const location = profile?.location || user?.user_metadata?.location || ''

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>

  return (
    <div className="fade-in">
      <PageHeader
        title={getGreeting() + ', ' + name}
        subtitle={[orgName, location].filter(Boolean).join(' · ')}
        actions={<Btn variant="primary" onClick={onNewRequest}>+ Post Request</Btn>}
      />
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
        <MetricCard label="Active requests" value={active.length} sub={active.length > 0 ? 'Receiving bids' : 'Post a request to start'} />
        <MetricCard label="Total requests" value={requests.length} sub="All time" subColor="var(--slate-400)" />
        <MetricCard label="Platform" value="Fairway" sub="Golf procurement marketplace" subColor="var(--slate-400)" />
      </div>
      <Card>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--slate-50)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:13,fontWeight:600}}>Your requests</div>
          {requests.length > 0 && <Btn size="sm" variant="ghost" onClick={() => navigate('/requests')}>View all →</Btn>}
        </div>
        {active.length === 0 ? (
          <EmptyState icon="📋" title="No active requests yet" description="Post your first request and get competing bids from verified vendors within hours." action={<Btn variant="primary" onClick={onNewRequest}>+ Post your first request</Btn>} />
        ) : active.map(req => {
          const bidCount = req.bids?.[0]?.count || 0
          return (
            <div key={req.id} onClick={() => navigate('/bids?req=' + req.id)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:'1px solid var(--slate-50)',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='var(--slate-50)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{req.title}</div>
                <div style={{fontSize:11,color:'var(--slate-400)'}}>Budget ${Number(req.budget||0).toLocaleString()} · Closes {req.close_date}</div>
              </div>
              <Badge variant={bidCount > 0 ? 'warning' : 'info'}>{bidCount} bid{bidCount !== 1 ? 's' : ''}</Badge>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
