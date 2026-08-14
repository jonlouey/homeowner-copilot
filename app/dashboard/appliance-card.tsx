import Link from "next/link";
import { APPLIANCE_ICONS, DEFAULT_APPLIANCE_ICON } from "./appliance-icons";
import type { ApplianceCard as ApplianceCardData } from "./data";

const COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-50 border-red-300 text-red-800",
  yellow: "bg-yellow-50 border-yellow-300 text-yellow-800",
  green: "bg-green-50 border-green-300 text-green-800",
  gray: "bg-gray-50 border-gray-300 text-gray-500",
};

export function ApplianceCard({ card }: { card: ApplianceCardData }) {
  const { rollup } = card;
  const Icon = APPLIANCE_ICONS[card.applianceTypeId] ?? DEFAULT_APPLIANCE_ICON;

  return (
    <Link
      href={`/dashboard/appliances/${card.applianceInstanceId}`}
      className={`flex flex-col gap-3 rounded border px-3 py-3 ${COLOR_CLASSES[rollup.color]} ${
        rollup.hasRing ? "ring-2 ring-amber-400 ring-offset-1" : ""
      }`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
        <Icon size={18} aria-hidden="true" />
      </div>
      <span className="text-sm font-medium text-gray-900">{card.applianceDisplayName}</span>
      <span className="text-xs font-medium">{rollup.cardCopy}</span>
    </Link>
  );
}
