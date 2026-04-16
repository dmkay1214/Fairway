import React, { useState, useEffect } from 'react'
import { Card, Badge, PageHeader, MetricCard, Tabs, EmptyState } from '../components/UI.jsx'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES } from '../lib/data.js'

const fmt = n => '$' + Number(n||0).toLocaleString()

export function Orders() {
  const [tab, setTab] = useState('active')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}}) => {
      if (!user) return
      supabase.from('orders').select('*, request:requests(title,category,budget,buyer_id), bid:bids(amount, vendor:profiles(org_name,phone,contact_email,full_name))').order('created_at',{ascending:false}).then(({data}) => {
        setOrders((data||[]).filter(o=>o.request?.buyer_id===user.id))
        setLoading(false)
      })
    })
  }, [])
  const active = orders.filter(o=>o.status!=='delivered')
  const delivered = orders.filter(o=>o.status==='delivered')
  const shown = tab==='active' ? active : delivered
  return (
    <div className="fade-in">
      <PageHeader title="Orders" subtitle="Track all awarded contracts" />
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
        <MetricCard label="In progress" value={active.length} sub="Active orders" subColor="var(--blue-500)" />
        <MetricCard label="Total spend" value={fmt(orders.reduce((s,o)=>s+(o.bid?.amount||0),0))} sub="All orders" />
        <MetricCard label="Total saved" value={fmt(orders.reduce((s,o)=>{const sv=(o.request?.budget||0)-(o.bid?.amount||0);return s+(sv>0?sv:0)},0))} sub="vs budgets" />
      </div>
      <Tabs tabs={[{id:'active',label:'In Progress',count:active.length},{id:'delivered',label:'Delivered',count:delivered.length}]} active={tab} onChange={setTab} />
      {loading ? <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>
      : shown.length===0 ? <EmptyState icon="📦" title="No orders yet" description="When you award a bid, your order will appear here." />
      : shown.map(o => {
        const cat = CATEGORIES.find(c=>c.id===o.request?.category)
        const saved = (o.request?.budget||0)-(o.bid?.amount||0)
        const statusMap = {processing:{l:'Processing',v:'warning'},in_transit:{l:'In transit',v:'info'},active:{l:'Active',v:'success'},delivered:{l:'Delivered',v:'default'}}
        const si = statusMap[o.status]||{l:o.status,v:'default'}
        return (
          <Card key={o.id} style={{padding:'16px 20px',marginBottom:10}}>
            <div style={{display:'flex',gap:14,alignItems:'center'}}>
              <div style={{width:40,height:40,borderRadius:8,background:(cat?.color||'#888')+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{cat?.icon||'📦'}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,marginBottom:2}}>{o.request?.title||'Order'}</div>
                <div style={{fontSize:12,color:'var(--slate-400)'}}>{o.bid?.vendor?.org_name||'Vendor'}</div>
              </div>
              <div style={{display:'flex',gap:20,alignItems:'center'}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16,fontWeight:700}}>{fmt(o.bid?.amount)}</div>
                  {saved>0 && <div style={{fontSize:11,color:'var(--green-600)'}}>Saved {fmt(saved)}</div>}
                </div>
                <Badge variant={si.v}>{si.l}</Badge>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function Savings() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}}) => {
      if (!user) return
      supabase.from('orders').select('*, request:requests(title,category,budget,buyer_id), bid:bids(amount)').order('created_at',{ascending:false}).then(({data}) => {
        setOrders((data||[]).filter(o=>o.request?.buyer_id===user.id))
        setLoading(false)
      })
    })
  }, [])
  const totalSaved = orders.reduce((s,o)=>{const sv=(o.request?.budget||0)-(o.bid?.amount||0);return s+(sv>0?sv:0)},0)
  const totalSpend = orders.reduce((s,o)=>s+(o.bid?.amount||0),0)
  return (
    <div className="fade-in">
      <PageHeader title="Savings Report" subtitle="Your hard dollar savings vs original budgets" />
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
        <MetricCard label="Total saved" value={fmt(totalSaved)} sub="vs original budgets" />
        <MetricCard label="Total spend" value={fmt(totalSpend)} sub="Across all orders" subColor="var(--slate-400)" />
        <MetricCard label="Orders" value={orders.length} sub="Completed" subColor="var(--slate-400)" />
      </div>
      {loading ? <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>
      : orders.length===0 ? <EmptyState icon="📊" title="No savings data yet" description="Complete your first order to see savings here." />
      : <Card>
          <div style={{padding:'16px 20px',borderBottom:'1px solid var(--slate-50)'}}>
            <div style={{fontSize:13,fontWeight:600}}>Savings by order</div>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
            <thead><tr style={{background:'var(--slate-50)'}}>
              {['Item','Category','Budget','Paid','Saved'].map(h=><th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--slate-400)',textTransform:'uppercase'}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {orders.map(o=>{
                const saved=(o.request?.budget||0)-(o.bid?.amount||0)
                const cat=CATEGORIES.find(c=>c.id===o.request?.category)
                return <tr key={o.id} style={{borderBottom:'1px solid var(--slate-50)'}}>
                  <td style={{padding:'13px 16px',fontWeight:500}}>{o.request?.title||'Order'}</td>
                  <td style={{padding:'13px 16px',color:'var(--slate-500)'}}>{cat?.label||'—'}</td>
                  <td style={{padding:'13px 16px'}}>{fmt(o.request?.budget)}</td>
                  <td style={{padding:'13px 16px'}}>{fmt(o.bid?.amount)}</td>
                  <td style={{padding:'13px 16px',color:saved>0?'var(--green-600)':'var(--slate-400)',fontWeight:saved>0?600:400}}>{saved>0?fmt(saved):'—'}</td>
                </tr>
              })}
              <tr style={{background:'var(--slate-50)',fontWeight:700}}>
                <td colSpan={3} style={{padding:'13px 16px'}}>Total</td>
                <td style={{padding:'13px 16px'}}>{fmt(totalSpend)}</td>
                <td style={{padding:'13px 16px',color:'var(--green-600)'}}>{fmt(totalSaved)}</td>
              </tr>
            </tbody>
          </table>
        </Card>}
    </div>
  )
}

export function Vendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  useEffect(() => {
    supabase.from('profiles').select('*').eq('role','seller').order('created_at',{ascending:false}).then(({data}) => {
      setVendors(data||[])
      setLoading(false)
    })
  }, [])
  const cats = ['all', ...new Set(vendors.flatMap(v=>v.categories||[]))]
  const getState = (loc) => (loc||'').trim()
  const states = ['all', ...new Set(vendors.map(v => getState(v.location)).filter(Boolean))]
  const shown = vendors.filter(v => (filter==='all'||v.categories?.includes(filter)) && (stateFilter==='all'||getState(v.location)===stateFilter))
  return (
    <div className="fade-in">
      <PageHeader title="Vendor Directory" subtitle={vendors.length + ' vendors'} />
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={{padding:'6px 12px',borderRadius:'var(--radius-full)',border:'1px solid var(--slate-200)',fontSize:12,fontFamily:'var(--font-body)',outline:'none',background:'white',cursor:'pointer'}}>
          {states.map(s => <option key={s} value={s}>{s==='all'?'All locations':s}</option>)}
        </select>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {cats.map(c=>{
          const cat=CATEGORIES.find(x=>x.id===c)
          return <button key={c} onClick={()=>setFilter(c)} style={{padding:'6px 14px',borderRadius:'var(--radius-full)',border:'1px solid',fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'var(--font-body)',borderColor:filter===c?'var(--green-400)':'var(--slate-200)',background:filter===c?'var(--green-50)':'white',color:filter===c?'var(--green-700)':'var(--slate-600)'}}>{c==='all'?'All vendors':cat?.label||c}</button>
        })}
      </div>
      {loading ? <div style={{padding:40,textAlign:'center',color:'var(--slate-400)'}}>Loading...</div>
      : shown.length===0 ? <EmptyState icon="🏢" title="No vendors yet" description="Vendors will appear here as they sign up." />
      : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          {shown.map(v=>{
            const initials=(v.org_name||v.full_name||'V').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
            return <Card key={v.id} style={{padding:'18px 20px'}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'var(--green-100)',color:'var(--green-700)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:600,flexShrink:0}}>{initials}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600}}>{v.org_name||v.full_name}</div>
                  <div style={{fontSize:12,color:'var(--slate-400)',marginTop:2}}>{v.location}</div>
                </div>
                {v.verified && <Badge variant="success" size="sm">✓ Verified</Badge>}
              </div>
              {v.categories?.length>0 && <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{v.categories.map(c=>{const cat=CATEGORIES.find(x=>x.id===c);return <Badge key={c} size="sm">{cat?.icon} {cat?.label||c}</Badge>})}</div>}
            </Card>
          })}
        </div>}
    </div>
  )
}
