import { sql } from "@/lib/db";
import { computeApplianceStatus } from "@/lib/rules-engine/compute";
import { computeApplianceRollup, type ApplianceRollup } from "@/lib/rules-engine/rollup";
import type {
  ApplianceInstanceInput,
  Criticality,
  MaintenanceRuleInput,
  RuleType,
  TaskEventInput,
  TaskEventType,
} from "@/lib/rules-engine/types";
import { CURRENT_USER_ID } from "@/lib/user";

export type ApplianceCard = {
  applianceInstanceId: string;
  applianceTypeId: string;
  applianceDisplayName: string;
  rollup: ApplianceRollup;
};

export type DashboardData =
  | { house: null }
  | { house: { id: string; address: string }; cards: ApplianceCard[] };

const ROLLUP_COLOR_RANK: Record<ApplianceRollup["color"], number> = {
  red: 0,
  yellow: 1,
  green: 2,
  gray: 3,
};

/**
 * Thin wrapper (per the Phase 2a "Function contract" note) around
 * computeApplianceStatus + computeApplianceRollup: fetches the current
 * house's active appliance instances plus their maintenance_rules and
 * task_events, runs the pure compute + rollup functions per instance, and
 * returns one card per instance for the Phase 2c grid.
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

  const cards: ApplianceCard[] = instances.map((row) => {
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
    const rollup = computeApplianceRollup(result);

    return {
      applianceInstanceId: row.id,
      applianceTypeId: row.appliance_type_id,
      applianceDisplayName,
      rollup,
    };
  });

  // Not specified by the doc for the grid — worst-status-first (matching
  // the urgency-first ordering established in Phase 2b), alphabetical
  // within a color as a tiebreaker.
  cards.sort(compareCards);

  return { house, cards };
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

function compareCards(a: ApplianceCard, b: ApplianceCard): number {
  const rankA = ROLLUP_COLOR_RANK[a.rollup.color];
  const rankB = ROLLUP_COLOR_RANK[b.rollup.color];
  if (rankA !== rankB) return rankA - rankB;
  return a.applianceDisplayName.localeCompare(b.applianceDisplayName);
}
