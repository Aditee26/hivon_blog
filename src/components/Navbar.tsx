'use client'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { profile, loading, signOut } = useAuth()

  return (
    <header style={{ backgroundColor:'#0f0e0d', borderBottom:'4px solid #c8442a', position:'sticky', top:0, zIndex:100 }}>
      <div style={{ maxWidth:'72rem', margin:'0 auto', padding:'0.875rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        <Link href="/" style={{ fontFamily:'Georgia,serif', fontSize:'1.375rem', fontWeight:700, color:'#f5f0e8', textDecoration:'none' }}>
          HIVON<span style={{ color:'#c8442a' }}>.</span>BLOG
        </Link>

        <nav style={{ display:'flex', alignItems:'center', gap:'1.25rem', fontSize:'0.9rem' }}>
          <Link href="/" style={{ color:'#c8bfb5', textDecoration:'none' }}>Home</Link>

          {loading ? null : profile ? (
            <>
              <Link href="/dashboard" style={{ color:'#c8bfb5', textDecoration:'none' }}>Dashboard</Link>
              {(profile.role==='author'||profile.role==='admin') &&
                <Link href="/blog/create" style={{ color:'#c8bfb5', textDecoration:'none' }}>Write</Link>}
              <Link href="/profile" style={{ color:'#f5f0e8', textDecoration:'none', fontWeight:600 }}>{profile.name}</Link>
              <button onClick={signOut} style={{ backgroundColor:'#c8442a', color:'#fff', border:'none', padding:'0.4rem 1rem', borderRadius:'4px', fontWeight:700, cursor:'pointer' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color:'#f5f0e8', textDecoration:'none', fontWeight:600, padding:'0.4rem 0.875rem', border:'1px solid rgba(245,240,232,0.35)', borderRadius:'4px' }}>
                Sign In
              </Link>
              <Link href="/register" style={{ backgroundColor:'#c8442a', color:'#fff', textDecoration:'none', fontWeight:700, padding:'0.4rem 1rem', borderRadius:'4px' }}>
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}