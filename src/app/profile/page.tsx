'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const { profile, loading, refreshProfile } = useAuth()
  const [name, setName]       = useState('')
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!loading && !profile) window.location.replace('/login')
    if (profile) setName(profile.name)
  }, [loading, profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('users').update({ name }).eq('id', profile!.id)
    if (updateError) {
      setError(updateError.message)
    } else {
      await refreshProfile()
      setSuccess(true)
    }
    setSaving(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem',
    border: '1.5px solid #d4cfc8', borderRadius: '4px',
    fontSize: '0.9375rem', outline: 'none',
    boxSizing: 'border-box', background: '#faf9f6', color: '#0f0e0d',
  }

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '2rem', height: '2rem', border: '4px solid #c8442a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!profile) return null

  const roleColor: Record<string, string> = { admin: '#7c3aed', author: '#c8442a', viewer: '#2563eb' }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f5f0e8' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', fontWeight: 700, color: '#0f0e0d', marginBottom: '1.5rem' }}>
          Your Profile
        </h1>

        <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: '8px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {/* Avatar + info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2ddd6' }}>
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: '#c8442a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Georgia,serif', flexShrink: 0 }}>
              {profile.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{profile.name}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b6560', margin: '0.125rem 0' }}>{profile.email}</p>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '999px', background: (roleColor[profile.role] || '#666') + '18', color: roleColor[profile.role] || '#666', border: `1px solid ${(roleColor[profile.role] || '#666')}40`, textTransform: 'capitalize' }}>
                {profile.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.4rem', color: '#0f0e0d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Display Name
              </label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} style={inp} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.4rem', color: '#0f0e0d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
              </label>
              <input type="email" disabled value={profile.email}
                style={{ ...inp, opacity: 0.6, cursor: 'not-allowed', background: '#f0ede8' }} />
              <p style={{ fontSize: '0.75rem', color: '#6b6560', marginTop: '0.25rem' }}>Email cannot be changed here.</p>
            </div>

            {error && (
              <div style={{ background: '#fff0ee', border: '1px solid #f9c4bb', color: '#b83520', padding: '0.7rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.7rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                Profile updated successfully!
              </div>
            )}

            <button type="submit" disabled={saving}
              style={{ backgroundColor: saving ? '#d4826e' : '#c8442a', color: '#fff', border: 'none', padding: '0.7rem 1.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}