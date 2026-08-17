// Segmented step indicator, per the design system's progress pattern —
// shared between onboarding steps rather than duplicated per step.
export function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="mb-7 flex gap-1.5" aria-hidden="true">
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < currentStep ? "bg-accent" : "bg-line-soft"
          }`}
        />
      ))}
    </div>
  );
}
