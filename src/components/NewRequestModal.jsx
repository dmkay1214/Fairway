import React, { useState } from 'react'
import { Modal, Input, Select, Textarea, Btn } from './UI.jsx'
import { CATEGORIES } from '../lib/data.js'

export default function NewRequestModal({ open, onClose }) {
  const [form, setForm] = useState({
    category: 'sand', title: '', description: '', budget: '', closeDate: '', location: 'Pine Valley CC, Naples FL', notes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (submitted) {
    return (
      <Modal open={open} onClose={() => { setSubmitted(false); onClose() }} title="Request posted!">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Your request is live!</div>
          <div style={{ fontSize: 13, color: 'var(--slate-500)', marginBottom: 24, lineHeight: 1.6 }}>
            Vendors in your area have been notified. You'll receive an email when bids come in. Most requests receive their first bid within 2 hours.
          </div>
          <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 'var(--radius-md)', padding: 14, fontSize: 13, color: 'var(--green-700)' }}>
            💡 Tip: requests with detailed specs get 40% more bids and better pricing.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Btn variant="primary" onClick={() => { setSubmitted(false); onClose() }}>View live bids</Btn>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post a new request"
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={() => { if (form.title && form.budget) setSubmitted(true) }}>
          Post request →
        </Btn>
      </>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Select
          label="Category"
          value={form.category}
          onChange={e => set('category', e.target.value)}
          options={CATEGORIES.map(c => ({ value: c.id, label: c.icon + ' ' + c.label }))}
          required
        />
        <Input label="Request title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Bunker sand — 40 tons, USGA certified" required />
        <Textarea label="Description & specifications" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Include quantity, specs, certifications needed, delivery requirements..." rows={3} required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Input label="Budget ($)" type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="8000" required />
          <Input label="Bid deadline" type="date" value={form.closeDate} onChange={e => set('closeDate', e.target.value)} required />
        </div>
        <Input label="Delivery location" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Club name & address" required />
        <Textarea label="Additional notes" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Insurance requirements, COI, special handling, contacts..." rows={2} />
        <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 12, color: 'var(--slate-500)', lineHeight: 1.6 }}>
          ✓ Your request will be sent to {Math.floor(Math.random()*20)+15} verified vendors in your area<br />
          ✓ Most clubs receive their first bid within 2 hours<br />
          ✓ You only award if you're happy — no obligation
        </div>
      </div>
    </Modal>
  )
}
