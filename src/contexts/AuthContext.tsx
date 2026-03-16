'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile { id:string; name:string; email:string; role:string; created_at:string }
interface AuthCtx  { profile: Profile|null; loading: boolean; signOut: ()=>Promise<void> }

const Ctx = createContext<AuthCtx>({ profile:null, loading:true, signOut: async()=>{} })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()

    const load = async (uid: string) => {
      const { data } = await sb.from('users').select('*').eq('id', uid).maybeSingle()
      setProfile(data ?? null)
      setLoading(false)
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) load(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      if (session?.user) load(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await createClient().auth.signOut()
    setProfile(null)
    window.location.replace('/')
  }

  return <Ctx.Provider value={{ profile, loading, signOut }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)