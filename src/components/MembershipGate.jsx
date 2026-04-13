import React, { useState } from 'react'
import { getPlan, requestsRemaining } from '../lib/membership.js'
import Pricing from '../pages/Pricing.jsx'

// Banner shown at top of page when user is near/at their limit
export function UsageBanner({ membership, role }) {
  const [dismissed, setDismissed] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

  if (dismissed || !membership) return null

  const plan = getPlan(membership.planId, role)
  if (plan.price > 0) return null // paid users don't see banner

  if (role === 'buyer') {
    const remaining = requestsRemaining(membership)
    if (remaining > 1) return null // only show when 1 or 0 left

    return (
      <>
        <div style={{
          background: remaining === 0 ? '#fee2e2' : '#fef9c3',
          border: `1px solid ${remaining === 0 ? '#fecaca' : '#fef08a'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 18 }}>{remaining === 0 ? '🚫' : '⚠️'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: remaining === 0 ? '#b91c1c' : '#854d0e' }}>
              {remaining === 0 ? 'You have used all 3 free requests this month' : `Only ${remaining} free request left this month`}
            </div>
            <div style={{ fontSize: 12, color: remaining === 0 ? '#ef4444' : '#ca8a04' }}>
              Upgrade to Pro Club for unlimited requests and full savings reporting
            </div>
          </div>
          <button onClick={() => setShowPricing(true)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none',
            background: remaining === 0 ? '#b91c1c' : '#1a8250',
            color: 'white', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0,
          }}>Upgrade now</button>
          <button onClick={() => setDismissed(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: remaining === 0 ? '#b91c1c' : '#854d0e', fontSize: 16, flexShrink: 0,
          }}>×</button>
        </div>
        {showPricing && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(13,17,23,.55)', overflowY: 'auto',
          }}>
            <Pricing role="buyer" currentPlanId={membership.planId} onClose={() => setShowPricing(false)} />
          </div>
        )}
      </>
    )
  }

  if (role === 'seller') {
    const remaining = Math.max(0, 5 - membership.bidsUsedThisMonth)
    if (remaining > 1) return null

    return (
      <>
        <div style={{
          background: remaining === 0 ? '#fee2e2' : '#fef9c3',
          border: `1px solid ${remaining === 0 ? '#fecaca' : '#fef08a'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 18 }}>{remaining === 0 ? '🚫' : '⚠️'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: remaining === 0 ? '#b91c1c' : '#854d0e' }}>
              {remaining === 0 ? 'You have used all 5 free bids this month' : `Only ${remaining} free bid left this month`}
            </div>
            <div style={{ fontSize: 12, color: remaining === 0 ? '#ef4444' : '#ca8a04' }}>
              Upgrade to Pro Vendor for unlimited bids and a featured listing
            </div>
          </div>
          <button onClick={() => setShowPricing(true)} style={{
            padding: '7px 16px', borderRadius: 8, border: 'none',
            background: remaining === 0 ? '#b91c1c' : '#1a8250',
            color: 'white', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0,
          }}>Upgrade now</button>
          <button onClick={() => setDismissed(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: remaining === 0 ? '#b91c1c' : '#854d0e', fontSize: 16, flexShrink: 0,
          }}>×</button>
        </div>
        {showPricing && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(13,17,23,.55)', overflowY: 'auto',
          }}>
            <Pricing role="seller" currentPlanId={membership.planId} onClose={() => setShowPricing(false)} />
          </div>
        )}
      </>
    )
  }

  return null
}

// Small inline pill showing plan badge
export function PlanBadge({ planId, role = 'buyer' }) {
  const plan = getPlan(planId, role)
  const colors = {
    buyer_free: { bg: 'var(--slate-100)', color: 'var(--slate-600)' },
    buyer_pro: { bg: '#dcfce7', color: '#166534' },
    buyer_enterprise: { bg: '#dbeafe', color: '#1e40af' },
    vendor_free: { bg: 'var(--slate-100)', color: 'var(--slate-600)' },
    vendor_pro: { bg: '#dcfce7', color: '#166534' },
  }
  const c = colors[planId] || colors.buyer_free
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 'var(--radius-full)',
      background: c.bg, color: c.color,
    }}>
      {plan.name}
    </span>
  )
}

// Gate component — wraps content that requires a paid plan
export function PlanGate({ children, requiredPlan, currentPlanId, role, feature }) {
  const [showPricing, setShowPricing] = useState(false)
  const plan = getPlan(currentPlanId, role)
  const required = getPlan(requiredPlan, role)

  // Check if user has required access
  const hasAccess = plan.price >= required.price

  if (hasAccess) return children

  return (
    <>
      <div style={{
        background: 'var(--slate-50)', border: '1px dashed var(--slate-200)',
        borderRadius: 'var(--radius-lg)', padding: '32px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{feature || 'Pro feature'}</div>
        <div style={{ fontSize: 13, color: 'var(--slate-500)', marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>
          This feature is available on the {required.name} plan and above.
        </div>
        <button onClick={() => setShowPricing(true)} style={{
          padding: '10px 24px', borderRadius: 9, border: 'none',
          background: 'var(--green-600)', color: 'white',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>Upgrade to {required.name}</button>
      </div>
      {showPricing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(13,17,23,.55)', overflowY: 'auto',
        }}>
          <Pricing role={role} currentPlanId={currentPlanId} onClose={() => setShowPricing(false)} />
        </div>
      )}
    </>
  )
}
