import type { ApplianceDetail } from "./data";
import { headlineSentence, pickHeadlineComputation } from "./headline";
import { APPLIANCE_SUMMARIES } from "./summary-content";

export function SummarySection({ detail }: { detail: ApplianceDetail }) {
  const paragraph = APPLIANCE_SUMMARIES[detail.applianceTypeId];

  if (!detail.result.hasContent || !paragraph) {
    return (
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-gray-500">Summary</h2>
        <p className="text-sm text-gray-500">
          We don&apos;t have written guidance for this appliance yet.
        </p>
      </section>
    );
  }

  const headline = headlineSentence(pickHeadlineComputation(detail.result.rules));

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-gray-500">Summary</h2>
      <p className="text-sm leading-relaxed">{paragraph}</p>
      <p className="text-sm font-medium">{headline}</p>
    </section>
  );
}
