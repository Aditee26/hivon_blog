-- ============================================================
-- HIVON BLOG PLATFORM — Supabase Schema v2
-- Run this in your Supabase SQL editor
-- ============================================================

create extension if not exists "uuid-ossp";

drop table if exists public.comments;
drop table if exists public.posts;
drop table if exists public.users;

-- Users table
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'viewer' check (role in ('viewer', 'author', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Posts table
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  author_id uuid not null references public.users(id) on delete cascade,
  summary text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments table
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  comment_text text not null,
  created_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Users policies
create policy "Users can read all profiles"   on public.users for select using (true);
create policy "Users can insert own profile"  on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile"  on public.users for update using (auth.uid() = id);

-- Posts policies
create policy "Anyone can read published posts" on public.posts for select using (published = true);
create policy "Authors can insert posts"        on public.posts for insert with check (auth.uid() = author_id);
create policy "Authors can update own posts"    on public.posts for update using (
  auth.uid() = author_id or
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Authors can delete own posts"    on public.posts for delete using (
  auth.uid() = author_id or
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Comments policies
create policy "Anyone can read comments"               on public.comments for select using (true);
create policy "Authenticated users can insert comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments"          on public.comments for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists posts_search_idx    on public.posts using gin(to_tsvector('english', title || ' ' || body));
create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists comments_post_id_idx on public.comments(post_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::text, 'viewer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();