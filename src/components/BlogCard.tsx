import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/types'
import { formatDate, truncate } from '@/utils'
 
interface BlogCardProps { post: Post }
 
export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="card group">
      {post.image_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image src={post.image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs text-ink/50 mb-3 font-body">
          <span>{post.author?.name ?? 'Unknown'}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
        <h2 className="font-display text-xl font-bold text-ink mb-3 group-hover:text-accent transition-colors leading-snug">
          <Link href={`/blog/${post.id}`}>{post.title}</Link>
        </h2>
        {post.summary ? (
          <div className="mb-4">
            <span className="inline-block text-xs font-bold bg-accent/10 text-accent px-2 py-0.5 rounded mb-2">AI Summary</span>
            <p className="text-sm text-ink/70 font-body leading-relaxed">{truncate(post.summary, 180)}</p>
          </div>
        ) : (
          <p className="text-sm text-ink/70 font-body leading-relaxed mb-4">{truncate(post.body, 180)}</p>
        )}
        <Link href={`/blog/${post.id}`}
          className="text-sm font-bold text-accent hover:underline font-display">
          Read Full Article →
        </Link>
      </div>
    </article>
  )
}