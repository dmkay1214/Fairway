import React, { useState } from 'react'

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'bid', title: 'New bid on your request', body: 'Gulf Shore Aggregates bid $5,920 on Bunker sand — 40 tons', time: '2 min ago', read: false, icon: '💰' },
  { id: 2, type: 'bid', title: 'New bid received', body: 'Carolina Sand Dist. bid $6,340 on Bunker sand — 40 tons', time: '14 min ago', read: false, icon: '💰' },
  { id: 3, type: 'closing', title: 'Request closing soon', body: 'Fairway mower rental closes in 4 hours with 4 bids', time: '1 hr ago', read: false, icon: '⏰' },
  { id: 4, type: 'delivery', title: 'Order in transit', body: 'Fertilizer — Greens mix is on its way. Delivery Dec 15.', time: '3 hrs ago', read: true, icon: '🚚' },
  { id: 5, type: 'awarded', title: 'Order confirmed', body: 'Seasonal labor PO-2025-0038 confirmed with TurfLine Labor Co.', time: 'Yesterday', read: true, icon: '✅' },
]

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS)
  const unread = notifs.filter(n => !n.read).length

  function markAllRead() {
    setNotifs(n => n.map(x => ({ ...x, read: true })))
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, borderRadius: 9,
          border: '1px solid var(--slate-200)', background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--slate-600)" strokeWidth="1.5">
          <path d="M8 1a5 5 0 015 5v3l1.5 2H1.5L3 9V6a5 5 0 015-5z" />
          <path d="M6.5 13a1.5 1.5 0 003 0" />
        </svg>
        {unread > 0 && (
          <div style={{
            position: 'absolute', top: 5, right: 5,
            width: 7, height: 7, borderRadius: '50%',
            background: '#ef4444', border: '1.5px solid white',
          }} />
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{
            position: 'absolute', right: 0, top: 44, zIndex: 100,
            width: 340, background: 'white',
            border: '1px solid var(--slate-100)', borderRadius: 14,
            boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
          }} className="fade-in">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid var(--slate-50)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                Notifications {unread > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: 10, padding: '1px 6px', borderRadius: 10, marginLeft: 6 }}>{unread}</span>}
              </div>
              {unread > 0 && (
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--green-600)', cursor: 'pointer', fontWeight: 500 }}>
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
                  style={{
                    display: 'flex', gap: 11, padding: '12px 16px',
                    borderBottom: '1px solid var(--slate-50)',
                    background: n.read ? 'transparent' : 'var(--green-50)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'var(--green-50)'}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, background: 'var(--slate-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate-800)', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate-500)', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.body}</div>
                    <div style={{ fontSize: 10, color: 'var(--slate-400)', marginTop: 3 }}>{n.time}</div>
                  </div>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-500)', flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
            {notifs.every(n => n.read) && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--slate-400)', fontSize: 13 }}>
                All caught up ✓
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
