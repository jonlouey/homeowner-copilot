import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

type ApplianceType = {
  id: string;
  category: "systems" | "exterior" | "appliances" | "safety";
  display_name: string;
};

const applianceTypes: ApplianceType[] = [
  // systems
  { id: "hvac", category: "systems", display_name: "HVAC" },
  { id: "furnace_boiler", category: "systems", display_name: "Furnace / Boiler" },
  { id: "water_heater", category: "systems", display_name: "Water Heater" },
  { id: "electrical_panel", category: "systems", display_name: "Electrical Panel" },
  { id: "plumbing", category: "systems", display_name: "Plumbing" },
  { id: "sewer_septic", category: "systems", display_name: "Sewer / Septic" },
  { id: "sump_pump", category: "systems", display_name: "Sump Pump" },
  // exterior
  { id: "roof", category: "exterior", display_name: "Roof" },
  { id: "foundation", category: "exterior", display_name: "Foundation" },
  { id: "basement_waterproofing", category: "exterior", display_name: "Basement / Crawlspace Waterproofing" },
  { id: "windows", category: "exterior", display_name: "Windows" },
  { id: "siding", category: "exterior", display_name: "Siding" },
  { id: "gutters", category: "exterior", display_name: "Gutters" },
  { id: "driveway_walkways", category: "exterior", display_name: "Driveway / Walkways" },
  { id: "deck_porch", category: "exterior", display_name: "Deck / Porch" },
  { id: "garage_door", category: "exterior", display_name: "Garage Door" },
  // appliances
  { id: "refrigerator", category: "appliances", display_name: "Refrigerator" },
  { id: "dishwasher", category: "appliances", display_name: "Dishwasher" },
  { id: "washer", category: "appliances", display_name: "Washer" },
  { id: "dryer", category: "appliances", display_name: "Dryer" },
  { id: "range_oven", category: "appliances", display_name: "Range / Oven" },
  // safety
  { id: "smoke_co_detectors", category: "safety", display_name: "Smoke & CO Detectors" },
  { id: "chimney_fireplace", category: "safety", display_name: "Chimney / Fireplace" },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  for (const t of applianceTypes) {
    await pool.query(
      `insert into appliance_types (id, category, display_name)
       values ($1, $2, $3)
       on conflict (id) do update set category = excluded.category, display_name = excluded.display_name`,
      [t.id, t.category, t.display_name]
    );
  }

  await pool.end();
  console.log(`Seeded ${applianceTypes.length} appliance types.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
