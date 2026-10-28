create extension if not exists "pgcrypto";

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  position text not null,
  number integer not null check (number >= 0),
  note text not null default '',
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  status text not null default 'Active' check (status in ('Active', 'Injured', 'Suspended', 'Unavailable')),
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  opponent text not null,
  played_at date not null,
  home_score integer not null default 0 check (home_score >= 0),
  away_score integer not null default 0 check (away_score >= 0),
  result text not null check (result in ('Win', 'Draw', 'Loss')),
  competition text not null default 'League',
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists players_updated_at on public.players;
create trigger players_updated_at before update on public.players
for each row execute function public.set_updated_at();

alter table public.players enable row level security;
alter table public.matches enable row level security;

drop policy if exists "Public can view players" on public.players;
create policy "Public can view players" on public.players for select to anon, authenticated using (true);
drop policy if exists "Authenticated admins can manage players" on public.players;
create policy "Authenticated admins can manage players" on public.players for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can view matches" on public.matches;
create policy "Public can view matches" on public.matches for select to anon, authenticated using (true);
drop policy if exists "Authenticated admins can manage matches" on public.matches;
create policy "Authenticated admins can manage matches" on public.matches for all to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.players (name, slug, position, number, note, goals, assists, status, image)
values
  ('Taleb', 'taleb', 'GK', 1, 'Safe hands', 0, 0, 'Active', null),
  ('Ahmed Al-Jboury', 'ahmed-al-jboury', 'ST', 9, 'The finisher', 0, 0, 'Active', null),
  ('Saif', 'saif', 'CM', 7, 'Engine room', 4, 7, 'Active', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Saif_7-ITQKRmwHycxOMMfy2SdTWMbvCHDgrZ.jpg'),
  ('Ibrahim Nawzad', 'ibrahim-nawzad', 'CM', 5, 'Box to box', 3, 3, 'Active', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ibrahim_Nawzad_5-S7MMKujgxHimWxtrEYXY5cEfDM0Oq7.jpg'),
  ('Ibrahim', 'ibrahim', 'CDM', 11, 'The shield', 1, 4, 'Active', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ibrahim_11-1jTRLjCzdPqO5dxXmf0rl2eZSKgCyq.jpg'),
  ('Ahmed', 'ahmed', 'ST', 9, 'The finisher', 11, 2, 'Active', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ahmed_9-uI5td0rbtqeoM3qraEzqYgsVng4F9M.jpg'),
  ('Mostafa', 'mostafa', 'CM', 8, 'Creative force', 5, 4, 'Active', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mustafa_8-nMmbCaSU9v0IcJ9ojk5aKKCtbozBsM.jpg'),
  ('Maron', 'maron', 'CB', 3, 'Last line', 1, 1, 'Active', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Maron_3-cqn9tBV50JiEUiQRPLRhGsrXzr6xZp.jpg'),
  ('Martin', 'martin', 'CB', 2, 'Commanding', 0, 1, 'Active', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Martin_2-IO88EDMyRoRGOXkWt54yeKR4H19rBr.jpg'),
  ('Dara', 'dara', 'CB', 4, 'The anchor', 1, 0, 'Active', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Dara_4-jfZqJ6dpffbT5TpuN84NCwXsUBO2U1.jpg')
on conflict (slug) do update set image = excluded.image, position = excluded.position, number = excluded.number;

insert into public.matches (opponent, played_at, home_score, away_score, result, competition)
values ('Akkad FC', current_date, 3, 1, 'Win', 'Friendly')
where not exists (select 1 from public.matches);
