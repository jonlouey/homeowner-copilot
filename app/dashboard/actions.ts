"use server";

import { refresh } from "next/cache";
import { sql } from "@/lib/db";

export type SnoozeDuration = "1_week" | "1_month" | "next_season";

export async function markTaskDone(applianceInstanceId: string, ruleId: string) {
  await sql`
    insert into task_events (appliance_instance_id, rule_id, event_type, event_date)
    values (${applianceInstanceId}, ${ruleId}, 'completed', now())
  `;
  refresh();
}

export async function snoozeTask(
  applianceInstanceId: string,
  ruleId: string,
  duration: SnoozeDuration
) {
  const snoozeUntil = computeSnoozeUntil(duration);
  await sql`
    insert into task_events (appliance_instance_id, rule_id, event_type, event_date, snooze_until)
    values (${applianceInstanceId}, ${ruleId}, 'snoozed', now(), ${snoozeUntil}::date)
  `;
  refresh();
}

export async function dismissTask(applianceInstanceId: string, ruleId: string) {
  await sql`
    insert into task_events (appliance_instance_id, rule_id, event_type, event_date)
    values (${applianceInstanceId}, ${ruleId}, 'dismissed', now())
  `;
  refresh();
}

function computeSnoozeUntil(duration: SnoozeDuration): string {
  const result = new Date();
  if (duration === "1_week") {
    result.setUTCDate(result.getUTCDate() + 7);
  } else if (duration === "1_month") {
    result.setUTCMonth(result.getUTCMonth() + 1);
  } else {
    // "Until next season" resolves to a fixed +3 months for now, per the
    // Phase 2b doc — real seasonal-date logic is Phase 3's job.
    result.setUTCMonth(result.getUTCMonth() + 3);
  }
  return result.toISOString().slice(0, 10);
}
