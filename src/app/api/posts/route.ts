import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { POSTS_PER_PAGE } from '@/utils'
 
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const search = searchParams.get('search') ?? ''
  const from = (page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1
 
  let query = supabase
    .from('posts')
    .select('*, author:users(id,name,email,role)', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to)
 
  if (search) {
    query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
  }
 
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
 
  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / POSTS_PER_PAGE),
  })
}
 
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'author' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden: Only authors can create posts' }, { status: 403 })
  }
 
  const body = await req.json()
  const { title, body: content, image_url, summary } = body
 
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
  }
 
  const { data, error } = await supabase
    .from('posts')
    .insert({ title, body: content, image_url, author_id: user.id, summary })
    .select('*, author:users(id,name,email,role)')
    .single()
 
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data }, { status: 201 })
}