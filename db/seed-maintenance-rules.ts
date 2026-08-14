import { neon } from "@neondatabase/serverless";

type Criticality = "safety" | "routine";
type AgeRange = "0-2" | "3-7" | "8-15" | "15+";

type RecurringRule = {
  applianceTypeId: string;
  taskName: string;
  description: string;
  frequencyMonths: number;
  criticality: Criticality;
};

type LifespanRule = {
  applianceTypeId: string;
  taskName: string;
  description: string;
  minAgeRange: AgeRange;
  criticality: Criticality;
};

// Content sourced from a mix of manufacturer guidance, home-inspector
// references, and industry associations — see the Appendix in
// docs/requirements/phase-2a-rules-engine-design.md for reasoning per rule.
// All 5 appliance types from the Phase 2a scope: Roof, HVAC, Water Heater,
// Electrical Panel, Sump Pump.
const RECURRING_RULES: RecurringRule[] = [
  {
    applianceTypeId: "roof",
    taskName: "Professional inspection",
    description:
      "Have a roofer check for damaged, missing, or curling shingles, flashing issues, and signs of active leaks. Catching problems early avoids costly interior water damage.",
    frequencyMonths: 12,
    criticality: "routine",
  },
  {
    applianceTypeId: "roof",
    taskName: "Clean gutters & check for debris",
    description:
      "Clear leaves and debris from gutters, downspouts, and the roof surface. Clogged gutters can back water up under shingles and damage the roof edge.",
    frequencyMonths: 6,
    criticality: "routine",
  },
  {
    applianceTypeId: "hvac",
    taskName: "Replace filter",
    description:
      "Replace or clean the HVAC filter to maintain airflow and indoor air quality. Homes with pets or allergy sufferers may need to replace filters more often than every 3 months.",
    frequencyMonths: 3,
    criticality: "routine",
  },
  {
    applianceTypeId: "hvac",
    taskName: "Professional tune-up",
    description:
      "Have a technician service the system before the start of heating or cooling season — checking refrigerant, electrical connections, and overall performance to catch small issues before they become costly repairs.",
    frequencyMonths: 12,
    criticality: "routine",
  },
  {
    applianceTypeId: "water_heater",
    taskName: "Test T&P relief valve",
    description:
      "Test the temperature and pressure relief valve to confirm it's functioning. This safety device prevents dangerous pressure buildup — a stuck or failed valve can lead to tank rupture or scalding.",
    frequencyMonths: 12,
    criticality: "safety",
  },
  {
    applianceTypeId: "water_heater",
    taskName: "Flush tank (sediment)",
    description:
      "Flush the tank to clear out sediment buildup. This keeps the heater running efficiently and helps it last longer, though it isn't a safety concern on its own.",
    frequencyMonths: 12,
    criticality: "routine",
  },
  {
    applianceTypeId: "water_heater",
    taskName: "Inspect/replace anode rod",
    description:
      "Inspect the sacrificial anode rod for corrosion and replace it if it's substantially worn. The rod protects the tank from rusting from the inside out — actual replacement is often needed less often than the inspection interval.",
    frequencyMonths: 36,
    criticality: "routine",
  },
  {
    applianceTypeId: "electrical_panel",
    taskName: "Professional inspection",
    description:
      "Have an electrician inspect the panel for loose connections, signs of overheating, corrosion, and outdated or unsafe wiring. A well-maintained panel is a key fire-safety line of defense.",
    frequencyMonths: 24,
    criticality: "safety",
  },
  {
    applianceTypeId: "sump_pump",
    taskName: "Test pump (pour water, confirm activation)",
    description:
      "Pour water into the sump pit until the pump activates, and confirm it removes the water and shuts off properly. A pump that doesn't kick on during a storm can mean a flooded basement.",
    frequencyMonths: 6,
    criticality: "safety",
  },
  {
    applianceTypeId: "sump_pump",
    taskName: "Professional inspection (pit, check valve, backup power, alarm)",
    description:
      "Have the pit, check valve, backup power source, and alarm inspected by a professional. These components tend to fail silently between storms, so a periodic check catches issues before you need the pump most.",
    frequencyMonths: 12,
    criticality: "safety",
  },
];

const LIFESPAN_RULES: LifespanRule[] = [
  {
    applianceTypeId: "roof",
    taskName: "Plan for eventual replacement",
    description:
      "Asphalt shingle roofs typically last 15-30 years — yours may be approaching replacement age. Consider a professional inspection to assess condition.",
    minAgeRange: "15+",
    criticality: "routine",
  },
  {
    applianceTypeId: "hvac",
    taskName: "Plan for eventual replacement",
    description:
      "HVAC systems typically last 15-25 years. If yours is in this range, start budgeting for eventual replacement.",
    minAgeRange: "15+",
    criticality: "routine",
  },
  {
    applianceTypeId: "water_heater",
    taskName: "Plan for eventual replacement",
    description:
      "Tank water heaters typically last 8-12 years. Yours may be nearing end of life — watch for rust, leaks, or inconsistent heat.",
    minAgeRange: "8-15",
    criticality: "routine",
  },
  {
    applianceTypeId: "electrical_panel",
    taskName: "Consider evaluation",
    description:
      "Electrical panels typically last 25-40 years, but rising electrical demand can warrant an earlier upgrade. Consider having it evaluated if your home's power needs have grown.",
    minAgeRange: "15+",
    criticality: "routine",
  },
  {
    applianceTypeId: "sump_pump",
    taskName: "Plan for eventual replacement",
    description:
      "Sump pumps typically last 10-15 years with regular maintenance. Consider having yours evaluated, especially before storm season.",
    minAgeRange: "8-15",
    criticality: "routine",
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(process.env.DATABASE_URL);

  const applianceTypeIds = [
    ...new Set([...RECURRING_RULES, ...LIFESPAN_RULES].map((rule) => rule.applianceTypeId)),
  ];

  // maintenance_rules has no natural key to upsert on, so re-seed by
  // clearing out any existing rows for these appliance types first.
  await sql`delete from maintenance_rules where appliance_type_id = any(${applianceTypeIds})`;

  for (const rule of RECURRING_RULES) {
    await sql`
      insert into maintenance_rules
        (appliance_type_id, task_name, description, frequency_months, rule_type, criticality)
      values
        (${rule.applianceTypeId}, ${rule.taskName}, ${rule.description}, ${rule.frequencyMonths}, 'recurring', ${rule.criticality})
    `;
  }

  for (const rule of LIFESPAN_RULES) {
    await sql`
      insert into maintenance_rules
        (appliance_type_id, task_name, description, min_age_range, rule_type, criticality)
      values
        (${rule.applianceTypeId}, ${rule.taskName}, ${rule.description}, ${rule.minAgeRange}, 'lifespan', ${rule.criticality})
    `;
  }

  console.log(
    `Seeded ${RECURRING_RULES.length} recurring + ${LIFESPAN_RULES.length} lifespan rules for: ${applianceTypeIds.join(", ")}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
