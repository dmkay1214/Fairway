import React, { useState, useEffect } from 'react'
import { Card, PageHeader, Btn } from '../components/UI.jsx'
import { PlatformFeedback } from '../components/Feedback.jsx'
import { supabase } from '../lib/supabase.js'

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
  const [form, setForm] = useState({ full_name: '', org_name: '', location: '' })
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
        <Btn variant="primary" onClick={handleSave} disabled={saving}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save changes'}
        </Btn>
      </Section>

      

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
