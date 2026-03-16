'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile { id: string; name: string; email: string; role: string; created_at: string }
interface AuthCtx  { profile: Profile | null; loading: boolean; signOut: () => Promise<void>; refreshProfile: () => Promise<void> }

const Ctx = createContext<AuthCtx>({
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading]  = useState(true)

  const fetchProfile = async (uid: string) => {
    const sb = createClient()
    const { data } = await sb.from('users').select('*').eq('id', uid).maybeSingle()
    setProfile(data ?? null)
    setLoading(false)
  }

  const refreshProfile = async () => {
    const sb = createClient()
    const { data: { session } } = await sb.auth.getSession()
    if (session?.user) await fetchProfile(session.user.id)
  }

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await createClient().auth.signOut()
    setProfile(null)
    window.location.replace('/')
  }

  return <Ctx.Provider value={{ profile, loading, signOut, refreshProfile }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)