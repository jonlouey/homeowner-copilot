import { dismissTask, markTaskDone, snoozeTask } from "./actions";

const buttonClass = "text-xs border border-hairline px-2 py-1 text-ink hover:bg-hairline";

export function TaskActions({
  applianceInstanceId,
  ruleId,
  applianceDisplayName,
}: {
  applianceInstanceId: string;
  ruleId: string;
  applianceDisplayName: string;
}) {
  return (
    <form className="flex flex-wrap items-center gap-2">
      <button
        type="submit"
        formAction={markTaskDone.bind(null, applianceInstanceId, ruleId)}
        className={buttonClass}
      >
        Mark done
      </button>
      <button
        type="submit"
        formAction={snoozeTask.bind(null, applianceInstanceId, ruleId, "1_week")}
        className={buttonClass}
      >
        Snooze 1 week
      </button>
      <button
        type="submit"
        formAction={snoozeTask.bind(null, applianceInstanceId, ruleId, "1_month")}
        className={buttonClass}
      >
        Snooze 1 month
      </button>
      <button
        type="submit"
        formAction={snoozeTask.bind(null, applianceInstanceId, ruleId, "next_season")}
        className={buttonClass}
      >
        Snooze until next season
      </button>
      <button
        type="submit"
        formAction={dismissTask.bind(null, applianceInstanceId, ruleId)}
        className={buttonClass}
      >
        Doesn&apos;t apply to my {applianceDisplayName}
      </button>
    </form>
  );
}
