import { TaskActions } from "@/app/dashboard/task-actions";
import type { ApplianceDetail } from "./data";

const STATUS_LABELS: Record<string, string> = {
  overdue: "Overdue",
  due_soon: "Due soon",
  unscheduled: "Not yet scheduled",
};

// Same left-edge accent convention as the dashboard card grid — overdue is
// the only genuinely urgent state here, due_soon/unscheduled share `warn`
// (the rollup treats both as "needs attention soon" or "needs info," never
// as severe as overdue).
const BORDER_CLASSES: Record<string, string> = {
  overdue: "border-l-danger",
  due_soon: "border-l-warn",
  unscheduled: "border-l-warn",
};

const TEXT_CLASSES: Record<string, string> = {
  overdue: "text-danger",
  due_soon: "text-warn",
  unscheduled: "text-warn",
};

const ACTIONABLE_STATUSES = new Set(["overdue", "due_soon", "unscheduled"]);

export function ActionsSection({ detail }: { detail: ApplianceDetail }) {
  // No-content appliance types get no Actions section at all — there's
  // nothing to show (see the Phase 2c doc's acceptance criteria).
  if (!detail.result.hasContent) {
    return null;
  }

  const actionable = detail.result.rules.filter((r) => ACTIONABLE_STATUSES.has(r.status));

  if (actionable.length === 0) {
    return (
      <section className="flex flex-col gap-2">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Actions</h2>
        <p className="text-sm text-muted">Nothing needs attention right now.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Actions</h2>
      <ul className="flex flex-col divide-y divide-hairline border border-hairline">
        {actionable.map((computation) => (
          <li
            key={computation.rule.id}
            className={`flex flex-col gap-2 border-l-[3px] px-4 py-3 ${
              BORDER_CLASSES[computation.status]
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-sm font-medium text-ink">
                  {computation.rule.taskName}
                </span>
                {computation.dueDate && (
                  <span className="font-mono text-xs text-muted">
                    Due {computation.dueDate}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {computation.criticality === "safety" && (
                  <span className="font-mono text-xs uppercase tracking-wide text-danger">
                    Safety
                  </span>
                )}
                <span
                  className={`font-mono text-xs uppercase tracking-wide ${
                    TEXT_CLASSES[computation.status]
                  }`}
                >
                  {STATUS_LABELS[computation.status]}
                </span>
              </div>
            </div>
            <TaskActions
              applianceInstanceId={detail.instanceId}
              ruleId={computation.rule.id}
              applianceDisplayName={detail.applianceDisplayName}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
