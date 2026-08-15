import Link from "next/link";
import { APPLIANCE_ICONS, DEFAULT_APPLIANCE_ICON } from "./appliance-icons";
import type { ApplianceCard as ApplianceCardData } from "./data";

// Status indication is a left-edge border accent + mono status text, not a
// filled badge/circle/colored card background (docs/designs/design-system.md,
// "Component conventions").
const BORDER_CLASSES: Record<string, string> = {
  red: "border-l-danger",
  yellow: "border-l-warn",
  green: "border-l-pine",
  gray: "border-l-faint",
};

const TEXT_CLASSES: Record<string, string> = {
  red: "text-danger",
  yellow: "text-warn",
  green: "text-pine",
  gray: "text-faint",
};

export function ApplianceCard({ card, index }: { card: ApplianceCardData; index: number }) {
  const { rollup } = card;
  const Icon = APPLIANCE_ICONS[card.applianceTypeId] ?? DEFAULT_APPLIANCE_ICON;

  return (
    <Link
      href={`/dashboard/appliances/${card.applianceInstanceId}`}
      className={`flex flex-col gap-3 bg-canvas px-4 py-4 border-l-[3px] ${
        BORDER_CLASSES[rollup.color]
      } ${rollup.hasRing ? "ring-2 ring-inset ring-warn" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Icon size={18} className="text-muted" aria-hidden="true" />
      </div>
      <span className="font-display text-sm font-medium text-ink">
        {card.applianceDisplayName}
      </span>
      <span className={`font-mono text-xs uppercase tracking-wide ${TEXT_CLASSES[rollup.color]}`}>
        {rollup.cardCopy}
      </span>
    </Link>
  );
}
