import React, { useState } from 'react'
import { Card, PageHeader, Btn, Badge } from '../components/UI.jsx'

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

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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

      {/* Billing */}
      <Section title="Billing & Plan">
        <SettingRow label="Current plan" description="All features included, no monthly fee">
          <Badge variant="success">Free — 3% per transaction</Badge>
        </SettingRow>
        <SettingRow label="Payment method" description="Used for vendor payouts and order processing">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--slate-600)' }}>Visa ending 4242</div>
            <Btn size="sm">Update</Btn>
          </div>
        </SettingRow>
        <SettingRow label="Invoices" description="Download past invoices and receipts">
          <Btn size="sm">View invoices →</Btn>
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
