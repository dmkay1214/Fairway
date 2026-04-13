import React, { useState } from 'react'
import { BUYER_PLANS, VENDOR_PLANS } from '../lib/membership.js'

const fmtPrice = n => n === 0 ? 'Free' : '$' + n

function PlanCard({ plan, current, onUpgrade, role }) {
  const isCurrent = current === plan.id
  const isFree = plan.price === 0

  return (
    <div style={{
      background: 'white',
      border: isCurrent ? `2px solid ${plan.color}` : plan.popular ? `2px solid ${plan.color}` : '1px solid var(--slate-100)',
      borderRadius: 'var(--radius-xl)',
      padding: '28px 26px',
      position: 'relative',
      flex: 1,
      minWidth: 0,
      boxShadow: plan.popular ? '0 8px 32px rgba(0,0,0,.08)' : 'var(--shadow-sm)',
    }}>
      {plan.popular && !isCurrent && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          background: plan.color, color: 'white',
          fontSize: 11, fontWeight: 600, padding: '4px 14px',
          borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
        }}>Most popular</div>
      )}
      {isCurrent && (
        <div style={{
          position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
          background: plan.color, color: 'white',
          fontSize: 11, fontWeight: 600, padding: '4px 14px',
          borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
        }}>Your plan</div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: plan.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>{plan.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
          <span style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--slate-900)' }}>{fmtPrice(plan.price)}</span>
          {plan.price > 0 && <span style={{ fontSize: 13, color: 'var(--slate-400)' }}>/month</span>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--slate-500)', lineHeight: 1.5 }}>{plan.description}</div>
      </div>

      <button
        onClick={() => !isCurrent && !isFree && onUpgrade(plan)}
        style={{
          width: '100%', padding: '11px', borderRadius: 10, border: 'none',
          background: isCurrent ? 'var(--slate-100)' : isFree ? 'var(--slate-100)' : plan.color,
          color: isCurrent ? 'var(--slate-500)' : isFree ? 'var(--slate-500)' : 'white',
          fontSize: 13, fontWeight: 600, cursor: isCurrent || isFree ? 'default' : 'pointer',
          fontFamily: 'var(--font-body)', marginBottom: 24,
          transition: 'all .15s',
        }}
        onMouseEnter={e => { if (!isCurrent && !isFree) e.currentTarget.style.opacity = '.9' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      >
        {isCurrent ? 'Current plan' : isFree ? 'Free forever' : `Upgrade to ${plan.name}`}
      </button>

      <div style={{ borderTop: '1px solid var(--slate-50)', paddingTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-400)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Included</div>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 9, fontSize: 13, color: 'var(--slate-700)' }}>
            <span style={{ color: plan.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
            {f}
          </div>
        ))}
        {plan.missing?.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-300)', marginBottom: 10, marginTop: 14, textTransform: 'uppercase', letterSpacing: '.05em' }}>Not included</div>
            {plan.missing.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 9, fontSize: 13, color: 'var(--slate-400)' }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>✗</span>
                {f}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function UpgradeModal({ plan, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setDone(true)
    setLoading(false)
  }

  if (!plan) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(13,17,23,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 420,
        padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,.2)',
      }} className="fade-in">
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Welcome to {plan.name}!</div>
            <div style={{ fontSize: 13, color: 'var(--slate-500)', marginBottom: 24, lineHeight: 1.6 }}>
              Your plan has been upgraded. All {plan.name} features are now unlocked.
            </div>
            <button onClick={onConfirm} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: 'var(--green-600)', color: 'white', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>Start using {plan.name} →</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Upgrade to {plan.name}</div>
            <div style={{ fontSize: 13, color: 'var(--slate-500)', marginBottom: 24 }}>
              ${plan.price}/month, billed monthly. Cancel anytime.
            </div>

            <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--slate-600)' }}>{plan.name} — Monthly</span>
                <span style={{ fontWeight: 600 }}>${plan.price}/mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--slate-200)', fontSize: 13 }}>
                <span style={{ color: 'var(--slate-600)' }}>Total due today</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>${plan.price}</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate-600)', display: 'block', marginBottom: 5 }}>Card number</label>
              <input placeholder="4242 4242 4242 4242" style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--slate-200)',
                borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', marginBottom: 10,
              }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate-600)', display: 'block', marginBottom: 5 }}>Expiry</label>
                  <input placeholder="MM / YY" style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--slate-200)',
                    borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                  }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate-600)', display: 'block', marginBottom: 5 }}>CVC</label>
                  <input placeholder="123" style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--slate-200)',
                    borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                  }} />
                </div>
              </div>
            </div>

            <button onClick={handleConfirm} disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 10, border: 'none',
              background: loading ? 'var(--slate-300)' : 'var(--green-600)',
              color: 'white', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)', marginBottom: 12,
            }}>{loading ? 'Processing…' : `Pay $${plan.price} and upgrade`}</button>

            <div style={{ fontSize: 11, color: 'var(--slate-400)', textAlign: 'center', lineHeight: 1.6 }}>
              Secured by Stripe · Cancel anytime · No contracts
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Pricing({ role = 'buyer', currentPlanId, onUpgrade, onClose, embedded = false }) {
  const [tab, setTab] = useState(role)
  const [upgradeTarget, setUpgradeTarget] = useState(null)
  const [activePlan, setActivePlan] = useState(currentPlanId || (role === 'buyer' ? 'buyer_free' : 'vendor_free'))
  const plans = tab === 'buyer' ? BUYER_PLANS : VENDOR_PLANS

  function handleUpgradeConfirm() {
    setActivePlan(upgradeTarget.id)
    setUpgradeTarget(null)
    if (onUpgrade) onUpgrade(upgradeTarget)
  }

  return (
    <div style={{ background: embedded ? 'transparent' : 'var(--slate-50)', minHeight: embedded ? 'auto' : '100vh', padding: embedded ? 0 : '40px 32px' }} className="fade-in">
      {!embedded && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: 13, marginBottom: 16, display: 'block', margin: '0 auto 16px' }}>← Back</button>
          )}
          <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Simple, transparent pricing</div>
          <div style={{ fontSize: 15, color: 'var(--slate-500)', maxWidth: 480, margin: '0 auto' }}>
            Start free. Upgrade when you need more. Cancel anytime.
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', background: 'white', border: '1px solid var(--slate-200)', borderRadius: 12, padding: 4, gap: 4 }}>
          {['buyer', 'seller'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 9, border: 'none',
              background: tab === t ? 'var(--green-600)' : 'transparent',
              color: tab === t ? 'white' : 'var(--slate-500)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-body)', transition: 'all .15s',
            }}>
              {t === 'buyer' ? '⛳ For Clubs' : '🏢 For Vendors'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', gap: 20, maxWidth: 900, margin: '0 auto', alignItems: 'flex-start' }}>
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            current={activePlan}
            role={tab}
            onUpgrade={setUpgradeTarget}
          />
        ))}
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 600, margin: '48px auto 0', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--slate-400)', lineHeight: 1.8 }}>
          All plans include access to 312+ verified vendors · No setup fees · Cancel anytime<br />
          Questions? Email <span style={{ color: 'var(--green-600)' }}>hello@fairway.com</span>
        </div>
      </div>

      <UpgradeModal
        plan={upgradeTarget}
        onClose={() => setUpgradeTarget(null)}
        onConfirm={handleUpgradeConfirm}
      />
    </div>
  )
}
