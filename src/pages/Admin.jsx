import React, { useState } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, MetricCard, Badge, Avatar, Stars, PageHeader, Tabs, Btn } from '../components/UI.jsx'

const fmtMoney = n => '$' + Number(n).toLocaleString()
const fmtK = n => n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'K' : '$' + n

/* ─── Mock admin data ────────────────────────────────────────── */
const GMV_DATA = [
  { month: 'Jul', gmv: 42000, fees: 1260, requests: 8 },
  { month: 'Aug', gmv: 67000, fees: 2010, requests: 14 },
  { month: 'Sep', gmv: 55000, fees: 1650, requests: 11 },
  { month: 'Oct', gmv: 98000, fees: 2940, requests: 19 },
  { month: 'Nov', gmv: 134000, fees: 4020, requests: 26 },
  { month: 'Dec', gmv: 112000, fees: 3360, requests: 21 },
]

const CATEGORY_GMV = [
  { name: 'Labor', value: 38 },
  { name: 'Machinery', value: 27 },
  { name: 'Sand', value: 19 },
  { name: 'Chemicals', value: 11 },
  { name: 'Other', value: 5 },
]

const ALL_CLUBS = [
  { id: 1, name: 'Pine Valley CC', location: 'Naples, FL', requests: 12, spend: 84200, savings: 18400, status: 'active', joined: 'Jul 2025' },
  { id: 2, name: 'Pelican Bay CC', location: 'Naples, FL', requests: 7, spend: 46800, savings: 9200, status: 'active', joined: 'Aug 2025' },
  { id: 3, name: 'Heritage Golf Club', location: 'Fort Myers, FL', requests: 5, spend: 31400, savings: 6100, status: 'active', joined: 'Sep 2025' },
  { id: 4, name: 'Tiburon Golf Club', location: 'Naples, FL', requests: 3, spend: 18600, savings: 3400, status: 'active', joined: 'Oct 2025' },
  { id: 5, name: 'Quail Creek CC', location: 'Naples, FL', requests: 9, spend: 72100, savings: 15200, status: 'active', joined: 'Aug 2025' },
  { id: 6, name: 'Mediterra CC', location: 'Naples, FL', requests: 1, spend: 4200, savings: 600, status: 'trial', joined: 'Dec 2025' },
]

const ALL_VENDORS = [
  { id: 'v1', name: 'Gulf Shore Aggregates', location: 'Tampa, FL', category: 'Sand', bidsWon: 31, revenue: 284000, rating: 4.9, status: 'verified', joined: 'Jun 2025' },
  { id: 'v2', name: 'TurfLine Labor Co.', location: 'Orlando, FL', category: 'Labor', bidsWon: 24, revenue: 198000, rating: 4.6, status: 'verified', joined: 'Jul 2025' },
  { id: 'v3', name: 'GreenEquip Rentals', location: 'Atlanta, GA', category: 'Machinery', bidsWon: 18, revenue: 156000, rating: 4.8, status: 'verified', joined: 'Jul 2025' },
  { id: 'v4', name: 'Precision Turf Supply', location: 'Nashville, TN', category: 'Chemicals', bidsWon: 15, revenue: 92000, rating: 4.5, status: 'verified', joined: 'Aug 2025' },
  { id: 'v5', name: 'Sunbelt Granite & Sand', location: 'Jacksonville, FL', category: 'Sand', bidsWon: 6, revenue: 44000, rating: 4.4, status: 'pending', joined: 'Nov 2025' },
]

const RECENT_TRANSACTIONS = [
  { id: 'tx-1', type: 'award', club: 'Pine Valley CC', vendor: 'Gulf Shore Aggregates', amount: 5920, fee: 178, date: 'Dec 13' },
  { id: 'tx-2', type: 'award', club: 'Pelican Bay CC', vendor: 'TurfLine Labor Co.', amount: 12400, fee: 372, date: 'Dec 11' },
  { id: 'tx-3', type: 'award', club: 'Heritage Golf Club', vendor: 'GreenEquip Rentals', amount: 3100, fee: 93, date: 'Dec 10' },
  { id: 'tx-4', type: 'award', club: 'Quail Creek CC', vendor: 'Precision Turf Supply', amount: 8200, fee: 246, date: 'Dec 9' },
  { id: 'tx-5', type: 'refund', club: 'Tiburon Golf Club', vendor: 'Carolina Sand', amount: -1200, fee: -36, date: 'Dec 7' },
]

const COLORS = ['#219e62', '#378add', '#e0b060', '#8b5cf6', '#94a3b8']

/* ─── Sub-panels ─────────────────────────────────────────────── */
function Overview() {
  const totalGMV = GMV_DATA.reduce((s, d) => s + d.gmv, 0)
  const totalFees = GMV_DATA.reduce((s, d) => s + d.fees, 0)

  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }} className="stagger">
        <MetricCard label="Total GMV (YTD)" value={fmtMoney(totalGMV)} sub="↑ 34% MoM" />
        <MetricCard label="Platform revenue" value={fmtMoney(totalFees)} sub="3% of GMV" subColor="var(--blue-500)" />
        <MetricCard label="Active clubs" value={ALL_CLUBS.filter(c => c.status === 'active').length} sub={`${ALL_CLUBS.length} total signups`} subColor="var(--slate-400)" />
        <MetricCard label="Active vendors" value={ALL_VENDORS.filter(v => v.status === 'verified').length} sub={`${ALL_VENDORS.length} total`} subColor="var(--slate-400)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card style={{ padding: '20px 20px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Gross Merchandise Volume</div>
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 16 }}>Monthly GMV + platform fees</div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={GMV_DATA} margin={{ left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#219e62" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#219e62" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--slate-400)' }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v / 1000 + 'k'} />
              <Tooltip formatter={(v, n) => [fmtMoney(v), n === 'gmv' ? 'GMV' : 'Fees']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--slate-100)' }} />
              <Area type="monotone" dataKey="gmv" stroke="#219e62" strokeWidth={2} fill="url(#gmvGrad)" />
              <Area type="monotone" dataKey="fees" stroke="#378add" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>GMV by category</div>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={CATEGORY_GMV} cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={2} dataKey="value">
                {CATEGORY_GMV.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [v + '%']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {CATEGORY_GMV.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i], flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--slate-600)' }}>{c.name}</span>
                <span style={{ fontWeight: 600 }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--slate-50)' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Recent transactions</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--slate-50)' }}>
              {['ID', 'Club', 'Vendor', 'Amount', 'Platform fee', 'Date', 'Type'].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_TRANSACTIONS.map(tx => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                <td style={{ padding: '12px 16px', color: 'var(--slate-400)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{tx.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{tx.club}</td>
                <td style={{ padding: '12px 16px', color: 'var(--slate-600)' }}>{tx.vendor}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: tx.amount < 0 ? '#b91c1c' : 'var(--slate-900)' }}>{fmtMoney(Math.abs(tx.amount))}</td>
                <td style={{ padding: '12px 16px', color: tx.fee < 0 ? '#b91c1c' : 'var(--green-600)', fontWeight: 500 }}>{tx.fee < 0 ? '-' : '+'}{fmtMoney(Math.abs(tx.fee))}</td>
                <td style={{ padding: '12px 16px', color: 'var(--slate-400)' }}>{tx.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Badge variant={tx.type === 'refund' ? 'danger' : 'success'} size="sm">{tx.type}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Clubs() {
  const [search, setSearch] = useState('')
  const filtered = ALL_CLUBS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search clubs…"
          style={{ padding: '9px 13px', border: '1px solid var(--slate-200)', borderRadius: 9, fontSize: 13, outline: 'none', width: 260 }}
        />
        <div style={{ fontSize: 13, color: 'var(--slate-400)', marginLeft: 'auto' }}>{filtered.length} clubs</div>
      </div>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--slate-50)' }}>
              {['Club', 'Location', 'Requests', 'Total spend', 'Total saved', 'Joined', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                <td style={{ padding: '13px 16px', fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: '13px 16px', color: 'var(--slate-500)' }}>{c.location}</td>
                <td style={{ padding: '13px 16px' }}>{c.requests}</td>
                <td style={{ padding: '13px 16px', fontWeight: 600 }}>{fmtMoney(c.spend)}</td>
                <td style={{ padding: '13px 16px', color: 'var(--green-600)', fontWeight: 600 }}>{fmtMoney(c.savings)}</td>
                <td style={{ padding: '13px 16px', color: 'var(--slate-400)' }}>{c.joined}</td>
                <td style={{ padding: '13px 16px' }}><Badge variant={c.status === 'active' ? 'success' : 'warning'} size="sm">{c.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function Vendors() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? ALL_VENDORS : ALL_VENDORS.filter(v => v.status === filter)
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'verified', 'pending'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid',
            fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
            borderColor: filter === f ? 'var(--green-400)' : 'var(--slate-200)',
            background: filter === f ? 'var(--green-50)' : 'white',
            color: filter === f ? 'var(--green-700)' : 'var(--slate-600)',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} {filter === f ? `(${filtered.length})` : ''}
          </button>
        ))}
      </div>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--slate-50)' }}>
              {['Vendor', 'Category', 'Bids won', 'Revenue', 'Rating', 'Joined', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--slate-50)' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{v.location}</div>
                </td>
                <td style={{ padding: '13px 16px', color: 'var(--slate-500)' }}>{v.category}</td>
                <td style={{ padding: '13px 16px' }}>{v.bidsWon}</td>
                <td style={{ padding: '13px 16px', fontWeight: 600 }}>{fmtMoney(v.revenue)}</td>
                <td style={{ padding: '13px 16px' }}><Stars rating={v.rating} /></td>
                <td style={{ padding: '13px 16px', color: 'var(--slate-400)' }}>{v.joined}</td>
                <td style={{ padding: '13px 16px' }}><Badge variant={v.status === 'verified' ? 'success' : 'warning'} size="sm">{v.status}</Badge></td>
                <td style={{ padding: '13px 16px' }}>
                  {v.status === 'pending' && <Btn size="sm" variant="primary">Verify</Btn>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

/* ─── Admin shell ────────────────────────────────────────────── */
export default function Admin({ onExit }) {
  const [tab, setTab] = useState('overview')

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Admin sidebar */}
      <div style={{
        width: 200, background: 'var(--slate-800)', display: 'flex',
        flexDirection: 'column', padding: '0 0 20px',
      }}>
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⛳</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'white' }}>Fairway</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Admin</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {[
            { id: 'overview', icon: '◼', label: 'Overview' },
            { id: 'clubs', icon: '⛳', label: 'Clubs' },
            { id: 'vendors', icon: '🏢', label: 'Vendors' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', padding: '9px 11px', border: 'none',
              borderRadius: 8, cursor: 'pointer', marginBottom: 2,
              background: tab === item.id ? 'var(--green-600)' : 'transparent',
              color: tab === item.id ? 'white' : 'rgba(255,255,255,.45)',
              fontSize: 13, fontFamily: 'var(--font-body)', textAlign: 'left',
            }}>
              <span style={{ fontSize: 11 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '0 8px' }}>
          <button onClick={onExit} style={{
            width: '100%', padding: '8px 11px', border: 'none',
            borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,.06)',
            color: 'rgba(255,255,255,.35)', fontSize: 12, fontFamily: 'var(--font-body)',
          }}>← Exit admin</button>
        </div>
      </div>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'var(--slate-50)' }}>
        <PageHeader
          title={tab === 'overview' ? 'Platform Overview' : tab === 'clubs' ? 'Clubs' : 'Vendors'}
          subtitle={tab === 'overview' ? 'Platform-wide GMV, fees, and activity' : tab === 'clubs' ? 'All registered clubs and their activity' : 'All registered vendors'}
          actions={tab === 'overview' && (
            <div style={{
              background: 'var(--green-50)', border: '1px solid var(--green-200)',
              borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--green-700)', fontWeight: 500,
            }}>
              1% platform fee active
            </div>
          )}
        />
        {tab === 'overview' && <Overview />}
        {tab === 'clubs' && <Clubs />}
        {tab === 'vendors' && <Vendors />}
      </main>
    </div>
  )
}
