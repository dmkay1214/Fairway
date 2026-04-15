import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import NewRequestModal from './components/NewRequestModal.jsx'
import Landing from './pages/Landing.jsx'
import { Login, SignUp, ForgotPassword } from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Requests from './pages/Requests.jsx'
import Bids from './pages/Bids.jsx'
import { Orders, Savings, Vendors } from './pages/BuyerPages.jsx'
import { SellerOpportunities, SellerProfile } from './pages/SellerPages.jsx'
import SubmitBid from './pages/SubmitBid.jsx'
import SellerDashboard from './pages/SellerDashboard.jsx'
import Settings from './pages/Settings.jsx'
import Admin from './pages/Admin.jsx'
import Pricing from './pages/Pricing.jsx'

function LoadingScreen() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⛳</div>
      <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>Loading Fairway…</div>
    </div>
  )
}

function PaywallScreen({ user, onSignOut }) {
  const [loading, setLoading] = useState(false)
  async function handleCheckout() {
    setLoading(true)
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId: 'price_1TLoZpKSFMa1JWApWkk7Crnk', userId: user.id, email: user.email, planName: 'Pro Club' }
    })
    if (data?.url) window.location.href = data.url
    else { alert('Error: ' + (error?.message || 'Unknown')); setLoading(false) }
  }
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⛳</div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white' }}>Fairway</span>
      </div>
      <div style={{ width: '100%', maxWidth: 480, background: '#141414', borderRadius: 20, padding: '36px', border: '1px solid #222', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🏌️</div>
        <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: 'white', marginBottom: 8 }}>Welcome to Fairway</div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 28, lineHeight: 1.7 }}>
          Access to the Club Portal requires an active Pro Club subscription.<br />Start saving 18–35% on your course procurement today.
        </div>
        <div style={{ background: '#0d2318', border: '1.5px solid var(--green-500)', borderRadius: 14, padding: '20px 24px', marginBottom: 24, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Pro Club</div>
              <div style={{ fontSize: 12, color: 'var(--green-600)', marginTop: 2 }}>Full platform access</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>$1,000</div>
              <div style={{ fontSize: 11, color: '#555' }}>/month</div>
            </div>
          </div>
          {['Unlimited procurement requests', 'Competing bids from verified vendors', 'Full savings & analytics reporting', 'Complete vendor directory access', 'Priority support'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <span style={{ color: 'var(--green-400)', fontSize: 12 }}>✓</span>
              <span style={{ fontSize: 13, color: '#aaa' }}>{f}</span>
            </div>
          ))}
        </div>
        <button onClick={handleCheckout} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: loading ? '#333' : 'var(--green-600)', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', marginBottom: 12 }}>
          {loading ? 'Redirecting to checkout...' : 'Subscribe — $1,000/month →'}
        </button>
        <div style={{ fontSize: 11, color: '#444', marginBottom: 16 }}>Cancel anytime. Billed monthly via Stripe.</div>
        <button onClick={onSignOut} style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Sign out</button>
      </div>
    </div>
  )
}

function AppShell({ role, user, onSignOut }) {
  const [newRequestOpen, setNewRequestOpen] = useState(false)
  const userName = user?.user_metadata?.full_name || 'User'
  const orgName = user?.user_metadata?.org_name || (role === 'buyer' ? 'My Club' : 'My Company')
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {window.innerWidth > 768 && <div style={{ flexShrink: 0 }}><Sidebar role={role} onRoleToggle={() => {}} /></div>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar role={role} onNewRequest={() => setNewRequestOpen(true)} userName={userName} orgName={orgName} onSignOut={onSignOut} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard onNewRequest={() => setNewRequestOpen(true)} />} />
            <Route path="/requests" element={<Requests onNewRequest={() => setNewRequestOpen(true)} />} />
            <Route path="/bids" element={<Bids />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/settings" element={<Settings role={role} />} />
            <Route path="/pricing" element={<Pricing role={role} userId={user?.id} userEmail={user?.email} />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller" element={<SellerOpportunities />} />
            <Route path="/seller/bids" element={<SellerOpportunities />} />
            <Route path="/seller/orders" element={<Orders />} />
            <Route path="/seller/profile" element={<SellerProfile />} />
            <Route path="/seller/bid/:id" element={<SubmitBid />} />
            <Route path="*" element={<Navigate to={role === 'buyer' ? '/dashboard' : '/seller/dashboard'} replace />} />
          </Routes>
        </main>
      </div>
      <NewRequestModal open={newRequestOpen} onClose={() => setNewRequestOpen(false)} />
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [role, setRole] = useState('buyer')
  const [user, setUser] = useState(null)
  const [signupRole, setSignupRole] = useState('buyer')

  async function checkAccess(sessionUser) {
    // Check profile for role first, fallback to metadata
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', sessionUser.id).single()
    const userRole = profile?.role || sessionUser?.user_metadata?.role || 'buyer'
    setRole(userRole)
    setUser(sessionUser)
    if (userRole === 'seller') { setScreen('app'); return }
    const { data } = await supabase.from('memberships').select('plan_id, status').eq('user_id', sessionUser.id).single()
    const isPaid = data?.plan_id === 'buyer_pro' && data?.status === 'active'
    setScreen(isPaid ? 'app' : 'paywall')
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) checkAccess(data.session.user)
      else setScreen('landing')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) checkAccess(session.user)
      else { setUser(null); setScreen('landing') }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setScreen('landing')
    setUser(null)
  }

  if (screen === 'loading') return <LoadingScreen />

  return (
    <BrowserRouter>
      {screen === 'landing' && <Landing onEnter={() => {}} onLogin={() => setScreen('login')} onSignUp={(r) => { setSignupRole(r); setScreen('signup') }} />}
      {screen === 'login' && <Login onLogin={(r, u) => checkAccess(u)} onSignUp={() => setScreen('signup')} onForgot={() => setScreen('forgot')} />}
      {screen === 'signup' && <SignUp initialRole={signupRole} onSignUp={(r, u) => checkAccess(u)} onLogin={() => setScreen('login')} />}
      {screen === 'forgot' && <ForgotPassword onBack={() => setScreen('login')} />}
      {screen === 'paywall' && <PaywallScreen user={user} onSignOut={handleSignOut} />}
      {screen === 'app' && (
        <Routes>
          <Route path="/*" element={<AppShell role={role} user={user} onSignOut={handleSignOut} />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}
// force 1776196566
