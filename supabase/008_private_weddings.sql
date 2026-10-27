-- Real weddings are independent of the 24-hour portfolio workspaces.
create table if not exists public.nordra_weddings (
  id uuid primary key,
  couple text not null check (char_length(couple) between 3 and 160),
  event_date date not null,
  city text not null default '',
  plan text not null check (plan in ('Bruma','Aurora','Boreal')),
  invitation_path text not null default '',
  cover_path text not null default '',
  reply_until date,
  expires_at timestamptz not null,
  guest_secret text not null check (guest_secret ~ '^[a-f0-9]{64}$'),
  invitations jsonb not null default '[]'::jsonb check (jsonb_typeof(invitations)='array' and jsonb_array_length(invitations)<=300),
  version integer not null default 1,
  created_at timestamptz not null default now()
);
create table if not exists public.nordra_wedding_members (
  event_id uuid not null references public.nordra_weddings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  primary key (event_id,user_id)
);
create index if not exists nordra_wedding_members_user on public.nordra_wedding_members(user_id);
create index if not exists nordra_weddings_date on public.nordra_weddings(event_date);
create or replace function public.nordra_wedding_retention() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Inclusive through the end of the 90th day after the event, Mexico City time.
  new.expires_at := (new.event_date + 91)::timestamp at time zone 'America/Mexico_City';
  return new;
end;
$$;
drop trigger if exists nordra_wedding_retention on public.nordra_weddings;
create trigger nordra_wedding_retention before insert or update of event_date
on public.nordra_weddings for each row execute function public.nordra_wedding_retention();
alter table public.nordra_weddings enable row level security;
alter table public.nordra_wedding_members enable row level security;
revoke all on public.nordra_weddings, public.nordra_wedding_members from public, anon, authenticated;
grant select, insert, update, delete on public.nordra_weddings, public.nordra_wedding_members to service_role;
revoke all on function public.nordra_wedding_retention() from public, anon, authenticated;
-- No automatic deletion: expired events become read-only for Nordra, with export.
-- Guest links and client access are checked against expires_at by every API action.
