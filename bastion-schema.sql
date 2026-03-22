-- ============================================
-- BASTION MANAGER - Supabase Schema
-- D&D 2024 Bastion System
-- ============================================
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- This creates all tables needed for the Bastion Manager app.

-- Parties (campaign groups)
create table if not exists parties (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  join_code text not null unique,
  dm_client_id text, -- the DM's browser client ID
  created_at timestamptz default now()
);

-- Players (characters in a party)
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  party_id uuid references parties(id) on delete cascade not null,
  client_id text not null, -- browser-generated UUID stored locally
  character_name text not null,
  character_class text not null default 'Fighter',
  character_level integer not null default 5 check (character_level >= 1 and character_level <= 20),
  is_dm boolean default false,
  avatar_color text default '#D4A843',
  created_at timestamptz default now(),
  unique(party_id, client_id)
);

-- Bastions (one per player)
create table if not exists bastions (
  id uuid default gen_random_uuid() primary key,
  player_id uuid references players(id) on delete cascade not null unique,
  name text not null,
  description text,
  defensive_wall_squares integer default 0,
  walls_fully_enclosed boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Facilities (basic and special, belonging to a bastion)
create table if not exists facilities (
  id uuid default gen_random_uuid() primary key,
  bastion_id uuid references bastions(id) on delete cascade not null,
  facility_key text not null,       -- e.g. 'arcane_study', 'bedroom'
  facility_type text not null,      -- 'basic' or 'special'
  size text not null default 'roomy' check (size in ('cramped', 'roomy', 'vast')),
  custom_name text,                 -- optional player-given name
  notes text,
  garden_type text,                 -- for gardens: decorative/food/herb/poison
  workshop_tools jsonb,             -- for workshops: chosen artisan tools
  pub_beverage text,                -- for pubs: chosen magical beverage
  training_type text,               -- for training areas: chosen trainer type
  guild_type text,                  -- for guildhalls: chosen guild
  manifest_plane text,              -- for manifest zones: chosen plane
  museum_charm text,                -- for museums: chosen charm origin
  archive_books jsonb,              -- for archives: chosen reference books
  created_at timestamptz default now()
);

-- Hirelings (belonging to a facility)
create table if not exists hirelings (
  id uuid default gen_random_uuid() primary key,
  facility_id uuid references facilities(id) on delete cascade not null,
  name text not null default 'Unnamed Hireling',
  role text,                        -- e.g. 'Bartender', 'Smith', 'Trainer'
  personality text,
  created_at timestamptz default now()
);

-- Bastion Defenders (belonging to a bastion, housed in a facility)
create table if not exists defenders (
  id uuid default gen_random_uuid() primary key,
  bastion_id uuid references bastions(id) on delete cascade not null,
  facility_id uuid references facilities(id) on delete set null,
  name text not null default 'Unnamed Defender',
  is_alive boolean default true,
  creature_type text,               -- null for humanoid, or e.g. 'Owlbear' for menagerie
  notes text,
  created_at timestamptz default now()
);

-- Bastion Turns (history of orders and events)
create table if not exists bastion_turns (
  id uuid default gen_random_uuid() primary key,
  bastion_id uuid references bastions(id) on delete cascade not null,
  turn_number integer not null,
  in_game_date text,
  is_maintain boolean default false,
  orders jsonb default '[]',        -- [{facility_id, order_type, details}]
  event_roll integer,               -- d100 roll result
  event_type text,                  -- e.g. 'all_is_well', 'attack', etc.
  event_details text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (permissive for party tool)
-- ============================================
alter table parties enable row level security;
alter table players enable row level security;
alter table bastions enable row level security;
alter table facilities enable row level security;
alter table hirelings enable row level security;
alter table defenders enable row level security;
alter table bastion_turns enable row level security;

create policy "Open access parties" on parties for all using (true) with check (true);
create policy "Open access players" on players for all using (true) with check (true);
create policy "Open access bastions" on bastions for all using (true) with check (true);
create policy "Open access facilities" on facilities for all using (true) with check (true);
create policy "Open access hirelings" on hirelings for all using (true) with check (true);
create policy "Open access defenders" on defenders for all using (true) with check (true);
create policy "Open access bastion_turns" on bastion_turns for all using (true) with check (true);

-- ============================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bastions_updated_at
  before update on bastions
  for each row execute function update_updated_at();

-- ============================================
-- INDEXES
-- ============================================
create index idx_players_party on players(party_id);
create index idx_players_client on players(client_id);
create index idx_bastions_player on bastions(player_id);
create index idx_facilities_bastion on facilities(bastion_id);
create index idx_hirelings_facility on hirelings(facility_id);
create index idx_defenders_bastion on defenders(bastion_id);
create index idx_bastion_turns_bastion on bastion_turns(bastion_id);
