export function ConfirmationStep({
  address,
  applianceCount,
}: {
  address: string;
  applianceCount: number;
}) {
  return (
    <p className="text-sm">
      You&apos;re set — {applianceCount} appliance{applianceCount === 1 ? "" : "s"} added to{" "}
      {address}.
    </p>
  );
}
