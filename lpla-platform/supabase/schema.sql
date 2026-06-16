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
  created_at   timestamptz default now()
);

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

-- Helper RPC functions for atomic spot management
create or replace function decrement_spots(event_id bigint, qty integer)
returns void language sql as $$
  update events set spots_left = greatest(0, spots_left - qty) where id = event_id;
$$;

create or replace function increment_spots(event_id bigint, qty integer)
returns void language sql as $$
  update events set spots_left = least(total_spots, spots_left + qty) where id = event_id;
$$;
