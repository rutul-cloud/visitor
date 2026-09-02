-- ============================================================
-- Hospital Visitor Tracker — Supabase setup
-- Copy the ENTIRE contents of this file into the Supabase
-- "SQL Editor" and run it ONCE. That's all the database setup.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.visitors (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  name           text not null,
  phone          text not null,
  purpose        text not null check (purpose in ('opd', 'ipd', 'office', 'other')),
  patient_name   text,
  appointment_no text,
  ward_bed       text,
  department     text,
  consent        boolean not null default true,
  mode           text not null default 'self' check (mode in ('self', 'staff')),
  checked_in_at  timestamptz not null default now(),
  checked_out_at timestamptz,
  checkout_type  text check (checkout_type in ('manual', 'geofence', 'timeout')),
  geo_lat        double precision,
  geo_lng        double precision
);

create index if not exists visitors_checked_in_at_idx
  on public.visitors (checked_in_at desc);
create index if not exists visitors_phone_idx
  on public.visitors (phone);
create index if not exists visitors_inhouse_idx
  on public.visitors (checked_in_at) where checked_out_at is null;

-- Row Level Security is enabled with NO policies:
-- the only client allowed to talk to this table is the
-- Netlify Functions backend, which uses the service_role key
-- (it lives on the server and is never sent to any browser).
alter table public.visitors enable row level security;
