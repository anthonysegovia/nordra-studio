begin;

-- Isolated public portfolio workspaces; existing events and payments are untouched.
create table if not exists public.nordra_wedding_workspaces (
  id uuid primary key,
  owner_hash text not null check (owner_hash ~ '^[a-f0-9]{64}$'),
  invitations jsonb not null default '[]'::jsonb check (jsonb_typeof(invitations) = 'array' and jsonb_array_length(invitations) <= 300),
  version integer not null default 1,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists nordra_wedding_expiry on public.nordra_wedding_workspaces(expires_at);
alter table public.nordra_wedding_workspaces enable row level security;
revoke all on public.nordra_wedding_workspaces from public, anon, authenticated;
grant select, insert, update, delete on public.nordra_wedding_workspaces to service_role;

create table if not exists public.nordra_wedding_limits (
  bucket text primary key,
  attempts integer not null default 1,
  expires_at timestamptz not null
);
alter table public.nordra_wedding_limits enable row level security;
revoke all on public.nordra_wedding_limits from public, anon, authenticated;
grant select, insert, update, delete on public.nordra_wedding_limits to service_role;

create or replace function public.nordra_wedding_allow(p_bucket text, p_limit integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_count integer;
begin
  delete from public.nordra_wedding_limits where expires_at < now();
  delete from public.nordra_wedding_workspaces where expires_at < now();
  insert into public.nordra_wedding_limits(bucket,expires_at) values(p_bucket,now()+interval '1 hour')
  on conflict(bucket) do update set attempts=nordra_wedding_limits.attempts+1
  returning attempts into v_count;
  return v_count <= p_limit;
end;
$$;
revoke all on function public.nordra_wedding_allow(text,integer) from public, anon, authenticated;
grant execute on function public.nordra_wedding_allow(text,integer) to service_role;
notify pgrst, 'reload schema';
commit;
