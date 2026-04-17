import React, { useState, useEffect } from 'react'
import { Card, PageHeader, Btn } from '../components/UI.jsx'
import { PlatformFeedback } from '../components/Feedback.jsx'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES } from '../lib/data.js'

function StripeConnect() {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({data:{user}}) => {
      if (!user) return
      supabase.from('profiles').select('stripe_account_id').eq('id', user.id).single().then(({data}) => {
        if (data?.stripe_account_id) setConnected(true)
      })
      const params = new URLSearchParams(window.location.search)
      if (params.get('connect') === 'success') setConnected(true)
    })
  }, [])

  async function handleConnect() {
    setConnecting(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.functions.invoke('create-connect-account', { body: { userId: user.id, email: user.email } })
    if (data?.url) {
      const prof = await supabase.from('profiles').select('stripe_account_id').eq('id', user.id).single()
      if (!prof.data?.stripe_account_id) {
        await supabase.from('profiles').update({ stripe_account_id: data.accountId }).eq('id', user.id)
      }
      window.location.href = data.url
    }
    setConnecting(false)
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--slate-500)', marginBottom: 12 }}>Connect your bank account to receive payments when you win contracts. Fairway takes a 5% platform fee.</div>
      {connected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 8 }}>
          <span style={{ color: '#16a34a' }}>✓</span>
          <span style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>Stripe account connected</span>
        </div>
      ) : null}
      <button onClick={handleConnect} disabled={connecting} style={{ padding: '9px 16px', background: connecting ? '#94a3b8' : '#635bff', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: connecting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>
        {connecting ? 'Redirecting...' : connected ? '🔄 Update Stripe account' : '⚡ Connect Stripe account'}
      </button>
    </div>
  )
}

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

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--slate-200)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const labelStyle = { fontSize: 12, fontWeight: 500, color: 'var(--slate-500)', display: 'block', marginBottom: 5 }

export default function Settings({ role }) {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ full_name: '', org_name: '', location: '', phone: '', contact_email: '', service_radius: 100, categories: [] })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [membership, setMembership] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)
      setForm({
        full_name: prof?.full_name || user.user_metadata?.full_name || '',
        org_name: prof?.org_name || user.user_metadata?.org_name || '',
        location: prof?.location || user.user_metadata?.location || '',
        phone: prof?.phone || '',
        contact_email: prof?.contact_email || '',
        service_radius: prof?.service_radius || 100,
        categories: prof?.categories || [],
      })
      const { data: mem } = await supabase.from('memberships').select('*').eq('user_id', user.id).single()
      setMembership(mem)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    await supabase.from('profiles').update({
      full_name: form.full_name,
      org_name: form.org_name,
      location: form.location,
      phone: form.phone,
      contact_email: form.contact_email,
      service_radius: form.service_radius,
      categories: form.categories,
    }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <Section title="Profile">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input value={form.full_name} onChange={e => set('full_name', e.target.value)} style={inputStyle} placeholder="Your name" />
          </div>
          <div>
            <label style={labelStyle}>{role === 'buyer' ? 'Club name' : 'Company name'}</label>
            <input value={form.org_name} onChange={e => set('org_name', e.target.value)} style={inputStyle} placeholder={role === 'buyer' ? 'Pine Valley CC' : 'Gulf Shore Aggregates'} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input value={user?.email || ''} disabled style={{ ...inputStyle, background: 'var(--slate-50)', color: 'var(--slate-400)' }} />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} style={inputStyle} placeholder="Naples, FL" />
          </div>
        </div>
        {role === 'seller' && (<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Phone number</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} style={inputStyle} placeholder="(555) 555-5555" />
            </div>
            <div>
              <label style={labelStyle}>Contact email</label>
              <input value={form.contact_email} onChange={e => set('contact_email', e.target.value)} style={inputStyle} placeholder="contact@yourcompany.com" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Service radius</label>
            <select value={form.service_radius} onChange={e => set('service_radius', parseInt(e.target.value))} style={{ ...inputStyle, background: 'white' }}>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
              <option value={250}>250 miles</option>
              <option value={500}>500 miles (regional)</option>
              <option value={9999}>Nationwide</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Categories you supply (select all that apply)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {CATEGORIES.map(cat => {
                const sel = form.categories.includes(cat.id)
                return (
                  <button key={cat.id} type="button" onClick={() => set('categories', sel ? form.categories.filter(x => x !== cat.id) : [...form.categories, cat.id])}
                    style={{ padding: '6px 12px', borderRadius: 20, border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', borderColor: sel ? 'var(--green-500)' : 'var(--slate-200)', background: sel ? 'var(--green-50)' : 'white', color: sel ? 'var(--green-700)' : 'var(--slate-600)' }}>
                    {cat.icon} {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </>)}
        <Btn variant="primary" onClick={handleSave} disabled={saving}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save changes'}
        </Btn>
      </Section>

      

      {role === 'seller' && (
        <Section title="Payment setup">
          <StripeConnect />
        </Section>
      )}

      <Section title="Share feedback">
        <PlatformFeedback role={role} />
      </Section>

      <Section title="Account">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>Sign out</div>
            <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>Sign out of your Fairway account</div>
          </div>
          <button onClick={handleSignOut} style={{ padding: '8px 16px', background: 'white', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </Section>

      <div style={{ marginTop: 8, padding: '16px 0', display: 'flex', gap: 20 }}>
        <a href="https://app.termly.io/policy-viewer/policy.html?policyUUID=6fc1aefa-fb21-4bdd-a989-0927eddf138f" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--slate-400)', textDecoration: 'none' }}>Privacy Policy</a>
        <a href="https://app.termly.io/policy-viewer/policy.html?policyUUID=7d3fcb96-f4c1-45ee-bb23-55494b26b0d2" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--slate-400)', textDecoration: 'none' }}>Terms of Service</a>
        <div style={{ fontSize: 12, color: 'var(--slate-300)' }}>© 2026 Fairway Procurement LLC</div>
      </div>
    </div>
  )
}
// Tue Apr 14 11:35:00 EDT 2026
