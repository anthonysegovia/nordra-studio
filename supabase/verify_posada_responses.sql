-- Disposable verification inside a rolled-back transaction. No real guest rows change.
begin;
do $$ begin
  assert not has_table_privilege('anon', 'public.nordra_posada_responses', 'SELECT');
  assert not has_table_privilege('authenticated', 'public.nordra_posada_responses', 'SELECT');
  assert not has_function_privilege('anon', 'public.nordra_save_posada_response(uuid,text,text,text,text)', 'EXECUTE');
  assert not has_function_privilege('authenticated', 'public.nordra_save_posada_response(uuid,text,text,text,text)', 'EXECUTE');
  assert not has_function_privilege('anon', 'public.nordra_read_posada_response(uuid,text,text)', 'EXECUTE');
  assert not has_function_privilege('authenticated', 'public.nordra_read_posada_response(uuid,text,text)', 'EXECUTE');
  assert (select relrowsecurity from pg_class where oid = 'public.nordra_posada_responses'::regclass);
end $$;
set local role service_role;
do $$
declare result jsonb; candidate text; attempts_before integer;
begin
  result := public.nordra_save_posada_response('b837c48a-3945-46fd-9b4b-6f670cb0696a', repeat('a',64), 'Prueba temporal Nordra', 'yes', repeat('d',64));
  assert result->>'status' = 'saved', 'Insert failed';
  result := public.nordra_read_posada_response('b837c48a-3945-46fd-9b4b-6f670cb0696a', repeat('a',64), repeat('d',64));
  assert result->>'status' = 'found' and result->>'name' = 'Prueba temporal Nordra' and result->>'attendance' = 'yes', 'Personal link cannot recover the original';
  assert not result ? 'edit_token_hash', 'Read leaked a capability hash';
  result := public.nordra_read_posada_response('b837c48a-3945-46fd-9b4b-6f670cb0696a', repeat('b',64), repeat('d',64));
  assert result = '{"status":"missing"}'::jsonb, 'Wrong token disclosed a response';
  result := public.nordra_read_posada_response('55d854eb-d3bc-4f54-9dbe-9f31ded1d54d', repeat('a',64), repeat('d',64));
  assert result = '{"status":"missing"}'::jsonb, 'Unknown id disclosed a response';
  result := public.nordra_save_posada_response('b837c48a-3945-46fd-9b4b-6f670cb0696a', repeat('a',64), 'Prueba temporal Nordra', 'no', repeat('d',64));
  assert result->>'status' = 'saved', 'Update failed';
  assert (select count(*) = 1 from public.nordra_posada_responses where id = 'b837c48a-3945-46fd-9b4b-6f670cb0696a');
  result := public.nordra_save_posada_response('b837c48a-3945-46fd-9b4b-6f670cb0696a', repeat('b',64), 'No debe guardarse', 'yes', repeat('d',64));
  assert result->>'status' = 'conflict', 'Wrong token changed a response';
  assert (select attendance = 'no' and guest_name = 'Prueba temporal Nordra' from public.nordra_posada_responses where id = 'b837c48a-3945-46fd-9b4b-6f670cb0696a');
  select attempts into attempts_before from public.nordra_posada_rate_limits where bucket = repeat('d',64);
  foreach candidate in array array['  PRUEBA   TEMPORAL   NORDRA ', 'Prúeba témporal Nórdra', U&'Pru\0301eba temporal Nordra'] loop
    result := public.nordra_save_posada_response('ad2d7db8-e366-4e7d-a00f-8d95bca21867', repeat('b',64), candidate, 'yes', repeat('d',64));
    assert result->>'status' = 'duplicate', 'Name normalization did not block a repeat';
  end loop;
  assert (select attempts = attempts_before + 3 from public.nordra_posada_rate_limits where bucket = repeat('d',64)), 'Duplicates bypassed rate limit';
  assert not exists (select 1 from public.nordra_posada_responses where id = 'ad2d7db8-e366-4e7d-a00f-8d95bca21867');
  assert (select attendance = 'no' and guest_name = 'Prueba temporal Nordra' from public.nordra_posada_responses where id = 'b837c48a-3945-46fd-9b4b-6f670cb0696a'), 'Duplicate overwrote the original';
  result := public.nordra_save_posada_response('ad2d7db8-e366-4e7d-a00f-8d95bca21867', repeat('b',64), 'Prueba temporal Nordra Apellido', 'yes', repeat('d',64));
  assert result->>'status' = 'saved', 'Distinct full name was blocked';
  result := public.nordra_save_posada_response('ad2d7db8-e366-4e7d-a00f-8d95bca21867', repeat('b',64), 'PRUEBA TEMPORAL NORDRA', 'yes', repeat('d',64));
  assert result->>'status' = 'duplicate', 'Rename bypassed unique name';
  assert (select guest_name = 'Prueba temporal Nordra Apellido' from public.nordra_posada_responses where id = 'ad2d7db8-e366-4e7d-a00f-8d95bca21867'), 'Rejected rename damaged the original';
  update public.nordra_posada_rate_limits set attempts = 120 where bucket = repeat('d',64);
  result := public.nordra_save_posada_response('b837c48a-3945-46fd-9b4b-6f670cb0696a', repeat('a',64), 'Prueba temporal Nordra', 'yes', repeat('d',64));
  assert result->>'status' = 'limited', 'Rate limit failed';
  result := public.nordra_read_posada_response('b837c48a-3945-46fd-9b4b-6f670cb0696a', repeat('a',64), repeat('d',64));
  assert result->>'status' = 'limited', 'Recovery bypassed the rate limit';
end $$;
rollback;
select 'PASS: private access, personal-link recovery, wrong-token protection, insert, idempotent update, unique names, safe rename and rate limit; all test data rolled back' as verification;
