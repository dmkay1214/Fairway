import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const buyerNav = [
  { path: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { path: '/requests', label: 'My Requests', icon: ListIcon },
  { path: '/bids', label: 'Live Bids', icon: ChartIcon },
  { path: '/orders', label: 'Orders', icon: BoxIcon },
  { path: '/savings', label: 'Savings Report', icon: TrendIcon },
  { path: '/vendors', label: 'Vendor Directory', icon: UsersIcon },
  { path: '/settings', label: 'Settings', icon: GearIcon },
  { path: '/pricing', label: 'Upgrade plan', icon: StarIcon },
]

const sellerNav = [
  { path: '/seller', label: 'Opportunities', icon: SearchIcon },
  { path: '/seller/bids', label: 'My Bids', icon: ChartIcon },
  { path: '/seller/orders', label: 'Active Orders', icon: BoxIcon },
  { path: '/seller/profile', label: 'Profile & Ratings', icon: StarIcon },
]

export default function Sidebar({ role, onRoleToggle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const nav = role === 'buyer' ? buyerNav : sellerNav
  const [profile, setProfile] = useState(null)
  const [counts, setCounts] = useState({})

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('full_name, org_name').eq('id', user.id).single().then(({ data }) => setProfile(data))
        if (role === 'buyer') {
          supabase.from('requests').select('id, bids(count)').eq('buyer_id', user.id).eq('status', 'bidding').then(({ data }) => {
            const r = data?.length || 0
            const b = data?.reduce((s, x) => s + (x.bids?.[0]?.count || 0), 0) || 0
            setCounts({ requests: r || null, bids: b || null })
          })
        }
      }
    })
  }, [role])

  const displayName = profile?.full_name || 'My Account'
  const displayOrg = profile?.org_name || (role === 'buyer' ? 'My Club' : 'My Company')
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)', background: 'var(--slate-900)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlagIcon />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'white', lineHeight: 1 }}>Fairway</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 2, letterSpacing: '.05em', textTransform: 'uppercase' }}>Procurement</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 12px 4px' }}>
        <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 'var(--radius-md)', padding: '8px 12px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>
            {role === 'buyer' ? '🏌️ Club Portal' : '🏢 Vendor Portal'}
          </span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.25)', padding: '12px 12px 6px', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          {role === 'buyer' ? 'Club Portal' : 'Vendor Portal'}
        </div>
        {nav.map(item => {
          const active = location.pathname === item.path || (item.path !== '/dashboard' && item.path !== '/seller' && location.pathname.startsWith(item.path))
          const Icon = item.icon
          const badgeVal = item.badgeKey ? counts[item.badgeKey] : null
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: 2, background: active ? 'var(--green-600)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,.5)', fontSize: 13, fontWeight: active ? 500 : 400, fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'all .15s' }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'white' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.5)' } }}
            >
              <Icon active={active} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {badgeVal ? (
                <span style={{ background: active ? 'rgba(255,255,255,.25)' : 'var(--green-600)', color: 'white', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>
                  {badgeVal}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: role === 'buyer' ? 'var(--green-700)' : '#1f6feb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: 'white', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayOrg}</div>
        </div>
      </div>
    </div>
  )
}

function FlagIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="white"><path d="M2 2v13M2 2l10 3-10 4"/><path stroke="white" strokeWidth="1.5" strokeLinecap="round" d="M2 2l10 3-10 4" fill="none"/></svg> }
function GridIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill={active ? 'white' : 'rgba(255,255,255,.5)'}><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> }
function ListIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,.5)'} strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="4" x2="13" y2="4"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="3" y1="12" x2="10" y2="12"/></svg> }
function ChartIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill={active ? 'white' : 'rgba(255,255,255,.5)'}><rect x="1" y="9" width="3" height="6" rx="1"/><rect x="6" y="5" width="3" height="10" rx="1"/><rect x="11" y="1" width="3" height="14" rx="1"/></svg> }
function BoxIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,.5)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="14" height="11" rx="1.5"/><path d="M5 4V2.5A1.5 1.5 0 016.5 1h3A1.5 1.5 0 0111 2.5V4"/><line x1="1" y1="8" x2="15" y2="8"/></svg> }
function TrendIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,.5)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,12 5,7 9,10 15,3"/><polyline points="11,3 15,3 15,7"/></svg> }
function UsersIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill={active ? 'white' : 'rgba(255,255,255,.5)'}><circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5H1z"/><circle cx="12" cy="5" r="2"/><path d="M10 14c0-2.2 1.3-4.1 3.2-4.8V14H10z"/></svg> }
function SearchIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,.5)'} strokeWidth="1.5" strokeLinecap="round"><circle cx="6.5" cy="6.5" r="4"/><line x1="9.5" y1="9.5" x2="14" y2="14"/></svg> }
function StarIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill={active ? 'white' : 'rgba(255,255,255,.5)'}><path d="M8 1l1.8 4H14l-3.4 2.5 1.3 4L8 9 4.1 11.5l1.3-4L2 5h4.2z"/></svg> }
function GearIcon({ active }) { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke={active ? 'white' : 'rgba(255,255,255,.5)'} strokeWidth="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg> }
