import { LandingHero } from "./landing/hero";
import { HowItWorks } from "./landing/how-it-works";
import { LandingNav } from "./landing/nav";

export default function LandingPage() {
  return (
    <main className="flex flex-col">
      <LandingNav />
      <LandingHero />
      <HowItWorks />
    </main>
  );
}
