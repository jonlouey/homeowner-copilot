"use server";

import { randomUUID } from "node:crypto";
import { sql } from "@/lib/db";
import { deriveRegionFromZip } from "@/lib/region";
import { CURRENT_USER_ID } from "@/lib/user";
import type { HouseDetails } from "./types";

export type SubmitOnboardingResult =
  | { status: "success"; house: { id: string; address: string }; applianceCount: number }
  | { status: "error"; message: string };

export async function submitOnboarding(
  houseDetails: HouseDetails,
  applianceTypeIds: string[]
): Promise<SubmitOnboardingResult> {
  const address = houseDetails.address.trim();
  const zip = houseDetails.zip.trim();

  if (!address || !/^\d{5}$/.test(zip)) {
    return { status: "error", message: "House details are invalid." };
  }
  if (applianceTypeIds.length === 0) {
    return { status: "error", message: "Select at least one appliance to continue." };
  }

  const region = deriveRegionFromZip(zip);
  if (!region) {
    return { status: "error", message: "Could not determine region from ZIP." };
  }

  // Generated up front (rather than relying on the houses.id default) so it
  // can be reused as the FK for the appliance_instances inserts below — the
  // HTTP transaction API sends all queries in one non-interactive batch, so
  // later queries can't depend on an earlier query's result.
  const houseId = randomUUID();

  try {
    await sql.transaction([
      sql`
        insert into houses (id, user_id, address, zip, region, house_type)
        values (${houseId}, ${CURRENT_USER_ID}, ${address}, ${zip}, ${region}, ${houseDetails.houseType})
      `,
      ...applianceTypeIds.map(
        (applianceTypeId) => sql`
          insert into appliance_instances (house_id, appliance_type_id, age_range, status)
          values (${houseId}, ${applianceTypeId}, 'unknown', 'active')
        `
      ),
    ]);
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }

  return {
    status: "success",
    house: { id: houseId, address },
    applianceCount: applianceTypeIds.length,
  };
}
