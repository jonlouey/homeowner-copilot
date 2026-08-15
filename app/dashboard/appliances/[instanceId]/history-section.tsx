import { updateApplianceAge } from "@/app/dashboard/actions";
import type { ApplianceDetail } from "./data";

const AGE_OPTIONS: { value: string; label: string }[] = [
  { value: "0-2", label: "0-2 years" },
  { value: "3-7", label: "3-7 years" },
  { value: "8-15", label: "8-15 years" },
  { value: "15+", label: "15+ years" },
];

export function HistorySection({ detail }: { detail: ApplianceDetail }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-mono text-xs uppercase tracking-wide text-muted">History</h2>

      {detail.ageRange === "unknown" ? (
        <form
          action={updateApplianceAge.bind(null, detail.instanceId)}
          className="flex flex-col gap-3 border border-hairline px-4 py-3"
        >
          <p className="text-sm font-medium text-ink">
            How old is this {detail.applianceDisplayName.toLowerCase()}?
          </p>
          <div className="flex flex-wrap gap-3">
            {AGE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-1 text-sm text-ink">
                <input type="radio" name="ageRange" value={option.value} />
                {option.label}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="installDate" className="text-sm text-muted">
              Or an exact install date:
            </label>
            <input
              id="installDate"
              name="installDate"
              type="date"
              className="border border-hairline px-2 py-1 font-mono text-sm text-ink"
            />
          </div>
          <button
            type="submit"
            className="self-start border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-hairline"
          >
            Save
          </button>
        </form>
      ) : (
        <p className="font-mono text-xs text-muted">
          Age: {detail.ageRange}
          {detail.installDate ? ` (installed ${detail.installDate})` : ""}
        </p>
      )}

      {detail.completedHistory.length === 0 ? (
        <p className="text-sm text-muted">No completed actions yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-hairline border border-hairline">
          {detail.completedHistory.map((item) => (
            <li key={item.id} className="flex items-baseline gap-3 px-4 py-2 text-sm">
              <span className="font-mono text-xs text-muted">{item.eventDate}</span>
              <span className="text-ink">{item.taskName}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
