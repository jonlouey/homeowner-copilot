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
      <p className="text-sm">
        You&apos;re set — {applianceCount} appliance{applianceCount === 1 ? "" : "s"} added to{" "}
        {address}.
      </p>
      <Link
        href="/dashboard"
        className="border rounded px-3 py-1.5 font-medium self-start"
      >
        View your dashboard
      </Link>
    </div>
  );
}
