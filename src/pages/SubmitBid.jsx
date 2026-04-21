import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { CATEGORIES } from '../lib/data.js'

const fmt = n => '$' + Number(n || 0).toLocaleString()

export default function SubmitBid() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ amount: '', delivery_days: '', notes: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    supabase.from('requests').select('*, buyer:profiles(org_name, location)').eq('id', id).single().then(({ data }) => {
      setRequest(data)
      setLoading(false)
    })
  }, [id])

  async function handleSubmit() {
    if (!form.amount) { setError('Please enter your bid amount'); return }
    setSubmitting(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const { data: newBid, error: err } = await supabase.from('bids').insert({
        request_id: id,
        vendor_id: user.id,
        amount: parseFloat(form.amount),
        delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
        notes: form.notes,
        status: 'pending'
      }).select().single()
      if (err) throw new Error(err.message)
      // Create in-app notification for buyer
      const { data: reqData } = await supabase.from('requests').select('buyer_id, title').eq('id', id).single()
      if (reqData?.buyer_id) {
        await supabase.from('notifications').insert({
          user_id: reqData.buyer_id,
          type: 'new_bid',
          title: 'New bid received',
          message: 'A vendor submitted a bid on: ' + reqData.title,
          read: false
        })
      }
      await supabase.functions.invoke('send-email', {
        body: { type: 'new_bid', bidId: newBid.id, requestId: id }
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 12, fontWeight: 500, color: '#64748b', display: 'block', marginBottom: 5 }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate-400)' }}>Loading...</div>
  if (!request) return <div style={{ padding: 40, textAlign: 'center' }}>Request not found</div>

  const isClosed = request.status === 'closed' || request.status === 'awarded' || (request.close_date && new Date(request.close_date) < new Date())
  if (isClosed) return (
    <div className="fade-in" style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>This request is closed</div>
      <div style={{ fontSize: 14, color: 'var(--slate-500)', marginBottom: 24 }}>This procurement request is no longer accepting bids.</div>
      <button onClick={() => navigate('/seller')} style={{ padding: '11px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Browse open requests</button>
    </div>
  )

  if (submitted) return (
    <div className="fade-in" style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Bid submitted!</div>
      <div style={{ fontSize: 14, color: 'var(--slate-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Your bid of <strong>{fmt(parseFloat(form.amount))}</strong> has been sent. You will be notified if awarded.
      </div>
      <button onClick={() => navigate('/seller')} style={{ padding: '11px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginRight: 10 }}>Browse more</button>
      <button onClick={() => navigate('/seller/dashboard')} style={{ padding: '11px 24px', background: '#f1f5f9', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Dashboard</button>
    </div>
  )

  const cat = CATEGORIES.find(c => c.id === request.category)
  return (
    <div className="fade-in" style={{ maxWidth: 580, margin: '0 auto' }}>
      <button onClick={() => navigate('/seller')} style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>Back to opportunities</button>
      <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '18px 20px', marginBottom: 24, border: '1px solid var(--slate-100)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: (cat?.color || '#888') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{cat?.icon || '📦'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{request.title}</div>
            <div style={{ fontSize: 12, color: 'var(--slate-500)', marginBottom: 6 }}>{request.buyer?.org_name} · {request.location}</div>
            {request.description && <div style={{ fontSize: 13, color: 'var(--slate-600)', lineHeight: 1.5 }}>{request.description}</div>}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 2 }}>Budget</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{fmt(request.budget)}</div>
            <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>Closes {request.close_date}</div>
          </div>
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--slate-100)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--slate-50)' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Submit your bid</div>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 13px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Your bid amount ($) *</label>
              <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder={String(Math.round(request.budget * 0.85))} style={inputStyle} />
              {form.amount && parseFloat(form.amount) < request.budget && (
                <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>{fmt(request.budget - parseFloat(form.amount))} below budget</div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Delivery time (days)</label>
              <input type="number" value={form.delivery_days} onChange={e => set('delivery_days', e.target.value)} placeholder="14" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notes & details</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="What is included, certifications, payment terms..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding: '13px', background: submitting ? '#94a3b8' : '#16a34a', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Submitting...' : 'Submit bid'}
          </button>
        </div>
      </div>
    </div>
  )
}
