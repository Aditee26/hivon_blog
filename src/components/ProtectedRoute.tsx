'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
 
interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}
 
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { profile, loading } = useAuth()
  const router = useRouter()
 
  useEffect(() => {
    if (!loading) {
      if (!profile) {
        router.push('/login')
        return
      }
      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        router.push('/dashboard')
      }
    }
  }, [profile, loading, allowedRoles, router])
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
 
  if (!profile) return null
  if (allowedRoles && !allowedRoles.includes(profile.role)) return null
  return <>{children}</>
}