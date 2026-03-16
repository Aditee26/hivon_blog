# Hivon Blog Platform
 
A production-ready blogging platform built for **Hivon Automations LLP**, powered by **Next.js 14**, **Supabase**, and **Google Gemini AI**.
 
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| AI Integration | Google Gemini 1.5 Flash |
| Styling | TailwindCSS |
| Language | TypeScript |
 
---
 
## Features
 
- **Role-based access control** — Viewer / Author / Admin
- **AI-powered summaries** — Generated once via Gemini, stored permanently
- **Full-text search** — Search by title or body
- **Pagination** — 5 posts per page
- **Comments** — Authenticated users can comment
- **Protected routes** — Middleware-enforced auth
 
---
 
## Environment Variables
 
Copy `.env.example` to `.env.local` and fill in:
 
```
NEXT_PUBLIC_SUPABASE_URL=      # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=     # Supabase service role key (server-only)
GOOGLE_AI_API_KEY=             # Google AI Studio API key
NEXT_PUBLIC_APP_URL=           # e.g. http://localhost:3000
```
 
---
 
## Local Development
 
```bash
# 1. Install dependencies
npm install
 
# 2. Copy env file
cp .env.example .env.local
# Fill in your values
 
# 3. Run dev server
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000)
 
---
 
## Supabase Setup
 
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API
4. Copy your **service_role key** from Settings → API (keep secret!)
 
---
 
## Role-Based Access
 
| Action | Viewer | Author | Admin |
|---|---|---|---|
| View posts | ✅ | ✅ | ✅ |
| Read AI summaries | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ |
| Create posts | ❌ | ✅ | ✅ |
| Edit own posts | ❌ | ✅ | ✅ |
| Edit any post | ❌ | ❌ | ✅ |
| Delete any post | ❌ | ❌ | ✅ |
 
Roles are stored in the `users` table and enforced both in API routes and via Supabase RLS policies.
 
---
 
## AI Integration
 
File: `src/lib/ai/gemini.ts`
 
When a post is created:
1. Author writes the post body
2. Clicks **"✨ Generate with Gemini AI"**
3. Body is sent to `POST /api/generate-summary`
4. Gemini returns a ~200-word summary
5. Summary is stored with the post
6. On all subsequent loads, the stored summary is displayed — **Gemini is never called again**
 
Prompt used:
> "Summarize the following blog article in approximately 200 words. Focus on the key points, main arguments, and conclusions."
 
---
 
## API Routes
 
| Route | Method | Description |
|---|---|---|
| `/api/posts` | GET | List posts (paginated, searchable) |
| `/api/posts` | POST | Create new post (author/admin) |
| `/api/posts/[id]` | GET | Get single post with comments |
| `/api/posts/[id]` | PUT | Update post (owner or admin) |
| `/api/posts/[id]` | DELETE | Delete post (owner or admin) |
| `/api/comments` | GET | Get comments for a post |
| `/api/comments` | POST | Add comment (authenticated) |
| `/api/generate-summary` | POST | Generate AI summary via Gemini |
| `/api/auth/logout` | POST | Sign out |
 
---
 
## VPS Deployment (Linux)
 
### 1. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```
 
### 2. Clone repository
```bash
git clone https://github.com/your-org/hivon-blog.git
cd hivon-blog
```
 
### 3. Install dependencies & build
```bash
npm install
cp .env.example .env.local
# Edit .env.local with production values
npm run build
```
 
### 4. Run with PM2
```bash
npm install -g pm2
pm2 start npm --name "hivon-blog" -- start
pm2 save
pm2 startup
```
 
### 5. Configure Nginx reverse proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;
 
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```
 
```bash
sudo ln -s /etc/nginx/sites-available/hivon-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
 
### 6. Enable HTTPS (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
 
---
 
## Project Structure
 
```
src/
├── app/
│   ├── api/posts/          # CRUD API
│   ├── api/comments/       # Comments API
│   ├── api/generate-summary/  # Gemini AI API
│   ├── blog/[id]/          # Post detail page
│   ├── blog/create/        # Create post
│   ├── blog/edit/[id]/     # Edit post
│   ├── dashboard/          # User dashboard
│   ├── login/              # Auth
│   ├── register/           # Registration
│   └── profile/            # User profile
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── BlogCard.tsx
│   ├── CommentSection.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── supabase/           # Client, server, middleware
│   └── ai/gemini.ts        # Gemini integration
├── contexts/AuthContext.tsx
├── types/index.ts
└── utils/index.ts
```
 
---
 
*Built with ❤️ for Hivon Automations LLP*