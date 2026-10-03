-- Run this file in the Supabase SQL Editor. Sample venues are fictional.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'LocalBites member',
  created_at timestamptz not null default now()
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('restaurant', 'coffee shop', 'study spot')),
  price_level integer check (price_level between 1 and 3),
  cuisine text,
  description text not null,
  address text not null,
  neighborhood text not null,
  hours text,
  image_url text,
  tags text[] not null default '{}',
  latitude double precision,
  longitude double precision,
  source_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 10 and 500),
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create index if not exists reviews_place_created_idx on public.reviews (place_id, created_at desc);
create index if not exists favorites_user_idx on public.favorites (user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
create policy "Profiles are readable" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "Users update their profile" on public.profiles;
create policy "Users update their profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Places are readable" on public.places;
create policy "Places are readable" on public.places for select to anon, authenticated using (true);

drop policy if exists "Reviews are readable" on public.reviews;
create policy "Reviews are readable" on public.reviews for select to anon, authenticated using (true);
drop policy if exists "Users create their reviews" on public.reviews;
create policy "Users create their reviews" on public.reviews for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users update their reviews" on public.reviews;
create policy "Users update their reviews" on public.reviews for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete their reviews" on public.reviews;
create policy "Users delete their reviews" on public.reviews for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users read their favorites" on public.favorites;
create policy "Users read their favorites" on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users create their favorites" on public.favorites;
create policy "Users create their favorites" on public.favorites for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users update their favorites" on public.favorites;
create policy "Users update their favorites" on public.favorites for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete their favorites" on public.favorites;
create policy "Users delete their favorites" on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);

-- Public image bucket. The MVP uses hosted sample photos, but place image_url can
-- point to public URLs from this bucket when real place photos are added.
insert into storage.buckets (id, name, public)
values ('place-images', 'place-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Place images are public" on storage.objects;
create policy "Place images are public" on storage.objects for select to anon, authenticated
using (bucket_id = 'place-images');

-- Only authenticated users may upload to a folder named after their user ID.
drop policy if exists "Users upload their place images" on storage.objects;
create policy "Users upload their place images" on storage.objects for insert to authenticated
with check (bucket_id = 'place-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users update their place images" on storage.objects;
create policy "Users update their place images" on storage.objects for update to authenticated
using (bucket_id = 'place-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'place-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users delete their place images" on storage.objects;
create policy "Users delete their place images" on storage.objects for delete to authenticated
using (bucket_id = 'place-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Run real_places.sql next to load verified OpenStreetMap listings.
