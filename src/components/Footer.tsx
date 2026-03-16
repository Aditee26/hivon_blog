export default function Footer() {
  return (
    <footer className="bg-ink text-paper/60 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-display text-lg font-bold text-paper">
          HIVON<span className="text-accent">.</span>BLOG
        </p>
        <p className="text-sm">
          © {new Date().getFullYear()} Hivon Automations LLP. All rights reserved.
        </p>
        <p className="text-sm">Powered by Next.js · Supabase · Gemini AI</p>
      </div>
    </footer>
  )
}