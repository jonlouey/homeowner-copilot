export type AgeRange = "0-2" | "3-7" | "8-15" | "15+" | "unknown";
export type KnownAgeRange = Exclude<AgeRange, "unknown">;

export type Criticality = "safety" | "routine";
export type RuleType = "recurring" | "lifespan";
export type TaskEventType = "completed" | "snoozed" | "dismissed";

export type ApplianceInstanceInput = {
  id: string;
  applianceTypeId: string;
  ageRange: AgeRange;
  // Reserved for a future, more precise lifespan calculation. Current rule
  // content (see the Phase 2a Appendix) is bucketed by age_range only, so
  // this isn't read by the compute function yet.
  installDate: string | null;
};

export type TaskEventInput = {
  id: string;
  ruleId: string;
  eventType: TaskEventType;
  eventDate: string;
};

export type MaintenanceRuleInput = {
  id: string;
  applianceTypeId: string;
  taskName: string;
  description: string;
  ruleType: RuleType;
  criticality: Criticality;
  // Set for recurring rules, null for lifespan rules.
  frequencyMonths: number | null;
  // Set for lifespan rules, null for recurring rules. The instance's
  // age_range must be at or above this rank for the rule to fire.
  minAgeRange: KnownAgeRange | null;
};

export type RecurringRuleStatus = "unscheduled" | "on_track" | "due_soon" | "overdue";
export type RuleStatus = RecurringRuleStatus | "lifespan_notice";

export type RuleComputation = {
  rule: MaintenanceRuleInput;
  status: RuleStatus;
  dueDate: string | null;
  criticality: Criticality;
};

export type ComputeApplianceStatusResult =
  | { hasContent: true; rules: RuleComputation[] }
  | { hasContent: false; rules: [] };
