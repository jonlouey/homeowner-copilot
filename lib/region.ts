// Static zip-prefix -> region lookup, per the Phase 0 decision log
// ("Static zip-prefix -> climate-zone table" over a geocoding API).
// Rough granularity only — first ZIP digit maps to one of the USPS's
// broad geographic regions.
const ZIP_PREFIX_REGIONS: Record<string, string> = {
  "0": "northeast",
  "1": "northeast",
  "2": "mid_atlantic",
  "3": "southeast",
  "4": "midwest",
  "5": "midwest",
  "6": "south_central",
  "7": "south_central",
  "8": "mountain",
  "9": "pacific",
};

export function deriveRegionFromZip(zip: string): string | null {
  const firstDigit = zip.trim().charAt(0);
  return ZIP_PREFIX_REGIONS[firstDigit] ?? null;
}
