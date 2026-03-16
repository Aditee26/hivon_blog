import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-display text-9xl font-bold text-accent/20">404</h1>
      <h2 className="font-display text-3xl font-bold text-ink mb-4">Page Not Found</h2>
      <p className="text-ink/60 mb-8 font-body">The page you are looking for doesn't exist or has been moved.</p>
      <Link href="/" className="btn-primary">← Back to Home</Link>
    </div>
  )
}