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
import Settings from './pages/Settings.jsx'
import Admin from './pages/Admin.jsx'
import Pricing from './pages/Pricing.jsx'
import { UsageBanner } from './components/MembershipGate.jsx'
import { MOCK_MEMBERSHIP } from './lib/membership.js'

function LoadingScreen() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⛳</div>
      <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>Loading Fairway…</div>
    </div>
  )
}

function AppShell({ role, setRole, user, onSignOut }) {
  const [newRequestOpen, setNewRequestOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  const userName = user?.user_metadata?.full_name || 'User'
  const orgName = user?.user_metadata?.org_name || (role === 'buyer' ? 'My Club' : 'My Company')

  if (showAdmin) return <Admin onExit={() => setShowAdmin(false)} />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar role={role} onRoleToggle={setRole} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar role={role} onNewRequest={() => setNewRequestOpen(true)} onAdmin={() => setShowAdmin(true)} userName={userName} orgName={orgName} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <UsageBanner membership={MOCK_MEMBERSHIP[role]} role={role} />
          <Routes>
            <Route path="/dashboard" element={<Dashboard onNewRequest={() => setNewRequestOpen(true)} />} />
            <Route path="/requests" element={<Requests onNewRequest={() => setNewRequestOpen(true)} />} />
            <Route path="/bids" element={<Bids />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/settings" element={<Settings role={role} />} />
            <Route path="/pricing" element={<Pricing role={role} currentPlanId={MOCK_MEMBERSHIP[role]?.planId} />} />
            <Route path="/seller" element={<SellerOpportunities />} />
            <Route path="/seller/bids" element={<SellerOpportunities />} />
            <Route path="/seller/orders" element={<Orders />} />
            <Route path="/seller/profile" element={<SellerProfile />} />
            <Route path="*" element={<Navigate to={role === 'buyer' ? '/dashboard' : '/seller'} replace />} />
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

  useEffect(() => {
    // Check for existing session on load
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user)
        setRole(data.session.user?.user_metadata?.role || 'buyer')
        setScreen('app')
      } else {
        setScreen('landing')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        setRole(session.user?.user_metadata?.role || 'buyer')
        setScreen('app')
      } else {
        setUser(null)
        setScreen('landing')
      }
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
      {screen === 'landing' && <Landing onEnter={(r) => { setRole(r); setScreen('app') }} onLogin={() => setScreen('login')} onSignUp={() => setScreen('signup')} />}
      {screen === 'login' && <Login onLogin={(r, u) => { setRole(r); setUser(u); setScreen('app') }} onSignUp={() => setScreen('signup')} onForgot={() => setScreen('forgot')} />}
      {screen === 'signup' && <SignUp onSignUp={(r, u) => { setRole(r); setUser(u); setScreen('app') }} onLogin={() => setScreen('login')} />}
      {screen === 'forgot' && <ForgotPassword onBack={() => setScreen('login')} />}
      {screen === 'app' && (
        <Routes>
          <Route path="/*" element={<AppShell role={role} setRole={setRole} user={user} onSignOut={handleSignOut} />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}
