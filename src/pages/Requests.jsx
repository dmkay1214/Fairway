import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Btn, PageHeader, Tabs, Modal, Input, Select, Textarea } from '../components/UI.jsx'
import { REQUESTS, CATEGORIES } from '../lib/data.js'

const fmtMoney = n => '$' + n.toLocaleString()

function statusVariant(s) {
  return s === 'bidding' ? 'warning' : s === 'awarded' ? 'success' : 'default'
}
function statusLabel(s) {
  return s === 'bidding' ? 'Bidding open' : s === 'awarded' ? 'Awarded' : s
}

export default function Requests({ onNewRequest }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('active')
  const active = REQUESTS.filter(r => r.status === 'bidding')
  const awarded = REQUESTS.filter(r => r.status === 'awarded')

  const shown = tab === 'active' ? active : awarded

  return (
    <div className="fade-in">
      <PageHeader
        title="My Requests"
        subtitle="Manage your procurement requests and review bids"
        actions={<Btn variant="primary" onClick={onNewRequest}>+ Post Request</Btn>}
      />

      <Tabs
        tabs={[
          { id: 'active', label: 'Active', count: active.length },
          { id: 'awarded', label: 'Awarded', count: awarded.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="stagger">
        {shown.map(req => {
          const bestBid = req.bids.length ? Math.min(...req.bids.map(b => b.amount)) : req.awardedAmount
          const savings = req.budget - (bestBid || req.awardedAmount || 0)
          const cat = CATEGORIES.find(c => c.id === req.category)
          return (
            <Card key={req.id} style={{ marginBottom: 12, padding: '18px 20px', cursor: 'pointer' }}
              onClick={() => navigate('/bids?req=' + req.id)}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: cat?.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {cat?.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{req.title}</div>
                    <Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 8 }}>
                    Budget: {fmtMoney(req.budget)} · {req.location} · Closes {req.closeDate}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate-500)', lineHeight: 1.5 }}>{req.description}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {req.status === 'bidding' ? (
                    <>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 3 }}>Best bid</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--slate-900)' }}>
                        {req.bids.length ? fmtMoney(Math.min(...req.bids.map(b=>b.amount))) : '—'}
                      </div>
                      {req.bids.length > 0 && <div style={{ fontSize: 11, color: 'var(--green-600)' }}>Save {fmtMoney(req.budget - Math.min(...req.bids.map(b=>b.amount)))}</div>}
                      <div style={{ marginTop: 8 }}>
                        <Badge variant="info">{req.bids.length} bid{req.bids.length !== 1 ? 's' : ''}</Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 3 }}>Awarded price</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--slate-900)' }}>{fmtMoney(req.awardedAmount)}</div>
                      <div style={{ fontSize: 11, color: 'var(--green-600)' }}>Saved {fmtMoney(req.savings)}</div>
                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--slate-400)' }}>{req.awardedVendor}</div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
