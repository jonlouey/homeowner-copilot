import {
  CATEGORY_IDS,
  compareByRollupSeverity,
  getApplianceCardsForHouse,
  getCurrentHouse,
  type ApplianceCard,
  type CategoryId,
  type House,
} from "@/app/dashboard/data";

export function isValidCategoryId(id: string): id is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(id);
}

export type CategoryPageData = { house: null } | { house: House; cards: ApplianceCard[] };

export async function getCategoryPageData(categoryId: CategoryId): Promise<CategoryPageData> {
  const house = await getCurrentHouse();
  if (!house) {
    return { house: null };
  }

  const allCards = await getApplianceCardsForHouse(house.id);
  const cards = allCards
    .filter((card) => card.category === categoryId)
    .sort(compareByRollupSeverity);

  return { house, cards };
}
