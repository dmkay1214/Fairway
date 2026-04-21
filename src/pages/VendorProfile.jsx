import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { Card, Badge } from '../components/UI.jsx'
import { CATEGORIES } from '../lib/data.js'

function StarRating({ value }) {
  return (
    <span>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= value ? '#f59e0b' : '#e2e8f0', fontSize: 16 }}>★</span>
      ))}
    </span>
  )
}

export default function VendorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: v } = await supabase.from('profiles').select('*').eq('id', id).single()
      const { data: r } = await supabase.from('reviews').select('*, reviewer:profiles(org_name, full_name)').eq('reviewee_id', id).order('created_at', { ascending: false })
      setVendor(v)
      setReviews(r || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate-400)' }}>Loading...</div>
  if (!vendor) return <div style={{ padding: 40, textAlign: 'center' }}>Vendor not found</div>

  const avgRating = reviews.length > 0 ? reviews.reduce((s,r) => s + r.rating, 0) / reviews.length : 0
  const initials = (vendor.org_name || vendor.full_name || 'V').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="fade-in" style={{ maxWidth: 680, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>Back</button>

      <Card style={{ padding: '24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: 'var(--green-100)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{vendor.org_name || vendor.full_name}</div>
            <div style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 8 }}>{vendor.location}</div>
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StarRating value={Math.round(avgRating)} />
                <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>{avgRating.toFixed(1)} ({reviews.length} review{reviews.length > 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
          {vendor.service_radius && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>Service radius</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{vendor.service_radius === 9999 ? 'Nationwide' : vendor.service_radius + ' miles'}</div>
            </div>
          )}
        </div>
      </Card>

      {vendor.categories?.length > 0 && (
        <Card style={{ padding: '18px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Services offered</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {vendor.categories.map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId)
              return <Badge key={catId}>{cat?.icon} {cat?.label || catId}</Badge>
            })}
          </div>
        </Card>
      )}

      <Card style={{ padding: '18px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Reviews {reviews.length > 0 ? '(' + reviews.length + ')' : ''}</div>
        {reviews.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--slate-400)', textAlign: 'center', padding: '20px 0' }}>No reviews yet</div>
        ) : reviews.map(r => (
          <div key={r.id} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid var(--slate-50)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{r.reviewer?.org_name || r.reviewer?.full_name || 'Anonymous'}</span>
              <StarRating value={r.rating} />
            </div>
            {r.comment && <div style={{ fontSize: 13, color: 'var(--slate-600)', lineHeight: 1.6 }}>{r.comment}</div>}
            <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>{new Date(r.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </Card>
    </div>
  )
}
