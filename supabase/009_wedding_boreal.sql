-- Tables, per-person seats and arrival records share the existing compare-and-swap
-- version with RSVPs. A single conditional update makes two reception devices safe.
alter table public.nordra_weddings
  add column if not exists boreal jsonb not null default '{}'::jsonb
  check (jsonb_typeof(boreal) = 'object');
alter table public.nordra_wedding_workspaces
  add column if not exists boreal jsonb not null default '{}'::jsonb
  check (jsonb_typeof(boreal) = 'object');
-- Existing RLS and service-role-only grants remain in force. No guest/client
-- direct database access. Arrival and seating data follow the event's retention.
