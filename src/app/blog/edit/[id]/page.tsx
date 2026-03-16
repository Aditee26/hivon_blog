'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { profile, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ title: '', body: '', image_url: '', summary: '' })
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [error, setError] = useState('')
  const [summaryMsg, setSummaryMsg] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!profile) { router.push('/login'); return }

    fetch(`/api/posts/${params.id}`)
      .then(r => r.json())
      .then(({ post }) => {
        if (!post) { router.push('/dashboard'); return }

        const isAdmin = profile.role === 'admin'
        const isOwner = post.author_id === profile.id

        if (!isAdmin && !isOwner) {
          alert('You do not have permission to edit this post.')
          router.push('/dashboard')
          return
        }

        setForm({
          title: post.title,
          body: post.body,
          image_url: post.image_url ?? '',
          summary: post.summary ?? '',
        })
        setPageLoading(false)
      })
  }, [params.id, profile, authLoading])

  const generateSummary = async () => {
    if (!form.body.trim()) return
    setLoadingSummary(true)
    setSummaryMsg('')
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: form.body }),
      })
      const data = await res.json()
      if (data.summary) {
        setForm(f => ({ ...f, summary: data.summary }))
        setSummaryMsg('✅ Summary generated!')
      } else {
        setSummaryMsg('❌ ' + (data.error ?? 'Failed'))
      }
    } catch {
      setSummaryMsg('❌ Network error')
    }
    setLoadingSummary(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch(`/api/posts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    router.push(`/blog/${params.id}`)
  }

  if (authLoading || pageLoading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '2rem', height: '2rem', border: '4px solid #c8442a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '3rem 1rem' }}>
      <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Edit Post</h1>

      {profile?.role === 'admin' && (
        <div style={{ background: 'rgba(200,68,42,0.08)', border: '1px solid #c8442a', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#c8442a', fontWeight: 700 }}>
          ⚡ Admin mode — you can edit any post
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.375rem', fontSize: '0.875rem' }}>Title *</label>
          <input type="text" required className="input-field" style={{ fontSize: '1.125rem' }}
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.375rem', fontSize: '0.875rem' }}>Featured Image URL</label>
          <input type="url" className="input-field" placeholder="https://..."
            value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.375rem', fontSize: '0.875rem' }}>Content *</label>
          <textarea required rows={14} className="input-field" style={{ resize: 'vertical' }}
            value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 700, fontSize: '0.875rem' }}>AI Summary</label>
            <button type="button" onClick={generateSummary}
              disabled={loadingSummary || !form.body.trim()}
              style={{ fontSize: '0.875rem', fontWeight: 700, color: '#c8442a', background: 'none', border: 'none', cursor: 'pointer', opacity: (loadingSummary || !form.body.trim()) ? 0.4 : 1 }}>
              {loadingSummary ? '⏳ Generating...' : '✨ Regenerate with Gemini AI'}
            </button>
          </div>
          <textarea rows={5} className="input-field" style={{ resize: 'none', backgroundColor: '#ede7d9' }}
            placeholder="AI-generated summary..."
            value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
          {summaryMsg && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: summaryMsg.startsWith('✅') ? 'green' : '#c8442a' }}>{summaryMsg}</p>}
        </div>

        {error && (
          <div style={{ background: 'rgba(200,68,42,0.1)', color: '#c8442a', padding: '0.75rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" disabled={saving} className="btn-primary"
            style={{ opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}