'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const s: Record<string, React.CSSProperties> = {
    wrap:  { minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'#f5f0e8' },
    box:   { width:'100%', maxWidth:'420px' },
    card:  { background:'#fff', border:'1px solid #e2ddd6', borderRadius:'8px', padding:'2rem', boxShadow:'0 2px 12px rgba(0,0,0,0.07)' },
    title: { fontFamily:'Georgia,serif', fontSize:'1.875rem', fontWeight:700, color:'#0f0e0d', textAlign:'center', marginBottom:'0.375rem' },
    sub:   { color:'#6b6560', textAlign:'center', marginBottom:'1.75rem', fontSize:'0.9rem' },
    label: { display:'block', fontWeight:700, fontSize:'0.8125rem', marginBottom:'0.35rem', color:'#0f0e0d', textTransform:'uppercase', letterSpacing:'0.04em' },
    input: { width:'100%', padding:'0.625rem 0.875rem', border:'1.5px solid #d4cfc8', borderRadius:'4px', fontSize:'0.9375rem', outline:'none', boxSizing:'border-box', background:'#faf9f6', color:'#0f0e0d', marginBottom:'1.125rem' },
    btn:   { width:'100%', padding:'0.75rem', backgroundColor:'#c8442a', color:'#fff', border:'none', borderRadius:'4px', fontWeight:700, fontSize:'1rem', cursor:'pointer', marginTop:'0.25rem' },
    err:   { background:'#fff0ee', border:'1px solid #f9c4bb', color:'#b83520', padding:'0.7rem', borderRadius:'4px', marginBottom:'0.875rem', fontSize:'0.875rem' },
    foot:  { textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'#6b6560' },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await createClient().auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    window.location.replace('/dashboard')
  }

  return (
    <div style={s.wrap}>
      <div style={s.box}>
        <div style={s.card}>
          <p style={s.title}>Welcome Back</p>
          <p style={s.sub}>Sign in to your Hivon Blog account</p>
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Email Address</label>
            <input type="email" required autoComplete="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} style={s.input} />
            <label style={s.label}>Password</label>
            <input type="password" required autoComplete="current-password" placeholder="Your password"
              value={password} onChange={e => setPassword(e.target.value)} style={s.input} />
            {error && <div style={s.err}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ ...s.btn, backgroundColor: loading ? '#d4826e' : '#c8442a', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p style={s.foot}>No account yet?{' '}
            <Link href="/register" style={{ color:'#c8442a', fontWeight:700, textDecoration:'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}