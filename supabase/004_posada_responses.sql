begin;

create table if not exists public.nordra_posada_responses (
  id uuid primary key,
  edit_token_hash text not null check (edit_token_hash ~ '^[a-f0-9]{64}$'),
  guest_name text not null check (char_length(guest_name) between 2 and 100),
  attendance text not null check (attendance in ('yes', 'no')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.nordra_posada_rate_limits (
  bucket text primary key check (bucket ~ '^[a-f0-9]{64}$'),
  attempts integer not null default 1,
  expires_at timestamptz not null
);
alter table public.nordra_posada_responses enable row level security;
alter table public.nordra_posada_rate_limits enable row level security;
revoke all on public.nordra_posada_responses, public.nordra_posada_rate_limits from public, anon, authenticated;
grant select, insert, update on public.nordra_posada_responses to service_role;
grant select, insert, update, delete on public.nordra_posada_rate_limits to service_role;

-- Invoked only by Nordra's server. No guest can read the list or call this RPC.
create or replace function public.nordra_save_posada_response(
  p_id uuid, p_token_hash text, p_name text, p_attendance text, p_bucket text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_attempts integer;
  v_updated timestamptz;
begin
  delete from public.nordra_posada_rate_limits where expires_at < now();
  insert into public.nordra_posada_rate_limits (bucket, expires_at)
  values (p_bucket, now() + interval '1 hour')
  on conflict (bucket) do update set attempts = nordra_posada_rate_limits.attempts + 1
  returning attempts into v_attempts;
  if v_attempts > 120 then return jsonb_build_object('status', 'limited'); end if;

  insert into public.nordra_posada_responses (id, edit_token_hash, guest_name, attendance)
  values (p_id, p_token_hash, p_name, p_attendance)
  on conflict (id) do update set guest_name = excluded.guest_name,
    attendance = excluded.attendance, updated_at = now()
  where nordra_posada_responses.edit_token_hash = excluded.edit_token_hash
  returning updated_at into v_updated;
  if v_updated is null then return jsonb_build_object('status', 'conflict'); end if;
  return jsonb_build_object('status', 'saved', 'updatedAt', v_updated);
end;
$$;
revoke all on function public.nordra_save_posada_response(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.nordra_save_posada_response(uuid, text, text, text, text) to service_role;
notify pgrst, 'reload schema';
commit;
