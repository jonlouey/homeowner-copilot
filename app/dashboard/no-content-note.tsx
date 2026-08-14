import type { NoContentApplianceType } from "./data";

export function NoContentNote({ items }: { items: NoContentApplianceType[] }) {
  const names = items.map((item) => item.applianceDisplayName).join(", ");

  return (
    <section className="text-xs text-gray-400 border-t pt-4">
      We don&apos;t have maintenance guidance for {items.length === 1 ? "this appliance" : "these appliances"} yet: {names}.
    </section>
  );
}
