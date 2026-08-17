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
    <main className="flex w-full justify-center">
      <OnboardingFlow applianceTypes={applianceTypes} />
    </main>
  );
}
