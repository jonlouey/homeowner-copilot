import type { RuleComputation } from "@/lib/rules-engine/types";
import { RULE_HEADLINES } from "./rule-headlines";

// The current-status templated sentence appended after the static Summary
// paragraph (see docs/requirements/phase-2c-appliance-cards.md, "Summary
// content": e.g. "Right now, your filter is overdue for a change..."),
// kept isolated from the static content rather than blended into it.
// Picks the single worst-status relevant rule, same priority order as the
// rollup, ignoring dismissed/snoozed/lifespan_notice.
export function pickHeadlineComputation(rules: RuleComputation[]): RuleComputation | null {
  const relevant = rules.filter(
    (r) => r.status !== "dismissed" && r.status !== "snoozed" && r.status !== "lifespan_notice"
  );

  return (
    relevant.find((r) => r.status === "overdue") ??
    relevant.find((r) => r.status === "unscheduled") ??
    relevant.find((r) => r.status === "due_soon") ??
    null
  );
}

export function headlineSentence(computation: RuleComputation | null): string {
  if (!computation) {
    return "Right now, everything here is on track.";
  }

  const phrases = RULE_HEADLINES[computation.rule.applianceTypeId]?.[computation.rule.taskName];

  if (phrases) {
    switch (computation.status) {
      case "overdue":
        return phrases.overdue;
      case "due_soon":
        return phrases.dueSoon;
      case "unscheduled":
        return phrases.unscheduled;
    }
  }

  // Fallback for rule content not yet hand-written (future appliance
  // types beyond the current 5) — generic but still functional.
  switch (computation.status) {
    case "overdue":
      return `Right now, "${computation.rule.taskName}" is overdue${
        computation.dueDate ? ` (was due ${computation.dueDate})` : ""
      }.`;
    case "due_soon":
      return `Right now, "${computation.rule.taskName}" is coming up soon${
        computation.dueDate ? ` (due ${computation.dueDate})` : ""
      }.`;
    case "unscheduled":
      return `Right now, we don't have a record of "${computation.rule.taskName}" being done yet.`;
    default:
      return "Right now, everything here is on track.";
  }
}
