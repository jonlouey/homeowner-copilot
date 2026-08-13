-- Phase 0 core schema (v1)
-- See docs/requirements/phase-0-foundation.md#data-model

create table if not exists houses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  address     text not null,
  zip         text not null,
  region      text not null,
  house_type  text not null check (house_type in ('single_family', 'condo', 'townhouse', 'other')),
  created_at  timestamptz not null default now()
);

create table if not exists appliance_types (
  id            text primary key,
  category      text not null check (category in ('systems', 'exterior', 'appliances', 'safety')),
  display_name  text not null
);

create table if not exists appliance_instances (
  id                 uuid primary key default gen_random_uuid(),
  house_id           uuid not null references houses (id),
  appliance_type_id  text not null references appliance_types (id),
  age_range          text not null check (age_range in ('0-2', '3-7', '8-15', '15+', 'unknown')),
  install_date       date,
  status             text not null check (status in ('active', 'dismissed')),
  created_at         timestamptz not null default now()
);

create index if not exists appliance_instances_house_id_idx on appliance_instances (house_id);
create index if not exists appliance_instances_appliance_type_id_idx on appliance_instances (appliance_type_id);

create table if not exists maintenance_rules (
  id                 uuid primary key default gen_random_uuid(),
  appliance_type_id  text not null references appliance_types (id),
  task_name          text not null,
  description        text not null,
  frequency_months   int not null,
  season_months      int[],
  region_condition   text
);

create index if not exists maintenance_rules_appliance_type_id_idx on maintenance_rules (appliance_type_id);

create table if not exists task_events (
  id                     uuid primary key default gen_random_uuid(),
  appliance_instance_id  uuid not null references appliance_instances (id),
  rule_id                uuid not null references maintenance_rules (id),
  event_type             text not null check (event_type in ('completed', 'snoozed', 'dismissed')),
  event_date             timestamptz not null,
  snooze_until           date
);

create index if not exists task_events_appliance_instance_id_idx on task_events (appliance_instance_id);
create index if not exists task_events_rule_id_idx on task_events (rule_id);
