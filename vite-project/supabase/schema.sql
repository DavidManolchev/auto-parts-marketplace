-- Run once in Supabase: SQL Editor > New query > paste > Run.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  contact_email text
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, contact_email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.listings (
  id bigint generated always as identity primary key,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('part', 'fluid')),
  title text not null check (char_length(title) between 1 and 120),
  code text not null default '',
  category text not null,
  condition text check (condition in ('New', 'Refurbished', 'Used, tested', 'Used, as is')),
  price numeric(10, 2) not null check (price >= 0),
  seller_name text not null default '',
  city text not null default '',
  fits jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint condition_matches_kind check (
    (kind = 'fluid' and condition is null) or (kind = 'part' and condition is not null)
  )
);

create index listings_created_at_idx on public.listings (created_at desc);
create index listings_kind_category_idx on public.listings (kind, category);
create index listings_owner_idx on public.listings (owner_id);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;

create policy "Anyone can read listings"
  on public.listings for select to anon, authenticated using (true);

create policy "Users can create their own listings"
  on public.listings for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Users can edit their own listings"
  on public.listings for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Users can delete their own listings"
  on public.listings for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "Logged-in users can read profiles"
  on public.profiles for select to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant select, update on public.profiles to authenticated;