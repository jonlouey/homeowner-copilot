"use client";

import { useState, type FormEvent } from "react";
import { ProgressBar } from "./progress-bar";
import type { HouseDetails } from "./types";

const HOUSE_TYPE_OPTIONS: { value: HouseDetails["houseType"]; label: string }[] = [
  { value: "single_family", label: "Single family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "other", label: "Other" },
];

const labelClass = "text-[13.5px] font-semibold text-ink";
const inputClass =
  "h-12 rounded-control border-[1.5px] border-line px-4 text-[15px] text-ink outline-none transition placeholder:text-ink-faint hover:border-[#c3c8d6] focus:border-accent focus:ring-4 focus:ring-accent-soft";

type Errors = Partial<Record<"address" | "zip" | "houseType", string>>;

export function HouseDetailsStep({
  initial,
  onContinue,
}: {
  initial: HouseDetails | null;
  onContinue: (details: HouseDetails) => void;
}) {
  const [errors, setErrors] = useState<Errors>({});
  // Styling-only — drives the radio-card's checked appearance. The native
  // inputs stay uncontrolled (defaultChecked) exactly as before; this
  // doesn't touch validation or submission, which still read from
  // FormData in handleSubmit.
  const [selectedHouseType, setSelectedHouseType] = useState<string>(initial?.houseType ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const address = String(formData.get("address") ?? "").trim();
    const zip = String(formData.get("zip") ?? "").trim();
    const houseType = String(formData.get("houseType") ?? "");

    const nextErrors: Errors = {};
    if (!address) nextErrors.address = "Address is required.";
    if (!/^\d{5}$/.test(zip)) nextErrors.zip = "Enter a 5-digit ZIP code.";
    if (!HOUSE_TYPE_OPTIONS.some((option) => option.value === houseType)) {
      nextErrors.houseType = "Choose a house type.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onContinue({ address, zip, houseType: houseType as HouseDetails["houseType"] });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col">
      <ProgressBar currentStep={1} totalSteps={2} />

      <div className="mb-[26px] flex flex-col gap-2">
        <label htmlFor="address" className={labelClass}>
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          placeholder="123 Main Street"
          defaultValue={initial?.address}
          className={inputClass}
        />
        {errors.address && (
          <p role="alert" className="text-sm text-danger">
            {errors.address}
          </p>
        )}
      </div>

      <div className="mb-[26px] flex flex-col gap-2">
        <label htmlFor="zip" className={labelClass}>
          ZIP code
        </label>
        <input
          id="zip"
          name="zip"
          type="text"
          inputMode="numeric"
          maxLength={5}
          required
          placeholder="00000"
          defaultValue={initial?.zip}
          className={`${inputClass} max-w-[160px]`}
        />
        {errors.zip && (
          <p role="alert" className="text-sm text-danger">
            {errors.zip}
          </p>
        )}
      </div>

      <fieldset>
        <legend className={`${labelClass} mb-3`}>House type</legend>
        <div className="flex flex-col gap-2.5">
          {HOUSE_TYPE_OPTIONS.map((option) => {
            const isChecked = selectedHouseType === option.value;
            return (
              <label
                key={option.value}
                className={`flex h-[50px] cursor-pointer items-center gap-3 rounded-control border-[1.5px] px-4 text-[14.5px] font-medium text-ink transition ${
                  isChecked
                    ? "border-accent bg-accent-soft ring-4 ring-accent-soft"
                    : "border-line hover:border-[#c3c8d6]"
                }`}
              >
                <input
                  type="radio"
                  name="houseType"
                  value={option.value}
                  required
                  defaultChecked={initial?.houseType === option.value}
                  onChange={() => setSelectedHouseType(option.value)}
                  className="sr-only"
                />
                <span
                  className={`relative h-[18px] w-[18px] flex-shrink-0 rounded-full border-[1.5px] transition-colors ${
                    isChecked ? "border-accent" : "border-[#c3c8d6]"
                  }`}
                >
                  <span
                    className={`absolute inset-[3px] rounded-full bg-accent transition-transform ${
                      isChecked ? "scale-100" : "scale-0"
                    }`}
                  />
                </span>
                {option.label}
              </label>
            );
          })}
        </div>
        {errors.houseType && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {errors.houseType}
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        className="mt-[34px] h-[52px] rounded-control bg-navy-deep text-[15.5px] font-semibold text-white transition hover:bg-navy active:translate-y-px"
      >
        Continue
      </button>
    </form>
  );
}
