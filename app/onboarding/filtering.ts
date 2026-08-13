import type { HouseDetails } from "./types";

// Filtering rules from docs/requirements/phase-1-onboarding.md — deliberately
// conservative (when in doubt, show it); revisit once there's real usage.
const HIDDEN_APPLIANCE_TYPES_BY_HOUSE_TYPE: Record<HouseDetails["houseType"], string[]> = {
  single_family: [],
  condo: [
    "roof",
    "gutters",
    "siding",
    "foundation",
    "basement_waterproofing",
    "driveway_walkways",
    "sump_pump",
  ],
  townhouse: ["sump_pump"],
  other: [],
};

export const DEFAULT_CHECKED_APPLIANCE_TYPE_IDS = [
  "hvac",
  "water_heater",
  "electrical_panel",
];

export function getHiddenApplianceTypeIds(houseType: HouseDetails["houseType"]): string[] {
  return HIDDEN_APPLIANCE_TYPES_BY_HOUSE_TYPE[houseType];
}
