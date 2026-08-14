import type { NeedsAttentionItem } from "./data";

export function CaughtUpState({ nextUpcoming }: { nextUpcoming: NeedsAttentionItem | null }) {
  return (
    <section className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="text-2xl" aria-hidden="true">
        ✓
      </span>
      <p className="text-sm font-medium">Nothing needs attention right now.</p>
      {nextUpcoming && (
        <p className="text-xs text-gray-400">
          Next up: {nextUpcoming.applianceDisplayName} — {nextUpcoming.computation.rule.taskName}
          {nextUpcoming.computation.dueDate ? ` (due ${nextUpcoming.computation.dueDate})` : ""}
        </p>
      )}
    </section>
  );
}
