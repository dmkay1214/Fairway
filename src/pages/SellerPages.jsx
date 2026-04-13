import React, { useState } from 'react'
import { Card, Badge, Btn, Avatar, Stars, PageHeader, MetricCard, Modal, Input, Textarea } from '../components/UI.jsx'
import { SELLER_OPPORTUNITIES, CATEGORIES, USERS } from '../lib/data.js'

const fmtMoney = n => '$' + n.toLocaleString()

export function SellerOpportunities() {
  const [bidModal, setBidModal] = useState(null)
  const [bids, setBids] = useState({})
  const [bidAmount, setBidAmount] = useState('')
  const [bidNotes, setBidNotes] = useState('')

  const seller = USERS.seller

  return (
    <div className="fade-in">
      <PageHeader
        title="Opportunities"
        subtitle="Open requests matching your category — Sand & Aggregates"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <MetricCard label="Open near you" value="23" sub="Within 100 miles" subColor="var(--blue-500)" />
        <MetricCard label="Your active bids" value="4" sub="2 currently leading" />
        <MetricCard label="Bids won (all time)" value={seller.totalBidsWon} sub="$284K in orders" />
        <MetricCard label="Your rating" value={seller.rating} sub="★★★★★ (94 reviews)" subColor="var(--sand-600)" />
      </div>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--slate-50)' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Open requests near you</div>
        </div>
        <div className="stagger">
          {SELLER_OPPORTUNITIES.map(opp => {
            const cat = CATEGORIES.find(c => c.id === opp.category)
            const hasBid = bids[opp.id]
            return (
              <div key={opp.id} style={{
                display: 'flex', gap: 14, padding: '16px 20px', alignItems: 'center',
                borderBottom: '1px solid var(--slate-50)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: (cat?.color||'#888')+'18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {cat?.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{opp.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>
                    {opp.club} · {opp.distance} mi away · Closes {opp.closeDate}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Budget</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{fmtMoney(opp.budget)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Bids so far</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{opp.bids}</div>
                  </div>
                  {hasBid ? (
                    <div style={{ textAlign: 'right' }}>
                      <Badge variant="success">Bid placed: {fmtMoney(bids[opp.id])}</Badge>
                    </div>
                  ) : (
                    <Btn variant="primary" size="sm" onClick={() => { setBidModal(opp); setBidAmount(''); setBidNotes('') }}>
                      Place bid
                    </Btn>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Bid modal */}
      <Modal
        open={!!bidModal}
        onClose={() => setBidModal(null)}
        title="Submit a bid"
        footer={<>
          <Btn onClick={() => setBidModal(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => {
            if (bidAmount) {
              setBids(b => ({ ...b, [bidModal.id]: parseInt(bidAmount) }))
              setBidModal(null)
            }
          }}>Submit bid</Btn>
        </>}
      >
        {bidModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{bidModal.title}</div>
              <div style={{ color: 'var(--slate-400)' }}>{bidModal.club} · Budget: {fmtMoney(bidModal.budget)}</div>
            </div>
            <Input
              label="Your bid amount ($)"
              type="number"
              value={bidAmount}
              onChange={e => setBidAmount(e.target.value)}
              placeholder={String(Math.round(bidModal.budget * 0.8))}
              required
            />
            <div style={{ fontSize: 12, color: 'var(--green-600)', background: 'var(--green-50)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
              💡 Bids within 20% of budget win ~70% of the time. Try {fmtMoney(Math.round(bidModal.budget * 0.79))}.
            </div>
            <Input label="Delivery timeline" type="text" value="" onChange={()=>{}} placeholder="e.g. 5 business days" />
            <Textarea
              label="Notes for the buyer"
              value={bidNotes}
              onChange={e => setBidNotes(e.target.value)}
              placeholder="Certifications, delivery details, included services..."
              rows={3}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export function SellerProfile() {
  const seller = USERS.seller
  return (
    <div className="fade-in">
      <PageHeader title="Profile & Ratings" subtitle="Your vendor profile as seen by buyers" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div>
          <Card style={{ padding: 24, textAlign: 'center', marginBottom: 14 }}>
            <Avatar initials="CR" color="var(--blue-500)" size={64} style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{seller.company}</div>
            <div style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 10 }}>{seller.location}</div>
            <Stars rating={seller.rating} />
            <div style={{ marginTop: 12 }}>
              <Badge variant="success">✓ Verified Vendor</Badge>
            </div>
          </Card>
          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Your stats</div>
            {[
              { label: 'Total bids won', value: seller.totalBidsWon },
              { label: 'Total revenue', value: fmtMoney(seller.totalRevenue) },
              { label: 'Avg response time', value: '< 4 hrs' },
              { label: 'Win rate', value: '62%' },
            ].map((s,i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--slate-50)' : 'none', fontSize: 13 }}>
                <span style={{ color: 'var(--slate-500)' }}>{s.label}</span>
                <span style={{ fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <Card style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Recent reviews</div>
            {[
              { club: 'Pine Valley CC', rating: 5, comment: 'On time, quality sand, exactly as spec. Will use again.', date: 'Dec 2025' },
              { club: 'Pelican Bay CC', rating: 5, comment: 'Best price we found anywhere. Delivery was seamless.', date: 'Nov 2025' },
              { club: 'Heritage Golf Club', rating: 4, comment: 'Good product, minor delay on delivery but communicated well.', date: 'Nov 2025' },
            ].map((r,i) => (
              <div key={i} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: i < 2 ? '1px solid var(--slate-50)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.club}</span>
                  <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>{r.date}</span>
                </div>
                <Stars rating={r.rating} />
                <div style={{ fontSize: 13, color: 'var(--slate-600)', marginTop: 6, lineHeight: 1.6 }}>{r.comment}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
