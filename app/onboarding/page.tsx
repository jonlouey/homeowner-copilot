import { sql } from "@/lib/db";
import { OnboardingFlow } from "./onboarding-flow";
import type { ApplianceTypeRow } from "./types";

export default async function OnboardingPage() {
  const applianceTypes = (await sql`
    select id, category, display_name
    from appliance_types
    order by category, display_name
  `) as ApplianceTypeRow[];

  return (
    <main className="flex flex-col gap-6 bg-canvas p-8">
      <h1 className="font-display text-xl font-medium text-ink">Add your house</h1>
      <OnboardingFlow applianceTypes={applianceTypes} />
    </main>
  );
}
