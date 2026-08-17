// Shared page shell for the whole onboarding flow (house details, appliance
// picker, confirmation, and any future step) — centering/padding lives here
// once, per docs/designs/design-system.md, rather than being duplicated in
// each step's page. Width is deliberately NOT fixed here: the mockups use
// different card widths per step (460px for the house-details form, 640px
// for the wider chip grid), so each step's own root element sets its own
// max-width and this flex row just centers whatever it's given.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-center bg-paper px-6 pt-14 pb-20">{children}</div>;
}
