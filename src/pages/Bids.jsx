import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Badge, Btn, Avatar, Stars, PageHeader, Modal } from '../components/UI.jsx'
import { REQUESTS, CATEGORIES } from '../lib/data.js'

const fmtMoney = n => '$' + n.toLocaleString()

export default function Bids() {
  const [params] = useSearchParams()
  const reqId = params.get('req') || 'req-1'
  const [selectedReq, setSelectedReq] = useState(reqId)
  const [awardModal, setAwardModal] = useState(null)
  const [awarded, setAwarded] = useState({})

  const activeReqs = REQUESTS.filter(r => r.status === 'bidding')
  const req = REQUESTS.find(r => r.id === selectedReq) || activeReqs[0]
  if (!req) return <div>No active requests</div>

  const sortedBids = [...req.bids].sort((a, b) => a.amount - b.amount)

  return (
    <div className="fade-in">
      <PageHeader
        title="Live Bids"
        subtitle="Compare vendor bids and award contracts"
      />

      {/* Request selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {activeReqs.map(r => {
          const cat = CATEGORIES.find(c => c.id === r.category)
          return (
            <button key={r.id} onClick={() => setSelectedReq(r.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', border: '1.5px solid',
              borderColor: selectedReq === r.id ? 'var(--green-500)' : 'var(--slate-200)',
              background: selectedReq === r.id ? 'var(--green-50)' : 'white',
              borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13,
              fontFamily: 'var(--font-body)', fontWeight: selectedReq === r.id ? 600 : 400,
              color: selectedReq === r.id ? 'var(--green-700)' : 'var(--slate-600)',
            }}>
              <span>{cat?.icon}</span>
              <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
              <Badge variant="info" size="sm">{r.bids.length}</Badge>
            </button>
          )
        })}
      </div>

      {/* Request summary */}
      <Card style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{req.title}</div>
            <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{req.description}</div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 2 }}>Budget</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{fmtMoney(req.budget)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 2 }}>Bids</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{req.bids.length}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 2 }}>Closes</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{req.closeDate}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bids */}
      {sortedBids.length === 0 ? (
        <Card style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Waiting for bids</div>
          <div style={{ fontSize: 13, color: 'var(--slate-400)' }}>Vendors in your area will be notified. Check back soon.</div>
        </Card>
      ) : (
        <div className="stagger">
          {sortedBids.map((bid, i) => {
            const isLowest = i === 0
            const savings = req.budget - bid.amount
            const isAwarded = awarded[req.id] === bid.id
            return (
              <Card key={bid.id} style={{
                padding: '18px 20px', marginBottom: 12,
                border: isLowest ? '2px solid var(--green-400)' : isAwarded ? '2px solid var(--green-600)' : '1px solid var(--slate-100)',
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <Avatar initials={bid.vendorName.split(' ').map(w=>w[0]).join('').slice(0,2)} color={['var(--green-600)','var(--blue-500)','var(--sand-600)','#8b5cf6'][i]} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{bid.vendorName}</div>
                      {isLowest && <Badge variant="success">Lowest bid</Badge>}
                      {isAwarded && <Badge variant="success">✓ Awarded</Badge>}
                    </div>
                    <div style={{ marginBottom: 4 }}><Stars rating={bid.rating} /></div>
                    <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>
                      Delivery in {bid.deliveryDays} days · {bid.notes}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--slate-900)', fontFamily: 'var(--font-display)' }}>{fmtMoney(bid.amount)}</div>
                    <div style={{ fontSize: 12, color: 'var(--green-600)', marginBottom: 10 }}>
                      Save {fmtMoney(savings)} ({Math.round(savings/req.budget*100)}%)
                    </div>
                    {!isAwarded && !awarded[req.id] ? (
                      <Btn variant={isLowest ? 'primary' : 'default'} size="sm" onClick={() => setAwardModal(bid)}>
                        Award bid
                      </Btn>
                    ) : isAwarded ? (
                      <Btn variant="ghost" size="sm" disabled>Awarded</Btn>
                    ) : null}
                  </div>
                </div>

                {/* Comparison bar */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--slate-50)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--slate-400)', marginBottom: 4 }}>
                    <span>vs budget ({fmtMoney(req.budget)})</span>
                    <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>−{Math.round(savings/req.budget*100)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--slate-100)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: isLowest ? 'var(--green-500)' : 'var(--slate-300)', width: `${(bid.amount/req.budget)*100}%`, transition: 'width .5s ease' }} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Award modal */}
      <Modal
        open={!!awardModal}
        onClose={() => setAwardModal(null)}
        title="Confirm award"
        footer={<>
          <Btn onClick={() => setAwardModal(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={() => {
            setAwarded(a => ({ ...a, [req.id]: awardModal.id }))
            setAwardModal(null)
          }}>Confirm & award</Btn>
        </>}
      >
        {awardModal && (
          <div>
            <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-800)', marginBottom: 3 }}>You're about to award this contract</div>
              <div style={{ fontSize: 12, color: 'var(--green-700)' }}>The vendor will be notified and a purchase order will be generated.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate-500)' }}>Request</span><span style={{ fontWeight: 500 }}>{req.title}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate-500)' }}>Vendor</span><span style={{ fontWeight: 500 }}>{awardModal.vendorName}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate-500)' }}>Award price</span><span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{fmtMoney(awardModal.amount)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate-500)' }}>Your savings</span><span style={{ fontWeight: 600, color: 'var(--green-600)' }}>{fmtMoney(req.budget - awardModal.amount)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate-500)' }}>Est. delivery</span><span>{awardModal.deliveryDays} business days</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
