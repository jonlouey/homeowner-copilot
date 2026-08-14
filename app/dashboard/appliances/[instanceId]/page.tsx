import Link from "next/link";
import { notFound } from "next/navigation";
import { APPLIANCE_ICONS, DEFAULT_APPLIANCE_ICON } from "@/app/dashboard/appliance-icons";
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

  return (
    <main className="flex flex-col gap-8 p-8 max-w-2xl">
      <div className="flex flex-col gap-2">
        <Link href="/dashboard" className="text-xs text-gray-500">
          &larr; Back to dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
            <Icon size={18} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold">{detail.applianceDisplayName}</h1>
        </div>
      </div>

      <SummarySection detail={detail} />
      <ActionsSection detail={detail} />
      <HistorySection detail={detail} />
    </main>
  );
}
