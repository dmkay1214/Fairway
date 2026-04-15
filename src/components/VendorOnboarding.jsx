import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'

export default function VendorOnboarding() {
  const [profile, setProfile] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      if (sessionStorage.getItem('onboarding_dismissed')) setDismissed(true)
    }
    load()
  }, [])

  if (dismissed || !profile) return null

  const hasProfile = profile.org_name && profile.location
  const hasStripe = profile.stripe_account_id
  const allDone = hasProfile && hasStripe
  if (allDone) return null

  const completedCount = [hasProfile, hasStripe].filter(Boolean).length
  const steps = [
    { done: hasProfile, icon: '👤', title: 'Complete your profile', desc: 'Add your company name and location so clubs can find you', action: () => navigate('/seller/profile'), cta: 'Set up profile' },
    { done: hasStripe, icon: '⚡', title: 'Connect Stripe to receive payments', desc: 'Required to receive payments when you win contracts', action: () => navigate('/seller/profile'), cta: 'Connect Stripe' },
    { done: false, icon: '🔍', title: 'Browse open requests', desc: 'Find procurement requests from golf clubs near you', action: () => navigate('/seller'), cta: 'Browse requests' },
  ]

  return (
    <div style={{ background: 'white', border: '1.5px solid var(--green-200)', borderRadius: 14, padding: '20px 24px', marginBottom: 24, position: 'relative' }}>
      <button onClick={() => { setDismissed(true); sessionStorage.setItem('onboarding_dismissed', '1') }} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', fontSize: 18, color: 'var(--slate-400)', cursor: 'pointer' }}>×</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Get started on Fairway</div>
          <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{completedCount} of 2 setup steps completed</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ width: 32, height: 4, borderRadius: 2, background: i < completedCount ? 'var(--green-500)' : 'var(--slate-100)' }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: step.done ? 'var(--green-50)' : 'var(--slate-50)', border: '1px solid ' + (step.done ? 'var(--green-100)' : 'var(--slate-100)') }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: step.done ? 'var(--green-100)' : 'white', border: '1px solid ' + (step.done ? 'var(--green-200)' : 'var(--slate-200)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {step.done ? '✓' : step.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: step.done ? 'var(--green-700)' : 'var(--slate-800)', marginBottom: 1 }}>{step.title}</div>
              <div style={{ fontSize: 11, color: 'var(--slate-500)' }}>{step.desc}</div>
            </div>
            {!step.done && (
              <button onClick={step.action} style={{ padding: '6px 14px', background: 'var(--green-600)', color: 'white', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>{step.cta}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
