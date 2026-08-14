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

const AGE_RANGES = ["0-2", "3-7", "8-15", "15+"] as const;

// The "add install date / age" progressive-profiling prompt, deferred
// since onboarding (see docs/requirements/phase-2c-appliance-cards.md,
// "History"). Accepts either a coarse age_range pick or a precise
// install_date — the latter also derives an age_range bucket, since
// compute() only reads age_range today (install_date is reserved for a
// more precise future calculation).
export async function updateApplianceAge(applianceInstanceId: string, formData: FormData) {
  const installDateInput = String(formData.get("installDate") ?? "").trim();
  const ageRangeInput = String(formData.get("ageRange") ?? "").trim();

  if (installDateInput) {
    const ageRange = deriveAgeRangeFromInstallDate(installDateInput);
    await sql`
      update appliance_instances
      set age_range = ${ageRange}, install_date = ${installDateInput}::date
      where id = ${applianceInstanceId}
    `;
  } else if ((AGE_RANGES as readonly string[]).includes(ageRangeInput)) {
    await sql`
      update appliance_instances
      set age_range = ${ageRangeInput}
      where id = ${applianceInstanceId}
    `;
  } else {
    return;
  }

  refresh();
}

function deriveAgeRangeFromInstallDate(installDateIso: string): (typeof AGE_RANGES)[number] {
  const installed = new Date(installDateIso);
  const years = (Date.now() - installed.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 3) return "0-2";
  if (years < 8) return "3-7";
  if (years < 15) return "8-15";
  return "15+";
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
