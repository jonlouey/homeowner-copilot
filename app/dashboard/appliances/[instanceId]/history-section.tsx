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
      <h2 className="text-[15px] font-bold text-navy-deep">History</h2>

      {detail.ageRange === "unknown" ? (
        <form
          action={updateApplianceAge.bind(null, detail.instanceId)}
          className="flex flex-col gap-4 rounded-card border border-line bg-white p-[18px]"
        >
          <p className="text-sm font-semibold text-ink">
            How old is this {detail.applianceDisplayName.toLowerCase()}?
          </p>
          <div className="flex flex-wrap gap-2.5">
            {AGE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="inline-flex h-10 cursor-pointer items-center rounded-full border-[1.5px] border-line px-4 text-sm font-medium text-ink transition has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:checked]:text-navy-deep hover:border-[#c3c8d6]"
              >
                <input type="radio" name="ageRange" value={option.value} className="sr-only" />
                {option.label}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="installDate" className="text-sm text-ink-muted">
              Or an exact install date:
            </label>
            <input
              id="installDate"
              name="installDate"
              type="date"
              className="rounded-control border-[1.5px] border-line px-3 py-1.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent-soft"
            />
          </div>
          <button
            type="submit"
            className="self-start rounded-control bg-navy-deep px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy active:translate-y-px"
          >
            Save
          </button>
        </form>
      ) : (
        <p className="text-sm text-ink-muted">
          Age: {detail.ageRange}
          {detail.installDate ? ` (installed ${detail.installDate})` : ""}
        </p>
      )}

      {detail.completedHistory.length === 0 ? (
        <p className="text-sm text-ink-muted">No completed actions yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line-soft overflow-hidden rounded-card border border-line bg-white">
          {detail.completedHistory.map((item) => (
            <li key={item.id} className="flex items-baseline gap-3 px-[18px] py-3 text-sm">
              <span className="text-xs text-ink-muted">{item.eventDate}</span>
              <span className="text-ink">{item.taskName}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
