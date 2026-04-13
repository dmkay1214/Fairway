import React, { useState } from 'react'
import { Card, Badge, Avatar, Stars, PageHeader, MetricCard, Tabs, Table } from '../components/UI.jsx'
import { ORDERS, VENDORS, CATEGORY_SAVINGS, SAVINGS_DATA, CATEGORIES } from '../lib/data.js'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmtMoney = n => '$' + n.toLocaleString()

function statusInfo(s) {
  const map = {
    in_transit: { label: 'In transit', variant: 'info' },
    active: { label: 'Active', variant: 'success' },
    processing: { label: 'Processing', variant: 'warning' },
    delivered: { label: 'Delivered', variant: 'default' },
  }
  return map[s] || { label: s, variant: 'default' }
}

export function Orders() {
  const [tab, setTab] = useState('active')
  const active = ORDERS.filter(o => o.status !== 'delivered')
  const delivered = ORDERS.filter(o => o.status === 'delivered')
  const shown = tab === 'active' ? active : delivered

  return (
    <div className="fade-in">
      <PageHeader title="Orders" subtitle="Track all awarded contracts and deliveries" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        <MetricCard label="In progress" value={active.length} sub="Active orders" subColor="var(--blue-500)" />
        <MetricCard label="Total spend (YTD)" value={fmtMoney(ORDERS.reduce((s,o)=>s+o.amount,0))} sub="Across all orders" />
        <MetricCard label="Total saved (YTD)" value={fmtMoney(ORDERS.reduce((s,o)=>s+o.savings,0))} sub="vs original budgets" />
      </div>
      <Tabs tabs={[{id:'active',label:'In Progress',count:active.length},{id:'delivered',label:'Delivered',count:delivered.length}]} active={tab} onChange={setTab} />
      <div className="stagger">
        {shown.map(order => {
          const cat = CATEGORIES.find(c => c.id === order.category)
          const si = statusInfo(order.status)
          return (
            <Card key={order.id} style={{ padding: '16px 20px', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: (cat?.color||'#888') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {cat?.icon || '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{order.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{order.id.toUpperCase()} · {order.vendor}</div>
                </div>
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{fmtMoney(order.amount)}</div>
                    <div style={{ fontSize: 11, color: 'var(--green-600)' }}>Saved {fmtMoney(order.savings)}</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 4 }}>
                      {order.status === 'delivered' ? 'Delivered' : 'Est. delivery'}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{order.deliveryDate}</div>
                  </div>
                  <Badge variant={si.variant}>{si.label}</Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export function Savings() {
  const totalSaved = CATEGORY_SAVINGS.reduce((s,c)=>s+c.savings,0)
  const totalPrior = CATEGORY_SAVINGS.reduce((s,c)=>s+c.prior,0)
  const avgPct = (totalSaved/totalPrior*100).toFixed(1)
  const colors = ['var(--green-500)','var(--blue-500)','#f59e0b','#8b5cf6']

  return (
    <div className="fade-in">
      <PageHeader title="Savings Report" subtitle="Your hard dollar savings vs prior contract pricing" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <MetricCard label="Total saved (YTD)" value={fmtMoney(totalSaved)} sub="vs prior contract pricing" />
        <MetricCard label="Avg discount rate" value={avgPct+'%'} sub="Across all categories" />
        <MetricCard label="Requests fulfilled" value="24" sub="100% fill rate" subColor="var(--slate-400)" />
        <MetricCard label="Projected annual" value="$112K" sub="Based on current run rate" subColor="var(--blue-500)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Prior vs marketplace spend</div>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 16 }}>By category</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CATEGORY_SAVINGS} margin={{ left: -10, bottom: 0 }} barGap={4} barCategoryGap="35%">
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} tickFormatter={v=>'$'+v/1000+'k'} />
              <Tooltip formatter={v => ['$'+v.toLocaleString()]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--slate-100)' }} />
              <Bar dataKey="prior" fill="var(--slate-100)" name="Prior contract" radius={[3,3,0,0]} />
              <Bar dataKey="marketplace" fill="var(--green-400)" name="Marketplace" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Savings breakdown</div>
          {CATEGORY_SAVINGS.map((c,i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.category}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-600)' }}>{fmtMoney(c.savings)}</span>
              </div>
              <div style={{ height: 6, background: 'var(--slate-100)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: colors[i], width: `${c.pct*2.5}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 3 }}>
                {fmtMoney(c.prior)} → {fmtMoney(c.marketplace)} · <span style={{ color: 'var(--green-600)' }}>{c.pct}% reduction</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-50)' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Full savings comparison</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)' }}>
                {['Category','Prior annual spend','Marketplace spend','Savings','% Reduction'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORY_SAVINGS.map((c,i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                  <td style={{ padding: '13px 16px', fontWeight: 500 }}>{c.category}</td>
                  <td style={{ padding: '13px 16px', color: 'var(--slate-600)' }}>{fmtMoney(c.prior)}</td>
                  <td style={{ padding: '13px 16px', color: 'var(--slate-600)' }}>{fmtMoney(c.marketplace)}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 700, color: 'var(--green-600)' }}>{fmtMoney(c.savings)}</td>
                  <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--green-600)' }}>{c.pct}%</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--slate-50)', fontWeight: 700 }}>
                <td style={{ padding: '13px 16px' }}>Total</td>
                <td style={{ padding: '13px 16px' }}>{fmtMoney(CATEGORY_SAVINGS.reduce((s,c)=>s+c.prior,0))}</td>
                <td style={{ padding: '13px 16px' }}>{fmtMoney(CATEGORY_SAVINGS.reduce((s,c)=>s+c.marketplace,0))}</td>
                <td style={{ padding: '13px 16px', color: 'var(--green-600)' }}>{fmtMoney(totalSaved)}</td>
                <td style={{ padding: '13px 16px', color: 'var(--green-600)' }}>{avgPct}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export function Vendors() {
  const [filter, setFilter] = useState('all')
  const cats = ['all', ...new Set(VENDORS.flatMap(v => v.categories))]
  const shown = filter === 'all' ? VENDORS : VENDORS.filter(v => v.categories.includes(filter))

  return (
    <div className="fade-in">
      <PageHeader title="Vendor Directory" subtitle="312 verified vendors across 9 categories" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-full)',
            border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            borderColor: filter === c ? 'var(--green-400)' : 'var(--slate-200)',
            background: filter === c ? 'var(--green-50)' : 'white',
            color: filter === c ? 'var(--green-700)' : 'var(--slate-600)',
          }}>
            {c === 'all' ? 'All vendors' : CATEGORIES.find(cat=>cat.id===c)?.label || c}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }} className="stagger">
        {shown.map(v => (
          <Card key={v.id} style={{ padding: '18px 20px', cursor: 'pointer' }}
            onClick={() => {}}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
              <Avatar initials={v.avatar} color={v.color} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{v.name}</div>
                  {v.verified && <Badge variant="success" size="sm">✓ Verified</Badge>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{v.location}</div>
                <div style={{ marginTop: 4 }}><Stars rating={v.rating} /></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {v.categories.map(c => {
                const cat = CATEGORIES.find(x => x.id === c)
                return <Badge key={c} size="sm">{cat?.icon} {cat?.label || c}</Badge>
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--slate-50)', fontSize: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--slate-400)' }}>Bids won</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{v.bidsWon}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--slate-400)' }}>Avg savings</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--green-600)', marginTop: 2 }}>{v.avgSavings}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--slate-400)' }}>Reviews</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{v.reviews}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
