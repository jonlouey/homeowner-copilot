export type ApplianceTypeRow = {
  id: string;
  category: "systems" | "exterior" | "appliances" | "safety";
  display_name: string;
};

export type HouseDetails = {
  address: string;
  zip: string;
  houseType: "single_family" | "condo" | "townhouse" | "other";
};
