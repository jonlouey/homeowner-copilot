import { TaskActions } from "@/app/dashboard/task-actions";
import type { ApplianceDetail } from "./data";

const STATUS_LABELS: Record<string, string> = {
  overdue: "Overdue",
  due_soon: "Due soon",
  unscheduled: "Not yet scheduled",
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
        <h2 className="text-sm font-medium text-gray-500">Actions</h2>
        <p className="text-sm text-gray-500">Nothing needs attention right now.</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-gray-500">Actions</h2>
      <ul className="flex flex-col gap-3">
        {actionable.map((computation) => (
          <li
            key={computation.rule.id}
            className="flex flex-col gap-2 border rounded px-3 py-2"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{computation.rule.taskName}</span>
                {computation.dueDate && (
                  <span className="text-xs text-gray-500">Due {computation.dueDate}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {computation.criticality === "safety" && (
                  <span className="text-xs font-medium text-red-600">Safety</span>
                )}
                <span className="text-xs text-gray-500">
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
