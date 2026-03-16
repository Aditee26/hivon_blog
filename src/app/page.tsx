'use client'
import { useState, useEffect, useCallback } from 'react'
import BlogCard from '@/components/BlogCard'
import { Post, PaginatedResult } from '@/types'
import { POSTS_PER_PAGE } from '@/utils'
 
export default function HomePage() {
  const [result, setResult] = useState<PaginatedResult<Post> | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
 
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    const res = await fetch(`/api/posts?${params}`)
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }, [page, search])
 
  useEffect(() => { fetchPosts() }, [fetchPosts])
 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(inputValue)
  }
 
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="page-title mb-4">Ideas Worth Reading</h1>
        <p className="text-ink/60 font-body text-lg max-w-xl mx-auto">
          Discover stories, insights, and perspectives — with every post summarised by AI.
        </p>
      </div>
 
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto mb-12">
        <input
          type="text"
          placeholder="Search posts by title or content..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setInputValue(''); setPage(1) }}
            className="btn-secondary whitespace-nowrap">Clear</button>
        )}
      </form>
 
      {search && (
        <p className="text-sm text-ink/60 mb-6">
          Showing results for <span className="font-bold text-ink">"{search}"</span>
          {result && ` — ${result.total} post${result.total !== 1 ? 's' : ''} found`}
        </p>
      )}
 
      {/* Posts grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-paper-dark" />
          ))}
        </div>
      ) : result?.data.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {result.data.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
 
          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="btn-secondary disabled:opacity-40 py-2 px-4 text-sm">← Prev</button>
              <span className="font-body text-sm text-ink/60">
                Page {page} of {result.totalPages}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === result.totalPages}
                className="btn-secondary disabled:opacity-40 py-2 px-4 text-sm">Next →</button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-ink/50 font-body text-lg">
            {search ? 'No posts match your search.' : 'No posts yet. Check back soon!'}
          </p>
        </div>
      )}
    </div>
  )
}