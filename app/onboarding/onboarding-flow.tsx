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

export function OnboardingFlow({ applianceTypes }: { applianceTypes: ApplianceTypeRow[] }) {
  const [step, setStep] = useState<Step>({ name: "house" });
  const [houseDetails, setHouseDetails] = useState<HouseDetails | null>(null);

  if (step.name === "house") {
    return (
      <HouseDetailsStep
        initial={houseDetails}
        onContinue={(details) => {
          setHouseDetails(details);
          setStep({ name: "appliances" });
        }}
      />
    );
  }

  if (step.name === "appliances") {
    return (
      <AppliancePickerStep
        applianceTypes={applianceTypes}
        houseDetails={houseDetails!}
        onBack={() => setStep({ name: "house" })}
        onSubmitted={({ address, applianceCount }) =>
          setStep({ name: "confirmation", address, applianceCount })
        }
      />
    );
  }

  return <ConfirmationStep address={step.address} applianceCount={step.applianceCount} />;
}
