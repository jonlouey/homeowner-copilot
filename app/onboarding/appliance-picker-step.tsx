"use client";

import { Check, ChevronLeft } from "lucide-react";
import { useState, useTransition } from "react";
import { submitOnboarding } from "./actions";
import { DEFAULT_CHECKED_APPLIANCE_TYPE_IDS, getHiddenApplianceTypeIds } from "./filtering";
import { ProgressBar } from "./progress-bar";
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
    <div className="w-full">
      <ProgressBar currentStep={2} totalSteps={2} />

      {hidingSomething && (
        <p className="mb-8 text-[14.5px] leading-[1.5] text-ink-muted">
          We&apos;ve hidden a few types based on typical {HOUSE_TYPE_LABELS[houseType]}{" "}
          ownership — add anything we missed.
        </p>
      )}

      {groups.map((group) => (
        <div key={group.category} className="mb-8">
          <div className="mb-3.5">
            <span className="text-[13.5px] font-semibold text-ink">
              {CATEGORY_LABELS[group.category]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {group.items.map((type) => {
              const isSelected = selected.has(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(type.id)}
                  className={`inline-flex h-10 items-center gap-[7px] whitespace-nowrap rounded-full border-[1.5px] px-4 text-sm font-medium transition ${
                    isSelected
                      ? "border-accent bg-accent-soft text-navy-deep"
                      : "border-line text-ink hover:border-[#c3c8d6]"
                  }`}
                >
                  <span
                    className={`flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
                      isSelected ? "border-accent bg-accent" : "border-[#c3c8d6]"
                    }`}
                  >
                    <Check
                      size={9}
                      strokeWidth={3}
                      className={`text-white transition-all ${
                        isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      }`}
                    />
                  </span>
                  {type.display_name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-10">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="group mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-ink disabled:opacity-50"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="h-[52px] w-full rounded-control bg-navy-deep text-[15.5px] font-semibold text-white transition hover:bg-navy active:translate-y-px disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
