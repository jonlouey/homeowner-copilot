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
