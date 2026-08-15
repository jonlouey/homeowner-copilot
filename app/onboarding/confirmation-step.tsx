import Link from "next/link";

export function ConfirmationStep({
  address,
  applianceCount,
}: {
  address: string;
  applianceCount: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink">
        You&apos;re set — {applianceCount} appliance{applianceCount === 1 ? "" : "s"} added to{" "}
        {address}.
      </p>
      <Link
        href="/dashboard"
        className="self-start border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-hairline"
      >
        View your dashboard
      </Link>
    </div>
  );
}
