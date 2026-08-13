"use client";

import { useState, type FormEvent } from "react";
import type { HouseDetails } from "./types";

const HOUSE_TYPE_OPTIONS: { value: HouseDetails["houseType"]; label: string }[] = [
  { value: "single_family", label: "Single family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "other", label: "Other" },
];

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
        <label htmlFor="address" className="text-sm font-medium">
          Address
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          defaultValue={initial?.address}
          className="border rounded px-2 py-1"
        />
        {errors.address && (
          <p role="alert" className="text-sm text-red-600">
            {errors.address}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="zip" className="text-sm font-medium">
          ZIP code
        </label>
        <input
          id="zip"
          name="zip"
          type="text"
          inputMode="numeric"
          required
          defaultValue={initial?.zip}
          className="border rounded px-2 py-1"
        />
        {errors.zip && (
          <p role="alert" className="text-sm text-red-600">
            {errors.zip}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-medium">House type</legend>
        {HOUSE_TYPE_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
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
          <p role="alert" className="text-sm text-red-600">
            {errors.houseType}
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        className="border rounded px-3 py-1.5 font-medium self-start"
      >
        Continue
      </button>
    </form>
  );
}
