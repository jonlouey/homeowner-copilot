import type { ApplianceDetail } from "./data";
import { headlineSentence, pickHeadlineComputation } from "./headline";
import { APPLIANCE_SUMMARIES } from "./summary-content";

export function SummarySection({ detail }: { detail: ApplianceDetail }) {
  const paragraph = APPLIANCE_SUMMARIES[detail.applianceTypeId];

  if (!detail.result.hasContent || !paragraph) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-bold text-navy-deep">Summary</h2>
        <p className="text-sm text-ink-muted">
          We don&apos;t have written guidance for this appliance yet.
        </p>
      </section>
    );
  }

  const headline = headlineSentence(pickHeadlineComputation(detail.result.rules));

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[15px] font-bold text-navy-deep">Summary</h2>
      <p className="text-sm leading-[1.6] text-ink">{paragraph}</p>
      <p className="text-sm font-semibold text-ink">{headline}</p>
    </section>
  );
}
