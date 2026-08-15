"use client";

import { useState, type FormEvent } from "react";
import type { HouseDetails } from "./types";

const HOUSE_TYPE_OPTIONS: { value: HouseDetails["houseType"]; label: string }[] = [
  { value: "single_family", label: "Single family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "other", label: "Other" },
];

const labelClass = "font-mono text-xs uppercase tracking-wide text-muted";
const inputClass = "border border-hairline px-2 py-1 text-sm text-ink";

type Errors = Partial<Record<"address" | "zip" | "houseType", string>>;

export function HouseDetailsStep({
  initial,
  onContinue,
}: {
  initial: HouseDetails | null;
  onContinue: (details: HouseDetails) => void;
}) {
  const [errors, setErrors] = useState<Errors>({});

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
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="address" className={labelClass}>
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          defaultValue={initial?.address}
          className={inputClass}
        />
        {errors.address && (
          <p role="alert" className="text-sm text-danger">
            {errors.address}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="zip" className={labelClass}>
          ZIP code
        </label>
        <input
          id="zip"
          name="zip"
          type="text"
          inputMode="numeric"
          required
          defaultValue={initial?.zip}
          className={`${inputClass} font-mono`}
        />
        {errors.zip && (
          <p role="alert" className="text-sm text-danger">
            {errors.zip}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className={labelClass}>House type</legend>
        {HOUSE_TYPE_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-ink">
            <input
              type="radio"
              name="houseType"
              value={option.value}
              required
              defaultChecked={initial?.houseType === option.value}
            />
            {option.label}
          </label>
        ))}
        {errors.houseType && (
          <p role="alert" className="text-sm text-danger">
            {errors.houseType}
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        className="self-start border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-hairline"
      >
        Continue
      </button>
    </form>
  );
}
