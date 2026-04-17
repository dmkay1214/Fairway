import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Btn, PageHeader, Tabs, EmptyState } from '../components/UI.jsx'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES } from '../lib/data.js'

export default function Requests({ onNewRequest }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('active')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('requests').select('*, bids(count)').eq('buyer_id', user.id).order('created_at', { ascending: false })
      setRequests(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const active = requests.filter(r => r.status === 'bidding')
  const awarded = requests.filter(r => r.status === 'awarded')
  const shown = tab === 'active' ? active : awarded

  return (
    <div className="fade-in">
      <PageHeader title="My Requests" subtitle="Manage your procurement requests" actions={<Btn variant="primary" onClick={onNewRequest}>+ Post Request</Btn>} />
      <Tabs tabs={[{id:'active',label:'Active',count:active.length},{id:'awarded',label:'Awarded',count:awarded.length}]} active={tab} onChange={setTab} />
      {loading ? <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>
      : shown.length === 0 ? (
        <EmptyState icon="📋" title={tab === 'active' ? 'No active requests' : 'No awarded requests yet'} description={tab === 'active' ? 'Post a request to start getting competing bids.' : 'Award a bid to see it here.'} action={tab === 'active' && <Btn variant="primary" onClick={onNewRequest}>+ Post your first request</Btn>} />
      ) : shown.map(req => {
        const bidCount = req.bids?.[0]?.count || 0
        const cat = CATEGORIES.find(c => c.id === req.category)
        return (
          <div key={req.id} style={{marginBottom:12,padding:'18px 20px',cursor:'pointer',background:'white',borderRadius:12,border:'1px solid var(--slate-100)',boxShadow:'var(--shadow-sm)'}} onClick={() => navigate('/requests/' + req.id)}>
            <div style={{display:'flex',gap:14,alignItems:'flex-start'}}>
              <div style={{width:44,height:44,borderRadius:10,flexShrink:0,background:(cat?.color||'#888')+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{cat?.icon||'📦'}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <div style={{fontSize:14,fontWeight:600}}>{req.title}</div>
                  <Badge variant={req.status==='bidding'?'warning':'success'}>{req.status==='bidding'?'Bidding open':'Awarded'}</Badge>
                </div>
                <div style={{fontSize:12,color:'var(--slate-400)'}}>${Number(req.budget||0).toLocaleString()} · Closes {req.close_date}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <Badge variant={bidCount>0?'info':'default'}>{bidCount} bid{bidCount!==1?'s':''}</Badge>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
