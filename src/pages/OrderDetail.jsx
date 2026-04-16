import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { Card, Btn, Badge } from '../components/UI.jsx'

const fmt = n => '$' + Number(n || 0).toLocaleString()

const STATUS_STEPS = ['processing', 'confirmed', 'scheduled', 'delivered']
const STATUS_LABELS = { processing: 'Order placed', confirmed: 'Confirmed by vendor', scheduled: 'Delivery scheduled', delivered: 'Delivered' }
const STATUS_ICONS = { processing: '📋', confirmed: '✅', scheduled: '🚚', delivered: '📦' }
const NEXT_STATUS = { processing: 'confirmed', confirmed: 'scheduled', scheduled: 'delivered' }
const NEXT_LABEL = { processing: 'Confirm order', confirmed: 'Mark as scheduled', scheduled: 'Mark as delivered' }

export default function OrderDetail({ role }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    supabase.from('orders')
      .select('*, request:requests(title, description, category, budget, close_date, location, buyer:profiles(org_name, location, full_name)), bid:bids(amount, notes, delivery_days, vendor:profiles(org_name, full_name, location, phone, contact_email, stripe_account_id))')
      .or(`id.eq.${id},bid_id.eq.${id}`)
      .single()
      .then(({ data }) => {
        setOrder(data)
        setLoading(false)
      })
  }, [id])

  async function handleStatusUpdate() {
    if (!order || !NEXT_STATUS[order.status]) return
    setUpdating(true)
    const newStatus = NEXT_STATUS[order.status]
    await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    setOrder(o => ({ ...o, status: newStatus }))
    setUpdating(false)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate-400)' }}>Loading...</div>
  if (!order) return <div style={{ padding: 40, textAlign: 'center' }}>Order not found</div>

  const isPaid = ['paid', 'confirmed', 'scheduled', 'delivered'].includes(order.status)
  const savings = (order.request?.budget || 0) - (order.bid?.amount || 0)
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <button onClick={() => navigate(role === 'seller' ? '/seller/orders' : '/orders')} style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>← Back to orders</button>

      {/* Order header */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--slate-100)', padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{order.request?.title}</div>
            <div style={{ fontSize: 13, color: 'var(--slate-400)' }}>Order #{id.slice(0, 8).toUpperCase()}</div>
          </div>
          <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'paid' || order.status === 'confirmed' ? 'success' : 'warning'}>
            {order.status}
          </Badge>
        </div>

        {/* Status timeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8 }}>
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentStep
            const active = i === currentStep
            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? 'var(--green-500)' : 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginBottom: 4, border: active ? '2px solid var(--green-400)' : 'none' }}>
                    {done ? '✓' : STATUS_ICONS[step]}
                  </div>
                  <div style={{ fontSize: 10, color: done ? 'var(--green-600)' : 'var(--slate-400)', textAlign: 'center', fontWeight: done ? 600 : 400 }}>{STATUS_LABELS[step]}</div>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ height: 2, flex: 1, background: i < currentStep ? 'var(--green-400)' : 'var(--slate-100)', marginBottom: 20 }} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Financial summary */}
        <Card style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Payment</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{fmt(order.bid?.amount)}</div>
          {savings > 0 && <div style={{ fontSize: 12, color: 'var(--green-600)', marginBottom: 4 }}>💰 Saved {fmt(savings)} vs budget</div>}
          {order.bid?.delivery_days && <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>🗓 {order.bid.delivery_days} day delivery</div>}
          <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 4 }}>Status: <strong>{order.status}</strong></div>
        </Card>

        {/* Contact info */}
        <Card style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
            {role === 'seller' ? 'Club details' : 'Vendor details'}
          </div>
          {role === 'seller' ? (<>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{order.request?.buyer?.org_name}</div>
            <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>{order.request?.buyer?.location || order.request?.location}</div>
          </>) : (<>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{order.bid?.vendor?.org_name || order.bid?.vendor?.full_name}</div>
            <div style={{ fontSize: 12, color: 'var(--slate-400)', marginBottom: 6 }}>{order.bid?.vendor?.location}</div>
            {isPaid ? (<>
              {order.bid?.vendor?.phone && <div style={{ fontSize: 12, marginBottom: 2 }}>📞 <a href={'tel:' + order.bid.vendor.phone} style={{ color: 'var(--green-600)', textDecoration: 'none' }}>{order.bid.vendor.phone}</a></div>}
              {order.bid?.vendor?.contact_email && <div style={{ fontSize: 12 }}>✉️ <a href={'mailto:' + order.bid.vendor.contact_email} style={{ color: 'var(--green-600)', textDecoration: 'none' }}>{order.bid.vendor.contact_email}</a></div>}
            </>) : (
              <div style={{ fontSize: 11, color: 'var(--slate-400)', fontStyle: 'italic' }}>Contact info revealed after transaction to coordinate shipping & handling</div>
            )}
          </>)}
        </Card>
      </div>

      {/* Bid notes */}
      {order.bid?.notes && (
        <Card style={{ padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Vendor notes</div>
          <div style={{ fontSize: 13, color: 'var(--slate-600)', lineHeight: 1.6 }}>{order.bid.notes}</div>
        </Card>
      )}

      {/* Vendor status update */}
      {role === 'seller' && order.status !== 'delivered' && NEXT_STATUS[order.status] && (
        <Card style={{ padding: '18px 20px', background: 'var(--green-50)', border: '1px solid var(--green-100)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Update order status</div>
          <div style={{ fontSize: 12, color: 'var(--slate-500)', marginBottom: 12 }}>Keep the buyer informed about their order progress.</div>
          <Btn variant="primary" onClick={handleStatusUpdate} disabled={updating}>
            {updating ? 'Updating...' : NEXT_LABEL[order.status]}
          </Btn>
        </Card>
      )}
    </div>
  )
}
