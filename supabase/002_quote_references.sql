-- Aplicar después de 001_payment_requests.sql.
create table if not exists public.nordra_quote_references (
  request_id uuid primary key,
  reference text not null unique
);
alter table public.nordra_quote_references enable row level security;
revoke all on public.nordra_quote_references from public, anon, authenticated;

create or replace function public.nordra_reserve_reference(reservation_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  existing text;
  quote_year text := to_char(now() at time zone 'America/Mexico_City', 'YYYY');
  next_number integer;
begin
  -- Serializa las reservas; reintentar la misma solicitud devuelve el mismo folio.
  perform pg_advisory_xact_lock(8129022231);
  select reference into existing from public.nordra_quote_references where request_id = reservation_id;
  if existing is not null then return existing; end if;
  select coalesce(max(split_part(reference, '-', 3)::integer), 0) + 1 into next_number
  from (
    select reference from public.nordra_quote_references
    union all select reference from public.nordra_payment_requests
  ) refs where reference ~ ('^NDR-' || quote_year || '-[0-9]{1,9}$');
  existing := 'NDR-' || quote_year || '-' || lpad(next_number::text, greatest(3, length(next_number::text)), '0');
  insert into public.nordra_quote_references values (reservation_id, existing);
  return existing;
end;
$$;
revoke all on function public.nordra_reserve_reference(uuid) from public, anon, authenticated;
grant execute on function public.nordra_reserve_reference(uuid) to service_role;
