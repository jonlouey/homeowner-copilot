import Link from "next/link";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "./category-icons";
import type { CategoryCardData } from "./data";

// The "Category card" pattern from docs/designs/design-system.md — meta
// text is the status-driven "N of M need info" from computeCategoryRollup,
// not a raw item count (the design debt flagged in the mockup handoff).
export function CategoryCard({ category }: { category: CategoryCardData }) {
  const Icon = CATEGORY_ICONS[category.categoryId];

  return (
    <Link
      href={`/dashboard/category/${category.categoryId}`}
      className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-white p-4 transition hover:-translate-y-px hover:border-accent hover:shadow-md"
    >
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] bg-accent-soft text-accent">
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[14.5px] font-semibold text-ink">
          {CATEGORY_LABELS[category.categoryId]}
        </span>
        <span className="text-xs text-ink-muted">{category.rollup.metaText}</span>
      </span>
    </Link>
  );
}
