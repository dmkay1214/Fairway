import React, { useState } from 'react'
import { Card, PageHeader, Btn, Badge } from '../components/UI.jsx'
import { getPlan, MOCK_MEMBERSHIP } from '../lib/membership.js'
import Pricing from './Pricing.jsx'

function Section({ title, children }) {
  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--slate-50)' }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </Card>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, paddingBottom: 16, marginBottom: 16,
      borderBottom: '1px solid var(--slate-50)',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 42, height: 24, borderRadius: 12, border: 'none',
      background: value ? 'var(--green-500)' : 'var(--slate-200)',
      cursor: 'pointer', position: 'relative', transition: 'background .2s',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.15)',
      }} />
    </button>
  )
}

export default function Settings({ role }) {
  const [notifs, setNotifs] = useState({ newBid: true, closing: true, awarded: true, marketing: false })
  const [saved, setSaved] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

  const membership = MOCK_MEMBERSHIP[role] || MOCK_MEMBERSHIP.buyer
  const plan = getPlan(membership.planId, role)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (showPricing) {
    return <Pricing role={role} currentPlanId={membership.planId} onClose={() => setShowPricing(false)} />
  }

  return (
    <div className="fade-in">
      <PageHeader title="Account Settings" subtitle="Manage your profile, notifications, and billing" />

      {/* Profile */}
      <Section title="Profile">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {[
            { label: 'Full name', value: role === 'buyer' ? 'James Whitfield' : 'Carlos Rivera' },
            { label: role === 'buyer' ? 'Club name' : 'Company name', value: role === 'buyer' ? 'Pine Valley Country Club' : 'Gulf Shore Aggregates' },
            { label: 'Email', value: role === 'buyer' ? 'james@pinevalleycc.com' : 'carlos@gulfshore.com' },
            { label: 'Location', value: role === 'buyer' ? 'Naples, FL' : 'Tampa, FL' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate-500)' }}>{f.label}</label>
              <input defaultValue={f.value} style={{
                padding: '9px 12px', border: '1px solid var(--slate-200)',
                borderRadius: 8, fontSize: 13, outline: 'none',
              }} />
            </div>
          ))}
        </div>
        <Btn variant="primary" size="sm" onClick={handleSave}>{saved ? '✓ Saved' : 'Save changes'}</Btn>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow label="New bid received" description="Email when a vendor places a bid on your request">
          <Toggle value={notifs.newBid} onChange={v => setNotifs(n => ({ ...n, newBid: v }))} />
        </SettingRow>
        <SettingRow label="Request closing soon" description="Reminder 24 hours before your request closes">
          <Toggle value={notifs.closing} onChange={v => setNotifs(n => ({ ...n, closing: v }))} />
        </SettingRow>
        <SettingRow label="Order updates" description="Shipping and delivery status updates">
          <Toggle value={notifs.awarded} onChange={v => setNotifs(n => ({ ...n, awarded: v }))} />
        </SettingRow>
        <SettingRow label="Product updates & tips" description="Occasional emails about new features">
          <Toggle value={notifs.marketing} onChange={v => setNotifs(n => ({ ...n, marketing: v }))} />
        </SettingRow>
        <Btn variant="primary" size="sm" onClick={handleSave}>{saved ? '✓ Saved' : 'Save preferences'}</Btn>
      </Section>

      {/* Plan */}
      <Section title="Plan & Billing">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '4px 0 20px', borderBottom: '1px solid var(--slate-50)', marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{plan.name}</div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: plan.price > 0 ? '#dcfce7' : 'var(--slate-100)', color: plan.price > 0 ? '#166534' : 'var(--slate-500)' }}>
                {plan.price > 0 ? 'Active' : 'Free'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--slate-500)' }}>
              {plan.price === 0 ? 'Free plan · Upgrade to unlock more features' : `$${plan.price}/month · Renews monthly`}
            </div>
          </div>
          <Btn variant="primary" size="sm" onClick={() => setShowPricing(true)}>
            {plan.price === 0 ? 'Upgrade plan' : 'Manage plan'}
          </Btn>
        </div>

        {plan.price === 0 && role === 'buyer' && (
          <div style={{ background: 'var(--green-50)', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-800)', marginBottom: 4 }}>
              You have used {membership.requestsUsedThisMonth} of 3 free requests this month
            </div>
            <div style={{ height: 6, background: '#bbf7d0', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', background: 'var(--green-600)', borderRadius: 3, width: `${(membership.requestsUsedThisMonth / 3) * 100}%` }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--green-700)' }}>Upgrade to Pro Club for unlimited requests</div>
          </div>
        )}

        <SettingRow label="Payment method" description="Used for subscription billing">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {plan.price > 0 ? (
              <div style={{ fontSize: 13, color: 'var(--slate-600)' }}>Visa ending 4242</div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--slate-400)' }}>No card on file</div>
            )}
            <Btn size="sm" onClick={() => setShowPricing(true)}>{plan.price > 0 ? 'Update' : 'Add card'}</Btn>
          </div>
        </SettingRow>
        <SettingRow label="Invoices" description="Download past invoices and receipts">
          <Btn size="sm" onClick={() => {}}>View invoices →</Btn>
        </SettingRow>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <SettingRow label="Delete account" description="Permanently delete your account and all data. This cannot be undone.">
          <Btn variant="danger" size="sm">Delete account</Btn>
        </SettingRow>
      </Section>
    </div>
  )
}
