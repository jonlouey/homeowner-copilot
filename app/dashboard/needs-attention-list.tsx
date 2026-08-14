import type { NeedsAttentionItem } from "./data";
import { TaskActions } from "./task-actions";

const STATUS_LABELS: Record<string, string> = {
  overdue: "Overdue",
  due_soon: "Due soon",
  unscheduled: "Not yet scheduled",
};

export function NeedsAttentionList({ items }: { items: NeedsAttentionItem[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-gray-500">Needs attention</h2>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={`${item.applianceInstanceId}-${item.computation.rule.id}`}
            className="flex flex-col gap-2 border rounded px-3 py-2"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {item.applianceDisplayName} — {item.computation.rule.taskName}
                </span>
                {item.computation.dueDate && (
                  <span className="text-xs text-gray-500">Due {item.computation.dueDate}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.computation.criticality === "safety" && (
                  <span className="text-xs font-medium text-red-600">Safety</span>
                )}
                <span className="text-xs text-gray-500">
                  {STATUS_LABELS[item.computation.status]}
                </span>
              </div>
            </div>
            <TaskActions
              applianceInstanceId={item.applianceInstanceId}
              ruleId={item.computation.rule.id}
              applianceDisplayName={item.applianceDisplayName}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
