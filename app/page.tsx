import { ClosingCta } from "./landing/closing-cta";
import { LandingFooter } from "./landing/footer";
import { LandingHero } from "./landing/hero";
import { HowItWorks } from "./landing/how-it-works";
import { LandingNav } from "./landing/nav";
import { WhyItHelps } from "./landing/why-it-helps";

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <LandingNav />
      <LandingHero />
      <HowItWorks />
      <WhyItHelps />
      <ClosingCta />
      <LandingFooter />
    </main>
  );
}
