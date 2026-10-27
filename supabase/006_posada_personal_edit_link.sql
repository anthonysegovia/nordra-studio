begin;

-- Read one response only after the server hashes the guest's edit capability.
-- Neither names nor UUIDs alone grant read or edit access.
create or replace function public.nordra_read_posada_response(
  p_id uuid, p_token_hash text, p_bucket text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_attempts integer; v_response jsonb;
begin
  delete from public.nordra_posada_rate_limits where expires_at < now();
  insert into public.nordra_posada_rate_limits (bucket, expires_at)
  values (p_bucket, now() + interval '1 hour')
  on conflict (bucket) do update set attempts = nordra_posada_rate_limits.attempts + 1
  returning attempts into v_attempts;
  if v_attempts > 120 then return jsonb_build_object('status', 'limited'); end if;

  select jsonb_build_object('status', 'found', 'name', guest_name,
    'attendance', attendance, 'updatedAt', updated_at)
  into v_response from public.nordra_posada_responses
  where id = p_id and edit_token_hash = p_token_hash;
  return coalesce(v_response, jsonb_build_object('status', 'missing'));
end;
$$;
revoke all on function public.nordra_read_posada_response(uuid, text, text) from public, anon, authenticated;
grant execute on function public.nordra_read_posada_response(uuid, text, text) to service_role;
notify pgrst, 'reload schema';
commit;
