import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function MobileNav({ role }) {
  const navigate = useNavigate()
  const location = useLocation()

  const buyerItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/requests', icon: '📋', label: 'Requests' },
    { path: '/bids', icon: '⚡', label: 'Bids' },
    { path: '/orders', icon: '📦', label: 'Orders' },
    { path: '/settings', icon: '⚙️', label: 'More' },
  ]
  const sellerItems = [
    { path: '/seller/dashboard', icon: '🏠', label: 'Home' },
    { path: '/seller', icon: '🔍', label: 'Browse' },
    { path: '/seller/bids', icon: '⚡', label: 'Bids' },
    { path: '/seller/profile', icon: '👤', label: 'Profile' },
    { path: '/settings', icon: '⚙️', label: 'More' },
  ]
  const items = role === 'buyer' ? buyerItems : sellerItems

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: '1px solid #e2e8f0',
      display: 'flex', zIndex: 9999,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(item => {
        const active = location.pathname === item.path ||
          (item.path.length > 8 && location.pathname.startsWith(item.path))
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 2, padding: '8px 4px', border: 'none', background: 'none',
            color: active ? '#16a34a' : '#94a3b8', cursor: 'pointer',
            fontFamily: 'system-ui',
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
