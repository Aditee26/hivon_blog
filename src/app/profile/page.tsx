'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { createClient } from '@/lib/supabase/client'
 
export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const [name, setName] = useState(profile?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('users')
      .update({ name })
      .eq('id', profile?.id ?? '')
    if (updateError) { setError(updateError.message) }
    else { setSuccess(true); await refreshProfile() }
    setSaving(false)
  }
 
  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="page-title text-3xl mb-8">Your Profile</h1>
        <div className="card p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-paper text-2xl font-bold font-display">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold text-xl">{profile?.name}</p>
              <p className="text-sm text-ink/60">{profile?.email}</p>
              <span className="inline-block mt-1 text-xs font-bold bg-accent/10 text-accent px-2 py-0.5 rounded capitalize">
                {profile?.role}
              </span>
            </div>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold font-display mb-1.5">Display Name</label>
              <input type="text" required className="input-field"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold font-display mb-1.5">Email</label>
              <input type="email" disabled className="input-field opacity-60 cursor-not-allowed" value={profile?.email} />
              <p className="text-xs text-ink/50 mt-1">Email cannot be changed here.</p>
            </div>
            {error && <p className="text-accent text-sm bg-accent/10 px-3 py-2 rounded">{error}</p>}
            {success && <p className="text-green-700 text-sm bg-green-50 px-3 py-2 rounded">Profile updated successfully!</p>}
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}