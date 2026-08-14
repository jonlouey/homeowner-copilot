import type {
  ApplianceInstanceInput,
  ComputeApplianceStatusResult,
  KnownAgeRange,
  MaintenanceRuleInput,
  RuleComputation,
  TaskEventInput,
} from "./types";

const AGE_RANGE_RANK: Record<KnownAgeRange, number> = {
  "0-2": 0,
  "3-7": 1,
  "8-15": 2,
  "15+": 3,
};

const DEFAULT_URGENCY_WINDOW_DAYS = 30;

export type ComputeApplianceStatusOptions = {
  now?: Date;
  urgencyWindowDays?: number;
};

/**
 * Pure function: given one appliance instance, its task_events history, and
 * the maintenance_rules for its appliance type, returns a status per
 * applicable rule. No database access — see docs/requirements/
 * phase-2a-rules-engine-design.md ("Function contract").
 *
 * `rules` must already be scoped to `instance.applianceTypeId` by the
 * caller (a thin wrapper does that DB lookup); an empty `rules` array is
 * read as "no content exists for this appliance type" and short-circuits
 * to `{ hasContent: false }`, distinct from an instance whose rules just
 * don't happen to produce any entries (e.g. a type with only lifespan
 * rules on an instance with unknown age).
 */
export function computeApplianceStatus(
  instance: ApplianceInstanceInput,
  events: TaskEventInput[],
  rules: MaintenanceRuleInput[],
  options: ComputeApplianceStatusOptions = {}
): ComputeApplianceStatusResult {
  if (rules.length === 0) {
    return { hasContent: false, rules: [] };
  }

  const now = options.now ?? new Date();
  const urgencyWindowDays = options.urgencyWindowDays ?? DEFAULT_URGENCY_WINDOW_DAYS;

  const computations: RuleComputation[] = [];

  for (const rule of rules) {
    if (rule.ruleType === "lifespan") {
      const computation = computeLifespanRule(rule, instance);
      if (computation) computations.push(computation);
      continue;
    }

    computations.push(computeRecurringRule(rule, events, now, urgencyWindowDays));
  }

  return { hasContent: true, rules: computations };
}

function computeRecurringRule(
  rule: MaintenanceRuleInput,
  events: TaskEventInput[],
  now: Date,
  urgencyWindowDays: number
): RuleComputation {
  const lastCompleted = mostRecentCompletedEvent(rule.id, events);

  if (!lastCompleted) {
    return { rule, status: "unscheduled", dueDate: null, criticality: rule.criticality };
  }

  // frequency_months is guaranteed non-null for recurring rules by the
  // maintenance_rules_type_columns_check DB constraint.
  const dueDate = addMonths(new Date(lastCompleted.eventDate), rule.frequencyMonths!);
  const dueDateIso = toIsoDate(dueDate);

  if (dueDate.getTime() <= now.getTime()) {
    return { rule, status: "overdue", dueDate: dueDateIso, criticality: rule.criticality };
  }

  const urgencyThreshold = new Date(now.getTime() + urgencyWindowDays * 24 * 60 * 60 * 1000);
  if (dueDate.getTime() <= urgencyThreshold.getTime()) {
    return { rule, status: "due_soon", dueDate: dueDateIso, criticality: rule.criticality };
  }

  return { rule, status: "on_track", dueDate: dueDateIso, criticality: rule.criticality };
}

function computeLifespanRule(
  rule: MaintenanceRuleInput,
  instance: ApplianceInstanceInput
): RuleComputation | null {
  if (instance.ageRange === "unknown") return null;
  if (!rule.minAgeRange) return null;

  const instanceRank = AGE_RANGE_RANK[instance.ageRange];
  const thresholdRank = AGE_RANGE_RANK[rule.minAgeRange];

  if (instanceRank < thresholdRank) return null;

  return { rule, status: "lifespan_notice", dueDate: null, criticality: rule.criticality };
}

function mostRecentCompletedEvent(
  ruleId: string,
  events: TaskEventInput[]
): TaskEventInput | null {
  let latest: TaskEventInput | null = null;

  for (const event of events) {
    if (event.ruleId !== ruleId || event.eventType !== "completed") continue;
    if (!latest || new Date(event.eventDate) > new Date(latest.eventDate)) {
      latest = event;
    }
  }

  return latest;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
