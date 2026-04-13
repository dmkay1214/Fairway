import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricCard, Card, Badge, Avatar, Stars, PageHeader, Btn } from '../components/UI.jsx'
import { REQUESTS, SAVINGS_DATA, CATEGORY_SAVINGS, VENDORS } from '../lib/data.js'

const fmtMoney = n => '$' + n.toLocaleString()

export default function Dashboard({ onNewRequest }) {
  const navigate = useNavigate()
  const activeRequests = REQUESTS.filter(r => r.status === 'bidding')
  const totalSavings = 84200
  const avgDiscount = 18.4

  return (
    <div className="fade-in">
      <PageHeader
        title="Good morning, James"
        subtitle="Pine Valley Country Club · Naples, FL"
        actions={<Btn variant="primary" onClick={onNewRequest}>+ Post Request</Btn>}
      />

      {/* Metrics */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <MetricCard label="Saved this year" value={fmtMoney(totalSavings)} sub="↑ 23% vs prior contracts" />
        <MetricCard label="Active requests" value={activeRequests.length} sub={`${activeRequests.reduce((s,r)=>s+r.bids.length,0)} bids incoming`} subColor="var(--blue-500)" />
        <MetricCard label="Avg discount rate" value={avgDiscount + '%'} sub="Across all categories" />
        <MetricCard label="Verified vendors" value="312" sub="9 categories covered" subColor="var(--slate-400)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Savings chart */}
        <Card style={{ padding: '20px 20px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Monthly savings</div>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 16 }}>Jul – Dec 2025</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={SAVINGS_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green-400)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--green-400)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} tickFormatter={v => '$'+v/1000+'k'} />
              <Tooltip formatter={v => ['$'+v.toLocaleString(), 'Saved']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--slate-100)' }} />
              <Area type="monotone" dataKey="savings" stroke="var(--green-500)" strokeWidth={2} fill="url(#savGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category savings */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Savings by category</div>
          {CATEGORY_SAVINGS.map((c, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--slate-600)' }}>{c.category}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-600)' }}>{fmtMoney(c.savings)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--slate-100)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: ['var(--green-500)','var(--blue-500)','var(--sand-500)','#8b5cf6'][i], width: `${(c.savings/31400)*100}%`, transition: 'width .6s ease' }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: 14, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>Avg discount vs prior pricing</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--green-600)' }}>{avgDiscount}%</span>
          </div>
        </Card>
      </div>

      {/* Active Requests */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Active requests</div>
          <Btn size="sm" variant="ghost" onClick={() => navigate('/requests')}>View all →</Btn>
        </div>
        {activeRequests.map(req => {
          const bestBid = req.bids.length ? Math.min(...req.bids.map(b => b.amount)) : null
          const savings = bestBid ? req.budget - bestBid : null
          return (
            <div key={req.id} onClick={() => navigate('/bids?req='+req.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              borderBottom: '1px solid var(--slate-50)', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background='var(--slate-50)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <div style={{ fontSize: 22, width: 38, height: 38, background: 'var(--slate-50)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {req.category === 'sand' ? '⛱' : req.category === 'machinery' ? '🚜' : '👷'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{req.title}</div>
                <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Closes {req.closeDate} · Budget {fmtMoney(req.budget)}</div>
              </div>
              <Badge variant={req.bids.length > 2 ? 'warning' : 'info'}>{req.bids.length} bid{req.bids.length !== 1 ? 's' : ''}</Badge>
              {bestBid && (
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--slate-900)' }}>{fmtMoney(bestBid)}</div>
                  <div style={{ fontSize: 11, color: 'var(--green-600)' }}>Save {fmtMoney(savings)}</div>
                </div>
              )}
            </div>
          )
        })}
      </Card>

      {/* Top vendors */}
      <Card>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Top vendors</div>
          <Btn size="sm" variant="ghost" onClick={() => navigate('/vendors')}>View all →</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)' }}>
                {['Vendor','Category','Bids won','Avg savings','Rating',''].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VENDORS.slice(0,4).map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--slate-50)', cursor: 'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--slate-50)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  onClick={()=>navigate('/vendors')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={v.avatar} color={v.color} size={32} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{v.location}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--slate-500)' }}>{v.categories.map(c=>c).join(', ')}</td>
                  <td style={{ padding: '12px 16px' }}>{v.bidsWon}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--green-600)', fontWeight: 600 }}>{v.avgSavings}%</td>
                  <td style={{ padding: '12px 16px' }}><Stars rating={v.rating} /></td>
                  <td style={{ padding: '12px 16px' }}>{v.verified && <Badge variant="success" size="sm">✓ Verified</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
