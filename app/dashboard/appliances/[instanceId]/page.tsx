import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { APPLIANCE_ICONS, DEFAULT_APPLIANCE_ICON } from "@/app/dashboard/appliance-icons";
import { ICON_BADGE_CLASSES, StatusPill } from "@/app/dashboard/status-styles";
import { ActionsSection } from "./actions-section";
import { getApplianceDetail } from "./data";
import { HistorySection } from "./history-section";
import { SummarySection } from "./summary-section";

export default async function ApplianceDetailPage({
  params,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  const { instanceId } = await params;
  const detail = await getApplianceDetail(instanceId);

  if (!detail) {
    notFound();
  }

  const Icon = APPLIANCE_ICONS[detail.applianceTypeId] ?? DEFAULT_APPLIANCE_ICON;
  const { rollup } = detail;

  return (
    <main className="flex justify-center bg-paper px-6 pb-20 pt-12">
      <div className="flex w-full max-w-[860px] flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ink-muted transition hover:text-ink"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Back to dashboard
          </Link>

          <div className="flex items-center gap-3">
            <span
              className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] ${
                ICON_BADGE_CLASSES[rollup.color]
              }`}
            >
              <Icon size={19} aria-hidden="true" />
            </span>
            <h1 className="text-[28px] leading-[1.2] tracking-[-0.015em] font-bold text-navy-deep">
              {detail.applianceDisplayName}
            </h1>
            <StatusPill color={rollup.color}>{rollup.cardCopy}</StatusPill>
          </div>
        </div>

        <SummarySection detail={detail} />
        <ActionsSection detail={detail} />
        <HistorySection detail={detail} />
      </div>
    </main>
  );
}
