import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Notifications() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifications(data || [])

      // Subscribe to real-time new notifications
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev])
        })
        .subscribe()

      return () => supabase.removeChannel(channel)
    }
    load()
  }, [])

  async function markRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id)
    setNotifications(ns => ns.map(n => ({ ...n, read: true })))
  }

  function timeAgo(date) {
    const s = Math.floor((Date.now() - new Date(date)) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return Math.floor(s/60) + 'm ago'
    if (s < 86400) return Math.floor(s/3600) + 'h ago'
    return Math.floor(s/86400) + 'd ago'
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 340, background: 'white', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,.15)', border: '1px solid var(--slate-100)', zIndex: 100, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--slate-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Notifications</div>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--green-600)', cursor: 'pointer', fontFamily: 'inherit' }}>Mark all read</button>
              )}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--slate-400)', fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                  No notifications yet
                </div>
              ) : notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--slate-50)', cursor: 'pointer', background: n.read ? 'white' : '#f0fdf4', display: 'flex', gap: 10, alignItems: 'flex-start' }}
                  onMouseEnter={e => e.currentTarget.style.background = n.read ? 'var(--slate-50)' : '#dcfce7'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'white' : '#f0fdf4'}
                >
                  <div style={{ fontSize: 20, flexShrink: 0 }}>
                    {n.type === 'bid_awarded' ? '🏆' : n.type === 'new_bid' ? '📨' : '🔔'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, marginBottom: 2 }}>{n.title}</div>
                    {n.message && <div style={{ fontSize: 12, color: 'var(--slate-500)', lineHeight: 1.4 }}>{n.message}</div>}
                    <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-500)', flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
