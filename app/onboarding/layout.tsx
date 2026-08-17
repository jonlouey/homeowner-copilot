// Shared page shell for the whole onboarding flow (house details, appliance
// picker, confirmation, and any future step) — centering/padding lives here
// once, per docs/designs/design-system.md, rather than being duplicated in
// each step's page.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center bg-paper px-6 pt-14 pb-20">
      <div className="w-full max-w-[460px]">{children}</div>
    </div>
  );
}
