-- Phase 2a: rule_type and criticality on maintenance_rules.
--
-- Also makes frequency_months nullable and adds min_age_range: lifespan
-- rules (see docs/requirements/phase-2a-rules-engine-design.md) fire off a
-- minimum age_range rather than an elapsed-time frequency, so the two rule
-- types are mutually exclusive in which of these columns they populate —
-- enforced below rather than left to convention.
alter table maintenance_rules
  alter column frequency_months drop not null,
  add column rule_type text not null check (rule_type in ('recurring', 'lifespan')),
  add column criticality text not null check (criticality in ('safety', 'routine')),
  add column min_age_range text check (min_age_range in ('0-2', '3-7', '8-15', '15+')),
  add constraint maintenance_rules_type_columns_check check (
    (rule_type = 'recurring' and frequency_months is not null and min_age_range is null)
    or
    (rule_type = 'lifespan' and frequency_months is null and min_age_range is not null)
  );
