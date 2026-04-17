import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s/60) + 'm ago'
  if (s < 86400) return Math.floor(s/3600) + 'h ago'
  return Math.floor(s/86400) + 'd ago'
}

export default function ActivityFeed({ role }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (role === 'buyer') {
        // Get recent bids on buyer's requests
        const { data: bids } = await supabase.from('bids')
          .select('*, vendor:profiles(org_name, full_name), request:requests(title, buyer_id)')
          .eq('request.buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        const { data: orders } = await supabase.from('orders')
          .select('*, request:requests(title, buyer_id), bid:bids(vendor:profiles(org_name))')
          .eq('request.buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        const acts = [
          ...(bids||[]).map(b => ({
            id: 'bid-' + b.id,
            icon: '⚡',
            text: `${b.vendor?.org_name || 'A vendor'} submitted a bid on "${b.request?.title}"`,
            time: b.created_at,
            color: 'var(--blue-500)'
          })),
          ...(orders||[]).filter(o => o.status !== 'processing').map(o => ({
            id: 'order-' + o.id,
            icon: '📦',
            text: `${o.bid?.vendor?.org_name || 'Vendor'} updated order "${o.request?.title}" to ${o.status}`,
            time: o.updated_at || o.created_at,
            color: 'var(--green-600)'
          }))
        ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, 8)

        setActivities(acts)
      } else {
        // Vendor activity
        const { data: bids } = await supabase.from('bids')
          .select('*, request:requests(title, close_date)')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        const acts = (bids||[]).map(b => ({
          id: 'bid-' + b.id,
          icon: b.status === 'awarded' ? '🏆' : '📝',
          text: b.status === 'awarded' 
            ? `Your bid on "${b.request?.title}" was awarded!`
            : `You submitted a bid on "${b.request?.title}"`,
          time: b.created_at,
          color: b.status === 'awarded' ? 'var(--green-600)' : 'var(--slate-400)'
        }))

        setActivities(acts)
      }
      setLoading(false)
    }
    load()
  }, [role])

  if (loading || activities.length === 0) return null

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--slate-100)', overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--slate-50)', fontSize: 13, fontWeight: 700 }}>Recent activity</div>
      {activities.map(a => (
        <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--slate-50)', alignItems: 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{a.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--slate-700)', lineHeight: 1.4 }}>{a.text}</div>
            <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 3 }}>{timeAgo(a.time)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
