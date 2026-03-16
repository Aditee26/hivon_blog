import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
 
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('post_id')
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 })
 
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:users(id,name,email,role)')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
 
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data })
}
 
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 
  const body = await req.json()
  const { post_id, comment_text } = body
  if (!post_id || !comment_text?.trim()) {
    return NextResponse.json({ error: 'post_id and comment_text are required' }, { status: 400 })
  }
 
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id, user_id: user.id, comment_text: comment_text.trim() })
    .select('*, user:users(id,name,email,role)')
    .single()
 
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data }, { status: 201 })
}