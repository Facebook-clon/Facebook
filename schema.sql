-- Run this in the Supabase SQL editor. It creates the tables described in
-- section 3 of the document and enables Row Level Security on each.

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null,
  avatar_url text,
  fcm_token text,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  content text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, post_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references users(id) on delete cascade,
  sender_id uuid references users(id) on delete cascade,
  type text not null,
  post_id uuid references posts(id) on delete cascade,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table users enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table notifications enable row level security;

-- Note: the backend server uses the SERVICE ROLE key, which bypasses RLS
-- entirely. These policies matter only if the mobile app ever talks to
-- Supabase directly (as storageService.js currently does for uploads).

create policy "Public read access to users" on users for select using (true);
create policy "Users can update own row" on users for update using (auth.uid() = id);

create policy "Public read access to posts" on posts for select using (true);
create policy "Users can insert own posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can delete own posts" on posts for delete using (auth.uid() = user_id);

create policy "Public read access to likes" on likes for select using (true);
create policy "Users can like as themselves" on likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike their own like" on likes for delete using (auth.uid() = user_id);

create policy "Public read access to comments" on comments for select using (true);
create policy "Users can comment as themselves" on comments for insert with check (auth.uid() = user_id);

create policy "Users can read own notifications" on notifications for select using (auth.uid() = recipient_id);
