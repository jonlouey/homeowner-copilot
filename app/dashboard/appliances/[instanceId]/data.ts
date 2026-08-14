import { sql } from "@/lib/db";
import { computeApplianceStatus } from "@/lib/rules-engine/compute";
import { computeApplianceRollup, type ApplianceRollup } from "@/lib/rules-engine/rollup";
import type {
  ApplianceInstanceInput,
  ComputeApplianceStatusResult,
  Criticality,
  MaintenanceRuleInput,
  RuleType,
  TaskEventInput,
  TaskEventType,
} from "@/lib/rules-engine/types";

export type CompletedHistoryItem = {
  id: string;
  taskName: string;
  eventDate: string;
};

export type ApplianceDetail = {
  instanceId: string;
  applianceTypeId: string;
  applianceDisplayName: string;
  ageRange: string;
  installDate: string | null;
  result: ComputeApplianceStatusResult;
  rollup: ApplianceRollup;
  completedHistory: CompletedHistoryItem[];
};

export async function getApplianceDetail(instanceId: string): Promise<ApplianceDetail | null> {
  const instanceRows = await sql`
    select id, appliance_type_id, age_range, to_char(install_date, 'YYYY-MM-DD') as install_date
    from appliance_instances
    where id = ${instanceId} and status = 'active'
  `;

  if (instanceRows.length === 0) {
    return null;
  }

  const row = instanceRows[0] as {
    id: string;
    appliance_type_id: string;
    age_range: string;
    install_date: string | null;
  };

  const [ruleRows, typeRows, eventRows] = await Promise.all([
    sql`
      select id, appliance_type_id, task_name, description, frequency_months,
             rule_type, criticality, min_age_range
      from maintenance_rules
      where appliance_type_id = ${row.appliance_type_id}
    `,
    sql`select display_name from appliance_types where id = ${row.appliance_type_id}`,
    sql`
      select id, rule_id, event_type, event_date,
             to_char(snooze_until, 'YYYY-MM-DD') as snooze_until
      from task_events
      where appliance_instance_id = ${instanceId}
      order by event_date desc
    `,
  ]);

  const applianceDisplayName =
    (typeRows[0] as { display_name: string } | undefined)?.display_name ?? row.appliance_type_id;

  const rules: MaintenanceRuleInput[] = (
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
  ).map((r) => ({
    id: r.id,
    applianceTypeId: r.appliance_type_id,
    taskName: r.task_name,
    description: r.description,
    ruleType: r.rule_type,
    criticality: r.criticality,
    frequencyMonths: r.frequency_months,
    minAgeRange: r.min_age_range as MaintenanceRuleInput["minAgeRange"],
  }));

  const eventRowsTyped = eventRows as {
    id: string;
    rule_id: string;
    event_type: TaskEventType;
    event_date: string;
    snooze_until: string | null;
  }[];

  const events: TaskEventInput[] = eventRowsTyped.map((e) => ({
    id: e.id,
    ruleId: e.rule_id,
    eventType: e.event_type,
    eventDate: e.event_date,
    snoozeUntil: e.snooze_until,
  }));

  const instanceInput: ApplianceInstanceInput = {
    id: row.id,
    applianceTypeId: row.appliance_type_id,
    ageRange: row.age_range as ApplianceInstanceInput["ageRange"],
    installDate: row.install_date,
  };

  const result = computeApplianceStatus(instanceInput, events, rules);
  const rollup = computeApplianceRollup(result);

  const ruleNameById = new Map(rules.map((r) => [r.id, r.taskName]));
  const completedHistory: CompletedHistoryItem[] = eventRowsTyped
    .filter((e) => e.event_type === "completed")
    .map((e) => ({
      id: e.id,
      taskName: ruleNameById.get(e.rule_id) ?? "Unknown task",
      eventDate: new Date(e.event_date).toISOString().slice(0, 10),
    }));

  return {
    instanceId: row.id,
    applianceTypeId: row.appliance_type_id,
    applianceDisplayName,
    ageRange: row.age_range,
    installDate: row.install_date,
    result,
    rollup,
    completedHistory,
  };
}
