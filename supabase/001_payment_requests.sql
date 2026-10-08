-- Aplicar en tu propio proyecto Supabase antes de habilitar el panel.
-- Ninguna política pública: solo las funciones de servidor usan la clave secreta.
create table if not exists public.nordra_payment_requests (
  token text primary key check (token ~ '^[a-f0-9]{64}$'),
  request_id uuid not null unique,
  reference text not null check (length(reference) between 1 and 160),
  project text not null check (length(project) between 1 and 160),
  concept text not null check (length(concept) between 1 and 160),
  amount_cents integer not null check (amount_cents between 1 and 100000000),
  expires_at timestamptz not null,
  state text not null default 'creating' check (state in ('creating', 'open', 'paid', 'closed', 'creation_failed')),
  checkout_url text,
  preference_id text,
  last_verified_state text,
  last_verified_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (reference, concept)
);
alter table public.nordra_payment_requests enable row level security;
revoke all on public.nordra_payment_requests from public, anon, authenticated;
grant select, insert, update on public.nordra_payment_requests to service_role;
create index if not exists nordra_payment_requests_recent on public.nordra_payment_requests (created_at desc);
