import Link from "next/link";

// The paragraph's #C3CBE0 is another light-on-navy value with no clean
// token match (same situation as the hero — see design-system.md's
// "Hero-only tokens" note). Kept as an arbitrary value rather than
// reusing a hero token, since those are explicitly scoped to the hero.
export function ClosingCta() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-[1040px]">
        <div className="rounded-2xl bg-navy-deep px-6 py-16 text-center text-white">
          <h2 className="mb-3 text-[28px] font-bold tracking-[-0.01em]">
            Get ahead of your home&apos;s maintenance.
          </h2>
          <p className="mb-7 text-[15px] text-[#C3CBE0]">Set up your home in under two minutes.</p>
          <Link
            href="/onboarding"
            className="inline-flex h-[50px] items-center rounded-control bg-white px-[30px] text-[15.5px] font-semibold text-navy-deep transition hover:bg-line-soft"
          >
            Set up your home
          </Link>
        </div>
      </div>
    </section>
  );
}
