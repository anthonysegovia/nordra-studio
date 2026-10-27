begin;

-- Keep display names untouched. A shared comparison key catches accidental
-- repeats across devices; this does not authenticate a person's identity.
create or replace function public.nordra_posada_name_key(p_name text)
returns text language sql immutable strict parallel safe set search_path = '' as $$
  select btrim(regexp_replace(translate(lower(normalize(p_name, NFC)),
    'áàäâãåéèëêíìïîóòöôõúùüûýÿ',
    'aaaaaaeeeeiiiiooooouuuuyy'), '[[:space:]]+', ' ', 'g'));
$$;
revoke all on function public.nordra_posada_name_key(text) from public, anon, authenticated;
grant execute on function public.nordra_posada_name_key(text) to service_role;

-- Fail atomically if existing responses collide; never discard guest records.
create unique index if not exists nordra_posada_unique_guest_name
on public.nordra_posada_responses (public.nordra_posada_name_key(guest_name));

create or replace function public.nordra_save_posada_response(
  p_id uuid, p_token_hash text, p_name text, p_attendance text, p_bucket text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_attempts integer;
  v_updated timestamptz;
  v_constraint text;
begin
  delete from public.nordra_posada_rate_limits where expires_at < now();
  insert into public.nordra_posada_rate_limits (bucket, expires_at)
  values (p_bucket, now() + interval '1 hour')
  on conflict (bucket) do update set attempts = nordra_posada_rate_limits.attempts + 1
  returning attempts into v_attempts;
  if v_attempts > 120 then return jsonb_build_object('status', 'limited'); end if;

  -- Catch only the name collision. Rate-limit attempts remain counted and a
  -- different edit capability can never overwrite the existing guest's answer.
  begin
    insert into public.nordra_posada_responses (id, edit_token_hash, guest_name, attendance)
    values (p_id, p_token_hash, p_name, p_attendance)
    on conflict (id) do update set guest_name = excluded.guest_name,
      attendance = excluded.attendance, updated_at = now()
    where nordra_posada_responses.edit_token_hash = excluded.edit_token_hash
    returning updated_at into v_updated;
  exception when unique_violation then
    get stacked diagnostics v_constraint = CONSTRAINT_NAME;
    if v_constraint = 'nordra_posada_unique_guest_name' then
      return jsonb_build_object('status', 'duplicate');
    end if;
    raise;
  end;
  if v_updated is null then return jsonb_build_object('status', 'conflict'); end if;
  return jsonb_build_object('status', 'saved', 'updatedAt', v_updated);
end;
$$;
revoke all on function public.nordra_save_posada_response(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.nordra_save_posada_response(uuid, text, text, text, text) to service_role;
notify pgrst, 'reload schema';
commit;
