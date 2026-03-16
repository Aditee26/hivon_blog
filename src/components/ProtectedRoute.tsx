'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!profile) { router.push('/login'); return }
      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        router.push('/dashboard')
      }
    }
  }, [profile, loading, allowedRoles, router])

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '2rem', height: '2rem', border: '4px solid #c8442a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!profile) return null
  if (allowedRoles && !allowedRoles.includes(profile.role)) return null
  return <>{children}</>
}