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
      <h2 className="text-sm font-medium text-gray-500">History</h2>

      {detail.ageRange === "unknown" ? (
        <form
          action={updateApplianceAge.bind(null, detail.instanceId)}
          className="flex flex-col gap-3 border rounded px-3 py-3"
        >
          <p className="text-sm font-medium">
            How old is this {detail.applianceDisplayName.toLowerCase()}?
          </p>
          <div className="flex flex-wrap gap-3">
            {AGE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-1 text-sm">
                <input type="radio" name="ageRange" value={option.value} />
                {option.label}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="installDate" className="text-sm text-gray-500">
              Or an exact install date:
            </label>
            <input
              id="installDate"
              name="installDate"
              type="date"
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            className="border rounded px-3 py-1.5 text-sm font-medium self-start"
          >
            Save
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          Age: {detail.ageRange}
          {detail.installDate ? ` (installed ${detail.installDate})` : ""}
        </p>
      )}

      {detail.completedHistory.length === 0 ? (
        <p className="text-sm text-gray-500">No completed actions yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {detail.completedHistory.map((item) => (
            <li key={item.id} className="text-sm text-gray-700">
              {item.eventDate} — {item.taskName}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
