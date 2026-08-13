"use client";

import { useState, useTransition } from "react";
import { submitOnboarding } from "./actions";
import { DEFAULT_CHECKED_APPLIANCE_TYPE_IDS, getHiddenApplianceTypeIds } from "./filtering";
import type { ApplianceTypeRow, HouseDetails } from "./types";

const CATEGORY_ORDER: ApplianceTypeRow["category"][] = [
  "systems",
  "exterior",
  "appliances",
  "safety",
];

const CATEGORY_LABELS: Record<ApplianceTypeRow["category"], string> = {
  systems: "Systems",
  exterior: "Exterior",
  appliances: "Appliances",
  safety: "Safety",
};

const HOUSE_TYPE_LABELS: Record<HouseDetails["houseType"], string> = {
  single_family: "single family home",
  condo: "condo",
  townhouse: "townhouse",
  other: "home",
};

export function AppliancePickerStep({
  applianceTypes,
  houseDetails,
  onBack,
  onSubmitted,
}: {
  applianceTypes: ApplianceTypeRow[];
  houseDetails: HouseDetails;
  onBack: () => void;
  onSubmitted: (result: { address: string; applianceCount: number }) => void;
}) {
  const houseType = houseDetails.houseType;
  const hiddenIds = new Set(getHiddenApplianceTypeIds(houseType));
  const visibleTypes = applianceTypes.filter((type) => !hiddenIds.has(type.id));

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(DEFAULT_CHECKED_APPLIANCE_TYPE_IDS.filter((id) => !hiddenIds.has(id)))
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSubmit() {
    if (selected.size === 0) {
      setError("Select at least one appliance to continue.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitOnboarding(houseDetails, Array.from(selected));
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      onSubmitted({ address: result.house.address, applianceCount: result.applianceCount });
    });
  }

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: visibleTypes.filter((type) => type.category === category),
  })).filter((group) => group.items.length > 0);

  const hidingSomething = hiddenIds.size > 0;

  return (
    <div className="flex flex-col gap-6 max-w-md">
      {hidingSomething && (
        <p className="text-sm text-gray-500">
          We&apos;ve hidden a few types based on typical {HOUSE_TYPE_LABELS[houseType]}{" "}
          ownership — add anything we missed.
        </p>
      )}

      {groups.map((group) => (
        <fieldset key={group.category} className="flex flex-col gap-2">
          <legend className="text-sm font-medium">{CATEGORY_LABELS[group.category]}</legend>
          <div className="flex flex-wrap gap-2">
            {group.items.map((type) => {
              const isSelected = selected.has(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(type.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    isSelected
                      ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                      : "border-gray-400"
                  }`}
                >
                  {type.display_name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="border rounded px-3 py-1.5 font-medium disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="border rounded px-3 py-1.5 font-medium disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
