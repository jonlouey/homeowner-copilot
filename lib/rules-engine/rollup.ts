import type { ComputeApplianceStatusResult, RuleComputation } from "./types";

export type ApplianceRollupColor = "red" | "yellow" | "green" | "gray";

export type ApplianceRollup = {
  color: ApplianceRollupColor;
  // Amber ring overlay — only ever true alongside "yellow" or "green".
  // Visual modifier, not a fifth color (see docs/requirements/
  // phase-2c-appliance-cards.md, "Status model").
  hasRing: boolean;
  cardCopy: string;
};

/**
 * Aggregation layer on top of computeApplianceStatus()'s output — no
 * changes to compute.ts itself. Per-appliance rollup, worst status wins:
 * any overdue rule -> red; else any unscheduled rule -> yellow; else
 * green. An amber ring layers on top of yellow/green (never red) if any
 * rule is due_soon. dismissed/snoozed/lifespan_notice rules don't
 * participate at all — they can't turn a card yellow or red, and can't
 * trigger the ring either.
 */
export function computeApplianceRollup(result: ComputeApplianceStatusResult): ApplianceRollup {
  if (!result.hasContent) {
    return { color: "gray", hasRing: false, cardCopy: "No guidance yet" };
  }

  const relevant = result.rules.filter(isRollupRelevant);

  const hasOverdue = relevant.some((r) => r.status === "overdue");
  if (hasOverdue) {
    return { color: "red", hasRing: false, cardCopy: "Needs attention" };
  }

  const hasUnscheduled = relevant.some((r) => r.status === "unscheduled");
  const hasDueSoon = relevant.some((r) => r.status === "due_soon");
  const color: ApplianceRollupColor = hasUnscheduled ? "yellow" : "green";

  return { color, hasRing: hasDueSoon, cardCopy: cardCopyFor(color, hasDueSoon) };
}

function isRollupRelevant(computation: RuleComputation): boolean {
  // dismissed/snoozed: explicitly excluded, same as Phase 2b's
  // needs-attention list. lifespan_notice: informational nudge, not part
  // of the red/yellow/green urgency model at all (not named anywhere in
  // the Status model's priority order) — flagged for review.
  return (
    computation.status !== "dismissed" &&
    computation.status !== "snoozed" &&
    computation.status !== "lifespan_notice"
  );
}

function cardCopyFor(color: "yellow" | "green", hasRing: boolean): string {
  if (hasRing) return "Action needed soon";
  return color === "yellow" ? "Needs info" : "All good";
}

/**
 * Whether an appliance's rollup belongs in the dashboard's "Needs your
 * attention" list. Only red/yellow qualify — a green card has nothing to
 * act on, even carrying a due-soon ring (the ring still renders wherever
 * that card shows up; it just doesn't earn a spot in this section).
 */
export function isAttentionWorthy(rollup: ApplianceRollup): boolean {
  return rollup.color === "red" || rollup.color === "yellow";
}

export type CategoryRollup = {
  color: ApplianceRollupColor;
  // How many appliances in the category share `color` (the worst color
  // present) — drives "N of M need info" instead of a raw item count.
  count: number;
  total: number;
  metaText: string;
};

const CATEGORY_COLOR_RANK: Record<ApplianceRollupColor, number> = {
  red: 0,
  yellow: 1,
  green: 2,
  gray: 3,
};

/**
 * One level up from computeApplianceRollup: aggregates a category's
 * already-computed appliance rollups using the same worst-status-wins
 * priority (red > yellow > green > gray). Ring overlays don't factor in
 * here — only `color` does, same as the appliance rollup treats the ring
 * as a separate modifier, not a fifth color. See docs/designs/
 * design-system.md's "Category card" design debt note: this replaces a
 * raw item count with a status-driven "N of M" figure.
 */
export function computeCategoryRollup(applianceRollups: ApplianceRollup[]): CategoryRollup {
  const total = applianceRollups.length;

  if (total === 0) {
    return { color: "gray", count: 0, total: 0, metaText: "No appliances yet" };
  }

  let worstColor: ApplianceRollupColor = "gray";
  for (const rollup of applianceRollups) {
    if (CATEGORY_COLOR_RANK[rollup.color] < CATEGORY_COLOR_RANK[worstColor]) {
      worstColor = rollup.color;
    }
  }

  const count = applianceRollups.filter((r) => r.color === worstColor).length;

  return { color: worstColor, count, total, metaText: metaTextFor(worstColor, count, total) };
}

function metaTextFor(color: ApplianceRollupColor, count: number, total: number): string {
  switch (color) {
    case "red":
      return `${count} of ${total} need attention`;
    case "yellow":
      return `${count} of ${total} need info`;
    case "green":
      return "All good";
    case "gray":
      return "No guidance yet";
  }
}
