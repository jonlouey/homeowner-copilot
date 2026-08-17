import { TaskActions } from "@/app/dashboard/task-actions";
import { BORDER_LEFT_CLASSES, StatusPill, type StatusColor } from "@/app/dashboard/status-styles";
import type { ApplianceDetail } from "./data";

const STATUS_LABELS: Record<string, string> = {
  overdue: "Overdue",
  due_soon: "Due soon",
  unscheduled: "Not yet scheduled",
};

// Overdue is the only genuinely urgent state here — due_soon/unscheduled
// share the "yellow" tier, same as the dashboard rollup treats both as
// "needs attention soon" or "needs info," never as severe as overdue.
const STATUS_COLORS: Record<string, StatusColor> = {
  overdue: "red",
  due_soon: "yellow",
  unscheduled: "yellow",
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
      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-bold text-navy-deep">Actions</h2>
        <p className="text-sm text-ink-muted">Nothing needs attention right now.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[15px] font-bold text-navy-deep">Actions</h2>
      <ul className="flex flex-col divide-y divide-line-soft overflow-hidden rounded-card border border-line bg-white">
        {actionable.map((computation) => {
          const color = STATUS_COLORS[computation.status];
          return (
            <li
              key={computation.rule.id}
              className={`flex flex-col gap-2 border-l-[3px] px-[18px] py-4 ${BORDER_LEFT_CLASSES[color]}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-ink">
                    {computation.rule.taskName}
                  </span>
                  {computation.dueDate && (
                    <span className="text-xs text-ink-muted">Due {computation.dueDate}</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {computation.criticality === "safety" && (
                    <span className="rounded-full border border-danger-line bg-danger-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.04em] text-danger">
                      Safety
                    </span>
                  )}
                  <StatusPill color={color}>{STATUS_LABELS[computation.status]}</StatusPill>
                </div>
              </div>
              <TaskActions
                applianceInstanceId={detail.instanceId}
                ruleId={computation.rule.id}
                applianceDisplayName={detail.applianceDisplayName}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
