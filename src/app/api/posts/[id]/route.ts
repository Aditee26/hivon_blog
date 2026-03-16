import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:users(id,name,email,role), comments(*, user:users(id,name,email,role))')
    .eq('id', params.id)
    .single()
  if (error || !data) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  return NextResponse.json({ post: data })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const { data: post } = await supabase
    .from('posts').select('author_id').eq('id', params.id).single()

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const isAdmin = profile?.role === 'admin'
  const isOwner = post.author_id === user.id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden: you can only edit your own posts' }, { status: 403 })
  }

  const body = await req.json()
  const { title, body: content, image_url, summary } = body

  const { data, error } = await supabase
    .from('posts')
    .update({ title, body: content, image_url, summary })
    .eq('id', params.id)
    .select('*, author:users(id,name,email,role)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const { data: post } = await supabase
    .from('posts').select('author_id').eq('id', params.id).single()

  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const isAdmin = profile?.role === 'admin'
  const isOwner = post.author_id === user.id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('posts').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}