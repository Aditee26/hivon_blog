export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}
 
export function truncate(text: string, length = 150): string {
  return text.length > length ? text.slice(0, length) + '...' : text
}
 
export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
 
export const POSTS_PER_PAGE = 5