import Link from "next/link";
import { APPLIANCE_ICONS, DEFAULT_APPLIANCE_ICON } from "./appliance-icons";
import type { ApplianceCard as ApplianceCardData } from "./data";

const BORDER_LEFT_CLASSES: Record<string, string> = {
  red: "border-l-danger",
  yellow: "border-l-amber",
  green: "border-l-good",
  gray: "border-l-line",
};

const ICON_BADGE_CLASSES: Record<string, string> = {
  red: "bg-danger-soft text-danger",
  yellow: "bg-amber-soft text-amber",
  green: "bg-good-soft text-good",
  gray: "bg-line-soft text-ink-faint",
};

const STATUS_PILL_CLASSES: Record<string, string> = {
  red: "border-danger-line bg-danger-soft text-danger",
  yellow: "border-amber-line bg-amber-soft text-amber",
  green: "border-good-line bg-good-soft text-good",
  gray: "border-line bg-line-soft text-ink-faint",
};

const DOT_CLASSES: Record<string, string> = {
  red: "bg-danger",
  yellow: "bg-amber",
  green: "bg-good",
  gray: "bg-ink-faint",
};

// The "Attention card" pattern from docs/designs/design-system.md — used
// both for the dashboard's "Needs your attention" grid and the
// /dashboard/category/[categoryId] page's filtered list.
export function AttentionCard({ card, index }: { card: ApplianceCardData; index: number }) {
  const { rollup } = card;
  const Icon = APPLIANCE_ICONS[card.applianceTypeId] ?? DEFAULT_APPLIANCE_ICON;

  return (
    <Link
      href={`/dashboard/appliances/${card.applianceInstanceId}`}
      className={`relative block rounded-card border border-line border-l-[3px] bg-white px-[18px] pt-[18px] pb-4 transition hover:-translate-y-px hover:shadow-md ${
        BORDER_LEFT_CLASSES[rollup.color]
      }`}
    >
      <div className="mb-[22px] flex items-start justify-between">
        <span className="text-xs font-semibold tracking-[.02em] text-ink-faint">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`flex h-[30px] w-[30px] items-center justify-center rounded-[8px] ${
            ICON_BADGE_CLASSES[rollup.color]
          }`}
        >
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>

      <p className="mb-3 text-base font-semibold text-ink">{card.applianceDisplayName}</p>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.04em] ${
          STATUS_PILL_CLASSES[rollup.color]
        }`}
      >
        <span className={`h-[5px] w-[5px] rounded-full ${DOT_CLASSES[rollup.color]}`} />
        {rollup.cardCopy}
      </span>
    </Link>
  );
}
