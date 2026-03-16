'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/utils'

export default function DashboardPage() {
  const { profile, loading } = useAuth()
  const [posts, setPosts]   = useState<any[]>([])
  const [tab, setTab]       = useState<'posts'|'comments'>('posts')
  const [comments, setComments] = useState<any[]>([])
  const [busy, setBusy]     = useState(true)

  useEffect(() => {
    if (loading) return
    if (!profile) { window.location.replace('/login'); return }

    const sb = createClient()
    const fetchAll = async () => {
      const q = profile.role === 'admin'
        ? sb.from('posts').select('*,author:users(id,name,email,role)').order('created_at',{ascending:false})
        : sb.from('posts').select('*,author:users(id,name,email,role)').eq('author_id',profile.id).order('created_at',{ascending:false})
      const { data: postsData } = await q
      setPosts(postsData ?? [])

      if (postsData?.length) {
        const ids = postsData.map((p:any) => p.id)
        const { data: cmts } = await sb
          .from('comments')
          .select('*,user:users(id,name),post:posts(id,title)')
          .in('post_id', ids)
          .order('created_at',{ascending:false})
        setComments(cmts ?? [])
      }
      setBusy(false)
    }
    fetchAll()
  }, [loading, profile])

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${id}`, { method:'DELETE' })
    setPosts(p => p.filter(x => x.id !== id))
  }

  if (loading || busy) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'2.5rem', height:'2.5rem', border:'4px solid #c8442a', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!profile) return null

  const roleColor: Record<string,string> = { admin:'#7c3aed', author:'#c8442a', viewer:'#2563eb' }
  const canEdit = (post: any) => profile.role==='admin' || post.author_id===profile.id

  return (
    <div style={{ maxWidth:'64rem', margin:'0 auto', padding:'2.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'2rem', fontWeight:700, color:'#0f0e0d', margin:0 }}>Dashboard</h1>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginTop:'0.4rem' }}>
            <span style={{ fontSize:'0.875rem', color:'#6b6560' }}>Welcome, <strong>{profile.name}</strong></span>
            <span style={{ fontSize:'0.75rem', fontWeight:700, padding:'0.15rem 0.55rem', borderRadius:'999px', background: roleColor[profile.role]+'18', color: roleColor[profile.role], border:`1px solid ${roleColor[profile.role]}40`, textTransform:'capitalize' }}>
              {profile.role}
            </span>
          </div>
        </div>
        {(profile.role==='author'||profile.role==='admin') &&
          <Link href="/blog/create" style={{ backgroundColor:'#c8442a', color:'#fff', textDecoration:'none', fontWeight:700, padding:'0.5rem 1.25rem', borderRadius:'4px', fontSize:'0.9rem' }}>+ New Post</Link>}
      </div>

      {/* Role info banner */}
      <div style={{ background:'#fff', border:'1px solid #e2ddd6', borderRadius:'6px', padding:'0.875rem 1.125rem', marginBottom:'1.5rem', fontSize:'0.875rem', color:'#2a2724' }}>
        {profile.role==='admin' && <span>⚡ <strong>Admin:</strong> You can view, edit and delete <em>all</em> posts and monitor all comments.</span>}
        {profile.role==='author' && <span>✍️ <strong>Author:</strong> You can create posts, edit your own, and view comments on them.</span>}
        {profile.role==='viewer' && <span>👁️ <strong>Viewer:</strong> Browse posts, read AI summaries, and leave comments. <Link href="/" style={{ color:'#c8442a', fontWeight:700 }}>Browse →</Link></span>}
      </div>

      {/* Tabs */}
      {profile.role !== 'viewer' && (
        <div style={{ display:'flex', borderBottom:'2px solid #e2ddd6', marginBottom:'1.25rem' }}>
          {(['posts','comments'] as const).map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'0.5rem 1.25rem', fontWeight:700, fontSize:'0.875rem', background:'none', border:'none', cursor:'pointer', borderBottom: tab===t ? '2px solid #c8442a' : '2px solid transparent', marginBottom:'-2px', color: tab===t ? '#c8442a' : '#6b6560', textTransform:'capitalize' }}>
              {t==='posts' ? `Posts (${posts.length})` : `Comments (${comments.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Posts */}
      {tab==='posts' && (
        busy ? <div style={{ color:'#6b6560', padding:'2rem', textAlign:'center' }}>Loading…</div>
        : posts.length ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
            {posts.map((post:any) => (
              <div key={post.id} style={{ background:'#fff', border:'1px solid #e2ddd6', borderRadius:'6px', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:'0.9375rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{post.title}</p>
                  <p style={{ fontSize:'0.75rem', color:'#6b6560', marginTop:'0.2rem', margin:0 }}>
                    {profile.role==='admin' && <span style={{ color:'#7c3aed', fontWeight:600, marginRight:'0.5rem' }}>by {post.author?.name}</span>}
                    {formatDate(post.created_at)}
                    {post.summary && <span style={{ marginLeft:'0.5rem', color:'#c8442a', fontWeight:700 }}>· AI ✓</span>}
                  </p>
                </div>
                <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                  <Link href={`/blog/${post.id}`} style={{ border:'2px solid #0f0e0d', color:'#0f0e0d', padding:'0.25rem 0.65rem', borderRadius:'4px', fontSize:'0.8rem', fontWeight:700, textDecoration:'none' }}>View</Link>
                  {canEdit(post) && <>
                    <Link href={`/blog/edit/${post.id}`} style={{ backgroundColor:'#c8442a', color:'#fff', padding:'0.25rem 0.65rem', borderRadius:'4px', fontSize:'0.8rem', fontWeight:700, textDecoration:'none' }}>Edit</Link>
                    <button onClick={()=>deletePost(post.id)} style={{ border:'2px solid #c8442a', color:'#c8442a', padding:'0.25rem 0.65rem', borderRadius:'4px', fontSize:'0.8rem', fontWeight:700, background:'transparent', cursor:'pointer' }}>Delete</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'3rem', background:'#fff', border:'1px solid #e2ddd6', borderRadius:'6px' }}>
            <p style={{ color:'#6b6560', marginBottom:'1rem' }}>No posts yet.</p>
            {profile.role!=='viewer' && <Link href="/blog/create" style={{ backgroundColor:'#c8442a', color:'#fff', textDecoration:'none', fontWeight:700, padding:'0.5rem 1.25rem', borderRadius:'4px' }}>Write your first post</Link>}
          </div>
        )
      )}

      {/* Comments */}
      {tab==='comments' && (
        comments.length ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
            {comments.map((c:any) => (
              <div key={c.id} style={{ background:'#fff', border:'1px solid #e2ddd6', borderRadius:'6px', padding:'1rem 1.25rem' }}>
                <p style={{ fontWeight:700, fontSize:'0.875rem', margin:'0 0 0.25rem' }}>
                  {c.user?.name} <span style={{ fontWeight:400, color:'#6b6560' }}>on</span>{' '}
                  <Link href={`/blog/${c.post?.id}`} style={{ color:'#c8442a', textDecoration:'none' }}>{c.post?.title}</Link>
                </p>
                <p style={{ fontSize:'0.875rem', color:'#2a2724', margin:'0 0 0.25rem' }}>{c.comment_text}</p>
                <p style={{ fontSize:'0.75rem', color:'#6b6560', margin:0 }}>{new Date(c.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : <p style={{ color:'#6b6560', padding:'2rem', textAlign:'center' }}>No comments yet.</p>
      )}
    </div>
  )
}