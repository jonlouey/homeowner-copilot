import { sql } from "@/lib/db";
import { computeApplianceStatus } from "@/lib/rules-engine/compute";
import type {
  ApplianceInstanceInput,
  Criticality,
  MaintenanceRuleInput,
  RuleComputation,
  RuleType,
  TaskEventInput,
  TaskEventType,
} from "@/lib/rules-engine/types";
import { CURRENT_USER_ID } from "@/lib/user";

export type NeedsAttentionItem = {
  computation: RuleComputation;
  applianceInstanceId: string;
  applianceDisplayName: string;
};

export type NoContentApplianceType = {
  applianceTypeId: string;
  applianceDisplayName: string;
};

export type DashboardData =
  | { house: null }
  | {
      house: { id: string; address: string };
      needsAttention: NeedsAttentionItem[];
      nextUpcoming: NeedsAttentionItem | null;
      noContentTypes: NoContentApplianceType[];
    };

const NEEDS_ATTENTION_STATUS_RANK: Record<string, number> = {
  overdue: 0,
  due_soon: 1,
  unscheduled: 2,
};

/**
 * Thin wrapper (per the Phase 2a "Function contract" note) around
 * computeApplianceStatus: fetches the current house's active appliance
 * instances plus their maintenance_rules and task_events, runs the pure
 * compute function per instance, and shapes the result for the dashboard
 * — the needs-attention list (sorted per "Dashboard sections & sorting" in
 * docs/requirements/phase-2b-dashboard.md), the next on_track item for the
 * caught-up state, and the no-content appliance types.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const houses = await sql`
    select id, address from houses
    where user_id = ${CURRENT_USER_ID}
    order by created_at desc
    limit 1
  `;

  if (houses.length === 0) {
    return { house: null };
  }

  const house = houses[0] as { id: string; address: string };

  const [instanceRows, ruleRows, applianceTypeRows] = await Promise.all([
    sql`
      select id, appliance_type_id, age_range, to_char(install_date, 'YYYY-MM-DD') as install_date
      from appliance_instances
      where house_id = ${house.id} and status = 'active'
    `,
    sql`
      select id, appliance_type_id, task_name, description, frequency_months,
             rule_type, criticality, min_age_range
      from maintenance_rules
    `,
    sql`select id, display_name from appliance_types`,
  ]);

  const instances = instanceRows as {
    id: string;
    appliance_type_id: string;
    age_range: string;
    install_date: string | null;
  }[];

  const instanceIds = instances.map((row) => row.id);
  const eventRows =
    instanceIds.length > 0
      ? await sql`
          select id, appliance_instance_id, rule_id, event_type, event_date,
                 to_char(snooze_until, 'YYYY-MM-DD') as snooze_until
          from task_events
          where appliance_instance_id = any(${instanceIds})
        `
      : [];

  const displayNameById = new Map(
    (applianceTypeRows as { id: string; display_name: string }[]).map((row) => [
      row.id,
      row.display_name,
    ])
  );

  const rulesByApplianceType = groupRulesByApplianceType(
    ruleRows as {
      id: string;
      appliance_type_id: string;
      task_name: string;
      description: string;
      frequency_months: number | null;
      rule_type: RuleType;
      criticality: Criticality;
      min_age_range: string | null;
    }[]
  );

  const eventsByInstance = groupEventsByInstance(
    eventRows as {
      id: string;
      appliance_instance_id: string;
      rule_id: string;
      event_type: TaskEventType;
      event_date: string;
      snooze_until: string | null;
    }[]
  );

  const needsAttention: NeedsAttentionItem[] = [];
  const onTrackItems: NeedsAttentionItem[] = [];
  const noContentTypeIds = new Set<string>();

  for (const row of instances) {
    const applianceDisplayName =
      displayNameById.get(row.appliance_type_id) ?? row.appliance_type_id;

    const instanceInput: ApplianceInstanceInput = {
      id: row.id,
      applianceTypeId: row.appliance_type_id,
      ageRange: row.age_range as ApplianceInstanceInput["ageRange"],
      installDate: row.install_date,
    };

    const rules = rulesByApplianceType.get(row.appliance_type_id) ?? [];
    const events = eventsByInstance.get(row.id) ?? [];

    const result = computeApplianceStatus(instanceInput, events, rules);

    if (!result.hasContent) {
      noContentTypeIds.add(row.appliance_type_id);
      continue;
    }

    for (const computation of result.rules) {
      const item: NeedsAttentionItem = {
        computation,
        applianceInstanceId: row.id,
        applianceDisplayName,
      };

      if (computation.status in NEEDS_ATTENTION_STATUS_RANK) {
        needsAttention.push(item);
      } else if (computation.status === "on_track") {
        onTrackItems.push(item);
      }
      // dismissed, snoozed, lifespan_notice: not surfaced anywhere in this
      // phase's UI (lifespan display and task actions come later).
    }
  }

  needsAttention.sort(compareNeedsAttention);
  onTrackItems.sort((a, b) => (a.computation.dueDate ?? "").localeCompare(b.computation.dueDate ?? ""));

  const noContentTypes: NoContentApplianceType[] = Array.from(noContentTypeIds).map((id) => ({
    applianceTypeId: id,
    applianceDisplayName: displayNameById.get(id) ?? id,
  }));

  return {
    house,
    needsAttention,
    nextUpcoming: onTrackItems[0] ?? null,
    noContentTypes,
  };
}

function groupRulesByApplianceType(
  rows: {
    id: string;
    appliance_type_id: string;
    task_name: string;
    description: string;
    frequency_months: number | null;
    rule_type: RuleType;
    criticality: Criticality;
    min_age_range: string | null;
  }[]
): Map<string, MaintenanceRuleInput[]> {
  const map = new Map<string, MaintenanceRuleInput[]>();

  for (const row of rows) {
    const rule: MaintenanceRuleInput = {
      id: row.id,
      applianceTypeId: row.appliance_type_id,
      taskName: row.task_name,
      description: row.description,
      ruleType: row.rule_type,
      criticality: row.criticality,
      frequencyMonths: row.frequency_months,
      minAgeRange: row.min_age_range as MaintenanceRuleInput["minAgeRange"],
    };
    const list = map.get(row.appliance_type_id) ?? [];
    list.push(rule);
    map.set(row.appliance_type_id, list);
  }

  return map;
}

function groupEventsByInstance(
  rows: {
    id: string;
    appliance_instance_id: string;
    rule_id: string;
    event_type: TaskEventType;
    event_date: string;
    snooze_until: string | null;
  }[]
): Map<string, TaskEventInput[]> {
  const map = new Map<string, TaskEventInput[]>();

  for (const row of rows) {
    const event: TaskEventInput = {
      id: row.id,
      ruleId: row.rule_id,
      eventType: row.event_type,
      eventDate: row.event_date,
      snoozeUntil: row.snooze_until,
    };
    const list = map.get(row.appliance_instance_id) ?? [];
    list.push(event);
    map.set(row.appliance_instance_id, list);
  }

  return map;
}

function compareNeedsAttention(a: NeedsAttentionItem, b: NeedsAttentionItem): number {
  const rankA = NEEDS_ATTENTION_STATUS_RANK[a.computation.status];
  const rankB = NEEDS_ATTENTION_STATUS_RANK[b.computation.status];
  if (rankA !== rankB) return rankA - rankB;

  if (a.computation.status === "unscheduled") {
    if (a.computation.criticality !== b.computation.criticality) {
      return a.computation.criticality === "safety" ? -1 : 1;
    }
    return a.computation.rule.taskName.localeCompare(b.computation.rule.taskName);
  }

  // overdue / due_soon: earlier due date first, doc doesn't specify a
  // secondary sort but this keeps the most urgent items on top within
  // each group, consistent with the Goal section's "sorted by urgency."
  const dueA = a.computation.dueDate ?? "";
  const dueB = b.computation.dueDate ?? "";
  if (dueA !== dueB) return dueA.localeCompare(dueB);
  return a.computation.rule.taskName.localeCompare(b.computation.rule.taskName);
}
