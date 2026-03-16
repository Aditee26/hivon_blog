# Blogging Platform with AI-Powered Summaries

A full-stack blogging platform built with Next.js and Supabase, featuring AI-generated post summaries using Google's Gemini API.

## 🚀 Live Demo
**[https://hivon-blog.netlify.app](https://hivon-blog.netlify.app)**

## 📋 Tech Stack
- **Frontend & Backend:** Next.js 14 (App Router)
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **AI Integration:** Google Gemini API
- **Deployment:** Netlify
- **Version Control:** Git & GitHub

## ✨ Features

### User Roles
| Role | Permissions |
|------|-------------|
| **Viewer** | Read posts, view summaries, comment on posts |
| **Author** | Create posts, edit own posts, view comments |
| **Admin** | View all posts, edit any post, monitor comments |

### Blog Features
- 📝 Create posts with title, body, and featured image
- 🤖 AI-generated summaries (200 words) using Google Gemini
- 💬 Comment system on posts
- 🔍 Search posts by title or content
- 📄 Pagination (10 posts per page)
- ✏️ Edit posts (Author/Admin only)

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free)
- Google AI API key (free)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aditee26/hivon_blog.git
   cd hivon_blog
Install dependencies

bash
npm install
Set up environment variables

Create a .env.local file in the root directory:

env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
Set up database

Run these SQL commands in your Supabase SQL editor:

sql
-- Create users table
CREATE TABLE users (
    id UUID REFERENCES auth.users PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT CHECK (role IN ('author', 'viewer', 'admin')) DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    author_id UUID REFERENCES users(id),
    summary TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Authors can insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Admins can update all posts" ON posts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
Run the development server

bash
npm run dev
Open your browser

Visit http://localhost:3000

🚢 Deployment
Deploy to Netlify
Push your code to GitHub

Log in to Netlify

Click "Add new site" → "Import an existing project"

Connect your GitHub repository

Configure build settings:

Build command: npm run build

Publish directory: .next

Add environment variables (same as .env.local)

Click "Deploy"

Environment Variables for Production

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GOOGLE_AI_API_KEY=your_google_key
NEXT_PUBLIC_SITE_URL=https://your-netlify-url.netlify.app

📁 Project Structure
text
src/
├── app/                   # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── posts/         # Post CRUD operations
│   │   └── generate-summary/ # AI summary generation
│   ├── posts/             # Post pages
│   │   ├── page.tsx       # Post listing with pagination
│   │   └── [id]/          # Individual post page
│   ├── profile/           # User profile page
│   ├── admin/             # Admin dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # Reusable components
│   ├── auth/              # Auth components
│   ├── posts/             # Post components
│   └── comments/          # Comment components
├── lib/                    # Utilities and config
│   ├── supabase/          # Supabase client
│   └── ai/                # Google AI integration
└── middleware.ts          # Auth middleware

🧪 Testing the Application
Test User Roles
Register a new account → Default role: Viewer

Update role to Author/Admin in Supabase dashboard to test permissions

Test AI Summary Generation
Login as Author

Create a new post with at least 500 words

AI summary will be generated automatically

Check post listing page to see the summary

🐛 Known Issues & Fixes
Issue	Solution
TypeScript error with refreshProfile	Removed unused function from profile page
Netlify deployment failing	Added netlify.toml configuration
RLS policy errors	Added proper policies for each table
📝 License
This project is created for Hivon Automations internship assignment.

👩‍💻 Author
Aditee Singh

GitHub: @Aditee26

Email: aditeesingh2006@gmail.com

🙏 Acknowledgments
Hivon Automations for the assignment opportunity

Next.js team for the amazing framework

Supabase for the backend infrastructure

Google for the Gemini API

Project Repository: https://github.com/Aditee26/hivon_blog

Live Demo: https://hivon-blog.netlify.app
