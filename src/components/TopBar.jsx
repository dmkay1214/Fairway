import React, { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import NotificationBell from './Notifications.jsx'

const isMobile = () => window.innerWidth <= 768

export default function TopBar({ role, onNewRequest, onAdmin, userName, orgName, onSignOut }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const mobile = isMobile()

  return (
    <div style={{
      height: 'var(--topbar-height)', background: 'white',
      borderBottom: '1px solid var(--slate-100)',
      display: 'flex', alignItems: 'center',
      padding: mobile ? '0 16px' : '0 28px', gap: 10, flexShrink: 0,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Search - hidden on mobile */}
      {!mobile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--slate-50)', border: '1px solid var(--slate-200)',
          borderRadius: 9, padding: '7px 12px', flex: 1, maxWidth: 320,
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--slate-400)" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <input placeholder="Search requests, vendors…"
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--slate-700)', width: '100%' }}
          />
        </div>
      )}

      {/* Mobile: Fairway logo */}
      {mobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⛳</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Fairway</span>
        </div>
      )}

      {!mobile && <div style={{ flex: 1 }} />}

      {/* Post Request - buyers only, hidden on mobile (in bottom nav instead) */}
      {role === 'buyer' && !mobile && (
        <button onClick={onNewRequest} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 9, border: 'none',
          background: 'var(--green-600)', color: 'white',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
          Post Request
        </button>
      )}

      {/* Notifications */}
      <NotificationBell />

      {/* User avatar */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setUserMenuOpen(o => !o)} style={{
          display: 'flex', alignItems: 'center', gap: mobile ? 0 : 8,
          padding: mobile ? '4px' : '5px 5px 5px 8px', borderRadius: 9,
          border: mobile ? 'none' : '1px solid var(--slate-200)', background: 'white',
          cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}>
          {!mobile && <div style={{ fontSize: 12, color: 'var(--slate-600)', fontWeight: 500 }}>{orgName}</div>}
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: role === 'buyer' ? 'var(--green-600)' : '#1f6feb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'white',
          }}>
            {(userName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
        </button>

        {userMenuOpen && (
          <>
            <div onClick={() => setUserMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
            <div style={{
              position: 'absolute', right: 0, top: 44, zIndex: 100,
              width: 200, background: 'white',
              border: '1px solid var(--slate-100)', borderRadius: 12,
              boxShadow: 'var(--shadow-md)', overflow: 'hidden', padding: '6px',
            }}>
              <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--slate-50)', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{userName}</div>
                <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{orgName}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--slate-50)', marginTop: 4, paddingTop: 4 }}>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }} style={{
                  display: 'block', width: '100%', padding: '8px 12px',
                  border: 'none', background: 'none', textAlign: 'left',
                  fontSize: 13, color: '#ef4444', cursor: 'pointer',
                  borderRadius: 7, fontFamily: 'var(--font-body)',
                }}>Sign out</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
