'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/utils'

export default function Comments({ postId, initialComments }: { postId: string; initialComments: any[] }) {
  const { profile } = useAuth()
  const [comments, setComments] = useState<any[]>(initialComments)
  const [text, setText]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !profile) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, comment_text: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setComments(prev => [{ ...data.comment, user: profile }, ...prev])
      setText('')
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  return (
    <section style={{ marginTop: '3rem' }}>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid #e2ddd6' }}>
        Comments ({comments.length})
      </h3>

      {profile ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share your thoughts…" rows={4} required
            style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #d4cfc8', borderRadius: '4px', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.75rem' }} />
          {error && <p style={{ color: '#c8442a', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ backgroundColor: loading ? '#d4826e' : '#c8442a', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Posting…' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p style={{ background: '#faf9f6', border: '1px solid #e2ddd6', borderRadius: '4px', padding: '1rem', marginBottom: '2rem', fontSize: '0.875rem', color: '#6b6560' }}>
          <a href="/login" style={{ color: '#c8442a', fontWeight: 700 }}>Sign in</a> to leave a comment.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {comments.map((c: any) => (
          <div key={c.id} style={{ borderBottom: '1px solid #e2ddd6', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: '#c8442a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                {c.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>{c.user?.name ?? 'Anonymous'}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b6560', margin: 0 }}>{formatDate(c.created_at)}</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#2a2724', lineHeight: 1.6, marginLeft: '2.75rem', margin: '0 0 0 2.75rem' }}>{c.comment_text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p style={{ color: '#6b6560', fontSize: '0.875rem', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
        )}
      </div>
    </section>
  )
}