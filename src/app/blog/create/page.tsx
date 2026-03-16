'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function CreatePostPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ title: '', body: '', image_url: '' })
  const [summary, setSummary] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [genMsg, setGenMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!authLoading && !profile) window.location.replace('/login')
    if (!authLoading && profile?.role === 'viewer') window.location.replace('/dashboard')
  }, [authLoading, profile])

  // Countdown timer for rate limit UX
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const generateSummary = async () => {
    if (!form.body.trim()) { setGenMsg('❌ Please write some content first.'); return }
    setGenLoading(true)
    setGenMsg('⏳ Generating summary with Gemini AI…')
    setCountdown(0)

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: form.body }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429 || data.error?.includes('Rate limit')) {
          setGenMsg('⏳ Rate limited — retrying automatically… (this takes up to 60s)')
          setCountdown(60)
        } else {
          setGenMsg('❌ ' + (data.error ?? 'Failed to generate summary'))
        }
      } else {
        setSummary(data.summary)
        setGenMsg('✅ Summary generated successfully!')
        setCountdown(0)
      }
    } catch {
      setGenMsg('❌ Network error — check your connection')
    }
    setGenLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, summary }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    window.location.replace(`/blog/${data.post.id}`)
  }

  const inp: React.CSSProperties = { width:'100%', padding:'0.625rem 0.875rem', border:'1.5px solid #d4cfc8', borderRadius:'4px', fontSize:'0.9375rem', outline:'none', boxSizing:'border-box', background:'#faf9f6', color:'#0f0e0d' }
  const lbl: React.CSSProperties = { display:'block', fontWeight:700, fontSize:'0.8125rem', marginBottom:'0.375rem', color:'#0f0e0d', textTransform:'uppercase', letterSpacing:'0.04em' }

  if (authLoading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'2rem', height:'2rem', border:'4px solid #c8442a', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth:'48rem', margin:'0 auto', padding:'2.5rem 1rem' }}>
      <h1 style={{ fontFamily:'Georgia,serif', fontSize:'2rem', fontWeight:700, color:'#0f0e0d', marginBottom:'2rem' }}>Write New Post</h1>

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
        <div>
          <label style={lbl}>Title *</label>
          <input type="text" required placeholder="Your post title"
            value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
            style={{ ...inp, fontSize:'1.125rem' }} />
        </div>

        <div>
          <label style={lbl}>Featured Image URL</label>
          <input type="url" placeholder="https://..."
            value={form.image_url} onChange={e => setForm(f=>({...f,image_url:e.target.value}))}
            style={inp} />
        </div>

        <div>
          <label style={lbl}>Content *</label>
          <textarea required rows={12} placeholder="Write your article here…"
            value={form.body} onChange={e => setForm(f=>({...f,body:e.target.value}))}
            style={{ ...inp, resize:'vertical', lineHeight:1.7 }} />
        </div>

        <div style={{ background:'#fff', border:'1px solid #e2ddd6', borderRadius:'6px', padding:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
            <label style={{ ...lbl, margin:0 }}>AI Summary</label>
            <button type="button" onClick={generateSummary}
              disabled={genLoading || !form.body.trim() || countdown > 0}
              style={{ fontSize:'0.875rem', fontWeight:700, color: genLoading||countdown>0 ? '#aaa' : '#c8442a', background:'none', border:'none', cursor: genLoading||countdown>0 ? 'not-allowed' : 'pointer', padding:0 }}>
              {countdown > 0 ? `⏳ Retry in ${countdown}s` : genLoading ? '⏳ Generating…' : '✨ Generate with Gemini AI'}
            </button>
          </div>

          <textarea rows={5} placeholder="Click 'Generate with Gemini AI' or write your own…"
            value={summary} onChange={e => setSummary(e.target.value)}
            style={{ ...inp, resize:'none', background:'#faf8f4', lineHeight:1.6 }} />

          {genMsg && (
            <p style={{ marginTop:'0.5rem', fontSize:'0.8125rem', fontWeight:600,
              color: genMsg.startsWith('✅') ? '#166534' : genMsg.startsWith('⏳') ? '#92400e' : '#b83520' }}>
              {genMsg}
            </p>
          )}
          <p style={{ marginTop:'0.375rem', fontSize:'0.75rem', color:'#6b6560' }}>
            Summary is generated once and stored — Gemini is never called again on page loads.
          </p>
        </div>

        {error && (
          <div style={{ background:'#fff0ee', border:'1px solid #f9c4bb', color:'#b83520', padding:'0.75rem', borderRadius:'4px', fontSize:'0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button type="submit" disabled={saving}
            style={{ backgroundColor: saving?'#d4826e':'#c8442a', color:'#fff', border:'none', padding:'0.7rem 1.75rem', borderRadius:'4px', fontWeight:700, fontSize:'1rem', cursor: saving?'not-allowed':'pointer' }}>
            {saving ? 'Publishing…' : 'Publish Post'}
          </button>
          <button type="button" onClick={() => router.back()}
            style={{ background:'none', border:'2px solid #0f0e0d', color:'#0f0e0d', padding:'0.7rem 1.75rem', borderRadius:'4px', fontWeight:700, fontSize:'1rem', cursor:'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}