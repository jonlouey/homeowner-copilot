import Link from "next/link";
import { APPLIANCE_ICONS, DEFAULT_APPLIANCE_ICON } from "./appliance-icons";
import type { ApplianceCard as ApplianceCardData } from "./data";
import { BORDER_LEFT_CLASSES, ICON_BADGE_CLASSES, StatusPill } from "./status-styles";

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

      <StatusPill color={rollup.color}>{rollup.cardCopy}</StatusPill>
    </Link>
  );
}
