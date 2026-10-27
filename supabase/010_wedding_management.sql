-- Private operational data follows the existing event retention and RLS.
-- Guest and reception responses never expose this column.
alter table public.nordra_weddings
  add column if not exists management jsonb not null default '{}'::jsonb
  check (jsonb_typeof(management) = 'object');
alter table public.nordra_wedding_workspaces
  add column if not exists management jsonb not null default '{}'::jsonb
  check (jsonb_typeof(management) = 'object');
