import { Home } from "lucide-react";
import Link from "next/link";

// Sticky nav per docs/designs/reference/landing-page-preview-v2.html.
// rgba(251,251,253,0.92) in the reference is exactly --color-paper at 92%
// opacity, expressed here as bg-paper/92. The reference hides nav links
// below 760px; approximated to Tailwind's stock md (768px) breakpoint
// rather than an arbitrary 760px value, same approximation used in the
// hero's mobile heading size.
export function LandingNav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-line bg-paper/92 backdrop-blur-[6px]">
      <div className="mx-auto flex max-w-[1040px] items-center justify-between px-6 py-[18px]">
        <div className="flex items-center gap-2 text-[15px] font-bold text-navy-deep">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-navy-deep text-white">
            <Home size={15} aria-hidden="true" />
          </span>
          Homeowner Copilot
        </div>

        <div className="hidden items-center gap-7 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-ink-muted transition hover:text-ink"
          >
            How it works
          </a>
          <a href="#value" className="text-sm font-medium text-ink-muted transition hover:text-ink">
            Why it helps
          </a>
        </div>

        <Link
          href="/onboarding"
          className="inline-flex h-[38px] items-center rounded-control bg-navy-deep px-[18px] text-[13.5px] font-semibold text-white transition hover:bg-navy"
        >
          Set up your home
        </Link>
      </div>
    </nav>
  );
}
