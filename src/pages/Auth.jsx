import React, { useState, useEffect } from 'react'
import { signIn, signUp, resetPassword } from '../lib/supabase.js'

const inputStyle = {
  width: '100%', padding: '10px 13px',
  border: '1px solid #2a2a2a', borderRadius: 9,
  fontSize: 14, outline: 'none', background: '#111',
  color: 'white', fontFamily: 'var(--font-body)',
  transition: 'border-color .15s',
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#aaa' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...inputStyle, borderColor: focused ? '#1a8250' : '#2a2a2a' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </div>
  )
}

function AuthCard({ children, width = 440 }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a', padding: 20,
    }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⛳</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white' }}>Fairway</span>
        </div>
      </div>
      <div style={{
        width: '100%', maxWidth: width, background: '#141414',
        borderRadius: 20, padding: '32px 36px',
        border: '1px solid #222', boxShadow: '0 24px 64px rgba(0,0,0,.5)',
      }}>
        {children}
      </div>
    </div>
  )
}

export function Login({ onLogin, onSignUp, onForgot }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    try {
      const data = await signIn({ email, password })
      onLogin(data.user?.user_metadata?.role || 'buyer', data.user)
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <AuthCard>
      <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 4, color: 'white' }}>Welcome back</div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 26 }}>Sign in to your Fairway account</div>
      {error && <div style={{ background: '#2d1515', color: '#f87171', padding: '10px 13px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #4a1f1f' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="james@pinevalleycc.com" required />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#aaa' }}>Password <span style={{ color: '#ef4444' }}>*</span></label>
            <button type="button" onClick={onForgot} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--green-400)', cursor: 'pointer' }}>Forgot password?</button>
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: loading ? '#333' : 'var(--green-600)', color: 'white',
          fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)', marginTop: 6, marginBottom: 16,
        }}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
        Don't have an account?{' '}
        <button onClick={onSignUp} style={{ background: 'none', border: 'none', color: 'var(--green-400)', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>Sign up free</button>
      </div>
    </AuthCard>
  )
}

export function SignUp({ onSignUp, onLogin, initialRole = 'buyer' }) {
  const [roleTab, setRoleTab] = useState(window.__signupRole || initialRole)
  React.useEffect(() => { setRoleTab(initialRole) }, [initialRole])
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', orgName: '', location: '', categories: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const CATS = ['Sand & Aggregates', 'Machinery', 'Labor', 'Chemicals & Fertilizer', 'Irrigation', 'Equipment', 'Seed & Sod', 'Fuel']

  async function handleSubmit() {
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!form.orgName || !form.location) { setError('Please fill in all fields'); return }
    setLoading(true); setError('')
    try {
      const { data: signUpData } = await signUp({ email: form.email, password: form.password, fullName: form.fullName, role: roleTab, orgName: form.orgName, location: form.location, categories: form.categories })
      // Send welcome email
      supabase.functions.invoke('send-email', {
        body: {
          type: roleTab === 'buyer' ? 'welcome_buyer' : 'welcome_vendor',
          to: form.email,
          name: form.fullName || form.orgName || 'there'
        }
      }).catch(e => console.log('Welcome email error:', e))
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <AuthCard>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 8, color: 'white' }}>Check your email</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 24, lineHeight: 1.7 }}>
            We sent a confirmation link to <strong style={{ color: 'white' }}>{form.email}</strong>.<br />
            Click it to activate your account then come back to sign in.
          </div>
          <button onClick={onLogin} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'var(--green-600)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Go to sign in</button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard width={480}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ id: 'buyer', label: 'Club / Course', sub: 'Sourcing resources' }, { id: 'seller', label: 'Vendor', sub: 'Supplying resources' }].map(r => (
          <button key={r.id} onClick={() => setRoleTab(r.id)} style={{
            flex: 1, padding: '11px 12px', borderRadius: 10,
            border: `1.5px solid ${roleTab === r.id ? 'var(--green-500)' : '#2a2a2a'}`,
            background: roleTab === r.id ? '#0d2318' : '#1a1a1a',
            cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: roleTab === r.id ? 'var(--green-400)' : '#888' }}>{r.id === 'buyer' ? '⛳' : '🏢'} {r.label}</div>
            <div style={{ fontSize: 11, color: roleTab === r.id ? 'var(--green-600)' : '#555', marginTop: 2 }}>{r.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {[1, 2].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? 'var(--green-500)' : '#2a2a2a', transition: 'background .3s' }} />)}
      </div>

      {error && <div style={{ background: '#2d1515', color: '#f87171', padding: '10px 13px', borderRadius: 8, fontSize: 13, marginBottom: 14, border: '1px solid #4a1f1f' }}>{error}</div>}

      {step === 1 && (
        <>
          <div style={{ fontSize: 17, fontFamily: 'var(--font-display)', marginBottom: 18, color: 'white' }}>Create your account</div>
          <Field label="Full name" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="James Whitfield" required />
          <Field label="Work email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@pinevalleycc.com" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" required />
            <Field label="Confirm" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••" required />
          </div>
          <button onClick={() => {
            if (!form.fullName || !form.email || !form.password) { setError('Please fill in all fields'); return }
            if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
            setError(''); setStep(2)
          }} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'var(--green-600)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 4, marginBottom: 14 }}>Continue →</button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: 17, fontFamily: 'var(--font-display)', marginBottom: 18, color: 'white' }}>
            {roleTab === 'buyer' ? 'About your club' : 'About your business'}
          </div>
          <Field label={roleTab === 'buyer' ? 'Club name' : 'Company name'} value={form.orgName} onChange={e => set('orgName', e.target.value)} placeholder={roleTab === 'buyer' ? 'Pine Valley Country Club' : 'Gulf Shore Aggregates'} required />
          <Field label="Location (City, State)" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Naples, FL" required />
          {roleTab === 'seller' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#aaa', display: 'block', marginBottom: 8 }}>Categories you supply</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {CATS.map(c => {
                  const sel = form.categories.includes(c)
                  return <button key={c} onClick={() => set('categories', sel ? form.categories.filter(x => x !== c) : [...form.categories, c])} style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${sel ? 'var(--green-500)' : '#2a2a2a'}`, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: sel ? '#0d2318' : '#1a1a1a', color: sel ? 'var(--green-400)' : '#666', fontFamily: 'var(--font-body)' }}>{c}</button>
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1a1a1a', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)', color: '#888' }}>← Back</button>
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: loading ? '#333' : 'var(--green-600)', color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)' }}>{loading ? 'Creating account…' : 'Create account'}</button>
          </div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 12, textAlign: 'center' }}>By signing up you agree to our Terms of Service and Privacy Policy</div>
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 16 }}>
        Already have an account?{' '}
        <button onClick={onLogin} style={{ background: 'none', border: 'none', color: 'var(--green-400)', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>Sign in</button>
      </div>
    </AuthCard>
  )
}

export function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handle(e) {
    e.preventDefault()
    if (!email) { setError('Please enter your email'); return }
    setLoading(true); setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <AuthCard width={400}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📬</div>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 8, color: 'white' }}>Check your email</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 24, lineHeight: 1.6 }}>We sent a reset link to <strong style={{ color: 'white' }}>{email}</strong>.</div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--green-400)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>← Back to sign in</button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 4, color: 'white' }}>Reset password</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>We'll send a reset link to your email.</div>
          {error && <div style={{ background: '#2d1515', color: '#f87171', padding: '10px 13px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}
          <form onSubmit={handle}>
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="james@pinevalleycc.com" required />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: loading ? '#333' : 'var(--green-600)', color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', marginTop: 4, marginBottom: 14 }}>{loading ? 'Sending…' : 'Send reset link'}</button>
          </form>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 13, display: 'block', margin: '0 auto' }}>← Back to sign in</button>
        </>
      )}
    </AuthCard>
  )
}
