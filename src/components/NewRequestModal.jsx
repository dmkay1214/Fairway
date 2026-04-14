import React, { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES } from '../lib/data.js'

export default function NewRequestModal({ open, onClose }) {
  const [form, setForm] = useState({ category: 'sand', title: '', description: '', budget: '', close_date: '', location: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    if (!form.title || !form.budget || !form.close_date) { setError('Please fill in title, budget and deadline'); return }
    setLoading(true); setError('')
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Not logged in')
      const { error: err } = await supabase.from('requests').insert({
        buyer_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        budget: parseFloat(form.budget),
        close_date: form.close_date,
        location: form.location,
        notes: form.notes,
        status: 'bidding'
      })
      if (err) throw new Error(err.message)
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSubmitted(false)
    setForm({ category: 'sand', title: '', description: '', budget: '', close_date: '', location: '', notes: '' })
    setError('')
    onClose()
  }

  if (!open) return null

  const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
  const cardStyle = { background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.2)' }
  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 12, fontWeight: 500, color: '#64748b', display: 'block', marginBottom: 5 }

  if (submitted) return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={{ ...cardStyle, padding: '40px 32px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Request posted!</div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>Vendors have been notified. Most requests get their first bid within 2 hours.</div>
        <button onClick={handleClose} style={{ padding: '10px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Done</button>
      </div>
    </div>
  )

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Post a new request</div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>×</button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 13px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <div>
            <label style={labelStyle}>Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Request title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Bunker sand — 40 tons, USGA certified" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description & specifications</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Quantity, specs, certifications, delivery requirements..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Budget ($) *</label>
              <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="8000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bid deadline *</label>
              <input type="date" value={form.close_date} onChange={e => set('close_date', e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Delivery location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Club name & address" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Additional notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Insurance requirements, COI, special handling..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={handleClose} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', background: loading ? '#94a3b8' : '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Posting...' : 'Post request →'}
          </button>
        </div>
      </div>
    </div>
  )
}
