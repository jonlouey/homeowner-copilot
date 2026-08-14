import {
  Building2,
  CloudRain,
  CookingPot,
  DoorClosed,
  Droplet,
  Droplets,
  Flame,
  Home,
  Layers,
  type LucideIcon,
  PanelTop,
  Package,
  Refrigerator as RefrigeratorIcon,
  Route,
  Siren,
  Sofa,
  Umbrella,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wrench,
  Zap,
} from "lucide-react";

// One icon per seeded appliance_types.id (db/seed.ts) — no per-type icon
// set exists in the project, so this is the closest lucide-react has to
// each appliance. A few conceptually related types intentionally share an
// icon (hvac/furnace_boiler/chimney_fireplace -> Flame, washer/dryer ->
// WashingMachine) rather than reaching for something arbitrary just to be
// unique.
export const APPLIANCE_ICONS: Record<string, LucideIcon> = {
  // systems
  hvac: Flame,
  furnace_boiler: Flame,
  water_heater: Droplet,
  electrical_panel: Zap,
  plumbing: Wrench,
  sewer_septic: Waves,
  sump_pump: Droplets,
  // exterior
  roof: Home,
  foundation: Building2,
  basement_waterproofing: Umbrella,
  windows: PanelTop,
  siding: Layers,
  gutters: CloudRain,
  driveway_walkways: Route,
  deck_porch: Sofa,
  garage_door: DoorClosed,
  // appliances
  refrigerator: RefrigeratorIcon,
  dishwasher: UtensilsCrossed,
  washer: WashingMachine,
  dryer: WashingMachine,
  range_oven: CookingPot,
  // safety
  smoke_co_detectors: Siren,
  chimney_fireplace: Flame,
};

export const DEFAULT_APPLIANCE_ICON: LucideIcon = Package;
