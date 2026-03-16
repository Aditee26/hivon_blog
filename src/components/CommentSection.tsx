'use client'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Comment } from '@/types'
import { formatDate } from '@/utils'
 
interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}
 
export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { profile } = useAuth()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !profile) return
    setLoading(true)
    setError('')
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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <section className="mt-12">
      <h3 className="section-title mb-6 pb-3 border-b-2 border-ink/10">
        Comments ({comments.length})
      </h3>
 
      {profile ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="input-field mb-3 resize-none"
            required
          />
          {error && <p className="text-accent text-sm mb-2">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="bg-paper-dark border border-ink/10 rounded p-4 mb-8 text-sm text-ink/70">
          <a href="/login" className="text-accent font-bold">Sign in</a> to leave a comment.
        </p>
      )}
 
      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="border-b border-ink/10 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-paper text-sm font-bold font-display">
                {comment.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-bold text-sm font-display">{comment.user?.name ?? 'Anonymous'}</p>
                <p className="text-xs text-ink/50">{formatDate(comment.created_at)}</p>
              </div>
            </div>
            <p className="text-ink/80 font-body text-sm leading-relaxed pl-11">{comment.comment_text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-ink/50 text-sm italic">No comments yet. Be the first!</p>
        )}
      </div>
    </section>
  )
}