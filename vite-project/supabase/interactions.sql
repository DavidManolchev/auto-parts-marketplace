-- Run once in Supabase: SQL Editor > New query > paste > Run.
-- Adds comments and likes on listings (run after schema.sql).

create table public.comments (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings (id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  author_name text not null default '',
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create table public.likes (
  listing_id bigint not null references public.listings (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  primary key (listing_id, user_id)
);

create index comments_listing_idx on public.comments (listing_id, created_at);

alter table public.comments enable row level security;
alter table public.likes enable row level security;

create policy "Anyone can read comments"
  on public.comments for select to anon, authenticated using (true);
create policy "Users can add their own comments"
  on public.comments for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Users can delete their own comments"
  on public.comments for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Anyone can read likes"
  on public.likes for select to anon, authenticated using (true);
create policy "Users can like as themselves"
  on public.likes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users can remove their own like"
  on public.likes for delete to authenticated
  using (user_id = (select auth.uid()));

grant select on public.comments, public.likes to anon, authenticated;
grant insert, delete on public.comments, public.likes to authenticated;
