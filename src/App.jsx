import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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

const USERS = {
  buyer:  { name: 'James Whitfield', org: 'Pine Valley CC' },
  seller: { name: 'Carlos Rivera',   org: 'Gulf Shore Aggregates' },
}

function AppShell({ role, setRole, onSignOut }) {
  const [newRequestOpen, setNewRequestOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const user = USERS[role] || USERS.buyer

  if (showAdmin) {
    return <Admin onExit={() => setShowAdmin(false)} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar role={role} onRoleToggle={setRole} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar
          role={role}
          onNewRequest={() => setNewRequestOpen(true)}
          onAdmin={() => setShowAdmin(true)}
          userName={user.name}
          orgName={user.org}
        />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard onNewRequest={() => setNewRequestOpen(true)} />} />
            <Route path="/requests"  element={<Requests  onNewRequest={() => setNewRequestOpen(true)} />} />
            <Route path="/bids"      element={<Bids />} />
            <Route path="/orders"    element={<Orders />} />
            <Route path="/savings"   element={<Savings />} />
            <Route path="/vendors"   element={<Vendors />} />
            <Route path="/settings"  element={<Settings role={role} />} />
            <Route path="/seller"         element={<SellerOpportunities />} />
            <Route path="/seller/bids"    element={<SellerOpportunities />} />
            <Route path="/seller/orders"  element={<Orders />} />
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
  const [screen, setScreen] = useState('landing') // landing | login | signup | forgot | app
  const [role, setRole]     = useState('buyer')

  const enter = (r) => { setRole(r); setScreen('app') }

  return (
    <BrowserRouter>
      {screen === 'landing' && (
        <Landing
          onEnter={enter}
          onLogin={() => setScreen('login')}
          onSignUp={() => setScreen('signup')}
        />
      )}
      {screen === 'login'  && <Login    onLogin={enter} onSignUp={() => setScreen('signup')} onForgot={() => setScreen('forgot')} />}
      {screen === 'signup' && <SignUp   onSignUp={enter} onLogin={() => setScreen('login')} />}
      {screen === 'forgot' && <ForgotPassword onBack={() => setScreen('login')} />}
      {screen === 'app'    && (
        <Routes>
          <Route path="/*" element={<AppShell role={role} setRole={setRole} onSignOut={() => setScreen('landing')} />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}
