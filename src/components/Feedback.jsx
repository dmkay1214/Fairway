import React, { useState } from 'react'
import { supabase } from '../lib/supabase.js'

function StarRating({ value, onChange, readonly }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(star => (
        <button key={star} onClick={() => !readonly && onChange(star)} style={{
          background: 'none', border: 'none', fontSize: 24, cursor: readonly ? 'default' : 'pointer',
          color: star <= value ? '#f59e0b' : '#e2e8f0', padding: 2
        }}>★</button>
      ))}
    </div>
  )
}

export function TransactionReview({ orderId, revieweeId, role, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('reviews').insert({
      order_id: orderId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating,
      comment,
      role
    })
    setSubmitted(true)
    setSubmitting(false)
    if (onSubmitted) onSubmitted()
  }

  if (submitted) return (
    <div style={{ padding: '16px 20px', background: 'var(--green-50)', borderRadius: 10, border: '1px solid var(--green-100)', textAlign: 'center' }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>✅</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-700)' }}>Review submitted — thank you!</div>
    </div>
  )

  return (
    <div style={{ padding: '18px 20px', background: 'white', borderRadius: 12, border: '1px solid var(--slate-100)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
        {role === 'buyer' ? 'Rate this vendor' : 'Rate this club'}
      </div>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={role === 'buyer' ? 'How was the vendor? Reliable, on time, good quality?' : 'How was working with this club?'}
        rows={3}
        style={{ width: '100%', marginTop: 12, padding: '10px 12px', border: '1px solid var(--slate-200)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
      />
      <button onClick={handleSubmit} disabled={!rating || submitting} style={{
        marginTop: 10, padding: '10px 20px', background: rating ? 'var(--green-600)' : 'var(--slate-200)',
        color: rating ? 'white' : 'var(--slate-400)', border: 'none', borderRadius: 8, fontSize: 13,
        fontWeight: 600, cursor: rating ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)'
      }}>
        {submitting ? 'Submitting...' : 'Submit review'}
      </button>
    </div>
  )
}

export function PlatformFeedback({ role }) {
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!rating || !message) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('platform_feedback').insert({
      user_id: user.id,
      role,
      rating,
      category,
      message
    })
    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) return (
    <div style={{ padding: '16px 20px', background: 'var(--green-50)', borderRadius: 10, border: '1px solid var(--green-100)', textAlign: 'center' }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>🙏</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-700)' }}>Thank you for your feedback!</div>
      <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 4 }}>We use this to improve Fairway for everyone.</div>
    </div>
  )

  return (
    <div style={{ padding: '18px 20px', background: 'white', borderRadius: 12, border: '1px solid var(--slate-100)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Share feedback with Fairway</div>
      <div style={{ fontSize: 11, color: 'var(--slate-400)', marginBottom: 12 }}>Help us improve the platform for golf clubs and vendors.</div>
      
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--slate-500)', marginBottom: 6 }}>Overall rating</div>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--slate-500)', marginBottom: 6 }}>Category</div>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--slate-200)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', background: 'white' }}>
          <option value="">Select a category</option>
          <option value="ease_of_use">Ease of use</option>
          <option value="bid_quality">Bid quality</option>
          <option value="payment_process">Payment process</option>
          <option value="vendor_quality">Vendor quality</option>
          <option value="customer_support">Customer support</option>
          <option value="feature_request">Feature request</option>
          <option value="other">Other</option>
        </select>
      </div>

      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Tell us what's working well or what could be improved..."
        rows={4}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--slate-200)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 10 }}
      />
      <button onClick={handleSubmit} disabled={!rating || !message || submitting} style={{
        padding: '10px 20px', background: (rating && message) ? 'var(--green-600)' : 'var(--slate-200)',
        color: (rating && message) ? 'white' : 'var(--slate-400)', border: 'none', borderRadius: 8,
        fontSize: 13, fontWeight: 600, cursor: (rating && message) ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)'
      }}>
        {submitting ? 'Submitting...' : 'Send feedback'}
      </button>
    </div>
  )
}
