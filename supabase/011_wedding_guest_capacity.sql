begin;

-- Aurora and Boreal have no guest limit. Replace the former 300-invitation checks
-- with the technical ceiling enforced by server/wedding-capacity.js (5,000 people,
-- so never more than 5,000 invitations). Existing lists are untouched.
do $$
declare v record;
begin
  for v in
    select c.conrelid::regclass as tbl, c.conname
    from pg_constraint c
    where c.contype = 'c'
      and c.conrelid in ('public.nordra_wedding_workspaces'::regclass, 'public.nordra_weddings'::regclass)
      and pg_get_constraintdef(c.oid) like '%jsonb_array_length(invitations)%'
  loop
    execute format('alter table %s drop constraint %I', v.tbl, v.conname);
  end loop;
end $$;

alter table public.nordra_wedding_workspaces
  add constraint nordra_wedding_workspaces_invitations_capacity
  check (jsonb_typeof(invitations) = 'array' and jsonb_array_length(invitations) <= 5000);
alter table public.nordra_weddings
  add constraint nordra_weddings_invitations_capacity
  check (jsonb_typeof(invitations) = 'array' and jsonb_array_length(invitations) <= 5000);

commit;
