import React, { useState } from 'react'

export default function Landing({ onEnter, onLogin, onSignUp }) {
  const [mode, setMode] = useState('landing') // landing | login | signup

  if (mode === 'login' || mode === 'signup') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--slate-900)', padding: 20,
      }}>
        <div style={{
          width: '100%', maxWidth: 420, background: 'white',
          borderRadius: 20, padding: 36, boxShadow: '0 24px 64px rgba(0,0,0,.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 16 }}>⛳</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>Fairway</div>
          </div>
          <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Get started'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 24 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </div>
          {mode === 'signup' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['⛳ Buyer (Club)', '🏢 Seller (Vendor)'].map((label, i) => (
                <button key={i} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: '1.5px solid',
                  borderColor: i === 0 ? 'var(--green-400)' : 'var(--slate-200)',
                  background: i === 0 ? 'var(--green-50)' : 'white',
                  color: i === 0 ? 'var(--green-700)' : 'var(--slate-500)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}>
                  {label}
                </button>
              ))}
            </div>
          )}
          {[
            ...(mode === 'signup' ? [{ label: 'Full name', placeholder: 'James Whitfield', type: 'text' }] : []),
            { label: 'Email', placeholder: 'james@pinevalleycc.com', type: 'email' },
            { label: 'Password', placeholder: '••••••••', type: 'password' },
          ].map(field => (
            <div key={field.label} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--slate-600)', display: 'block', marginBottom: 5 }}>{field.label}</label>
              <input type={field.type} placeholder={field.placeholder} style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--slate-200)',
                borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
              }} />
            </div>
          ))}
          <button
            onClick={() => onSignUp()}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: 'var(--green-600)', color: 'white', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 4, marginBottom: 14,
            }}
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate-400)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{
              background: 'none', border: 'none', color: 'var(--green-600)', cursor: 'pointer', fontWeight: 500, fontSize: 13,
            }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-900)', overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 48px', borderBottom: '1px solid rgba(255,255,255,.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: 15 }}>⛳</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'white' }}>Fairway</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onLogin ? onLogin() : setMode('login')} style={{
            padding: '9px 18px', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8,
            background: 'transparent', color: 'rgba(255,255,255,.7)', cursor: 'pointer',
            fontSize: 13, fontFamily: 'var(--font-body)',
          }}>Log in</button>
          <button onClick={() => onSignUp ? onSignUp() : setMode('signup')} style={{
            padding: '9px 18px', border: 'none', borderRadius: 8,
            background: 'var(--green-500)', color: 'white', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
          }}>Get started free</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '80px 48px 60px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(33,158,98,.15)', border: '1px solid rgba(33,158,98,.3)',
          borderRadius: 'var(--radius-full)', padding: '6px 14px', marginBottom: 28,
          fontSize: 12, color: 'var(--green-300)', fontWeight: 500,
        }}>
          ⛳ Built for golf &amp; country clubs
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 58, color: 'white',
          lineHeight: 1.1, marginBottom: 20,
        }}>
          Cut your course costs<br />
          <span style={{ color: 'var(--green-400)', fontStyle: 'italic' }}>by 18–35%</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 36px' }}>
          Fairway is the procurement marketplace where golf courses and country clubs source sand, machinery, labor, and supplies — at prices your current vendors can't match.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { window.__signupRole='buyer'; onSignUp('buyer') }} style={{
            padding: '14px 32px', borderRadius: 10, border: 'none',
            background: 'var(--green-500)', color: 'white', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            Enter as Buyer (Club) →
          </button>
          <button onClick={() => { window.__signupRole='seller'; onSignUp('seller') }} style={{
            padding: '14px 32px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,.2)', background: 'transparent',
            color: 'white', fontSize: 15, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>
            Enter as Vendor →
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: 0, maxWidth: 800, margin: '0 auto 60px',
        background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {[
          { value: '$84K+', label: 'Avg annual savings per club' },
          { value: '312', label: 'Verified vendors' },
          { value: '18.4%', label: 'Average discount rate' },
          { value: '4.8', label: 'Avg bids per request' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '24px 20px', textAlign: 'center',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,.08)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--green-400)', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16,
        maxWidth: 900, margin: '0 auto', padding: '0 48px 80px',
      }}>
        {[
          { icon: '⛱', title: 'Post any need', desc: 'Sand, machinery, labor, chemicals — post in 60 seconds and vendors compete for your business.' },
          { icon: '💰', title: 'Transparent pricing', desc: 'Every bid shows exact savings vs your budget. No hidden fees, no relationship markup.' },
          { icon: '✓', title: 'Verified vendors', desc: 'Every vendor is vetted, insured, and rated by other clubs. Quality you can trust at prices that save.' },
        ].map((f, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 14, padding: '24px 22px',
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.7 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>© 2026 Fairway Procurement LLC. All rights reserved.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="https://app.termly.io/policy-viewer/policy.html?policyUUID=6fc1aefa-fb21-4bdd-a989-0927eddf138f" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="https://app.termly.io/policy-viewer/policy.html?policyUUID=7d3fcb96-f4c1-45ee-bb23-55494b26b0d2" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </div>
    </div>
  )
}
