import Image from "next/image";
import Link from "next/link";

// Text-shadow, not a scrim/panel, is what keeps the hero copy legible
// over the photo — per the requirements doc's "final direction." Tailwind
// v4 has no built-in text-shadow utility, so this uses the arbitrary
// property syntax; defined once and reused since all four text elements
// share the identical two-layer shadow from the reference.
const heroTextShadow = "[text-shadow:0_2px_16px_rgba(0,0,0,.45),0_1px_4px_rgba(0,0,0,.35)]";

export function LandingHero() {
  return (
    <section className="relative flex min-h-[480px] w-full items-center justify-center overflow-hidden bg-navy-deep">
      <Image
        src="/hero-home.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="relative mx-6 max-w-[560px] px-7 py-10 text-center">
        <p
          className={`mb-3.5 text-[12.5px] font-semibold uppercase tracking-[.08em] text-hero-text-muted ${heroTextShadow}`}
        >
          For new homeowners
        </p>
        <h1
          className={`mb-4 text-[38px] leading-[1.15] tracking-[-0.015em] font-bold text-white max-md:text-[28px] ${heroTextShadow}`}
        >
          Know what your home needs, before it becomes a problem.
        </h1>
        <p
          className={`mx-auto mb-7 max-w-[500px] text-base leading-[1.55] text-hero-text ${heroTextShadow}`}
        >
          A maintenance plan built from your actual home — what to check, when, and why it
          matters — explained like a contractor you trust, not a spec sheet.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex h-[50px] items-center rounded-control bg-white px-[30px] text-[15.5px] font-semibold text-navy-deep transition hover:bg-line-soft"
        >
          Set up your home
        </Link>
        <p className={`mt-3.5 text-[11px] text-hero-credit ${heroTextShadow}`}>
          Photo by{" "}
          <a
            href="https://unsplash.com/@pbanselme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-hero-text-muted hover:underline"
          >
            Bailey Anselme
          </a>{" "}
          on Unsplash
        </p>
      </div>
    </section>
  );
}
