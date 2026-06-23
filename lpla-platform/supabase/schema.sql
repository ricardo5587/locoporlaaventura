-- LPLA Platform Database Schema

create table if not exists events (
  id           bigserial primary key,
  title_es     text not null,
  title_en     text not null,
  desc_es      text,
  desc_en      text,
  date         date not null,
  time         text,
  location     text,
  category     text,
  price        numeric(8,2) default 0,
  is_free      boolean default false,
  total_spots  integer,
  spots_left   integer,
  draft        boolean default false,
  image        text,
  tickets      jsonb default '[]',
  duration     text,
  recurring    jsonb,
  created_at   timestamptz default now()
);

-- Migration for existing databases (safe to re-run):
alter table events add column if not exists duration text;
alter table events add column if not exists recurring jsonb;

create table if not exists orders (
  id               bigserial primary key,
  event_id         bigint references events(id) on delete set null,
  first_name       text,
  last_name        text,
  email            text,
  phone            text,
  ticket_id        text,
  ticket_label     text,
  qty              integer default 1,
  amount           numeric(8,2) default 0,
  channel          text default 'Website widget',
  status           text default 'confirmed',
  checked_in       boolean default false,
  clover_charge_id text,
  sms_consent      boolean default false,
  email_consent    boolean default false,
  created_at       timestamptz default now()
);

create index if not exists orders_event_id_idx  on orders(event_id);
create index if not exists orders_email_idx     on orders(email);
create index if not exists orders_status_idx    on orders(status);
create index if not exists orders_created_idx   on orders(created_at desc);

-- Admin users table for multi-user access
create table if not exists admin_users (
  id           bigserial primary key,
  email        text unique not null,
  name         text not null,
  phone        text not null,
  password_hash text not null,
  role         text not null default 'editor' check (role in ('owner','editor','viewer')),
  active       boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists admin_users_email_idx on admin_users(email);

-- Hero slides for public homepage carousel (max 4 slots)
create table if not exists hero_slides (
  id           integer primary key check (id between 1 and 4),
  image_url    text,
  updated_at   timestamptz default now()
);

-- Seed the 4 slide rows if they don't exist
insert into hero_slides (id) values (1),(2),(3),(4) on conflict do nothing;

-- Helper RPC functions for atomic spot management
create or replace function decrement_spots(event_id bigint, qty integer)
returns void language sql as $$
  update events set spots_left = greatest(0, spots_left - qty) where id = event_id;
$$;

create or replace function increment_spots(event_id bigint, qty integer)
returns void language sql as $$
  update events set spots_left = least(total_spots, spots_left + qty) where id = event_id;
$$;

-- Klaviyo profiles cache (avoids repeated API calls)
create table if not exists klaviyo_cache (
  id           text primary key default 'profiles',
  data         jsonb not null default '[]',
  updated_at   timestamptz default now()
);

-- Saved card-on-file payment methods (Clover vaulted cards), keyed by the
-- customer's verified Google email. This powers future "one-tap" paid
-- bookings: after a customer's first paid checkout we vault their card with
-- Clover and store the reusable token here, so repeat purchases can charge
-- without re-collecting card details.
--
-- IMPORTANT: never store raw PANs/CVVs. Only Clover's reusable token plus
-- display-safe metadata (brand + last4 + expiry) lives here; the actual card
-- data stays inside Clover, keeping PCI scope on their side.
create table if not exists payment_methods (
  id                 bigserial primary key,
  email              text not null,          -- verified Google email (matches orders.email)
  clover_customer_id text,                   -- Clover customer the card is vaulted under
  clover_card_token  text not null,          -- reusable card-on-file token
  brand              text,                   -- display only, e.g. 'VISA', 'MASTERCARD'
  last4              text,                   -- display only
  exp_month          integer,               -- display only
  exp_year           integer,               -- display only
  is_default         boolean default false,
  created_at         timestamptz default now()
);

create index if not exists payment_methods_email_idx on payment_methods(email);
-- A given vaulted card should only ever appear once per customer.
create unique index if not exists payment_methods_email_token_idx
  on payment_methods(email, clover_card_token);

-- Link an order to the saved card it was charged with (nullable; only set for
-- one-tap paid bookings). Safe to re-run on existing databases.
alter table orders add column if not exists payment_method_id bigint
  references payment_methods(id) on delete set null;
