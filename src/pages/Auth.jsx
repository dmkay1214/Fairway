import React, { useState } from 'react'

/* ─── Shared form styles ─────────────────────────────────────── */
const field = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--slate-600)' },
  input: {
    padding: '10px 13px', border: '1px solid var(--slate-200)',
    borderRadius: 9, fontSize: 14, outline: 'none',
    background: 'white', fontFamily: 'var(--font-body)',
    transition: 'border-color .15s',
  },
}

function Field({ label, type = 'text', value, onChange, placeholder, required, hint }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={field.wrapper}>
      <label style={field.label}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder}
        style={{ ...field.input, borderColor: focused ? 'var(--green-400)' : 'var(--slate-200)' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
      {hint && <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{hint}</div>}
    </div>
  )
}

function AuthCard({ children, width = 440 }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, var(--slate-900) 0%, #0d2818 100%)',
      padding: 20,
    }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, background: 'var(--green-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>⛳</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white' }}>Fairway</span>
        </div>
      </div>
      <div style={{
        width: '100%', maxWidth: width,
        background: 'white', borderRadius: 20,
        padding: '32px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,.35)',
      }}>
        {children}
      </div>
    </div>
  )
}

/* ─── Login ──────────────────────────────────────────────────── */
export function Login({ onLogin, onSignUp, onForgot }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      // await signIn({ email, password })  ← uncomment for real auth
      await new Promise(r => setTimeout(r, 800)) // demo delay
      onLogin('buyer')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <AuthCard>
      <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Welcome back</div>
      <div style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 26 }}>Sign in to your Fairway account</div>

      {error && (
        <div style={{
          background: '#fee2e2', color: '#b91c1c', padding: '10px 13px',
          borderRadius: 8, fontSize: 13, marginBottom: 16,
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="james@pinevalleycc.com" required />
        <div style={field.wrapper}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={field.label}>Password <span style={{ color: '#ef4444' }}>*</span></label>
            <button type="button" onClick={onForgot} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--green-600)', cursor: 'pointer' }}>Forgot password?</button>
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...field.input }} />
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none',
          background: loading ? 'var(--slate-300)' : 'var(--green-600)',
          color: 'white', fontSize: 14, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)', marginTop: 6, marginBottom: 16,
          transition: 'background .15s',
        }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate-400)' }}>
        Don't have an account?{' '}
        <button onClick={onSignUp} style={{ background: 'none', border: 'none', color: 'var(--green-600)', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>
          Sign up free
        </button>
      </div>
    </AuthCard>
  )
}

/* ─── Sign Up ────────────────────────────────────────────────── */
export function SignUp({ onSignUp, onLogin }) {
  const [roleTab, setRoleTab] = useState('buyer')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    orgName: '', location: '', categories: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const CATS = ['Sand & Aggregates', 'Machinery', 'Labor', 'Chemicals & Fertilizer', 'Irrigation', 'Equipment', 'Seed & Sod', 'Fuel']

  async function handleSubmit() {
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      await new Promise(r => setTimeout(r, 900))
      onSignUp(roleTab)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <AuthCard width={480}>
      {/* Role tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ id: 'buyer', label: '⛳ Club / Course', sub: 'Sourcing resources' }, { id: 'seller', label: '🏢 Vendor', sub: 'Supplying resources' }].map(r => (
          <button key={r.id} onClick={() => setRoleTab(r.id)} style={{
            flex: 1, padding: '11px 12px', borderRadius: 10, border: '1.5px solid',
            borderColor: roleTab === r.id ? 'var(--green-400)' : 'var(--slate-200)',
            background: roleTab === r.id ? 'var(--green-50)' : 'white',
            cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'left',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: roleTab === r.id ? 'var(--green-700)' : 'var(--slate-700)' }}>{r.label}</div>
            <div style={{ fontSize: 11, color: roleTab === r.id ? 'var(--green-500)' : 'var(--slate-400)', marginTop: 2 }}>{r.sub}</div>
          </button>
        ))}
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: s <= step ? 'var(--green-500)' : 'var(--slate-100)',
            transition: 'background .3s',
          }} />
        ))}
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 13px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {step === 1 && (
        <>
          <div style={{ fontSize: 17, fontFamily: 'var(--font-display)', marginBottom: 18 }}>Create your account</div>
          <Field label="Full name" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="James Whitfield" required />
          <Field label="Work email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="james@pinevalleycc.com" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Password" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" required />
            <Field label="Confirm password" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••" required />
          </div>
          <button onClick={() => { if (form.fullName && form.email && form.password) setStep(2) }} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: 'var(--green-600)', color: 'white', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 4, marginBottom: 14,
          }}>Continue →</button>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: 17, fontFamily: 'var(--font-display)', marginBottom: 18 }}>
            {roleTab === 'buyer' ? 'About your club' : 'About your business'}
          </div>
          <Field
            label={roleTab === 'buyer' ? 'Club or course name' : 'Company name'}
            value={form.orgName} onChange={e => set('orgName', e.target.value)}
            placeholder={roleTab === 'buyer' ? 'Pine Valley Country Club' : 'Gulf Shore Aggregates'} required
          />
          <Field
            label="Location (City, State)"
            value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="Naples, FL" required
          />
          {roleTab === 'seller' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ ...field.label, display: 'block', marginBottom: 8 }}>Categories you supply <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {CATS.map(c => {
                  const sel = form.categories.includes(c)
                  return (
                    <button key={c} onClick={() => set('categories', sel ? form.categories.filter(x => x !== c) : [...form.categories, c])} style={{
                      padding: '6px 12px', borderRadius: 'var(--radius-full)',
                      border: '1px solid', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      borderColor: sel ? 'var(--green-400)' : 'var(--slate-200)',
                      background: sel ? 'var(--green-50)' : 'white',
                      color: sel ? 'var(--green-700)' : 'var(--slate-600)',
                      fontFamily: 'var(--font-body)',
                    }}>{c}</button>
                  )
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, padding: '11px', borderRadius: 10,
              border: '1px solid var(--slate-200)', background: 'white',
              fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>← Back</button>
            <button onClick={handleSubmit} disabled={loading} style={{
              flex: 2, padding: '11px', borderRadius: 10, border: 'none',
              background: loading ? 'var(--slate-300)' : 'var(--green-600)',
              color: 'white', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
            }}>{loading ? 'Creating account…' : 'Create account'}</button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 12, textAlign: 'center' }}>
            By signing up you agree to our Terms of Service and Privacy Policy
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--slate-400)', marginTop: 16 }}>
        Already have an account?{' '}
        <button onClick={onLogin} style={{ background: 'none', border: 'none', color: 'var(--green-600)', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>Sign in</button>
      </div>
    </AuthCard>
  )
}

/* ─── Forgot Password ────────────────────────────────────────── */
export function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handle(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <AuthCard width={400}>
      {sent ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>📬</div>
          <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Check your email</div>
          <div style={{ fontSize: 13, color: 'var(--slate-500)', marginBottom: 24, lineHeight: 1.6 }}>
            We sent a password reset link to <strong>{email}</strong>. Check your inbox — it expires in 1 hour.
          </div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--green-600)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>← Back to sign in</button>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', marginBottom: 4 }}>Reset password</div>
          <div style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 24 }}>Enter your email and we'll send a reset link.</div>
          <form onSubmit={handle}>
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="james@pinevalleycc.com" required />
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: loading ? 'var(--slate-300)' : 'var(--green-600)',
              color: 'white', fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)', marginTop: 4, marginBottom: 14,
            }}>{loading ? 'Sending…' : 'Send reset link'}</button>
          </form>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer', fontSize: 13, display: 'block', margin: '0 auto' }}>← Back to sign in</button>
        </>
      )}
    </AuthCard>
  )
}
