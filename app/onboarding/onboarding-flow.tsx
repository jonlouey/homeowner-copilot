"use client";

import { useState } from "react";
import { AppliancePickerStep } from "./appliance-picker-step";
import { ConfirmationStep } from "./confirmation-step";
import { HouseDetailsStep } from "./house-details-step";
import type { ApplianceTypeRow, HouseDetails } from "./types";

type Step =
  | { name: "house" }
  | { name: "appliances" }
  | { name: "confirmation"; address: string; applianceCount: number };

// Owns the page title + the step-aware max-width (460px for house details/
// confirmation, 640px for the wider appliance chip grid, per the mockups)
// so the title and the active step's content share the exact same box —
// this can't live in page.tsx since only this component knows which step
// is active.
export function OnboardingFlow({ applianceTypes }: { applianceTypes: ApplianceTypeRow[] }) {
  const [step, setStep] = useState<Step>({ name: "house" });
  const [houseDetails, setHouseDetails] = useState<HouseDetails | null>(null);

  const maxWidthClass = step.name === "appliances" ? "max-w-[640px]" : "max-w-[460px]";

  return (
    <div className={`flex w-full ${maxWidthClass} flex-col gap-8`}>
      <h1 className="text-[28px] leading-[1.2] tracking-[-0.015em] font-bold text-navy-deep">
        Add your house
      </h1>

      {step.name === "house" && (
        <HouseDetailsStep
          initial={houseDetails}
          onContinue={(details) => {
            setHouseDetails(details);
            setStep({ name: "appliances" });
          }}
        />
      )}

      {step.name === "appliances" && (
        <AppliancePickerStep
          applianceTypes={applianceTypes}
          houseDetails={houseDetails!}
          onBack={() => setStep({ name: "house" })}
          onSubmitted={({ address, applianceCount }) =>
            setStep({ name: "confirmation", address, applianceCount })
          }
        />
      )}

      {step.name === "confirmation" && (
        <ConfirmationStep address={step.address} applianceCount={step.applianceCount} />
      )}
    </div>
  );
}
