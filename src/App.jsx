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
import MyBids from './pages/MyBids.jsx'
import SellerDashboard from './pages/SellerDashboard.jsx'
import SubmitBid from './pages/SubmitBid.jsx'
import Settings from './pages/Settings.jsx'
import Pricing from './pages/Pricing.jsx'
import OrderDetail from './pages/OrderDetail.jsx'
import RequestDetail from './pages/RequestDetail.jsx'
import VendorProfile from './pages/VendorProfile.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function LoadingScreen() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⛳</div>
      <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>Loading Fairway…</div>
    </div>
  )
}

function AppShell({ role, user, onSignOut }) {
  const [newRequestOpen, setNewRequestOpen] = useState(false)
  const userName = user?.user_metadata?.full_name || 'User'
  const orgName = user?.user_metadata?.org_name || (role === 'buyer' ? 'My Club' : 'My Company')
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar role={role} onRoleToggle={() => {}} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
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
            <Route path="/seller/bids" element={<MyBids />} />
            <Route path="/seller/orders" element={<Orders />} />
            <Route path="/seller/profile" element={<SellerProfile />} />
            <Route path="/seller/bid/:id" element={<SubmitBid />} />
            <Route path="/orders/:id" element={<OrderDetail role={role} />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
            <Route path="/vendor/:id" element={<VendorProfile />} />
            <Route path="/seller/orders/:id" element={<OrderDetail role={role} />} />
            <Route path="/admin" element={<AdminDashboard />} />
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
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', sessionUser.id).single()
    const userRole = profile?.role || sessionUser?.user_metadata?.role || 'buyer'
    setRole(userRole)
    setUser(sessionUser)
    setScreen('app')
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
      {screen === 'landing' && <Landing onEnter={() => {}} onLogin={() => setScreen('login')} onSignUp={(r) => { setSignupRole(r || 'buyer'); setScreen('signup') }} />}
      {screen === 'login' && <Login onLogin={(r, u) => checkAccess(u)} onSignUp={() => setScreen('signup')} onForgot={() => setScreen('forgot')} />}
      {screen === 'signup' && <SignUp initialRole={signupRole} onSignUp={(r, u) => checkAccess(u)} onLogin={() => setScreen('login')} />}
      {screen === 'forgot' && <ForgotPassword onBack={() => setScreen('login')} />}
      {screen === 'app' && (
        <Routes>
          <Route path="/*" element={<AppShell role={role} user={user} onSignOut={handleSignOut} />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}
